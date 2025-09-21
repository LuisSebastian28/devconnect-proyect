import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de paths para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'BD.json');

class WalletRepository {
  constructor() {
    this.initializeDB();
  }

  // Inicializar la base de datos JSON con estructura mejorada
  initializeDB() {
    if (!fs.existsSync(DB_PATH)) {
      const initialData = {
        users: {},
        wallets: {}, // Almacenar wallets separadamente por su ID real
        walletPhoneIndex: {}, // Índice para buscar wallets por teléfono
        lastUserId: 0
      };
      this.saveToDB(initialData);
      console.log('✅ Base de datos JSON inicializada con estructura mejorada');
    }
  }

  readDB() {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      
      if (!data.trim()) {
        const initialData = {
          users: {},
          wallets: {},
          walletPhoneIndex: {},
          lastUserId: 0
        };
        this.saveToDB(initialData);
        return initialData;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading database:', error);
      
      const initialData = {
        users: {},
        wallets: {},
        walletPhoneIndex: {},
        lastUserId: 0
      };
      this.saveToDB(initialData);
      return initialData;
    }
  }

  saveToDB(data) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving to database:', error);
      return false;
    }
  }

  // ========== MÉTODOS PARA WALLETS ==========

  async saveWallet(walletData) {
    const db = this.readDB();
    
    // Guardar wallet con su ID real (UUID de Para)
    db.wallets[walletData.id] = {
      ...walletData,
      created_at: walletData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Crear índice por teléfono
    db.walletPhoneIndex[walletData.user_phone] = walletData.id;
    
    this.saveToDB(db);
    return walletData;
  }

  async getWalletByPhone(phone) {
    const db = this.readDB();
    
    // Buscar el ID de wallet usando el índice
    const walletId = db.walletPhoneIndex[phone];
    if (!walletId) {
      return null;
    }
    
    // Obtener la wallet usando el ID real
    return db.wallets[walletId] || null;
  }

  async getWalletById(walletId) {
    const db = this.readDB();
    return db.wallets[walletId] || null;
  }

  async getAddressByPhoneNumber(phone) {
    const wallet = await this.getWalletByPhone(phone);
    return wallet?.blockchain_address || null;
  }

  async getUserShareByPhoneNumber(phone) {
    const wallet = await this.getWalletByPhone(phone);
    return wallet?.encrypterusershare || null;
  }

  async updateWalletBalance(phone, newBalance) {
    const db = this.readDB();
    const walletId = db.walletPhoneIndex[phone];
    
    if (!walletId || !db.wallets[walletId]) {
      return null;
    }
    
    db.wallets[walletId].balance_usd = newBalance;
    db.wallets[walletId].updated_at = new Date().toISOString();
    
    this.saveToDB(db);
    return db.wallets[walletId];
  }

  async getAllWallets() {
    const db = this.readDB();
    return Object.values(db.wallets);
  }

  // ========== MÉTODOS PARA USUARIOS ==========

  async saveUser(userData) {
    const db = this.readDB();
    
    db.lastUserId += 1;
    const userId = db.lastUserId;

    const user = {
      id: userId,
      fullName: userData.fullName,
      phone: userData.phone,
      userType: userData.userType,
      company: userData.company || null,
      status: userData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users[userData.phone] = user;
    this.saveToDB(db);
    return user;
  }

  async findUserByPhone(phone) {
    const db = this.readDB();
    return db.users[phone] || null;
  }

  async findUserById(id) {
    const db = this.readDB();
    
    // Buscar por ID en todos los usuarios
    for (const phone in db.users) {
      if (db.users[phone].id === id) {
        return db.users[phone];
      }
    }
    
    return null;
  }

  // ========== MÉTODOS COMBINADOS ==========

  async getUserWithWallet(phone) {
    const user = await this.findUserByPhone(phone);
    const wallet = await this.getWalletByPhone(phone);
    
    return { user, wallet };
  }

  // Método para migrar datos existentes al nuevo formato
  async migrateToNewFormat() {
    const db = this.readDB();
    
    // Si ya está en el nuevo formato, no hacer nada
    if (db.wallets && db.walletPhoneIndex) {
      console.log('Base de datos ya está en el nuevo formato');
      return;
    }
    
    console.log('Migrando a nuevo formato...');
    
    // Inicializar nuevas estructuras si no existen
    if (!db.wallets) db.wallets = {};
    if (!db.walletPhoneIndex) db.walletPhoneIndex = {};
    
    // Buscar wallets en la estructura antigua y migrarlas
    for (const phone in db.users) {
      const user = db.users[phone];
      
      // Si el usuario tiene wallet integrada en la estructura antigua
      if (user.wallet && user.wallet.blockchain_address) {
        // Crear un ID único para la wallet
        const walletId = `wallet-${user.id}`;
        
        // Migrar la wallet
        db.wallets[walletId] = {
          id: walletId,
          user_phone: phone,
          blockchain_address: user.wallet.blockchain_address,
          private_key_ref: user.wallet.private_key_ref,
          type_wallet: user.wallet.type_wallet,
          encrypterusershare: user.wallet.encrypterusershare,
          nonce: user.wallet.nonce || 0,
          balance_usd: user.wallet.balance_usd || 0,
          created_at: user.wallet.wallet_created_at || new Date().toISOString(),
          updated_at: user.wallet.wallet_updated_at || new Date().toISOString()
        };
        
        // Crear índice
        db.walletPhoneIndex[phone] = walletId;
        
        // Limpiar la wallet del usuario
        delete user.wallet;
      }
    }
    
    this.saveToDB(db);
    console.log('✅ Migración completada');
  }
}

export default WalletRepository;