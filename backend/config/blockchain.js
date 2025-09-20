import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

class BlockchainConnection {
    static instance;
    provider;
    wallet;
        
    constructor() {
        if (BlockchainConnection.instance) {
            return BlockchainConnection.instance;
        }
        
        this.provider = new ethers.JsonRpcProvider(
        process.env.RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/"
        );

        if (process.env.PRIVATE_KEY) {
            this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            console.log('✅ Wallet configurado con dirección:', this.wallet.address);
        } else {
            console.warn('⚠️ PRIVATE_KEY no encontrada. Usando provider sin wallet');
            this.wallet = null;
        }

        BlockchainConnection.instance = this;
    }

    static getInstance() {
        if (!BlockchainConnection.instance) {
        BlockchainConnection.instance = new BlockchainConnection();
        }
        return BlockchainConnection.instance;
    }

    getProvider() {
        return this.provider;
    }

    getWallet() {
        if (!this.wallet) {
           throw new Error('Wallet no configurado. Verifica PRIVATE_KEY en envConfig');
        }
        return this.wallet;
    }

}

export default BlockchainConnection;