import { pgTable, text, serial, integer, boolean, numeric, timestamp, pgEnum, date, jsonb, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// HubSpot integration tokens
export const hubspotTokens = pgTable("hubspot_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  tokenData: jsonb("token_data"), // Additional token data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHubspotTokenSchema = createInsertSchema(hubspotTokens).pick({
  userId: true,
  accessToken: true,
  refreshToken: true,
  expiresAt: true,
  tokenData: true,
});

export type HubspotToken = typeof hubspotTokens.$inferSelect;
export type InsertHubspotToken = typeof hubspotTokens.$inferInsert;

// User roles enum
export const userRoleEnum = pgEnum("user_role", ["admin", "developer", "executive", "finance", "marketing", "employee", "employer", "parent", "child", "affiliate"]);

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin", "developer", "executive", "finance", "marketing", "employee", "employer", "parent", "child", "affiliate"] }).notNull().default("executive"),
  department: text("department"),
  organizationId: integer("organization_id"),
  dateOfBirth: date("date_of_birth"),
  ssn: text("ssn"),  // For Payroll purposes, stores last 4 digits or encrypted
  address: text("address"), // Could be split into multiple fields in production
  parentUserId: integer("parent_user_id"), // For child accounts to link to parent
  dependents: integer("dependents"), // Number of dependents for tax calculations
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  accountLocked: boolean("account_locked").default(false),
  accountLockedUntil: timestamp("account_locked_until"),
  passwordLastChanged: timestamp("password_last_changed"),
  securityQuestions: jsonb("security_questions"), // For account recovery
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"), // For storing 2FA secret
  stripeCustomerId: text("stripe_customer_id"), // For Stripe integration
  stripeSubscriptionId: text("stripe_subscription_id"), // For Stripe subscriptions
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  department: true,
  organizationId: true,
  dateOfBirth: true,
  ssn: true,
  address: true,
  parentUserId: true,
  dependents: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

// Wallet types enum
export const walletTypeEnum = pgEnum("wallet_type", ["main", "expense", "savings", "hsa", "retirement", "child"]);

// Wallet schema
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  balance: numeric("balance").notNull().default("0"),
  monthlyLimit: numeric("monthly_limit"),
  dailyLimit: numeric("daily_limit"),
  weeklyLimit: numeric("weekly_limit"),
  walletType: text("wallet_type", { enum: ["main", "expense", "savings", "hsa", "retirement", "child"] }).notNull().default("main"),
  isMain: boolean("is_main").notNull().default(false),
  parentWalletId: integer("parent_wallet_id"), // For child/sub-wallets to link to parent wallet
  autoRefill: boolean("auto_refill").default(false), // For auto-refilling allowances
  refillAmount: numeric("refill_amount"), // Amount to refill
  refillFrequency: text("refill_frequency"), // daily, weekly, monthly
  lastRefillDate: timestamp("last_refill_date"),
  nextRefillDate: timestamp("next_refill_date"),
  categoryRestrictions: text("category_restrictions"), // Comma-separated list of allowed expense types
  merchantRestrictions: text("merchant_restrictions"), // Comma-separated list of allowed merchants
  requiresApproval: boolean("requires_approval").default(false), // For transactions requiring parent/employer approval
  taxAdvantaged: boolean("tax_advantaged").default(false), // For HSA and retirement accounts
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  balance: true,
  monthlyLimit: true,
  dailyLimit: true,
  weeklyLimit: true,
  walletType: true,
  isMain: true,
  parentWalletId: true,
  autoRefill: true,
  refillAmount: true,
  refillFrequency: true,
  categoryRestrictions: true,
  merchantRestrictions: true,
  requiresApproval: true,
  taxAdvantaged: true,
});

// Transaction types
export const transactionTypeEnum = pgEnum("transaction_type", ["incoming", "outgoing"]);

// Transaction methods
export const transactionMethodEnum = pgEnum("transaction_method", ["wallet", "credit_card", "ach", "wire", "other"]);

// Expense types
export const expenseTypeEnum = pgEnum("expense_type", [
  "meals",
  "transportation",
  "entertainment",
  "office_supplies",
  "marketing",
  "software",
  "hardware",
  "utilities",
  "rent",
  "salary",
  "taxes",
  "deposit",
  "allocation",
  "transfer",
  "personal",
  "other"
]);

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull(),
  userId: integer("user_id").notNull(),
  amount: numeric("amount").notNull(),
  type: text("type").notNull(),
  method: text("method").notNull(),
  merchantName: text("merchant_name"),
  merchantPhone: text("merchant_phone"),
  merchantCity: text("merchant_city"),
  merchantState: text("merchant_state"),
  merchantCountry: text("merchant_country"),
  sourceOfFunds: text("source_of_funds"),
  expenseType: text("expense_type"),
  isPersonal: boolean("is_personal").default(false),
  needsApproval: boolean("needs_approval").default(false), // For transactions requiring parent/employer approval
  approvalStatus: text("approval_status").default("not_required"), // not_required, pending, approved, rejected
  approvedBy: integer("approved_by"), // ID of the user who approved or rejected
  approvalDate: timestamp("approval_date"),
  rejectionReason: text("rejection_reason"), // Reason for rejection if applicable
  receiptImageUrl: text("receipt_image_url"), // URL to uploaded receipt image
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  walletId: true,
  userId: true,
  amount: true,
  type: true,
  method: true,
  merchantName: true,
  merchantPhone: true,
  merchantCity: true,
  merchantState: true,
  merchantCountry: true,
  sourceOfFunds: true,
  expenseType: true,
  isPersonal: true,
  needsApproval: true,
  approvalStatus: true,
  approvedBy: true,
  rejectionReason: true,
  receiptImageUrl: true,
});

// Bank account schema
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bankName: text("bank_name").notNull(),
  accountType: text("account_type").notNull(),
  accountNumber: text("account_number").notNull(),
  routingNumber: text("routing_number").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).pick({
  userId: true,
  bankName: true,
  accountType: true,
  accountNumber: true,
  routingNumber: true,
  isActive: true,
});

