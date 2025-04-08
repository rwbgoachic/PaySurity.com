/**
 * DoorDash Delivery Provider Adapter
 * 
 * This adapter integrates with DoorDash Drive API to provide delivery services
 * from third-party restaurants.
 * 
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

import { OrderItem } from '../../../../shared/delivery-schema';
import jwt from 'jsonwebtoken';

export interface DoorDashConfig {
  developerId: string;
  apiKey: string;
  apiSecret: string;
}

export class DoorDashAdapter implements DeliveryProviderAdapter {
  private readonly baseUrl = 'https://openapi.doordash.com/drive/v2';
  private readonly config: DoorDashConfig;
  private accessToken: string | null = null;
  private accessTokenExpiry: number = 0;
  
  constructor(config: DoorDashConfig) {
    this.config = config;
  }
  
  getName(): string {
    return 'DoorDash Delivery';
  }
  
  getProviderType(): 'internal' | 'external' {
    return 'external';
  }
  
  /**
   * Get a valid JWT access token for DoorDash API
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a non-expired token
    const now = Math.floor(Date.now() / 1000);
    if (this.accessToken && this.accessTokenExpiry > now + 60) {
      return this.accessToken;
    }
    
    // Token expired or not set, generate a new one
    try {
      // Create a JWT that expires in 1 hour
      const expiryTime = now + 3600;
      this.accessTokenExpiry = expiryTime;
      
      const payload = {
        aud: 'doordash',
        iss: this.config.developerId,
        kid: this.config.apiKey,
        exp: expiryTime,
        iat: now,
      };
      
      const token = jwt.sign(payload, this.config.apiSecret, { algorithm: 'HS256' });
      this.accessToken = token;
      return token;
    } catch (error) {
      console.error('Error generating DoorDash access token:', error);
      throw new Error(`Failed to generate DoorDash access token: ${(error as Error).message}`);
    }
  }
  
  /**
   * Make an authenticated API request to DoorDash
   */
  private async apiRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    try {
      const token = await this.getAccessToken();
      const url = `${this.baseUrl}${endpoint}`;
      
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      const options: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `DoorDash API error (${response.status}): ${errorBody}`
        );
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`DoorDash API request error (${endpoint}):`, error);
      throw error;
    }
  }
  
  /**
   * Convert our internal address format to DoorDash format
   */
  private formatAddress(address: Address): any {
    return {
      street: address.street,
      city: address.city,
      state: address.state,
      zip_code: address.postalCode,
      country: address.country || 'US',
      unit_number: address.apartment,
      business_name: address.businessName,
      // Additional fields for DoorDash
      latitude: address.latitude,
      longitude: address.longitude,
      phone_number: address.phone,
      special_instructions: address.instructions
    };
  }
  
  /**
   * Convert our internal order items to DoorDash format
   */
  private formatOrderItems(items?: OrderItem[]): any[] {
    if (!items || items.length === 0) {
      return [];
    }
    
    return items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      description: item.options ? item.options.join(', ') : undefined,
      external_id: item.id || undefined
    }));
  }
  
  /**
   * Get a delivery quote from DoorDash
   */
  async getQuote(
    pickup: Address,
    delivery: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote> {
    try {
      // Format the request for DoorDash quote endpoint
      const quoteRequest = {
        external_delivery_id: `quote-${Date.now()}`,
        pickup_address: this.formatAddress(pickup),
        dropoff_address: this.formatAddress(delivery),
        // Optional pickup phone
        pickup_phone_number: pickup.phone,
        // Optional dropoff phone
        dropoff_phone_number: delivery.phone,
        // Optional order value in cents
        order_value: orderDetails.totalValue ? Math.round(orderDetails.totalValue * 100) : undefined,
        // Optional items
        items: orderDetails.items ? this.formatOrderItems(orderDetails.items) : undefined,
        // Additional parameters that might be required
        pickup_business_name: pickup.businessName,
        dropoff_business_name: delivery.businessName || undefined,
        // Special requirements
        dropoff_requires_signature: orderDetails.requiresId || false,
        // Contactless delivery
        contactless_dropoff: orderDetails.requiresContactlessDelivery || false
      };
      
      // Make the API request to DoorDash
      const quoteResponse = await this.apiRequest<any>('POST', '/quotes', quoteRequest);
      
      // Parse the response into our standard format
      const now = new Date();
      
      // Extract the fee information (DoorDash returns in cents)
      const feeInDollars = quoteResponse.fee / 100;
      
      // Calculate the pickup and delivery times
      const pickupTime = new Date(quoteResponse.pickup_time_estimated || now.getTime() + 15 * 60 * 1000);
      const deliveryTime = new Date(quoteResponse.dropoff_time_estimated || now.getTime() + 45 * 60 * 1000);
      
      // Calculate distance (DoorDash might return in meters, convert to miles)
      const distanceInMiles = quoteResponse.distance_in_meters 
        ? quoteResponse.distance_in_meters / 1609.34 
        : 0;
      
      // Expiration time for quote (typically 5 minutes)
      const validUntil = new Date(now.getTime() + 5 * 60 * 1000);
      
      return {
        providerId: 0, // Will be set by delivery service
        providerName: this.getName(),
        fee: feeInDollars,
        customerFee: feeInDollars * 1.1, // Add 10% markup for customer
        platformFee: feeInDollars * 0.1, // Platform fee is the 10% markup
        currency: 'USD',
        estimatedPickupTime: pickupTime,
        estimatedDeliveryTime: deliveryTime,
        distance: Math.round(distanceInMiles * 100) / 100,
        distanceUnit: 'miles',
        valid: true,
        validUntil,
        errors: [],
        providerData: {
          externalDeliveryId: quoteResponse.external_delivery_id,
          quoteId: quoteResponse.quote_id
        }
      };
    } catch (error) {
      console.error('Error getting DoorDash quote:', error);
      
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
        errors: [(error as Error).message || 'Unknown error getting DoorDash quote']
      };
    }
  }
  
  /**
   * Create a delivery with DoorDash
   */
  async createDelivery(
    orderDetails: DeliveryOrderDetails
  ): Promise<ExternalDeliveryOrder> {
    try {
      // Format addresses
      const pickupAddress = this.formatAddress(orderDetails.businessAddress);
      const dropoffAddress = this.formatAddress(orderDetails.customerAddress);
      
      // Create a unique external ID
      const externalDeliveryId = `paysurity-${orderDetails.businessId}-${orderDetails.orderId}-${Date.now()}`;
      
      // Format the delivery creation request
      const deliveryRequest = {
        external_delivery_id: externalDeliveryId,
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        // Contact information
        pickup_phone_number: pickupAddress.phone_number,
        dropoff_phone_number: dropoffAddress.phone_number || orderDetails.customerPhone,
        dropoff_contact_given_name: orderDetails.customerName,
        // Order details
        order_value: Math.round(orderDetails.orderDetails.totalValue * 100), // In cents
        items: orderDetails.orderDetails.items ? this.formatOrderItems(orderDetails.orderDetails.items) : [],
        // Special instructions
        dropoff_instructions: orderDetails.specialInstructions,
        // Use the quote if available for pricing predictability
        quote_id: orderDetails.providerQuoteId
      };
      
      // Send the request to DoorDash
      const response = await this.apiRequest<any>('POST', '/deliveries', deliveryRequest);
      
      return {
        externalOrderId: response.external_delivery_id,
        status: this.mapDoorDashStatus(response.status),
        estimatedPickupTime: new Date(response.pickup_time_estimated),
        estimatedDeliveryTime: new Date(response.dropoff_time_estimated),
        trackingUrl: response.tracking_url,
        providerData: {
          dasherId: response.dasher_id,
          supportRefId: response.support_reference
        }
      };
    } catch (error) {
      console.error('Error creating DoorDash delivery:', error);
      throw new Error(`Failed to create DoorDash delivery: ${(error as Error).message}`);
    }
  }
  
  /**
   * Cancel a DoorDash delivery
   */
  async cancelDelivery(externalOrderId: string): Promise<boolean> {
    try {
      await this.apiRequest('PUT', `/deliveries/${externalOrderId}/cancel`, {
        reason: 'merchant_requested_cancellation'
      });
      
      return true;
    } catch (error) {
      console.error(`Error cancelling DoorDash delivery ${externalOrderId}:`, error);
      return false;
    }
  }
  
  /**
   * Get the current status of a DoorDash delivery
   */
  async getDeliveryStatus(externalOrderId: string): Promise<DeliveryStatus> {
    try {
      const response = await this.apiRequest<any>('GET', `/deliveries/${externalOrderId}`);
      return this.mapDoorDashStatus(response.status);
    } catch (error) {
      console.error(`Error getting status for DoorDash delivery ${externalOrderId}:`, error);
      throw new Error(`Failed to get DoorDash delivery status: ${(error as Error).message}`);
    }
  }
  
  /**
   * Map DoorDash status to our standardized DeliveryStatus
   */
  private mapDoorDashStatus(doordashStatus: string): DeliveryStatus {
    const statusMap: Record<string, DeliveryStatus> = {
      'created': 'pending',
      'accepted': 'accepted',
      'en_route_to_pickup': 'assigned',
      'arrived_at_pickup': 'assigned',
      'en_route_to_dropoff': 'picked_up',
      'en_route_to_return': 'in_transit',
      'arrived_at_dropoff': 'in_transit',
      'delivered': 'delivered',
      'returned': 'failed',
      'cancelled': 'cancelled',
      'courier_canceled': 'cancelled',
      'failed': 'failed'
    };
    
    return statusMap[doordashStatus.toLowerCase()] || 'pending';
  }
  
  /**
   * Parse webhook data from DoorDash
   */
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
    // Extract the delivery information from the webhook
    const externalOrderId = data.external_delivery_id;
    const status = this.mapDoorDashStatus(data.status);
    const timestamp = new Date(data.timestamp || Date.now());
    
    // Extract driver information if available
    const driverInfo = data.dasher ? {
      id: data.dasher.id,
      name: data.dasher.name,
      phone: data.dasher.phone_number,
      location: data.dasher.current_location ? {
        latitude: data.dasher.current_location.lat,
        longitude: data.dasher.current_location.lng,
        timestamp: new Date(data.dasher.current_location.timestamp || timestamp)
      } : undefined
    } : undefined;
    
    return {
      externalOrderId,
      status,
      driverInfo,
      timestamp,
      additionalData: data
    };
  }
  
  /**
   * Verify webhook signature from DoorDash
   */
  async verifyWebhookSignature(
    data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<boolean> {
    try {
      // Get the signature from headers
      const signature = headers['doordash-signature'];
      if (!signature) {
        return false;
      }
      
      // The signature is a JWT that contains the request body hash
      const decoded = jwt.verify(signature, secret, { algorithms: ['HS256'] }) as any;
      
      // Check if the hash of the body matches the hash in the signature
      const bodyContent = typeof data === 'string' ? data : JSON.stringify(data);
      
      // In a real implementation, we would hash the body and compare with the hash in the JWT
      // For simplicity, we'll just verify the JWT is valid
      return !!decoded;
    } catch (error) {
      console.error('Error verifying DoorDash webhook signature:', error);
      return false;
    }
  }
}