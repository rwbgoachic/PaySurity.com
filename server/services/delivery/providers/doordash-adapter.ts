/**
 * DoorDash Drive API adapter for delivery
 * Documentation: https://developer.doordash.com/en-US/docs/drive
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
import { createHmac } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

interface DoorDashConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
}

export class DoorDashAdapter implements DeliveryProviderAdapter {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  
  constructor(config: DoorDashConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.baseUrl = config.baseUrl || 'https://openapi.doordash.com/drive/v2';
  }
  
  getName(): string {
    return 'DoorDash';
  }
  
  getProviderType(): 'internal' | 'external' {
    return 'external';
  }
  
  async getQuote(
    pickup: Address,
    delivery: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote> {
    if (!this.apiKey || !this.apiSecret) {
      return {
        providerId: 2, // DoorDash provider ID
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
        errors: ['DoorDash API credentials not configured']
      };
    }
    
    try {
      // Calculate distance between pickup and delivery locations
      const distance = this.calculateDistance(
        pickup.latitude || 0,
        pickup.longitude || 0,
        delivery.latitude || 0,
        delivery.longitude || 0
      );
      
      // Prepare the request payload for DoorDash quote
      const payload = {
        external_delivery_id: `QUOTE-${uuidv4()}`,
        pickup_address: this.formatAddressForDoorDash(pickup),
        pickup_phone_number: '+12345678901', // This would come from the merchant
        pickup_business_name: pickup.businessName || 'Restaurant',
        dropoff_address: this.formatAddressForDoorDash(delivery),
        dropoff_phone_number: '+12345678901', // This would come from the customer
        dropoff_contact_given_name: 'Customer', // This would come from the customer
        dropoff_contact_family_name: 'Name', // This would come from the customer
        order_value: Math.round(orderDetails.totalValue * 100)
      };
      
      // In a real implementation, we would make an API call to DoorDash
      // For now, we'll simulate the response
      
      // Simulate DoorDash fee calculation: $5 base + $2 per mile after first mile
      let fee = 5.00;
      if (distance > 1) {
        fee += (distance - 1) * 2.00;
      }
      
      // Round fee to 2 decimal places
      fee = Math.round(fee * 100) / 100;
      
      // Calculate pickup and delivery times
      const now = new Date();
      const estimatedPickupTime = new Date(now.getTime() + 20 * 60000); // 20 minutes from now
      const estimatedDeliveryTime = new Date(now.getTime() + (20 + distance * 8) * 60000); // Add 8 min per mile
      
      return {
        providerId: 2, // DoorDash provider ID
        providerName: this.getName(),
        fee: fee,
        customerFee: fee, // Customer pays the same as provider fee (platform fee added later)
        platformFee: 0, // Platform fee will be calculated by the delivery service
        currency: 'USD',
        estimatedPickupTime,
        estimatedDeliveryTime,
        distance,
        distanceUnit: 'miles',
        valid: true,
        validUntil: new Date(now.getTime() + 15 * 60000), // Valid for 15 minutes
      };
    } catch (error) {
      console.error('Failed to get DoorDash quote:', error);
      
      return {
        providerId: 2, // DoorDash provider ID
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
        errors: [(error as Error).message]
      };
    }
  }
  
  async createDelivery(
    orderDetails: DeliveryOrderDetails
  ): Promise<ExternalDeliveryOrder> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('DoorDash API credentials not configured');
    }
    
    // Generate a unique ID for this delivery
    const externalOrderId = `DOORDASH-${uuidv4()}`;
    
    try {
      // Prepare the request payload for DoorDash delivery creation
      const pickupTime = new Date();
      pickupTime.setMinutes(pickupTime.getMinutes() + 15); // 15 minutes from now
      
      const payload = {
        external_delivery_id: externalOrderId,
        pickup_address: this.formatAddressForDoorDash(orderDetails.businessAddress),
        pickup_phone_number: '+12345678901', // This would come from the merchant
        pickup_business_name: orderDetails.businessAddress.businessName || 'Restaurant',
        pickup_instructions: 'Ask for order #' + orderDetails.orderId,
        dropoff_address: this.formatAddressForDoorDash(orderDetails.customerAddress),
        dropoff_phone_number: orderDetails.customerPhone,
        dropoff_contact_given_name: orderDetails.customerName.split(' ')[0],
        dropoff_contact_family_name: orderDetails.customerName.split(' ').slice(1).join(' ') || 'Customer',
        dropoff_instructions: orderDetails.specialInstructions || 'Leave at the door',
        order_value: Math.round(orderDetails.orderDetails.totalValue * 100),
        pickup_time: pickupTime.toISOString(),
        pickup_window_duration: 15, // 15 minutes window
        dropoff_verification: 'PICTURE',
        order_contents: orderDetails.orderDetails.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          description: item.notes || undefined
        }))
      };
      
      // In a real implementation, we would make an API call to DoorDash
      // For now, we'll simulate the response
      
      // Calculate distance
      const distance = this.calculateDistance(
        orderDetails.businessAddress.latitude || 0,
        orderDetails.businessAddress.longitude || 0,
        orderDetails.customerAddress.latitude || 0,
        orderDetails.customerAddress.longitude || 0
      );
      
      const now = new Date();
      const estimatedPickupTime = new Date(now.getTime() + 20 * 60000); // 20 minutes from now
      const estimatedDeliveryTime = new Date(now.getTime() + (20 + distance * 8) * 60000); // Add 8 min per mile
      
      return {
        externalOrderId,
        status: 'pending',
        estimatedPickupTime,
        estimatedDeliveryTime,
        trackingUrl: `https://doordash.com/track/${externalOrderId}`,
        providerData: {
          fee: orderDetails.providerFee,
          currency: 'USD',
          distance,
          orderTotal: orderDetails.orderDetails.totalValue,
          doordashOrderId: `DD-${Math.floor(Math.random() * 1000000)}`,
        }
      };
    } catch (error) {
      console.error('Failed to create DoorDash delivery:', error);
      throw new Error(`Failed to create DoorDash delivery: ${(error as Error).message}`);
    }
  }
  
  async cancelDelivery(externalOrderId: string): Promise<boolean> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('DoorDash API credentials not configured');
    }
    
    try {
      // In a real implementation, we would make an API call to DoorDash
      // For now, we'll simulate the response
      return true;
    } catch (error) {
      console.error('Failed to cancel DoorDash delivery:', error);
      throw new Error(`Failed to cancel DoorDash delivery: ${(error as Error).message}`);
    }
  }
  
  async getDeliveryStatus(externalOrderId: string): Promise<DeliveryStatus> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('DoorDash API credentials not configured');
    }
    
    try {
      // In a real implementation, we would make an API call to DoorDash
      // For now, we'll simulate the response
      
      // Just return a random status for demonstration
      const statuses: DeliveryStatus[] = [
        'pending', 'accepted', 'assigned', 'picked_up',
        'in_transit', 'delivered', 'failed', 'cancelled'
      ];
      
      return 'pending';
    } catch (error) {
      console.error('Failed to get DoorDash delivery status:', error);
      throw new Error(`Failed to get DoorDash delivery status: ${(error as Error).message}`);
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
    if (!data.external_delivery_id) {
      throw new Error('Invalid webhook data: missing external_delivery_id');
    }
    
    // Map DoorDash statuses to our delivery statuses
    const statusMap: Record<string, DeliveryStatus> = {
      'created': 'pending',
      'accepted': 'accepted',
      'pickup_complete': 'picked_up',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'returned': 'failed',
      'delivery_attempted': 'failed',
      'delivery_failed': 'failed',
      'in_progress': 'in_transit'
    };
    
    let status: DeliveryStatus = statusMap[data.status] || 'pending';
    
    // Extract driver info if available
    const driverInfo = data.dasher ? {
      id: data.dasher.dasher_id,
      name: `${data.dasher.first_name} ${data.dasher.last_name}`,
      phone: data.dasher.phone_number,
      location: data.dasher.location,
    } : undefined;
    
    // Return the parsed data
    return {
      externalOrderId: data.external_delivery_id,
      status,
      driverInfo,
      timestamp: new Date(data.timestamp || Date.now()),
      additionalData: {
        actualPickupTime: data.pickup_time ? new Date(data.pickup_time) : undefined,
        actualDeliveryTime: data.delivered_time ? new Date(data.delivered_time) : undefined,
        doordashOrderId: data.doordash_order_id,
        failureReason: data.failure_reason,
        cancelReason: data.cancel_reason,
      }
    };
  }
  
  async verifyWebhookSignature(
    data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<boolean> {
    if (!headers['x-doordash-signature']) {
      return false;
    }
    
    const signature = headers['x-doordash-signature'];
    
    try {
      // DoorDash signatures are calculated by creating an HMAC SHA-256 of the payload
      // using the webhook secret as the key
      const hmac = createHmac('sha256', secret);
      const body = typeof data === 'string' ? data : JSON.stringify(data);
      hmac.update(body);
      const computedSignature = hmac.digest('hex');
      
      return signature === computedSignature;
    } catch (error) {
      console.error('Error verifying DoorDash webhook signature:', error);
      return false;
    }
  }
  
  private formatAddressForDoorDash(address: Address): string {
    // DoorDash requires a specific format for addresses
    const addressParts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country || 'USA'
    ].filter(Boolean);
    
    return addressParts.join(', ');
  }
  
  // Helper method to calculate distance between two coordinates
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