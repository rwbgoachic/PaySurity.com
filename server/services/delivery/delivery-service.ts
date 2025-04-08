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
import { db } from '../../db';
import { 
  businessDeliverySettings, 
  type BusinessDeliverySetting,
  type InsertBusinessDeliverySetting 
} from '@shared/delivery-schema';
import { eq } from 'drizzle-orm';
import { SQL } from 'drizzle-orm';

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
   * Get business delivery settings
   */
  async getBusinessDeliverySettings(businessId: number): Promise<BusinessDeliverySetting | undefined> {
    try {
      const [settings] = await db
        .select()
        .from(businessDeliverySettings)
        .where(eq(businessDeliverySettings.businessId, businessId));
      
      return settings;
    } catch (error) {
      console.error("Error getting business delivery settings:", error);
      throw new Error(`Failed to get business delivery settings: ${(error as Error).message}`);
    }
  }

  /**
   * Create or update business delivery settings
   */
  async createOrUpdateBusinessDeliverySettings(settings: InsertBusinessDeliverySetting): Promise<BusinessDeliverySetting> {
    try {
      // Check if settings already exist for this business
      const existingSettings = await this.getBusinessDeliverySettings(settings.businessId);
      
      // Create a safe copy of the settings with proper handling for arrays
      const settingsCopy = { ...settings };
      
      // Fix the enabledProviders field to be a proper array or null
      if (!settingsCopy.enabledProviders) {
        settingsCopy.enabledProviders = [];
      } else if (!Array.isArray(settingsCopy.enabledProviders)) {
        settingsCopy.enabledProviders = [];
      }
      
      if (existingSettings) {
        // Update existing settings
        const now = new Date();
        const updateData: Record<string, any> = {
          businessId: settingsCopy.businessId,
          deliveryFee: settingsCopy.deliveryFee,
          minimumOrderAmount: settingsCopy.minimumOrderAmount,
          freeDeliveryThreshold: settingsCopy.freeDeliveryThreshold,
          estimatedDeliveryTime: settingsCopy.estimatedDeliveryTime,
          defaultProvider: settingsCopy.defaultProvider,
          autoAssign: settingsCopy.autoAssign,
          deliveryRadius: settingsCopy.deliveryRadius,
          isActive: settingsCopy.isActive,
          settings: settingsCopy.settings,
          updatedAt: now
        };
        
        // Handle the array separately to avoid typing issues
        updateData.enabledProviders = settingsCopy.enabledProviders;
        
        const [updatedSettings] = await db
          .update(businessDeliverySettings)
          .set(updateData)
          .where(eq(businessDeliverySettings.id, existingSettings.id))
          .returning();
        
        return updatedSettings;
      } else {
        // Insert new settings
        const [newSettings] = await db
          .insert(businessDeliverySettings)
          .values(settingsCopy)
          .returning();
        
        return newSettings;
      }
    } catch (error) {
      console.error("Error creating/updating business delivery settings:", error);
      throw new Error(`Failed to create/update business delivery settings: ${(error as Error).message}`);
    }
  }
  
  /**
   * Get a provider adapter by ID
   */
  getProviderAdapter(providerId: number): DeliveryProviderAdapter | undefined {
    return this.getProvider(providerId);
  }

  /**
   * Get providers available for a specific region
   */
  async getProvidersForRegion(regionId: number): Promise<{id: number; name: string; type: string}[]> {
    this.ensureInitialized();
    
    // For now, just return all providers since we don't have region-specific provider data
    // In a real implementation, we would filter providers based on the region
    return this.listProviders();
  }
  
  /**
   * Get delivery orders for a business
   */
  async getBusinessDeliveryOrders(
    businessId: number,
    startDate?: Date,
    endDate?: Date,
    status?: DeliveryStatus
  ): Promise<any[]> {
    // This is a placeholder implementation
    // In a real implementation, we would query the database for orders matching the criteria
    return [];
  }
  
  /**
   * Get a delivery order by ID
   */
  async getDeliveryOrder(orderId: number): Promise<any | undefined> {
    // This is a placeholder implementation
    // In a real implementation, we would query the database for the order
    return undefined;
  }
  
  /**
   * Update a delivery order's status
   */
  async updateDeliveryOrderStatus(
    orderId: number,
    status: DeliveryStatus,
    driverInfo?: any
  ): Promise<any> {
    // This is a placeholder implementation
    // In a real implementation, we would update the order in the database
    return { id: orderId, status };
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