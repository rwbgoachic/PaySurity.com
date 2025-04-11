/**
 * PaySurity Payroll Pricing Schema
 * 
 * This file defines the database schema for the payroll pricing system,
 * including pricing tiers, feature availability, and merchant-specific pricing.
 */

import { pgTable, serial, text, integer, decimal, timestamp, boolean, pgEnum, uniqueIndex, foreignKey, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Product tiers
export const productTierEnum = pgEnum('product_tier', ['starter', 'professional', 'enterprise', 'custom']);

// Billing cycles
export const billingCycleEnum = pgEnum('billing_cycle', ['monthly', 'quarterly', 'annual', 'custom']);

// Base pricing table (standard prices)
export const payrollPricing = pgTable('payroll_pricing', {
  id: serial('id').primaryKey(),
  tier: productTierEnum('tier').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  perEmployeePrice: decimal('per_employee_price', { precision: 10, scale: 2 }).notNull(),
  perContractorPrice: decimal('per_contractor_price', { precision: 10, scale: 2 }),
  freeContractors: integer('free_contractors').default(0),
  globalPayrollPerEmployeePrice: decimal('global_payroll_per_employee_price', { precision: 10, scale: 2 }),
  onDemandPayFee: decimal('on_demand_pay_fee', { precision: 10, scale: 2 }),
  minEmployees: integer('min_employees').default(1),
  maxEmployees: integer('max_employees'),
  isActive: boolean('is_active').default(true),
  features: json('features'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Merchant-specific pricing (custom pricing or discounts)
export const merchantPayrollPricing = pgTable('merchant_payroll_pricing', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id').notNull(),
  basePricingId: integer('base_pricing_id'),
  customBasePrice: decimal('custom_base_price', { precision: 10, scale: 2 }),
  customPerEmployeePrice: decimal('custom_per_employee_price', { precision: 10, scale: 2 }),
  customPerContractorPrice: decimal('custom_per_contractor_price', { precision: 10, scale: 2 }),
  customFreeContractors: integer('custom_free_contractors'),
  customGlobalPayrollPerEmployeePrice: decimal('custom_global_payroll_per_employee_price', { precision: 10, scale: 2 }),
  customOnDemandPayFee: decimal('custom_on_demand_pay_fee', { precision: 10, scale: 2 }),
  discountPercentage: decimal('discount_percentage', { precision: 5, scale: 2 }),
  discountStartDate: timestamp('discount_start_date'),
  discountEndDate: timestamp('discount_end_date'),
  billingCycle: billingCycleEnum('billing_cycle').default('monthly'),
  nextBillingDate: timestamp('next_billing_date'),
  specialTerms: text('special_terms'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    merchantIdIdx: uniqueIndex('merchant_payroll_pricing_merchant_id_idx').on(table.merchantId),
    basePricingFk: foreignKey({
      columns: [table.basePricingId],
      foreignColumns: [payrollPricing.id]
    }).onDelete('set null')
  };
});

// Payroll pricing feature list
export const payrollPricingFeatures = pgTable('payroll_pricing_features', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  isStandard: boolean('is_standard').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Payroll pricing feature availability per tier
export const payrollPricingFeatureAvailability = pgTable('payroll_pricing_feature_availability', {
  id: serial('id').primaryKey(),
  pricingId: integer('pricing_id').notNull(),
  featureId: integer('feature_id').notNull(),
  isIncluded: boolean('is_included').default(false),
  additionalCost: decimal('additional_cost', { precision: 10, scale: 2 }),
  isLimited: boolean('is_limited').default(false),
  limitDetails: text('limit_details'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    pricingFeatureIdx: uniqueIndex('payroll_pricing_feature_availability_idx').on(table.pricingId, table.featureId),
    pricingFk: foreignKey({
      columns: [table.pricingId],
      foreignColumns: [payrollPricing.id]
    }).onDelete('cascade'),
    featureFk: foreignKey({
      columns: [table.featureId],
      foreignColumns: [payrollPricingFeatures.id]
    }).onDelete('cascade')
  };
});

// Schemas for validation
export const insertPayrollPricingSchema = createInsertSchema(payrollPricing);
export const insertMerchantPayrollPricingSchema = createInsertSchema(merchantPayrollPricing);
export const insertPayrollPricingFeaturesSchema = createInsertSchema(payrollPricingFeatures);
export const insertPayrollPricingFeatureAvailabilitySchema = createInsertSchema(payrollPricingFeatureAvailability);

// TypeScript types
export type PayrollPricing = typeof payrollPricing.$inferSelect;
export type InsertPayrollPricing = z.infer<typeof insertPayrollPricingSchema>;

export type MerchantPayrollPricing = typeof merchantPayrollPricing.$inferSelect;
export type InsertMerchantPayrollPricing = z.infer<typeof insertMerchantPayrollPricingSchema>;

export type PayrollPricingFeature = typeof payrollPricingFeatures.$inferSelect;
export type InsertPayrollPricingFeature = z.infer<typeof insertPayrollPricingFeaturesSchema>;

export type PayrollPricingFeatureAvailability = typeof payrollPricingFeatureAvailability.$inferSelect;
export type InsertPayrollPricingFeatureAvailability = z.infer<typeof insertPayrollPricingFeatureAvailabilitySchema>;