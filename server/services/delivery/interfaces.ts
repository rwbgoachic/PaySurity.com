/**
 * Delivery System Interfaces
 * 
 * This file defines the interfaces used throughout the delivery service,
 * establishing a standardized contract for delivery providers.
 */

import { OrderItem } from '../../../shared/delivery-schema';

// Address format standardized across the system
export interface Address {
  street: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  apartment?: string;
  businessName?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  instructions?: string;
}

// Basic order details for quote calculation
export interface OrderDetails {
  totalValue: number;
  items?: OrderItem[];
  requiresId?: boolean;
  requiresContactlessDelivery?: boolean;
}

// Quote return format from delivery providers
export interface DeliveryQuote {
  providerId: number;  // Added by service coordinator
  providerName: string;
  fee: number;        // How much the restaurant pays
  customerFee: number; // How much the customer pays
  platformFee: number; // Our cut
  currency: string;
  estimatedPickupTime: Date;
  estimatedDeliveryTime: Date;
  distance: number;
  distanceUnit: string;
  valid: boolean;      // Is this quote valid
  validUntil: Date;    // When does the quote expire
  errors: string[];    // Any errors in generation
  providerData?: any;  // Provider-specific data
}

// Standardized status format across different providers
export type DeliveryStatus = 
  | 'pending'
  | 'accepted'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'cancelled';

// Full details needed to create a delivery
export interface DeliveryOrderDetails {
  providerId: number;
  businessId: number; 
  orderId: string;
  orderDetails: OrderDetails;
  businessAddress: Address;
  customerAddress: Address;
  customerName: string;
  customerPhone?: string;
  specialInstructions?: string;
  providerQuoteId?: string | number;
}

// Information returned when a delivery is created
export interface ExternalDeliveryOrder {
  externalOrderId: string;
  status: DeliveryStatus;
  estimatedPickupTime: Date;
  estimatedDeliveryTime: Date;
  trackingUrl?: string;
  providerData?: any;
}

// The standardized interface all delivery providers must implement
export interface DeliveryProviderAdapter {
  // Provider identification
  getName(): string;
  getProviderType(): 'internal' | 'external';
  
  // Core delivery operations
  getQuote(
    pickup: Address, 
    delivery: Address, 
    orderDetails: OrderDetails
  ): Promise<DeliveryQuote>;
  
  createDelivery(
    orderDetails: DeliveryOrderDetails
  ): Promise<ExternalDeliveryOrder>;
  
  cancelDelivery(
    externalOrderId: string
  ): Promise<boolean>;
  
  getDeliveryStatus(
    externalOrderId: string
  ): Promise<DeliveryStatus>;
  
  // Webhook handling
  parseWebhookData(
    data: any, 
    headers: Record<string, string>
  ): Promise<{
    externalOrderId: string;
    status: DeliveryStatus;
    driverInfo?: any;
    timestamp: Date;
  }>;
  
  verifyWebhookSignature(
    data: any, 
    headers: Record<string, string>, 
    secret: string
  ): Promise<boolean>;
}