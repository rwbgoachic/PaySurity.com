/**
 * Delivery Service
 * 
 * This service coordinates between different delivery providers, handling:
 * - Provider registration and selection
 * - Quote generation and comparison
 * - Order creation and tracking
 * - Status updates and webhooks
 * - Fee calculations
 */

import {
  DeliveryProviderAdapter,
  Address,
  OrderDetails,
  DeliveryQuote,
  DeliveryOrderDetails,
  ExternalDeliveryOrder,
  DeliveryStatus
} from './interfaces';
import { InternalDeliveryAdapter } from './providers/internal-adapter';
import { DoorDashAdapter } from './providers/doordash-adapter';
import { storage } from '../../storage';

/**
 * Main delivery service that coordinates between different delivery providers
 */
export class DeliveryService {
  private providers: Map<number, DeliveryProviderAdapter> = new Map();
  private initialized = false;
  private doorDashWebhookSecret: string | null = null;

  constructor() {
    // Register built-in providers
    this.registerProvider(1, new InternalDeliveryAdapter());
  }

  /**
   * Initialize the delivery service
   * This will load all provider configurations from the database
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Load delivery providers from database
      const dbProviders = await storage.getAllDeliveryProviders();
      
      // Set up each provider based on provider type
      for (const provider of dbProviders) {
        if (!provider.isActive) {
          continue;
        }
        
        switch (provider.type) {
          case 'doordash':
            if (provider.apiKey && provider.apiSecret) {
              const doorDashAdapter = new DoorDashAdapter({
                apiKey: provider.apiKey,
                apiSecret: provider.apiSecret
              });
              this.registerProvider(provider.id, doorDashAdapter);
              
              // Store webhook secret for later validation
              if (provider.webhookKey) {
                this.doorDashWebhookSecret = provider.webhookKey;
              }
            }
            break;
            
          // Add more providers as needed (e.g., UberEats, Grubhub)
          
          default:
            console.warn(`Unknown delivery provider type: ${provider.type}`);
        }
      }
      
      this.initialized = true;
      console.log(`Delivery service initialized with ${this.providers.size} providers`);
    } catch (error) {
      console.error('Failed to initialize delivery service:', error);
      throw new Error(`Failed to initialize delivery service: ${(error as Error).message}`);
    }
  }

  /**
   * Register a delivery provider
   */
  registerProvider(providerId: number, adapter: DeliveryProviderAdapter): void {
    this.providers.set(providerId, adapter);
    console.log(`Registered delivery provider: ${adapter.getName()} (ID: ${providerId})`);
  }

