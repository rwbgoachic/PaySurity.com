import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL configuration - will be different for development vs production
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://paysurity.com/api' 
  : 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to handle auth tokens
api.interceptors.request.use(
  async (config) => {
    // Get the auth token from storage if available
    const token = await AsyncStorage.getItem('@auth_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh or logout on unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Could implement token refresh logic here
        // For now, just redirect to login by clearing token
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@auth_user');
        
        // The app will redirect to login based on auth state in useAuth hook
        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;