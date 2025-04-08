/**
 * DoorDash Delivery Provider Adapter
 * 
 * This adapter integrates with DoorDash Drive API to provide delivery services
 * through DoorDash's delivery network.
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

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface DoorDashConfig {
  apiKey: string;
  apiSecret: string;
  developerId: string;
  webhookSecret?: string;
}

/**
 * Adapter for DoorDash Drive delivery API 
 */
export class DoorDashAdapter implements DeliveryProviderAdapter {
  private config: DoorDashConfig;
  private baseUrl = 'https://openapi.doordash.com/drive/v2';
  private tokenCache: { token: string; expires: number } | null = null;
  
  constructor(config: DoorDashConfig) {
    this.config = config;
  }
  
  getName(): string {
    return 'DoorDash';
  }
  
  getProviderType(): 'internal' | 'external' {
    return 'external';
  }
  
  /**
   * Get an authentication token for DoorDash API
   */
  private async getAuthToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    
    // Return cached token if it's still valid (expires in 20 min, refresh after 15 min)
    if (this.tokenCache && now < this.tokenCache.expires - 300) {
      return this.tokenCache.token;
    }
    
    try {
      // Generate JWT for authentication
      const expiresIn = 1800; // 30 minutes
      const payload = {
        aud: 'doordash',
        iss: this.config.developerId,
        kid: this.config.apiKey,
        exp: now + expiresIn,
        iat: now
      };
      
      const token = jwt.sign(payload, this.config.apiSecret, {
        algorithm: 'HS256',
        header: {
          'dd-ver': 'DD-JWT-V1'
        }
      });
      
      // Cache the token
      this.tokenCache = {
        token,
        expires: now + expiresIn
      };
      
      return token;
    } catch (error) {
      console.error('Error generating DoorDash auth token:', error);
      throw new Error('Failed to authenticate with DoorDash API');
    }
  }
  
  /**
   * Make an authenticated request to DoorDash API
   */
  private async makeRequest(endpoint: string, method: string, body?: any): Promise<any> {
    try {
      const token = await this.getAuthToken();
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`DoorDash API error ${response.status}: ${data.error?.message || JSON.stringify(data)}`);
      }
      
      return data;
    } catch (error) {
      console.error(`Error making DoorDash API request to ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Convert internal address format to DoorDash format
   */
  private formatAddress(address: Address): any {
    return {
      street: address.street,
      city: address.city,
      state: address.state,
      zip_code: address.postalCode,
      country: address.country || 'US',
      business_name: address.businessName || undefined,
      phone_number: address.phone || undefined,
      instructions: address.instructions || undefined,
      latitude: address.latitude,
      longitude: address.longitude,
      apartment_number: address.apartment || undefined,
      email: address.email || undefined
    };
  }
  
  /**
   * Calculate the straight-line distance between two coordinates (in miles)
   */
  private calculateDistance(
    lat1?: number, 
    lon1?: number, 
    lat2?: number, 
    lon2?: number
  ): number {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return 3.0; // Default distance if coordinates not provided
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
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  /**
   * Map DoorDash status to internal status
   */
  private mapDoorDashStatus(status: string): DeliveryStatus {
    const statusMap: { [key: string]: DeliveryStatus } = {
      'created': 'pending',
      'pickup_pending': 'accepted',
      'accepted': 'assigned',
      'arrived_at_pickup': 'assigned',
      'picked_up': 'picked_up',
      'delivered': 'delivered',
      'canceled': 'cancelled',
      'failed': 'failed',
      'returned': 'failed'
    };
    
    return statusMap[status] || 'pending';
  }
  
  async getQuote(
    pickup: Address,
    delivery: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote> {
    try {
      // Create a delivery quote request
      const quoteData = {
        pickup_address: this.formatAddress(pickup),
        dropoff_address: this.formatAddress(delivery),
        external_delivery_id: `quote_${Date.now()}`,
        items: orderDetails.items?.map(item => ({
          name: item.name,
          quantity: item.quantity,
          description: item.options?.join(', ') || undefined
        })) || [{name: 'Food order', quantity: 1}]
      };
      
      // Call DoorDash API to get quote
      const response = await this.makeRequest('/quotes', 'POST', quoteData);
      
      // Parse the response
      let estimatedPickupTime: Date;
      let estimatedDeliveryTime: Date;
      
      if (response.pickup_time) {
        estimatedPickupTime = new Date(response.pickup_time);
      } else {
        estimatedPickupTime = new Date(Date.now() + 15 * 60 * 1000); // Default: 15 min
      }
      
      if (response.dropoff_time) {
        estimatedDeliveryTime = new Date(response.dropoff_time);
      } else {
        estimatedDeliveryTime = new Date(Date.now() + 45 * 60 * 1000); // Default: 45 min
      }
      
      const distance = this.calculateDistance(
        pickup.latitude,
        pickup.longitude,
        delivery.latitude,
        delivery.longitude
      );
      
      const fee = response.fee ? parseFloat(response.fee.total) : 0;
      
      // Return standardized quote object
      return {
        providerId: 0, // Will be set by the delivery service
        providerName: this.getName(),
        fee,
        customerFee: fee * 1.1, // Add 10% markup for customer
        platformFee: fee * 0.1, // Platform fee is the 10% markup
        currency: 'USD',
        estimatedPickupTime,
        estimatedDeliveryTime,
        distance,
        distanceUnit: 'miles',
        valid: true,
        validUntil: new Date(Date.now() + 30 * 60 * 1000), // Valid for 30 min
        errors: [],
        providerData: {
          quoteId: response.quote_id
        }
      };
    } catch (error) {
      console.error('Error getting DoorDash delivery quote:', error);
      
      const now = new Date();
      return {
        providerId: 0, // Will be set by the delivery service
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
        errors: [(error as Error).message || 'Unknown error getting DoorDash quote']
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
      
      // Create the delivery request
      const deliveryData = {
        external_delivery_id: `dd-${orderDetails.businessId}-${orderDetails.orderId}-${Date.now()}`,
        pickup_address: this.formatAddress(businessAddress),
        dropoff_address: this.formatAddress(customerAddress),
        pickup_business_name: businessAddress.businessName || 'Restaurant',
        pickup_phone_number: businessAddress.phone || '',
        dropoff_phone_number: customerAddress.phone || orderDetails.customerPhone,
        dropoff_contact_given_name: orderDetails.customerName.split(' ')[0] || 'Customer',
        dropoff_contact_family_name: orderDetails.customerName.split(' ').slice(1).join(' ') || '',
        items: orderDetails.orderDetails.items?.map(item => ({
          name: item.name,
          quantity: item.quantity,
          description: item.options?.join(', ') || undefined
        })) || [{name: 'Food order', quantity: 1}],
        pickup_instructions: businessAddress.instructions || undefined,
        dropoff_instructions: customerAddress.instructions || orderDetails.specialInstructions,
        order_value: orderDetails.orderDetails.totalValue
      };
      
      // If we have a quote ID, use it
      if (orderDetails.providerQuoteId) {
        (deliveryData as any).quote_id = orderDetails.providerQuoteId;
      }
      
      // Call DoorDash API to create delivery
      const response = await this.makeRequest('/deliveries', 'POST', deliveryData);
      
      // Parse the response
      let estimatedPickupTime: Date;
      let estimatedDeliveryTime: Date;
      
      if (response.pickup_time) {
        estimatedPickupTime = new Date(response.pickup_time);
      } else {
        estimatedPickupTime = new Date(Date.now() + 15 * 60 * 1000); // Default: 15 min
      }
      
      if (response.dropoff_time) {
        estimatedDeliveryTime = new Date(response.dropoff_time);
      } else {
        estimatedDeliveryTime = new Date(Date.now() + 45 * 60 * 1000); // Default: 45 min
      }
      
      // Return standardized delivery object
      return {
        externalOrderId: response.external_delivery_id,
        status: this.mapDoorDashStatus(response.delivery_status),
        estimatedPickupTime,
        estimatedDeliveryTime,
        trackingUrl: response.tracking_url,
        providerData: {
          doorDashId: response.delivery_id
        }
      };
    } catch (error) {
      console.error('Error creating DoorDash delivery:', error);
      throw error;
    }
  }
  
  async cancelDelivery(externalOrderId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/deliveries/${externalOrderId}/cancel`, 'PUT');
      return true;
    } catch (error) {
      console.error(`Error cancelling DoorDash delivery ${externalOrderId}:`, error);
      return false;
    }
  }
  
  async getDeliveryStatus(externalOrderId: string): Promise<DeliveryStatus> {
    try {
      const response = await this.makeRequest(`/deliveries/${externalOrderId}`, 'GET');
      return this.mapDoorDashStatus(response.delivery_status);
    } catch (error) {
      console.error(`Error getting DoorDash delivery status for ${externalOrderId}:`, error);
      throw error;
    }
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
    try {
      const status = this.getStatusFromEvent(data.event_name, data.delivery_status);
      const timestamp = new Date(data.timestamp || Date.now());
      
      let driverInfo = undefined;
      
      // Extract driver info if available
      if (data.dasher) {
        driverInfo = {
          id: data.dasher.dasher_id,
          name: `${data.dasher.first_name || ''} ${data.dasher.last_name || ''}`.trim(),
          phone: data.dasher.phone_number
        };
        
        // Add location if available
        if (data.dasher.location) {
          driverInfo.location = {
            latitude: data.dasher.location.lat,
            longitude: data.dasher.location.lng,
            timestamp: new Date(data.dasher.location.timestamp || timestamp)
          };
        }
      }
      
      return {
        externalOrderId: data.delivery_id,
        status,
        driverInfo,
        timestamp,
        additionalData: data
      };
    } catch (error) {
      console.error('Error parsing DoorDash webhook data:', error);
      throw error;
    }
  }
  
  private getStatusFromEvent(event: string, status?: string): DeliveryStatus {
    if (status) {
      return this.mapDoorDashStatus(status);
    }
    
    const eventMap: { [key: string]: DeliveryStatus } = {
      'dasher.accepted': 'assigned',
      'delivery.pickup.pending': 'accepted',
      'dasher.arriving_pickup': 'assigned',
      'dasher.arrived_pickup': 'assigned',
      'dasher.picked_up': 'picked_up',
      'dasher.arriving_dropoff': 'in_transit',
      'dasher.arrived_dropoff': 'in_transit',
      'delivery.completed': 'delivered',
      'delivery.canceled': 'cancelled',
      'delivery.cancellation_requested': 'pending',
      'delivery.return.started': 'failed',
      'delivery.return.completed': 'failed',
      'delivery.failed': 'failed'
    };
    
    return eventMap[event] || 'pending';
  }
  
  async verifyWebhookSignature(
    data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<boolean> {
    try {
      if (!secret) {
        console.warn('DoorDash webhook signature verification skipped: No webhook secret provided');
        return true;
      }
      
      const signature = headers['doordash-signature'];
      if (!signature) {
        console.error('DoorDash webhook signature verification failed: No signature in headers');
        return false;
      }
      
      // DoorDash uses HMAC-SHA-256 for webhook signatures
      const hmac = crypto.createHmac('sha256', secret);
      const computedSignature = hmac.update(JSON.stringify(data)).digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(computedSignature)
      );
    } catch (error) {
      console.error('DoorDash webhook signature verification error:', error);
      return false;
    }
  }
}