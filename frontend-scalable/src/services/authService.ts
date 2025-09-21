import api from './api';

export interface RegisterData {
  fullName: string;
  phone: string;
  userType: 'investor' | 'entrepreneur';
  company?: string;
}

export interface LoginData {
  phone: string;
  userType: 'investor' | 'entrepreneur';
}

export interface WalletData {
  address: string;
  balance: number;
  created: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    fullName: string;
    phone: string;
    userType: 'investor' | 'entrepreneur';
    company?: string;
    createdAt: string;
  };
  wallet: WalletData;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    user: {
      id: number;
      fullName: string;
      phone: string;
      userType: 'investor' | 'entrepreneur';
      company?: string;
      createdAt: string;
    };
    wallet: WalletData;
  };
}


export const authService = {
  registerInvestor: async (userData: Omit<RegisterData, 'company'>): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/investor', userData);
    return response.data;
  },

  registerEntrepreneur: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/entrepreneur', userData);
    return response.data;
  },

  login: async (loginData: LoginData): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', loginData);
    return response.data;
  },
};