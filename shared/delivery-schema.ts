import { pgTable, pgEnum, serial, text, integer, boolean, timestamp, varchar, decimal, foreignKey, json, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const deliveryProviderTypeEnum = pgEnum('delivery_provider_type', ['internal', 'external']);

export const deliveryStatusEnum = pgEnum('delivery_status', [
  'pending',
  'accepted',
  'assigned',
  'picked_up',
  'in_transit',
  'delivered',
  'failed',
  'cancelled'
]);

export const deliveryPaymentStatusEnum = pgEnum('delivery_payment_status', [
  'pending',
  'processing',
  'paid',
  'failed',
  'sent',
  'settled'
]);

// Delivery Regions
export const deliveryRegions = pgTable('delivery_regions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  state: text('state'),
  city: text('city'),
  postalCode: text('postal_code'),
  radius: decimal('radius'),
  centerLatitude: decimal('center_latitude'),
  centerLongitude: decimal('center_longitude'),
  polygonBoundary: json('polygon_boundary'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Delivery Providers
export const deliveryProviders = pgTable('delivery_providers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: deliveryProviderTypeEnum('type').notNull(),
  apiKey: text('api_key'),
  apiSecret: text('api_secret'),
  baseUrl: text('base_url'),
  webhookSecret: text('webhook_secret'),
  isActive: boolean('is_active').notNull().default(true),
  baseFee: decimal('base_fee').notNull().default('3.00'),
  perMileFee: decimal('per_mile_fee').notNull().default('0.50'),
  minOrderValue: decimal('min_order_value').default('10.00'),
  maxDeliveryDistance: decimal('max_delivery_distance'),
  defaultTax: decimal('default_tax').default('0.00'),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Provider coverage by region
export const deliveryProviderRegions = pgTable('delivery_provider_regions', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').references(() => deliveryProviders.id).notNull(),
  regionId: integer('region_id').references(() => deliveryRegions.id).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  customFees: jsonb('custom_fees'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Business delivery settings
export const businessDeliverySettings = pgTable('business_delivery_settings', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').notNull(),
  isDeliveryEnabled: boolean('is_delivery_enabled').notNull().default(false),
  deliveryRadius: decimal('delivery_radius').default('5.0'),
  minimumOrderValue: decimal('minimum_order_value').default('10.00'),
  deliveryFeeCustomerOffset: decimal('delivery_fee_customer_offset').default('0.00'),
  businessAbsorbsDeliveryFee: boolean('business_absorbs_delivery_fee').notNull().default(false),
  platformFeePercentage: decimal('platform_fee_percentage').default('0.15'),
  platformFeeFixed: decimal('platform_fee_fixed').default('1.00'),
  allowedProviders: jsonb('allowed_providers'),
  customDeliveryHours: jsonb('custom_delivery_hours'),
  schedulingWindowMin: integer('scheduling_window_min').default(0),
  schedulingWindowMax: integer('scheduling_window_max').default(14),
  deliveryInstructions: text('delivery_instructions'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Delivery Orders
export const deliveryOrders = pgTable('delivery_orders', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull(),
  businessId: integer('business_id').notNull(),
  providerId: integer('provider_id').references(() => deliveryProviders.id).notNull(),
  status: deliveryStatusEnum('status').notNull().default('pending'),
  externalOrderId: text('external_order_id'),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerAddress: text('customer_address').notNull(),
  customerLatitude: text('customer_latitude'),
  customerLongitude: text('customer_longitude'),
  businessAddress: text('business_address').notNull(),
  businessLatitude: text('business_latitude'),
  businessLongitude: text('business_longitude'),
  driverId: text('driver_id'),
  driverName: text('driver_name'),
  driverPhone: text('driver_phone'),
  driverLocation: text('driver_location'),
  estimatedPickupTime: timestamp('estimated_pickup_time'),
  actualPickupTime: timestamp('actual_pickup_time'),
  estimatedDeliveryTime: timestamp('estimated_delivery_time'),
  actualDeliveryTime: timestamp('actual_delivery_time'),
  providerFee: decimal('provider_fee').notNull(),
  customerFee: decimal('customer_fee').notNull(),
  platformFee: decimal('platform_fee').notNull(),
  specialInstructions: text('special_instructions'),
  statusHistory: jsonb('status_history'),
  trackingUrl: text('tracking_url'),
  failureReason: text('failure_reason'),
  cancelReason: text('cancel_reason'),
  paymentSettled: boolean('payment_settled').notNull().default(false),
  providerData: jsonb('provider_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Delivery Payments
export const deliveryPayments = pgTable('delivery_payments', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').references(() => deliveryProviders.id).notNull(),
  totalAmount: decimal('total_amount').notNull(),
  ordersCount: integer('orders_count').notNull(),
  status: deliveryPaymentStatusEnum('status').notNull().default('pending'),
  dateRangeStart: timestamp('date_range_start').notNull(),
  dateRangeEnd: timestamp('date_range_end').notNull(),
  paymentReference: text('payment_reference'),
  paidAt: timestamp('paid_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Delivery Payment Items
export const deliveryPaymentItems = pgTable('delivery_payment_items', {
  id: serial('id').primaryKey(),
  paymentId: integer('payment_id').references(() => deliveryPayments.id).notNull(),
  deliveryOrderId: integer('delivery_order_id').references(() => deliveryOrders.id).notNull(),
  amount: decimal('amount').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Export types
export type DeliveryProvider = typeof deliveryProviders.$inferSelect;
export type InsertDeliveryProvider = typeof deliveryProviders.$inferInsert;
export const insertDeliveryProviderSchema = createInsertSchema(deliveryProviders);

export type DeliveryRegion = typeof deliveryRegions.$inferSelect;
export type InsertDeliveryRegion = typeof deliveryRegions.$inferInsert;
export const insertDeliveryRegionSchema = createInsertSchema(deliveryRegions);

export type DeliveryProviderRegion = typeof deliveryProviderRegions.$inferSelect;
export type InsertDeliveryProviderRegion = typeof deliveryProviderRegions.$inferInsert;
export const insertDeliveryProviderRegionSchema = createInsertSchema(deliveryProviderRegions);

export type BusinessDeliverySetting = typeof businessDeliverySettings.$inferSelect;
export type InsertBusinessDeliverySetting = typeof businessDeliverySettings.$inferInsert;
export const insertBusinessDeliverySettingsSchema = createInsertSchema(businessDeliverySettings);

export type DeliveryOrder = typeof deliveryOrders.$inferSelect;
export type InsertDeliveryOrder = typeof deliveryOrders.$inferInsert;
export const insertDeliveryOrderSchema = createInsertSchema(deliveryOrders);

export type DeliveryPayment = typeof deliveryPayments.$inferSelect;
export type InsertDeliveryPayment = typeof deliveryPayments.$inferInsert;
export const insertDeliveryPaymentSchema = createInsertSchema(deliveryPayments);

export type DeliveryPaymentItem = typeof deliveryPaymentItems.$inferSelect;
export type InsertDeliveryPaymentItem = typeof deliveryPaymentItems.$inferInsert;
export const insertDeliveryPaymentItemSchema = createInsertSchema(deliveryPaymentItems);