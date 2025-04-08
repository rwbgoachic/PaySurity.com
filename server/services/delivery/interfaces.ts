/**
 * Delivery service interfaces
 * These interfaces define the contract between the delivery service
 * and the various delivery provider adapters.
 */

export interface Address {
  street: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  businessName?: string;
  instructions?: string;
  latitude?: number;
  longitude?: number;
}

export interface OrderDetails {
  items: Array<{
    name: string;
    quantity: number;
    price?: number;
    notes?: string;
  }>;
  totalValue: number; // Total order value
  isReadyForPickup?: boolean;
}

export interface DeliveryQuote {
  providerId: number;
  providerName: string;
  fee: number; // Fee charged by provider
  customerFee: number; // Fee charged to customer (including platform fee)
  platformFee: number; // Our fee
  currency: string;
  estimatedPickupTime: Date;
  estimatedDeliveryTime: Date;
  distance: number;
  distanceUnit: string;
  valid: boolean;
  validUntil: Date;
  errors?: string[];
}

export type DeliveryStatus = 
  | 'pending'
  | 'accepted'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface DeliveryOrderDetails {
  orderId: number;
  businessId: number;
  providerId: number;
  customerName: string;
  customerPhone: string;
  customerAddress: Address;
  businessAddress: Address;
  providerFee: string;
  customerFee: string;
  platformFee: string;
  specialInstructions?: string;
  orderDetails: OrderDetails;
}

export interface ExternalDeliveryOrder {
  externalOrderId: string;
  status: DeliveryStatus;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
  estimatedPickupTime: Date;
  estimatedDeliveryTime: Date;
  trackingUrl?: string;
  providerData?: any; // Additional provider-specific data
}

/**
 * Interface that each delivery provider adapter must implement
 */
export interface DeliveryProviderAdapter {
  // Get the provider's name
  getName(): string;
  
  // Get the provider type (internal or external)
  getProviderType(): 'internal' | 'external';
  
  // Get a delivery quote from the provider
  getQuote(
    pickup: Address,
    delivery: Address,
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote>;
  
  // Create a delivery in the provider's system
  createDelivery(
    orderDetails: DeliveryOrderDetails
  ): Promise<ExternalDeliveryOrder>;
  
  // Cancel a delivery
  cancelDelivery(externalOrderId: string): Promise<boolean>;
  
  // Get the current status of a delivery
  getDeliveryStatus(externalOrderId: string): Promise<DeliveryStatus>;
  
  // Parse webhook data from provider
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
  
  // Verify webhook signature
  verifyWebhookSignature(
    data: any,
    headers: Record<string, string>,
    secret: string
  ): Promise<boolean>;
}