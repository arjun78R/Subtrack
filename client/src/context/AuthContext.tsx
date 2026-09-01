import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    preferredCurrency?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('subtrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('subtrack_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('subtrack_token');
      if (storedToken) {
        try {
          const data = await authApi.getMe();
          setUser(data.user);
          localStorage.setItem('subtrack_user', JSON.stringify(data.user));
        } catch (error) {
          console.error('Session validation error:', error);
          localStorage.removeItem('subtrack_token');
          localStorage.removeItem('subtrack_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('subtrack_token', data.token);
    localStorage.setItem('subtrack_user', JSON.stringify(data.user));
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    preferredCurrency?: string;
  }) => {
    const result = await authApi.register(data);
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem('subtrack_token', result.token);
    localStorage.setItem('subtrack_user', JSON.stringify(result.user));
  };

  const logout = () => {
    localStorage.removeItem('subtrack_token');
    localStorage.removeItem('subtrack_user');
    setUser(null);
    setToken(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    const res = await authApi.updateProfile(userData);
    setUser(res.user);
    localStorage.setItem('subtrack_user', JSON.stringify(res.user));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
