/**
 * PaySurity Payroll Tax Calculation Schema
 * 
 * This file defines the database schema for the payroll tax calculation system,
 * including tax tables, brackets, employee information, and calculation history.
 */

import { pgTable, serial, text, integer, decimal, timestamp, boolean, pgEnum, uniqueIndex, foreignKey, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { employees, payFrequencyEnum } from './schema-employees';

// Tax Jurisdiction Types
export const taxJurisdictionTypeEnum = pgEnum('tax_jurisdiction_type', ['federal', 'state', 'local', 'county', 'city']);

// Tax Types
export const taxTypeEnum = pgEnum('tax_type', [
  'income', 'social_security', 'medicare', 'sui', 'sdi', 
  'futa', 'suta', 'local_income', 'transit', 'occupational'
]);

// Tax Calculation Methods
export const taxCalcMethodEnum = pgEnum('tax_calculation_method', [
  'flat_rate', 'progressive', 'fixed_amount', 'percentage_with_cap', 'wage_base'
]);

// Filing Status
export const filingStatusEnum = pgEnum('filing_status', [
  'single', 'married_filing_jointly', 'married_filing_separately', 
  'head_of_household', 'qualifying_widow_widower'
]);

// Pay Frequency - imported from schema-employees.ts

// Create tax jurisdiction table
export const taxJurisdictions = pgTable('tax_jurisdictions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  type: taxJurisdictionTypeEnum('type').notNull(),
  parentJurisdictionId: integer('parent_jurisdiction_id'),
  effectiveDate: timestamp('effective_date').defaultNow(),
  expirationDate: timestamp('expiration_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    jurisdictionCodeIdx: uniqueIndex('tax_jurisdiction_code_idx').on(table.code),
    parentJurisdictionIdx: foreignKey({
      columns: [table.parentJurisdictionId],
      foreignColumns: [table.id]
    }).onDelete('set null')
  };
});

// Create tax table (defines tax rates for jurisdictions)
export const taxTables = pgTable('tax_tables', {
  id: serial('id').primaryKey(),
  jurisdictionId: integer('jurisdiction_id').notNull(),
  taxType: taxTypeEnum('tax_type').notNull(),
  calculationMethod: taxCalcMethodEnum('calculation_method').notNull(),
  filingStatus: filingStatusEnum('filing_status'),
  payFrequency: payFrequencyEnum('pay_frequency'),
  effectiveDate: timestamp('effective_date').defaultNow(),
  expirationDate: timestamp('expiration_date'),
  taxRate: decimal('tax_rate', { precision: 10, scale: 6 }),
  wageBase: decimal('wage_base', { precision: 12, scale: 2 }),
  wageBasePeriod: payFrequencyEnum('wage_base_period').default('annually'),
  fixedAmount: decimal('fixed_amount', { precision: 12, scale: 2 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    jurisdictionFk: foreignKey({
      columns: [table.jurisdictionId],
      foreignColumns: [taxJurisdictions.id]
    }).onDelete('cascade')
  };
});

// Create tax brackets for progressive taxes
export const taxBrackets = pgTable('tax_brackets', {
  id: serial('id').primaryKey(),
  taxTableId: integer('tax_table_id').notNull(),
  lowerBound: decimal('lower_bound', { precision: 12, scale: 2 }).notNull(),
  upperBound: decimal('upper_bound', { precision: 12, scale: 2 }),
  rate: decimal('rate', { precision: 10, scale: 6 }).notNull(),
  fixedAmount: decimal('fixed_amount', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    taxTableFk: foreignKey({
      columns: [table.taxTableId],
      foreignColumns: [taxTables.id]
    }).onDelete('cascade')
  };
});

// Create employee tax elections (W-4 information)
export const employeeTaxElections = pgTable('employee_tax_elections', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').notNull(),
  jurisdictionId: integer('jurisdiction_id').notNull(),
  taxType: taxTypeEnum('tax_type').notNull(),
  filingStatus: filingStatusEnum('filing_status'),
  allowances: integer('allowances').default(0),
  additionalWithholding: decimal('additional_withholding', { precision: 12, scale: 2 }).default('0'),
  exemption: boolean('exemption').default(false),
  exemptionReason: text('exemption_reason'),
  effectiveDate: timestamp('effective_date').defaultNow(),
  expirationDate: timestamp('expiration_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    employeeFk: foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employees.id]
    }).onDelete('cascade'),
    jurisdictionFk: foreignKey({
      columns: [table.jurisdictionId],
      foreignColumns: [taxJurisdictions.id]
    }).onDelete('cascade')
  };
});

