import { useState, useCallback } from 'react';
import api, { ApiOptions, ApiError } from '../services/api';

/**
 * Hook for making API requests with loading and error states
 */
export default function useApi() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generic request handler with loading and error states
   */
  const request = useCallback(async <T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    options?: ApiOptions
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      let result: T;
      
      switch (method) {
        case 'GET':
          result = await api.get<T>(endpoint, options);
          break;
        case 'POST':
          result = await api.post<T>(endpoint, data, options);
          break;
        case 'PUT':
          result = await api.put<T>(endpoint, data, options);
          break;
        case 'PATCH':
          result = await api.patch<T>(endpoint, data, options);
          break;
        case 'DELETE':
          result = await api.del<T>(endpoint, options);
          break;
        default:
          throw new Error(`Invalid method: ${method}`);
      }
      
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.data?.message || apiError.message || 'An error occurred';
      
      setError(errorMessage);
      console.error(`API Error (${endpoint}):`, errorMessage);
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * GET request
   */
  const get = useCallback(<T>(endpoint: string, options?: ApiOptions): Promise<T | null> => {
    return request<T>('GET', endpoint, undefined, options);
  }, [request]);

  /**
   * POST request
   */
  const post = useCallback(<T>(endpoint: string, data: any, options?: ApiOptions): Promise<T | null> => {
    return request<T>('POST', endpoint, data, options);
  }, [request]);

  /**
   * PUT request
   */
  const put = useCallback(<T>(endpoint: string, data: any, options?: ApiOptions): Promise<T | null> => {
    return request<T>('PUT', endpoint, data, options);
  }, [request]);

  /**
   * PATCH request
   */
  const patch = useCallback(<T>(endpoint: string, data: any, options?: ApiOptions): Promise<T | null> => {
    return request<T>('PATCH', endpoint, data, options);
  }, [request]);

  /**
   * DELETE request
   */
  const del = useCallback(<T>(endpoint: string, options?: ApiOptions): Promise<T | null> => {
    return request<T>('DELETE', endpoint, undefined, options);
  }, [request]);

  /**
   * Upload file request
   */
  const uploadFile = useCallback(async <T>(
    endpoint: string,
    file: { uri: string; name: string; type: string },
    fieldName: string = 'file',
    additionalData?: Record<string, any>,
    options?: ApiOptions
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await api.uploadFile<T>(endpoint, file, fieldName, additionalData, options);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.data?.message || apiError.message || 'Upload failed';
      
      setError(errorMessage);
      console.error(`Upload Error (${endpoint}):`, errorMessage);
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login request
   */
  const login = useCallback(async (
    username: string,
    password: string
  ): Promise<{ user: any } | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.login(username, password);
      return { user: response.user };
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.data?.message || apiError.message || 'Login failed';
      
      setError(errorMessage);
      console.error('Login Error:', errorMessage);
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register request
   */
  const register = useCallback(async (
    userData: {
      username: string;
      password: string;
      email: string;
      firstName: string;
      lastName: string;
      [key: string]: any;
    }
  ): Promise<{ user: any } | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.register(userData);
      return { user: response.user };
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.data?.message || apiError.message || 'Registration failed';
      
      setError(errorMessage);
      console.error('Registration Error:', errorMessage);
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout request
   */
  const logout = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.logout();
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.data?.message || apiError.message || 'Logout failed';
      
      setError(errorMessage);
      console.error('Logout Error:', errorMessage);
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear any previous errors
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);
  
  // Return the API methods and state
  return {
    isLoading,
    error,
    clearError,
    request,
    get,
    post,
    put,
    patch,
    del,
    uploadFile,
    login,
    register,
    logout,
  };
}