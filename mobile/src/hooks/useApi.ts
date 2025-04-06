import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// API base URL
const API_BASE_URL = 'https://api.paysurity.com'; // This would be environment specific

// Request method type
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Options for API calls
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean; // Whether the endpoint requires auth
  customApiUrl?: string; // For endpoints that don't use the default API base URL
}

// Hook for making API calls
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Helper function to get auth token
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error retrieving auth token', error);
      return null;
    }
  }, []);

  // Helper function to handle errors
  const handleError = useCallback((error: any) => {
    console.error('API Error:', error);
    setError(error instanceof Error ? error : new Error(String(error)));
    return error;
  }, []);

  // Generic request function
  const request = useCallback(async <T>(
    method: Method,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const {
      headers = {},
      params = {},
      body,
      requiresAuth = true,
      customApiUrl,
    } = options;

    try {
      setLoading(true);
      setError(null);

      // Build URL with query parameters
      const url = new URL(
        endpoint,
        customApiUrl || API_BASE_URL
      );

      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });

      // Prepare headers
      const requestHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...headers,
      };

      // Add auth token if required
      if (requiresAuth) {
        const token = await getAuthToken();
        if (token) {
          requestHeaders['Authorization'] = `Bearer ${token}`;
        } else if (requiresAuth) {
          throw new Error('Authentication required');
        }
      }

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      };

      // Make request
      const response = await fetch(url.toString(), requestOptions);

      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || `${response.status}: ${response.statusText}`;
        } catch {
          errorMessage = errorText || `${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      // Parse response
      if (response.status === 204) {
        return {} as T; // No content
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json() as T;
      }
      
      return await response.text() as unknown as T;
    } catch (error) {
      return handleError(error) as any;
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, handleError]);

  // Convenience methods for different HTTP methods
  const get = useCallback(<T>(endpoint: string, options?: RequestOptions) => {
    return request<T>('GET', endpoint, options);
  }, [request]);

  const post = useCallback(<T>(endpoint: string, body?: any, options?: RequestOptions) => {
    return request<T>('POST', endpoint, { ...options, body });
  }, [request]);

  const put = useCallback(<T>(endpoint: string, body?: any, options?: RequestOptions) => {
    return request<T>('PUT', endpoint, { ...options, body });
  }, [request]);

  const patch = useCallback(<T>(endpoint: string, body?: any, options?: RequestOptions) => {
    return request<T>('PATCH', endpoint, { ...options, body });
  }, [request]);

  const del = useCallback(<T>(endpoint: string, options?: RequestOptions) => {
    return request<T>('DELETE', endpoint, options);
  }, [request]);

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    patch,
    delete: del, // renamed to avoid conflict with JS keyword
  };
};

export default useApi;