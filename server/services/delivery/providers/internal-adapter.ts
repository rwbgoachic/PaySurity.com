/**
 * Internal Delivery Adapter
 * 
 * This adapter manages deliveries handled by the restaurant's own delivery staff.
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
import { v4 as uuidv4 } from 'uuid';
import { createHmac } from 'crypto';

export class InternalDeliveryAdapter implements DeliveryProviderAdapter {
  getName(): string {
    return 'Internal Delivery';
  }
  
  getProviderType(): 'internal' | 'external' {
    return 'internal';
  }
  
  async getQuote(
    pickup: Address,
    delivery: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote> {
    // Calculate distance between pickup and delivery locations
    const distance = this.calculateDistance(
      pickup.latitude || 0,
      pickup.longitude || 0,
      delivery.latitude || 0,
      delivery.longitude || 0
    );
    
    // Calculate base delivery fee
    let fee = 3.00; // Base fee
    
    // Add per-mile fee ($0.50 per mile after first mile)
    if (distance > 1) {
      fee += (distance - 1) * 0.50;
    }
    
    // Round fee to 2 decimal places
    fee = Math.round(fee * 100) / 100;
    
    // Calculate pickup and delivery times
    const now = new Date();
    const estimatedPickupTime = new Date(now.getTime() + 15 * 60000); // 15 minutes from now
    const estimatedDeliveryTime = new Date(now.getTime() + (15 + distance * 5) * 60000); // Add 5 min per mile
    
    return {
      providerId: 1, // Internal delivery provider ID
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
      validUntil: new Date(now.getTime() + 30 * 60000), // Valid for 30 minutes
    };
  }
  
  async createDelivery(
    orderDetails: DeliveryOrderDetails
  ): Promise<ExternalDeliveryOrder> {
    // Generate a unique ID for this delivery
    const externalOrderId = `INTERNAL-${uuidv4()}`;
    
    // Calculate the estimated pickup and delivery times
    const now = new Date();
    
    // Calculate distance
    const distance = this.calculateDistance(
      orderDetails.businessAddress.latitude || 0,
      orderDetails.businessAddress.longitude || 0,
      orderDetails.customerAddress.latitude || 0,
      orderDetails.customerAddress.longitude || 0
    );
    
    const estimatedPickupTime = new Date(now.getTime() + 15 * 60000); // 15 minutes from now
    const estimatedDeliveryTime = new Date(now.getTime() + (15 + distance * 5) * 60000); // Add 5 min per mile
    
    return {
      externalOrderId,
      status: 'pending',
      estimatedPickupTime,
      estimatedDeliveryTime,
      // We don't have driver info yet - it will be assigned later
      providerData: {
        internalDeliveryId: externalOrderId,
        createdAt: now.toISOString(),
        distance,
        orderTotal: orderDetails.orderDetails.totalValue,
        deliveryFee: orderDetails.providerFee,
      }
    };
  }
  
  async cancelDelivery(externalOrderId: string): Promise<boolean> {
    // For internal deliveries, just return true as we can always cancel them
    // In a real implementation, this would notify the driver and update internal systems
    return true;
  }
  
  async getDeliveryStatus(externalOrderId: string): Promise<DeliveryStatus> {
    // In a real implementation, this would fetch the status from an internal system
    // For now, we'll just return 'pending' which is the default for new deliveries
    return 'pending';
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
    // Validate the data
    if (!data.externalOrderId || !data.status) {
      throw new Error('Invalid webhook data: missing required fields');
    }
    
    // Map the status
    const validStatuses: DeliveryStatus[] = [
      'pending', 'accepted', 'assigned', 'picked_up',
      'in_transit', 'delivered', 'failed', 'cancelled'
    ];
    
    if (!validStatuses.includes(data.status)) {
      throw new Error(`Invalid status: ${data.status}`);
    }
    
    // Extract driver info if available
    const driverInfo = data.driver ? {
      id: data.driver.id,
      name: data.driver.name,
      phone: data.driver.phone,
      location: data.driver.location,
    } : undefined;
    
    // Return the parsed data
    return {
      externalOrderId: data.externalOrderId,
      status: data.status as DeliveryStatus,
      driverInfo,
      timestamp: new Date(data.timestamp || Date.now()),
      additionalData: {
        actualPickupTime: data.actualPickupTime,
        actualDeliveryTime: data.actualDeliveryTime,
        notes: data.notes,
      }
    };
  }
  
  async verifyWebhookSignature(
    data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<boolean> {
    // For internal deliveries, we can just verify the secret directly
    // In a real implementation, this would verify a signature in the headers
    
    if (!headers['x-internal-delivery-signature']) {
      return false;
    }
    
    const providedSignature = headers['x-internal-delivery-signature'];
    const calculatedSignature = this.calculateSignature(data, secret);
    
    return providedSignature === calculatedSignature;
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
  
  private calculateSignature(data: any, secret: string): string {
    const hmac = createHmac('sha256', secret);
    hmac.update(JSON.stringify(data));
    return hmac.digest('hex');
  }
}