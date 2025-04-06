import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL
const API_URL = process.env.REACT_APP_API_URL || 'https://paysurity.com/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        
        if (response.data.token) {
          // Save new tokens
          await AsyncStorage.setItem('auth_token', response.data.token);
          if (response.data.refreshToken) {
            await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
          }
          
          // Update authorization header and retry the original request
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('refresh_token');
        // Handle navigation to login or notification to user
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication functions
export const authService = {
  // Login
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, refreshToken, user } = response.data;
    
    if (token) {
      await AsyncStorage.setItem('auth_token', token);
      if (refreshToken) {
        await AsyncStorage.setItem('refresh_token', refreshToken);
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    return user;
  },
  
  // Register
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    return true;
  },
  
  // Check if user is logged in
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  },
  
  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/user');
    return response.data;
  },
};