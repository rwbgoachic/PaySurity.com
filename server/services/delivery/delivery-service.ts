/**
 * Delivery Service Coordinator
 * 
 * This service coordinates delivery operations across multiple providers.
 * It's responsible for getting quotes, creating deliveries, and tracking status
 * from multiple internal and external delivery services.
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

/**
 * The DeliveryService class provides a unified interface for working with
 * multiple delivery providers.
 */
class DeliveryService {
  private providers: Map<number, DeliveryProviderAdapter> = new Map();
  private nextProviderID: number = 1;
  
  constructor() {
    this.registerDefaultProviders();
  }
  
  /**
   * Register the default delivery providers
   */
  private registerDefaultProviders(): void {
    // Register internal delivery provider by default
    this.registerProvider(new InternalDeliveryAdapter());
  }
  
  /**
   * Register a new delivery provider
   */
  registerProvider(provider: DeliveryProviderAdapter): number {
    const providerId = this.nextProviderID++;
    this.providers.set(providerId, provider);
    return providerId;
  }
  
  /**
   * Get a delivery provider by ID
   */
  getProvider(providerId: number): DeliveryProviderAdapter | undefined {
    return this.providers.get(providerId);
  }
  
  /**
   * Get quotes from all available providers
   */
  async getQuotes(
    pickup: Address,
    delivery: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote[]> {
    const quotes: DeliveryQuote[] = [];
    const errors: string[] = [];
    
    // Get quotes from all registered providers
    for (const [providerId, provider] of this.providers) {
      try {
        const quote = await provider.getQuote(pickup, delivery, orderDetails);
        
        // Set the provider ID (overriding any value that may have been set)
        quote.providerId = providerId;
        
        quotes.push(quote);
      } catch (error) {
        console.error(`Error getting quote from provider ${provider.getName()}:`, error);
        errors.push(`${provider.getName()}: ${(error as Error).message || 'Unknown error'}`);
      }
    }
    
    return quotes;
  }
  
  /**
   * Create a delivery with the specified provider
   */
  async createDelivery(
    orderDetails: DeliveryOrderDetails
  ): Promise<ExternalDeliveryOrder> {
    const provider = this.providers.get(orderDetails.providerId);
    
    if (!provider) {
      throw new Error(`Provider with ID ${orderDetails.providerId} not found`);
    }
    
    try {
      return await provider.createDelivery(orderDetails);
    } catch (error) {
      console.error(`Error creating delivery with provider ${provider.getName()}:`, error);
      throw error;
    }
  }
  
  /**
   * Cancel a delivery with the specified provider
   */
  async cancelDelivery(
    providerId: number,
    externalOrderId: string
  ): Promise<boolean> {
    const provider = this.providers.get(providerId);
    
    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }
    
    try {
      return await provider.cancelDelivery(externalOrderId);
    } catch (error) {
      console.error(`Error cancelling delivery ${externalOrderId} with provider ${provider.getName()}:`, error);
      return false;
    }
  }
  
  /**
   * Get status of a delivery from the specified provider
   */
  async getDeliveryStatus(
    providerId: number,
    externalOrderId: string
  ): Promise<DeliveryStatus> {
    const provider = this.providers.get(providerId);
    
    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }
    
    try {
      return await provider.getDeliveryStatus(externalOrderId);
    } catch (error) {
      console.error(`Error getting status for delivery ${externalOrderId} with provider ${provider.getName()}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all registered providers
   */
  getAllProviders(): {id: number, name: string, type: string}[] {
    const providerList = [];
    
    for (const [id, provider] of this.providers) {
      providerList.push({
        id,
        name: provider.getName(),
        type: provider.getProviderType()
      });
    }
    
    return providerList;
  }
  
  /**
   * Handle a webhook from a delivery provider
   */
  async handleWebhook(
    providerId: number,
    data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<{
    externalOrderId: string;
    status: DeliveryStatus;
    timestamp: Date;
    driverInfo?: any;
  } | null> {
    const provider = this.providers.get(providerId);
    
    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }
    
    try {
      // Verify the webhook signature first
      const isValid = await provider.verifyWebhookSignature(data, headers, secret);
      
      if (!isValid) {
        console.error(`Invalid webhook signature from provider ${provider.getName()}`);
        return null;
      }
      
      // Parse the webhook data
      const webhookData = await provider.parseWebhookData(data, headers);
      
      return {
        externalOrderId: webhookData.externalOrderId,
        status: webhookData.status,
        driverInfo: webhookData.driverInfo,
        timestamp: webhookData.timestamp
      };
    } catch (error) {
      console.error(`Error handling webhook from provider ${provider.getName()}:`, error);
      return null;
    }
  }
  
  /**
   * Handle a real-time status update from the internal driver app
   */
  async updateInternalDeliveryStatus(
    externalOrderId: string,
    status: DeliveryStatus,
    driverInfo?: any,
    notes?: string
  ): Promise<boolean> {
    // Find the internal delivery provider
    let internalProviderId: number | undefined;
    let internalProvider: InternalDeliveryAdapter | undefined;
    
    for (const [id, provider] of this.providers) {
      if (provider.getProviderType() === 'internal') {
        internalProviderId = id;
        internalProvider = provider as InternalDeliveryAdapter;
        break;
      }
    }
    
    if (!internalProvider) {
      throw new Error('Internal delivery provider not found');
    }
    
    try {
      return await internalProvider.updateDeliveryStatus(
        externalOrderId,
        status,
        driverInfo,
        notes
      );
    } catch (error) {
      console.error(`Error updating internal delivery status for ${externalOrderId}:`, error);
      return false;
    }
  }
  
  /**
   * Create a DoorDash provider with the given credentials
   */
  registerDoorDashProvider(config: DoorDashConfig): number {
    const doorDashAdapter = new DoorDashAdapter(config);
    return this.registerProvider(doorDashAdapter);
  }
}

// Export a singleton instance
export const deliveryService = new DeliveryService();