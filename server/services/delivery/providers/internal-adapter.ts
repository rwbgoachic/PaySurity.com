/**
 * Internal Delivery Provider Adapter
 * 
 * This adapter represents the restaurant's own delivery staff/drivers.
 * It allows businesses to manage their own delivery operations through
 * our platform without relying on external services.
 */

import {
  DeliveryProviderAdapter,
  Address,
  OrderDetails,
  DeliveryQuote,
  DeliveryOrderDetails,
  DeliveryStatus,
  ExternalDeliveryOrder
} from '../interfaces';

/**
 * Internal delivery service adapter for restaurants using their own drivers
 */
export class InternalDeliveryAdapter implements DeliveryProviderAdapter {
  private deliveries: Map<string, {
    status: DeliveryStatus;
    driverInfo?: {
      id?: string | number;
      name?: string;
      phone?: string;
      location?: {
        latitude: number;
        longitude: number;
        timestamp?: Date;
      }
    };
    notes?: string;
    createdAt: Date;
    estimatedPickupTime: Date;
    estimatedDeliveryTime: Date;
    lastUpdate: Date;
    businessAddress: Address;
    customerAddress: Address;
    orderDetails: OrderDetails;
  }> = new Map();
  
  getName(): string {
    return 'Restaurant Delivery';
  }
  
