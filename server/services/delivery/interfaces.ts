/**
 * Interfaces for the Delivery System
 * 
 * This file defines the contract that all delivery providers must implement.
 * It standardizes how the system interacts with different delivery services,
 * whether they are internal (restaurant's own drivers) or external (DoorDash, etc.)
 */

/**
 * Address information used for pickup and delivery
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
  email?: string;
  instructions?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Order item details
 */
export interface OrderItem {
  name: string;
  quantity: number;
  price?: number;
  options?: string[];
  specialInstructions?: string;
}

/**
 * Order details for getting quotes and creating deliveries
 */
export interface OrderDetails {
  orderId?: string | number;
  totalValue: number;
  currency?: string;
  items?: OrderItem[];
  tipAmount?: number;
  taxAmount?: number;
  specialInstructions?: string;
}

/**
 * Status of a delivery
 */
export type DeliveryStatus = 
  | 'pending'      // Order created but not accepted by courier service
  | 'accepted'     // Order accepted by courier service, awaiting pickup
  | 'assigned'     // Courier assigned, but not yet picked up
  | 'picked_up'    // Food picked up, en route to customer
  | 'in_transit'   // Actively being delivered
  | 'delivered'    // Successfully delivered
  | 'failed'       // Delivery failed
  | 'cancelled';   // Delivery cancelled

/**
 * Quote for a delivery from a specific provider
 */
export interface DeliveryQuote {
  providerId: number;               // Provider ID (assigned by DeliveryService)
  providerName: string;             // Provider name
  fee: number;                      // Delivery fee (to restaurant)
  customerFee: number;              // Fee shown to customer
  platformFee: number;              // Additional platform fee
  currency: string;                 // Currency code (e.g., USD)
  estimatedPickupTime: Date;        // Estimated pickup time
  estimatedDeliveryTime: Date;      // Estimated delivery time
  distance: number;                 // Distance in miles/kilometers
  distanceUnit: 'miles' | 'kilometers';  // Unit of distance measurement
  valid: boolean;                   // Whether the quote is valid
  validUntil: Date;                 // When the quote expires
  errors?: string[];                // Errors if the quote is invalid
  providerData?: any;               // Provider-specific data
}

/**
 * Details needed to create a delivery
 */
export interface DeliveryOrderDetails {
  providerId: number;               // Provider ID to use
  orderId: string | number;         // Order ID in restaurant system
  businessId: number;               // Restaurant/business ID
  customerName: string;             // Customer name
  customerPhone: string;            // Customer phone
  customerEmail?: string;           // Customer email
  businessAddress: Address | string; // Restaurant address (string = JSON)
  customerAddress: Address | string; // Customer address (string = JSON)
  orderDetails: OrderDetails;       // Order details
  providerQuoteId?: string;         // Quote ID from provider (if applicable)
  providerFee?: string | number;    // Fee charged by provider
  specialInstructions?: string;     // Special delivery instructions
}

/**
 * Delivery order created by a provider
 */
export interface ExternalDeliveryOrder {
  externalOrderId: string;          // Order ID in provider's system
  status: DeliveryStatus;           // Current status
  estimatedPickupTime: Date;        // Estimated pickup time
  estimatedDeliveryTime: Date;      // Estimated delivery time
  trackingUrl?: string;             // Tracking URL (if available)
  providerData?: any;               // Provider-specific data
}

/**
 * Interface that all delivery providers must implement
 */
export interface DeliveryProviderAdapter {
  /**
   * Get the name of the provider
   */
  getName(): string;
  
  /**
   * Get the type of provider
   */
  getProviderType(): 'internal' | 'external';
  
  /**
   * Get a delivery quote
   */
  getQuote(
    pickup: Address,
    delivery: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote>;
  
  /**
   * Create a delivery
   */
  createDelivery(
    orderDetails: DeliveryOrderDetails
  ): Promise<ExternalDeliveryOrder>;
  
  /**
   * Cancel a delivery
   */
  cancelDelivery(
    externalOrderId: string
  ): Promise<boolean>;
  
  /**
   * Get the status of a delivery
   */
  getDeliveryStatus(
    externalOrderId: string
  ): Promise<DeliveryStatus>;
  
  /**
   * Parse webhook data from the provider
   */
  parseWebhookData(
    data: any,
    headers: Record<string, string>
  ): Promise<{
    externalOrderId: string;
    status: DeliveryStatus;
    driverInfo?: any;
    timestamp: Date;
    additionalData?: any;
  }>;
  
  /**
   * Verify a webhook signature from the provider
   */
  verifyWebhookSignature(
    data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<boolean>;
}