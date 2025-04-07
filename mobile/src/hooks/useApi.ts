import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import ApiService from '../services/api';

// Define API response interface
export interface ApiResponse<T = any> {
  data: T;
  headers?: Headers;
}

// Custom hook for API calls with loading and error states
export const useApi = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Wrapper for GET requests
  const get = useCallback(async <T = any>(endpoint: string, params?: any): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.get(endpoint, params);
      const data = await response.json();
      
      return {
        data,
        headers: response.headers,
      };
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Wrapper for POST requests
  const post = useCallback(async <T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.post(endpoint, data);
      const responseData = await response.json();
      
      return {
        data: responseData,
        headers: response.headers,
      };
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Wrapper for PUT requests
  const put = useCallback(async <T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.put(endpoint, data);
      const responseData = await response.json();
      
      return {
        data: responseData,
        headers: response.headers,
      };
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Wrapper for DELETE requests
  const del = useCallback(async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.delete(endpoint);
      const data = await response.json();
      
      return {
        data,
        headers: response.headers,
      };
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload file method
  const uploadFile = useCallback(async <T = any>(
    endpoint: string, 
    fileUri: string, 
    formName: string = 'file',
    mimeType: string = 'image/jpeg',
    extraData?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.uploadFile(endpoint, fileUri, formName, mimeType, extraData);
      const data = await response.json();
      
      return {
        data,
        headers: response.headers,
      };
    } catch (err: any) {
      setError(err.message || 'An error occurred during file upload');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Set authentication token
  const setAuthToken = useCallback(async (token: string): Promise<void> => {
    try {
      await ApiService.setAuthToken(token);
    } catch (err: any) {
      setError(err.message || 'Failed to set authentication token');
      throw err;
    }
  }, []);

  // Clear authentication token
  const clearAuthToken = useCallback(async (): Promise<void> => {
    try {
      await ApiService.clearAuthToken();
    } catch (err: any) {
      setError(err.message || 'Failed to clear authentication token');
      throw err;
    }
  }, []);

  // Show API error as an alert
  const showError = useCallback((message: string = 'An error occurred') => {
    Alert.alert('Error', message);
  }, []);

  // Clear current error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    uploadFile,
    setAuthToken,
    clearAuthToken,
    showError,
    clearError,
  };
};

export default useApi;