  getProviderType(): 'internal' | 'external' {
    return 'internal';
  }
  
  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1?: number, 
    lon1?: number, 
    lat2?: number, 
    lon2?: number
  ): number {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return 2.5; // Default distance if coordinates not provided
    }
    
    const R = 3958.8; // Radius of the earth in miles
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  /**
   * Estimate delivery time based on distance and traffic conditions
   */
  private estimateDeliveryTime(distance: number, pickupTime: Date): Date {
    // Basic calculation: 5 minutes base + 3 minutes per mile
    const deliveryMinutes = 5 + (distance * 3);
    
    return new Date(pickupTime.getTime() + deliveryMinutes * 60 * 1000);
  }
  
  /**
   * Calculate delivery fee based on distance and other factors
   */
  private calculateDeliveryFee(distance: number, orderValue: number): number {
    // Base fee + distance fee
    const baseFee = 2.99;
    const distanceFee = distance * 0.75;
    
    // Apply minimum fee
    let fee = Math.max(3.99, baseFee + distanceFee);
    
    // Discount for larger orders
    if (orderValue > 50) {
      fee *= 0.9; // 10% discount
    }
    if (orderValue > 100) {
      fee *= 0.9; // additional 10% discount (19% total)
    }
    
    // Round to 2 decimal places
    return Math.round(fee * 100) / 100;
  }
  
  async getQuote(
    pickup: Address,
    delivery: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote> {
    try {
      // Calculate distance
      const distance = this.calculateDistance(
        pickup.latitude,
        pickup.longitude,
        delivery.latitude,
        delivery.longitude
      );
      
      // Estimate pickup and delivery times
      const now = new Date();
      const estimatedPickupTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
      const estimatedDeliveryTime = this.estimateDeliveryTime(distance, estimatedPickupTime);
      
      // Calculate fee
      const fee = this.calculateDeliveryFee(distance, orderDetails.totalValue);
      
      // Return the quote
      return {
        providerId: 0, // Will be set by the delivery service
        providerName: this.getName(),
        fee,
        customerFee: fee, // Same fee shown to customer
        platformFee: 0, // No platform fee for internal delivery
        currency: orderDetails.currency || 'USD',
        estimatedPickupTime,
        estimatedDeliveryTime,
        distance,
        distanceUnit: 'miles',
        valid: true,
        validUntil: new Date(now.getTime() + 30 * 60 * 1000), // Valid for 30 minutes
        errors: []
      };
    } catch (error) {
      console.error('Error getting internal delivery quote:', error);
      
      const now = new Date();
      return {
        providerId: 0,
        providerName: this.getName(),
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
        errors: [(error as Error).message || 'Unknown error calculating delivery quote']
      };
    }
  }
  
  async createDelivery(
    orderDetails: DeliveryOrderDetails
  ): Promise<ExternalDeliveryOrder> {
    try {
      // Parse addresses if they're strings
      const businessAddress = typeof orderDetails.businessAddress === 'string'
        ? JSON.parse(orderDetails.businessAddress) as Address
        : orderDetails.businessAddress;
      
      const customerAddress = typeof orderDetails.customerAddress === 'string'
        ? JSON.parse(orderDetails.customerAddress) as Address
        : orderDetails.customerAddress;
      
      // Generate a unique ID for the delivery
      const externalOrderId = `int-${orderDetails.businessId}-${orderDetails.orderId}-${Date.now()}`;
      
      // Calculate distance
      const distance = this.calculateDistance(
        businessAddress.latitude,
        businessAddress.longitude,
        customerAddress.latitude,
        customerAddress.longitude
      );
      
      // Estimate pickup and delivery times
      const now = new Date();
      const estimatedPickupTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
      const estimatedDeliveryTime = this.estimateDeliveryTime(distance, estimatedPickupTime);
      
      // Store the delivery in our internal map
      this.deliveries.set(externalOrderId, {
        status: 'pending',
        createdAt: now,
        estimatedPickupTime,
        estimatedDeliveryTime,
        lastUpdate: now,
        businessAddress,
        customerAddress,
        orderDetails: orderDetails.orderDetails
      });
      
      // Return delivery information
      return {
        externalOrderId,
        status: 'pending',
        estimatedPickupTime,
        estimatedDeliveryTime,
        trackingUrl: `/delivery/track/${externalOrderId}`,
        providerData: {
          distance,
          createdAt: now
        }
      };
    } catch (error) {
      console.error('Error creating internal delivery:', error);
      throw error;
    }
  }
  
  async cancelDelivery(externalOrderId: string): Promise<boolean> {
    const delivery = this.deliveries.get(externalOrderId);
    
    if (!delivery) {
      return false;
    }
    
    // Only allow cancellation for certain statuses
    if (['delivered', 'failed', 'cancelled'].includes(delivery.status)) {
      return false;
    }
    
    // Update the delivery status
    delivery.status = 'cancelled';
    delivery.lastUpdate = new Date();
    this.deliveries.set(externalOrderId, delivery);
    
    return true;
  }
  
  async getDeliveryStatus(externalOrderId: string): Promise<DeliveryStatus> {
    const delivery = this.deliveries.get(externalOrderId);
    
    if (!delivery) {
      throw new Error(`Delivery with ID ${externalOrderId} not found`);
    }
    
    return delivery.status;
  }
  
  async parseWebhookData(
    data: any,
    _headers: Record<string, string>
  ): Promise<{
    externalOrderId: string;
    status: DeliveryStatus;
    driverInfo?: any;
    timestamp: Date;
    additionalData?: any;
  }> {
    // Internal provider doesn't receive webhooks, but implements interface for consistency
    const status = data.status as DeliveryStatus || 'pending';
    const timestamp = new Date(data.timestamp || Date.now());
    
    return {
      externalOrderId: data.externalOrderId,
      status,
      driverInfo: data.driverInfo,
      timestamp,
      additionalData: data
    };
  }
  
  async verifyWebhookSignature(
    _data: any,
    _headers: Record<string, string>,
    _secret: string
  ): Promise<boolean> {
    // Internal provider doesn't need webhook signature verification
    return true;
  }
  
  /**
   * Internal-specific method to update delivery status from the driver app
   */
  async updateDeliveryStatus(
    externalOrderId: string,
    status: DeliveryStatus,
    driverInfo?: any,
    notes?: string
  ): Promise<boolean> {
    const delivery = this.deliveries.get(externalOrderId);
    
    if (!delivery) {
      return false;
    }
    
    // Update the delivery
    delivery.status = status;
    delivery.lastUpdate = new Date();
    
    if (driverInfo) {
      delivery.driverInfo = {
        ...delivery.driverInfo,
        ...driverInfo
      };
    }
    
    if (notes) {
      delivery.notes = notes;
    }
    
    // Store the updated delivery
    this.deliveries.set(externalOrderId, delivery);
    
    return true;
  }
  
  /**
   * Internal-specific method to assign a driver to a delivery
   */
  async assignDriver(
    externalOrderId: string,
    driverId: string | number,
    driverName: string,
    driverPhone: string
  ): Promise<boolean> {
    const delivery = this.deliveries.get(externalOrderId);
    
    if (!delivery) {
      return false;
    }
    
    // Assign the driver
    delivery.driverInfo = {
      id: driverId,
      name: driverName,
      phone: driverPhone
    };
    
    // Update status to assigned if it's still pending
    if (delivery.status === 'pending') {
      delivery.status = 'assigned';
    }
    
    delivery.lastUpdate = new Date();
    this.deliveries.set(externalOrderId, delivery);
    
    return true;
  }
  
  /**
   * Internal-specific method to update driver location
   */
  async updateDriverLocation(
    externalOrderId: string,
    latitude: number,
    longitude: number
  ): Promise<boolean> {
    const delivery = this.deliveries.get(externalOrderId);
    
    if (!delivery || !delivery.driverInfo) {
      return false;
    }
    
    // Update driver location
    delivery.driverInfo.location = {
      latitude,
      longitude,
      timestamp: new Date()
    };
    
    delivery.lastUpdate = new Date();
    this.deliveries.set(externalOrderId, delivery);
    
    return true;
  }
  
  /**
   * Internal-specific method to get full delivery details
   */
  async getDeliveryDetails(externalOrderId: string): Promise<any> {
    const delivery = this.deliveries.get(externalOrderId);
    
    if (!delivery) {
      throw new Error(`Delivery with ID ${externalOrderId} not found`);
    }
    
    return {
      id: externalOrderId,
      ...delivery
    };
  }
}