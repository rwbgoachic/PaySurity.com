/**
 * Delivery System Database Schema
 * 
 * This file defines the Drizzle ORM schema for the delivery system database tables.
 */

import { pgEnum, pgTable } from 'drizzle-orm/pg-core';
// import { relations } from 'drizzle-orm';  // Uncomment when implementing database schema
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { 
  integer, 
  json, 
  primaryKey, 
  serial, 
  text, 
  timestamp,
  boolean
} from 'drizzle-orm/pg-core';

// Define the delivery status enum
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

// Define the OrderItem schema which will be used for JSON storage
export const orderItemSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  quantity: z.number(),
  price: z.number().optional(),
  options: z.array(z.string()).optional(),
  notes: z.string().optional()
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// Define delivery provider table
export const deliveryProviders = pgTable('delivery_providers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'internal' or 'external'
  apiKey: text('api_key'),
  apiSecret: text('api_secret'),
  webhookKey: text('webhook_key'),
  isActive: boolean('is_active').notNull().default(true),
  settings: json('settings'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow()
});

// Insert schema for delivery providers
export const insertDeliveryProviderSchema = createInsertSchema(deliveryProviders)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertDeliveryProvider = z.infer<typeof insertDeliveryProviderSchema>;
export type DeliveryProvider = typeof deliveryProviders.$inferSelect;

// Define business delivery settings table
export const businessDeliverySettings = pgTable('business_delivery_settings', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').notNull(),
  enabledProviders: json('enabled_providers').$type<number[]>().default([]),
  defaultProvider: integer('default_provider'),
  autoAssign: boolean('auto_assign').notNull().default(true),
  deliveryRadius: integer('delivery_radius'), // in miles
  deliveryFee: text('delivery_fee'), // stored as string to maintain decimal precision
  minimumOrderAmount: text('minimum_order_amount'),
  freeDeliveryThreshold: text('free_delivery_threshold'),
  estimatedDeliveryTime: integer('estimated_delivery_time'), // in minutes
  isActive: boolean('is_active').notNull().default(true),
  settings: json('settings'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow()
});

// Insert schema for business delivery settings
export const insertBusinessDeliverySettingsSchema = createInsertSchema(businessDeliverySettings)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertBusinessDeliverySetting = z.infer<typeof insertBusinessDeliverySettingsSchema>;
export type BusinessDeliverySetting = typeof businessDeliverySettings.$inferSelect;

// Define delivery orders table
export const deliveryOrders = pgTable('delivery_orders', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').notNull(),
  orderId: text('order_id').notNull(), // Reference to the restaurant order
  providerId: integer('provider_id').notNull(), // Which delivery provider is handling this
  externalOrderId: text('external_order_id'), // Provider's order ID
  status: deliveryStatusEnum('status').notNull().default('pending'),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  pickupAddress: json('pickup_address'),
  deliveryAddress: json('delivery_address'),
  items: json('items').$type<OrderItem[]>(),
  deliveryFee: text('delivery_fee'),
  customerFee: text('customer_fee'),
  platformFee: text('platform_fee'),
  distance: text('distance'),
  distanceUnit: text('distance_unit').default('miles'),
  estimatedPickupTime: timestamp('estimated_pickup_time', { mode: 'date' }),
  estimatedDeliveryTime: timestamp('estimated_delivery_time', { mode: 'date' }),
  actualPickupTime: timestamp('actual_pickup_time', { mode: 'date' }),
  actualDeliveryTime: timestamp('actual_delivery_time', { mode: 'date' }),
  trackingUrl: text('tracking_url'),
  driverInfo: json('driver_info'),
  specialInstructions: text('special_instructions'),
  providerData: json('provider_data'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow()
});

// Insert schema for delivery orders
export const insertDeliveryOrderSchema = createInsertSchema(deliveryOrders)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertDeliveryOrder = z.infer<typeof insertDeliveryOrderSchema>;
export type DeliveryOrder = typeof deliveryOrders.$inferSelect;

// Define delivery status updates table for tracking history
export const deliveryStatusUpdates = pgTable('delivery_status_updates', {
  id: serial('id').primaryKey(),
  deliveryOrderId: integer('delivery_order_id').notNull(),
  status: deliveryStatusEnum('status').notNull(),
  timestamp: timestamp('timestamp', { mode: 'date' }).defaultNow(),
  driverInfo: json('driver_info'),
  location: json('location'),
  notes: text('notes'),
  providerData: json('provider_data')
});

// Insert schema for delivery status updates
export const insertDeliveryStatusUpdateSchema = createInsertSchema(deliveryStatusUpdates)
  .omit({ id: true });

export type InsertDeliveryStatusUpdate = z.infer<typeof insertDeliveryStatusUpdateSchema>;
export type DeliveryStatusUpdate = typeof deliveryStatusUpdates.$inferSelect;

// Note: Relations are defined when we implement the database schema
// These are not active in the current in-memory implementation
// But they represent the relationships we'd implement with a real database

/*
// Define relations between tables
export const deliveryProvidersRelations = relations(deliveryProviders, ({ many }) => ({
  businessSettings: many(businessDeliverySettings),
  deliveryOrders: many(deliveryOrders)
}));

export const businessDeliverySettingsRelations = relations(businessDeliverySettings, ({ one }) => ({
  defaultProviderRelation: one(deliveryProviders, {
    fields: [businessDeliverySettings.defaultProvider],
    references: [deliveryProviders.id]
  })
}));

export const deliveryOrdersRelations = relations(deliveryOrders, ({ one, many }) => ({
  provider: one(deliveryProviders, {
    fields: [deliveryOrders.providerId],
    references: [deliveryProviders.id]
  }),
  statusUpdates: many(deliveryStatusUpdates)
}));

export const deliveryStatusUpdatesRelations = relations(deliveryStatusUpdates, ({ one }) => ({
  deliveryOrder: one(deliveryOrders, {
    fields: [deliveryStatusUpdates.deliveryOrderId],
    references: [deliveryOrders.id]
  })
}));
*/