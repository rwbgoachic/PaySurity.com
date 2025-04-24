import { QueryClient } from '@tanstack/react-query';
import { getCSRFToken } from "./csrf";

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export const apiRequest = async <T>(url: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { method = 'GET', headers = {}, body } = options;
  
  try {
    // Get CSRF token for non-GET requests
    let csrfToken = '';
    if (method !== 'GET') {
      csrfToken = await getCSRFToken();
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'CSRF-Token': csrfToken }),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`API request to ${url} failed:`, error);
    throw error;
  }
};