// Fund request schema
export const fundRequests = pgTable("fund_requests", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull(),
  approverId: integer("approver_id"),
  amount: numeric("amount").notNull(),
  reason: text("reason"),
  urgency: text("urgency").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFundRequestSchema = createInsertSchema(fundRequests).pick({
  requesterId: true,
  approverId: true,
  amount: true,
  reason: true,
  urgency: true,
  status: true,
});

// Payroll schema
export const payrollPeriodEnum = pgEnum("Payroll_period", ["daily", "weekly", "biweekly", "monthly"]);
export const compensationTypeEnum = pgEnum("compensation_type", ["w2", "1099", "corp_to_corp"]);

export const payrollEntries = pgTable("payroll_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  employerId: integer("employer_id").notNull(), // The employer processing this Payroll
  payPeriodStart: date("pay_period_start").notNull(),
  payPeriodEnd: date("pay_period_end").notNull(),
  payDate: date("pay_date").notNull(),
  hoursWorked: numeric("hours_worked").notNull().default("0"),
  regularRate: numeric("regular_rate").notNull(), // Hourly rate
  overtimeRate: numeric("overtime_rate"),
  regularPay: numeric("regular_pay").notNull(), // Regular pay amount
  overtimePay: numeric("overtime_pay").default("0"),
  bonusPay: numeric("bonus_pay").default("0"),
  commissionPay: numeric("commission_pay").default("0"),
  grossPay: numeric("gross_pay").notNull(), // Total pay before deductions
  federalTax: numeric("federal_tax"), // Federal income tax withholding
  stateTax: numeric("state_tax"), // State income tax withholding
  socialSecurity: numeric("social_security"), // Social Security tax
  medicare: numeric("medicare"), // Medicare tax
  otherDeductions: numeric("other_deductions").default("0"),
  hsaContribution: numeric("hsa_contribution").default("0"), // Employee HSA contribution
  retirementContribution: numeric("retirement_contribution").default("0"), // Employee retirement contribution
  employerHsaMatch: numeric("employer_hsa_match").default("0"), // Employer HSA contribution
  employerRetirementMatch: numeric("employer_retirement_match").default("0"), // Employer retirement match
  netPay: numeric("net_pay").notNull(), // Take-home pay
  compensationType: text("compensation_type", { enum: ["w2", "1099", "corp_to_corp"] }).notNull(),
  payPeriod: text("pay_period", { enum: ["daily", "weekly", "biweekly", "monthly"] }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, error
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const insertPayrollEntrySchema = createInsertSchema(payrollEntries).pick({
  userId: true,
  employerId: true,
  payPeriodStart: true,
  payPeriodEnd: true,
  payDate: true,
  hoursWorked: true,
  regularRate: true,
  overtimeRate: true,
  regularPay: true,
  overtimePay: true,
  bonusPay: true,
  commissionPay: true,
  grossPay: true,
  federalTax: true,
  stateTax: true,
  socialSecurity: true,
  medicare: true,
  otherDeductions: true,
  hsaContribution: true,
  retirementContribution: true,
  employerHsaMatch: true,
  employerRetirementMatch: true,
  netPay: true,
  compensationType: true,
  payPeriod: true,
  status: true,
  notes: true,
});

// Time tracking schema
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  employerId: integer("employer_id").notNull(),
  date: date("date").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  hoursWorked: numeric("hours_worked"),
  breakMinutes: numeric("break_minutes").default("0"),
  isVacation: boolean("is_vacation").default(false),
  isSickLeave: boolean("is_sick_leave").default(false),
  isHoliday: boolean("is_holiday").default(false),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).pick({
  userId: true,
  employerId: true,
  date: true,
  startTime: true,
  endTime: true,
  hoursWorked: true,
  breakMinutes: true,
  isVacation: true,
  isSickLeave: true,
  isHoliday: true,
  notes: true,
  status: true,
});

// HSA and Retirement Accounts
export const accountRequests = pgTable("account_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Employee requesting funds
  employerId: integer("employer_id").notNull(), // Employer who needs to approve
  walletId: integer("wallet_id").notNull(), // The HSA or retirement wallet
  requestType: text("request_type").notNull(), // "hsa_contribution", "retirement_contribution"
  amount: numeric("amount").notNull(),
  employerMatchAmount: numeric("employer_match_amount"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
});

export const insertAccountRequestSchema = createInsertSchema(accountRequests).pick({
  userId: true,
  employerId: true,
  walletId: true,
  requestType: true,
  amount: true,
  employerMatchAmount: true,
  status: true,
  notes: true,
});

// Expense Reports
export const expenseReportStatusEnum = pgEnum("expense_report_status", [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "paid",
  "canceled"
]);

export const expenseReports = pgTable("expense_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Employee submitting the report
  employerId: integer("employer_id").notNull(), // Employer who needs to approve
  title: text("title").notNull(),
  description: text("description"),
  totalAmount: numeric("total_amount").notNull().default("0"),
  currency: text("currency").notNull().default("USD"),
  status: text("status", { 
    enum: ["draft", "submitted", "under_review", "approved", "rejected", "paid", "canceled"] 
  }).notNull().default("draft"),
  submissionDate: timestamp("submission_date"),
  reviewDate: timestamp("review_date"),
  reviewedBy: integer("reviewed_by"), // User ID who reviewed the report
  approvalDate: timestamp("approval_date"),
  paymentDate: timestamp("payment_date"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertExpenseReportSchema = createInsertSchema(expenseReports).pick({
  userId: true,
  employerId: true,
  title: true,
  description: true,
  totalAmount: true,
  currency: true,
  status: true,
  submissionDate: true,
  reviewedBy: true,
  rejectionReason: true,
});

export type ExpenseReport = typeof expenseReports.$inferSelect;
export type InsertExpenseReport = typeof expenseReports.$inferInsert;

// Expense Line Items
export const expenseLineItems = pgTable("expense_line_items", {
  id: serial("id").primaryKey(),
  expenseReportId: integer("expense_report_id").notNull(),
  amount: numeric("amount").notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  category: text("category").notNull(),
  merchant: text("merchant"),
  receiptImageUrl: text("receipt_image_url"),
  notes: text("notes"),
  isPersonal: boolean("is_personal").default(false),
  isBillable: boolean("is_billable").default(false),
  billableClientId: integer("billable_client_id"),
  billableProjectId: integer("billable_project_id"),
  taxAmount: numeric("tax_amount"),
  currency: text("currency").notNull().default("USD"),
  exchangeRate: numeric("exchange_rate").default("1"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertExpenseLineItemSchema = createInsertSchema(expenseLineItems).pick({
  expenseReportId: true,
  amount: true,
  description: true,
  date: true,
  category: true,
  merchant: true,
  receiptImageUrl: true,
  notes: true,
  isPersonal: true,
  isBillable: true,
  billableClientId: true,
  billableProjectId: true,
  taxAmount: true,
  currency: true,
  exchangeRate: true,
});

export type ExpenseLineItem = typeof expenseLineItems.$inferSelect;
export type InsertExpenseLineItem = typeof expenseLineItems.$inferInsert;

// Import relations function from drizzle-orm
import { relations } from "drizzle-orm";

// Create relations between entities
export const expenseReportsRelations = relations(expenseReports, ({ one, many }) => ({
  employee: one(users, {
    fields: [expenseReports.userId],
    references: [users.id],
  }),
  employer: one(users, {
    fields: [expenseReports.employerId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [expenseReports.reviewedBy],
    references: [users.id],
    relationName: "expense_report_reviewer"
  }),
  lineItems: many(expenseLineItems)
}));

export const expenseLineItemsRelations = relations(expenseLineItems, ({ one }) => ({
  expenseReport: one(expenseReports, {
    fields: [expenseLineItems.expenseReportId],
    references: [expenseReports.id],
  })
}));

// Spending Controls
export const spendingControls = pgTable("spending_controls", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull(),
  createdById: integer("created_by_id").notNull(), // Parent or employer who created the control
  merchantCategory: text("merchant_category"), // MCC code or category
  merchant: text("merchant"), // Specific merchant name
  amountLimit: numeric("amount_limit"), // Max amount per transaction
  isBlocked: boolean("is_blocked").default(false), // Block all transactions matching criteria
  isRequired: boolean("is_required").default(false), // Must match criteria to allow transaction
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSpendingControlSchema = createInsertSchema(spendingControls).pick({
  walletId: true,
  createdById: true,
  merchantCategory: true,
  merchant: true,
  amountLimit: true,
  isBlocked: true,
  isRequired: true,
  isActive: true,
});

// Educational Content
export const educationalContent = pgTable("educational_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  contentType: text("content_type").notNull(), // article, video, quiz
  contentUrl: text("content_url"),
  targetAgeGroup: text("target_age_group"), // child, teen, young_adult, adult
  category: text("category").notNull(), // budgeting, saving, investing, taxes
  createdById: integer("created_by_id"),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEducationalContentSchema = createInsertSchema(educationalContent).pick({
  title: true,
  description: true,
  contentType: true,
  contentUrl: true,
  targetAgeGroup: true,
  category: true,
  createdById: true,
  isPublished: true,
});

// Savings Goals

export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletId: integer("wallet_id"),
  title: text("title").notNull(),
  description: text("description"),
  targetAmount: numeric("target_amount").notNull(),
  currentAmount: numeric("current_amount").notNull().default("0"),
  targetDate: date("target_date"),
  parentMatchPercentage: numeric("parent_match_percentage"), // For parent matching child savings
  startDate: date("start_date").defaultNow(),
  achievedDate: date("achieved_date"),
  status: text("status", { 
    enum: ["active", "paused", "achieved", "cancelled"] 
  }).notNull().default("active"),
  isCompleted: boolean("is_completed").default(false),
  imageUrl: text("image_url"), // For the goal item image
  category: text("category"), // electronics, toys, experiences, education, etc.
  autoContribute: boolean("auto_contribute").default(false),
  autoContributeAmount: numeric("auto_contribute_amount"),
  autoContributeFrequency: text("auto_contribute_frequency"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).pick({
  userId: true,
  walletId: true,
  title: true,
  description: true,
  targetAmount: true,
  currentAmount: true,
  targetDate: true,
  parentMatchPercentage: true,
  startDate: true,
  status: true,
  isCompleted: true,
  imageUrl: true,
  category: true,
  autoContribute: true,
  autoContributeAmount: true,
  autoContributeFrequency: true,
});

// Accounting Integrations
export const accountingIntegrations = pgTable("accounting_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  providerType: text("provider_type").notNull(), // quickbooks, xero, etc.
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  companyId: text("company_id"),
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAccountingIntegrationSchema = createInsertSchema(accountingIntegrations).pick({
  userId: true,
  providerType: true,
  accessToken: true,
  refreshToken: true,
  tokenExpiresAt: true,
  companyId: true,
  isActive: true,
});

// Merchant Profile Schema
export const merchantTypeEnum = pgEnum("merchant_type", ["retail", "restaurant", "service", "online", "healthcare", "education", "other"]);
export const merchantStatusEnum = pgEnum("merchant_status", ["pending", "active", "suspended", "inactive"]);

export const merchantProfiles = pgTable("merchant_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Link to the user who owns/manages this merchant
  businessName: text("business_name").notNull(),
  businessType: text("business_type", { enum: ["retail", "restaurant", "service", "online", "healthcare", "education", "other"] }).notNull(),
  taxId: text("tax_id").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  country: text("country").notNull().default("USA"),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  website: text("website"),
  description: text("description"),
  logo: text("logo_url"),
  referralCode: text("referral_code"), // Affiliate referral code used during signup
  status: text("status", { enum: ["pending", "active", "suspended", "inactive"] }).notNull().default("pending"),
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, verified, rejected
  verificationDocuments: jsonb("verification_documents"), // Document URLs and metadata
  processingFeePercentage: numeric("processing_fee_percentage"), // The percentage fee charged per transaction
  monthlyFee: numeric("monthly_fee"), // Monthly subscription fee
  payoutSchedule: text("payout_schedule"), // daily, weekly, bi-weekly, monthly
  timezone: text("timezone").default("UTC"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMerchantProfileSchema = createInsertSchema(merchantProfiles).pick({
  userId: true,
  businessName: true,
  businessType: true,
  taxId: true,
  address: true,
  city: true,
  state: true,
  zip: true,
  country: true,
  phone: true,
  email: true,
  website: true,
  description: true,
  logo: true,
  referralCode: true,
  status: true,
  processingFeePercentage: true,
  monthlyFee: true,
  payoutSchedule: true,
  timezone: true,
});

// Payment Gateway Schema
export const paymentGatewayTypeEnum = pgEnum("payment_gateway_type", ["stripe", "paypal", "square", "adyen", "helcim", "custom"]);

export const paymentGateways = pgTable("payment_gateways", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Link to the merchant profile
  gatewayType: text("gateway_type", { enum: ["stripe", "paypal", "square", "adyen", "helcim", "custom"] }).notNull(),
  accountId: text("account_id"), // External account/merchant ID in the payment system
  apiKey: text("api_key"), // Encrypted API key
  publicKey: text("public_key"), // Public API key
  webhookSecret: text("webhook_secret"), // Encrypted webhook secret
  isActive: boolean("is_active").notNull().default(true),
  supportedPaymentMethods: jsonb("supported_payment_methods"), // Array of payment methods supported
  processingFeeSettings: jsonb("processing_fee_settings"), // Custom fee settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentGatewaySchema = createInsertSchema(paymentGateways).pick({
  merchantId: true,
  gatewayType: true,
  accountId: true,
  apiKey: true,
  publicKey: true,
  webhookSecret: true,
  isActive: true,
  supportedPaymentMethods: true,
  processingFeeSettings: true,
});

// POS Tenant Management Schema
export const posTenantStatusEnum = pgEnum("pos_tenant_status", ["active", "pending", "inactive", "suspended"]);
export const posSubscriptionTypeEnum = pgEnum("pos_subscription_type", ["basic", "standard", "premium", "enterprise"]);
export const posIndustryTypeEnum = pgEnum("pos_industry_type", ["restaurant", "retail", "grocery", "healthcare", "legal", "salon", "other"]);

export const posTenants = pgTable("pos_tenants", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  subdomain: text("subdomain").notNull().unique(), // Automatically generated from business name
  customDomain: text("custom_domain"),
  industry: text("industry", { enum: ["restaurant", "retail", "grocery", "healthcare", "legal", "salon", "other"] }).notNull(),
  subscriptionType: text("subscription_type", { enum: ["basic", "standard", "premium", "enterprise"] }).notNull().default("basic"),
  status: text("status", { enum: ["active", "pending", "inactive", "suspended"] }).notNull().default("pending"),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#4F46E5"),
  secondaryColor: text("secondary_color").default("#10B981"),
  activeInstancesCount: integer("active_instances_count").notNull().default(0),
  features: jsonb("features").default("[]"),
  notes: text("notes"),
  activatedAt: timestamp("activated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosTenantSchema = createInsertSchema(posTenants).pick({
  businessName: true,
  subdomain: true, 
  customDomain: true,
  industry: true,
  subscriptionType: true,
  status: true,
  contactName: true,
  contactEmail: true,
  contactPhone: true,
  logoUrl: true,
  primaryColor: true,
  secondaryColor: true,
  features: true,
  notes: true,
});

// Point of Sale Schema
export const posTypes = pgEnum("pos_type", ["mobile", "countertop", "kiosk", "virtual"]);

export const pointOfSaleSystems = pgTable("point_of_sale_systems", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  tenantId: integer("tenant_id"), // References posTenants 
  deviceId: text("device_id").notNull(), // Unique device identifier
  deviceName: text("device_name").notNull(),
  deviceType: text("device_type", { enum: ["mobile", "countertop", "kiosk", "virtual"] }).notNull(),
  deviceModel: text("device_model"),
  serialNumber: text("serial_number"),
  operatingSystem: text("operating_system"),
  appVersion: text("app_version"),
  lastCheckIn: timestamp("last_check_in"),
  isActive: boolean("is_active").notNull().default(true),
  location: text("location"), // Store/location name where device is used
  assignedToUserId: integer("assigned_to_user_id"), // User operating this device
  settings: jsonb("settings"), // Device-specific settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPointOfSaleSystemSchema = createInsertSchema(pointOfSaleSystems).pick({
  merchantId: true,
  deviceId: true,
  deviceName: true,
  deviceType: true,
  deviceModel: true,
  serialNumber: true,
  operatingSystem: true,
  appVersion: true,
  isActive: true,
  location: true,
  assignedToUserId: true,
  settings: true,
});

// Loyalty Program Schema
export const loyaltyProgramTypes = pgEnum("loyalty_program_type", ["points", "visits", "tiered", "cashback", "subscription"]);

export const loyaltyPrograms = pgTable("loyalty_programs", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  programType: text("program_type", { enum: ["points", "visits", "tiered", "cashback", "subscription"] }).notNull(),
  pointsPerDollar: numeric("points_per_dollar"), // For points programs
  pointValueInCents: numeric("point_value_in_cents"), // Value of 1 point in cents
  visitsForReward: integer("visits_for_reward"), // For visit-based programs
  tiers: jsonb("tiers"), // For tiered programs
  cashbackPercentage: numeric("cashback_percentage"), // For cashback programs
  subscriptionCost: numeric("subscription_cost"), // For subscription programs
  subscriptionPeriod: text("subscription_period"), // monthly, yearly
  subscriptionBenefits: jsonb("subscription_benefits"), // Benefits included
  enrollmentBonusPoints: integer("enrollment_bonus_points"),
  expirationPeriodDays: integer("expiration_period_days"), // Days until points expire
  isActive: boolean("is_active").notNull().default(true),
  termsAndConditions: text("terms_and_conditions"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"), // Optional end date
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLoyaltyProgramSchema = createInsertSchema(loyaltyPrograms).pick({
  merchantId: true,
  name: true,
  description: true,
  programType: true,
  pointsPerDollar: true,
  pointValueInCents: true,
  visitsForReward: true,
  tiers: true,
  cashbackPercentage: true,
  subscriptionCost: true,
  subscriptionPeriod: true,
  subscriptionBenefits: true,
  enrollmentBonusPoints: true,
  expirationPeriodDays: true,
  isActive: true,
  termsAndConditions: true,
  startDate: true,
  endDate: true,
});

// Customer Loyalty Accounts
export const customerLoyaltyAccounts = pgTable("customer_loyalty_accounts", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull(), // Reference to the loyalty program
  userId: integer("user_id").notNull(), // The customer/user
  membershipNumber: text("membership_number").notNull(),
  pointsBalance: integer("points_balance").notNull().default(0),
  lifetimePoints: integer("lifetime_points").notNull().default(0),
  visitsCount: integer("visits_count").notNull().default(0),
  currentTier: text("current_tier"), // Current loyalty tier
  tierExpirationDate: timestamp("tier_expiration_date"),
  lastActivityDate: timestamp("last_activity_date"),
  isActive: boolean("is_active").notNull().default(true),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomerLoyaltyAccountSchema = createInsertSchema(customerLoyaltyAccounts).pick({
  programId: true,
  userId: true,
  membershipNumber: true,
  pointsBalance: true,
  lifetimePoints: true,
  visitsCount: true,
  currentTier: true,
  tierExpirationDate: true,
  lastActivityDate: true,
  isActive: true,
  notes: true,
});

// Promotional Campaign Schema
export const campaignTypes = pgEnum("campaign_type", ["discount", "reward", "loyalty_bonus", "referral", "location_based", "welcome"]);

export const promotionalCampaigns = pgTable("promotional_campaigns", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  campaignType: text("campaign_type", { enum: ["discount", "reward", "loyalty_bonus", "referral", "location_based", "welcome"] }).notNull(),
  discountType: text("discount_type"), // percentage, fixed_amount
  discountValue: numeric("discount_value"), // Value of the discount
  minPurchaseAmount: numeric("min_purchase_amount"), // Minimum purchase required
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  targetAudience: jsonb("target_audience"), // Targeting criteria
  maxRedemptions: integer("max_redemptions"), // Max number of times campaign can be redeemed
  currentRedemptions: integer("current_redemptions").notNull().default(0),
  promoCode: text("promo_code"), // Optional promo code
  locationId: integer("location_id"), // For location-based promotions
  radiusInMiles: numeric("radius_in_miles"), // Radius for location-based notifications
  triggerBehavior: text("trigger_behavior"), // entry, exit, dwell
  displayImage: text("display_image_url"), // Image URL for the promotion
  notificationMessage: text("notification_message"), // Push notification text
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPromotionalCampaignSchema = createInsertSchema(promotionalCampaigns).pick({
  merchantId: true,
  name: true,
  description: true,
  campaignType: true,
  discountType: true,
  discountValue: true,
  minPurchaseAmount: true,
  startDate: true,
  endDate: true,
  isActive: true,
  targetAudience: true,
  maxRedemptions: true,
  promoCode: true,
  locationId: true,
  radiusInMiles: true,
  triggerBehavior: true,
  displayImage: true,
  notificationMessage: true,
});

// Data Analytics Schema
export const analyticsReports = pgTable("analytics_reports", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  reportName: text("report_name").notNull(),
  reportType: text("report_type").notNull(), // sales, customer, inventory, marketing
  dateRange: jsonb("date_range").notNull(),
  parameters: jsonb("parameters"), // Report configuration parameters
  chartType: text("chart_type"), // bar, line, pie, etc.
  schedule: text("schedule"), // For scheduled reports
  lastGenerated: timestamp("last_generated"),
  createdById: integer("created_by_id").notNull(),
  isPublic: boolean("is_public").default(false),
  reportData: jsonb("report_data"), // Cached report results
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAnalyticsReportSchema = createInsertSchema(analyticsReports).pick({
  merchantId: true,
  reportName: true,
  reportType: true,
  dateRange: true,
  parameters: true,
  chartType: true,
  schedule: true,
  createdById: true,
  isPublic: true,
});

// Business Financing Options
export const financingTypes = pgEnum("financing_type", ["merchant_cash_advance", "working_capital", "equipment", "expansion", "inventory"]);
export const financingStatusEnum = pgEnum("financing_status", ["applied", "under_review", "approved", "funded", "repaying", "completed", "declined"]);

export const businessFinancing = pgTable("business_financing", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  financingType: text("financing_type", { enum: ["merchant_cash_advance", "working_capital", "equipment", "expansion", "inventory"] }).notNull(),
  requestedAmount: numeric("requested_amount").notNull(),
  approvedAmount: numeric("approved_amount"),
  interestRate: numeric("interest_rate"),
  term: integer("term"), // Term in months
  repaymentType: text("repayment_type"), // daily_percentage, fixed_payment
  repaymentAmount: numeric("repayment_amount"),
  totalRepaid: numeric("total_repaid").default("0"),
  applicationDate: timestamp("application_date").defaultNow(),
  approvalDate: timestamp("approval_date"),
  fundingDate: timestamp("funding_date"),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  actualCompletionDate: timestamp("actual_completion_date"),
  status: text("status", { enum: ["applied", "under_review", "approved", "funded", "repaying", "completed", "declined"] }).notNull().default("applied"),
  creditScore: integer("credit_score"),
  monthlyRevenue: numeric("monthly_revenue"),
  timeInBusiness: integer("time_in_business"), // Time in months
  purpose: text("purpose"),
  documents: jsonb("documents"), // Document URLs and metadata
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBusinessFinancingSchema = createInsertSchema(businessFinancing).pick({
  merchantId: true,
  financingType: true,
  requestedAmount: true,
  approvedAmount: true,
  interestRate: true,
  term: true,
  repaymentType: true,
  repaymentAmount: true,
  totalRepaid: true,
  applicationDate: true,
  approvalDate: true,
  fundingDate: true,
  estimatedCompletionDate: true,
  actualCompletionDate: true,
  status: true,
  creditScore: true,
  monthlyRevenue: true,
  timeInBusiness: true,
  purpose: true,
  documents: true,
  notes: true,
});

// Virtual Terminal Schema
export const virtualTerminals = pgTable("virtual_terminals", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  terminalName: text("terminal_name").notNull(),
  accessCode: text("access_code").notNull(), // Code required to access the terminal
  allowedIpAddresses: jsonb("allowed_ip_addresses"), // Array of allowed IP addresses
  allowedUserIds: jsonb("allowed_user_ids"), // Array of user IDs allowed to access
  maxTransactionAmount: numeric("max_transaction_amount"), // Maximum allowed transaction amount
  allowedPaymentMethods: jsonb("allowed_payment_methods"), // Credit, debit, ACH, etc.
  requiresCvv: boolean("requires_cvv").default(true),
  requiresAvs: boolean("requires_avs").default(true), // Address Verification System
  requiresSignature: boolean("requires_signature").default(false),
  autoCaptureTransactions: boolean("auto_capture_transactions").default(true), // Auto-capture vs auth only
  notificationEmail: text("notification_email"),
  receiptTemplateId: integer("receipt_template_id"),
  isActive: boolean("is_active").notNull().default(true),
  lastAccessedAt: timestamp("last_accessed_at"),
  lastAccessedByUserId: integer("last_accessed_by_user_id"),
  lastAccessedIp: text("last_accessed_ip"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVirtualTerminalSchema = createInsertSchema(virtualTerminals).pick({
  merchantId: true,
  terminalName: true,
  accessCode: true,
  allowedIpAddresses: true,
  allowedUserIds: true,
  maxTransactionAmount: true,
  allowedPaymentMethods: true,
  requiresCvv: true,
  requiresAvs: true,
  requiresSignature: true,
  autoCaptureTransactions: true,
  notificationEmail: true,
  receiptTemplateId: true,
  isActive: true,
});

// Types for frontend usage
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type FundRequest = typeof fundRequests.$inferSelect;
export type InsertFundRequest = z.infer<typeof insertFundRequestSchema>;
export type PayrollEntry = typeof payrollEntries.$inferSelect;
export type InsertPayrollEntry = z.infer<typeof insertPayrollEntrySchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type AccountRequest = typeof accountRequests.$inferSelect;
export type InsertAccountRequest = z.infer<typeof insertAccountRequestSchema>;
export type SpendingControl = typeof spendingControls.$inferSelect;
export type InsertSpendingControl = z.infer<typeof insertSpendingControlSchema>;
export type EducationalContent = typeof educationalContent.$inferSelect;
export type InsertEducationalContent = z.infer<typeof insertEducationalContentSchema>;
export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;
export type AccountingIntegration = typeof accountingIntegrations.$inferSelect;
export type InsertAccountingIntegration = z.infer<typeof insertAccountingIntegrationSchema>;

// New value-added service types
export type MerchantProfile = typeof merchantProfiles.$inferSelect;
export type InsertMerchantProfile = z.infer<typeof insertMerchantProfileSchema>;
export type PaymentGateway = typeof paymentGateways.$inferSelect;
export type InsertPaymentGateway = z.infer<typeof insertPaymentGatewaySchema>;
export type PointOfSaleSystem = typeof pointOfSaleSystems.$inferSelect;
export type InsertPointOfSaleSystem = z.infer<typeof insertPointOfSaleSystemSchema>;
export type LoyaltyProgram = typeof loyaltyPrograms.$inferSelect;
export type InsertLoyaltyProgram = z.infer<typeof insertLoyaltyProgramSchema>;
export type CustomerLoyaltyAccount = typeof customerLoyaltyAccounts.$inferSelect;
export type InsertCustomerLoyaltyAccount = z.infer<typeof insertCustomerLoyaltyAccountSchema>;
export type PromotionalCampaign = typeof promotionalCampaigns.$inferSelect;
export type InsertPromotionalCampaign = z.infer<typeof insertPromotionalCampaignSchema>;
export type AnalyticsReport = typeof analyticsReports.$inferSelect;
export type InsertAnalyticsReport = z.infer<typeof insertAnalyticsReportSchema>;
export type BusinessFinancing = typeof businessFinancing.$inferSelect;
export type InsertBusinessFinancing = z.infer<typeof insertBusinessFinancingSchema>;
export type VirtualTerminal = typeof virtualTerminals.$inferSelect;
export type InsertVirtualTerminal = z.infer<typeof insertVirtualTerminalSchema>;

// Affiliate System
export const payoutStatusEnum = pgEnum("payout_status", ["pending", "paid", "clawed_back", "canceled"]);
export const referralStatusEnum = pgEnum("referral_status", ["pending", "active", "churned", "suspended"]);

// Affiliate profile schema
export const affiliateProfiles = pgTable("affiliate_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(), // Link to the user table
  companyName: text("company_name"),
  websiteUrl: text("website_url"),
  taxId: text("tax_id"), // For tax reporting purposes
  paymentMethod: text("payment_method").notNull().default("bank_transfer"), // bank_transfer, check, paypal, etc.
  bankAccountId: integer("bank_account_id"), // Link to bank account for payments
  nextOfKinName: text("next_of_kin_name"), // For payment continuity
  nextOfKinContact: text("next_of_kin_contact"),
  totalEarned: numeric("total_earned").notNull().default("0"),
  pendingPayouts: numeric("pending_payouts").notNull().default("0"),
  lifetimeReferrals: integer("lifetime_referrals").notNull().default(0),
  activeReferrals: integer("active_referrals").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAffiliateProfileSchema = createInsertSchema(affiliateProfiles).pick({
  userId: true,
  companyName: true,
  websiteUrl: true,
  taxId: true,
  paymentMethod: true,
  bankAccountId: true,
  nextOfKinName: true,
  nextOfKinContact: true,
  referralCode: true,
  isActive: true,
});

// Merchant referrals schema
export const merchantReferrals = pgTable("merchant_referrals", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").notNull(), // Link to affiliate profile
  merchantId: integer("merchant_id").notNull(), // Link to merchant profile
  referralCode: text("referral_code").notNull(), // Code used for tracking
  status: referralStatusEnum("status").notNull().default("pending"),
  sevenDayMilestoneReached: boolean("seven_day_milestone_reached").default(false),
  thirtyDayMilestoneReached: boolean("thirty_day_milestone_reached").default(false),
  ninetyDayMilestoneReached: boolean("ninety_day_milestone_reached").default(false),
  oneEightyDayMilestoneReached: boolean("one_eighty_day_milestone_reached").default(false),
  threeSixtyFiveDayMilestoneReached: boolean("three_sixty_five_day_milestone_reached").default(false),
  transactionVolume7Days: numeric("transaction_volume_7_days").default("0"),
  transactionVolume30Days: numeric("transaction_volume_30_days").default("0"),
  transactionVolume90Days: numeric("transaction_volume_90_days").default("0"),
  transactionVolume180Days: numeric("transaction_volume_180_days").default("0"),
  transactionVolumeMonthly: numeric("transaction_volume_monthly").default("0"),
  commissionEarned: numeric("commission_earned").default("0"),
  dateReferred: timestamp("date_referred").defaultNow(),
  activationDate: timestamp("activation_date"), // When merchant started processing
  lastTransactionDate: timestamp("last_transaction_date"),
  churnDate: timestamp("churn_date"), // If the merchant churned
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMerchantReferralSchema = createInsertSchema(merchantReferrals).pick({
  affiliateId: true,
  merchantId: true,
  referralCode: true,
  status: true,
  notes: true,
});

// Affiliate payouts schema
export const affiliatePayouts = pgTable("affiliate_payouts", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").notNull(), 
  referralId: integer("referral_id").notNull(), // Link to merchant referral
  milestoneName: text("milestone_name").notNull(), // 7_day, 30_day, 90_day, 180_day, recurring, loyalty, high_volume, bulk
  amount: numeric("amount").notNull(),
  status: payoutStatusEnum("status").notNull().default("pending"),
  scheduledDate: date("scheduled_date"),
  processedDate: date("processed_date"),
  transactionId: text("transaction_id"), // Reference to payment transaction
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAffiliatePayoutSchema = createInsertSchema(affiliatePayouts).pick({
  affiliateId: true,
  referralId: true,
  milestoneName: true,
  amount: true,
  status: true,
  scheduledDate: true,
  notes: true,
});

// Type definitions for affiliate system
export type AffiliateProfile = typeof affiliateProfiles.$inferSelect;
export type InsertAffiliateProfile = z.infer<typeof insertAffiliateProfileSchema>;
export type MerchantReferral = typeof merchantReferrals.$inferSelect;
export type InsertMerchantReferral = z.infer<typeof insertMerchantReferralSchema>;
export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;
export type InsertAffiliatePayout = z.infer<typeof insertAffiliatePayoutSchema>;

// POS (Point of Sale) related schemas - BistroBeast System

// Inventory unit types
export const inventoryUnitEnum = pgEnum("inventory_unit", [
  "each", "lb", "kg", "oz", "g", "l", "ml", "gal", "qt", "pt", "fl_oz", "cup", "tbsp", "tsp", "piece", "box", "case", "pack"
]);

// Menu item types
export const menuItemTypeEnum = pgEnum("menu_item_type", [
  "appetizer", "main", "side", "dessert", "beverage", "special", "combo"
]);

// Taxation settings
export const taxRateTypeEnum = pgEnum("tax_rate_type", [
  "food", "alcohol", "merchandise", "service", "delivery", "takeout"
]);

// Order status enum
export const orderStatusEnum = pgEnum("order_status", [
  "draft", "placed", "preparing", "ready", "served", "completed", "cancelled", "refunded"
]);

// Payment status enum
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending", "authorized", "paid", "partially_paid", "refunded", "voided", "failed"
]);

// POS Locations - Each merchant can have multiple locations
export const posLocations = pgTable("pos_locations", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // References merchantProfiles
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull().default("USA"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  timezone: text("timezone").notNull().default("America/New_York"),
  tax1Name: text("tax1_name").default("Sales Tax"),
  tax1Rate: numeric("tax1_rate").default("0"),
  tax2Name: text("tax2_name"),
  tax2Rate: numeric("tax2_rate"),
  tax3Name: text("tax3_name"),
  tax3Rate: numeric("tax3_rate"),
  isActive: boolean("is_active").default(true),
  operatingHours: jsonb("operating_hours"), // JSON with days and hours
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosLocationSchema = createInsertSchema(posLocations).pick({
  merchantId: true,
  name: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  country: true,
  phoneNumber: true,
  email: true,
  timezone: true,
  tax1Name: true,
  tax1Rate: true,
  tax2Name: true,
  tax2Rate: true,
  tax3Name: true,
  tax3Rate: true,
  isActive: true,
  operatingHours: true,
});

// Inventory Categories
export const posCategories = pgTable("pos_categories", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull().references(() => posLocations.id),
  name: text("name").notNull(),
  description: text("description"),
  isInventoryCategory: boolean("is_inventory_category").default(true),
  isMenuCategory: boolean("is_menu_category").default(false),
  sortOrder: integer("sort_order").default(0),
  color: text("color"), // Hex color for UI representation
  icon: text("icon"), // Icon name or path
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosCategorySchema = createInsertSchema(posCategories).pick({
  locationId: true,
  name: true,
  description: true,
  isInventoryCategory: true,
  isMenuCategory: true,
  sortOrder: true,
  color: true,
  icon: true,
  isActive: true,
});

// Inventory Items - Raw ingredients and supplies
export const posInventoryItems = pgTable("pos_inventory_items", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(), // References posLocations
  categoryId: integer("category_id"), // References posCategories
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku"),
  barcode: text("barcode"),
  unit: inventoryUnitEnum("unit").notNull(),
  quantity: numeric("quantity").notNull().default("0"),
  lowStockThreshold: numeric("low_stock_threshold"),
  reorderPoint: numeric("reorder_point"),
  reorderQuantity: numeric("reorder_quantity"),
  costPerUnit: numeric("cost_per_unit"),
  lastCostPerUnit: numeric("last_cost_per_unit"),
  vendorId: integer("vendor_id"), // References vendors/suppliers
  lastOrderDate: date("last_order_date"),
  shelfLife: integer("shelf_life"), // In days
  storageLocation: text("storage_location"),
  isActive: boolean("is_active").default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosInventoryItemSchema = createInsertSchema(posInventoryItems).pick({
  locationId: true,
  categoryId: true,
  name: true,
  description: true,
  sku: true,
  barcode: true,
  unit: true,
  quantity: true,
  lowStockThreshold: true,
  reorderPoint: true,
  reorderQuantity: true,
  costPerUnit: true,
  lastCostPerUnit: true,
  vendorId: true,
  lastOrderDate: true,
  shelfLife: true,
  storageLocation: true,
  isActive: true,
  imageUrl: true,
});

// Vendors / Suppliers
export const posVendors = pgTable("pos_vendors", {
  id: serial("id").primaryKey(), 
  merchantId: integer("merchant_id").notNull(), // References merchantProfiles
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").default("USA"),
  website: text("website"),
  notes: text("notes"),
  paymentTerms: text("payment_terms"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosVendorSchema = createInsertSchema(posVendors).pick({
  merchantId: true,
  name: true,
  contactName: true,
  email: true,
  phoneNumber: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  country: true,
  website: true,
  notes: true,
  paymentTerms: true,
  isActive: true,
});

// Menu Items - Products sold to customers
export const posMenuItems = pgTable("pos_menu_items", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(), // References posLocations
  categoryId: integer("category_id"), // References posCategories
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  cost: numeric("cost"), // Calculated cost based on recipe
  sku: text("sku"),
  barcode: text("barcode"),
  imageUrl: text("image_url"),
  itemType: menuItemTypeEnum("item_type").default("main"),
  taxRateType: taxRateTypeEnum("tax_rate_type").default("food"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  isDiscountable: boolean("is_discountable").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosMenuItemSchema = createInsertSchema(posMenuItems).pick({
  locationId: true,
  categoryId: true,
  name: true,
  description: true,
  price: true,
  cost: true,
  sku: true,
  barcode: true,
  imageUrl: true,
  itemType: true,
  taxRateType: true,
  isActive: true,
  isFeatured: true,
  isDiscountable: true,
});

// Recipe Items - Links inventory items to menu items
export const posRecipeItems = pgTable("pos_recipe_items", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id").notNull(), // References posMenuItems
  inventoryItemId: integer("inventory_item_id").notNull(), // References posInventoryItems
  quantity: numeric("quantity").notNull(), // Quantity of inventory item used
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosRecipeItemSchema = createInsertSchema(posRecipeItems).pick({
  menuItemId: true,
  inventoryItemId: true,
  quantity: true,
});

// Modifiers - Options or add-ons for menu items
export const posModifiers = pgTable("pos_modifiers", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(), // References posLocations
  name: text("name").notNull(), // e.g., "Size", "Toppings", "Temperature"
  description: text("description"),
  required: boolean("required").default(false), // Must choose at least one option
  multiSelect: boolean("multi_select").default(false), // Can select multiple options
  minSelections: integer("min_selections").default(0),
  maxSelections: integer("max_selections"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosModifierSchema = createInsertSchema(posModifiers).pick({
  locationId: true,
  name: true,
  description: true,
  required: true,
  multiSelect: true,
  minSelections: true,
  maxSelections: true,
  isActive: true,
});

// Modifier Options - Individual choices within a modifier
export const posModifierOptions = pgTable("pos_modifier_options", {
  id: serial("id").primaryKey(),
  modifierId: integer("modifier_id").notNull(), // References posModifiers
  name: text("name").notNull(), // e.g., "Small", "Medium", "Large"
  description: text("description"),
  priceAdjustment: numeric("price_adjustment").default("0"), // Additional cost
  isDefault: boolean("is_default").default(false),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosModifierOptionSchema = createInsertSchema(posModifierOptions).pick({
  modifierId: true,
  name: true,
  description: true,
  priceAdjustment: true,
  isDefault: true,
  sortOrder: true,
  isActive: true,
});

// Menu Item Modifiers - Links modifiers to menu items
export const posMenuItemModifiers = pgTable("pos_menu_item_modifiers", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id").notNull(), // References posMenuItems
  modifierId: integer("modifier_id").notNull(), // References posModifiers
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosMenuItemModifierSchema = createInsertSchema(posMenuItemModifiers).pick({
  menuItemId: true,
  modifierId: true,
  sortOrder: true,
});

// Tables - For restaurant seating
export const posTables = pgTable("pos_tables", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(), // References posLocations
  name: text("name").notNull(), // e.g., "Table 1", "Bar 2"
  capacity: integer("capacity").default(4),
  status: text("status").default("available"), // available, occupied, reserved, needs_cleaning
  areaId: integer("area_id"), // References posAreas (e.g., "Patio", "Main Dining", "Private Room")
  xPosition: integer("x_position").default(0), // For visual layout
  yPosition: integer("y_position").default(0), // For visual layout
  width: integer("width").default(100), // For visual layout
  height: integer("height").default(100), // For visual layout
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosTableSchema = createInsertSchema(posTables).pick({
  locationId: true,
  name: true,
  capacity: true,
  status: true,
  areaId: true,
  xPosition: true,
  yPosition: true,
  width: true,
  height: true,
  isActive: true,
});

// Areas - Sections of the restaurant
export const posAreas = pgTable("pos_areas", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(), // References posLocations
  name: text("name").notNull(), // e.g., "Main Dining", "Patio", "Bar"
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosAreaSchema = createInsertSchema(posAreas).pick({
  locationId: true,
  name: true,
  description: true,
  isActive: true,
});

// Staff members
export const posStaff = pgTable("pos_staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // References users
  locationId: integer("location_id").notNull(), // References posLocations
  position: text("position").notNull(), // e.g., "Server", "Manager", "Chef"
  permissionLevel: text("permission_level").default("employee"), // employee, manager, admin
  pin: text("pin"), // For quick login
  isActive: boolean("is_active").default(true),
  hireDate: date("hire_date"),
  hourlyRate: numeric("hourly_rate"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosStaffSchema = createInsertSchema(posStaff).pick({
  userId: true,
  locationId: true,
  position: true,
  permissionLevel: true,
  pin: true,
  isActive: true,
  hireDate: true,
  hourlyRate: true,
});

// Shifts - Staff work periods
export const posShifts = pgTable("pos_shifts", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull(), // References posStaff
  locationId: integer("location_id").notNull(), // References posLocations
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  hoursWorked: numeric("hours_worked"),
  breakMinutes: numeric("break_minutes").default("0"),
  totalSales: numeric("total_sales").default("0"),
  totalTips: numeric("total_tips").default("0"),
  shiftNotes: text("shift_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosShiftSchema = createInsertSchema(posShifts).pick({
  staffId: true,
  locationId: true,
  startTime: true,
  endTime: true,
  hoursWorked: true,
  breakMinutes: true,
  totalSales: true,
  totalTips: true,
  shiftNotes: true,
});

// Orders - Customer orders
export const posOrders = pgTable("pos_orders", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(), // References posLocations
  orderNumber: text("order_number").notNull(),
  tableId: integer("table_id"), // References posTables, null for takeout/delivery
  customerId: integer("customer_id"), // References users or customers
  staffId: integer("staff_id").notNull(), // References posStaff who took the order
  status: orderStatusEnum("status").default("draft"),
  type: text("type").notNull(), // dine_in, takeout, delivery, online
  subtotal: numeric("subtotal").notNull().default("0"),
  taxAmount: numeric("tax_amount").notNull().default("0"),
  tipAmount: numeric("tip_amount").default("0"),
  discountAmount: numeric("discount_amount").default("0"),
  totalAmount: numeric("total_amount").notNull().default("0"),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  notes: text("notes"),
  orderDate: timestamp("order_date").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // For deliveries
  deliveryAddress: text("delivery_address"),
  deliveryInstructions: text("delivery_instructions"),
  deliveryFee: numeric("delivery_fee").default("0"),
  deliveryStatus: text("delivery_status"), // assigned, en_route, delivered
  // For online orders
  estimatedPickupTime: timestamp("estimated_pickup_time"),
  estimatedDeliveryTime: timestamp("estimated_delivery_time"),
});

export const insertPosOrderSchema = createInsertSchema(posOrders).pick({
  locationId: true,
  orderNumber: true,
  tableId: true,
  customerId: true,
  staffId: true,
  status: true,
  type: true,
  subtotal: true,
  taxAmount: true,
  tipAmount: true,
  discountAmount: true,
  totalAmount: true,
  paymentStatus: true,
  notes: true,
  orderDate: true,
  completedAt: true,
  deliveryAddress: true,
  deliveryInstructions: true,
  deliveryFee: true,
  deliveryStatus: true,
  estimatedPickupTime: true,
  estimatedDeliveryTime: true,
});

// Order Items - Individual items in an order
export const posOrderItems = pgTable("pos_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(), // References posOrders
  menuItemId: integer("menu_item_id").notNull(), // References posMenuItems
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price").notNull(),
  subtotal: numeric("subtotal").notNull(),
  discount: numeric("discount").default("0"),
  taxAmount: numeric("tax_amount").notNull().default("0"),
  totalAmount: numeric("total_amount").notNull(),
  notes: text("notes"),
  // String array of modifier options in format "Modifier: Option" (e.g., "Size: Large, Toppings: Pepperoni")
  selectedModifiers: text("selected_modifiers").array().default([]),
  status: text("status").default("pending"), // pending, cooking, ready, delivered, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosOrderItemSchema = createInsertSchema(posOrderItems).pick({
  orderId: true,
  menuItemId: true,
  quantity: true,
  unitPrice: true,
  subtotal: true,
  discount: true,
  taxAmount: true,
  totalAmount: true,
  notes: true,
  selectedModifiers: true,
  status: true,
});

// Payments - Payment records for orders
export const posPayments = pgTable("pos_payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(), // References posOrders
  paymentMethod: text("payment_method").notNull(), // cash, credit_card, debit_card, gift_card, mobile_wallet
  amount: numeric("amount").notNull(),
  status: paymentStatusEnum("status").default("pending"),
  transactionId: text("transaction_id"), // External payment processor ID
  cardType: text("card_type"), // visa, mastercard, amex, etc.
  last4: text("last4"), // Last 4 digits of card
  receiptNumber: text("receipt_number"),
  staffId: integer("staff_id"), // Staff who processed the payment
  notes: text("notes"),
  refundedAmount: numeric("refunded_amount").default("0"),
  refundedAt: timestamp("refunded_at"),
  refundReason: text("refund_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosPaymentSchema = createInsertSchema(posPayments).pick({
  orderId: true,
  paymentMethod: true,
  amount: true,
  status: true,
  transactionId: true,
  cardType: true,
  last4: true,
  receiptNumber: true,
  staffId: true,
  notes: true,
  refundedAmount: true,
  refundedAt: true,
  refundReason: true,
});

// Discounts - Promotions and coupons
export const posDiscounts = pgTable("pos_discounts", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(), // References posLocations
  name: text("name").notNull(),
  code: text("code"),
  type: text("type").notNull(), // percentage, fixed_amount
  value: numeric("value").notNull(), // Percentage or amount
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  minOrderAmount: numeric("min_order_amount").default("0"),
  maxUsage: integer("max_usage"), // Max number of times this discount can be used
  usageCount: integer("usage_count").default(0), // Number of times used
  isActive: boolean("is_active").default(true),
  applicableMenuItems: integer("applicable_menu_items").array(), // Array of menu item IDs, empty means all
  applicableCategories: integer("applicable_categories").array(), // Array of category IDs, empty means all
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosDiscountSchema = createInsertSchema(posDiscounts).pick({
  locationId: true,
  name: true,
  code: true,
  type: true,
  value: true,
  startDate: true,
  endDate: true,
  minOrderAmount: true,
  maxUsage: true,
  usageCount: true,
  isActive: true,
  applicableMenuItems: true,
  applicableCategories: true,
});

// Inventory Transactions - Track inventory changes
export const posInventoryTransactions = pgTable("pos_inventory_transactions", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(), // References posLocations
  inventoryItemId: integer("inventory_item_id").notNull(), // References posInventoryItems
  type: text("type").notNull(), // purchase, usage, adjustment, waste, transfer
  quantity: numeric("quantity").notNull(), // Positive for additions, negative for removals
  unitCost: numeric("unit_cost"), // Cost per unit for this transaction
  totalCost: numeric("total_cost"), // Total cost of this transaction
  orderId: integer("order_id"), // References posOrders if type is 'usage'
  vendorId: integer("vendor_id"), // References posVendors if type is 'purchase'
  referenceNumber: text("reference_number"), // Invoice number, PO number, etc.
  notes: text("notes"),
  staffId: integer("staff_id"), // Staff who performed the transaction
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPosInventoryTransactionSchema = createInsertSchema(posInventoryTransactions).pick({
  locationId: true,
  inventoryItemId: true,
  type: true,
  quantity: true,
  unitCost: true,
  totalCost: true,
  orderId: true,
  vendorId: true,
  referenceNumber: true,
  notes: true,
  staffId: true,
  date: true,
});

// Reservations
export const posReservations = pgTable("pos_reservations", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(), // References posLocations
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  partySize: integer("party_size").notNull(),
  reservationDate: date("reservation_date").notNull(),
  reservationTime: varchar("reservation_time", { length: 10 }).notNull(),
  status: text("status").default("confirmed"), // confirmed, seated, completed, no_show, cancelled
  tableId: integer("table_id"), // References posTables, may be null until assigned
  notes: text("notes"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosReservationSchema = createInsertSchema(posReservations).pick({
  locationId: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  partySize: true,
  reservationDate: true,
  reservationTime: true,
  status: true,
  tableId: true,
  notes: true,
  specialRequests: true,
});

// Daily totals for accounting/reporting
export const posDailyTotals = pgTable("pos_daily_totals", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(), // References posLocations
  date: date("date").notNull(),
  salesTotal: numeric("sales_total").default("0"),
  taxTotal: numeric("tax_total").default("0"),
  tipTotal: numeric("tip_total").default("0"),
  discountTotal: numeric("discount_total").default("0"),
  refundTotal: numeric("refund_total").default("0"),
  netTotal: numeric("net_total").default("0"),
  orderCount: integer("order_count").default(0),
  itemsSold: integer("items_sold").default(0),
  averageOrderValue: numeric("average_order_value").default("0"),
  cashTotal: numeric("cash_total").default("0"),
  cardTotal: numeric("card_total").default("0"),
  otherPaymentTotal: numeric("other_payment_total").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosDailyTotalSchema = createInsertSchema(posDailyTotals).pick({
  locationId: true,
  date: true,
  salesTotal: true,
  taxTotal: true,
  tipTotal: true,
  discountTotal: true,
  refundTotal: true,
  netTotal: true,
  orderCount: true,
  itemsSold: true,
  averageOrderValue: true,
  cashTotal: true,
  cardTotal: true,
  otherPaymentTotal: true,
});

// Type definitions for POS BistroBeast system
export type PosLocation = typeof posLocations.$inferSelect;
export type InsertPosLocation = z.infer<typeof insertPosLocationSchema>;

export type PosCategory = typeof posCategories.$inferSelect;
export type InsertPosCategory = z.infer<typeof insertPosCategorySchema>;

export type PosInventoryItem = typeof posInventoryItems.$inferSelect;
export type InsertPosInventoryItem = z.infer<typeof insertPosInventoryItemSchema>;

export type PosVendor = typeof posVendors.$inferSelect;
export type InsertPosVendor = z.infer<typeof insertPosVendorSchema>;

export type PosMenuItem = typeof posMenuItems.$inferSelect;
export type InsertPosMenuItem = z.infer<typeof insertPosMenuItemSchema>;

export type PosRecipeItem = typeof posRecipeItems.$inferSelect;
export type InsertPosRecipeItem = z.infer<typeof insertPosRecipeItemSchema>;

export type PosModifier = typeof posModifiers.$inferSelect;
export type InsertPosModifier = z.infer<typeof insertPosModifierSchema>;

export type PosModifierOption = typeof posModifierOptions.$inferSelect;
export type InsertPosModifierOption = z.infer<typeof insertPosModifierOptionSchema>;

export type PosMenuItemModifier = typeof posMenuItemModifiers.$inferSelect;
export type InsertPosMenuItemModifier = z.infer<typeof insertPosMenuItemModifierSchema>;

export type PosTable = typeof posTables.$inferSelect;
export type InsertPosTable = z.infer<typeof insertPosTableSchema>;

export type PosArea = typeof posAreas.$inferSelect;
export type InsertPosArea = z.infer<typeof insertPosAreaSchema>;

export type PosStaff = typeof posStaff.$inferSelect;
export type InsertPosStaff = z.infer<typeof insertPosStaffSchema>;

export type PosShift = typeof posShifts.$inferSelect;
export type InsertPosShift = z.infer<typeof insertPosShiftSchema>;

export type PosOrder = typeof posOrders.$inferSelect;
export type InsertPosOrder = z.infer<typeof insertPosOrderSchema>;

export type PosOrderItem = typeof posOrderItems.$inferSelect;
export type InsertPosOrderItem = z.infer<typeof insertPosOrderItemSchema>;

export type PosPayment = typeof posPayments.$inferSelect;
export type InsertPosPayment = z.infer<typeof insertPosPaymentSchema>;

export type PosDiscount = typeof posDiscounts.$inferSelect;
export type InsertPosDiscount = z.infer<typeof insertPosDiscountSchema>;

export type PosInventoryTransaction = typeof posInventoryTransactions.$inferSelect;
export type InsertPosInventoryTransaction = z.infer<typeof insertPosInventoryTransactionSchema>;

export type PosReservation = typeof posReservations.$inferSelect;
export type InsertPosReservation = z.infer<typeof insertPosReservationSchema>;

export type PosDailyTotal = typeof posDailyTotals.$inferSelect;
export type InsertPosDailyTotal = z.infer<typeof insertPosDailyTotalSchema>;

// Merchant Application Schema
export const merchantApplicationStatusEnum = pgEnum("merchant_application_status", ["pending", "reviewing", "approved", "rejected"]);

export const merchantApplications = pgTable("merchant_applications", {
  id: serial("id").primaryKey(),
  applicationId: text("application_id").notNull().unique(), // UUID for front-end use
  status: merchantApplicationStatusEnum("status").notNull().default("pending"),
  
  // Personal Info
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  
  // Business Info
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  industry: text("industry").notNull(),
  yearsInBusiness: text("years_in_business").notNull(),
  estimatedMonthlyVolume: text("estimated_monthly_volume").notNull(),
  businessDescription: text("business_description"),
  employeeCount: text("employee_count").notNull(),
  
  // Address Info
  address1: text("address1").notNull(),
  address2: text("address2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull().default("USA"),
  
  // Payment Processing Preferences
  acceptsCardPresent: boolean("accepts_card_present").default(false),
  acceptsOnlinePayments: boolean("accepts_online_payments").default(false),
  acceptsACH: boolean("accepts_ach").default(false),
  acceptsRecurringPayments: boolean("accepts_recurring_payments").default(false),
  needsPOS: boolean("needs_pos").default(false),
  needsPaymentGateway: boolean("needs_payment_gateway").default(false),
  currentProcessor: text("current_processor"),
  
  // Additional fields
  notes: text("notes"),
  referralCode: text("referral_code"), // Track affiliate referrals
  assignedToUserId: integer("assigned_to_user_id"), // Admin assigned to review
  hubspotContactId: text("hubspot_contact_id"), // For HubSpot integration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMerchantApplicationSchema = createInsertSchema(merchantApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type MerchantApplication = typeof merchantApplications.$inferSelect;
export type InsertMerchantApplication = z.infer<typeof insertMerchantApplicationSchema>;

// Keep the interface definitions for backward compatibility
export interface MerchantApplicationPersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface MerchantApplicationBusinessInfo {
  businessName: string;
  businessType: string;
  industry: string;
  yearsInBusiness: string;
  estimatedMonthlyVolume: string;
  businessDescription?: string;
  employeeCount: string;
}

export interface MerchantApplicationAddressInfo {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface MerchantApplicationPaymentProcessing {
  acceptsCardPresent?: boolean;
  acceptsOnlinePayments?: boolean;
  acceptsACH?: boolean;
  acceptsRecurringPayments?: boolean;
  needsPOS?: boolean;
  needsPaymentGateway?: boolean;
  currentProcessor?: string;
}

// Tax System - For advanced Payroll tax calculations

// Tax Filing Status Enum
export const taxFilingStatusEnum = pgEnum("tax_filing_status", [
  "single", "married_joint", "married_separate", "head_of_household", "qualifying_widow"
]);

// Federal Tax Brackets Table
export const federalTaxBrackets = pgTable("federal_tax_brackets", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  filingStatus: taxFilingStatusEnum("filing_status").notNull(),
  bracketOrder: integer("bracket_order").notNull(), // To maintain the correct order of brackets
  incomeFrom: numeric("income_from").notNull(),
  incomeTo: numeric("income_to"),  // Null for the highest bracket
  rate: numeric("rate").notNull(), // Stored as decimal (e.g., 0.22 for 22%)
  baseAmount: numeric("base_amount"), // Base tax amount for this bracket
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFederalTaxBracketSchema = createInsertSchema(federalTaxBrackets).pick({
  year: true,
  filingStatus: true,
  bracketOrder: true, 
  incomeFrom: true,
  incomeTo: true,
  rate: true,
  baseAmount: true,
});

// State Tax Brackets Table
export const stateTaxBrackets = pgTable("state_tax_brackets", {
  id: serial("id").primaryKey(),
  state: text("state").notNull(), // Two-letter state code
  year: integer("year").notNull(),
  filingStatus: taxFilingStatusEnum("filing_status").notNull(),
  bracketOrder: integer("bracket_order").notNull(),
  incomeFrom: numeric("income_from").notNull(),
  incomeTo: numeric("income_to"), // Null for the highest bracket
  rate: numeric("rate").notNull(), // Stored as decimal (e.g., 0.05 for 5%)
  baseAmount: numeric("base_amount"), // Base tax amount for this bracket
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStateTaxBracketSchema = createInsertSchema(stateTaxBrackets).pick({
  state: true,
  year: true,
  filingStatus: true,
  bracketOrder: true,
  incomeFrom: true,
  incomeTo: true,
  rate: true,
  baseAmount: true,
});

// FICA Rates Table (Social Security and Medicare)
export const ficaRates = pgTable("fica_rates", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  socialSecurityRate: numeric("social_security_rate").notNull(), // Employee rate
  socialSecurityWageCap: numeric("social_security_wage_cap").notNull(), // Annual wage cap
  medicareRate: numeric("medicare_rate").notNull(), // Base Medicare rate
  additionalMedicareRate: numeric("additional_medicare_rate").notNull(), // Additional rate for high earners
  additionalMedicareThreshold: numeric("additional_medicare_threshold").notNull(), // Income threshold for additional rate
  additionalMedicareThresholdJoint: numeric("additional_medicare_threshold_joint"), // For married filing jointly
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFicaRateSchema = createInsertSchema(ficaRates).pick({
  year: true,
  socialSecurityRate: true, 
  socialSecurityWageCap: true,
  medicareRate: true,
  additionalMedicareRate: true,
  additionalMedicareThreshold: true,
  additionalMedicareThresholdJoint: true,
});

// Tax Allowances and Deductions
export const taxAllowances = pgTable("tax_allowances", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  standardDeductionSingle: numeric("standard_deduction_single").notNull(),
  standardDeductionJoint: numeric("standard_deduction_joint").notNull(),
  standardDeductionHeadOfHousehold: numeric("standard_deduction_head_of_household").notNull(),
  personalExemptionAmount: numeric("personal_exemption_amount").notNull(),
  personalExemptionPhaseoutStart: numeric("personal_exemption_phaseout_start"), // Income where phaseout begins
  personalExemptionPhaseoutEnd: numeric("personal_exemption_phaseout_end"), // Income where fully phased out
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTaxAllowanceSchema = createInsertSchema(taxAllowances).pick({
  year: true,
  standardDeductionSingle: true,
  standardDeductionJoint: true,
  standardDeductionHeadOfHousehold: true,
  personalExemptionAmount: true,
  personalExemptionPhaseoutStart: true,
  personalExemptionPhaseoutEnd: true,
});

// Employee Tax Withholding Profiles
export const employeeTaxProfiles = pgTable("employee_tax_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // References user table
  year: integer("year").notNull(),
  filingStatus: taxFilingStatusEnum("filing_status").notNull().default("single"),
  allowances: integer("allowances").notNull().default(0), // W-4 allowances
  additionalWithholding: numeric("additional_withholding").default("0"), // Additional withholding per paycheck
  exemptFromFederal: boolean("exempt_from_federal").default(false),
  exemptFromState: boolean("exempt_from_state").default(false),
  exemptFromLocalTax: boolean("exempt_from_local_tax").default(false),
  stateOfResidence: text("state_of_residence").notNull(), // State used for state income tax
  stateOfEmployment: text("state_of_employment").notNull(), // Where the work is performed
  localTaxJurisdiction: text("local_tax_jurisdiction"), // City, county, etc. for local taxes
  localTaxRate: numeric("local_tax_rate").default("0"), // Local tax rate
  annualSalaryEstimate: numeric("annual_salary_estimate"), // For calculating tax brackets
  hasMultipleJobs: boolean("has_multiple_jobs").default(false),
  spouseWorks: boolean("spouse_works").default(false), // For joint filing calculation
  specialTaxCredits: jsonb("special_tax_credits"), // Additional tax credits (child tax credit, etc.)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmployeeTaxProfileSchema = createInsertSchema(employeeTaxProfiles).pick({
  userId: true,
  year: true,
  filingStatus: true,
  allowances: true,
  additionalWithholding: true,
  exemptFromFederal: true,
  exemptFromState: true,
  exemptFromLocalTax: true,
  stateOfResidence: true,
  stateOfEmployment: true,
  localTaxJurisdiction: true,
  localTaxRate: true,
  annualSalaryEstimate: true,
  hasMultipleJobs: true,
  spouseWorks: true,
  specialTaxCredits: true,
});

// Tax Calculation History
export const taxCalculations = pgTable("tax_calculations", {
  id: serial("id").primaryKey(),
  payrollEntryId: integer("payroll_entry_id").notNull(), // References payroll_entries table
  federalTaxableIncome: numeric("federal_taxable_income").notNull(),
  stateTaxableIncome: numeric("state_taxable_income").notNull(),
  federalWithholding: numeric("federal_withholding").notNull(),
  stateWithholding: numeric("state_withholding").notNull(),
  socialSecurityWithholding: numeric("social_security_withholding").notNull(),
  medicareWithholding: numeric("medicare_withholding").notNull(),
  localTaxWithholding: numeric("local_tax_withholding").default("0"),
  totalWithholding: numeric("total_withholding").notNull(),
  ytdGrossEarnings: numeric("ytd_gross_earnings").notNull(), // Year-to-date earnings
  ytdFederalWithholding: numeric("ytd_federal_withholding").notNull(),
  ytdStateWithholding: numeric("ytd_state_withholding").notNull(),
  ytdSocialSecurityWithholding: numeric("ytd_social_security_withholding").notNull(),
  ytdMedicareWithholding: numeric("ytd_medicare_withholding").notNull(),
  calculationMethod: text("calculation_method").notNull(), // percentage, wage bracket, etc.
  calculationNotes: text("calculation_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  performedBy: integer("performed_by").notNull(), // User ID of who ran the calculation
});

export const insertTaxCalculationSchema = createInsertSchema(taxCalculations).pick({
  payrollEntryId: true,
  federalTaxableIncome: true,
  stateTaxableIncome: true,
  federalWithholding: true,
  stateWithholding: true,
  socialSecurityWithholding: true,
  medicareWithholding: true,
  localTaxWithholding: true,
  totalWithholding: true,
  ytdGrossEarnings: true,
  ytdFederalWithholding: true,
  ytdStateWithholding: true,
  ytdSocialSecurityWithholding: true,
  ytdMedicareWithholding: true,
  calculationMethod: true,
  calculationNotes: true,
  performedBy: true,
});

// Export tax types
export type FederalTaxBracket = typeof federalTaxBrackets.$inferSelect;
export type InsertFederalTaxBracket = z.infer<typeof insertFederalTaxBracketSchema>;

export type StateTaxBracket = typeof stateTaxBrackets.$inferSelect;
export type InsertStateTaxBracket = z.infer<typeof insertStateTaxBracketSchema>;

export type FicaRate = typeof ficaRates.$inferSelect;
export type InsertFicaRate = z.infer<typeof insertFicaRateSchema>;

export type TaxAllowance = typeof taxAllowances.$inferSelect;
export type InsertTaxAllowance = z.infer<typeof insertTaxAllowanceSchema>;

export type EmployeeTaxProfile = typeof employeeTaxProfiles.$inferSelect;
export type InsertEmployeeTaxProfile = z.infer<typeof insertEmployeeTaxProfileSchema>;

export type TaxCalculation = typeof taxCalculations.$inferSelect;
export type InsertTaxCalculation = z.infer<typeof insertTaxCalculationSchema>;

// POS Tenant types
export type PosTenant = typeof posTenants.$inferSelect;
export type InsertPosTenant = z.infer<typeof insertPosTenantSchema>;

// Click events for analytics tracking
export const clickEvents = pgTable("click_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  elementId: text("element_id"),
  elementType: text("element_type").notNull(),
  elementText: text("element_text"),
  pagePath: text("page_path").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertClickEventSchema = createInsertSchema(clickEvents).omit({
  id: true,
  createdAt: true
});

export type ClickEvent = typeof clickEvents.$inferSelect;
export type InsertClickEvent = z.infer<typeof insertClickEventSchema>;

// Demo requests for appointment scheduling
export const demoRequests = pgTable("demo_requests", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  companyName: text("company_name").notNull(),
  industry: text("industry").notNull(),
  message: text("message"),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  processedBy: integer("processed_by").references(() => users.id),
  hubspotContactId: text("hubspot_contact_id")
});

export const insertDemoRequestSchema = createInsertSchema(demoRequests).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  processedAt: true,
  processedBy: true,
  hubspotContactId: true
});

export type DemoRequest = typeof demoRequests.$inferSelect;
export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;

// Table relationships are defined through foreign keys in the table definitions above
// We've documented these relationships in /docs/database-relationships.md for clarity
// The schema uses explicit foreign key constraints where possible, but some circular references
// require careful handling at the application level.

// Helcim API Integration Schema
export const helcimIntegrations = pgTable("helcim_integrations", {
  id: serial("id").primaryKey(),
  paymentGatewayId: integer("payment_gateway_id").notNull().references(() => paymentGateways.id),
  merchantId: integer("merchant_id").notNull(),
  helcimAccountId: text("helcim_account_id").notNull(), // Helcim.com merchant account ID
  helcimApiKey: text("helcim_api_key").notNull(), // Helcim.com API key
  helcimTerminalId: text("helcim_terminal_id"), // Optional: Terminal ID for card-present transactions
  testMode: boolean("test_mode").default(true), // Whether the integration is in test mode
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHelcimIntegrationSchema = createInsertSchema(helcimIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type HelcimIntegration = typeof helcimIntegrations.$inferSelect;
export type InsertHelcimIntegration = z.infer<typeof insertHelcimIntegrationSchema>;

// Merchant Transactions Table - For payment processing transactions
export const merchantTransactions = pgTable("merchant_transactions", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id"), // Link to merchant profile (optional for public checkout)
  paymentGatewayId: integer("payment_gateway_id"), // Link to payment gateway
  amount: numeric("amount").notNull(),
  currency: text("currency").default("USD").notNull(),
  paymentMethod: text("payment_method").notNull(), // credit_card, bank_account, etc.
  status: text("status").notNull(), // completed, pending, failed, refunded, etc.
  externalId: text("external_id"), // Transaction ID from external payment processor
  description: text("description"),
  metadata: jsonb("metadata"), // Additional data from payment processor
  customerInfo: jsonb("customer_info"), // Optional customer information
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMerchantTransactionSchema = createInsertSchema(merchantTransactions).omit({
  id: true,
  updatedAt: true,
});

export type MerchantTransaction = typeof merchantTransactions.$inferSelect;
export type InsertMerchantTransaction = z.infer<typeof insertMerchantTransactionSchema>;

// Family Wallet System

// Family group schema
export const familyGroups = pgTable("family_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentUserId: integer("parent_user_id").notNull(), // Main parent user
  secondaryParentUserId: integer("secondary_parent_user_id"), // Optional second parent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFamilyGroupSchema = createInsertSchema(familyGroups).pick({
  name: true,
  parentUserId: true,
  secondaryParentUserId: true,
});

export type FamilyGroup = typeof familyGroups.$inferSelect;
export type InsertFamilyGroup = typeof familyGroups.$inferInsert;

// Family member schema (connects users to family groups)
export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  familyGroupId: integer("family_group_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role", { enum: ["parent", "child", "guardian"] }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).pick({
  familyGroupId: true,
  userId: true,
  role: true,
  isActive: true,
});

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = typeof familyMembers.$inferInsert;

// Allowance schema
export const allowanceTypeEnum = pgEnum("allowance_type", ["one_time", "recurring", "reward"]);
export const allowanceFrequencyEnum = pgEnum("allowance_frequency", ["daily", "weekly", "biweekly", "monthly"]);

export const allowances = pgTable("allowances", {
  id: serial("id").primaryKey(),
  childUserId: integer("child_user_id").notNull(),
  parentUserId: integer("parent_user_id").notNull(),
  amount: numeric("amount").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type", { enum: ["one_time", "recurring", "reward"] }).notNull(),
  frequency: text("frequency", { enum: ["daily", "weekly", "biweekly", "monthly"] }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextPaymentDate: date("next_payment_date"),
  lastPaymentDate: date("last_payment_date"),
  isActive: boolean("is_active").notNull().default(true),
  hasConditions: boolean("has_conditions").default(false),
  conditions: jsonb("conditions"), // JSON object with conditions like chores, grades, etc.
  autoTransfer: boolean("auto_transfer").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAllowanceSchema = createInsertSchema(allowances).pick({
  childUserId: true,
  parentUserId: true,
  amount: true,
  title: true,
  description: true,
  type: true,
  frequency: true,
  startDate: true,
  endDate: true,
  isActive: true,
  hasConditions: true,
  conditions: true,
  autoTransfer: true,
});

export type Allowance = typeof allowances.$inferSelect;
export type InsertAllowance = typeof allowances.$inferInsert;

// Child spending requests schema
export const spendingRequestStatusEnum = pgEnum("spending_request_status", [
  "pending",
  "approved",
  "rejected",
  "canceled"
]);

export const spendingRequests = pgTable("spending_requests", {
  id: serial("id").primaryKey(),
  childUserId: integer("child_user_id").notNull(),
  parentUserId: integer("parent_user_id").notNull(),
  amount: numeric("amount").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  merchantName: text("merchant_name"),
  urgency: text("urgency").default("normal"), // low, normal, high
  status: text("status", { 
    enum: ["pending", "approved", "rejected", "canceled"] 
  }).notNull().default("pending"),
  requestDate: timestamp("request_date").defaultNow(),
  responseDate: timestamp("response_date"),
  rejectionReason: text("rejection_reason"),
  expirationDate: timestamp("expiration_date"),
  imageUrl: text("image_url"), // For product image or screenshot
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSpendingRequestSchema = createInsertSchema(spendingRequests).pick({
  childUserId: true,
  parentUserId: true,
  amount: true,
  title: true,
  description: true,
  merchantName: true,
  urgency: true,
  status: true,
  expirationDate: true,
  imageUrl: true,
});

export type SpendingRequest = typeof spendingRequests.$inferSelect;
export type InsertSpendingRequest = typeof spendingRequests.$inferInsert;

// Chores/tasks schema for allowance conditions
export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "verified",
  "rejected"
]);

export const familyTasks = pgTable("family_tasks", {
  id: serial("id").primaryKey(),
  familyGroupId: integer("family_group_id").notNull(),
  assignedToUserId: integer("assigned_to_user_id").notNull(),
  assignedByUserId: integer("assigned_by_user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  rewardAmount: numeric("reward_amount"),
  dueDate: timestamp("due_date"),
  completionDate: timestamp("completion_date"),
  verificationDate: timestamp("verification_date"),
  verifiedByUserId: integer("verified_by_user_id"),
  status: text("status", { 
    enum: ["pending", "in_progress", "completed", "verified", "rejected"] 
  }).notNull().default("pending"),
  recurring: boolean("recurring").default(false),
  recurrencePattern: text("recurrence_pattern"), // daily, weekly, etc.
  priority: text("priority").default("medium"), // low, medium, high
  imageUrl: text("image_url"), // For proof of completion
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFamilyTaskSchema = createInsertSchema(familyTasks).pick({
  familyGroupId: true,
  assignedToUserId: true,
  assignedByUserId: true,
  title: true,
  description: true,
  rewardAmount: true,
  dueDate: true,
  status: true,
  recurring: true,
  recurrencePattern: true,
  priority: true,
  imageUrl: true,
});

export type FamilyTask = typeof familyTasks.$inferSelect;
export type InsertFamilyTask = typeof familyTasks.$inferInsert;

// Spending rules schema for child accounts
export const spendingRules = pgTable("spending_rules", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(), // References family_members.id
  dailyLimit: numeric("daily_limit"),
  weeklyLimit: numeric("weekly_limit"),
  monthlyLimit: numeric("monthly_limit"),
  perTransactionLimit: numeric("per_transaction_limit"),
  blockedCategories: text("blocked_categories").array(), // Array of category names
  blockedMerchants: text("blocked_merchants").array(), // Array of merchant names
  requireApprovalAmount: numeric("require_approval_amount"), // Transactions above this amount require approval
  requireApprovalForAll: boolean("require_approval_for_all").default(false),
  allowOnlinePurchases: boolean("allow_online_purchases").default(true),
  allowInStorePurchases: boolean("allow_in_store_purchases").default(true),
  allowWithdrawals: boolean("allow_withdrawals").default(false),
  withdrawalLimit: numeric("withdrawal_limit"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSpendingRulesSchema = createInsertSchema(spendingRules).pick({
  childId: true,
  dailyLimit: true,
  weeklyLimit: true,
  monthlyLimit: true,
  perTransactionLimit: true,
  blockedCategories: true,
  blockedMerchants: true,
  requireApprovalAmount: true,
  requireApprovalForAll: true,
  allowOnlinePurchases: true,
  allowInStorePurchases: true,
  allowWithdrawals: true,
  withdrawalLimit: true,
});

export type SpendingRules = typeof spendingRules.$inferSelect;
export type InsertSpendingRules = typeof spendingRules.$inferInsert;
