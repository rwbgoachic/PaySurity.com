import fetch from 'node-fetch';
import { HelcimIntegration } from '@shared/schema';

// Helcim API base URLs
const HELCIM_API_BASE_URL = 'https://api.helcim.com/v2';
const HELCIM_TEST_API_BASE_URL = 'https://api.helcim.dev/v2';

/**
 * Structured error response from the Helcim API
 */
export interface HelcimApiError {
  error: string;
  message: string;
  details?: string;
}

/**
 * Payment method types supported by Helcim
 */
export enum HelcimPaymentMethod {
  CREDIT_CARD = 'creditCard',
  BANK_ACCOUNT = 'bankAccount',
  CASH = 'cash',
  CHECK = 'check',
  DEBIT_CARD = 'debitCard',
}

/**
 * Card transaction types for Helcim API
 */
export enum HelcimTransactionType {
  PURCHASE = 'purchase',
  PRE_AUTHORIZATION = 'preAuth',
  CAPTURE = 'capture',
  REFUND = 'refund',
  VERIFICATION = 'verification',
}

/**
 * Request body for creating a payment with Helcim
 */
export interface HelcimPaymentRequest {
  amount: number; // Required: Transaction amount
  currency?: string; // Optional: 3-letter currency code (default: CAD or USD based on merchant account)
  paymentMethod: HelcimPaymentMethod; // Required: Payment method type
  transactionType: HelcimTransactionType; // Required: Transaction type
  terminalId?: string; // Optional: Terminal ID for card-present transactions
  cardToken?: string; // Optional: Token from previously stored card
  cardNumber?: string; // Optional: Card number (if not using token)
  cardExpiry?: string; // Optional: Card expiry in MM/YY format (if not using token)
  cardCvv?: string; // Optional: Card CVV (if not using token)
  cardHolderName?: string; // Optional: Cardholder name
  billingAddress?: { // Optional: Billing address details
    name?: string; 
    street1?: string;
    street2?: string;
    city?: string;
    province?: string;
    country?: string;
    postalCode?: string;
    phoneNumber?: string;
    email?: string;
  };
  customer?: { // Optional: Customer information
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  taxAmount?: number; // Optional: Tax amount included in transaction
  invoiceNumber?: string; // Optional: Invoice number for reference
  orderNumber?: string; // Optional: Order number for reference
  comments?: string; // Optional: Transaction comments/notes
  metadata?: Record<string, string>; // Optional: Custom metadata
}

/**
 * Response from Helcim API for a successful payment transaction
 */
export interface HelcimPaymentResponse {
  success: boolean;
  notice?: string;
  response: {
    transactionId: string;
    cardToken?: string;
    cardNumber?: string; // Masked card number
    cardType?: string;
    cardHolderName?: string;
    amount: number;
    currency: string;
    approvalCode?: string;
    cardFee?: number;
    avsResponse?: string;
    cvvResponse?: string;
    transactionDate: string;
    transactionTime: string;
    transactionType: string;
    responseCode?: string;
    responseMessage?: string;
    customerCode?: string;
  };
}

/**
 * Interface for customer creation/update request
 */
export interface HelcimCustomerRequest {
  customerCode?: string; // Optional: Customer ID for updates
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: {
    street1?: string;
    street2?: string;
    city?: string;
    province?: string;
    country?: string;
    postalCode?: string;
  };
  shippingAddress?: {
    name?: string;
    street1?: string;
    street2?: string;
    city?: string;
    province?: string;
    country?: string;
    postalCode?: string;
  };
  metadata?: Record<string, string>;
}

/**
 * Response from Helcim API for customer operations
 */
export interface HelcimCustomerResponse {
  success: boolean;
  notice?: string;
  response: {
    customerCode: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    address?: {
      street1?: string;
      street2?: string;
      city?: string;
      province?: string;
      country?: string;
      postalCode?: string;
    };
  };
}

/**
 * Interface for saved card tokens
 */
export interface HelcimCardTokenRequest {
  customerCode: string; // Required: Customer ID
  cardNumber: string; // Required: Card number
  cardExpiry: string; // Required: Card expiry in MM/YY format
  cardCvv?: string; // Optional: Card CVV
  cardHolderName?: string; // Optional: Cardholder name
  cardToken?: string; // Optional: For updates only
  cardNickname?: string; // Optional: User-friendly name for the card
}

/**
 * Response for card token operations
 */
export interface HelcimCardTokenResponse {
  success: boolean;
  notice?: string;
  response: {
    cardToken: string;
    cardNumber: string; // Masked card number
    cardType: string;
    cardHolderName?: string;
    cardExpiry?: string;
    cardNickname?: string;
    defaultCard: boolean;
  };
}

/**
 * Class for interacting with the Helcim API
 */
export class HelcimService {
  private readonly apiKey: string;
  private readonly accountId: string;
  private readonly baseUrl: string;
  private readonly terminalId: string | undefined;

