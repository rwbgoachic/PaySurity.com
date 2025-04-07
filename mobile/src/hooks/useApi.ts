import { useState, useCallback } from 'react';
import { ApiService, ApiOptions, ApiError } from '../services/api';

/**
 * Hook for making API requests with loading and error state management
 */
export default function useApi() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const apiService = new ApiService();

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Generic request handler for API calls
   */
  const request = useCallback(
    async <T>(
      requestFn: () => Promise<T>,
      options?: ApiOptions,
      onSuccess?: (data: T) => void,
      onError?: (error: Error) => void
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response: T = await requestFn();
        
        if (onSuccess) {
          onSuccess(response);
        }
        
        return response;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        
        if (onError) {
          onError(apiError);
        }
        
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * GET request
   */
  const get = useCallback(
    <T>(
      endpoint: string,
      options?: ApiOptions,
      onSuccess?: (data: T) => void,
      onError?: (error: Error) => void
    ): Promise<T | null> => {
      return request<T>(
        () => apiService.get<T>(endpoint, options),
        options,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  /**
   * POST request
   */
  const post = useCallback(
    <T>(
      endpoint: string,
      data?: any,
      options?: ApiOptions,
      onSuccess?: (data: T) => void,
      onError?: (error: Error) => void
    ): Promise<T | null> => {
      return request<T>(
        () => apiService.post<T>(endpoint, data, options),
        options,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  /**
   * PUT request
   */
  const put = useCallback(
    <T>(
      endpoint: string,
      data: any,
      options?: ApiOptions,
      onSuccess?: (data: T) => void,
      onError?: (error: Error) => void
    ): Promise<T | null> => {
      return request<T>(
        () => apiService.put<T>(endpoint, data, options),
        options,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  /**
   * PATCH request
   */
  const patch = useCallback(
    <T>(
      endpoint: string,
      data: any,
      options?: ApiOptions,
      onSuccess?: (data: T) => void,
      onError?: (error: Error) => void
    ): Promise<T | null> => {
      return request<T>(
        () => apiService.patch<T>(endpoint, data, options),
        options,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  /**
   * DELETE request
   */
  const del = useCallback(
    <T>(
      endpoint: string,
      options?: ApiOptions,
      onSuccess?: (data: T) => void,
      onError?: (error: Error) => void
    ): Promise<T | null> => {
      return request<T>(
        () => apiService.del<T>(endpoint, options),
        options,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  /**
   * Upload file request
   */
  const uploadFile = useCallback(
    <T>(
      endpoint: string,
      file: any,
      fieldName: string,
      options?: ApiOptions,
      onSuccess?: (data: T) => void,
      onError?: (error: Error) => void
    ): Promise<T | null> => {
      return request<T>(
        () => apiService.uploadFile<T>(endpoint, file, fieldName, options),
        options,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  /**
   * Login user
   */
  const login = useCallback(
    async (username: string, password: string, onSuccess?: (data: any) => void, onError?: (error: Error) => void) => {
      return request(
        () => apiService.login(username, password),
        undefined,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  /**
   * Register user
   */
  const register = useCallback(
    async (userData: any, onSuccess?: (data: any) => void, onError?: (error: Error) => void) => {
      return request(
        () => apiService.register(userData),
        undefined,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  /**
   * Logout user
   */
  const logout = useCallback(
    async (onSuccess?: () => void, onError?: (error: Error) => void) => {
      return request(
        () => apiService.logout(),
        undefined,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    return apiService.isAuthenticated();
  }, [apiService]);

  /**
   * Process payment using Helcim
   */
  const processPayment = useCallback(
    async (paymentData: any, onSuccess?: (data: any) => void, onError?: (error: Error) => void) => {
      return request(
        () => apiService.processPayment(paymentData),
        undefined,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  /**
   * Create Helcim customer
   */
  const createHelcimCustomer = useCallback(
    async (customerData: any, onSuccess?: (data: any) => void, onError?: (error: Error) => void) => {
      return request(
        () => apiService.createHelcimCustomer(customerData),
        undefined,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  /**
   * Get Helcim customer details
   */
  const getHelcimCustomer = useCallback(
    async (customerId: string, onSuccess?: (data: any) => void, onError?: (error: Error) => void) => {
      return request(
        () => apiService.getHelcimCustomer(customerId),
        undefined,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  /**
   * Save card to Helcim Vault
   */
  const saveCardToHelcimVault = useCallback(
    async (cardData: any, customerId: string, onSuccess?: (data: any) => void, onError?: (error: Error) => void) => {
      return request(
        () => apiService.saveCardToHelcimVault(cardData, customerId),
        undefined,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  /**
   * Process ACH direct deposit
   */
  const processACHDirectDeposit = useCallback(
    async (achData: any, onSuccess?: (data: any) => void, onError?: (error: Error) => void) => {
      return request(
        () => apiService.processACHDirectDeposit(achData),
        undefined,
        onSuccess,
        onError
      );
    },
    [request, apiService]
  );

  return {
    isLoading,
    error,
    clearError,
    isAuthenticated,
    get,
    post,
    put,
    patch,
    del,
    uploadFile,
    login,
    register,
    logout,
    processPayment,
    createHelcimCustomer,
    getHelcimCustomer,
    saveCardToHelcimVault,
    processACHDirectDeposit,
  };
}