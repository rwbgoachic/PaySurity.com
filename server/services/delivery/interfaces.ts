/**
 * Delivery System Interfaces
 * 
 * This file contains interfaces and types used throughout the delivery system.
 */

/**
 * Delivery status enum - matches what's in the database schema
 */
export type DeliveryStatus = 
  | 'pending'     // Delivery has been created but not yet accepted by the provider
  | 'accepted'    // Delivery has been accepted by the provider
  | 'assigned'    // Driver has been assigned to the delivery
  | 'picked_up'   // Driver has picked up the order
  | 'in_transit'  // Driver is en route to the customer
  | 'delivered'   // Delivery has been successfully completed
  | 'failed'      // Delivery failed (e.g., customer not found)
  | 'cancelled';  // Delivery was cancelled

/**
 * Address information for delivery
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  businessName?: string;
  apartment?: string;
  instructions?: string;
  phone?: string; // Optional phone number for the address
}

/**
 * Order item for delivery
 */
export interface OrderItem {
  id: number | string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

/**
 * Order details for delivery
 */
export interface OrderDetails {
  orderId: number | string;
  items: OrderItem[];
  totalValue: number;
  currency?: string;
  specialInstructions?: string;
}

/**
 * Delivery quote response
 */
export interface DeliveryQuote {
  providerId: number;
  providerName: string;
  fee: number;
  customerFee: number;
  platformFee: number;
  currency: string;
  estimatedPickupTime: Date;
  estimatedDeliveryTime: Date;
  distance: number;
  distanceUnit: 'miles' | 'kilometers';
  valid: boolean;
  validUntil: Date;
  errors?: string[];
  providerData?: any;
}

/**
 * Delivery order details for creating a delivery
 */
export interface DeliveryOrderDetails {
  orderId: number | string;
  businessId: number;
  providerId: number;
  customerName: string;
  customerPhone: string;
  customerAddress: Address | string;
  businessAddress: Address | string;
  orderDetails: OrderDetails;
  providerFee: string;
  platformFee: string;
  customerFee: string;
  specialInstructions?: string;
}

/**
 * External delivery order response from provider
 */
export interface ExternalDeliveryOrder {
  externalOrderId: string;
  status: DeliveryStatus;
  estimatedPickupTime: Date;
  estimatedDeliveryTime: Date;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
  trackingUrl?: string;
  providerData?: any;
}

/**
 * Delivery provider adapter interface
 * All delivery providers must implement this interface
 */
export interface DeliveryProviderAdapter {
  /**
   * Get the provider name
   */
  getName(): string;

  /**
   * Get the provider type (internal or external)
   */
  getProviderType(): 'internal' | 'external';

  /**
   * Get a delivery quote from the provider
   */
  getQuote(
    pickup: Address,
    delivery: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote>;

  /**
   * Create a delivery with the provider
   */
  createDelivery(
    orderDetails: DeliveryOrderDetails
  ): Promise<ExternalDeliveryOrder>;

  /**
   * Cancel a delivery with the provider
   */
  cancelDelivery(externalOrderId: string): Promise<boolean>;

  /**
   * Get the current status of a delivery
   */
  getDeliveryStatus(externalOrderId: string): Promise<DeliveryStatus>;

  /**
   * Parse webhook data from the provider
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
   * Verify webhook signature from the provider
   */
  verifyWebhookSignature(
    data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<boolean>;
}