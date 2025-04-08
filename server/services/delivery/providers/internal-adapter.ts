/**
 * Internal delivery adapter for restaurant delivery staff
 */

import {
  DeliveryProviderAdapter,
  Address,
  OrderDetails,
  DeliveryQuote,
  DeliveryOrderDetails,
  ExternalDeliveryOrder,
  DeliveryStatus
} from '../interfaces';

/**
 * This adapter handles deliveries made by the restaurant's own delivery staff
 */
export class InternalDeliveryAdapter implements DeliveryProviderAdapter {
  getName(): string {
    return 'Restaurant Staff';
  }

  getProviderType(): 'internal' | 'external' {
    return 'internal';
  }

  async getQuote(
    pickup: Address,
    delivery: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote> {
    try {
      // Calculate distance between pickup and delivery
      let distance = 0;
      if (pickup.latitude && pickup.longitude && delivery.latitude && delivery.longitude) {
        distance = this.calculateDistance(
          pickup.latitude,
          pickup.longitude,
          delivery.latitude,
          delivery.longitude
        );
      }

      // Calculate base fee and per-mile charge (simplified version)
      const baseFee = 3.00; // Base delivery fee
      const feePerMile = 0.50; // Additional cost per mile
      const minFee = 5.00; // Minimum fee

      // Calculate delivery fee
      let fee = baseFee + (distance * feePerMile);
      fee = Math.max(fee, minFee); // Apply minimum fee
      fee = parseFloat(fee.toFixed(2)); // Round to 2 decimal places

      // Calculate platform fee (our commission)
      const platformFeePercent = 0.10; // 10% platform fee
      const platformFeeMinimum = 1.00; // Minimum $1 platform fee

      // Calculate platform fee (percentage-based with minimum)
      const platformFee = Math.max(fee * platformFeePercent, platformFeeMinimum);
      const roundedPlatformFee = parseFloat(platformFee.toFixed(2));

      // Total fee to customer
      const customerFee = parseFloat((fee + roundedPlatformFee).toFixed(2));

      // Calculate pickup and delivery times
      // For restaurant staff, assume preparation takes 15-20 minutes
      const preparationTime = 15; // minutes
      const now = new Date();
      
      // Pickup time: now + preparation time
      const pickupTime = new Date(now.getTime() + preparationTime * 60000);
      
      // Calculate approximate delivery time based on distance
      // Assume average speed of 20 mph for urban delivery
      // Formula: time in minutes = (distance in miles / speed in mph) * 60
      const avgSpeedMph = 20;
      const transitTimeMinutes = (distance / avgSpeedMph) * 60;
      
      // Add 5 minutes buffer for pickup process
      const totalDeliveryTimeMinutes = transitTimeMinutes + 5;
      const deliveryTime = new Date(pickupTime.getTime() + totalDeliveryTimeMinutes * 60000);

      // Return the delivery quote
      return {
        providerId: 1, // Internal provider ID
        providerName: this.getName(),
        fee: fee,
        customerFee: customerFee,
        platformFee: roundedPlatformFee,
        currency: 'USD',
        estimatedPickupTime: pickupTime,
        estimatedDeliveryTime: deliveryTime,
        distance: parseFloat(distance.toFixed(2)),
        distanceUnit: 'miles',
        valid: true,
        validUntil: new Date(now.getTime() + 30 * 60000), // Valid for 30 minutes
        providerData: {
          internalQuoteId: `internal_${Date.now()}`
        }
      };
    } catch (error) {
      console.error('Error generating internal delivery quote:', error);
      
      // Return an error quote
      return {
        providerId: 1,
        providerName: this.getName(),
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
        errors: [`Failed to generate internal delivery quote: ${(error as Error).message}`]
      };
    }
  }

  async createDelivery(
    orderDetails: DeliveryOrderDetails
  ): Promise<ExternalDeliveryOrder> {
    try {
      // Parse addresses if they're strings
      const pickupAddress = typeof orderDetails.businessAddress === 'string'
        ? JSON.parse(orderDetails.businessAddress)
        : orderDetails.businessAddress;
        
      const dropoffAddress = typeof orderDetails.customerAddress === 'string'
        ? JSON.parse(orderDetails.customerAddress)
        : orderDetails.customerAddress;
      
      // Calculate distance between pickup and delivery
      let distance = 0;
      if (pickupAddress.latitude && pickupAddress.longitude && 
          dropoffAddress.latitude && dropoffAddress.longitude) {
        distance = this.calculateDistance(
          pickupAddress.latitude,
          pickupAddress.longitude,
          dropoffAddress.latitude,
          dropoffAddress.longitude
        );
      }
      
      // Generate an internal order ID
      const internalOrderId = `internal_${Date.now()}_${orderDetails.orderId}`;
      
      // Calculate pickup and delivery times (similar to quote calculation)
      const preparationTime = 15; // minutes
      const now = new Date();
      
      // Pickup time: now + preparation time
      const pickupTime = new Date(now.getTime() + preparationTime * 60000);
      
      // Calculate approximate delivery time based on distance
      const avgSpeedMph = 20;
      const transitTimeMinutes = (distance / avgSpeedMph) * 60;
      
      // Add 5 minutes buffer for pickup process
      const totalDeliveryTimeMinutes = transitTimeMinutes + 5;
      const deliveryTime = new Date(pickupTime.getTime() + totalDeliveryTimeMinutes * 60000);
      
      // Initially, the status is 'pending' until assigned to a driver
      const status: DeliveryStatus = 'pending';
      
      // Return delivery order details
      return {
        externalOrderId: internalOrderId,
        status,
        estimatedPickupTime: pickupTime,
        estimatedDeliveryTime: deliveryTime,
        providerData: {
          orderId: orderDetails.orderId,
          distance: parseFloat(distance.toFixed(2)),
          fee: parseFloat(orderDetails.providerFee),
          platformFee: parseFloat(orderDetails.platformFee),
          customerFee: parseFloat(orderDetails.customerFee),
          specialInstructions: orderDetails.specialInstructions
        }
      };
    } catch (error) {
      console.error('Error creating internal delivery:', error);
      throw new Error(`Failed to create internal delivery: ${(error as Error).message}`);
    }
  }

  async cancelDelivery(externalOrderId: string): Promise<boolean> {
    try {
      // For internal delivery, we just need to update the status in our database
      // The actual implementation would involve notifying the driver
      // In a real scenario, this would connect to a driver notification system
      
      console.log(`Cancelled internal delivery order: ${externalOrderId}`);
      return true;
    } catch (error) {
      console.error('Error cancelling internal delivery:', error);
      return false;
    }
  }

  async getDeliveryStatus(externalOrderId: string): Promise<DeliveryStatus> {
    try {
      // In a real implementation, this would get the latest status from the driver app
      // For this example, we'll return a simulated status
      const statuses: DeliveryStatus[] = ['pending', 'accepted', 'assigned', 'picked_up', 'in_transit', 'delivered'];
      
      // Use the order ID to determine a pseudo-random but consistent status
      // This is just for simulation purposes
      const hash = this.simpleHash(externalOrderId);
      const statusIndex = hash % statuses.length;
      
      return statuses[statusIndex];
    } catch (error) {
      console.error('Error getting internal delivery status:', error);
      return 'pending'; // Default to pending if there's an error
    }
  }

  async parseWebhookData(
    data: any,
    headers: Record<string, string>
  ): Promise<{
    externalOrderId: string;
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
    try {
      // Validate the webhook data
      if (!data.order_id) {
        throw new Error('Invalid webhook data: missing order_id');
      }
      
      // Extract the status from the webhook data
      const status: DeliveryStatus = data.status || 'pending';
      
      // Extract the timestamp or use current time
      const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
      
      // Extract driver information if available
      let driverInfo;
      if (data.driver) {
        driverInfo = {
          id: data.driver.id,
          name: data.driver.name,
          phone: data.driver.phone
        };
        
        if (data.driver.location) {
          driverInfo.location = {
            latitude: data.driver.location.latitude,
            longitude: data.driver.location.longitude
          };
        }
      }
      
      return {
        externalOrderId: data.order_id,
        status,
        driverInfo,
        timestamp,
        additionalData: data
      };
    } catch (error) {
      console.error('Error parsing internal delivery webhook data:', error);
      throw new Error(`Failed to parse internal delivery webhook data: ${(error as Error).message}`);
    }
  }

  async verifyWebhookSignature(
    data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<boolean> {
    // For internal delivery, we might use a simpler authentication mechanism
    // This could be based on a shared secret or API key
    
    // Check if the provided API key header matches our secret
    const apiKey = headers['x-api-key'];
    return apiKey === secret;
  }

  /**
   * Helper method to calculate distance between two coordinates
   */
  private calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  /**
   * Simple hash function for simulation purposes
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}