import { pgTable, text, serial, integer, boolean, numeric, timestamp, pgEnum, date, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const userRoleEnum = pgEnum("user_role", ["employee", "employer", "parent", "child", "admin"]);

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  role: text("role", { enum: ["employee", "employer", "parent", "child", "admin"] }).notNull().default("employee"),
  department: text("department"),
  organizationId: integer("organization_id"),
  dateOfBirth: date("date_of_birth"),
  ssn: text("ssn"),  // For payroll purposes, stores last 4 digits or encrypted
  address: text("address"), // Could be split into multiple fields in production
  parentId: integer("parent_id"), // For child accounts to link to parent
  dependents: integer("dependents"), // Number of dependents for tax calculations
  createdAt: timestamp("created_at").defaultNow(),
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
  parentId: true,
  dependents: true,
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
export const payrollPeriodEnum = pgEnum("payroll_period", ["daily", "weekly", "biweekly", "monthly"]);
export const compensationTypeEnum = pgEnum("compensation_type", ["w2", "1099", "corp_to_corp"]);

export const payrollEntries = pgTable("payroll_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  employerId: integer("employer_id").notNull(), // The employer processing this payroll
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
  walletId: integer("wallet_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetAmount: numeric("target_amount").notNull(),
  currentAmount: numeric("current_amount").notNull().default("0"),
  targetDate: date("target_date"),
  parentMatchPercentage: numeric("parent_match_percentage"), // For parent matching child savings
  isCompleted: boolean("is_completed").default(false),
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
  isCompleted: true,
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
  status: true,
  processingFeePercentage: true,
  monthlyFee: true,
  payoutSchedule: true,
  timezone: true,
});

// Payment Gateway Schema
export const paymentGatewayTypeEnum = pgEnum("payment_gateway_type", ["stripe", "paypal", "square", "adyen", "custom"]);

export const paymentGateways = pgTable("payment_gateways", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Link to the merchant profile
  gatewayType: text("gateway_type", { enum: ["stripe", "paypal", "square", "adyen", "custom"] }).notNull(),
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

// Point of Sale Schema
export const posTypes = pgEnum("pos_type", ["mobile", "countertop", "kiosk", "virtual"]);

export const pointOfSaleSystems = pgTable("point_of_sale_systems", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
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