  /**
   * Get a delivery provider by ID
   */
  getProvider(providerId: number): DeliveryProviderAdapter | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Get all available providers 
   */
  getAllProviders(): DeliveryProviderAdapter[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get delivery quotes from multiple providers
   */
  async getDeliveryQuotes(
    pickup: Address, 
    delivery: Address, 
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const quotes: DeliveryQuote[] = [];
    const quotePromises = [];
    
    // Request quotes from all providers in parallel
    for (const provider of this.providers.values()) {
      quotePromises.push(
        provider.getQuote(pickup, delivery, orderDetails)
          .then(quote => {
            quotes.push(quote);
          })
          .catch(error => {
            console.error(`Error getting quote from ${provider.getName()}:`, error);
            // Don't add invalid quotes to the list
          })
      );
    }
    
    await Promise.all(quotePromises);
    
    // Sort by customer fee (ascending)
    return quotes.sort((a, b) => a.customerFee - b.customerFee);
  }

  /**
   * Create a new delivery order
   */
  async createDeliveryOrder(
    orderDetails: DeliveryOrderDetails
  ): Promise<{
    id: number;
    externalOrderId: string;
    providerId: number;
    providerName: string;
    status: DeliveryStatus;
    estimatedPickupTime: Date;
    estimatedDeliveryTime: Date;
    trackingUrl?: string;
  }> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Get the provider
    const provider = this.providers.get(orderDetails.providerId);
    if (!provider) {
      throw new Error(`Delivery provider with ID ${orderDetails.providerId} not found`);
    }
    
    try {
      // Create the delivery in the provider's system
      const externalDelivery = await provider.createDelivery(orderDetails);
      
      // Store the delivery in our database
      const delivery = await storage.createDeliveryOrder({
        businessId: orderDetails.businessId,
        providerId: orderDetails.providerId,
        externalOrderId: externalDelivery.externalOrderId,
        orderId: typeof orderDetails.orderId === 'string' 
          ? parseInt(orderDetails.orderId) 
          : orderDetails.orderId,
        customerName: orderDetails.customerName,
        customerPhone: orderDetails.customerPhone,
        customerAddress: typeof orderDetails.customerAddress === 'string'
          ? orderDetails.customerAddress
          : JSON.stringify(orderDetails.customerAddress),
        businessAddress: typeof orderDetails.businessAddress === 'string'
          ? orderDetails.businessAddress
          : JSON.stringify(orderDetails.businessAddress),
        status: externalDelivery.status,
        fee: orderDetails.providerFee,
        platformFee: orderDetails.platformFee,
        customerFee: orderDetails.customerFee,
        estimatedPickupTime: externalDelivery.estimatedPickupTime,
        estimatedDeliveryTime: externalDelivery.estimatedDeliveryTime,
        specialInstructions: orderDetails.specialInstructions || null,
        driverName: externalDelivery.driverName || null,
        driverPhone: externalDelivery.driverPhone || null,
        trackingUrl: externalDelivery.trackingUrl || null,
        providerData: JSON.stringify(externalDelivery.providerData || {}),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create initial status history entry
      await this.recordStatusChange(
        delivery.id,
        externalDelivery.status,
        new Date()
      );
      
      return {
        id: delivery.id,
        externalOrderId: externalDelivery.externalOrderId,
        providerId: orderDetails.providerId,
        providerName: provider.getName(),
        status: externalDelivery.status,
        estimatedPickupTime: externalDelivery.estimatedPickupTime,
        estimatedDeliveryTime: externalDelivery.estimatedDeliveryTime,
        trackingUrl: externalDelivery.trackingUrl
      };
    } catch (error) {
      console.error('Error creating delivery order:', error);
      throw new Error(`Failed to create delivery order: ${(error as Error).message}`);
    }
  }

  /**
   * Cancel a delivery order
   */
  async cancelDelivery(deliveryId: number, reason?: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Get the delivery order
      const delivery = await storage.getDeliveryOrder(deliveryId);
      if (!delivery) {
        throw new Error(`Delivery order with ID ${deliveryId} not found`);
      }
      
      // Check if the delivery is already cancelled or completed
      if (delivery.status === 'cancelled' || delivery.status === 'delivered') {
        return false;
      }
      
      // Get the provider
      const provider = this.providers.get(delivery.providerId);
      if (!provider) {
        throw new Error(`Delivery provider with ID ${delivery.providerId} not found`);
      }
      
      // Cancel the delivery with the provider
      const cancelled = await provider.cancelDelivery(delivery.externalOrderId);
      if (cancelled) {
        // Update the status in our database
        await storage.updateDeliveryOrderStatus(deliveryId, 'cancelled');
        
        // Record the status change
        await this.recordStatusChange(
          deliveryId,
          'cancelled',
          new Date(),
          reason
        );
      }
      
      return cancelled;
    } catch (error) {
      console.error('Error cancelling delivery:', error);
      return false;
    }
  }

  /**
   * Get a delivery order by ID
   */
  async getDeliveryOrder(deliveryId: number) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      const delivery = await storage.getDeliveryOrder(deliveryId);
      if (!delivery) {
        return null;
      }
      
      // Try to get a status update from the provider
      const provider = this.providers.get(delivery.providerId);
      if (provider) {
        try {
          const currentStatus = await provider.getDeliveryStatus(delivery.externalOrderId);
          
          // If the status has changed, update our database
          if (currentStatus !== delivery.status) {
            const oldStatus = delivery.status;
            delivery.status = currentStatus;
            
            // Update the status in our database
            await storage.updateDeliveryOrderStatus(deliveryId, currentStatus);
            
            // Record the status change
            await this.recordStatusChange(
              deliveryId,
              currentStatus,
              new Date(),
              `Status changed from ${oldStatus} to ${currentStatus} by provider`
            );
          }
        } catch (error) {
          console.warn(`Failed to get status update for delivery ${deliveryId}:`, error);
          // Continue with the existing status
        }
      }
      
      return delivery;
    } catch (error) {
      console.error('Error getting delivery order:', error);
      throw new Error(`Failed to get delivery order: ${(error as Error).message}`);
    }
  }

  /**
   * Get delivery orders for a business
   */
  async getBusinessDeliveryOrders(
    businessId: number,
    options?: {
      status?: DeliveryStatus;
      orderId?: number;
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      return await storage.getBusinessDeliveryOrders(businessId, options);
    } catch (error) {
      console.error('Error getting business delivery orders:', error);
      throw new Error(`Failed to get business delivery orders: ${(error as Error).message}`);
    }
  }

  /**
   * Process a webhook from a delivery provider
   */
  async processWebhook(
    providerType: string,
    data: any,
    headers: Record<string, string>
  ): Promise<{
    deliveryId: number;
    oldStatus?: DeliveryStatus;
    newStatus?: DeliveryStatus;
    driverInfo?: {
      id?: string;
      name?: string;
      phone?: string;
      location?: {
        latitude: number;
        longitude: number;
      };
    };
  } | null> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Find the provider ID by type
      const providerId = await this.findProviderIdByType(providerType);
      if (!providerId) {
        throw new Error(`No active provider found for type: ${providerType}`);
      }
      
      // Get the provider
      const provider = this.providers.get(providerId);
      if (!provider) {
        throw new Error(`Provider with ID ${providerId} not found`);
      }
      
      // Get webhook secret
      let webhookSecret = null;
      if (providerType === 'doordash') {
        webhookSecret = this.doorDashWebhookSecret;
      }
      
      // Verify webhook signature if secret is available
      if (webhookSecret) {
        const isValid = await provider.verifyWebhookSignature(data, headers, webhookSecret);
        if (!isValid) {
          throw new Error('Invalid webhook signature');
        }
      }
      
      // Parse webhook data
      const webhookData = await provider.parseWebhookData(data, headers);
      
      // Find the delivery order in our database
      const delivery = await storage.getDeliveryOrderByExternalId(webhookData.externalOrderId);
      if (!delivery) {
        console.warn(`Delivery order with external ID ${webhookData.externalOrderId} not found`);
        return null;
      }
      
      const oldStatus = delivery.status;
      const newStatus = webhookData.status;
      
      // Update driver information if available
      if (webhookData.driverInfo) {
        const updates: any = {};
        
        if (webhookData.driverInfo.name) {
          updates.driverName = webhookData.driverInfo.name;
        }
        
        if (webhookData.driverInfo.phone) {
          updates.driverPhone = webhookData.driverInfo.phone;
        }
        
        if (webhookData.driverInfo.location) {
          updates.lastDriverLocation = JSON.stringify(webhookData.driverInfo.location);
          updates.lastLocationUpdate = new Date();
        }
        
        if (Object.keys(updates).length > 0) {
          await storage.updateDeliveryOrder(delivery.id, updates);
        }
      }
      
      // Update status if it has changed
      if (oldStatus !== newStatus) {
        await storage.updateDeliveryOrderStatus(delivery.id, newStatus);
        
        // Record the status change
        await this.recordStatusChange(
          delivery.id,
          newStatus,
          webhookData.timestamp,
          `Status updated by ${providerType} webhook`
        );
        
        // For completed deliveries, update any additional data
        if (newStatus === 'delivered') {
          await storage.updateDeliveryOrder(delivery.id, {
            actualDeliveryTime: webhookData.timestamp,
            updatedAt: new Date()
          });
        }
      }
      
      // For tracking additional webhook data
      const additionalData = webhookData.additionalData;
      if (additionalData) {
        const currentData = delivery.providerData ? JSON.parse(delivery.providerData) : {};
        const updatedData = {
          ...currentData,
          webhookEvents: [
            ...(currentData.webhookEvents || []),
            {
              timestamp: webhookData.timestamp,
              status: newStatus,
              data: additionalData
            }
          ]
        };
        
        await storage.updateDeliveryOrder(delivery.id, {
          providerData: JSON.stringify(updatedData),
          updatedAt: new Date()
        });
      }
      
      return {
        deliveryId: delivery.id,
        oldStatus,
        newStatus,
        driverInfo: webhookData.driverInfo
      };
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw new Error(`Failed to process webhook: ${(error as Error).message}`);
    }
  }

  /**
   * Update delivery status manually
   */
  async updateDeliveryStatus(
    deliveryId: number,
    newStatus: DeliveryStatus,
    timestamp: Date = new Date()
  ): Promise<{
    oldStatus: DeliveryStatus;
    newStatus: DeliveryStatus;
  }> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Get the delivery order
      const delivery = await storage.getDeliveryOrder(deliveryId);
      if (!delivery) {
        throw new Error(`Delivery order with ID ${deliveryId} not found`);
      }
      
      const oldStatus = delivery.status;
      
      // Skip if status hasn't changed
      if (oldStatus === newStatus) {
        return { oldStatus, newStatus };
      }
      
      // Update status in our database
      await storage.updateDeliveryOrderStatus(deliveryId, newStatus);
      
      // Record the status change
      await this.recordStatusChange(
        deliveryId,
        newStatus,
        timestamp,
        'Status updated manually'
      );
      
      // For completed deliveries, update actual delivery time
      if (newStatus === 'delivered') {
        await storage.updateDeliveryOrder(deliveryId, {
          actualDeliveryTime: timestamp,
          updatedAt: new Date()
        });
      }
      
      return { oldStatus, newStatus };
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw new Error(`Failed to update delivery status: ${(error as Error).message}`);
    }
  }

  /**
   * Record a status change in the history
   */
  private async recordStatusChange(
    deliveryId: number,
    status: DeliveryStatus,
    timestamp: Date = new Date(),
    notes?: string
  ): Promise<void> {
    try {
      await storage.createDeliveryStatusHistory({
        deliveryId,
        status,
        timestamp,
        notes: notes || null,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error recording delivery status change:', error);
      // Don't throw error here, so the main operation can still succeed
    }
  }

  /**
   * Find a provider ID by type (e.g., 'doordash')
   */
  private async findProviderIdByType(type: string): Promise<number | null> {
    const providers = await storage.getAllDeliveryProviders();
    const provider = providers.find(p => p.type === type && p.isActive);
    return provider ? provider.id : null;
  }
}

export const deliveryService = new DeliveryService();