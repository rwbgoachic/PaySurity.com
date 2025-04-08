/**
 * Internal Delivery Provider Adapter
 * 
 * This adapter manages deliveries done by the restaurant's own delivery staff.
 * It provides management of internal drivers and delivery logistics.
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

// Storage of delivery orders by ID for testing and demo purposes
// In a production environment, this would be stored in a database
const deliveryOrders = new Map<string, {
  orderId: string;
  status: DeliveryStatus;
  estimatedPickupTime: Date;
  estimatedDeliveryTime: Date;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
}>();

export class InternalDeliveryAdapter implements DeliveryProviderAdapter {
  getName(): string {
    return 'Restaurant Delivery';
  }
  
  getProviderType(): 'internal' | 'external' {
    return 'internal';
  }
  
  /**
   * Calculate a delivery fee based on distance (simplified)
   */
  private calculateDeliveryFee(distance: number): number {
    // Base fee of $2.50
    const baseFee = 2.5;
    
    // $0.75 per mile
    const distanceFee = distance * 0.75;
    
    // Total fee rounded to 2 decimal places
    return Math.round((baseFee + distanceFee) * 100) / 100;
  }
  
  /**
   * Calculate the approximate distance between two points
   * Using the Haversine formula for a rough estimate
   */
  private calculateDistance(pickup: Address, delivery: Address): number {
    // Default to 3 miles if coordinates are not provided
    if (!pickup.latitude || !pickup.longitude || !delivery.latitude || !delivery.longitude) {
      return 3.0;
    }
    
    // Haversine formula to calculate distance between two points on Earth
    const earthRadiusKm = 6371; // Radius of the Earth in km
    
    // Convert latitude and longitude from degrees to radians
    const lat1 = pickup.latitude * Math.PI / 180;
    const lon1 = pickup.longitude * Math.PI / 180;
    const lat2 = delivery.latitude * Math.PI / 180;
    const lon2 = delivery.longitude * Math.PI / 180;
    
    // Haversine formula
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1) * Math.cos(lat2) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = earthRadiusKm * c;
    
    // Convert km to miles and round to 2 decimal places
    return Math.round(distanceKm * 0.621371 * 100) / 100;
  }
  
  /**
   * Estimate delivery times based on distance and current time
   */
  private estimateDeliveryTimes(distance: number): {
    pickupTime: Date;
    deliveryTime: Date;
  } {
    const now = new Date();
    
    // Estimate preparation time: base 10 minutes + 5 minutes per 2 miles
    const prepMinutes = 10 + Math.floor(distance / 2) * 5;
    const pickupTime = new Date(now.getTime() + prepMinutes * 60 * 1000);
    
    // Estimate delivery time: pickup time + delivery travel time
    // Assume average speed of 20 mph, so it takes 3 minutes per mile
    const deliveryMinutes = distance * 3;
    const deliveryTime = new Date(pickupTime.getTime() + deliveryMinutes * 60 * 1000);
    
    return { pickupTime, deliveryTime };
  }
  
  /**
   * Get a delivery quote for the restaurant's delivery service
   */
  async getQuote(
    pickup: Address,
    delivery: Address,
    _orderDetails: OrderDetails
  ): Promise<DeliveryQuote> {
    try {
      // Calculate the distance between pickup and delivery
      const distance = this.calculateDistance(pickup, delivery);
      
      // Calculate the fee based on distance
      const fee = this.calculateDeliveryFee(distance);
      
      // Estimate pickup and delivery times
      const { pickupTime, deliveryTime } = this.estimateDeliveryTimes(distance);
      
      // Generate a quote ID for reference
      const quoteId = `internal-${Date.now()}`;
      
      // Quote expiration (valid for 30 minutes)
      const validUntil = new Date(Date.now() + 30 * 60 * 1000);
      
      return {
        providerId: 0, // Will be set by delivery service
        providerName: this.getName(),
        fee: fee,
        customerFee: fee * 1.2, // Add 20% for customer fee
        platformFee: fee * 0.2, // Platform fee is 20% of base fee
        currency: 'USD',
        estimatedPickupTime: pickupTime,
        estimatedDeliveryTime: deliveryTime,
        distance,
        distanceUnit: 'miles',
        valid: true,
        validUntil,
        errors: [],
        providerData: {
          quoteId
        }
      };
    } catch (error) {
      console.error('Error generating internal delivery quote:', error);
      
      return {
        providerId: 0,
        providerName: this.getName(),
        fee: 0,
        customerFee: 0,
        platformFee: 0,
        currency: 'USD',
        estimatedPickupTime: new Date(Date.now() + 15 * 60 * 1000),
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000),
        distance: 0,
        distanceUnit: 'miles',
        valid: false,
        validUntil: new Date(Date.now() + 5 * 60 * 1000),
        errors: [(error as Error).message || 'Internal service error']
      };
    }
  }
  
  /**
   * Create a delivery with the restaurant's delivery service
   */
  async createDelivery(
    orderDetails: DeliveryOrderDetails
  ): Promise<ExternalDeliveryOrder> {
    try {
      // Calculate distance between business and customer
      const distance = this.calculateDistance(
        orderDetails.businessAddress,
        orderDetails.customerAddress
      );
      
      // Estimate delivery times
      const { pickupTime, deliveryTime } = this.estimateDeliveryTimes(distance);
      
      // Create a unique delivery ID
      const deliveryId = `internal-${orderDetails.businessId}-${orderDetails.orderId}-${Date.now()}`;
      
      // Create initial delivery record (in a real app, this would be stored in the database)
      const deliveryRecord = {
        orderId: orderDetails.orderId,
        status: 'pending' as DeliveryStatus,
        estimatedPickupTime: pickupTime,
        estimatedDeliveryTime: deliveryTime,
      };
      
      // Store in memory for demo/testing purposes
      deliveryOrders.set(deliveryId, deliveryRecord);
      
      return {
        externalOrderId: deliveryId,
        status: 'pending',
        estimatedPickupTime: pickupTime,
        estimatedDeliveryTime: deliveryTime,
        providerData: {
          deliveryId,
          distance
        }
      };
    } catch (error) {
      console.error('Error creating internal delivery:', error);
      throw new Error(`Failed to create internal delivery: ${(error as Error).message}`);
    }
  }
  
  /**
   * Cancel an internal delivery
   */
  async cancelDelivery(externalOrderId: string): Promise<boolean> {
    try {
      const delivery = deliveryOrders.get(externalOrderId);
      
      if (!delivery) {
        return false;
      }
      
      // Update status to cancelled
      delivery.status = 'cancelled';
      deliveryOrders.set(externalOrderId, delivery);
      
      return true;
    } catch (error) {
      console.error(`Error cancelling internal delivery ${externalOrderId}:`, error);
      return false;
    }
  }
  
  /**
   * Get the current status of an internal delivery
   */
  async getDeliveryStatus(externalOrderId: string): Promise<DeliveryStatus> {
    try {
      const delivery = deliveryOrders.get(externalOrderId);
      
      if (!delivery) {
        throw new Error(`Delivery with ID ${externalOrderId} not found`);
      }
      
      return delivery.status;
    } catch (error) {
      console.error(`Error getting status for internal delivery ${externalOrderId}:`, error);
      throw new Error(`Failed to get internal delivery status: ${(error as Error).message}`);
    }
  }
  
  /**
   * Update the status of an internal delivery
   * This would typically be called by the delivery management app
   */
  updateDeliveryStatus(
    externalOrderId: string,
    status: DeliveryStatus,
    driverInfo?: {
      driverId: string;
      driverName: string;
      driverPhone?: string;
    }
  ): boolean {
    try {
      const delivery = deliveryOrders.get(externalOrderId);
      
      if (!delivery) {
        return false;
      }
      
      // Update status
      delivery.status = status;
      
      // Update driver info if provided
      if (driverInfo) {
        delivery.driverId = driverInfo.driverId;
        delivery.driverName = driverInfo.driverName;
        delivery.driverPhone = driverInfo.driverPhone;
      }
      
      // Save updates
      deliveryOrders.set(externalOrderId, delivery);
      
      return true;
    } catch (error) {
      console.error(`Error updating internal delivery status ${externalOrderId}:`, error);
      return false;
    }
  }
  
  /**
   * Parse webhook data (this would be a status update from the driver app)
   */
  async parseWebhookData(
    data: any,
    _headers: Record<string, string>
  ): Promise<{
    externalOrderId: string;
    status: DeliveryStatus;
    driverInfo?: any;
    timestamp: Date;
  }> {
    // For internal deliveries, this might come from the driver app
    const externalOrderId = data.deliveryId;
    const status = data.status as DeliveryStatus;
    const timestamp = new Date(data.timestamp || Date.now());
    
    // Extract driver information if available
    const driverInfo = data.driverInfo ? {
      id: data.driverInfo.id,
      name: data.driverInfo.name,
      phone: data.driverInfo.phone,
      location: data.driverInfo.location ? {
        latitude: data.driverInfo.location.latitude,
        longitude: data.driverInfo.location.longitude,
        timestamp: new Date(data.driverInfo.location.timestamp || timestamp)
      } : undefined
    } : undefined;
    
    // Update the status in our store
    if (externalOrderId && status && driverInfo) {
      // Format the driver info correctly, ensuring all required fields are strings
      const formattedDriverInfo = {
        driverId: String(driverInfo.id),
        driverName: String(driverInfo.name),
        driverPhone: driverInfo.phone ? String(driverInfo.phone) : undefined
      };
      this.updateDeliveryStatus(externalOrderId, status, formattedDriverInfo);
    }
    
    return {
      externalOrderId,
      status,
      driverInfo,
      timestamp
    };
  }
  
  /**
   * For internal webhooks, we would validate a shared secret or API key
   */
  async verifyWebhookSignature(
    _data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<boolean> {
    // Simple implementation: check for the secret in the Authorization header
    const authHeader = headers['authorization'];
    if (!authHeader) {
      return false;
    }
    
    // Expected format: "Bearer <secret>"
    const [bearer, token] = authHeader.split(' ');
    if (bearer.toLowerCase() !== 'bearer' || token !== secret) {
      return false;
    }
    
    return true;
  }
}