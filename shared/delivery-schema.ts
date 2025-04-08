/**
 * Delivery System Database Schema
 */

import { integer, pgEnum, pgTable, serial, text, timestamp, boolean, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

/**
 * Delivery status enum - all possible states a delivery can be in
 */
export const deliveryStatusEnum = pgEnum('delivery_status', [
  'pending',     // Delivery has been created but not yet accepted by the provider
  'accepted',    // Delivery has been accepted by the provider
  'assigned',    // Driver has been assigned to the delivery
  'picked_up',   // Driver has picked up the order
  'in_transit',  // Driver is en route to the customer
  'delivered',   // Delivery has been successfully completed
  'failed',      // Delivery failed (e.g., customer not found)
  'cancelled'    // Delivery was cancelled
]);

/**
 * Delivery providers table - stores registered delivery services
 */
export const deliveryProviders = pgTable('delivery_providers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // Provider name (e.g., "DoorDash", "Restaurant Staff")
  type: text('type').notNull(), // Provider type (e.g., "internal", "doordash", "uber_eats")
  apiKey: text('api_key'), // API key for external provider
  apiSecret: text('api_secret'), // API secret for external provider
  webhookKey: text('webhook_key'), // Secret key for webhook verification
  isActive: boolean('is_active').notNull().default(true),
  settings: json('settings').default({}), // Provider-specific settings as JSON
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

/**
 * Delivery regions table - geographic areas where delivery is available
 */
export const deliveryRegions = pgTable('delivery_regions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // Region name (e.g., "Downtown", "North Side")
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCodes: text('postal_codes').array(), // Array of postal codes in this region
  providerId: integer('provider_id').references(() => deliveryProviders.id),
  isActive: boolean('is_active').notNull().default(true),
  maxDistance: integer('max_distance'), // Maximum delivery distance in miles
  minimumOrderAmount: text('minimum_order_amount'), // Minimum order value for delivery
  baseFee: text('base_fee'), // Base delivery fee for this region
  feePerMile: text('fee_per_mile'), // Additional fee per mile
  platformFee: text('platform_fee'), // Our platform fee or commission
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

/**
 * Business delivery settings table - configuration for each business
 */
export const businessDeliverySettings = pgTable('business_delivery_settings', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').notNull(),
  isDeliveryEnabled: boolean('is_delivery_enabled').notNull().default(true),
  defaultProviderId: integer('default_provider_id').references(() => deliveryProviders.id),
  customFeeEnabled: boolean('custom_fee_enabled').notNull().default(false),
  customBaseFee: text('custom_base_fee'), // Custom base fee if different from provider
  customFeePerMile: text('custom_fee_per_mile'), // Custom per-mile fee
  customPlatformFee: text('custom_platform_fee'), // Custom platform fee
  customDeliveryRadius: integer('custom_delivery_radius'), // Custom delivery radius in miles
  autoAcceptOrders: boolean('auto_accept_orders').notNull().default(true),
  deliveryInstructions: text('delivery_instructions'), // Default instructions for drivers
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

/**
 * Delivery orders table - records of delivery orders
 */
export const deliveryOrders = pgTable('delivery_orders', {
  id: serial('id').primaryKey(),
  externalOrderId: text('external_order_id'), // ID assigned by external provider
  businessId: integer('business_id').notNull(),
  providerId: integer('provider_id').references(() => deliveryProviders.id).notNull(),
  orderId: integer('order_id').notNull(), // Reference to the POS order
  status: deliveryStatusEnum('status').notNull().default('pending'),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerAddress: text('customer_address').notNull(), // Stored as JSON string
  businessAddress: text('business_address').notNull(), // Stored as JSON string
  orderDetails: json('order_details').notNull(), // Order items, etc.
  specialInstructions: text('special_instructions'),
  estimatedPickupTime: timestamp('estimated_pickup_time'),
  estimatedDeliveryTime: timestamp('estimated_delivery_time'),
  actualPickupTime: timestamp('actual_pickup_time'),
  actualDeliveryTime: timestamp('actual_delivery_time'),
  driverId: text('driver_id'), // Driver ID from provider
  driverName: text('driver_name'),
  driverPhone: text('driver_phone'),
  trackingUrl: text('tracking_url'), // URL for tracking the delivery
  distance: text('distance'), // Distance in miles
  providerFee: text('provider_fee').notNull(), // Fee paid to provider
  platformFee: text('platform_fee').notNull(), // Our platform fee
  customerFee: text('customer_fee').notNull(), // Total fee charged to customer
  providerResponse: json('provider_response'), // Raw response from provider
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

/**
 * Delivery status history table - tracks all status changes
 */
export const deliveryStatusHistory = pgTable('delivery_status_history', {
  id: serial('id').primaryKey(),
  deliveryOrderId: integer('delivery_order_id').references(() => deliveryOrders.id).notNull(),
  status: deliveryStatusEnum('status').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  notes: text('notes'),
  driverLatitude: text('driver_latitude'),
  driverLongitude: text('driver_longitude'),
  createdAt: timestamp('created_at').defaultNow()
});

export const insertDeliveryProviderSchema = createInsertSchema(deliveryProviders);
export const insertDeliveryRegionSchema = createInsertSchema(deliveryRegions);
export const insertBusinessDeliverySettingsSchema = createInsertSchema(businessDeliverySettings);
export const insertDeliveryOrderSchema = createInsertSchema(deliveryOrders);
export const insertDeliveryStatusHistorySchema = createInsertSchema(deliveryStatusHistory);

// Extended schema for creating a new delivery with simplified fields
export const createDeliverySchema = insertDeliveryOrderSchema.extend({
  // Additional validation or transformation can be added here
});

// Types
export type DeliveryProvider = typeof deliveryProviders.$inferSelect;
export type InsertDeliveryProvider = typeof deliveryProviders.$inferInsert;

export type DeliveryRegion = typeof deliveryRegions.$inferSelect;
export type InsertDeliveryRegion = typeof deliveryRegions.$inferInsert;

export type BusinessDeliverySetting = typeof businessDeliverySettings.$inferSelect;
export type InsertBusinessDeliverySetting = typeof businessDeliverySettings.$inferInsert;

export type DeliveryOrder = typeof deliveryOrders.$inferSelect;
export type InsertDeliveryOrder = typeof deliveryOrders.$inferInsert;

export type DeliveryStatusHistoryEntry = typeof deliveryStatusHistory.$inferSelect;
export type InsertDeliveryStatusHistoryEntry = typeof deliveryStatusHistory.$inferInsert;