import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' // Development environment
  : 'https://api.paysurity.com/api'; // Production environment

/**
 * ApiService - Handles all API communication with the backend
 */
class ApiService {
  /**
   * Get the authentication token from storage
   */
  private static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Set the authentication token in storage
   */
  private static async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  /**
   * Set the refresh token in storage
   */
  private static async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('refresh_token', token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  }

  /**
   * Get the refresh token from storage
   */
  private static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refresh_token');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Build headers for the API request
   */
  private static async buildHeaders(includeAuth: boolean = true): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Platform': Platform.OS,
      'X-Client-Version': '1.0.0', // TODO: Get this from app config
    });

    if (includeAuth) {
      const token = await ApiService.getToken();
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  /**
   * Build the full URL for the API request
   */
  private static buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Ensure endpoint starts with /
    if (!endpoint.startsWith('/')) {
      endpoint = `/${endpoint}`;
    }
    
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Handle API response
   */
  private static async handleResponse(response: Response): Promise<Response> {
    if (response.status === 401) {
      // Try to refresh the token
      const refreshSuccessful = await ApiService.refreshToken();
      
      if (refreshSuccessful) {
        // Retry the request
        const retryRequest = new Request(response.url, {
          method: response.method,
          headers: await ApiService.buildHeaders(),
          body: response.bodyUsed ? undefined : await response.clone().text(),
          referrer: response.referrer,
          referrerPolicy: response.referrerPolicy,
          mode: response.mode,
          credentials: response.credentials,
          cache: response.cache,
          redirect: response.redirect,
          integrity: response.integrity,
        });
        
        return fetch(retryRequest);
      } else {
        // Clear tokens and redirect to login
        await ApiService.clearTokens();
        throw new Error('Authentication required');
      }
    }
    
    return response;
  }

  /**
   * Refresh the authentication token
   */
  private static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await ApiService.getRefreshToken();
      
      if (!refreshToken) {
        return false;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      await ApiService.setToken(data.token);
      await ApiService.setRefreshToken(data.refreshToken);
      
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  /**
   * Clear authentication tokens
   */
  private static async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Make a GET request to the API
   */
  public static async get(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<Response> {
    const url = ApiService.buildUrl(endpoint, params);
    const headers = await ApiService.buildHeaders();
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    return ApiService.handleResponse(response);
  }

  /**
   * Make a POST request to the API
   */
  public static async post(
    endpoint: string,
    data?: any
  ): Promise<Response> {
    const url = ApiService.buildUrl(endpoint);
    const headers = await ApiService.buildHeaders();
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return ApiService.handleResponse(response);
  }

  /**
   * Make a PUT request to the API
   */
  public static async put(
    endpoint: string,
    data?: any
  ): Promise<Response> {
    const url = ApiService.buildUrl(endpoint);
    const headers = await ApiService.buildHeaders();
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return ApiService.handleResponse(response);
  }

  /**
   * Make a DELETE request to the API
   */
  public static async delete(endpoint: string): Promise<Response> {
    const url = ApiService.buildUrl(endpoint);
    const headers = await ApiService.buildHeaders();
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    return ApiService.handleResponse(response);
  }

  /**
   * Upload a file to the API
   */
  public static async uploadFile(
    endpoint: string,
    fileUri: string,
    formName: string = 'file',
    mimeType: string = 'image/jpeg',
    extraData?: Record<string, string>
  ): Promise<Response> {
    const url = ApiService.buildUrl(endpoint);
    
    // For file uploads, we need to use a different content type
    const headers: HeadersInit = {};
    const token = await ApiService.getToken();
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Create a form data object
    const formData = new FormData();
    
    // Add the file to form data
    // @ts-ignore - React Native's FormData is slightly different from the web version
    formData.append(formName, {
      uri: fileUri,
      name: fileUri.split('/').pop() || 'file',
      type: mimeType,
    });
    
    // Add any extra data to form data
    if (extraData) {
      Object.keys(extraData).forEach(key => {
        formData.append(key, extraData[key]);
      });
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    return ApiService.handleResponse(response);
  }

  /**
   * Handle authentication after login
   */
  public static async handleAuth(authData: { token: string; refreshToken: string }): Promise<void> {
    await ApiService.setToken(authData.token);
    await ApiService.setRefreshToken(authData.refreshToken);
  }

  /**
   * Log out the user
   */
  public static async logout(): Promise<boolean> {
    try {
      // Call logout endpoint
      const response = await ApiService.post('/auth/logout');
      
      // Clear tokens regardless of response
      await ApiService.clearTokens();
      
      return response.ok;
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Still clear tokens on error
      await ApiService.clearTokens();
      
      return false;
    }
  }

  /**
   * Check if the user is authenticated
   */
  public static async isAuthenticated(): Promise<boolean> {
    const token = await ApiService.getToken();
    return !!token;
  }
}

export default ApiService;