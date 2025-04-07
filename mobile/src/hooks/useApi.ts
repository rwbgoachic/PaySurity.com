import { useState, useCallback } from 'react';
import ApiService from '../services/api';

/**
 * Custom hook to handle API requests with loading and error states
 * This hook provides a consistent way to make API requests across the application
 */
interface UseApiReturnType {
  loading: boolean;
  error: string | null;
  get: <T>(endpoint: string, params?: Record<string, any>) => Promise<T | null>;
  post: <T>(endpoint: string, data?: any) => Promise<T | null>;
  put: <T>(endpoint: string, data?: any) => Promise<T | null>;
  delete: <T>(endpoint: string) => Promise<T | null>;
  uploadFile: <T>(
    endpoint: string,
    fileUri: string,
    formName?: string,
    mimeType?: string,
    extraData?: Record<string, string>
  ) => Promise<T | null>;
  clearError: () => void;
}

const useApi = (): UseApiReturnType => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear any existing error messages
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Generic request handler that wraps the ApiService methods
   */
  const handleRequest = useCallback(async <T>(
    requestFn: () => Promise<Response>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await requestFn();

      if (!response.ok) {
        let errorMessage = 'An error occurred';
        
        try {
          // Try to get a more specific error message from the API
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `Error: ${response.status} ${response.statusText}`;
        } catch (parseError) {
          errorMessage = `Error: ${response.status} ${response.statusText}`;
        }
        
        setError(errorMessage);
        setLoading(false);
        return null;
      }

      // Handle empty responses (like for DELETE operations)
      if (response.status === 204) {
        setLoading(false);
        return {} as T;
      }

      const data = await response.json();
      setLoading(false);
      return data as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  /**
   * GET request handler
   */
  const get = useCallback(<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T | null> => {
    return handleRequest<T>(() => ApiService.get(endpoint, params));
  }, [handleRequest]);

  /**
   * POST request handler
   */
  const post = useCallback(<T>(
    endpoint: string,
    data?: any
  ): Promise<T | null> => {
    return handleRequest<T>(() => ApiService.post(endpoint, data));
  }, [handleRequest]);

  /**
   * PUT request handler
   */
  const put = useCallback(<T>(
    endpoint: string,
    data?: any
  ): Promise<T | null> => {
    return handleRequest<T>(() => ApiService.put(endpoint, data));
  }, [handleRequest]);

  /**
   * DELETE request handler
   */
  const deleteRequest = useCallback(<T>(
    endpoint: string
  ): Promise<T | null> => {
    return handleRequest<T>(() => ApiService.delete(endpoint));
  }, [handleRequest]);

  /**
   * File upload handler
   */
  const uploadFile = useCallback(<T>(
    endpoint: string,
    fileUri: string,
    formName: string = 'file',
    mimeType: string = 'image/jpeg',
    extraData?: Record<string, string>
  ): Promise<T | null> => {
    return handleRequest<T>(() => ApiService.uploadFile(
      endpoint,
      fileUri,
      formName,
      mimeType,
      extraData
    ));
  }, [handleRequest]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: deleteRequest,
    uploadFile,
    clearError,
  };
};

export default useApi;