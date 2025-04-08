/**
 * Delivery Service
 * 
 * This service manages the delivery process, handling both internal restaurant
 * deliveries and external delivery providers like DoorDash.
 */

import { 
  db 
} from '../../db';
import { 
  DeliveryProviderAdapter,
  Address,
  OrderDetails,
  DeliveryQuote,
  DeliveryOrderDetails,
  DeliveryStatus,
  ExternalDeliveryOrder
} from './interfaces';
import {
  deliveryProviders,
  deliveryRegions,
  deliveryProviderRegions,
  businessDeliverySettings,
  deliveryOrders,
  deliveryPayments,
  deliveryPaymentItems,
  InsertDeliveryOrder,
  InsertDeliveryPayment,
  InsertDeliveryPaymentItem,
  BusinessDeliverySetting
} from '@shared/delivery-schema';
import { eq, and, between, sql, inArray } from 'drizzle-orm';
import { DoorDashAdapter } from './providers/doordash-adapter';
import { InternalDeliveryAdapter } from './providers/internal-adapter';
import { v4 as uuidv4 } from 'uuid';

export class DeliveryService {
  private providerAdapters: Map<number, DeliveryProviderAdapter> = new Map();

  constructor() {
    this.initializeProviderAdapters();
  }

  /**
   * Initialize all delivery provider adapters
   */
  private async initializeProviderAdapters() {
    try {
      // Get all active providers from the database
      const providers = await db.select().from(deliveryProviders).where(eq(deliveryProviders.isActive, true));

      for (const provider of providers) {
        if (provider.type === 'internal') {
          // Create internal delivery provider adapter
          this.providerAdapters.set(provider.id, new InternalDeliveryAdapter());
        } else if (provider.type === 'external' && provider.name === 'DoorDash') {
          // Create DoorDash adapter
          this.providerAdapters.set(provider.id, new DoorDashAdapter({
            apiKey: provider.apiKey || '',
            apiSecret: provider.apiSecret || '',
            baseUrl: provider.baseUrl || undefined
          }));
        }
        // Add other provider adapters as needed
      }

      // If no providers were found in the database, add a default internal provider
      if (this.providerAdapters.size === 0) {
        // Create internal delivery provider
        const [internalProvider] = await db.insert(deliveryProviders).values({
          name: 'Internal Delivery',
          type: 'internal',
          isActive: true,
          baseFee: '3.00',
          perMileFee: '0.50',
        }).returning();

        if (internalProvider) {
          this.providerAdapters.set(internalProvider.id, new InternalDeliveryAdapter());
        }
      }
    } catch (error) {
      console.error('Failed to initialize delivery provider adapters:', error);
    }
  }

