import api from './api';

export interface TransferRequest {
  fromPhone: string;
  toAddress: string;
  amount: number;
}

export interface TransferResponse {
  success: boolean;
  message: string;
  transaction: {
    hash: string;
    from: string;
    to: string;
    amount: number;
    status: string;
  };
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed' | 'unknown';
  blockNumber?: number;
  confirmations?: number;
  timestamp?: Date | null;
  error?: string;
}

export interface TransferHistoryItem {
  hash: string;
  from: string;
  to: string;
  amount: number;
  status: string;
  timestamp: Date;
  type: 'sent' | 'received';
}

export interface TransferHistoryResponse {
  success: boolean;
  transactions: TransferHistoryItem[];
}

export const transferService = {
  // Transferir ETH
  async transferETH(transferData: Omit<TransferRequest, 'fromPhone'>): Promise<TransferResponse> {
    try {
      // Obtener el número de teléfono del usuario autenticado
      const userPhone = this.getCurrentUserPhone();
      
      const requestData: TransferRequest = {
        fromPhone: userPhone,
        toAddress: transferData.toAddress,
        amount: transferData.amount
      };

      const response = await api.post('/transfer/eth', requestData);
      return response.data;
    } catch (error: any) {
      console.error('Error transferring ETH:', error);
      throw new Error(error.response?.data?.message || 'Error al realizar la transferencia');
    }
  },

  // Obtener estado de una transacción
  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    try {
      const response = await api.get(`/transfer/status/${txHash}`);
      return response.data.transaction;
    } catch (error: any) {
      console.error('Error getting transaction status:', error);
      return {
        hash: txHash,
        status: 'unknown',
        error: error.response?.data?.message || 'Error al obtener el estado'
      };
    }
  },

  // Obtener historial de transferencias
  async getTransferHistory(): Promise<TransferHistoryItem[]> {
    try {
      const userPhone = this.getCurrentUserPhone();
      const response = await api.get(`/transfer/history/${userPhone}`);
      return response.data.transactions;
    } catch (error: any) {
      console.error('Error getting transfer history:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener el historial');
    }
  },

  // Función auxiliar para obtener el teléfono del usuario actual
    getCurrentUserPhone(): string {
    // Esto depende de cómo tengas almacenado el usuario en el frontend
    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('Usuario no autenticado');
    }

    const user = JSON.parse(userData);
    if (!user.phone) {
      throw new Error('Número de teléfono no disponible');
    }

    return user.phone;
  },

  // Validar dirección Ethereum
  isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  // Formatear cantidad para mostrar
  formatAmount(amount: number, decimals: number = 6): string {
    return amount.toFixed(decimals);
  }
};

export default transferService;