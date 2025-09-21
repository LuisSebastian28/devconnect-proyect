import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  fullName: string;
  phone: string;
  userType: 'investor' | 'entrepreneur';
  company?: string;
  createdAt: string;
}

export interface WalletData {
  address: string;
  balance: number;
  created: boolean;
}

interface AuthContextType {
  user: User | null;
  wallet: WalletData | null;
  login: (phone: string, userType: 'investor' | 'entrepreneur') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Loading saved data...');
    const savedUser = localStorage.getItem('user');
    const savedWallet = localStorage.getItem('wallet');
    
    console.log('Saved user:', savedUser);
    console.log('Saved wallet:', savedWallet);
    
    if (savedUser && savedWallet) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const parsedWallet = JSON.parse(savedWallet);
        setUser(parsedUser);
        setWallet(parsedWallet);
        console.log('Restored user:', parsedUser);
        console.log('Restored wallet:', parsedWallet);
      } catch (error) {
        console.error('Error parsing saved auth data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('wallet');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, userType: 'investor' | 'entrepreneur') => {
    console.log('AuthContext.login called with:', { phone, userType });
    
    try {
      setIsLoading(true);
      
      const { authService } = await import('../services/authService');
      console.log('Calling authService.login...');
      
      const response = await authService.login({ phone, userType });
      console.log('authService response:', response);
      
      if (!response.success || !response.user) {
        throw new Error('Invalid response from server');
      }

      // ✅ Now response.user should contain { user: {...}, wallet: {...} }
      const userData = response.user.user;
      const walletData = response.user.wallet;
      
      console.log('Setting user:', userData);
      console.log('Setting wallet:', walletData);
      
      setUser(userData);
      setWallet(walletData);
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('wallet', JSON.stringify(walletData));
      
      console.log('Login successful!');
      
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      setUser(null);
      setWallet(null);
      localStorage.removeItem('user');
      localStorage.removeItem('wallet');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    setUser(null);
    setWallet(null);
    localStorage.removeItem('user');
    localStorage.removeItem('wallet');
  };

  // Debug state changes
  useEffect(() => {
    console.log('AuthContext state changed:', { 
      user: user ? `${user.fullName} (${user.userType})` : null, 
      wallet: wallet ? `${wallet.address} - $${wallet.balance}` : null,
      isLoading 
    });
  }, [user, wallet, isLoading]);

  return (
    <AuthContext.Provider value={{ user, wallet, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};