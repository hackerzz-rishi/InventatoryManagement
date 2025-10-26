import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  role_id: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          // Verify session is still valid
          await api.get('/auth/verify');
          setUser(JSON.parse(storedUser));
        } catch (error) {
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { user } = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await api.post('/auth/register', data);
      navigate('/login');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;