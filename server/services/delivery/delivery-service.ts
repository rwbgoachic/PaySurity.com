/**
 * Delivery Service Coordinator
 * 
 * This service coordinates all delivery providers and serves as the entry point
 * for the rest of the application to interact with delivery functionality.
 */

import {
  DeliveryProviderAdapter,
  Address,
  OrderDetails,
  DeliveryQuote,
  DeliveryOrderDetails,
  DeliveryStatus,
  ExternalDeliveryOrder
} from './interfaces';
import { InternalDeliveryAdapter } from './providers/internal-adapter';
import { DoorDashAdapter, DoorDashConfig } from './providers/doordash-adapter';

export class DeliveryService {
  private providers: Map<number, DeliveryProviderAdapter> = new Map();
  private initialized = false;
  
  /**
   * Initialize the delivery service with all available providers
   */
  initialize(doordashConfig?: DoorDashConfig): void {
    // Clear any existing providers
    this.providers.clear();
    
    // Always register the internal provider as provider ID 1
    const internalProvider = new InternalDeliveryAdapter();
    this.providers.set(1, internalProvider);
    
    // Register DoorDash as provider ID 2 if config is provided
    if (doordashConfig) {
      const doordashProvider = new DoorDashAdapter(doordashConfig);
      this.providers.set(2, doordashProvider);
    }
    
    this.initialized = true;
    console.log(`Delivery service initialized with ${this.providers.size} providers`);
  }
  
  /**
   * Get a list of all registered providers
   */
  listProviders(): { id: number; name: string; type: 'internal' | 'external' }[] {
    this.ensureInitialized();
    
    const result = [];
    // Convert to array to avoid TypeScript iterator issues
    const entries = Array.from(this.providers.entries());
    for (const [id, provider] of entries) {
      result.push({
        id,
        name: provider.getName(),
        type: provider.getProviderType()
      });
    }
    
    return result;
  }
  
  /**
   * Get a specific provider by ID
   */
  getProvider(providerId: number): DeliveryProviderAdapter | undefined {
    this.ensureInitialized();
    return this.providers.get(providerId);
  }
  
  /**
   * Get delivery quotes from all available providers
   */
  async getDeliveryQuotes(
    pickup: Address,
    delivery: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote[]> {
    this.ensureInitialized();
    
    const quotePromises: Promise<DeliveryQuote>[] = [];
    
    // Request quotes from all providers - convert to array to avoid TypeScript iterator issues
    const entries = Array.from(this.providers.entries());
    for (const [providerId, provider] of entries) {
      const quotePromise = provider.getQuote(pickup, delivery, orderDetails)
        .then((quote: DeliveryQuote) => {
          // Set the provider ID for the quote
          quote.providerId = providerId;
          return quote;
        })
        .catch((error: unknown) => {
          console.error(`Error getting quote from provider ${providerId} (${provider.getName()}):`, error);
          
          // Return an invalid quote with the error
          const now = new Date();
          return {
            providerId,
            providerName: provider.getName(),
            fee: 0,
            customerFee: 0,
            platformFee: 0,
            currency: 'USD',
            estimatedPickupTime: new Date(now.getTime() + 15 * 60 * 1000),
            estimatedDeliveryTime: new Date(now.getTime() + 45 * 60 * 1000),
            distance: 0,
            distanceUnit: 'miles',
            valid: false,
            validUntil: now,
            errors: [(error as Error).message || 'Unknown error getting quote']
          };
        });
      
      quotePromises.push(quotePromise);
    }
    
    // Wait for all quotes to complete
    const quotes = await Promise.all(quotePromises);
    
    // Sort quotes by fee (cheapest first)
    return quotes.sort((a, b) => a.fee - b.fee);
  }
  
  /**
   * Create a delivery with the specified provider
   */
  async createDelivery(orderDetails: DeliveryOrderDetails): Promise<ExternalDeliveryOrder> {
    this.ensureInitialized();
    
    const provider = this.providers.get(orderDetails.providerId);
    if (!provider) {
      throw new Error(`Provider not found with ID ${orderDetails.providerId}`);
    }
    
    return provider.createDelivery(orderDetails);
  }
  
  /**
   * Cancel a delivery
   */
  async cancelDelivery(providerId: number, externalOrderId: string): Promise<boolean> {
    this.ensureInitialized();
    
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider not found with ID ${providerId}`);
    }
    
    return provider.cancelDelivery(externalOrderId);
  }
  
  /**
   * Get the current status of a delivery
   */
  async getDeliveryStatus(providerId: number, externalOrderId: string): Promise<DeliveryStatus> {
    this.ensureInitialized();
    
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider not found with ID ${providerId}`);
    }
    
    return provider.getDeliveryStatus(externalOrderId);
  }
  
  /**
   * Parse webhook data from a provider
   */
  async parseWebhookData(
    providerId: number,
    data: any,
    headers: Record<string, string>
  ): Promise<{
    externalOrderId: string;
    status: DeliveryStatus;
    driverInfo?: any;
    timestamp: Date;
  }> {
    this.ensureInitialized();
    
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider not found with ID ${providerId}`);
    }
    
    return provider.parseWebhookData(data, headers);
  }
  
  /**
   * Verify the signature of a webhook from a provider
   */
  async verifyWebhookSignature(
    providerId: number,
    data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<boolean> {
    this.ensureInitialized();
    
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider not found with ID ${providerId}`);
    }
    
    return provider.verifyWebhookSignature(data, headers, secret);
  }
  
  /**
   * Ensure the service is initialized before use
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      // Auto-initialize with just the internal provider if not explicitly initialized
      this.initialize();
    }
  }
}

// Export a singleton instance of the delivery service
export const deliveryService = new DeliveryService();