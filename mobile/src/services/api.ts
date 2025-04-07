import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL
const API_BASE_URL = 'https://api.paysurity.com';

// Set to true for production; when false, mock data will be used in development
const USE_PROD_API = false;

// Token storage keys
const AUTH_TOKEN_KEY = 'paysurity_auth_token';
const REFRESH_TOKEN_KEY = 'paysurity_refresh_token';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiError extends Error {
  statusCode?: number;
  data?: any;
}

export interface ApiOptions {
  headers?: Record<string, string>;
  timeout?: number;
  mockResponse?: any; // For testing purposes
  mockDelay?: number; // For testing purposes
}

// Token management functions
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

export const clearToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

export const setRefreshToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving refresh token:', error);
  }
};

// Token refresh function
export const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    await setToken(data.accessToken);
    
    if (data.refreshToken) {
      await setRefreshToken(data.refreshToken);
    }
    
    return data.accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    await clearToken();
    return null;
  }
};

// Main API request function
export const apiRequest = async <T>(
  method: ApiMethod,
  endpoint: string,
  data?: any,
  options: ApiOptions = {}
): Promise<T> => {
  // For development, return mock data if available and not using production API
  if (!USE_PROD_API && typeof global !== "undefined" && !global.prod && typeof __DEV__ !== "undefined" && __DEV__ && options.mockResponse) {
    console.log('[DEV] Using mock data for:', endpoint);
    return new Promise((resolve) => {
      setTimeout(() => resolve(options.mockResponse), options.mockDelay || 300);
    });
  }
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  const token = await getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Request options
  const fetchOptions: RequestInit = {
    method,
    headers,
    body: data && method !== 'GET' ? JSON.stringify(data) : undefined,
  };
  
  // Set up timeout
  const timeoutDuration = options.timeout || 30000; // Default 30 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
  fetchOptions.signal = controller.signal as any;
  
  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    // Handle token expiration
    if (response.status === 401) {
      const newToken = await refreshAuthToken();
      
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers,
        });
        
        if (retryResponse.ok) {
          return await retryResponse.json();
        }
      }
      
      // If refresh failed or retry failed, throw error
      const error = new Error('Authentication failed') as ApiError;
      error.statusCode = 401;
      throw error;
    }
    
    // Handle other errors
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      
      const error = new Error(errorData.message || 'API request failed') as ApiError;
      error.statusCode = response.status;
      error.data = errorData;
      throw error;
    }
    
    // Return data for non-empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else if (response.status === 204) {
      return {} as T; // No content
    } else {
      try {
        return await response.json();
      } catch {
        return {} as T;
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeoutDuration}ms`) as ApiError;
      timeoutError.statusCode = 408;
      throw timeoutError;
    }
    
    throw error;
  }
};

// Convenience methods
export const get = <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
  return apiRequest<T>('GET', endpoint, undefined, options);
};

export const post = <T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<T> => {
  return apiRequest<T>('POST', endpoint, data, options);
};

export const put = <T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<T> => {
  return apiRequest<T>('PUT', endpoint, data, options);
};

export const patch = <T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<T> => {
  return apiRequest<T>('PATCH', endpoint, data, options);
};

export const del = <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
  return apiRequest<T>('DELETE', endpoint, undefined, options);
};

// Helper for file uploads
export const uploadFile = async <T>(
  endpoint: string,
  file: { uri: string; name: string; type: string },
  fieldName: string = 'file',
  additionalData?: Record<string, any>,
  options: ApiOptions = {}
): Promise<T> => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const formData = new FormData();
  formData.append(fieldName, {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);
  
  // Add any additional form fields
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  // Default headers (don't set Content-Type for multipart/form-data)
  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  const token = await getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const fetchOptions: RequestInit = {
    method: 'POST',
    headers,
    body: formData as any,
  };
  
  // Set up timeout
  const timeoutDuration = options.timeout || 60000; // Default 60 seconds for uploads
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
  fetchOptions.signal = controller.signal as any;
  
  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      
      const error = new Error(errorData.message || 'Upload failed') as ApiError;
      error.statusCode = response.status;
      error.data = errorData;
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Upload timeout after ${timeoutDuration}ms`) as ApiError;
      timeoutError.statusCode = 408;
      throw timeoutError;
    }
    
    throw error;
  }
};

// Authentication helpers
export const login = async (
  username: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string; user: any }> => {
  const response = await post<{ accessToken: string; refreshToken: string; user: any }>(
    '/api/auth/login',
    { username, password }
  );
  
  await setToken(response.accessToken);
  await setRefreshToken(response.refreshToken);
  
  return response;
};

export const register = async (
  userData: {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    [key: string]: any;
  }
): Promise<{ accessToken: string; refreshToken: string; user: any }> => {
  const response = await post<{ accessToken: string; refreshToken: string; user: any }>(
    '/api/auth/register',
    userData
  );
  
  await setToken(response.accessToken);
  await setRefreshToken(response.refreshToken);
  
  return response;
};

export const logout = async (): Promise<void> => {
  try {
    await post('/api/auth/logout', {});
  } finally {
    await clearToken();
  }
};

export default {
  get,
  post,
  put,
  patch,
  del,
  uploadFile,
  login,
  register,
  logout,
  getToken,
  setToken,
  clearToken,
};