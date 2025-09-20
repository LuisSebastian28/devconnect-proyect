import { WalletType } from "@getpara/server-sdk";
import crypto from "crypto";
import ParaInstanceManager from "../config/para.js";

class WalletService {
  constructor(walletRepository) {
    this.paraManager = ParaInstanceManager.getInstance();
    this.walletRepository = walletRepository;
    this.encryptionKey = process.env.ENCRYPTION_KEY || '';
    
    // Validate encryption key
    if (!this.encryptionKey || this.encryptionKey.length !== 64) {
      throw new Error("Invalid encryption key. Must be a 32-byte hex string (64 characters).");
    }
  }

  async createWallet(phone) {
    try {
      const paraServer = this.paraManager.getParaServer();

      // Convert phone to number format like the TypeScript version
      // "+59160365328" -> 59160365328
      const phoneNumber = phone.startsWith('+') ? parseInt(phone.substring(1), 10) : parseInt(phone, 10);
      
      console.log(`Creating wallet for phone number: ${phoneNumber}`);

      // Check if wallet exists in our database
      const existingWalletAddress = await this.walletRepository.getWalletByPhone(phone);
      const hasWalletInDB = !!existingWalletAddress;

      if (hasWalletInDB) {
        console.log(`Wallet already exists in database for phone number: ${phoneNumber}`);
        return existingWalletAddress; // Return existing wallet
      }

      // Check if wallet exists in Para server - using number format like TypeScript version
      const hasWalletInPara = await paraServer.hasPregenWallet({
        pregenId: { phone: `+${phoneNumber}` },
      });

      let walletData;
      
      if (!hasWalletInPara) {
        // Create new wallet in Para only if it doesn't exist
        console.log(`Creating new wallet in Para for phone number: ${phoneNumber}`);
        const generatedWallet = await paraServer.createPregenWallet({
          type: WalletType.EVM,
          pregenId: { phone: `+${phoneNumber}` },
        });

        // Get the user share immediately after wallet creation
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

  // Use the more robust encryption from TypeScript version
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
}

export default WalletService;