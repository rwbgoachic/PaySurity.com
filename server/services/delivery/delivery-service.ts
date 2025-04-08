/**
 * Delivery Service Coordinator
 * 
 * This service coordinates between different delivery providers, managing
 * delivery quotes, order creation, status updates, and webhooks.
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

// Import providers
import { InternalDeliveryAdapter } from './providers/internal-adapter';
import { DoorDashAdapter } from './providers/doordash-adapter';

/**
 * Singleton delivery service coordinator
 */
class DeliveryService {
  private providers: Map<number, DeliveryProviderAdapter> = new Map();
  private initialized = false;
  
  /**
   * Initialize the delivery service with providers from the database
   * This can be called multiple times but will only load once
   */
  async initialize() {
    if (this.initialized) {
      return;
    }
    
    try {
      // In production, we would load providers from the database
      // For demo purposes, we'll add static providers
      
      // Add default providers for testing
      this.addDefaultProviders();
      
      this.initialized = true;
      console.log('Delivery service initialized with providers:', 
        Array.from(this.providers.entries()).map(([id, provider]) => 
          `${id}: ${provider.getName()} (${provider.getProviderType()})`
        )
      );
    } catch (error) {
      console.error('Failed to initialize delivery service:', error);
      throw new Error(`Delivery service initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Add default providers for testing
   */
  private addDefaultProviders() {
    // Add internal provider (restaurant's own delivery staff)
    const internalProvider = new InternalDeliveryAdapter();
    this.providers.set(1, internalProvider);
    
    // Add DoorDash provider (if credentials available)
    try {
      // In production, these would be loaded from environment or secure storage
      const doordashConfig = {
        apiKey: process.env.DOORDASH_API_KEY || 'test_api_key',
        apiSecret: process.env.DOORDASH_API_SECRET || 'test_api_secret',
        developerId: process.env.DOORDASH_DEVELOPER_ID || 'paysurity_test'
      };
      
      const doordashProvider = new DoorDashAdapter(doordashConfig);
      this.providers.set(2, doordashProvider);
    } catch (error) {
      console.warn('Failed to initialize DoorDash provider:', error);
    }
    
    // In production, more providers would be loaded here
    // e.g., UberEats, GrubHub, etc.
  }
  
  /**
   * Get quotes from all available delivery providers for a given delivery
   */
  async getDeliveryQuotes(
    pickup: Address,
    delivery: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote[]> {
    await this.ensureInitialized();
    
    const quotes: DeliveryQuote[] = [];
    const quotePromises: Promise<void>[] = [];
    
    // Get quotes from all providers in parallel
    for (const provider of this.providers.values()) {
      const quotePromise = provider.getQuote(pickup, delivery, orderDetails)
        .then(quote => {
          quotes.push(quote);
        })
        .catch(error => {
          console.error(`Error getting quote from ${provider.getName()}:`, error);
          // Add failed quote with error message
          quotes.push({
            providerId: -1, // Will be updated with actual provider ID
            providerName: provider.getName(),
            fee: 0,
            customerFee: 0,
            platformFee: 0,
            currency: orderDetails.currency || 'USD',
            estimatedPickupTime: new Date(),
            estimatedDeliveryTime: new Date(),
            distance: 0,
            distanceUnit: 'miles',
            valid: false,
            validUntil: new Date(),
            errors: [error instanceof Error ? error.message : String(error)]
          });
        });
      
      quotePromises.push(quotePromise);
    }
    
    // Wait for all quotes to be fetched
    await Promise.all(quotePromises);
    
    // Sort quotes by fee (lowest first)
    return quotes.sort((a, b) => a.customerFee - b.customerFee);
  }
  
  /**
   * Create a delivery order with the specified provider
   */
  async createDelivery(orderDetails: DeliveryOrderDetails): Promise<{
    deliveryId: string;
    providerId: number;
    providerName: string;
    status: DeliveryStatus;
    estimatedPickupTime: Date;
    estimatedDeliveryTime: Date;
    trackingUrl?: string;
  }> {
    await this.ensureInitialized();
    
    const provider = this.providers.get(orderDetails.providerId);
    if (!provider) {
      throw new Error(`Provider with ID ${orderDetails.providerId} not found`);
    }
    
    try {
      const delivery = await provider.createDelivery(orderDetails);
      
      return {
        deliveryId: delivery.externalOrderId,
        providerId: orderDetails.providerId,
        providerName: provider.getName(),
        status: delivery.status,
        estimatedPickupTime: delivery.estimatedPickupTime,
        estimatedDeliveryTime: delivery.estimatedDeliveryTime,
        trackingUrl: delivery.trackingUrl
      };
    } catch (error) {
      console.error(`Error creating delivery with ${provider.getName()}:`, error);
      throw new Error(`Failed to create delivery: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Cancel a delivery
   */
  async cancelDelivery(deliveryId: string, providerId: number): Promise<boolean> {
    await this.ensureInitialized();
    
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }
    
    try {
      return await provider.cancelDelivery(deliveryId);
    } catch (error) {
      console.error(`Error cancelling delivery with ${provider.getName()}:`, error);
      throw new Error(`Failed to cancel delivery: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get the current status of a delivery
   */
  async getDeliveryStatus(deliveryId: string, providerId: number): Promise<DeliveryStatus> {
    await this.ensureInitialized();
    
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }
    
    try {
      return await provider.getDeliveryStatus(deliveryId);
    } catch (error) {
      console.error(`Error getting delivery status from ${provider.getName()}:`, error);
      throw new Error(`Failed to get delivery status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * For internal deliveries: update the status including driver info
   * This is a convenience method that only works for the internal provider
   */
  async updateInternalDeliveryStatus(
    deliveryId: string,
    status: DeliveryStatus,
    driver?: {
      id: string;
      name: string;
      phone: string;
      location?: {
        latitude: number;
        longitude: number;
      };
    },
    notes?: string
  ): Promise<boolean> {
    await this.ensureInitialized();
    
    // Get internal provider (always ID 1)
    const internalProvider = this.providers.get(1) as InternalDeliveryAdapter;
    if (!internalProvider || internalProvider.getProviderType() !== 'internal') {
      throw new Error('Internal provider not configured');
    }
    
    try {
      return await internalProvider.updateDeliveryStatus(deliveryId, status, driver, notes);
    } catch (error) {
      console.error('Error updating internal delivery status:', error);
      throw new Error(`Failed to update delivery status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Handle a webhook request from a delivery provider
   */
  async handleProviderWebhook(
    providerId: number,
    data: any,
    headers: Record<string, string>,
    webhookSecret: string
  ): Promise<{
    deliveryId: string;
    status: DeliveryStatus;
    driverInfo?: {
      id?: string;
      name?: string;
      phone?: string;
      location?: {
        latitude: number;
        longitude: number;
      };
    };
    timestamp: Date;
    additionalData?: any;
  }> {
    await this.ensureInitialized();
    
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }
    
    try {
      // Verify webhook signature first
      const validSignature = await provider.verifyWebhookSignature(data, headers, webhookSecret);
      if (!validSignature) {
        throw new Error('Invalid webhook signature');
      }
      
      // Parse webhook data
      return await provider.parseWebhookData(data, headers);
    } catch (error) {
      console.error(`Error handling webhook from ${provider.getName()}:`, error);
      throw new Error(`Failed to handle webhook: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get all available delivery providers
   */
  async getProviders(): Promise<{
    id: number;
    name: string;
    type: 'internal' | 'external';
  }[]> {
    await this.ensureInitialized();
    
    const providerList: {
      id: number;
      name: string;
      type: 'internal' | 'external';
    }[] = [];
    
    for (const [id, provider] of this.providers.entries()) {
      providerList.push({
        id,
        name: provider.getName(),
        type: provider.getProviderType()
      });
    }
    
    return providerList;
  }
  
  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

export const deliveryService = new DeliveryService();