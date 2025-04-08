/**
 * DoorDash delivery adapter for external deliveries
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
import jwt from 'jsonwebtoken';
import { createHmac } from 'crypto';

interface DoorDashConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
}

/**
 * This adapter handles DoorDash Drive API deliveries
 * See: https://developer.doordash.com/en-US/api/drive
 */
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
    try {
      // Calculate distance for estimation purposes
      const distance = this.calculateDistance(
        pickup.latitude || 0,
        pickup.longitude || 0,
        delivery.latitude || 0,
        delivery.longitude || 0
      );

      // Create JWT token for authentication
      const token = this.createJwtToken();

      // Format addresses for DoorDash API
      const pickupAddress = this.formatAddressForDoorDash(pickup);
      const dropoffAddress = this.formatAddressForDoorDash(delivery);

      // Format order items for DoorDash API
      const items = orderDetails.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        description: item.notes || ''
      }));

      // Build delivery quote request
      const quoteRequest = {
        external_delivery_id: `quote_${orderDetails.orderId}_${Date.now()}`,
        pickup_address: pickupAddress,
        pickup_business_name: pickup.businessName || 'Restaurant',
        pickup_phone_number: pickup.phone || '',
        pickup_instructions: pickup.instructions || '',
        dropoff_address: dropoffAddress,
        dropoff_business_name: delivery.businessName || '',
        dropoff_phone_number: delivery.phone || '',
        dropoff_instructions: delivery.instructions || '',
        order_value: Math.round(orderDetails.totalValue * 100), // In cents
        items
      };

      // Make API request to DoorDash
      const response = await fetch(`${this.baseUrl}/deliveries/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(quoteRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('DoorDash quote error:', errorData);
        return this.createErrorQuote(`DoorDash API error: ${errorData.message || response.statusText}`);
      }

      const quoteData = await response.json();

      // Parse the DoorDash response
      // Extract fee details - DoorDash fee structure may vary
      const fee = parseFloat((quoteData.fee / 100).toFixed(2)); // Convert cents to dollars
      const platformFeePercent = 0.10; // 10% platform fee (our commission)
      const platformFeeMinimum = 1.00; // Minimum $1 platform fee

      // Calculate platform fee (percentage-based with minimum)
      const platformFee = Math.max(fee * platformFeePercent, platformFeeMinimum);
      const roundedPlatformFee = parseFloat(platformFee.toFixed(2));

      // Total fee to customer (includes our commission)
      const customerFee = parseFloat((fee + roundedPlatformFee).toFixed(2));

      // Return formatted delivery quote
      return {
        providerId: 2, // DoorDash provider ID
        providerName: this.getName(),
        fee: fee,
        customerFee: customerFee,
        platformFee: roundedPlatformFee,
        currency: 'USD',
        estimatedPickupTime: new Date(quoteData.pickup_time),
        estimatedDeliveryTime: new Date(quoteData.dropoff_time),
        distance: parseFloat(distance.toFixed(2)),
        distanceUnit: 'miles',
        valid: true,
        validUntil: new Date(Date.now() + 15 * 60000), // Valid for 15 minutes
        providerData: {
          quoteId: quoteData.quote_id,
          rawResponse: quoteData
        }
      };
    } catch (error) {
      console.error('Error generating DoorDash delivery quote:', error);
      return this.createErrorQuote(`Failed to generate DoorDash quote: ${(error as Error).message}`);
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
      
      // Create JWT token for authentication
      const token = this.createJwtToken();
      
      // Format addresses for DoorDash API
      const doordashPickupAddress = this.formatAddressForDoorDash(pickupAddress);
      const doordashDropoffAddress = this.formatAddressForDoorDash(dropoffAddress);
      
      // Format order items for DoorDash API
      const items = orderDetails.orderDetails.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        description: item.notes || ''
      }));
      
      // Generate a unique external delivery ID
      const externalDeliveryId = `dd_${Date.now()}_${orderDetails.orderId}`;
      
      // Build delivery creation request
      const deliveryRequest = {
        external_delivery_id: externalDeliveryId,
        pickup_address: doordashPickupAddress,
        pickup_business_name: pickupAddress.businessName || 'Restaurant',
        pickup_phone_number: pickupAddress.phone || '',
        pickup_instructions: pickupAddress.instructions || '',
        dropoff_address: doordashDropoffAddress,
        dropoff_business_name: dropoffAddress.businessName || '',
        dropoff_phone_number: dropoffAddress.phone || '',
        dropoff_instructions: dropoffAddress.instructions || '',
        order_value: Math.round(orderDetails.orderDetails.totalValue * 100), // In cents
        items,
        // Additional optional fields
        tip: 0, // No tip through the API
        contactless_dropoff: true,
        requires_catering_setup: false
      };
      
      // Make API request to DoorDash
      const response = await fetch(`${this.baseUrl}/deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(deliveryRequest)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('DoorDash delivery creation error:', errorData);
        throw new Error(`DoorDash API error: ${errorData.message || response.statusText}`);
      }
      
      const deliveryResponse = await response.json();
      
      // Map DoorDash status to our delivery status
      const status: DeliveryStatus = this.mapDoorDashStatusToDeliveryStatus(deliveryResponse.status);
      
      // Format the response
      return {
        externalOrderId: deliveryResponse.external_delivery_id,
        status,
        estimatedPickupTime: new Date(deliveryResponse.pickup_time),
        estimatedDeliveryTime: new Date(deliveryResponse.dropoff_time),
        driverId: deliveryResponse.dasher_id,
        driverName: deliveryResponse.dasher_name,
        driverPhone: deliveryResponse.dasher_phone,
        trackingUrl: deliveryResponse.tracking_url,
        providerData: deliveryResponse
      };
    } catch (error) {
      console.error('Error creating DoorDash delivery:', error);
      throw new Error(`Failed to create DoorDash delivery: ${(error as Error).message}`);
    }
  }

  async cancelDelivery(externalOrderId: string): Promise<boolean> {
    try {
      // Create JWT token for authentication
      const token = this.createJwtToken();
      
      // Make API request to DoorDash to cancel the delivery
      const response = await fetch(`${this.baseUrl}/deliveries/${externalOrderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ reason: 'merchant_requested_cancellation' })
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`DoorDash delivery ${externalOrderId} not found or already cancelled`);
          return true; // Consider not found as success for idempotence
        }
        
        const errorData = await response.json();
        console.error('DoorDash cancellation error:', errorData);
        return false;
      }
      
      console.log(`Successfully cancelled DoorDash delivery: ${externalOrderId}`);
      return true;
    } catch (error) {
      console.error('Error cancelling DoorDash delivery:', error);
      return false;
    }
  }

  async getDeliveryStatus(externalOrderId: string): Promise<DeliveryStatus> {
    try {
      // Create JWT token for authentication
      const token = this.createJwtToken();
      
      // Make API request to DoorDash to get the delivery status
      const response = await fetch(`${this.baseUrl}/deliveries/${externalOrderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`DoorDash delivery ${externalOrderId} not found`);
          return 'failed'; // Consider not found as failed
        }
        
        const errorData = await response.json();
        console.error('DoorDash status check error:', errorData);
        throw new Error(`DoorDash API error: ${errorData.message || response.statusText}`);
      }
      
      const deliveryData = await response.json();
      
      // Map DoorDash status to our delivery status
      return this.mapDoorDashStatusToDeliveryStatus(deliveryData.status);
    } catch (error) {
      console.error('Error getting DoorDash delivery status:', error);
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
    try {
      // Validate the webhook data
      if (!data.event_type || !data.external_delivery_id) {
        throw new Error('Invalid webhook data: missing event_type or external_delivery_id');
      }
      
      // Map DoorDash event type to our delivery status
      const status: DeliveryStatus = this.mapDoorDashEventToDeliveryStatus(data.event_type, data.status);
      
      // Extract timestamp (DoorDash provides it in different formats)
      const timestamp = data.event_timestamp
        ? new Date(data.event_timestamp)
        : new Date();
      
      // Extract driver information if available
      let driverInfo;
      if (data.dasher) {
        driverInfo = {
          id: data.dasher.dasher_id,
          name: data.dasher.first_name,
          phone: data.dasher.phone_number
        };
        
        if (data.dasher.location) {
          driverInfo.location = {
            latitude: data.dasher.location.lat,
            longitude: data.dasher.location.lng
          };
        }
      }
      
      return {
        externalOrderId: data.external_delivery_id,
        status,
        driverInfo,
        timestamp,
        additionalData: data
      };
    } catch (error) {
      console.error('Error parsing DoorDash webhook data:', error);
      throw new Error(`Failed to parse DoorDash webhook data: ${(error as Error).message}`);
    }
  }

  async verifyWebhookSignature(
    data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<boolean> {
    // DoorDash uses HMAC SHA-256 for webhook signature verification
    try {
      const signature = headers['doordash-signature'];
      
      if (!signature) {
        console.error('Missing DoorDash signature header');
        return false;
      }
      
      // Create HMAC using the webhook secret
      const hmac = createHmac('sha256', secret);
      
      // Update HMAC with request body (must be a string)
      const body = typeof data === 'string' ? data : JSON.stringify(data);
      hmac.update(body);
      
      // Get the digest in hex format
      const digest = hmac.digest('hex');
      
      // Compare with the provided signature (signature format: t=timestamp,v1=signature)
      const signatureParts = signature.split(',');
      if (signatureParts.length !== 2) {
        return false;
      }
      
      const providedSignature = signatureParts[1].replace('v1=', '');
      
      return digest === providedSignature;
    } catch (error) {
      console.error('Error verifying DoorDash webhook signature:', error);
      return false;
    }
  }

  /**
   * Create an error quote response
   */
  private createErrorQuote(errorMessage: string): DeliveryQuote {
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
      errors: [errorMessage]
    };
  }

  /**
   * Format an address object for DoorDash API
   */
  private formatAddressForDoorDash(address: Address) {
    return {
      street: address.street,
      city: address.city,
      state: address.state,
      zip_code: address.postalCode,
      country: address.country || 'US',
      ...(address.apartment ? { unit_number: address.apartment } : {})
    };
  }

  /**
   * Map DoorDash delivery status to our DeliveryStatus
   */
  private mapDoorDashStatusToDeliveryStatus(doorDashStatus: string): DeliveryStatus {
    // DoorDash statuses: https://developer.doordash.com/en-US/api/drive#tag/Delivery-Status
    switch (doorDashStatus) {
      case 'quote':
      case 'quote_expired':
        return 'pending';
      case 'created':
        return 'pending';
      case 'accepted':
        return 'accepted';
      case 'dasher_assigned':
      case 'dasher_reassigned':
        return 'assigned';
      case 'arrived_at_pickup':
      case 'picked_up':
        return 'picked_up';
      case 'en_route_to_dropoff':
        return 'in_transit';
      case 'arrived_at_dropoff':
      case 'delivered':
        return 'delivered';
      case 'failed':
      case 'returned':
        return 'failed';
      case 'canceled':
        return 'cancelled';
      default:
        console.warn(`Unknown DoorDash status: ${doorDashStatus}`);
        return 'pending';
    }
  }

  /**
   * Map DoorDash event type to our DeliveryStatus
   */
  private mapDoorDashEventToDeliveryStatus(eventType: string, status?: string): DeliveryStatus {
    // Map webhook event types to our status enum
    switch (eventType) {
      case 'dasher.assigned':
        return 'assigned';
      case 'dasher.approaching.pickup':
      case 'dasher.arrived.pickup':
        return 'accepted';
      case 'dasher.picked_up':
        return 'picked_up';
      case 'dasher.approaching.dropoff':
      case 'dasher.arrived.dropoff':
        return 'in_transit';
      case 'delivery.delivered':
        return 'delivered';
      case 'delivery.canceled':
        return 'cancelled';
      case 'delivery.returned':
      case 'delivery.failed':
        return 'failed';
      case 'delivery.created':
        return 'pending';
      default:
        // If we don't know the event type, try to use the status
        if (status) {
          return this.mapDoorDashStatusToDeliveryStatus(status);
        }
        console.warn(`Unknown DoorDash event type: ${eventType}`);
        return 'pending';
    }
  }

  /**
   * Create JWT token for DoorDash API authentication
   */
  private createJwtToken(): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.apiKey,
      iat: now,
      exp: now + 600, // Token valid for 10 minutes
      aud: 'doordash'
    };
    
    return jwt.sign(payload, this.apiSecret, { algorithm: 'HS256' });
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
}