import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

export type UserRole = 'ADMIN' | 'OPERATOR' | 'BRANCH_USER' | 'ACCOUNTS_USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId?: string;
  branchName?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, passwordInput: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('courier_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      const res: any = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        logout();
      }
    } catch (_err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, passwordInput: string) => {
    const res: any = await api.post('/auth/login', { email, password: passwordInput });
    if (res.success && res.data) {
      const { user: userData, token: newToken } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('courier_token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('courier_token');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
