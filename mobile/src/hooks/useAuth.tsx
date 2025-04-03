import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

// Define user type based on our existing schema
type User = {
  id: number;
  username: string;
  email: string;
  role: string;
};

// Auth Context type
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
};

// Registration data type
type RegisterData = {
  username: string;
  email: string;
  password: string;
};

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
type AuthProviderProps = {
  children: ReactNode;
};

// Auth Provider Component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing user session on app load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/api/login', { username, password });
      const userData = response.data;
      
      // Save user to state and storage
      setUser(userData);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/api/register', userData);
      const newUser = response.data;
      
      // Save user to state and storage
      setUser(newUser);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(newUser));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout API
      await api.post('/api/logout');
      
      // Clear user data
      setUser(null);
      await AsyncStorage.removeItem('@auth_user');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};