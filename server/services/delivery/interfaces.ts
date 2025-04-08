/**
 * Interfaces for delivery service components
 * 
 * These interfaces define the contract between the delivery service 
 * and its various provider adapters.
 */

/**
 * Physical address for pickup and dropoff locations
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  apartment?: string;
  businessName?: string;
  phone?: string;
  instructions?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Order item to be delivered
 */
export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  options?: string[];
}

/**
 * Details about the order being delivered
 */
export interface OrderDetails {
  orderId: number | string;
  items: OrderItem[];
  totalValue: number;
  currency?: string;
  specialInstructions?: string;
}

/**
 * Delivery status enum
 */
export type DeliveryStatus = 
  | 'pending'    // Initial state, not yet accepted by provider
  | 'accepted'   // Provider has accepted the delivery request
  | 'assigned'   // Driver has been assigned
  | 'picked_up'  // Driver has picked up the order
  | 'in_transit' // Driver is en route to customer
  | 'delivered'  // Order has been delivered
  | 'failed'     // Delivery failed (problem occurred)
  | 'cancelled'; // Delivery was cancelled

/**
 * Quote from a delivery provider
 */
export interface DeliveryQuote {
  providerId: number;
  providerName: string;
  fee: number;              // Fee charged by provider
  customerFee: number;      // Fee to charge the customer
  platformFee: number;      // Fee retained by platform
  currency: string;
  estimatedPickupTime: Date;
  estimatedDeliveryTime: Date;
  distance: number;
  distanceUnit: 'miles' | 'kilometers';
  valid: boolean;
  validUntil: Date;         // Quote valid until this time
  errors?: string[];        // Any errors if quote is invalid
  providerData?: any;       // Raw provider response data
}

/**
 * Details needed to create a delivery
 */
export interface DeliveryOrderDetails {
  orderId: number | string;
  businessId: number;
  providerId: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string | Address; // Can be stringified JSON
  businessAddress: string | Address; // Can be stringified JSON
  orderDetails: OrderDetails;
  providerFee: string;
  platformFee: string;
  customerFee: string;
  specialInstructions?: string;
}

/**
 * External delivery order response
 */
export interface ExternalDeliveryOrder {
  externalOrderId: string;
  status: DeliveryStatus;
  estimatedPickupTime: Date;
  estimatedDeliveryTime: Date;
  driverName?: string;
  driverPhone?: string;
  trackingUrl?: string;
  providerData?: any;
}

/**
 * Interface that all delivery provider adapters must implement
 */
export interface DeliveryProviderAdapter {
  /**
   * Get the name of this delivery provider
   */
  getName(): string;
  
  /**
   * Get the type of this provider (internal or external)
   */
  getProviderType(): 'internal' | 'external';
  
  /**
   * Get a delivery quote from this provider
   */
  getQuote(
    pickup: Address,
    delivery: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote>;
  
  /**
   * Create a delivery with this provider
   */
  createDelivery(
    orderDetails: DeliveryOrderDetails
  ): Promise<ExternalDeliveryOrder>;
  
  /**
   * Cancel an existing delivery
   */
  cancelDelivery(externalOrderId: string): Promise<boolean>;
  
  /**
   * Get the current status of a delivery
   */
  getDeliveryStatus(externalOrderId: string): Promise<DeliveryStatus>;
  
  /**
   * Parse webhook data from provider
   */
  parseWebhookData(
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
  }>;
  
  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<boolean>;
}