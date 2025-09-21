class UserService {
  constructor(walletRepository, walletService) {
    this.walletRepository = walletRepository;
    this.walletService = walletService;
  }

  async createInvestor(userData) {
    try {
      const normalizedPhone = this.validateAndNormalizePhone(userData.phone);
      
      const existingUser = await this.walletRepository.findUserByPhone(normalizedPhone);
      if (existingUser) {
        throw new Error('El usuario ya existe con este número de teléfono');
      }

      const user = await this.walletRepository.saveUser({
        fullName: userData.fullName,
        phone: normalizedPhone,
        userType: 'investor',
        company: null,
        status: 'active'
      });

      const wallet = await this.walletService.createWallet(normalizedPhone);
      
      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          userType: user.userType,
          createdAt: user.createdAt
        },
        wallet: {
          address: wallet.blockchain_address,
          balance: wallet.balance_eth,
          created: true
        }
      };

    } catch (error) {
      console.error('Error en createInvestor:', error);
      throw error;
    }
  }

  async createEntrepreneur(userData) {
    try {
      const normalizedPhone = this.validateAndNormalizePhone(userData.phone);
      
      const existingUser = await this.walletRepository.findUserByPhone(normalizedPhone);
      if (existingUser) {
        throw new Error('El usuario ya existe con este número de teléfono');
      }

      if (!userData.company || userData.company.trim().length < 2) {
        throw new Error('El nombre de la empresa es requerido y debe tener al menos 2 caracteres');
      }

      const user = await this.walletRepository.saveUser({
        fullName: userData.fullName,
        phone: normalizedPhone,
        userType: 'entrepreneur',
        company: userData.company.trim(),
        status: 'active'
      });

      const wallet = await this.walletService.createWallet(normalizedPhone);

      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          userType: user.userType,
          company: user.company,
          createdAt: user.createdAt
        },
        wallet: {
          address: wallet.blockchain_address,
          balance: wallet.balance_usd,
          created: true
        }
      };

    } catch (error) {
      console.error('Error in createEntrepreneur:', error);
      throw error;
    }
  }

  async loginUser(phone, userType) {
    try {
      const normalizedPhone = this.validateAndNormalizePhone(phone);
      const user = await this.walletRepository.findUserByPhone(normalizedPhone);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (user.userType !== userType) {
        throw new Error('Tipo de usuario incorrecto');
      }

      if (user.status !== 'active') {
        throw new Error('Usuario inactivo');
      }

      const wallet = await this.walletService.getWalletWithBalance(normalizedPhone);

      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          userType: user.userType,
          company: user.company,
          createdAt: user.createdAt
        },
        wallet: {
          address: wallet.blockchain_address,
          balance: wallet.balance_eth,
          created: true
        }
      };

    } catch (error) {
      console.error('Error en loginUser:', error);
      throw error;
    }
  }

  validateAndNormalizePhone(phone) {
    if (!phone || typeof phone !== 'string') {
      throw new Error('Número de teléfono inválido');
    }

    const cleaned = phone.replace(/[^\d+]/g, '');
    
    if (!cleaned.startsWith('+')) {
      throw new Error('El número de teléfono debe incluir código de país (ej: +59171234567)');
    }

    if (cleaned.length < 9 || cleaned.length > 16) {
      throw new Error('Número de teléfono inválido. Formato: +59171234567');
    }

    const digitsOnly = cleaned.substring(1);
    if (!/^\d+$/.test(digitsOnly)) {
      throw new Error('El número de teléfono sólo puede contener dígitos después del +');
    }

    return cleaned;
  }
}

export default UserService;