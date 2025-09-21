import { WalletType } from "@getpara/server-sdk";
import crypto from "crypto";
import ParaInstanceManager from "../config/para.js";
//import {USDT_CONTRACT_ADDRESSES, USDT_ABI} from "../config/token.js";  
import {ethers} from "ethers";
import dotenv from "dotenv";
dotenv.config();

const NETWORK_CONFIG = {
  SEPOLIA: {
    rpcUrl: process.env.SEPOLIA_RPC_URL,
    chainId: 11155111
  }
};

class WalletService {
  constructor(walletRepository) {
    this.paraManager = ParaInstanceManager.getInstance();
    this.walletRepository = walletRepository;
    this.encryptionKey = process.env.ENCRYPTION_KEY || '';
    
    if (!this.encryptionKey || this.encryptionKey.length !== 64) {
      throw new Error("Invalid encryption key. Must be a 32-byte hex string (64 characters).");
    }
  }

  async createWallet(phone) {
    try {
      const paraServer = this.paraManager.getParaServer();

      const phoneNumber = phone.startsWith('+') ? parseInt(phone.substring(1), 10) : parseInt(phone, 10);
      
      console.log(`Creating wallet for phone number: ${phoneNumber}`);

      const existingWalletAddress = await this.walletRepository.getWalletByPhone(phone);
      const hasWalletInDB = !!existingWalletAddress;

      if (hasWalletInDB) {
        console.log(`Wallet already exists in database for phone number: ${phoneNumber}`);
        return existingWalletAddress; 
      }

      const hasWalletInPara = await paraServer.hasPregenWallet({
        pregenId: { phone: `+${phoneNumber}` },
      });

      let walletData;
      
      if (!hasWalletInPara) {
        console.log(`Creating new wallet in Para for phone number: ${phoneNumber}`);
        const generatedWallet = await paraServer.createPregenWallet({
          type: WalletType.EVM,
          pregenId: { phone: `+${phoneNumber}` },
        });

        const userShare = paraServer.getUserShare() || "";
        
        if (!userShare) {
          throw new Error("Failed to get user share from Para Protocol after wallet creation");
        }

        console.log(`User share obtained from Para: ${userShare.substring(0, 20)}...`);
        
        const encryptedShare = this.encryptUserShare(userShare);

        walletData = {
          id: generatedWallet.id,
          user_phone: phone, // Store original phone format
          blockchain_address: generatedWallet.address || "",
          private_key_ref: JSON.stringify(encryptedShare),
          type_wallet: WalletType.EVM,
          encrypterusershare: JSON.stringify(encryptedShare),
          nonce: 0,
          balance_usd: 0,
          created_at: new Date(),
        };
      } else {
        console.log(`Wallet already exists in Para for ${phoneNumber}, retrieving existing wallet`);
        
        // For existing wallets, try to get the user share
        let userShare = paraServer.getUserShare() || "";
        
        // If user share is empty, try to re-initialize the Para connection
        if (!userShare) {
          console.log(`User share not available, attempting to re-initialize Para connection for ${phoneNumber}`);
          
          try {
            const generatedWallet = await paraServer.createPregenWallet({
              type: WalletType.EVM,
              pregenId: { phone: `+${phoneNumber}` },
            });
            
            userShare = paraServer.getUserShare() || "";
            console.log(`Re-initialized Para connection, user share length: ${userShare.length}`);
          } catch (createError) {
            console.log(`Failed to re-initialize Para connection: ${createError}`);
            userShare = "placeholder-user-share-for-existing-wallet";
          }
        }

        if (!userShare) {
          console.log(`Using placeholder user share for existing wallet ${phoneNumber}`);
          userShare = "placeholder-user-share-for-existing-wallet";
        }

        console.log(`User share obtained from existing Para wallet: ${userShare.substring(0, 20)}...`);
        
        const encryptedShare = this.encryptUserShare(userShare);
        
        // For existing wallets, use placeholder address pattern from TypeScript version
        const walletAddress = `0x${phoneNumber.toString().padStart(40, '0')}`;
        
        walletData = {
          id: `para-${phoneNumber}`,
          user_phone: phone, // Store original phone format
          blockchain_address: walletAddress,
          private_key_ref: JSON.stringify(encryptedShare),
          type_wallet: WalletType.EVM,
          encrypterusershare: JSON.stringify(encryptedShare),
          nonce: 0,
          balance_usd: 0,
          created_at: new Date(),
        };
      }

      // Save the wallet to our database
      await this.walletRepository.saveWallet(walletData);
      console.log(`✅ Wallet saved to database for phone number: ${phoneNumber}`);
      console.log(`✅ Wallet address: ${walletData.blockchain_address}`);
      console.log(`✅ User share encrypted and stored`);
      
      return walletData;
    } catch (error) {
      console.error("Error in createWallet:", error);
      throw error;
    }
  }