// Create payroll tax calculations
export const payrollTaxCalculations = pgTable('payroll_tax_calculations', {
  id: serial('id').primaryKey(),
  payrollRunId: integer('payroll_run_id').notNull(),
  employeeId: integer('employee_id').notNull(),
  jurisdictionId: integer('jurisdiction_id').notNull(),
  taxTableId: integer('tax_table_id').notNull(),
  taxType: taxTypeEnum('tax_type').notNull(),
  grossIncome: decimal('gross_income', { precision: 12, scale: 2 }).notNull(),
  taxableIncome: decimal('taxable_income', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).notNull(),
  ytdEarnings: decimal('ytd_earnings', { precision: 12, scale: 2 }),
  ytdTaxWithheld: decimal('ytd_tax_withheld', { precision: 12, scale: 2 }),
  calculationDetails: json('calculation_details'),
  calculatedAt: timestamp('calculated_at').defaultNow(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    employeeFk: foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employees.id]
    }).onDelete('cascade'),
    jurisdictionFk: foreignKey({
      columns: [table.jurisdictionId],
      foreignColumns: [taxJurisdictions.id]
    }).onDelete('cascade'),
    taxTableFk: foreignKey({
      columns: [table.taxTableId],
      foreignColumns: [taxTables.id]
    }).onDelete('cascade')
  };
});

// Create payroll tax settings table
export const payrollTaxSettings = pgTable('payroll_tax_settings', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id').notNull(),
  taxProvider: text('tax_provider').default('internal'),
  autoUpdateTaxTables: boolean('auto_update_tax_tables').default(true),
  localJurisdictionMethod: text('local_jurisdiction_method').default('work_location'),
  supplementalWageMethod: text('supplemental_wage_method').default('aggregate'),
  reciprocityRules: json('reciprocity_rules'),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Create special tax situations table
export const specialTaxSituations = pgTable('special_tax_situations', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').notNull(),
  situationType: text('situation_type').notNull(),
  description: text('description'),
  documentReference: text('document_reference'),
  effectiveDate: timestamp('effective_date').defaultNow(),
  expirationDate: timestamp('expiration_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    employeeFk: foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employees.id]
    }).onDelete('cascade')
  };
});

// Create tax update log
export const taxUpdateLogs = pgTable('tax_update_logs', {
  id: serial('id').primaryKey(),
  updateType: text('update_type').notNull(),
  source: text('source').notNull(),
  affectedTables: text('affected_tables').notNull(),
  changeDescription: text('change_description'),
  changeDetails: json('change_details'),
  performedBy: integer('performed_by'),
  isAutomatic: boolean('is_automatic').default(false),
  performedAt: timestamp('performed_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

// Zod schemas for validation
export const insertTaxJurisdictionSchema = createInsertSchema(taxJurisdictions);
export const insertTaxTableSchema = createInsertSchema(taxTables);
export const insertTaxBracketSchema = createInsertSchema(taxBrackets);
export const insertEmployeeTaxElectionSchema = createInsertSchema(employeeTaxElections);
export const insertPayrollTaxCalculationSchema = createInsertSchema(payrollTaxCalculations);
export const insertPayrollTaxSettingSchema = createInsertSchema(payrollTaxSettings);
export const insertSpecialTaxSituationSchema = createInsertSchema(specialTaxSituations);
export const insertTaxUpdateLogSchema = createInsertSchema(taxUpdateLogs);

// TypeScript types
export type TaxJurisdiction = typeof taxJurisdictions.$inferSelect;
export type InsertTaxJurisdiction = z.infer<typeof insertTaxJurisdictionSchema>;

export type TaxTable = typeof taxTables.$inferSelect;
export type InsertTaxTable = z.infer<typeof insertTaxTableSchema>;

export type TaxBracket = typeof taxBrackets.$inferSelect;
export type InsertTaxBracket = z.infer<typeof insertTaxBracketSchema>;

export type EmployeeTaxElection = typeof employeeTaxElections.$inferSelect;
export type InsertEmployeeTaxElection = z.infer<typeof insertEmployeeTaxElectionSchema>;

export type PayrollTaxCalculation = typeof payrollTaxCalculations.$inferSelect;
export type InsertPayrollTaxCalculation = z.infer<typeof insertPayrollTaxCalculationSchema>;

export type PayrollTaxSetting = typeof payrollTaxSettings.$inferSelect;
export type InsertPayrollTaxSetting = z.infer<typeof insertPayrollTaxSettingSchema>;

export type SpecialTaxSituation = typeof specialTaxSituations.$inferSelect;
export type InsertSpecialTaxSituation = z.infer<typeof insertSpecialTaxSituationSchema>;

export type TaxUpdateLog = typeof taxUpdateLogs.$inferSelect;
export type InsertTaxUpdateLog = z.infer<typeof insertTaxUpdateLogSchema>;