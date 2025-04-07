import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// API Service for handling all API requests
// This service encapsulates the logic for making HTTP requests to our backend
// It also handles authentication, error handling, and request/response formatting

// API URLs based on environment
const API_URL = {
  development: __DEV__ ? 'https://dev-api.paysurity.com' : 'https://api.paysurity.com',
  production: 'https://api.paysurity.com',
};

// Default headers for API requests
const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-App-Version': '1.0.0',
  'X-Platform': Platform.OS,
};

// Token storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Error handler for API requests
const handleResponse = async (response: Response): Promise<Response> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || response.statusText || 'An error occurred';
    
    // Handle 401 Unauthorized - Token expired or invalid
    if (response.status === 401) {
      // Try refresh token flow if available
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_URL.development}/auth/refresh`, {
            method: 'POST',
            headers: {
              ...defaultHeaders,
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, refreshData.token);
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshData.refreshToken);
            
            // Retry original request with new token
            const originalRequest = await fetch(response.url, {
              method: response.method || 'GET',
              headers: {
                ...defaultHeaders,
                'Authorization': `Bearer ${refreshData.token}`,
              },
              body: response.bodyUsed ? undefined : await response.clone().text(),
            });
            
            return handleResponse(originalRequest);
          } else {
            // Refresh failed, clear tokens and prompt user to log in again
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
            await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
            throw new Error('Your session has expired. Please log in again.');
          }
        } catch (refreshError: any) {
          throw new Error(refreshError.message || 'Authentication error. Please log in again.');
        }
      } else {
        throw new Error('You need to be logged in to access this feature.');
      }
    }
    
    // Custom error handling based on status codes
    switch (response.status) {
      case 400:
        throw new Error(`Bad request: ${errorMessage}`);
      case 403:
        throw new Error('You do not have permission to perform this action.');
      case 404:
        throw new Error('The requested resource was not found.');
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw new Error(errorMessage);
    }
  }
  
  return response;
};

// API Service class
class ApiService {
  // Make a GET request
  async get(endpoint: string, params?: any): Promise<Response> {
    try {
      // Build query string from params
      const queryParams = params ? new URLSearchParams(params).toString() : '';
      const url = `${API_URL.development}${endpoint}${queryParams ? `?${queryParams}` : ''}`;
      
      // Get authentication token if it exists
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      // Set headers with auth token if available
      const headers = {
        ...defaultHeaders,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };
      
      // Make the request
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
  
  // Make a POST request
  async post(endpoint: string, data?: any): Promise<Response> {
    try {
      const url = `${API_URL.development}${endpoint}`;
      
      // Get authentication token if it exists
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      // Set headers with auth token if available
      const headers = {
        ...defaultHeaders,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };
      
      // Make the request
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
  
  // Make a PUT request
  async put(endpoint: string, data?: any): Promise<Response> {
    try {
      const url = `${API_URL.development}${endpoint}`;
      
      // Get authentication token if it exists
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      // Set headers with auth token if available
      const headers = {
        ...defaultHeaders,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };
      
      // Make the request
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
  
  // Make a DELETE request
  async delete(endpoint: string): Promise<Response> {
    try {
      const url = `${API_URL.development}${endpoint}`;
      
      // Get authentication token if it exists
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      // Set headers with auth token if available
      const headers = {
        ...defaultHeaders,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };
      
      // Make the request
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
  
  // Upload a file
  async uploadFile(
    endpoint: string, 
    fileUri: string, 
    formName: string = 'file',
    mimeType: string = 'image/jpeg',
    extraData?: Record<string, string>
  ): Promise<Response> {
    try {
      const url = `${API_URL.development}${endpoint}`;
      
      // Get authentication token if it exists
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      // Create form data
      const formData = new FormData();
      
      // Add file to form data
      formData.append(formName, {
        uri: fileUri,
        type: mimeType,
        name: fileUri.split('/').pop() || 'file',
      } as any);
      
      // Add any extra form data fields
      if (extraData) {
        Object.entries(extraData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }
      
      // Set headers with auth token if available
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Make the request
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
  
  // Set authentication token
  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save auth token:', error);
      throw error;
    }
  }
  
  // Clear authentication token
  async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear auth token:', error);
      throw error;
    }
  }
  
  // Set refresh token
  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save refresh token:', error);
      throw error;
    }
  }
  
  // Get current auth token
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }
  
  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return token !== null;
  }
  
  // Handle Helcim API integration
  async processHelcimPayment(paymentData: any): Promise<Response> {
    try {
      const url = `${API_URL.development}/payments/helcim/process`;
      
      // Get authentication token if it exists
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      // Set headers with auth token if available
      const headers = {
        ...defaultHeaders,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };
      
      // Make the request
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentData),
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
}

// Export a singleton instance
export default new ApiService();