/**
 * PaySurity Employee Schema
 * 
 * This file defines the database schema for employees and related entities
 * to support the payroll tax calculation system.
 */

import { pgTable, serial, text, integer, decimal, timestamp, boolean, pgEnum, uniqueIndex, foreignKey, date, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Employee Status
export const employeeStatusEnum = pgEnum('employee_status', [
  'active', 'terminated', 'leave_of_absence', 'suspended', 'pending'
]);

// Employment Type
export const employmentTypeEnum = pgEnum('employment_type', [
  'full_time', 'part_time', 'contract', 'seasonal', 'intern', 'temporary'
]);

// Pay Type
export const payTypeEnum = pgEnum('pay_type', [
  'hourly', 'salary', 'commission', 'hybrid', 'piece_rate'
]);

// Pay Frequency
export const payFrequencyEnum = pgEnum('pay_frequency', [
  'weekly', 'biweekly', 'semimonthly', 'monthly', 'quarterly', 'annually'
]);

// Create employees table
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id').notNull(),
  employeeNumber: text('employee_number'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  middleName: text('middle_name'),
  email: text('email'),
  phone: text('phone'),
  status: employeeStatusEnum('status').notNull().default('pending'),
  employmentType: employmentTypeEnum('employment_type'),
  department: text('department'),
  position: text('position'),
  manager: integer('manager_id'),
  hireDate: date('hire_date'),
  terminationDate: date('termination_date'),
  dateOfBirth: date('date_of_birth'),
  ssn: text('ssn'),
  address1: text('address1'),
  address2: text('address2'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country').default('US'),
  // Pay information
  payType: payTypeEnum('pay_type'),
  payRate: decimal('pay_rate', { precision: 12, scale: 2 }),
  payFrequency: payFrequencyEnum('pay_frequency'),
  standardHours: decimal('standard_hours', { precision: 6, scale: 2 }),
  overtimeEligible: boolean('overtime_eligible').default(true),
  // Work location (for tax purposes)
  workAddress1: text('work_address1'),
  workAddress2: text('work_address2'),
  workCity: text('work_city'),
  workState: text('work_state'),
  workZipCode: text('work_zip_code'),
  workCountry: text('work_country').default('US'),
  workCounty: text('work_county'),
  // Banking information
  directDepositEnabled: boolean('direct_deposit_enabled').default(false),
  bankName: text('bank_name'),
  accountType: text('account_type'),
  accountNumber: text('account_number'),
  routingNumber: text('routing_number'),
  depositAmount: text('deposit_amount').default('100%'), // Can be percentage or fixed amount
  secondaryBankName: text('secondary_bank_name'),
  secondaryAccountType: text('secondary_account_type'),
  secondaryAccountNumber: text('secondary_account_number'),
  secondaryRoutingNumber: text('secondary_routing_number'),
  secondaryDepositAmount: text('secondary_deposit_amount'),
  // System fields
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Create payroll runs table
export const payrollRuns = pgTable('payroll_runs', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id').notNull(),
  payrollPeriodStart: date('payroll_period_start').notNull(),
  payrollPeriodEnd: date('payroll_period_end').notNull(),
  payDate: date('pay_date').notNull(),
  payFrequency: payFrequencyEnum('pay_frequency').notNull(),
  status: text('status').notNull().default('draft'), // draft, processing, approved, completed, cancelled
  totalGrossPay: decimal('total_gross_pay', { precision: 12, scale: 2 }),
  totalNetPay: decimal('total_net_pay', { precision: 12, scale: 2 }),
  totalTaxes: decimal('total_taxes', { precision: 12, scale: 2 }),
  totalDeductions: decimal('total_deductions', { precision: 12, scale: 2 }),
  notes: text('notes'),
  approvedBy: integer('approved_by'),
  approvedAt: timestamp('approved_at'),
  processedAt: timestamp('processed_at'),
  createdBy: integer('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Create payroll entries table (one entry per employee per payroll run)
export const payrollEntries = pgTable('payroll_entries', {
  id: serial('id').primaryKey(),
  payrollRunId: integer('payroll_run_id').notNull(),
  employeeId: integer('employee_id').notNull(),
  regularHours: decimal('regular_hours', { precision: 8, scale: 2 }),
  overtimeHours: decimal('overtime_hours', { precision: 8, scale: 2 }),
  doubleTimeHours: decimal('double_time_hours', { precision: 8, scale: 2 }),
  ptoHours: decimal('pto_hours', { precision: 8, scale: 2 }),
  holidayHours: decimal('holiday_hours', { precision: 8, scale: 2 }),
  sickHours: decimal('sick_hours', { precision: 8, scale: 2 }),
  otherHours: decimal('other_hours', { precision: 8, scale: 2 }),
  regularRate: decimal('regular_rate', { precision: 12, scale: 2 }).notNull(),
  overtimeRate: decimal('overtime_rate', { precision: 12, scale: 2 }),
  doubleTimeRate: decimal('double_time_rate', { precision: 12, scale: 2 }),
  grossPay: decimal('gross_pay', { precision: 12, scale: 2 }).notNull(),
  netPay: decimal('net_pay', { precision: 12, scale: 2 }),
  totalTaxes: decimal('total_taxes', { precision: 12, scale: 2 }),
  totalDeductions: decimal('total_deductions', { precision: 12, scale: 2 }),
  paymentMethod: text('payment_method').default('direct_deposit'),
  checkNumber: text('check_number'),
  notes: text('notes'),
  status: text('status').notNull().default('pending'), // pending, approved, paid, cancelled
  additionalEarnings: json('additional_earnings'),
  deductions: json('deductions'),
  taxes: json('taxes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    employeeFk: foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employees.id]
    }),
    payrollRunFk: foreignKey({
      columns: [table.payrollRunId],
      foreignColumns: [payrollRuns.id]
    })
  };
});

// Create employee benefits table
export const employeeBenefits = pgTable('employee_benefits', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').notNull(),
  benefitType: text('benefit_type').notNull(), // health_insurance, dental, vision, 401k, life_insurance, etc.
  planName: text('plan_name').notNull(),
  planId: text('plan_id'),
  coverageLevel: text('coverage_level'), // employee_only, employee_spouse, family, etc.
  employeeContribution: decimal('employee_contribution', { precision: 12, scale: 2 }),
  employerContribution: decimal('employer_contribution', { precision: 12, scale: 2 }),
  contributionFrequency: payFrequencyEnum('contribution_frequency'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  isActive: boolean('is_active').default(true),
  customFields: json('custom_fields'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    employeeFk: foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employees.id]
    })
  };
});

