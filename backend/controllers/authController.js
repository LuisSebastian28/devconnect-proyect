import userService from '../services/userService.js';

const authController = (userService) => {
  return {
    async registerInvestor(req, res) {
      try {
        const { fullName, phone, userType } = req.body;
        
        // Validaciones básicas
        if (!fullName || !phone || !userType) {
          return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos: fullName, phone, userType'
          });
        }

        const result = await userService.createInvestor({
          fullName,
          phone,
          userType
        });

        res.status(201).json({
          success: true,
          message: 'Inversionista registrado exitosamente',
          user: result.user,
          wallet: result.wallet
        });

      } catch (error) {
        console.error('Error en registerInvestor:', error);
        res.status(500).json({
          success: false,
          message: error.message || 'Error interno del servidor'
        });
      }
    },

    async registerEntrepreneur(req, res) {
      try {
        const { fullName, phone, userType, company } = req.body;
        
        // Validaciones básicas
        if (!fullName || !phone || !userType || !company) {
          return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos: fullName, phone, userType, company'
          });
        }

        const result = await userService.createEntrepreneur({
          fullName,
          phone,
          userType,
          company
        });

        res.status(201).json({
          success: true,
          message: 'Emprendedor registrado exitosamente',
          user: result.user,
          wallet: result.wallet
        });

      } catch (error) {
        console.error('Error en registerEntrepreneur:', error);
        res.status(500).json({
          success: false,
          message: error.message || 'Error interno del servidor'
        });
      }
    },

    async login(req, res) {
      try {
        const { phone, userType } = req.body;
        
        if (!phone || !userType) {
          return res.status(400).json({
            success: false,
            message: 'Phone y userType son requeridos'
          });
        }

        const user = await userService.loginUser(phone, userType);
        
        res.json({
          success: true,
          message: 'Login exitoso',
          user
        });

      } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
          success: false,
          message: error.message || 'Error interno del servidor'
        });
      }
    }
  };
};

export default authController;