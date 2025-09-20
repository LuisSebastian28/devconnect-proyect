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

  // Inicializar la base de datos JSON con estructura simplificada
  initializeDB() {
    if (!fs.existsSync(DB_PATH)) {
      const initialData = {
        users: {}, // Solo una entrada por usuario, indexada por teléfono
        lastUserId: 0
      };
      this.saveToDB(initialData);
      console.log('✅ Base de datos JSON inicializada con estructura simplificada');
    }
  }

  readDB() {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      
      if (!data.trim()) {
        const initialData = {
          users: {},
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

  // ========== MÉTODOS PARA USUARIOS (CON WALLET INTEGRADA) ==========

  async saveUser(userData) {
    const db = this.readDB();
    
    db.lastUserId += 1;
    const userId = db.lastUserId;

    const user = {
      // Información del usuario
      id: userId,
      fullName: userData.fullName,
      phone: userData.phone,
      userType: userData.userType,
      company: userData.company || null,
      status: userData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Información de wallet (inicialmente vacía, se llena cuando se crea la wallet)
      wallet: {
        blockchain_address: null,
        private_key_ref: null,
        type_wallet: null,
        encrypterusershare: null,
        nonce: 0,
        balance_usd: 0,
        wallet_created_at: null,
        wallet_updated_at: null
      }
    };

    // Guardar usuario indexado solo por teléfono (más limpio)
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

  async updateUser(phone, updates) {
    const db = this.readDB();
    const user = db.users[phone];
    
    if (!user) {
      return null;
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    db.users[phone] = updatedUser;
    this.saveToDB(db);
    return updatedUser;
  }

  async deleteUser(phone) {
    const db = this.readDB();
    const user = db.users[phone];
    
    if (user) {
      delete db.users[phone];
      this.saveToDB(db);
    }
    
    return user;
  }

  async getAllUsers() {
    const db = this.readDB();
    return Object.values(db.users);
  }

  // ========== MÉTODOS PARA WALLETS (INTEGRADOS CON USUARIO) ==========

  async saveWallet(walletData) {
    const db = this.readDB();
    const user = db.users[walletData.user_phone];
    
    if (!user) {
      throw new Error('Usuario no encontrado para crear wallet');
    }

    // Actualizar la información de wallet dentro del usuario
    user.wallet = {
      blockchain_address: walletData.blockchain_address,
      private_key_ref: walletData.private_key_ref,
      type_wallet: walletData.type_wallet,
      encrypterusershare: walletData.encrypterusershare,
      nonce: walletData.nonce || 0,
      balance_usd: walletData.balance_usd || 0,
      wallet_created_at: new Date().toISOString(),
      wallet_updated_at: new Date().toISOString()
    };

    user.updatedAt = new Date().toISOString();
    
    db.users[walletData.user_phone] = user;
    this.saveToDB(db);
    
    // Retornar un objeto que simule la estructura anterior para compatibilidad
    return {
      id: walletData.id || `wallet-${user.id}`,
      user_phone: walletData.user_phone,
      blockchain_address: walletData.blockchain_address,
      private_key_ref: walletData.private_key_ref,
      type_wallet: walletData.type_wallet,
      encrypterusershare: walletData.encrypterusershare,
      nonce: walletData.nonce || 0,
      balance_usd: walletData.balance_usd || 0,
      created_at: user.wallet.wallet_created_at
    };
  }

  async getWalletByPhone(phone) {
    const user = await this.findUserByPhone(phone);
    
    if (!user || !user.wallet || !user.wallet.blockchain_address) {
      return null;
    }

    // Retornar formato compatible con el código existente
    return {
      id: `wallet-${user.id}`,
      user_phone: phone,
      blockchain_address: user.wallet.blockchain_address,
      private_key_ref: user.wallet.private_key_ref,
      type_wallet: user.wallet.type_wallet,
      encrypterusershare: user.wallet.encrypterusershare,
      nonce: user.wallet.nonce,
      balance_usd: user.wallet.balance_usd,
      created_at: user.wallet.wallet_created_at
    };
  }

  async getWalletById(id) {
    // Extraer el ID de usuario del ID de wallet
    const userId = parseInt(id.replace('wallet-', ''));
    const user = await this.findUserById(userId);
    
    if (!user || !user.wallet || !user.wallet.blockchain_address) {
      return null;
    }

    return {
      id: id,
      user_phone: user.phone,
      blockchain_address: user.wallet.blockchain_address,
      private_key_ref: user.wallet.private_key_ref,
      type_wallet: user.wallet.type_wallet,
      encrypterusershare: user.wallet.encrypterusershare,
      nonce: user.wallet.nonce,
      balance_usd: user.wallet.balance_usd,
      created_at: user.wallet.wallet_created_at
    };
  }

  async getAddressByPhoneNumber(phone) {
    const user = await this.findUserByPhone(phone);
    return user?.wallet?.blockchain_address || null;
  }

  async getUserShareByPhoneNumber(phone) {
    const user = await this.findUserByPhone(phone);
    return user?.wallet?.encrypterusershare || null;
  }

  async updateWallet(phone, updates) {
    const db = this.readDB();
    const user = db.users[phone];
    
    if (!user || !user.wallet) {
      return null;
    }

    // Actualizar información de wallet
    user.wallet = {
      ...user.wallet,
      ...updates,
      wallet_updated_at: new Date().toISOString()
    };

    user.updatedAt = new Date().toISOString();
    
    db.users[phone] = user;
    this.saveToDB(db);
    
    return this.getWalletByPhone(phone);
  }

  async updateWalletBalance(phone, newBalance) {
    return this.updateWallet(phone, {
      balance_usd: newBalance
    });
  }

  async incrementWalletNonce(phone) {
    const user = await this.findUserByPhone(phone);
    if (!user?.wallet) return null;

    const newNonce = (user.wallet.nonce || 0) + 1;
    return this.updateWallet(phone, {
      nonce: newNonce
    });
  }

  async deleteWallet(phone) {
    const db = this.readDB();
    const user = db.users[phone];
    
    if (user?.wallet) {
      // Limpiar información de wallet pero mantener el usuario
      user.wallet = {
        blockchain_address: null,
        private_key_ref: null,
        type_wallet: null,
        encrypterusershare: null,
        nonce: 0,
        balance_usd: 0,
        wallet_created_at: null,
        wallet_updated_at: null
      };
      
      user.updatedAt = new Date().toISOString();
      db.users[phone] = user;
      this.saveToDB(db);
      
      return true;
    }
    
    return false;
  }

  async getAllWallets() {
    const db = this.readDB();
    const wallets = [];
    
    for (const phone in db.users) {
      const user = db.users[phone];
      if (user.wallet && user.wallet.blockchain_address) {
        wallets.push({
          id: `wallet-${user.id}`,
          user_phone: phone,
          blockchain_address: user.wallet.blockchain_address,
          private_key_ref: user.wallet.private_key_ref,
          type_wallet: user.wallet.type_wallet,
          encrypterusershare: user.wallet.encrypterusershare,
          nonce: user.wallet.nonce,
          balance_usd: user.wallet.balance_usd,
          created_at: user.wallet.wallet_created_at
        });
      }
    }
    
    return wallets;
  }

  // ========== MÉTODOS COMBINADOS ==========

  async getUserWithWallet(phone) {
    const user = await this.findUserByPhone(phone);
    
    if (!user) {
      return { user: null, wallet: null };
    }
    
    const wallet = user.wallet.blockchain_address ? {
      id: `wallet-${user.id}`,
      user_phone: phone,
      blockchain_address: user.wallet.blockchain_address,
      private_key_ref: user.wallet.private_key_ref,
      type_wallet: user.wallet.type_wallet,
      encrypterusershare: user.wallet.encrypterusershare,
      nonce: user.wallet.nonce,
      balance_usd: user.wallet.balance_usd,
      created_at: user.wallet.wallet_created_at
    } : null;
    
    return { user, wallet };
  }

  // Método para ver la estructura completa (útil para debugging)
  async getUserComplete(phone) {
    const db = this.readDB();
    return db.users[phone] || null;
  }

  // Migrar datos existentes al nuevo formato (ejecutar una sola vez)
  async migrateToNewFormat() {
    const db = this.readDB();
    
    // Si ya está en el nuevo formato, no hacer nada
    if (!db.wallets) {
      console.log('Base de datos ya está en el nuevo formato');
      return;
    }
    
    console.log('Migrando a nuevo formato...');
    
    const newUsers = {};
    let maxId = 0;
    
    // Migrar usuarios existentes
    for (const key in db.users) {
      if (!isNaN(key)) { // Solo IDs numéricos
        const user = db.users[key];
        maxId = Math.max(maxId, user.id);
        
        // Buscar wallet correspondiente
        const wallet = db.wallets[user.phone];
        
        newUsers[user.phone] = {
          ...user,
          wallet: wallet ? {
            blockchain_address: wallet.blockchain_address,
            private_key_ref: wallet.private_key_ref,
            type_wallet: wallet.type_wallet,
            encrypterusershare: wallet.encrypterusershare,
            nonce: wallet.nonce || 0,
            balance_usd: wallet.balance_usd || 0,
            wallet_created_at: wallet.created_at,
            wallet_updated_at: wallet.updated_at
          } : {
            blockchain_address: null,
            private_key_ref: null,
            type_wallet: null,
            encrypterusershare: null,
            nonce: 0,
            balance_usd: 0,
            wallet_created_at: null,
            wallet_updated_at: null
          }
        };
      }
    }
    
    const newDB = {
      users: newUsers,
      lastUserId: maxId
    };
    
    this.saveToDB(newDB);
    console.log('✅ Migración completada');
  }
}

export default WalletRepository;