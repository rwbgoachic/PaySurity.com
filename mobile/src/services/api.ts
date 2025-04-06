import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useQuery as useReactQuery } from '@tanstack/react-query';

// Base URL configuration
const API_URL = Platform.OS === 'web' 
  ? '/api' // For web, use relative URL
  : 'https://api.paysurity.com'; // For mobile, use absolute URL

// Axios instance with default configuration
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
instance.interceptors.response.use(
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
        if (refreshToken) {
          const response = await instance.post('/auth/refresh', { 
            refreshToken 
          });
          
          const { token, refreshToken: newRefreshToken } = response.data;
          await AsyncStorage.setItem('auth_token', token);
          await AsyncStorage.setItem('refresh_token', newRefreshToken);
          
          // Retry original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, log out user
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user_data');
        // Redirect to login if on web
        if (Platform.OS === 'web') {
          window.location.href = '/auth';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API interface options
export interface ApiOptions {
  withCredentials?: boolean;
  headers?: Record<string, string>;
  onUploadProgress?: (progressEvent: any) => void;
}

// API class with methods for making requests
class Api {
  // GET request
  async get<T = any>(
    endpoint: string,
    params?: any,
    options?: ApiOptions
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      params,
      ...options,
    };
    
    const response: AxiosResponse<T> = await instance.get(endpoint, config);
    return response.data;
  }
  
  // POST request
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiOptions
  ): Promise<T> {
    const response: AxiosResponse<T> = await instance.post(endpoint, data, options);
    return response.data;
  }
  
  // PUT request
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiOptions
  ): Promise<T> {
    const response: AxiosResponse<T> = await instance.put(endpoint, data, options);
    return response.data;
  }
  
  // PATCH request
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiOptions
  ): Promise<T> {
    const response: AxiosResponse<T> = await instance.patch(endpoint, data, options);
    return response.data;
  }
  
  // DELETE request
  async delete<T = any>(
    endpoint: string,
    params?: any,
    options?: ApiOptions
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      params,
      ...options,
    };
    
    const response: AxiosResponse<T> = await instance.delete(endpoint, config);
    return response.data;
  }
  
  // Login method
  async login(username: string, password: string): Promise<any> {
    try {
      const response = await this.post<{ token: string; refreshToken: string; user: any }>(
        '/auth/login',
        { username, password }
      );
      
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('refresh_token', response.refreshToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
      
      return response.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  // Logout method
  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user_data');
    }
  }
  
  // Hook for React Query integration
  useQuery<T = any>(
    endpoint: string,
    params?: any,
    options?: ApiOptions
  ) {
    return useReactQuery<T>({
      queryKey: [endpoint, params],
      queryFn: () => this.get<T>(endpoint, params, options),
    });
  }
}

// Export a singleton instance
const api = new Api();
export default api;