  async recoverWallet(phone) {
    const userShareEncrypted = await this.walletRepository.getUserShareByPhoneNumber(phone);
    if (!userShareEncrypted) {
      throw new Error("No wallet found for this phone number");
    }
    const userShare = this.decryptUserShare(userShareEncrypted);
    this.paraManager.setUserShare(userShare);
  }

  async getWalletAddress(phone) {
    try {
      // Get the user share from our database
      const userShareEncrypted = await this.walletRepository.getUserShareByPhoneNumber(phone);
      if (!userShareEncrypted) {
        return null;
      }

      // Decrypt and load the user share into Para
      const userShare = this.decryptUserShare(userShareEncrypted);
      this.paraManager.setUserShare(userShare);

      // Get the existing address from database
      const existingAddress = await this.walletRepository.getWalletByPhone(phone);
      
      if (existingAddress && existingAddress.blockchain_address) {
        return existingAddress.blockchain_address;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting wallet address for ${phone}:`, error);
      return null;
    }
  }

  encryptUserShare(userShare) {
    try {
      const algorithm = "aes-256-gcm";
      const key = Buffer.from(this.encryptionKey, "hex");
      
      // Validate key length
      if (key.length !== 32) {
        throw new Error(`Invalid key length: ${key.length} bytes. Expected 32 bytes for AES-256.`);
      }
      
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(algorithm, key, iv);
      cipher.setAAD(Buffer.from("wallet-share", "utf8"));

      let encrypted = cipher.update(userShare, "utf8", "hex");
      encrypted += cipher.final("hex");

      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
      };
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error(`Failed to encrypt user share: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  decryptUserShare(encryptedData) {
    try {
      const data = JSON.parse(encryptedData);
      const algorithm = "aes-256-gcm";
      const key = Buffer.from(this.encryptionKey, "hex");
      const iv = Buffer.from(data.iv, "hex");

      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.setAAD(Buffer.from("wallet-share", "utf8"));
      decipher.setAuthTag(Buffer.from(data.tag, "hex"));

      let decrypted = decipher.update(data.encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      console.error("Failed to decrypt user share:", error);
      throw new Error("Failed to decrypt user share");
    }
  }

  async getETHBalance(walletId) {
    try {
      console.log(`[getETHBalance] Getting ETH balance for wallet: ${walletId}`);
      
      let wallet;
      try {
        wallet = await this.walletRepository.getWalletById(walletId);
      } catch (error) {
        console.log(`[getETHBalance] getWalletById failed, trying getWalletByPhone`);
        wallet = await this.walletRepository.getWalletByPhone(walletId);
      }
      
      if (!wallet || !wallet.blockchain_address) {
        console.warn(`[getETHBalance] No wallet found or no blockchain address`);
        return 0;
      }

      const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.SEPOLIA.rpcUrl);
      const balance = await provider.getBalance(wallet.blockchain_address);
      const balanceInETH = Number(ethers.formatEther(balance));
      
      console.log(`[getETHBalance] ETH balance: ${balanceInETH} ETH`);
      return balanceInETH;
      
    } catch (error) {
      console.error('[getETHBalance] Error getting ETH balance:', error);
      
      try {
        return await this.getETHBalanceFallback(walletId);
      } catch (fallbackError) {
        console.error('[getETHBalance] Fallback method also failed:', fallbackError);
        return 0;
      }
    }
  }

  async getETHBalanceFallback(walletId) {
    try {
      console.log(`[getETHBalanceFallback] Using fallback method for: ${walletId}`);
      
      let wallet;
      try {
        wallet = await this.walletRepository.getWalletById(walletId);
      } catch (error) {
        wallet = await this.walletRepository.getWalletByPhone(walletId);
      }
      
      if (!wallet || !wallet.blockchain_address) {
        return 0;
      }

      const response = await fetch(NETWORK_CONFIG.SEPOLIA.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [wallet.blockchain_address, 'latest'],
          id: 1
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`RPC Error: ${result.error.message}`);
      }

      
      const balanceWei = BigInt(result.result || '0');
      const balanceInETH = Number(balanceWei) / Math.pow(10, 18);
      
      console.log(`[getETHBalanceFallback] Fallback ETH balance: ${balanceInETH} ETH`);
      return balanceInETH;
      
    } catch (error) {
      console.error('[getETHBalanceFallback] Error:', error);
      return 0;
    }
  }

  async transferETH(walletId, toAddress, amount) {
    try {
      const paraServer = this.paraManager.getParaServer();
      
      if (!toAddress || !ethers.isAddress(toAddress)) {
        throw new Error("Dirección de destino inválida");
      }

      if (amount <= 0) {
        throw new Error("El monto debe ser mayor a 0");
      }
      
      const amountInWei = ethers.parseEther(amount.toString());
      const result = await paraServer.transfer({
        walletId: walletId,
        to: toAddress, 
        amount: amountInWei.toString(), 
        chainId: NETWORK_CONFIG.SEPOLIA.chainId.toString(),
      });

      console.log(`✅ ${amount} ETH transferidos a ${toAddress}`);
      console.log(`📫 Hash de transacción: ${result.hash}`);

      return {
        success: true,
        hash: result.hash,
        amount: amount,
        to: toAddress,
        from: result.from,
        chainId: result.chainId
      };

    } catch (error) {
      console.error('Error transferring ETH:', error);
      throw new Error(`Failed to transfer ETH: ${error.message}`);
    }
  }

  async enrichWalletWithBalance(wallet) {
    try {
      console.log(`[enrichWalletWithBalance] Processing wallet for: ${wallet.user_phone}`);
      
      let ethBalance = 0;
      
      try {
        if (wallet.id) {
          ethBalance = await this.getETHBalance(wallet.id);
        } else {
          console.warn('[enrichWalletWithBalance] Wallet has no ID, cannot get balance');
        }
      } catch (balanceError) {
        console.warn(`[enrichWalletWithBalance] Balance fetch failed: ${balanceError.message}`);
      }
      
      
      const balanceDiff = Math.abs(ethBalance - (wallet.balance_eth || 0));
      if (balanceDiff > 0.0001) { 
        try {
          if (this.walletRepository.updateWalletBalance) {
            await this.walletRepository.updateWalletBalance(wallet.user_phone, ethBalance);
            console.log(`[enrichWalletWithBalance] Updated ETH balance in DB: ${ethBalance}`);
          }
        } catch (updateError) {
          console.warn(`[enrichWalletWithBalance] Failed to update DB: ${updateError.message}`);
        }
      }

      return { 
        ...wallet, 
        balance_eth: ethBalance, 
        balanceFormatted: `${ethBalance.toFixed(6)} ETH` 
      };
      
    } catch (error) {
      console.error('[enrichWalletWithBalance] Error:', error);
      return wallet;
    }
  }

  async getWalletDetails(phone) {
    try {
     
      const wallet = await this.walletRepository.getWalletByPhone(phone);
      if (!wallet) {
        console.warn(`[getWalletDetails] No wallet found for: ${phone}`);
        return null;
      }

      try {
        const enrichedWallet = await this.enrichWalletWithBalance(wallet);
        console.log(`[getWalletDetails] Enriched wallet with balance: ${enrichedWallet.balance_usd}`);
        return enrichedWallet;
      } catch (enrichError) {
        console.warn(`[getWalletDetails] Failed to enrich, returning basic wallet: ${enrichError.message}`);
        return wallet;
      }
      
    } catch (error) {
      console.error('[getWalletDetails] Error:', error);
      return null;
    }
  }

  async getWalletWithBalance(phone) {
    try {
      const walletDetails = await this.getWalletDetails(phone);
      
      if (!walletDetails) {
        console.warn(`[getWalletWithBalance] No wallet found for: ${phone}`);
        throw new Error('Wallet not found for this phone number');
      }

      return walletDetails;
      
    } catch (error) {
      console.error('[getWalletWithBalance] Error:', error);
      throw error;
    }
  }

  async getTransactionStatus(txHash) {
    try {
      const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.SEPOLIA.rpcUrl);
      const receipt = await provider.getTransactionReceipt(txHash);
      
      return {
        hash: txHash,
        status: receipt ? (receipt.status === 1 ? 'confirmed' : 'failed') : 'pending',
        blockNumber: receipt?.blockNumber,
        confirmations: receipt?.confirmations || 0,
        timestamp: receipt?.timestamp ? new Date(receipt.timestamp * 1000) : null
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return { hash: txHash, status: 'unknown', error: error.message };
    }
  }

  async getWalletTransactions(walletId) {
    try {
      const paraServer = this.paraManager.getParaServer();
      
      // Esto puede variar dependiendo de lo que ofrezca el SDK de Para
      // Consultar documentación para métodos específicos de historial
      console.log('Consultando transacciones para wallet:', walletId);
      
      // Placeholder - implementar según la API de Para
      return [];
      
    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      return [];
    }
  }

}

export default WalletService;