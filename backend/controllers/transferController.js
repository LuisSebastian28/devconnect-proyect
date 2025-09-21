import WalletService from '../services/walletService.js';
import WalletRepository from '../repository/walletRepository.js';

const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository);

export const transferController = {
  async transferUSDT(req, res) {
    try {
      const { fromPhone, toAddress, amount } = req.body;
      
      // Validaciones básicas
      if (!fromPhone || !toAddress || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos: fromPhone, toAddress, amount'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto debe ser mayor a 0'
        });
      }

      // Obtener wallet del remitente
      const wallet = await walletRepository.getWalletByPhone(fromPhone);
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet no encontrada para el número proporcionado'
        });
      }

      // Realizar transferencia
      const result = await walletService.transferUSDT(wallet.id, toAddress, amount);

      res.json({
        success: true,
        message: 'Transferencia de USDT exitosa',
        transaction: {
          hash: result.hash,
          from: result.from,
          to: result.to,
          amount: result.amount,
          status: 'pending'
        }
      });

    } catch (error) {
      console.error('Error en transferUSDT:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error en la transferencia'
      });
    }
  },

  async transferETH(req, res) {
    try {
      const { fromPhone, toAddress, amount } = req.body;
      
      // Validaciones básicas
      if (!fromPhone || !toAddress || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos: fromPhone, toAddress, amount'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto debe ser mayor a 0'
        });
      }

      // Obtener wallet del remitente
      const wallet = await walletRepository.getWalletByPhone(fromPhone);
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet no encontrada para el número proporcionado'
        });
      }

      // Realizar transferencia
      const result = await walletService.transferETH(wallet.id, toAddress, amount);

      res.json({
        success: true,
        message: 'Transferencia de ETH exitosa',
        transaction: {
          hash: result.hash,
          from: result.from,
          to: result.to,
          amount: result.amount,
          status: 'pending'
        }
      });

    } catch (error) {
      console.error('Error en transferETH:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error en la transferencia'
      });
    }
  },

  async getTransactionStatus(req, res) {
    try {
      const { txHash } = req.params;
      
      if (!txHash || !txHash.startsWith('0x')) {
        return res.status(400).json({
          success: false,
          message: 'Hash de transacción inválido'
        });
      }

      const status = await walletService.getTransactionStatus(txHash);
      
      res.json({
        success: true,
        transaction: status
      });

    } catch (error) {
      console.error('Error getting transaction status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  async getTransferHistory(req, res) {
    try {
      const { phone } = req.params;
      
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Número de teléfono requerido'
        });
      }

      // Obtener wallet del usuario
      const wallet = await walletRepository.getWalletByPhone(phone);
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet no encontrada'
        });
      }

      // Obtener historial de transacciones
      const transactions = await walletService.getWalletTransactions(wallet.id);
      
      res.json({
        success: true,
        transactions: transactions
      });

    } catch (error) {
      console.error('Error getting transfer history:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }
};

export default transferController;