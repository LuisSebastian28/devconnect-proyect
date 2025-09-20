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

export const authService = {
  
  registerInvestor: async (userData: Omit<RegisterData, 'company'>) => {
    const response = await api.post('/auth/register/investor', userData);
    return response.data;
  },

  registerEntrepreneur: async (userData: RegisterData) => {
    const response = await api.post('/auth/register/entrepreneur', userData);
    return response.data;
  },

  login: async (loginData: LoginData) => {
    const response = await api.post('/auth/login', loginData);
    return response.data;
  },
};