// Create employee documents table
export const employeeDocuments = pgTable('employee_documents', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').notNull(),
  documentType: text('document_type').notNull(), // w4, i9, offer_letter, etc.
  documentName: text('document_name').notNull(),
  documentPath: text('document_path').notNull(),
  uploadedBy: integer('uploaded_by'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  expirationDate: date('expiration_date'),
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    employeeFk: foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employees.id]
    })
  };
});

// Create leave balances table
export const employeeLeaveBalances = pgTable('employee_leave_balances', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').notNull(),
  leaveType: text('leave_type').notNull(), // vacation, sick, personal, etc.
  balanceHours: decimal('balance_hours', { precision: 8, scale: 2 }).notNull(),
  accrualRate: decimal('accrual_rate', { precision: 8, scale: 4 }), // Hours accrued per period
  accrualFrequency: text('accrual_frequency'), // per_pay_period, monthly, annually
  maxAccrual: decimal('max_accrual', { precision: 8, scale: 2 }),
  carryOverLimit: decimal('carry_over_limit', { precision: 8, scale: 2 }),
  asOfDate: date('as_of_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    employeeFk: foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employees.id]
    })
  };
});

// Zod schemas for validation
export const insertEmployeeSchema = createInsertSchema(employees);
export const insertPayrollRunSchema = createInsertSchema(payrollRuns);
export const insertPayrollEntrySchema = createInsertSchema(payrollEntries);
export const insertEmployeeBenefitSchema = createInsertSchema(employeeBenefits);
export const insertEmployeeDocumentSchema = createInsertSchema(employeeDocuments);
export const insertEmployeeLeaveBalanceSchema = createInsertSchema(employeeLeaveBalances);

// TypeScript types
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type PayrollRun = typeof payrollRuns.$inferSelect;
export type InsertPayrollRun = z.infer<typeof insertPayrollRunSchema>;

export type PayrollEntry = typeof payrollEntries.$inferSelect;
export type InsertPayrollEntry = z.infer<typeof insertPayrollEntrySchema>;

export type EmployeeBenefit = typeof employeeBenefits.$inferSelect;
export type InsertEmployeeBenefit = z.infer<typeof insertEmployeeBenefitSchema>;

export type EmployeeDocument = typeof employeeDocuments.$inferSelect;
export type InsertEmployeeDocument = z.infer<typeof insertEmployeeDocumentSchema>;

export type EmployeeLeaveBalance = typeof employeeLeaveBalances.$inferSelect;
export type InsertEmployeeLeaveBalance = z.infer<typeof insertEmployeeLeaveBalanceSchema>;