  /**
   * Get delivery quotes from all active providers
   */
  async getDeliveryQuotes(
    businessId: number,
    pickupAddress: Address,
    deliveryAddress: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote[]> {
    try {
      // Get delivery settings for this business
      const [businessSettings] = await db.select().from(businessDeliverySettings)
        .where(eq(businessDeliverySettings.businessId, businessId));

      if (!businessSettings || !businessSettings.isDeliveryEnabled) {
        return [];
      }

      // Check if the order meets minimum value
      if (businessSettings.minimumOrderValue && orderDetails.totalValue < parseFloat(businessSettings.minimumOrderValue)) {
        return [{
          providerId: 0,
          providerName: 'Error',
          fee: 0,
          customerFee: 0,
          platformFee: 0,
          currency: 'USD',
          estimatedPickupTime: new Date(),
          estimatedDeliveryTime: new Date(),
          distance: 0,
          distanceUnit: 'miles',
          valid: false,
          validUntil: new Date(),
          errors: [`Order value (${orderDetails.totalValue}) is below the minimum required (${businessSettings.minimumOrderValue})`]
        }];
      }

      const quotes: DeliveryQuote[] = [];

      // Get allowed providers for this business
      const allowedProviderIds = businessSettings.allowedProviders 
        ? (businessSettings.allowedProviders as number[])
        : Array.from(this.providerAdapters.keys());

      // Get quotes from each provider
      for (const [providerId, adapter] of this.providerAdapters) {
        if (!allowedProviderIds.includes(providerId)) {
          continue;
        }

        try {
          const quote = await adapter.getQuote(pickupAddress, deliveryAddress, orderDetails);

          // Apply any business-specific fee adjustments
          if (quote.valid) {
            // Calculate platform fee
            const platformFeePercentage = parseFloat(businessSettings.platformFeePercentage || '0.15');
            const platformFeeFixed = parseFloat(businessSettings.platformFeeFixed || '1.00');
            
            quote.platformFee = (quote.fee * platformFeePercentage) + platformFeeFixed;
            quote.platformFee = Math.round(quote.platformFee * 100) / 100;

            // Add the platform fee to the customer fee if business doesn't absorb it
            if (!businessSettings.businessAbsorbsDeliveryFee) {
              quote.customerFee = quote.fee + quote.platformFee;

              // Apply any customer offset (e.g., business subsidizes part of the delivery fee)
              if (businessSettings.deliveryFeeCustomerOffset) {
                quote.customerFee -= parseFloat(businessSettings.deliveryFeeCustomerOffset);
                quote.customerFee = Math.max(0, quote.customerFee); // Don't go below zero
              }

              // Round to 2 decimal places
              quote.customerFee = Math.round(quote.customerFee * 100) / 100;
            } else {
              quote.customerFee = 0; // Business absorbs the entire fee
            }
          }

          quotes.push(quote);
        } catch (error) {
          console.error(`Error getting quote from provider ${providerId}:`, error);
        }
      }

      return quotes;
    } catch (error) {
      console.error('Error getting delivery quotes:', error);
      throw new Error(`Failed to get delivery quotes: ${(error as Error).message}`);
    }
  }

  /**
   * Create a delivery order with a specific provider
   */
  async createDelivery(orderDetails: DeliveryOrderDetails): Promise<DeliveryOrder> {
    try {
      const providerId = orderDetails.providerId;
      const adapter = this.providerAdapters.get(providerId);

      if (!adapter) {
        throw new Error(`Provider with ID ${providerId} not found`);
      }

      // Create delivery with the provider
      const externalDelivery = await adapter.createDelivery(orderDetails);

      // Prepare status history
      const statusHistory = [{
        status: externalDelivery.status,
        timestamp: new Date().toISOString(),
        notes: 'Delivery created'
      }];

      // Store the delivery in our database
      const [deliveryOrder] = await db.insert(deliveryOrders).values({
        orderId: orderDetails.orderId,
        businessId: orderDetails.businessId,
        providerId,
        status: externalDelivery.status,
        externalOrderId: externalDelivery.externalOrderId,
        customerName: orderDetails.customerName,
        customerPhone: orderDetails.customerPhone,
        customerAddress: orderDetails.customerAddress.street,
        customerLatitude: orderDetails.customerAddress.latitude?.toString(),
        customerLongitude: orderDetails.customerAddress.longitude?.toString(),
        businessAddress: orderDetails.businessAddress.street,
        businessLatitude: orderDetails.businessAddress.latitude?.toString(),
        businessLongitude: orderDetails.businessAddress.longitude?.toString(),
        driverId: externalDelivery.driverId,
        driverName: externalDelivery.driverName,
        driverPhone: externalDelivery.driverPhone,
        driverLocation: externalDelivery.driverLocation ? JSON.stringify(externalDelivery.driverLocation) : null,
        estimatedPickupTime: externalDelivery.estimatedPickupTime,
        estimatedDeliveryTime: externalDelivery.estimatedDeliveryTime,
        providerFee: orderDetails.providerFee,
        customerFee: orderDetails.customerFee,
        platformFee: orderDetails.platformFee,
        specialInstructions: orderDetails.specialInstructions,
        statusHistory: statusHistory,
        trackingUrl: externalDelivery.trackingUrl,
        providerData: externalDelivery.providerData,
      }).returning();

      return deliveryOrder;
    } catch (error) {
      console.error('Error creating delivery:', error);
      throw new Error(`Failed to create delivery: ${(error as Error).message}`);
    }
  }

  /**
   * Cancel a delivery
   */
  async cancelDelivery(deliveryId: number): Promise<boolean> {
    try {
      const [delivery] = await db.select().from(deliveryOrders).where(eq(deliveryOrders.id, deliveryId));

      if (!delivery) {
        throw new Error(`Delivery with ID ${deliveryId} not found`);
      }

      if (delivery.status === 'cancelled' || delivery.status === 'delivered') {
        throw new Error(`Cannot cancel delivery in ${delivery.status} state`);
      }

      const providerId = delivery.providerId;
      const adapter = this.providerAdapters.get(providerId);

      if (!adapter) {
        throw new Error(`Provider with ID ${providerId} not found`);
      }

      if (delivery.externalOrderId) {
        await adapter.cancelDelivery(delivery.externalOrderId);
      }

      // Update status history
      const statusHistory = [
        ...(delivery.statusHistory || []),
        {
          status: 'cancelled',
          timestamp: new Date().toISOString(),
          notes: 'Delivery cancelled'
        }
      ];

      // Update delivery status in our database
      await db.update(deliveryOrders)
        .set({
          status: 'cancelled',
          statusHistory,
          cancelReason: 'Cancelled by merchant',
          updatedAt: new Date()
        })
        .where(eq(deliveryOrders.id, deliveryId));

      return true;
    } catch (error) {
      console.error('Error cancelling delivery:', error);
      throw new Error(`Failed to cancel delivery: ${(error as Error).message}`);
    }
  }

  /**
   * Get deliveries for a business
   */
  async getBusinessDeliveries(
    businessId: number,
    status?: DeliveryStatus | DeliveryStatus[],
    page: number = 1,
    limit: number = 50,
    startDate?: Date,
    endDate?: Date
  ) {
    try {
      let query = db.select().from(deliveryOrders)
        .where(eq(deliveryOrders.businessId, businessId));

      // Filter by status if provided
      if (status) {
        if (Array.isArray(status)) {
          // query = query.where(inArray(deliveryOrders.status, status));
        } else {
          // query = query.where(eq(deliveryOrders.status, status));
        }
      }

      // Filter by date range if provided
      if (startDate && endDate) {
        query = query.where(
          and(
            sql`${deliveryOrders.createdAt} >= ${startDate}`,
            sql`${deliveryOrders.createdAt} <= ${endDate}`
          )
        );
      }

      // Calculate pagination
      const offset = (page - 1) * limit;
      query = query.limit(limit).offset(offset).orderBy(sql`${deliveryOrders.createdAt} DESC`);

      const deliveries = await query;

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(deliveryOrders)
        .where(eq(deliveryOrders.businessId, businessId));

      return {
        deliveries,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Error getting business deliveries:', error);
      throw new Error(`Failed to get business deliveries: ${(error as Error).message}`);
    }
  }

  /**
   * Get a delivery by ID
   */
  async getDelivery(deliveryId: number) {
    try {
      const [delivery] = await db
        .select()
        .from(deliveryOrders)
        .where(eq(deliveryOrders.id, deliveryId));

      if (!delivery) {
        throw new Error(`Delivery with ID ${deliveryId} not found`);
      }

      return delivery;
    } catch (error) {
      console.error(`Error getting delivery ${deliveryId}:`, error);
      throw new Error(`Failed to get delivery: ${(error as Error).message}`);
    }
  }

  /**
   * Get a delivery by external order ID
   */
  async getDeliveryByExternalId(externalOrderId: string) {
    try {
      const [delivery] = await db
        .select()
        .from(deliveryOrders)
        .where(eq(deliveryOrders.externalOrderId, externalOrderId));

      if (!delivery) {
        throw new Error(`Delivery with external ID ${externalOrderId} not found`);
      }

      return delivery;
    } catch (error) {
      console.error(`Error getting delivery with external ID ${externalOrderId}:`, error);
      throw new Error(`Failed to get delivery: ${(error as Error).message}`);
    }
  }

  /**
   * Update delivery status from webhook data
   */
  async updateDeliveryStatus(
    externalOrderId: string,
    status: DeliveryStatus,
    driverInfo?: {
      id?: string;
      name?: string;
      phone?: string;
      location?: {
        latitude: number;
        longitude: number;
      };
    },
    additionalData?: any
  ) {
    try {
      const [delivery] = await db
        .select()
        .from(deliveryOrders)
        .where(eq(deliveryOrders.externalOrderId, externalOrderId));

      if (!delivery) {
        throw new Error(`Delivery with external ID ${externalOrderId} not found`);
      }

      // Update status history
      const statusHistory = [
        ...(delivery.statusHistory || []),
        {
          status,
          timestamp: new Date().toISOString(),
          notes: `Status updated to ${status}`
        }
      ];

      // Prepare update data
      const updateData: Partial<InsertDeliveryOrder> = {
        status,
        statusHistory,
        updatedAt: new Date()
      };

      // Update driver info if provided
      if (driverInfo) {
        if (driverInfo.id) updateData.driverId = driverInfo.id;
        if (driverInfo.name) updateData.driverName = driverInfo.name;
        if (driverInfo.phone) updateData.driverPhone = driverInfo.phone;
        if (driverInfo.location) updateData.driverLocation = JSON.stringify(driverInfo.location);
      }

      // Update pickup and delivery times based on status
      if (status === 'picked_up' && additionalData?.actualPickupTime) {
        updateData.actualPickupTime = new Date(additionalData.actualPickupTime);
      }

      if (status === 'delivered' && additionalData?.actualDeliveryTime) {
        updateData.actualDeliveryTime = new Date(additionalData.actualDeliveryTime);
      }

      // Update failure or cancellation reason if applicable
      if (status === 'failed' && additionalData?.failureReason) {
        updateData.failureReason = additionalData.failureReason;
      }

      if (status === 'cancelled' && additionalData?.cancelReason) {
        updateData.cancelReason = additionalData.cancelReason;
      }

      // Update delivery in database
      await db.update(deliveryOrders)
        .set(updateData)
        .where(eq(deliveryOrders.id, delivery.id));

      return true;
    } catch (error) {
      console.error(`Error updating delivery status for ${externalOrderId}:`, error);
      throw new Error(`Failed to update delivery status: ${(error as Error).message}`);
    }
  }

  /**
   * Process delivery provider payments for a date range
   */
  async processProviderPayments(
    startDate: Date,
    endDate: Date,
    providerId?: number
  ) {
    try {
      let query = db
        .select()
        .from(deliveryOrders)
        .where(
          and(
            sql`${deliveryOrders.createdAt} >= ${startDate}`,
            sql`${deliveryOrders.createdAt} <= ${endDate}`,
            eq(deliveryOrders.paymentSettled, false),
            inArray(deliveryOrders.status, ['delivered', 'failed', 'cancelled'])
          )
        );

      if (providerId) {
        query = query.where(eq(deliveryOrders.providerId, providerId));
      }

      const deliveries = await query;

      // Group deliveries by provider
      const deliveriesByProvider: Record<number, typeof deliveries> = {};
      for (const delivery of deliveries) {
        if (!deliveriesByProvider[delivery.providerId]) {
          deliveriesByProvider[delivery.providerId] = [];
        }
        deliveriesByProvider[delivery.providerId].push(delivery);
      }

      const results: any[] = [];

      // Process each provider's deliveries
      for (const [provId, providerDeliveries] of Object.entries(deliveriesByProvider)) {
        const providerIdNum = parseInt(provId);
        
        // Calculate total amount to pay
        let totalAmount = 0;
        for (const delivery of providerDeliveries) {
          // Only pay for delivered deliveries, not failed or cancelled
          if (delivery.status === 'delivered') {
            totalAmount += parseFloat(delivery.providerFee);
          }
        }

        // Create payment record
        const [payment] = await db.insert(deliveryPayments).values({
          providerId: providerIdNum,
          totalAmount: totalAmount.toString(),
          ordersCount: providerDeliveries.length,
          status: 'pending',
          dateRangeStart: startDate,
          dateRangeEnd: endDate,
          paymentReference: `PAY-${uuidv4().slice(0, 8)}`,
          notes: `Payment for ${providerDeliveries.length} deliveries from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
        }).returning();

        // Create payment items
        for (const delivery of providerDeliveries) {
          await db.insert(deliveryPaymentItems).values({
            paymentId: payment.id,
            deliveryOrderId: delivery.id,
            amount: delivery.status === 'delivered' ? delivery.providerFee : '0',
          });

          // Mark delivery as payment settled
          await db.update(deliveryOrders)
            .set({ paymentSettled: true })
            .where(eq(deliveryOrders.id, delivery.id));
        }

        results.push({
          providerId: providerIdNum,
          paymentId: payment.id,
          totalAmount,
          ordersCount: providerDeliveries.length,
        });
      }

      return results;
    } catch (error) {
      console.error('Error processing provider payments:', error);
      throw new Error(`Failed to process provider payments: ${(error as Error).message}`);
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: number,
    status: 'pending' | 'processing' | 'paid' | 'failed' | 'sent' | 'settled',
    notes?: string
  ) {
    try {
      const updateData: Partial<InsertDeliveryPayment> = {
        status,
        updatedAt: new Date(),
      };

      if (notes) {
        updateData.notes = notes;
      }

      if (status === 'paid' || status === 'settled') {
        updateData.paidAt = new Date();
      }

      await db.update(deliveryPayments)
        .set(updateData)
        .where(eq(deliveryPayments.id, paymentId));

      return true;
    } catch (error) {
      console.error(`Error updating payment status for payment ${paymentId}:`, error);
      throw new Error(`Failed to update payment status: ${(error as Error).message}`);
    }
  }

  /**
   * Get or create business delivery settings
   */
  async getOrCreateBusinessDeliverySettings(businessId: number): Promise<BusinessDeliverySetting> {
    try {
      // Try to get existing settings
      const [settings] = await db
        .select()
        .from(businessDeliverySettings)
        .where(eq(businessDeliverySettings.businessId, businessId));

      if (settings) {
        return settings;
      }

      // Create default settings if none exist
      const [newSettings] = await db.insert(businessDeliverySettings).values({
        businessId,
        isDeliveryEnabled: false,
        deliveryRadius: '5.0',
        minimumOrderValue: '10.00',
        platformFeePercentage: '0.15',
        platformFeeFixed: '1.00',
        // Get all provider IDs
        allowedProviders: Array.from(this.providerAdapters.keys()),
      }).returning();

      return newSettings;
    } catch (error) {
      console.error(`Error getting or creating business delivery settings for business ${businessId}:`, error);
      throw new Error(`Failed to get or create business delivery settings: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate distance between two coordinates
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    if (lat1 === 0 || lon1 === 0 || lat2 === 0 || lon2 === 0) {
      return 0;
    }

    const R = 3958.8; // Earth radius in miles
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in miles
    return Math.round(distance * 100) / 100;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const deliveryService = new DeliveryService();