  /**
   * Create a new Helcim service instance
   */
  constructor(integration: HelcimIntegration) {
    this.apiKey = integration.helcimApiKey;
    this.accountId = integration.helcimAccountId;
    this.terminalId = integration.helcimTerminalId || undefined;
    this.baseUrl = integration.testMode ? HELCIM_TEST_API_BASE_URL : HELCIM_API_BASE_URL;
  }

  /**
   * Make an authenticated request to the Helcim API
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${this.accountId}:${this.apiKey}`).toString('base64')}`,
      'Accept': 'application/json',
    };

    const options: any = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json() as Record<string, any>;

    if (!response.ok) {
      const errorMessage = 
        responseData && typeof responseData === 'object' 
          ? (responseData.error || responseData.message || response.statusText)
          : response.statusText;
      throw new Error(`Helcim API Error: ${errorMessage}`);
    }

    return responseData as T;
  }

  /**
   * Process a payment using the Helcim API
   */
  async processPayment(paymentRequest: HelcimPaymentRequest): Promise<HelcimPaymentResponse> {
    // If terminal ID is provided from instance, use it unless explicitly set in request
    if (this.terminalId && !paymentRequest.terminalId) {
      paymentRequest.terminalId = this.terminalId;
    }

    return this.makeRequest<HelcimPaymentResponse>('/payments', 'POST', paymentRequest);
  }

  /**
   * Create a customer in Helcim
   */
  async createCustomer(customerData: HelcimCustomerRequest): Promise<HelcimCustomerResponse> {
    return this.makeRequest<HelcimCustomerResponse>('/customers', 'POST', customerData);
  }

  /**
   * Update a customer in Helcim
   */
  async updateCustomer(
    customerCode: string,
    customerData: HelcimCustomerRequest
  ): Promise<HelcimCustomerResponse> {
    return this.makeRequest<HelcimCustomerResponse>(
      `/customers/${customerCode}`,
      'PUT',
      customerData
    );
  }

  /**
   * Get a customer from Helcim
   */
  async getCustomer(customerCode: string): Promise<HelcimCustomerResponse> {
    return this.makeRequest<HelcimCustomerResponse>(`/customers/${customerCode}`, 'GET');
  }

  /**
   * Save a card token for future transactions
   */
  async saveCardToken(tokenRequest: HelcimCardTokenRequest): Promise<HelcimCardTokenResponse> {
    return this.makeRequest<HelcimCardTokenResponse>('/tokens/cards', 'POST', tokenRequest);
  }

  /**
   * Capture a pre-authorized transaction
   */
  async captureTransaction(transactionId: string, amount?: number): Promise<HelcimPaymentResponse> {
    const data: any = { transactionId };
    
    if (amount) {
      data.amount = amount;
    }

    return this.makeRequest<HelcimPaymentResponse>('/payments/capture', 'POST', data);
  }

  /**
   * Process a refund
   */
  async processRefund(
    transactionId: string,
    amount: number,
    comments?: string
  ): Promise<HelcimPaymentResponse> {
    const data: any = {
      transactionId,
      amount,
      transactionType: HelcimTransactionType.REFUND,
    };

    if (comments) {
      data.comments = comments;
    }

    return this.makeRequest<HelcimPaymentResponse>('/payments', 'POST', data);
  }

  /**
   * Verify the API connection is working
   */
  async verifyConnection(): Promise<boolean> {
    try {
      // Make a simple request to verify our credentials work
      await this.makeRequest<any>('/account', 'GET');
      return true;
    } catch (error) {
      console.error('Helcim connection verification failed:', error);
      return false;
    }
  }
}

/**
 * Create a HelcimService instance from a Helcim integration record
 */
export function createHelcimService(integration: HelcimIntegration): HelcimService {
  return new HelcimService(integration);
}