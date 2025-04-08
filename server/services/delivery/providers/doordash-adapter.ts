/**
 * DoorDash delivery adapter
 * 
 * This adapter integrates with DoorDash Drive API for external deliveries
 * Documentation: https://developer.doordash.com/en-US/api/drive
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

// For JWT authentication
import jwt from 'jsonwebtoken';

// Configuration for DoorDash Drive API
interface DoorDashConfig {
  apiKey: string;
  apiSecret: string;
  developerId?: string;
}

// Address format required by DoorDash API
interface DoorDashAddressInfo {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  business_name?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  instructions?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * DoorDash API integration for external deliveries
 */
export class DoorDashAdapter implements DeliveryProviderAdapter {
  private apiKey: string;
  private apiSecret: string;
  private developerId?: string;
  private apiBaseUrl = 'https://openapi.doordash.com/drive/v2';
  
  constructor(config: DoorDashConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.developerId = config.developerId;
    
    // Validate configuration
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('DoorDash adapter requires API key and secret');
    }
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
    try {
      // Calculate distance for estimation purposes
      const distance = this.calculateDistance(
        pickup.latitude || 0,
        pickup.longitude || 0,
        delivery.latitude || 0,
        delivery.longitude || 0
      );
      
      const token = this.generateJwt();
      
      // Format addresses for DoorDash API
      const pickupAddress = this.formatAddress(pickup, true);
      const deliveryAddress = this.formatAddress(delivery, false);
      
      // Current time in ISO format
      const now = new Date();
      
      // DoorDash quote request body
      const quoteRequest = {
        external_delivery_id: `quote-${orderDetails.orderId}-${Date.now()}`,
        locale: "en-US",
        order_value: Math.round(orderDetails.totalValue * 100), // In cents
        currency: orderDetails.currency || 'USD',
        pickup_address: pickupAddress,
        dropoff_address: deliveryAddress,
        pickup_time: new Date(now.getTime() + 15 * 60000).toISOString(), // 15 min from now
        dropoff_time: new Date(now.getTime() + 60 * 60000).toISOString(), // 1 hour from now
        contact_info: {
          first_name: "Business",
          last_name: "Owner",
          phone_number: pickup.phone || "555-555-5555",
          business_name: pickup.businessName || "Restaurant"
        },
        items: orderDetails.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          description: item.options ? item.options.join(', ') : undefined
        }))
      };
      
      // In a real implementation, we would call the DoorDash API here:
      // const response = await fetch(`${this.apiBaseUrl}/quotes`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //     'Accept': 'application/json'
      //   },
      //   body: JSON.stringify(quoteRequest)
      // });
      
      // const quoteResponse = await response.json();
      
      // For demo purposes, we'll simulate a response
      // In production, use the actual API response
      
      // Simulate DoorDash fee calculation
      let baseFee = 7.50; // Base delivery fee
      if (distance > 0) {
        // Add $2.00 per mile
        baseFee += distance * 2.00;
      }
      
      // Round to 2 decimal places
      baseFee = Math.round(baseFee * 100) / 100;
      
      // Platform fee (15% of delivery fee)
      const platformFee = Math.round(baseFee * 0.15 * 100) / 100;
      
      // Customer pays delivery fee + platform fee
      const customerFee = baseFee + platformFee;
      
      // Estimate pickup and delivery times
      const estimatedPickupTime = new Date(now.getTime() + 20 * 60000); // 20 minutes from now
      const estimatedDeliveryTime = new Date(now.getTime() + (45 + distance * 3) * 60000); // Base 45 min + 3 min per mile
      
      return {
        providerId: 2, // ID for DoorDash provider
        providerName: this.getName(),
        fee: baseFee,
        customerFee,
        platformFee,
        currency: orderDetails.currency || 'USD',
        estimatedPickupTime,
        estimatedDeliveryTime,
        distance,
        distanceUnit: 'miles',
        valid: true,
        validUntil: new Date(now.getTime() + 15 * 60000), // Valid for 15 minutes
        providerData: {
          // This would contain the raw DoorDash response in production
          externalDeliveryId: quoteRequest.external_delivery_id
        }
      };
    } catch (error) {
      console.error('Error getting DoorDash delivery quote:', error);
      throw error;
    }
  }
  
  async createDelivery(
    orderDetails: DeliveryOrderDetails
  ): Promise<ExternalDeliveryOrder> {
    try {
      const token = this.generateJwt();
      
      // Parse addresses if they're strings
      const businessAddress = typeof orderDetails.businessAddress === 'string'
        ? JSON.parse(orderDetails.businessAddress) as Address
        : orderDetails.businessAddress;
      
      const customerAddress = typeof orderDetails.customerAddress === 'string'
        ? JSON.parse(orderDetails.customerAddress) as Address
        : orderDetails.customerAddress;
      
      // Calculate distance
      const distance = this.calculateDistance(
        businessAddress.latitude || 0,
        businessAddress.longitude || 0,
        customerAddress.latitude || 0,
        customerAddress.longitude || 0
      );
      
      // Format addresses for DoorDash API
      const pickupAddress = this.formatAddress(businessAddress, true);
      const deliveryAddress = this.formatAddress(customerAddress, false);
      
      // Generate unique delivery ID
      const externalDeliveryId = `dd-${orderDetails.businessId}-${orderDetails.orderId}-${Date.now()}`;
      
      // Current time
      const now = new Date();
      
      // Calculate estimated times
      const pickupTime = new Date(now.getTime() + 20 * 60000); // 20 minutes from now
      const deliveryTime = new Date(now.getTime() + (45 + distance * 3) * 60000); // Base 45 min + 3 min per mile
      
      // DoorDash delivery request body
      const deliveryRequest = {
        external_delivery_id: externalDeliveryId,
        locale: "en-US",
        order_value: parseInt(orderDetails.orderDetails.totalValue.toString()) * 100, // In cents
        currency: orderDetails.orderDetails.currency || 'USD',
        pickup_address: pickupAddress,
        dropoff_address: deliveryAddress,
        pickup_phone_number: businessAddress.phone || "555-555-5555",
        pickup_business_name: businessAddress.businessName || "Restaurant",
        pickup_instructions: businessAddress.instructions || "Please go to the pickup counter",
        dropoff_phone_number: customerAddress.phone || orderDetails.customerPhone,
        dropoff_instructions: customerAddress.instructions || "Please leave at door",
        customer_name: orderDetails.customerName,
        payment_details: {
          payment_method: "credit_card",
          fee: parseFloat(orderDetails.providerFee) * 100, // In cents
          tip: 0 // No tip as it's a business delivery
        },
        items: orderDetails.orderDetails.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          description: item.options ? item.options.join(', ') : undefined
        }))
      };
      
      // In a real implementation, we would call the DoorDash API here:
      // const response = await fetch(`${this.apiBaseUrl}/deliveries`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //     'Accept': 'application/json'
      //   },
      //   body: JSON.stringify(deliveryRequest)
      // });
      
      // const deliveryResponse = await response.json();
      
      // For demo purposes, we'll simulate a response
      // In production, use the actual API response
      
      return {
        externalOrderId: externalDeliveryId,
        status: 'pending',
        estimatedPickupTime: pickupTime,
        estimatedDeliveryTime: deliveryTime,
        trackingUrl: `https://doordash.com/tracking/${externalDeliveryId}`,
        providerData: {
          // This would contain the raw DoorDash response in production
          request: deliveryRequest
        }
      };
    } catch (error) {
      console.error('Error creating DoorDash delivery:', error);
      throw new Error(`Failed to create DoorDash delivery: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async cancelDelivery(externalOrderId: string): Promise<boolean> {
    try {
      const token = this.generateJwt();
      
      // In a real implementation, we would call the DoorDash API here:
      // const response = await fetch(`${this.apiBaseUrl}/deliveries/${externalOrderId}/cancel`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //     'Accept': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     reason: "merchant_request"
      //   })
      // });
      
      // Check response status
      // return response.ok;
      
      // For demo purposes, always return true
      // In production, use the actual API response
      
      // Special case for test IDs
      if (externalOrderId.startsWith('test-dd-fail-')) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error cancelling DoorDash delivery:', error);
      return false;
    }
  }
  
  async getDeliveryStatus(externalOrderId: string): Promise<DeliveryStatus> {
    try {
      const token = this.generateJwt();
      
      // In a real implementation, we would call the DoorDash API here:
      // const response = await fetch(`${this.apiBaseUrl}/deliveries/${externalOrderId}`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Accept': 'application/json'
      //   }
      // });
      
      // const deliveryData = await response.json();
      // return this.mapDoorDashStatus(deliveryData.status);
      
      // For demo purposes, return a status based on the order ID pattern
      // In production, use the actual API response
      
      // Special case for test IDs
      if (externalOrderId.startsWith('test-dd-')) {
        const status = externalOrderId.split('test-dd-')[1];
        return status as DeliveryStatus;
      }
      
      // If this is a generated DD ID with timestamp, use elapsed time to determine status
      if (externalOrderId.startsWith('dd-')) {
        const parts = externalOrderId.split('-');
        const timestamp = parts[parts.length - 1];
        
        if (!timestamp) {
          return 'pending';
        }
        
        const createdTime = parseInt(timestamp);
        const now = Date.now();
        const minutesElapsed = (now - createdTime) / 60000;
        
        if (minutesElapsed < 3) return 'pending';
        if (minutesElapsed < 7) return 'accepted';
        if (minutesElapsed < 12) return 'assigned';
        if (minutesElapsed < 18) return 'picked_up';
        if (minutesElapsed < 35) return 'in_transit';
        return 'delivered';
      }
      
      // Default status if pattern doesn't match
      return 'pending';
    } catch (error) {
      console.error('Error getting DoorDash delivery status:', error);
      return 'pending';
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
      // Validate the data structure
      if (!data || !data.event_type || !data.external_delivery_id) {
        throw new Error('Invalid webhook data format');
      }
      
      // Map DoorDash event type to our status
      let status: DeliveryStatus = 'pending';
      
      switch (data.event_type) {
        case 'DELIVERY_CREATED':
          status = 'pending';
          break;
        case 'DELIVERY_PICKUP_READY':
        case 'DELIVERY_PICKUP_COMPLETE':
          status = 'picked_up';
          break;
        case 'DASHER_CREATED':
        case 'DASHER_ASSIGNED':
          status = 'assigned';
          break;
        case 'DASHER_ENROUTE_TO_PICKUP':
          status = 'accepted';
          break;
        case 'DASHER_ENROUTE_TO_DROPOFF':
          status = 'in_transit';
          break;
        case 'DELIVERY_COMPLETE':
          status = 'delivered';
          break;
        case 'DELIVERY_CANCELLED':
          status = 'cancelled';
          break;
        case 'DELIVERY_FAILED':
          status = 'failed';
          break;
        default:
          status = 'pending';
      }
      
      // Extract driver info if available
      const driverInfo = data.dasher ? {
        id: data.dasher.id,
        name: `${data.dasher.first_name || ''} ${data.dasher.last_name || ''}`.trim(),
        phone: data.dasher.phone_number,
        location: data.dasher.location ? {
          latitude: data.dasher.location.lat,
          longitude: data.dasher.location.lng
        } : undefined
      } : undefined;
      
      // Create timestamp
      const timestamp = data.event_timestamp 
        ? new Date(data.event_timestamp) 
        : new Date();
      
      return {
        externalOrderId: data.external_delivery_id,
        status,
        driverInfo,
        timestamp,
        additionalData: data
      };
    } catch (error) {
      console.error('Error parsing DoorDash webhook data:', error);
      throw new Error(`Failed to parse webhook data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async verifyWebhookSignature(
    data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<boolean> {
    try {
      // DoorDash webhook verification
      const signature = headers['doordash-signature'];
      if (!signature) {
        return false;
      }
      
      // In production, validate the signature cryptographically
      // This would use HMAC with SHA-256 or similar
      
      // For demo purposes, simulate signature verification
      // In production, use proper cryptographic verification
      
      // Special case for testing (signature should be 'valid' or 'invalid')
      if (signature === 'invalid') {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying DoorDash webhook signature:', error);
      return false;
    }
  }
  
  /**
   * Generate JWT token for DoorDash API authentication
   */
  private generateJwt(): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      aud: 'doordash',
      iss: this.developerId || 'paysurity',
      kid: this.apiKey,
      exp: now + 3600, // Token valid for 1 hour
      iat: now
    };
    
    return jwt.sign(payload, this.apiSecret, { algorithm: 'HS256' });
  }
  
  /**
   * Format address for DoorDash API
   */
  private formatAddress(address: Address, isBusinessAddress: boolean): DoorDashAddressInfo {
    const formattedAddress: DoorDashAddressInfo = {
      street: address.street,
      city: address.city,
      state: address.state,
      zip_code: address.postalCode,
      country: address.country || 'US',
      latitude: address.latitude,
      longitude: address.longitude,
      instructions: address.instructions
    };
    
    if (isBusinessAddress && address.businessName) {
      formattedAddress.business_name = address.businessName;
    } else if (!isBusinessAddress) {
      // For customer addresses, split the name into first and last name
      const nameParts = address.businessName ? 
        address.businessName.split(' ') : 
        ['Customer', ''];
      
      formattedAddress.first_name = nameParts[0];
      formattedAddress.last_name = nameParts.slice(1).join(' ');
    }
    
    if (address.phone) {
      formattedAddress.phone_number = address.phone;
    }
    
    return formattedAddress;
  }
  
  /**
   * Map DoorDash status to our status
   */
  private mapDoorDashStatus(ddStatus: string): DeliveryStatus {
    // Map DoorDash-specific status values to our standard statuses
    switch (ddStatus) {
      case 'created':
        return 'pending';
      case 'accepted':
        return 'accepted';
      case 'pickup_ready':
      case 'pickup_complete':
        return 'picked_up';
      case 'enroute_to_pickup':
        return 'assigned';
      case 'enroute_to_dropoff':
        return 'in_transit';
      case 'delivered':
        return 'delivered';
      case 'cancelled':
        return 'cancelled';
      case 'failed':
        return 'failed';
      default:
        return 'pending';
    }
  }
  
  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    if (lat1 === 0 && lon1 === 0 && lat2 === 0 && lon2 === 0) {
      return 0;
    }
    
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}