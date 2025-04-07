import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API request options interface
 */
export interface ApiOptions {
  headers?: Record<string, string>;
  timeout?: number;
  useAuthToken?: boolean;
  isHelcimApi?: boolean;
}

/**
 * API error interface
 */
export interface ApiError extends Error {
  status?: number;
  data?: any;
}

/**
 * TokenPair interface for storing authentication tokens
 */
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * API Service class for making API requests
 */
export class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private apiUrl: string = 'https://api.paysurity.com';
  private helcimApiUrl: string = 'https://api.helcim.com/v2';
  private readonly TOKENS_STORAGE_KEY = '@paysurity:auth_tokens';
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds default timeout

  constructor() {
    this.loadTokens().catch(err => {
      console.error('Failed to load auth tokens:', err);
    });
  }

  /**
   * Load authentication tokens from AsyncStorage
   */
  private async loadTokens(): Promise<void> {
    try {
      const tokensString = await AsyncStorage.getItem(this.TOKENS_STORAGE_KEY);
      if (tokensString) {
        const tokens: TokenPair = JSON.parse(tokensString);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
      }
    } catch (error) {
      console.error('Error loading tokens from storage:', error);
      throw error;
    }
  }

  /**
   * Save authentication tokens to AsyncStorage
   */
  private async saveTokens(tokens: TokenPair): Promise<void> {
    try {
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      await AsyncStorage.setItem(this.TOKENS_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error saving tokens to storage:', error);
      throw error;
    }
  }

  /**
   * Clear authentication tokens from memory and storage
   */
  private async clearTokens(): Promise<void> {
    try {
      this.accessToken = null;
      this.refreshToken = null;
      await AsyncStorage.removeItem(this.TOKENS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing tokens from storage:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Create an error object from a failed response
   */
  private createError(response: Response, data?: any): ApiError {
    const error = new Error(data?.message || response.statusText || 'Network Error') as ApiError;
    error.status = response.status;
    error.data = data;
    return error;
  }

  /**
   * Build request URL based on endpoint and options
   */
  private buildUrl(endpoint: string, options?: ApiOptions): string {
    const baseUrl = options?.isHelcimApi ? this.helcimApiUrl : this.apiUrl;
    
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  /**
   * Prepare headers for API request
   */
  private async prepareHeaders(options?: ApiOptions): Promise<Headers> {
    const headers = new Headers(options?.headers || {});
    
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }
    
    // Add auth token if required
    if (options?.useAuthToken !== false && this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }
    
    // For Helcim API specific headers
    if (options?.isHelcimApi) {
      // Add specific Helcim API headers if needed
      // This would be configured based on Helcim API requirements
      // For example: headers.set('X-Helcim-API-Version', '1.0');
    }
    
    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Check for non-JSON responses first
    const contentType = response.headers.get('Content-Type');
    if (contentType && !contentType.includes('application/json')) {
      if (response.ok) {
        if (contentType.includes('text/')) {
          return await response.text() as unknown as T;
        } else {
          return await response.blob() as unknown as T;
        }
      } else {
        throw this.createError(response);
      }
    }
    
    // Handle JSON responses
    try {
      const data = await response.json();
      
      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && this.refreshToken && !response.url.includes('/auth/refresh-token')) {
          try {
            if (!this.isRefreshing) {
              // Start token refresh process
              const newToken = await this.refreshAccessToken();
              
              // Retry original request with new token
              const requestInit: RequestInit = {
                method: response.type,
                headers: this.headersToObject(response.headers),
                body: response.url.includes('GET') ? undefined : data
              };
              
              return this.retryRequestWithNewToken<T>(response, requestInit);
            } else {
              // Another refresh is already in progress, wait for it to complete
              return new Promise((resolve, reject) => {
                this.refreshSubscribers.push((token: string) => {
                  try {
                    const requestInit: RequestInit = {
                      method: response.type,
                      headers: { ...this.headersToObject(response.headers), Authorization: `Bearer ${token}` },
                      body: response.url.includes('GET') ? undefined : data
                    };
                    
                    resolve(this.retryRequestWithNewToken<T>(response, requestInit));
                  } catch (error) {
                    reject(error);
                  }
                });
              });
            }
          } catch (refreshError) {
            // If refresh fails, clear tokens and propagate authentication error
            await this.clearTokens();
            throw this.createError(response, data);
          }
        }
        
        throw this.createError(response, data);
      }
      
      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw this.createError(response, { message: 'Invalid JSON response' });
      }
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    this.isRefreshing = true;
    
    try {
      const response = await fetch(`${this.apiUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshToken}`
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      const tokens: TokenPair = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || this.refreshToken!
      };
      
      await this.saveTokens(tokens);
      
      // Notify subscribers that the token has been refreshed
      this.refreshSubscribers.forEach(callback => callback(tokens.accessToken));
      this.refreshSubscribers = [];
      
      return tokens.accessToken;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Retry request with new access token
   */
  private async retryRequestWithNewToken<T>(
    originalResponse: Response,
    requestInit: RequestInit
  ): Promise<T> {
    const response = await fetch(originalResponse.url, requestInit);
    return this.handleResponse<T>(response);
  }

  /**
   * Convert Headers object to plain object
   */
  private headersToObject(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Make an API request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options?: ApiOptions
  ): Promise<T> {
    // Set up request configuration
    const url = this.buildUrl(endpoint, options);
    const headers = await this.prepareHeaders(options);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, options?.timeout || this.REQUEST_TIMEOUT);
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && data !== undefined) {
      if (data instanceof FormData) {
        // If FormData, remove Content-Type to let browser set it with boundary
        headers.delete('Content-Type');
        requestOptions.body = data;
      } else {
        requestOptions.body = JSON.stringify(data);
      }
    }
    
    try {
      // Log the request (only in development)
      if (__DEV__) {
        console.log(`API ${method} Request:`, {
          url,
          method,
          headers: this.headersToObject(headers),
          body: requestOptions.body,
        });
      }
      
      // Make the request
      const response = await fetch(url, requestOptions);
      
      // Log the response (only in development)
      if (__DEV__) {
        console.log(`API ${method} Response:`, {
          status: response.status,
          statusText: response.statusText,
          headers: this.headersToObject(response.headers),
        });
      }
      
      // Process the response
      return await this.handleResponse<T>(response);
    } catch (error) {
      // Handle network errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${options?.timeout || this.REQUEST_TIMEOUT}ms`);
        }
        throw error;
      }
      throw new Error('Unknown error occurred during API request');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * GET request
   */
  public async get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * POST request
   */
  public async post<T>(endpoint: string, data?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * PUT request
   */
  public async put<T>(endpoint: string, data: any, options?: ApiOptions): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * PATCH request
   */
  public async patch<T>(endpoint: string, data: any, options?: ApiOptions): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  /**
   * DELETE request
   */
  public async del<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Upload file
   */
  public async uploadFile<T>(
    endpoint: string,
    file: any,
    fieldName: string,
    options?: ApiOptions
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Allow additional form fields
    if (options?.headers?.['X-Form-Data']) {
      try {
        const additionalFields = JSON.parse(options.headers['X-Form-Data']);
        Object.entries(additionalFields).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        
        // Delete custom header as it's now in formData
        const newOptions = { ...options };
        delete newOptions.headers?.['X-Form-Data'];
        
        return this.request<T>('POST', endpoint, formData, newOptions);
      } catch (error) {
        console.error('Error parsing X-Form-Data header:', error);
      }
    }
    
    return this.request<T>('POST', endpoint, formData, options);
  }

  /**
   * Login user
   */
  public async login(
    username: string,
    password: string
  ): Promise<any> {
    const response = await this.post<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      { username, password }
    );
    
    await this.saveTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken
    });
    
    return response;
  }

  /**
   * Register user
   */
  public async register(
    userData: any
  ): Promise<any> {
    const response = await this.post<{ accessToken: string; refreshToken: string }>(
      '/auth/register',
      userData
    );
    
    await this.saveTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken
    });
    
    return response;
  }

  /**
   * Logout user
   */
  public async logout(): Promise<void> {
    try {
      // Only attempt to call logout endpoint if user is authenticated
      if (this.isAuthenticated()) {
        await this.post('/auth/logout', { refreshToken: this.refreshToken });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with clearing tokens even if API call fails
    } finally {
      // Always clear tokens from local storage
      await this.clearTokens();
    }
  }

  /**
   * Process payment using Helcim API
   */
  public async processPayment(paymentData: any): Promise<any> {
    const options: ApiOptions = {
      isHelcimApi: true,
      headers: {
        'X-Helcim-API-Key': paymentData.apiKey || process.env.HELCIM_API_KEY,
      }
    };
    
    // Remove API key from payment data if it exists
    const { apiKey, ...sanitizedPaymentData } = paymentData;
    
    return this.post('/payments/process', sanitizedPaymentData, options);
  }

  /**
   * Create Helcim customer
   */
  public async createHelcimCustomer(customerData: any): Promise<any> {
    const options: ApiOptions = {
      isHelcimApi: true,
      headers: {
        'X-Helcim-API-Key': customerData.apiKey || process.env.HELCIM_API_KEY,
      }
    };
    
    // Remove API key from customer data if it exists
    const { apiKey, ...sanitizedCustomerData } = customerData;
    
    return this.post('/customers', sanitizedCustomerData, options);
  }

  /**
   * Get Helcim customer details
   */
  public async getHelcimCustomer(customerId: string): Promise<any> {
    const options: ApiOptions = {
      isHelcimApi: true,
      headers: {
        'X-Helcim-API-Key': process.env.HELCIM_API_KEY,
      }
    };
    
    return this.get(`/customers/${customerId}`, options);
  }

  /**
   * Save card to Helcim Vault
   */
  public async saveCardToHelcimVault(cardData: any, customerId: string): Promise<any> {
    const options: ApiOptions = {
      isHelcimApi: true,
      headers: {
        'X-Helcim-API-Key': cardData.apiKey || process.env.HELCIM_API_KEY,
      }
    };
    
    // Remove API key from card data if it exists
    const { apiKey, ...sanitizedCardData } = cardData;
    
    return this.post(`/customers/${customerId}/payment-methods`, sanitizedCardData, options);
  }

  /**
   * Process ACH direct deposit
   */
  public async processACHDirectDeposit(achData: any): Promise<any> {
    // ACH direct deposits are handled through a different endpoint
    const options: ApiOptions = {
      isHelcimApi: true,
      headers: {
        'X-Helcim-API-Key': achData.apiKey || process.env.HELCIM_API_KEY,
      }
    };
    
    // Remove API key from ACH data if it exists
    const { apiKey, ...sanitizedAchData } = achData;
    
    return this.post('/ach/direct-deposit', sanitizedAchData, options);
  }
}