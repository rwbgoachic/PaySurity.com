import { pgTable, text, serial, integer, boolean, numeric, timestamp, pgEnum, date, jsonb, varchar, decimal, time } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Type declarations for Express request interface
declare global {
  namespace Express {
    interface Request {
      portalUser?: LegalPortalUser;
      portalSession?: LegalPortalSession;
    }
  }
}

// ISO Partner status enum
export const isoPartnerStatusEnum = pgEnum("iso_partner_status", ["pending", "active", "inactive", "suspended"]);

// Commission status enum
export const commissionStatusEnum = pgEnum("commission_status", ["pending", "paid"]);

// Support ticket status enum
export const supportTicketStatusEnum = pgEnum("support_ticket_status", ["open", "in_progress", "resolved", "closed"]);

// Support ticket priority enum
export const supportTicketPriorityEnum = pgEnum("support_ticket_priority", ["low", "medium", "high", "urgent"]);

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
export const userRoleEnum = pgEnum("user_role", ["super_admin", "admin", "developer", "executive", "finance", "marketing", "employee", "employer", "parent", "child", "affiliate", "merchant"]);

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["super_admin", "admin", "developer", "executive", "finance", "marketing", "employee", "employer", "parent", "child", "affiliate", "merchant"] }).notNull().default("executive"),
  avatar: text("avatar"),
  department: text("department"),
  organizationId: integer("organization_id"),
  businessId: integer("business_id"), // Added for merchant and business users
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
  avatar: true,
  department: true,
  organizationId: true,
  businessId: true,
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

// Payment method types
export const paymentMethodTypeEnum = pgEnum("payment_method_type", [
  "credit_card", 
  "debit_card", 
  "ach", 
  "wire", 
  "wallet",
  "apple_pay", 
  "google_pay", 
  "paypal", 
  "venmo",
  "cash"
]);

// Payment method status
export const paymentMethodStatusEnum = pgEnum("payment_method_status", [
  "active", 
  "inactive", 
  "expired", 
  "suspended"
]);

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

// Payment method schema
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletId: integer("wallet_id"), // Optional - linked to a specific wallet
  type: text("type", { enum: ["credit_card", "debit_card", "ach", "wire", "wallet", "apple_pay", "google_pay", "paypal", "venmo", "cash"] }).notNull(),
  status: text("status", { enum: ["active", "inactive", "expired", "suspended"] }).notNull().default("active"),
  nickname: text("nickname").notNull(), // User-friendly name (e.g., "Work Visa")
  cardholderName: text("cardholder_name"), // For card methods
  last4: text("last4"), // Last 4 digits of card or account number 
  expiryMonth: text("expiry_month"), // For card methods
  expiryYear: text("expiry_year"), // For card methods
  brand: text("brand"), // Visa, Mastercard, etc.
  billingAddress: text("billing_address"),
  billingCity: text("billing_city"),
  billingState: text("billing_state"),
  billingZip: text("billing_zip"),
  billingCountry: text("billing_country"),
  isDefault: boolean("is_default").notNull().default(false),
  stripePaymentMethodId: text("stripe_payment_method_id"), // For Stripe integration
  plaidAccountId: text("plaid_account_id"), // For Plaid integration
  bankAccountId: integer("bank_account_id"), // References bank_accounts table for ACH methods
  isVerified: boolean("is_verified").notNull().default(false),
  verificationMethod: text("verification_method"), // micro-deposits, instant, etc.
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).pick({
  userId: true,
  walletId: true,
  type: true,
  status: true,
  nickname: true,
  cardholderName: true,
  last4: true,
  expiryMonth: true,
  expiryYear: true,
  brand: true,
  billingAddress: true,
  billingCity: true,
  billingState: true,
  billingZip: true,
  billingCountry: true,
  isDefault: true,
  stripePaymentMethodId: true,
  plaidAccountId: true,
  bankAccountId: true,
  isVerified: true,
  verificationMethod: true,
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

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

// ISO Partners
export const isoPartners = pgTable("iso_partners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  profilePhoto: text("profile_photo"), // URL to the ISO's profile photo
  profileBio: text("profile_bio"), // Short bio/description of the ISO
  subdomain: text("subdomain").notNull().unique(), // For their microsite (e.g., partner-name)
  commissionRate: decimal("commission_rate").notNull(), // Percentage of revenue
  totalCommissionEarned: decimal("total_commission_earned").notNull().default("0"),
  status: text("status").notNull().default("active"), // active, inactive, suspended
  merchantCount: integer("merchant_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIsoPartnerSchema = createInsertSchema(isoPartners).pick({
  userId: true,
  companyName: true,
  contactName: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  zip: true,
  profilePhoto: true,
  profileBio: true,
  subdomain: true,
  commissionRate: true,
  status: true,
});

export type IsoPartner = typeof isoPartners.$inferSelect;
export type InsertIsoPartner = typeof isoPartners.$inferInsert;

// Merchants (enrolled by ISO partners)
export const merchants = pgTable("merchants", {
  id: serial("id").primaryKey(),
  isoPartnerId: integer("iso_partner_id").notNull(),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  businessType: text("business_type").notNull(),
  taxId: text("tax_id").notNull(),
  processingVolume: decimal("processing_volume").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, active, rejected, suspended
  commissionRate: decimal("commission_rate").notNull(), // Rate assigned to this merchant
  monthlyFee: decimal("monthly_fee").notNull().default("0"),
  dateEnrolled: timestamp("date_enrolled").defaultNow(),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMerchantSchema = createInsertSchema(merchants).pick({
  isoPartnerId: true,
  businessName: true,
  contactName: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  zip: true,
  businessType: true,
  taxId: true,
  processingVolume: true,
  status: true,
  commissionRate: true,
  monthlyFee: true,
});

export type Merchant = typeof merchants.$inferSelect;
export type InsertMerchant = typeof merchants.$inferInsert;

// Merchant verification documents
export const merchantVerificationDocumentTypeEnum = pgEnum("merchant_verification_document_type", [
  "business_license", 
  "tax_id", 
  "incorporation_document", 
  "bank_statement", 
  "utility_bill", 
  "owner_id",
  "processing_statement",
  "other"
]);

export const merchantVerificationStatusEnum = pgEnum("merchant_verification_status", [
  "pending", 
  "submitted", 
  "verified", 
  "rejected", 
  "requires_additional_info"
]);

export const merchantVerifications = pgTable("merchant_verifications", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  status: text("status", { 
    enum: ["pending", "submitted", "verified", "rejected", "requires_additional_info"] 
  }).notNull().default("pending"),
  verificationNotes: text("verification_notes"),
  submittedAt: timestamp("submitted_at"),
  verifiedAt: timestamp("verified_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  reviewerId: integer("reviewer_id"), // User ID who reviewed
  kycStatus: text("kyc_status").notNull().default("pending"), // Know Your Customer
  amlStatus: text("aml_status").notNull().default("pending"), // Anti-Money Laundering
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMerchantVerificationSchema = createInsertSchema(merchantVerifications).pick({
  merchantId: true,
  status: true,
  verificationNotes: true,
  rejectionReason: true,
  reviewerId: true,
  kycStatus: true,
  amlStatus: true,
  termsAccepted: true,
});

export type MerchantVerification = typeof merchantVerifications.$inferSelect;
export type InsertMerchantVerification = typeof merchantVerifications.$inferInsert;

// Merchant verification documents
export const merchantVerificationDocuments = pgTable("merchant_verification_documents", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  verificationId: integer("verification_id").notNull(),
  documentType: text("document_type", { 
    enum: ["business_license", "tax_id", "incorporation_document", "bank_statement", "utility_bill", "owner_id", "processing_statement", "other"] 
  }).notNull(),
  documentUrl: text("document_url").notNull(), // URL to the uploaded document
  documentName: text("document_name").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  rejectedAt: timestamp("rejected_at"),
  status: text("status").notNull().default("pending"), // pending, verified, rejected
  rejectionReason: text("rejection_reason"),
  verifiedBy: integer("verified_by"), // User ID who verified
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMerchantVerificationDocumentSchema = createInsertSchema(merchantVerificationDocuments).pick({
  merchantId: true,
  verificationId: true,
  documentType: true,
  documentUrl: true,
  documentName: true,
  status: true,
  rejectionReason: true,
  verifiedBy: true,
  notes: true,
});

export type MerchantVerificationDocument = typeof merchantVerificationDocuments.$inferSelect;
export type InsertMerchantVerificationDocument = typeof merchantVerificationDocuments.$inferInsert;

// Merchant payment gateway integration
export const paymentGatewayTypeEnum = pgEnum("payment_gateway_type", [
  "helcim", 
  "stripe", 
  "paypal", 
  "authorize_net", 
  "square",
  "braintree",
  "other"
]);

export const merchantPaymentGateways = pgTable("merchant_payment_gateways", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  gatewayType: text("gateway_type", { 
    enum: ["helcim", "stripe", "paypal", "authorize_net", "square", "braintree", "other"] 
  }).notNull(),
  gatewayMerchantId: text("gateway_merchant_id").notNull(), // Gateway-specific merchant ID
  apiKey: text("api_key"), // Encrypted API key
  apiSecret: text("api_secret"), // Encrypted API secret
  publicKey: text("public_key"), // Public key if applicable
  environment: text("environment").notNull().default("sandbox"), // sandbox or production
  isActive: boolean("is_active").notNull().default(true),
  processingEnabled: boolean("processing_enabled").notNull().default(false),
  processingRate: decimal("processing_rate"), // Base processing rate
  transactionFee: decimal("transaction_fee"), // Per-transaction fee
  monthlyFee: decimal("monthly_fee"), // Monthly gateway fee
  integrationDate: timestamp("integration_date").defaultNow(),
  lastVerifiedAt: timestamp("last_verified_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMerchantPaymentGatewaySchema = createInsertSchema(merchantPaymentGateways).pick({
  merchantId: true,
  gatewayType: true,
  gatewayMerchantId: true,
  apiKey: true,
  apiSecret: true,
  publicKey: true,
  environment: true,
  isActive: true,
  processingEnabled: true,
  processingRate: true,
  transactionFee: true,
  monthlyFee: true,
  notes: true,
});

export type MerchantPaymentGateway = typeof merchantPaymentGateways.$inferSelect;
export type InsertMerchantPaymentGateway = typeof merchantPaymentGateways.$inferInsert;

// Merchant microsite settings
export const merchantMicrositeSettings = pgTable("merchant_microsite_settings", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull().unique(),
  subdomain: text("subdomain").notNull().unique(),
  useMicrosite: boolean("use_microsite").notNull().default(true),
  customDomain: text("custom_domain"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#0066cc"),
  secondaryColor: text("secondary_color").default("#f8f9fa"),
  accentColor: text("accent_color").default("#ff9900"),
  fontFamily: text("font_family").default("Arial, sans-serif"),
  heroImage: text("hero_image"),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  googleAnalyticsId: text("google_analytics_id"),
  facebookPixelId: text("facebook_pixel_id"),
  customCss: text("custom_css"),
  customJs: text("custom_js"),
  featuredProducts: jsonb("featured_products"), // Array of product IDs
  showTestimonials: boolean("show_testimonials").notNull().default(true),
  showFaq: boolean("show_faq").notNull().default(true),
  enableChat: boolean("enable_chat").notNull().default(false),
  enableOnlinePayments: boolean("enable_online_payments").notNull().default(true),
  enableBooking: boolean("enable_booking").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMerchantMicrositeSettingsSchema = createInsertSchema(merchantMicrositeSettings).pick({
  merchantId: true,
  subdomain: true,
  useMicrosite: true,
  customDomain: true,
  logoUrl: true,
  primaryColor: true,
  secondaryColor: true,
  accentColor: true,
  fontFamily: true,
  heroImage: true,
  heroTitle: true,
  heroSubtitle: true,
  metaTitle: true,
  metaDescription: true,
  googleAnalyticsId: true,
  facebookPixelId: true,
  customCss: true,
  customJs: true,
  featuredProducts: true,
  showTestimonials: true,
  showFaq: true,
  enableChat: true,
  enableOnlinePayments: true,
  enableBooking: true,
});

export type MerchantMicrositeSettings = typeof merchantMicrositeSettings.$inferSelect;
export type InsertMerchantMicrositeSettings = typeof merchantMicrositeSettings.$inferInsert;

// Commissions earned by ISO partners
export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  isoPartnerId: integer("iso_partner_id").notNull(),
  merchantId: integer("merchant_id").notNull(),
  amount: decimal("amount").notNull(),
  transactionVolume: decimal("transaction_volume").notNull(),
  date: date("date").notNull(),
  status: text("status").notNull().default("pending"), // pending, paid
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommissionSchema = createInsertSchema(commissions).pick({
  isoPartnerId: true,
  merchantId: true,
  amount: true,
  transactionVolume: true,
  date: true,
  status: true,
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

// Training documents for ISO partners
export const trainingDocuments = pgTable("training_documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  link: text("link").notNull(),
  documentType: text("document_type").notNull(), // manual, video, webinar, etc.
  category: text("category").notNull(), // sales, technical, compliance, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTrainingDocumentSchema = createInsertSchema(trainingDocuments).pick({
  title: true,
  description: true,
  link: true,
  documentType: true,
  category: true,
});

export type TrainingDocument = typeof trainingDocuments.$inferSelect;
export type InsertTrainingDocument = typeof trainingDocuments.$inferInsert;

// Support tickets for ISO partners
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  isoPartnerId: integer("iso_partner_id").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  assignedTo: integer("assigned_to"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
  isoPartnerId: true,
  subject: true,
  description: true,
  priority: true,
  status: true,
  assignedTo: true,
  resolution: true,
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

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
export const isoPartnersRelations = relations(isoPartners, ({ one, many }) => ({
  user: one(users, {
    fields: [isoPartners.userId],
    references: [users.id],
  }),
  merchants: many(merchants),
  commissions: many(commissions),
  supportTickets: many(supportTickets),
}));

export const merchantsRelations = relations(merchants, ({ one, many }) => ({
  isoPartner: one(isoPartners, {
    fields: [merchants.isoPartnerId],
    references: [isoPartners.id],
  }),
  commissions: many(commissions),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  isoPartner: one(isoPartners, {
    fields: [commissions.isoPartnerId],
    references: [isoPartners.id],
  }),
  merchant: one(merchants, {
    fields: [commissions.merchantId],
    references: [merchants.id],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  isoPartner: one(isoPartners, {
    fields: [supportTickets.isoPartnerId],
    references: [isoPartners.id],
  }),
  assignedToUser: one(users, {
    fields: [supportTickets.assignedTo],
    references: [users.id],
  }),
}));
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
export const merchantStatusEnum = pgEnum("merchant_status", ["pending", "active", "suspended", "inactive", "rejected"]);

export const merchantProfiles = pgTable("merchant_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Link to the user who owns/manages this merchant
  isoPartnerId: integer("iso_partner_id"), // The ISO Partner who acquired this merchant
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
  subdomain: text("subdomain").unique(), // For microsite [merchant-name].paysurity.com
  useMicrosite: boolean("use_microsite").default(false), // Whether the merchant uses our microsite
  integrationCode: text("integration_code"), // JS code for integration with existing site
  profilePhoto: text("profile_photo"), // For microsite display
  profileBio: text("profile_bio"), // Merchant's "About Us" text for microsite
  customColors: jsonb("custom_colors"), // UI theme customization for microsite
  status: text("status", { enum: ["pending", "active", "suspended", "inactive", "rejected"] }).notNull().default("pending"),
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
  isoPartnerId: true,
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
  subdomain: true,
  useMicrosite: true,
  integrationCode: true,
  profilePhoto: true,
  profileBio: true,
  customColors: true,
  status: true,
  processingFeePercentage: true,
  monthlyFee: true,
  payoutSchedule: true,
  timezone: true,
});

// Payment Gateway Schema
// This enum is already defined above - using that one instead

export const paymentGateways = pgTable("payment_gateways", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Link to the merchant profile
  gatewayType: text("gateway_type", { enum: ["helcim", "stripe", "paypal", "authorize_net", "square", "braintree", "other"] }).notNull(),
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
  profilePhoto: text("profile_photo"), // URL to the affiliate's profile photo or avatar
  profileBio: text("profile_bio"), // Short bio/description of the affiliate
  subdomain: text("subdomain").notNull().unique(), // For their microsite (e.g., affiliate-name)
  socialMediaLinks: jsonb("social_media_links"), // JSON array of social media profiles
  marketingSpecialty: text("marketing_specialty"), // SEO, content, social media, PPC, etc.
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
  profilePhoto: true,
  profileBio: true,
  subdomain: true,
  socialMediaLinks: true,
  marketingSpecialty: true,
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
  maxHoursPerWeek: numeric("max_hours_per_week"),
  minRestHoursBetweenShifts: numeric("min_rest_hours_between_shifts").default("8"),
  overtimeThreshold: numeric("overtime_threshold").default("40"), // Hours per week before overtime kicks in
  overtimeRate: numeric("overtime_rate"), // Multiplier for overtime pay
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
  maxHoursPerWeek: true,
  minRestHoursBetweenShifts: true,
  overtimeThreshold: true,
  overtimeRate: true,
});

// Staff Availability - When staff can work
export const posStaffAvailability = pgTable("pos_staff_availability", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull(), // References posStaff
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("start_time", { length: 5 }).notNull(), // 24hr format (HH:MM)
  endTime: varchar("end_time", { length: 5 }).notNull(), // 24hr format (HH:MM)
  isAvailable: boolean("is_available").default(true), // Used to indicate preferred times vs unavailable times
  priority: integer("priority").default(1), // Higher numbers mean higher priority for scheduling
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosStaffAvailabilitySchema = createInsertSchema(posStaffAvailability).pick({
  staffId: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  isAvailable: true,
  priority: true,
  notes: true,
});

// Schedule Templates - Repeating shift patterns
export const posScheduleTemplates = pgTable("pos_schedule_templates", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(), // References posLocations
  name: text("name").notNull(), // e.g., "Summer Schedule", "Holiday Schedule"
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosScheduleTemplateSchema = createInsertSchema(posScheduleTemplates).pick({
  locationId: true,
  name: true,
  description: true,
  isActive: true,
});

// Template Shifts - Shifts defined in a template
export const posTemplateShifts = pgTable("pos_template_shifts", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(), // References posScheduleTemplates
  position: text("position").notNull(), // e.g., "Server", "Chef", "Bartender"
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("start_time", { length: 5 }).notNull(), // 24hr format (HH:MM)
  endTime: varchar("end_time", { length: 5 }).notNull(), // 24hr format (HH:MM)
  staffCount: integer("staff_count").default(1), // Number of staff needed for this position
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosTemplateShiftSchema = createInsertSchema(posTemplateShifts).pick({
  templateId: true,
  position: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  staffCount: true,
  notes: true,
});

// Time Off Requests
export const posTimeOffRequests = pgTable("pos_time_off_requests", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull(), // References posStaff
  startDate: date("start_date").notNull(), 
  endDate: date("end_date").notNull(),
  startTime: varchar("start_time", { length: 5 }), // Optional, for partial day off
  endTime: varchar("end_time", { length: 5 }), // Optional, for partial day off
  reason: text("reason"),
  status: text("status").notNull().default("pending"), // pending, approved, denied
  approvedById: integer("approved_by_id"), // Staff who approved/denied
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  isPaid: boolean("is_paid").default(false), // Whether this is paid time off
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPosTimeOffRequestSchema = createInsertSchema(posTimeOffRequests).pick({
  staffId: true,
  startDate: true,
  endDate: true,
  startTime: true,
  endTime: true,
  reason: true,
  status: true,
  approvedById: true,
  approvedAt: true,
  notes: true,
  isPaid: true,
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
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, canceled
  isPublished: boolean("is_published").default(false), // Whether the shift is visible to staff
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
  status: true,
  isPublished: true,
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

// Staff scheduling types
export type PosStaffAvailability = typeof posStaffAvailability.$inferSelect;
export type InsertPosStaffAvailability = z.infer<typeof insertPosStaffAvailabilitySchema>;

export type PosScheduleTemplate = typeof posScheduleTemplates.$inferSelect;
export type InsertPosScheduleTemplate = z.infer<typeof insertPosScheduleTemplateSchema>;

export type PosTemplateShift = typeof posTemplateShifts.$inferSelect;
export type InsertPosTemplateShift = z.infer<typeof insertPosTemplateShiftSchema>;

export type PosTimeOffRequest = typeof posTimeOffRequests.$inferSelect;
export type InsertPosTimeOffRequest = z.infer<typeof insertPosTimeOffRequestSchema>;

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

// ========================================================================
// PaySurity ECom Ready - Retail POS System
// ========================================================================

// Product category enum
export const productCategoryTypeEnum = pgEnum("product_category_type", [
  "clothing", "electronics", "home_goods", "beauty", "accessories", "books", "toys", "sports", "grocery", "other"
]);

// Product categories
export const retailCategories = pgTable("retail_categories", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  parentCategoryId: integer("parent_category_id"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRetailCategorySchema = createInsertSchema(retailCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type RetailCategory = typeof retailCategories.$inferSelect;
export type InsertRetailCategory = z.infer<typeof insertRetailCategorySchema>;

// Products
export const retailProducts = pgTable("retail_products", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").notNull(),
  barcode: text("barcode"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: decimal("compare_price", { precision: 10, scale: 2 }),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  taxable: boolean("taxable").default(true),
  inStock: integer("in_stock").default(0),
  lowStockThreshold: integer("low_stock_threshold"),
  categoryId: integer("category_id"),
  imageUrl: text("image_url"),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  weightUnit: text("weight_unit").default("lb"),
  dimensions: jsonb("dimensions"), // { length, width, height, unit }
  hasVariants: boolean("has_variants").default(false),
  variantOptions: jsonb("variant_options"), // Array of { name, values }
  tags: text("tags"),
  metadata: jsonb("metadata"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRetailProductSchema = createInsertSchema(retailProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type RetailProduct = typeof retailProducts.$inferSelect;
export type InsertRetailProduct = z.infer<typeof insertRetailProductSchema>;

// Product variants
export const retailProductVariants = pgTable("retail_product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  title: text("title").notNull(),
  sku: text("sku").notNull(),
  barcode: text("barcode"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: decimal("compare_price", { precision: 10, scale: 2 }),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  inStock: integer("in_stock").default(0),
  options: jsonb("options").notNull(), // Array of { name, value }
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRetailProductVariantSchema = createInsertSchema(retailProductVariants).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type RetailProductVariant = typeof retailProductVariants.$inferSelect;
export type InsertRetailProductVariant = z.infer<typeof insertRetailProductVariantSchema>;

// Customer schema for retail POS
export const retailCustomers = pgTable("retail_customers", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").default("USA"),
  notes: text("notes"),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  totalOrders: integer("total_orders").default(0),
  loyaltyPoints: integer("loyalty_points").default(0),
  birthDate: date("birth_date"),
  lastOrderDate: timestamp("last_order_date"),
  tags: text("tags"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRetailCustomerSchema = createInsertSchema(retailCustomers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type RetailCustomer = typeof retailCustomers.$inferSelect;
export type InsertRetailCustomer = z.infer<typeof insertRetailCustomerSchema>;

// Retail orders/sales
export const retailOrderStatusEnum = pgEnum("retail_order_status", [
  "draft", "completed", "refunded", "partially_refunded", "voided", "on_hold"
]);

export const retailOrders = pgTable("retail_orders", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  orderNumber: text("order_number").notNull(),
  customerId: integer("customer_id"),
  userId: integer("user_id").notNull(), // Employee who processed the order
  status: text("status", { enum: ["draft", "completed", "refunded", "partially_refunded", "voided", "on_hold"] }).notNull().default("draft"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  isOnline: boolean("is_online").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRetailOrderSchema = createInsertSchema(retailOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type RetailOrder = typeof retailOrders.$inferSelect;
export type InsertRetailOrder = z.infer<typeof insertRetailOrderSchema>;

// Order items
export const retailOrderItems = pgTable("retail_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  variantId: integer("variant_id"),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  options: jsonb("options"), // Variant options
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRetailOrderItemSchema = createInsertSchema(retailOrderItems).omit({
  id: true,
  createdAt: true
});

export type RetailOrderItem = typeof retailOrderItems.$inferSelect;
export type InsertRetailOrderItem = z.infer<typeof insertRetailOrderItemSchema>;

// Suppliers
export const retailSuppliers = pgTable("retail_suppliers", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").default("USA"),
  website: text("website"),
  notes: text("notes"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRetailSupplierSchema = createInsertSchema(retailSuppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type RetailSupplier = typeof retailSuppliers.$inferSelect;
export type InsertRetailSupplier = z.infer<typeof insertRetailSupplierSchema>;

// Inventory transactions
export const retailInventoryTransactionTypeEnum = pgEnum("retail_inventory_transaction_type", [
  "stock_in", "stock_out", "adjustment", "transfer", "sale", "return"
]);

export const retailInventoryTransactions = pgTable("retail_inventory_transactions", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  productId: integer("product_id").notNull(),
  variantId: integer("variant_id"),
  type: text("type", { enum: ["stock_in", "stock_out", "adjustment", "transfer", "sale", "return"] }).notNull(),
  quantity: integer("quantity").notNull(),
  reason: text("reason"),
  notes: text("notes"),
  orderId: integer("order_id"),
  supplierId: integer("supplier_id"),
  userId: integer("user_id").notNull(), // Employee who recorded the transaction
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRetailInventoryTransactionSchema = createInsertSchema(retailInventoryTransactions).omit({
  id: true,
  createdAt: true
});

export type RetailInventoryTransaction = typeof retailInventoryTransactions.$inferSelect;
export type InsertRetailInventoryTransaction = z.infer<typeof insertRetailInventoryTransactionSchema>;

// ========================================================================
// BistroBeast - Restaurant POS System
// ========================================================================

// Menu categories for BistroBeast
export const menuCategoryTypeEnum = pgEnum("menu_category_type", [
  "appetizer", "main", "side", "dessert", "beverage", "alcohol", "combo", "special"
]);

export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type", { enum: ["appetizer", "main", "side", "dessert", "beverage", "alcohol", "combo", "special"] }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  imageUrl: text("image_url"),
  availableStartTime: text("available_start_time"), // Format: HH:MM
  availableEndTime: text("available_end_time"), // Format: HH:MM
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMenuCategorySchema = createInsertSchema(menuCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type MenuCategory = typeof menuCategories.$inferSelect;
export type InsertMenuCategory = z.infer<typeof insertMenuCategorySchema>;

// Menu items (dishes/products)
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  categoryId: integer("category_id").notNull(),
  imageUrl: text("image_url"),
  calories: integer("calories"),
  preparationTime: integer("preparation_time"), // In minutes
  isVegetarian: boolean("is_vegetarian").default(false),
  isVegan: boolean("is_vegan").default(false),
  isGlutenFree: boolean("is_gluten_free").default(false),
  spicyLevel: integer("spicy_level").default(0), // 0 = not spicy, 1-5 = spicy levels
  allergens: text("allergens"), // Comma-separated list
  ingredients: text("ingredients"), // Comma-separated list
  isRecommended: boolean("is_recommended").default(false),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  hasModifiers: boolean("has_modifiers").default(false),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }),
  isAlcoholic: boolean("is_alcoholic").default(false),
  minAge: integer("min_age"), // For age-restricted items
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

// Menu item modifiers (like extra cheese, toppings, etc.)
export const menuItemModifiers = pgTable("menu_item_modifiers", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id").notNull(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isDefault: boolean("is_default").default(false),
  isRequired: boolean("is_required").default(false),
  maxSelections: integer("max_selections").default(1),
  minSelections: integer("min_selections").default(0),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMenuItemModifierSchema = createInsertSchema(menuItemModifiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type MenuItemModifier = typeof menuItemModifiers.$inferSelect;
export type InsertMenuItemModifier = z.infer<typeof insertMenuItemModifierSchema>;

// Restaurant tables
export const restaurantTableStatusEnum = pgEnum("restaurant_table_status", [
  "available", "occupied", "reserved", "maintenance"
]);

export const restaurantTables = pgTable("restaurant_tables", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull(),
  status: text("status", { enum: ["available", "occupied", "reserved", "maintenance"] }).notNull().default("available"),
  locationId: integer("location_id"), // If restaurant has multiple locations
  currentOrderId: integer("current_order_id"), // If table is occupied
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRestaurantTableSchema = createInsertSchema(restaurantTables).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type RestaurantTable = typeof restaurantTables.$inferSelect;
export type InsertRestaurantTable = z.infer<typeof insertRestaurantTableSchema>;

// Restaurant orders
export const restaurantOrderStatusEnum = pgEnum("restaurant_order_status", [
  "draft", "placed", "preparing", "ready", "served", "completed", "canceled", "modifying"
]);

export const restaurantOrders = pgTable("restaurant_orders", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  orderNumber: text("order_number").notNull(),
  tableId: integer("table_id"),
  serverId: integer("server_id").notNull(), // Employee who took the order
  status: text("status", { enum: ["draft", "placed", "preparing", "ready", "served", "completed", "canceled", "modifying"] }).notNull().default("draft"),
  customerCount: integer("customer_count").default(1),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  tipAmount: decimal("tip_amount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default("pending"),
  notes: text("notes"),
  isDelivery: boolean("is_delivery").default(false),
  isTakeout: boolean("is_takeout").default(false),
  deliveryAddress: text("delivery_address"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  // QR code ordering specific fields
  isQrOrder: boolean("is_qr_order").default(false),
  qrOrderSource: text("qr_order_source"), // Store info about which QR code was used
  estimatedPrepTime: integer("estimated_prep_time"), // In minutes
  actualPrepTime: integer("actual_prep_time"), // In minutes, for analytics
  smsNotificationSent: boolean("sms_notification_sent").default(false),
  smsNotificationCount: integer("sms_notification_count").default(0),
  smsOptedIn: boolean("sms_opted_in").default(false), // Customer opted in for SMS
  lastSmsTimestamp: timestamp("last_sms_timestamp"),
  modificationToken: text("modification_token"), // Token for order modification link
  modificationTokenExpiry: timestamp("modification_token_expiry"),
  isBeingModified: boolean("is_being_modified").default(false),
  modificationStartTime: timestamp("modification_start_time"),
  modificationReminderSent: boolean("modification_reminder_sent").default(false),
  modificationTimeoutSent: boolean("modification_timeout_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertRestaurantOrderSchema = createInsertSchema(restaurantOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  lastSmsTimestamp: true,
  modificationTokenExpiry: true,
  actualPrepTime: true,
  modificationStartTime: true,
  modificationReminderSent: true,
  modificationTimeoutSent: true
});

export type RestaurantOrder = typeof restaurantOrders.$inferSelect;
export type InsertRestaurantOrder = z.infer<typeof insertRestaurantOrderSchema>;

// Order items
export const restaurantOrderItems = pgTable("restaurant_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  menuItemId: integer("menu_item_id").notNull(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
  modifiers: jsonb("modifiers"), // Array of selected modifiers
  status: text("status").default("pending"), // pending, preparing, ready, served, canceled
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  sentToKitchenAt: timestamp("sent_to_kitchen_at"),
  readyAt: timestamp("ready_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRestaurantOrderItemSchema = createInsertSchema(restaurantOrderItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentToKitchenAt: true,
  readyAt: true
});

export type RestaurantOrderItem = typeof restaurantOrderItems.$inferSelect;
export type InsertRestaurantOrderItem = z.infer<typeof insertRestaurantOrderItemSchema>;

// Restaurant inventory items
export const restaurantInventoryItems = pgTable("restaurant_inventory_items", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(), // kg, g, L, ml, unit, etc.
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  minStockLevel: decimal("min_stock_level", { precision: 10, scale: 2 }),
  supplierId: integer("supplier_id"),
  supplierName: text("supplier_name"),
  expiryDate: date("expiry_date"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRestaurantInventoryItemSchema = createInsertSchema(restaurantInventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUpdated: true
});

export type RestaurantInventoryItem = typeof restaurantInventoryItems.$inferSelect;
export type InsertRestaurantInventoryItem = z.infer<typeof insertRestaurantInventoryItemSchema>;

// Restaurant inventory transactions
export const restaurantInventoryTransactions = pgTable("restaurant_inventory_transactions", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  itemId: integer("item_id").notNull(),
  itemName: text("item_name").notNull(),
  transactionType: text("transaction_type", { enum: ["purchase", "waste", "usage", "adjustment", "transfer"] }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  notes: text("notes"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  supplierId: integer("supplier_id"),
  supplierName: text("supplier_name"),
  userId: integer("user_id").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRestaurantInventoryTransactionSchema = createInsertSchema(restaurantInventoryTransactions).omit({
  id: true,
  createdAt: true
});

export type RestaurantInventoryTransaction = typeof restaurantInventoryTransactions.$inferSelect;
export type InsertRestaurantInventoryTransaction = z.infer<typeof insertRestaurantInventoryTransactionSchema>;

// Legal Industry Schema - IOLTA Compliance

// IOLTA Account Status
export const ioltaAccountStatusEnum = pgEnum("iolta_account_status", ["active", "inactive", "pending_verification", "suspended"]);

// IOLTA Account Type 
export const ioltaAccountTypeEnum = pgEnum("iolta_account_type", ["attorney_trust", "escrow", "iolta", "iola", "general_client_trust"]);

// Transaction Fund Type
export const transactionFundTypeEnum = pgEnum("transaction_fund_type", ["earned", "unearned", "expense", "expense_advance", "filing_fee", "retainer", "trust", "operating"]);

// IOLTA Trust Accounts
export const ioltaTrustAccounts = pgTable("iolta_trust_accounts", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm/attorney profile
  accountName: text("account_name").notNull(),
  accountType: text("account_type", { enum: ["attorney_trust", "escrow", "iolta", "iola", "general_client_trust"] }).notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  routingNumber: text("routing_number").notNull(),
  accountStatus: text("account_status", { enum: ["active", "inactive", "pending_verification", "suspended"] }).notNull().default("pending_verification"),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0.00"),
  lastReconcileDate: timestamp("last_reconcile_date"),
  interestBeneficiary: text("interest_beneficiary").default("state_bar_foundation"),
  barAssociationId: text("bar_association_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIoltaTrustAccountSchema = createInsertSchema(ioltaTrustAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type IoltaTrustAccount = typeof ioltaTrustAccounts.$inferSelect;
export type InsertIoltaTrustAccount = z.infer<typeof insertIoltaTrustAccountSchema>;

// IOLTA Client Trust Ledgers
export const ioltaClientLedgers = pgTable("iolta_client_ledgers", {
  id: serial("id").primaryKey(),
  trustAccountId: integer("trust_account_id").notNull(),
  merchantId: integer("merchant_id").notNull(),
  clientName: text("client_name").notNull(),
  clientId: text("client_id").notNull(), // Custom client ID or reference number
  matterName: text("matter_name").notNull(),
  matterNumber: text("matter_number").notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIoltaClientLedgerSchema = createInsertSchema(ioltaClientLedgers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type IoltaClientLedger = typeof ioltaClientLedgers.$inferSelect;
export type InsertIoltaClientLedger = z.infer<typeof insertIoltaClientLedgerSchema>;

// IOLTA Transactions
export const ioltaTransactions = pgTable("iolta_transactions", {
  id: serial("id").primaryKey(),
  trustAccountId: integer("trust_account_id").notNull(),
  clientLedgerId: integer("client_ledger_id").notNull(),
  transactionType: text("transaction_type").notNull(), // deposit, withdrawal, transfer, payment
  fundType: text("fund_type", { enum: ["earned", "unearned", "expense", "expense_advance", "filing_fee", "retainer", "trust", "operating"] }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethodId: integer("payment_method_id"),
  checkNumber: text("check_number"),
  description: text("description").notNull(),
  reference: text("reference"), // External reference number
  relatedInvoiceId: integer("related_invoice_id"),
  createdBy: integer("created_by").notNull(), // User ID who created the transaction
  approvedBy: integer("approved_by"), // User ID who approved the transaction
  status: text("status").notNull().default("pending"), // pending, completed, rejected, voided
  earningDate: timestamp("earning_date"), // When funds are considered earned (for transfers from trust to operating)
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const insertIoltaTransactionSchema = createInsertSchema(ioltaTransactions).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export type IoltaTransaction = typeof ioltaTransactions.$inferSelect;
export type InsertIoltaTransaction = z.infer<typeof insertIoltaTransactionSchema>;

// Legal Time and Expense Tracking

// Time Entry Type Enum
export const timeEntryTypeEnum = pgEnum("time_entry_type", ["billable", "non_billable", "no_charge"]);

// Legal Time Entries
export const legalTimeEntries = pgTable("legal_time_entries", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  userId: integer("user_id").notNull(), // The timekeeper (attorney, paralegal)
  clientId: integer("client_id").notNull(),
  matterNumber: text("matter_number").notNull(),
  dateOfWork: date("date_of_work").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  duration: decimal("duration", { precision: 6, scale: 2 }).notNull(), // Hours in decimal form
  description: text("description").notNull(),
  entryType: text("entry_type", { enum: ["billable", "non_billable", "no_charge"] }).notNull().default("billable"),
  billingRate: decimal("billing_rate", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  taskCode: text("task_code"), // For standardized legal billing codes (UTBMS, ABA, etc.)
  activityCode: text("activity_code"),
  invoiceId: integer("invoice_id"),
  invoiced: boolean("invoiced").default(false),
  status: text("status").notNull().default("active"), // active, billed, deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLegalTimeEntrySchema = createInsertSchema(legalTimeEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LegalTimeEntry = typeof legalTimeEntries.$inferSelect;
export type InsertLegalTimeEntry = z.infer<typeof insertLegalTimeEntrySchema>;

// Legal Expense Type Enum
export const legalExpenseTypeEnum = pgEnum("legal_expense_type", [
  "court_fees", "filing_fees", "expert_witness", "deposition", "transcript", 
  "service_of_process", "travel", "copying", "postage", "research", "other"
]);

// Legal Expense Entries
export const legalExpenseEntries = pgTable("legal_expense_entries", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  userId: integer("user_id").notNull(), // The person recording the expense
  clientId: integer("client_id").notNull(),
  matterNumber: text("matter_number").notNull(),
  expenseDate: date("expense_date").notNull(),
  expenseType: legalExpenseTypeEnum("expense_type").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  billable: boolean("billable").notNull().default(true),
  markupPercentage: decimal("markup_percentage", { precision: 5, scale: 2 }).default("0.00"),
  totalBillableAmount: decimal("total_billable_amount", { precision: 10, scale: 2 }),
  receiptImageUrl: text("receipt_image_url"),
  invoiceId: integer("invoice_id"),
  invoiced: boolean("invoiced").default(false),
  status: text("status").notNull().default("active"), // active, billed, deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLegalExpenseEntrySchema = createInsertSchema(legalExpenseEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LegalExpenseEntry = typeof legalExpenseEntries.$inferSelect;
export type InsertLegalExpenseEntry = z.infer<typeof insertLegalExpenseEntrySchema>;

// Legal Invoicing System

// Invoice Status Enum
export const legalInvoiceStatusEnum = pgEnum("legal_invoice_status", [
  "draft", "sent", "viewed", "partial_payment", "paid", "overdue", "void"
]);

// Legal Invoices Table
export const legalInvoices = pgTable("legal_invoices", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  clientId: integer("client_id").notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  matterNumber: text("matter_number").notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0.00"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountRate: decimal("discount_rate", { precision: 5, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).default("0.00"),
  balanceDue: decimal("balance_due", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  termsAndConditions: text("terms_and_conditions"),
  status: legalInvoiceStatusEnum("status").notNull().default("draft"),
  lastSentDate: timestamp("last_sent_date"),
  paymentLink: text("payment_link"),
  paymentQrCode: text("payment_qr_code"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLegalInvoiceSchema = createInsertSchema(legalInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LegalInvoice = typeof legalInvoices.$inferSelect;
export type InsertLegalInvoice = z.infer<typeof insertLegalInvoiceSchema>;

// Invoice-Time Entry Junction Table
export const legalInvoiceTimeEntries = pgTable("legal_invoice_time_entries", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  timeEntryId: integer("time_entry_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLegalInvoiceTimeEntrySchema = createInsertSchema(legalInvoiceTimeEntries).omit({
  id: true,
  createdAt: true,
});

export type LegalInvoiceTimeEntry = typeof legalInvoiceTimeEntries.$inferSelect;
export type InsertLegalInvoiceTimeEntry = z.infer<typeof insertLegalInvoiceTimeEntrySchema>;

// Invoice-Expense Entry Junction Table
export const legalInvoiceExpenseEntries = pgTable("legal_invoice_expense_entries", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  expenseEntryId: integer("expense_entry_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLegalInvoiceExpenseEntrySchema = createInsertSchema(legalInvoiceExpenseEntries).omit({
  id: true,
  createdAt: true,
});

export type LegalInvoiceExpenseEntry = typeof legalInvoiceExpenseEntries.$inferSelect;
export type InsertLegalInvoiceExpenseEntry = z.infer<typeof insertLegalInvoiceExpenseEntrySchema>;

// Payment Plans
export const recurringFrequencyEnum = pgEnum("recurring_frequency", [
  "weekly", "biweekly", "monthly", "quarterly", "semiannual", "annual"
]);

export const paymentPlanStatusEnum = pgEnum("payment_plan_status", [
  "active", "on_hold", "completed", "cancelled", "defaulted"
]);

// Payment Plans Table - For scheduled/recurring payments

export const paymentPlans = pgTable("payment_plans", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  clientId: integer("client_id").notNull(),
  invoiceId: integer("invoice_id"), // Optional - can be for standalone payment plans
  planName: text("plan_name").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }).notNull(),
  installmentAmount: decimal("installment_amount", { precision: 10, scale: 2 }).notNull(),
  numberOfInstallments: integer("number_of_installments").notNull(),
  installmentsPaid: integer("installments_paid").default(0),
  frequency: recurringFrequencyEnum("frequency").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  nextPaymentDate: date("next_payment_date").notNull(),
  lastPaymentDate: date("last_payment_date"),
  paymentMethodId: integer("payment_method_id").notNull(), // Stored payment method
  status: paymentPlanStatusEnum("status").notNull().default("active"),
  autoProcess: boolean("auto_process").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type InsertPaymentPlan = z.infer<typeof insertPaymentPlanSchema>;

// Payment Plan Transactions
export const paymentPlanTransactions = pgTable("payment_plan_transactions", {
  id: serial("id").primaryKey(),
  paymentPlanId: integer("payment_plan_id").notNull(),
  plannedDate: date("planned_date").notNull(),
  actualDate: date("actual_date"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, processing, completed, failed
  transactionId: integer("transaction_id"), // Reference to the actual payment transaction
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0),
  nextRetryDate: timestamp("next_retry_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentPlanTransactionSchema = createInsertSchema(paymentPlanTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PaymentPlanTransaction = typeof paymentPlanTransactions.$inferSelect;
export type InsertPaymentPlanTransaction = z.infer<typeof insertPaymentPlanTransactionSchema>;

// Legal Client Financing (Pay Later)
export const legalFinancingStatusEnum = pgEnum("legal_financing_status", [
  "pending_application", "approved", "active", "rejected", "completed", "defaulted", "cancelled"
]);

// Client Onboarding and Matter Management Schemas

// Client type enum
export const legalClientTypeEnum = pgEnum("legal_client_type", ["individual", "corporate"]);

// Client status enum
export const legalClientStatusEnum = pgEnum("legal_client_status", ["prospect", "active", "inactive", "former"]);

// Conflict check status enum
export const conflictCheckStatusEnum = pgEnum("conflict_check_status", ["pending", "passed", "failed", "waived"]);

// Matter status enum
export const legalMatterStatusEnum = pgEnum("legal_matter_status", ["open", "pending", "closed", "archived"]);

// Practice area enum
export const legalPracticeAreaEnum = pgEnum("legal_practice_area", [
  "corporate", "litigation", "real_estate", "intellectual_property", "family", "estate_planning", 
  "tax", "bankruptcy", "immigration", "employment", "criminal", "personal_injury", 
  "environmental", "other"
]);

// Billing line item type enum
export const legalBillingItemTypeEnum = pgEnum("legal_billing_item_type", [
  "time_based", "flat_fee", "retainer", "expense", "custom"
]);

// We already have a legalExpenseTypeEnum defined elsewhere in the file
// This updated version consolidates all expense types into a single enum

// Time-based billing activity type enum
export const legalTimeActivityTypeEnum = pgEnum("legal_time_activity_type", [
  "legal_consultation", "document_drafting", "document_review", "court_appearance", 
  "legal_research", "client_communication", "discovery_process", "settlement_negotiation", 
  "deposition", "trial_preparation", "mediation", "phone_call", "email", "meeting", "other"
]);

// Flat-fee service type enum
export const legalFlatFeeServiceTypeEnum = pgEnum("legal_flat_fee_service_type", [
  "business_formation", "will_preparation", "trust_preparation", "trademark_filing", 
  "closing_services", "immigration_petition", "incorporation", "contract_review", 
  "simple_will", "power_of_attorney", "trademark_search", "uncontested_divorce", "other"
]);

// Legal clients
export const legalClients = pgTable("legal_clients", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  clientType: legalClientTypeEnum("client_type").notNull(),
  status: legalClientStatusEnum("status").notNull().default("prospect"),
  firstName: text("first_name"),  // For individual clients
  lastName: text("last_name"),    // For individual clients
  companyName: text("company_name"), // For corporate clients
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  taxId: text("tax_id"), // SSN or EIN (stored securely)
  notes: text("notes"),
  referralSource: text("referral_source"),
  conflictCheckStatus: conflictCheckStatusEnum("conflict_check_status").notNull().default("pending"),
  conflictCheckNotes: text("conflict_check_notes"),
  retainerAgreementSigned: boolean("retainer_agreement_signed").default(false),
  retainerAgreementDate: date("retainer_agreement_date"),
  retainerAgreementDocumentId: integer("retainer_agreement_document_id"), // Reference to document in document management system
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertLegalClientSchema = createInsertSchema(legalClients).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type LegalClient = typeof legalClients.$inferSelect;
export type InsertLegalClient = z.infer<typeof insertLegalClientSchema>;

// Related parties (for conflict checks)
export const legalRelatedParties = pgTable("legal_related_parties", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  clientId: integer("client_id").notNull(), // The client this party is related to
  name: text("name").notNull(),
  relationship: text("relationship").notNull(), // E.g., "opposing party", "co-defendant", "family member"
  contact: text("contact"), // Contact information
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertLegalRelatedPartySchema = createInsertSchema(legalRelatedParties).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type LegalRelatedParty = typeof legalRelatedParties.$inferSelect;
export type InsertLegalRelatedParty = z.infer<typeof insertLegalRelatedPartySchema>;

// Legal matters
export const legalMatters = pgTable("legal_matters", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  clientId: integer("client_id").notNull(), // Client associated with this matter
  matterNumber: text("matter_number").notNull(), // Unique identifier for the matter (often used in legal billing)
  title: text("title").notNull(),
  description: text("description"),
  practiceArea: legalPracticeAreaEnum("practice_area").notNull(),
  status: legalMatterStatusEnum("status").notNull().default("open"),
  openDate: date("open_date").notNull(),
  closeDate: date("close_date"),
  responsibleAttorneyId: integer("responsible_attorney_id").notNull(), // User ID of the attorney
  jurisdiction: text("jurisdiction"), // Court jurisdiction
  courtCaseNumber: text("court_case_number"),
  opposingParty: text("opposing_party"),
  opposingCounsel: text("opposing_counsel"),
  billingType: text("billing_type").notNull(), // "hourly", "fixed", "contingency"
  billingRate: numeric("billing_rate"), // For hourly billing
  fixedFeeAmount: numeric("fixed_fee_amount"), // For fixed fee billing
  contingencyPercentage: integer("contingency_percentage"), // For contingency billing
  estimatedHours: integer("estimated_hours"),
  estimatedFees: numeric("estimated_fees"),
  statuteOfLimitations: date("statute_of_limitations"),
  notes: text("notes"),
  conflictCheckComplete: boolean("conflict_check_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertLegalMatterSchema = createInsertSchema(legalMatters).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type LegalMatter = typeof legalMatters.$inferSelect;
export type InsertLegalMatter = z.infer<typeof insertLegalMatterSchema>;

// Matter team members (attorneys, paralegals, etc.)
export const legalMatterTeamMembers = pgTable("legal_matter_team_members", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  matterId: integer("matter_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(), // "lead_attorney", "associate", "paralegal", etc.
  rateOverride: numeric("rate_override"), // Override standard billing rate for this matter
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertLegalMatterTeamMemberSchema = createInsertSchema(legalMatterTeamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type LegalMatterTeamMember = typeof legalMatterTeamMembers.$inferSelect;
export type InsertLegalMatterTeamMember = z.infer<typeof insertLegalMatterTeamMemberSchema>;

// Client Financing Applications
export const clientFinancingApplications = pgTable("client_financing_applications", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  clientId: integer("client_id").notNull(),
  invoiceId: integer("invoice_id"), // Optional - can be for retainer or future services
  financingAmount: decimal("financing_amount", { precision: 10, scale: 2 }).notNull(),
  termMonths: integer("term_months").notNull(), // Financing term in months
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }).notNull(),
  totalPaybackAmount: decimal("total_payback_amount", { precision: 10, scale: 2 }).notNull(),
  applicationDate: timestamp("application_date").defaultNow(),
  creditScore: integer("credit_score"),
  status: text("status", { enum: ["pending_application", "approved", "active", "rejected", "completed", "defaulted", "cancelled"] }).notNull().default("pending_application"),
  approvalDate: timestamp("approval_date"),
  approvedBy: text("approved_by"),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
  agreementDocUrl: text("agreement_doc_url"),
  paymentPlanId: integer("payment_plan_id"), // Reference to payment plan created after approval
  affirmApplicationId: text("affirm_application_id"), // For Affirm integration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClientFinancingApplicationSchema = createInsertSchema(clientFinancingApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ClientFinancingApplication = typeof clientFinancingApplications.$inferSelect;
export type InsertClientFinancingApplication = z.infer<typeof insertClientFinancingApplicationSchema>;

// Documentation System Schema
export const documentVersions = pgTable("document_versions", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id"),
  documentType: text("document_type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  updatedBy: integer("updated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  changeDescription: text("change_description"),
  version: text("version")
});

export const insertDocumentVersionSchema = createInsertSchema(documentVersions).omit({
  id: true,
  createdAt: true
});

export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = z.infer<typeof insertDocumentVersionSchema>;

export const documentSections = pgTable("document_sections", {
  id: serial("id").primaryKey(),
  documentType: text("document_type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  updatedBy: integer("updated_by")
});

export const insertDocumentSectionSchema = createInsertSchema(documentSections).omit({
  id: true,
  createdAt: true
});

export type DocumentSection = typeof documentSections.$inferSelect;
export type InsertDocumentSection = z.infer<typeof insertDocumentSectionSchema>;

export const documentationTasks = pgTable("documentation_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  assignedTo: integer("assigned_to"),
  isComplete: boolean("is_complete").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  updatedBy: integer("updated_by"),
  completedAt: timestamp("completed_at"),
  completedBy: integer("completed_by")
});

export const insertDocumentationTaskSchema = createInsertSchema(documentationTasks).omit({
  id: true,
  createdAt: true,
  isComplete: true,
  isDeleted: true,
  completedAt: true,
  completedBy: true
});

export type DocumentationTask = typeof documentationTasks.$inferSelect;
export type InsertDocumentationTask = z.infer<typeof insertDocumentationTaskSchema>;

export const reportDefinitions = pgTable("report_definitions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sourceTable: text("source_table").notNull(),
  targetTable: text("target_table").notNull(),
  metadata: text("metadata"),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  updatedBy: integer("updated_by")
});

export const insertReportDefinitionSchema = createInsertSchema(reportDefinitions).omit({
  id: true,
  createdAt: true
});

export type ReportDefinition = typeof reportDefinitions.$inferSelect;
export type InsertReportDefinition = z.infer<typeof insertReportDefinitionSchema>;

export const commissionStructures = pgTable("commission_structures", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  updatedBy: integer("updated_by")
});

export const insertCommissionStructureSchema = createInsertSchema(commissionStructures).omit({
  id: true,
  createdAt: true,
  isActive: true
});

export type CommissionStructure = typeof commissionStructures.$inferSelect;
export type InsertCommissionStructure = z.infer<typeof insertCommissionStructureSchema>;

export const commissionMilestones = pgTable("commission_milestones", {
  id: serial("id").primaryKey(),
  structureId: integer("structure_id").notNull(),
  name: text("name").notNull(),
  days: integer("days").notNull(),
  amount: text("amount"),
  percentage: text("percentage"),
  recurring: boolean("recurring").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertCommissionMilestoneSchema = createInsertSchema(commissionMilestones).omit({
  id: true,
  createdAt: true
});

export type CommissionMilestone = typeof commissionMilestones.$inferSelect;
export type InsertCommissionMilestone = z.infer<typeof insertCommissionMilestoneSchema>;

// Legal Document Management System Schemas

// Document type enum
export const legalDocumentTypeEnum = pgEnum("legal_document_type", [
  "pleading", "contract", "correspondence", "motion", "brief", 
  "discovery", "evidence", "billing", "client_communication", 
  "internal_memo", "court_order", "retainer_agreement", "other"
]);

// Document status enum
export const legalDocumentStatusEnum = pgEnum("legal_document_status", [
  "draft", "final", "filed", "signed", "archived"
]);

// Confidentiality level enum
export const confidentialityLevelEnum = pgEnum("confidentiality_level", [
  "public", "client_confidential", "attorney_eyes_only", "privileged", "sealed"
]);

// Legal documents
export const legalDocuments = pgTable("legal_documents", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  matterId: integer("matter_id").notNull(),
  clientId: integer("client_id"),  // Optional if document is not client-specific
  title: text("title").notNull(),
  documentType: legalDocumentTypeEnum("document_type").notNull(),
  status: legalDocumentStatusEnum("document_status").notNull().default("draft"),
  confidentialityLevel: confidentialityLevelEnum("confidentiality_level").notNull().default("client_confidential"),
  description: text("description"),
  fileLocation: text("file_location").notNull(), // Path or URL to document
  fileSize: integer("file_size"), // Size in bytes
  fileType: text("file_type"), // MIME type or extension
  versionNumber: text("version_number").default("1.0"),
  authorId: integer("author_id").notNull(), // User who created the document
  lastModifiedById: integer("last_modified_by_id"), // User who last modified the document
  createdAt: timestamp("created_at").defaultNow(),
  lastModifiedAt: timestamp("last_modified_at"),
  signedAt: timestamp("signed_at"),
  signedById: integer("signed_by_id"),
  expirationDate: date("expiration_date"),
  tags: text("tags").array(), // Array of tags for categorization
  metaData: jsonb("metadata"), // Additional metadata (custom fields, etc.)
  batesNumberPrefix: text("bates_number_prefix"), // For litigation documents
  batesNumberStart: integer("bates_number_start"), // Starting Bates number
  batesNumberEnd: integer("bates_number_end"), // Ending Bates number
  isTemplate: boolean("is_template").default(false), // If document is a reusable template
  parentDocumentId: integer("parent_document_id"), // For document versions
  eFilingStatus: text("e_filing_status"), // Status if document has been e-filed
  eFilingId: text("e_filing_id"), // E-filing system ID
  eFilingDate: timestamp("e_filing_date"),
  courtDocumentId: text("court_document_id"), // Court-assigned document ID
});

export const insertLegalDocumentSchema = createInsertSchema(legalDocuments).omit({
  id: true,
  createdAt: true
});

export type LegalDocument = typeof legalDocuments.$inferSelect;
export type InsertLegalDocument = z.infer<typeof insertLegalDocumentSchema>;

// Document versions (for version control)
export const legalDocumentVersions = pgTable("legal_document_versions", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  versionNumber: text("version_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdById: integer("created_by_id").notNull(),
  fileLocation: text("file_location").notNull(),
  fileSize: integer("file_size"),
  changeDescription: text("change_description"),
  metaData: jsonb("metadata")
});

export const insertLegalDocumentVersionSchema = createInsertSchema(legalDocumentVersions).omit({
  id: true,
  createdAt: true
});

export type LegalDocumentVersion = typeof legalDocumentVersions.$inferSelect;
export type InsertLegalDocumentVersion = z.infer<typeof insertLegalDocumentVersionSchema>;

// Document templates
export const legalDocumentTemplates = pgTable("legal_document_templates", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  title: text("title").notNull(),
  description: text("description"),
  documentType: legalDocumentTypeEnum("document_type").notNull(),
  practiceArea: legalPracticeAreaEnum("practice_area").notNull(),
  fileLocation: text("file_location").notNull(),
  variables: jsonb("variables"), // Template variables/placeholders
  createdAt: timestamp("created_at").defaultNow(),
  createdById: integer("created_by_id").notNull(),
  lastModifiedAt: timestamp("last_modified_at"),
  lastModifiedById: integer("last_modified_by_id"),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0)
});

export const insertLegalDocumentTemplateSchema = createInsertSchema(legalDocumentTemplates).omit({
  id: true,
  createdAt: true,
  usageCount: true
});

export type LegalDocumentTemplate = typeof legalDocumentTemplates.$inferSelect;
export type InsertLegalDocumentTemplate = z.infer<typeof insertLegalDocumentTemplateSchema>;

// Legal Calendar and Deadlines System

// Calendar event type enum
export const calendarEventTypeEnum = pgEnum("calendar_event_type", [
  "deadline", "court_date", "meeting", "reminder", "deposition", "hearing", 
  "trial", "filing", "appointment", "task", "statute_of_limitations", "other"
]);

// Deadline calculation rule type enum
export const ruleFrequencyEnum = pgEnum("rule_frequency", [
  "one_time", "daily", "weekly", "bi_weekly", "monthly", "yearly", "custom"
]);

// Calendar event status enum
export const calendarEventStatusEnum = pgEnum("calendar_event_status", [
  "pending", "confirmed", "completed", "cancelled", "rescheduled"
]);

// Calendar events
export const legalCalendarEvents = pgTable("legal_calendar_events", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  title: text("title").notNull(),
  description: text("description"),
  eventType: calendarEventTypeEnum("event_type").notNull(),
  status: calendarEventStatusEnum("status").notNull().default("pending"),
  startDate: date("start_date").notNull(),
  startTime: text("start_time"), // Time in HH:MM:SS format
  endDate: date("end_date"),
  endTime: text("end_time"), // Time in HH:MM:SS format
  allDay: boolean("all_day").default(false),
  location: text("location"),
  isDeadline: boolean("is_deadline").default(false),
  matterId: integer("matter_id"), // Associated legal matter
  clientId: integer("client_id"), // Associated client
  assignedToId: integer("assigned_to_id"), // Assigned attorney or staff
  reminderMinutes: integer("reminder_minutes"), // Minutes before event for reminder
  reminderSent: boolean("reminder_sent").default(false),
  priority: text("priority").default("medium"), // low, medium, high, urgent
  recurrenceRule: text("recurrence_rule"), // iCalendar RFC-5545 format
  parentEventId: integer("parent_event_id"), // For recurring events
  externalCalendarId: text("external_calendar_id"), // For sync with external calendars
  externalCalendarType: text("external_calendar_type"), // google, outlook, etc.
  notes: text("notes"),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  completedAt: timestamp("completed_at"),
  completedById: integer("completed_by_id")
});

export const insertLegalCalendarEventSchema = createInsertSchema(legalCalendarEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true
});

export type LegalCalendarEvent = typeof legalCalendarEvents.$inferSelect;
export type InsertLegalCalendarEvent = z.infer<typeof insertLegalCalendarEventSchema>;

// Court rules (for automatic deadline calculations)
export const courtRules = pgTable("court_rules", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  ruleCode: text("rule_code").notNull(), // e.g., "FRCP_26f"
  ruleName: text("rule_name").notNull(), // e.g., "Rule 26(f) Conference"
  jurisdiction: text("jurisdiction").notNull(), // e.g., "federal", "CA", "NY"
  practiceArea: legalPracticeAreaEnum("practice_area").notNull(),
  courtType: text("court_type"), // e.g., "district", "appellate", "supreme"
  triggerEvent: text("trigger_event").notNull(), // e.g., "case_filed", "complaint_served"
  dueDays: integer("due_days").notNull(), // Days from trigger
  description: text("description"),
  calculationNotes: text("calculation_notes"),
  citations: text("citations"),
  isActive: boolean("is_active").default(true),
  excludeWeekends: boolean("exclude_weekends").default(true),
  excludeHolidays: boolean("exclude_holidays").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertCourtRuleSchema = createInsertSchema(courtRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CourtRule = typeof courtRules.$inferSelect;
export type InsertCourtRule = z.infer<typeof insertCourtRuleSchema>;

// Court holidays (for deadline calculations)
export const courtHolidays = pgTable("court_holidays", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  holidayName: text("holiday_name").notNull(),
  holidayDate: date("holiday_date").notNull(),
  jurisdiction: text("jurisdiction").notNull(), // e.g., "federal", "CA", "NY"
  courtType: text("court_type"), // e.g., "all", "district", "appellate"
  isRecurring: boolean("is_recurring").default(true),
  recurrenceRule: text("recurrence_rule"), // for recurring holidays (e.g., "FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1")
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertCourtHolidaySchema = createInsertSchema(courtHolidays).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CourtHoliday = typeof courtHolidays.$inferSelect;
export type InsertCourtHoliday = z.infer<typeof insertCourtHolidaySchema>;

// Calendar event dependencies (for cascading deadlines)
export const calendarEventDependencies = pgTable("calendar_event_dependencies", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  parentEventId: integer("parent_event_id").notNull(),
  childEventId: integer("child_event_id").notNull(),
  dependencyType: text("dependency_type").notNull(), // "hard" (moves with parent) or "soft" (notification only)
  offsetDays: integer("offset_days"), // Days from parent event
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertCalendarEventDependencySchema = createInsertSchema(calendarEventDependencies).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CalendarEventDependency = typeof calendarEventDependencies.$inferSelect;
export type InsertCalendarEventDependency = z.infer<typeof insertCalendarEventDependencySchema>;

// Legal Client Portal System

// Client portal access status enum
export const clientPortalStatusEnum = pgEnum("client_portal_status", [
  "active", "inactive", "pending", "locked"
]);

// Client portal access level enum
export const clientPortalAccessLevelEnum = pgEnum("client_portal_access_level", [
  "basic", "standard", "full", "custom"
]);

// Client portal accounts
export const clientPortalAccounts = pgTable("client_portal_accounts", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  clientId: integer("client_id").notNull(), // Reference to legal client
  email: text("email").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(), // Hashed password
  status: clientPortalStatusEnum("status").notNull().default("pending"),
  accessLevel: clientPortalAccessLevelEnum("access_level").notNull().default("basic"),
  lastLoginAt: timestamp("last_login_at"),
  loginCount: integer("login_count").default(0),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  activationToken: text("activation_token"),
  activationExpires: timestamp("activation_expires"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertClientPortalAccountSchema = createInsertSchema(clientPortalAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  loginCount: true
});

export type ClientPortalAccount = typeof clientPortalAccounts.$inferSelect;
export type InsertClientPortalAccount = z.infer<typeof insertClientPortalAccountSchema>;

// Client portal access permissions (for custom access)
export const clientPortalPermissions = pgTable("client_portal_permissions", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  clientPortalAccountId: integer("client_portal_account_id").notNull(),
  resourceType: text("resource_type").notNull(), // documents, billing, calendar, messages, etc.
  resourceId: integer("resource_id"), // Specific resource ID if applicable
  canView: boolean("can_view").default(false),
  canEdit: boolean("can_edit").default(false),
  canCreate: boolean("can_create").default(false),
  canDelete: boolean("can_delete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertClientPortalPermissionSchema = createInsertSchema(clientPortalPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type ClientPortalPermission = typeof clientPortalPermissions.$inferSelect;
export type InsertClientPortalPermission = z.infer<typeof insertClientPortalPermissionSchema>;

// Client messages
export const clientMessages = pgTable("client_messages", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  clientId: integer("client_id").notNull(),
  senderId: integer("sender_id").notNull(), // User ID or client portal ID
  receiverId: integer("receiver_id").notNull(), // User ID or client portal ID
  senderType: text("sender_type").notNull(), // "attorney", "staff", "client"
  receiverType: text("receiver_type").notNull(), // "attorney", "staff", "client"
  subject: text("subject").notNull(),
  messageText: text("message_text").notNull(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  attachmentCount: integer("attachment_count").default(0),
  parentMessageId: integer("parent_message_id"), // For threaded messages
  isPrivate: boolean("is_private").default(false), // If true, only specified users can see it
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertClientMessageSchema = createInsertSchema(clientMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  readAt: true,
  isRead: true
});

export type ClientMessage = typeof clientMessages.$inferSelect;
export type InsertClientMessage = z.infer<typeof insertClientMessageSchema>;

// Client message attachments
export const clientMessageAttachments = pgTable("client_message_attachments", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  messageId: integer("message_id").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  filePath: text("file_path").notNull(),
  isAccessible: boolean("is_accessible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertClientMessageAttachmentSchema = createInsertSchema(clientMessageAttachments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type ClientMessageAttachment = typeof clientMessageAttachments.$inferSelect;
export type InsertClientMessageAttachment = z.infer<typeof insertClientMessageAttachmentSchema>;

// Client portal shared documents
export const clientPortalSharedDocuments = pgTable("client_portal_shared_documents", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  documentId: integer("document_id").notNull(), // Reference to legal document
  clientId: integer("client_id").notNull(), // Reference to legal client
  isViewable: boolean("is_viewable").default(true),
  isDownloadable: boolean("is_downloadable").default(true),
  requiresSignature: boolean("requires_signature").default(false),
  isSigned: boolean("is_signed").default(false),
  signedAt: timestamp("signed_at"),
  signedByIp: text("signed_by_ip"),
  signatureMethod: text("signature_method"), // "electronic", "digital_certificate", etc.
  expiresAt: timestamp("expires_at"),
  shareNotes: text("share_notes"),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertClientPortalSharedDocumentSchema = createInsertSchema(clientPortalSharedDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  signedAt: true,
  isSigned: true
});

export type ClientPortalSharedDocument = typeof clientPortalSharedDocuments.$inferSelect;
export type InsertClientPortalSharedDocument = z.infer<typeof insertClientPortalSharedDocumentSchema>;

// Client portal activity logs
export const clientPortalLogs = pgTable("client_portal_logs", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  clientId: integer("client_id").notNull(),
  clientPortalAccountId: integer("client_portal_account_id").notNull(),
  activityType: text("activity_type").notNull(), // login, logout, view_document, etc.
  resourceType: text("resource_type"), // document, invoice, message, etc.
  resourceId: integer("resource_id"), // ID of the resource
  details: jsonb("details"), // Additional details about the activity
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertClientPortalLogSchema = createInsertSchema(clientPortalLogs).omit({
  id: true,
  createdAt: true
});

export type ClientPortalLog = typeof clientPortalLogs.$inferSelect;
export type InsertClientPortalLog = z.infer<typeof insertClientPortalLogSchema>;

// Legal Practice Reporting System

// Report type enum
export const legalReportTypeEnum = pgEnum("legal_report_type", [
  "financial", "time_tracking", "activity", "productivity", "client", 
  "case_status", "billing", "trust_accounting", "custom",
  "trust_account_reconciliation", "accounts_receivable_aging", "realization_rate",
  "conflict_check_log", "matter_profitability", "iolta_compliance", "time_entry_summary",
  "client_ledger", "unbilled_time", "collections_probability", "retainer_utilization",
  "court_deadline_calendar", "expense_recovery", "work_in_progress", "payment_method_trends"
]);

// Report frequency enum
export const legalReportFrequencyEnum = pgEnum("legal_report_frequency", [
  "one_time", "daily", "weekly", "bi_weekly", "monthly", "quarterly", "yearly"
]);

// Report format enum
export const legalReportFormatEnum = pgEnum("legal_report_format", [
  "pdf", "excel", "csv", "html", "json"
]);

// Legal practice report definitions
export const legalReportDefinitions = pgTable("legal_report_definitions", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  name: text("name").notNull(),
  description: text("description"),
  reportType: legalReportTypeEnum("report_type").notNull(),
  parameters: jsonb("parameters").notNull(), // JSON containing report parameters
  sqlQuery: text("sql_query"), // Custom SQL query if applicable
  createdById: integer("created_by_id").notNull(),
  isSystem: boolean("is_system").default(false), // True for built-in reports
  isActive: boolean("is_active").default(true),
  isPublic: boolean("is_public").default(false), // Whether visible to all firm users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertLegalReportDefinitionSchema = createInsertSchema(legalReportDefinitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type LegalReportDefinition = typeof legalReportDefinitions.$inferSelect;
export type InsertLegalReportDefinition = z.infer<typeof insertLegalReportDefinitionSchema>;

// Scheduled legal reports
export const legalScheduledReports = pgTable("legal_scheduled_reports", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  reportDefinitionId: integer("report_definition_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  frequency: legalReportFrequencyEnum("frequency").notNull(),
  format: legalReportFormatEnum("format").notNull().default("pdf"),
  parameters: jsonb("parameters"), // Override report parameters
  scheduledTime: time("scheduled_time"), // Time of day to run
  scheduledDayOfWeek: integer("scheduled_day_of_week"), // 0-6 for weekly reports
  scheduledDayOfMonth: integer("scheduled_day_of_month"), // 1-31 for monthly reports
  nextRunAt: timestamp("next_run_at"),
  lastRunAt: timestamp("last_run_at"),
  recipientEmails: text("recipient_emails").array(),
  isActive: boolean("is_active").default(true),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertLegalScheduledReportSchema = createInsertSchema(legalScheduledReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type LegalScheduledReport = typeof legalScheduledReports.$inferSelect;
export type InsertLegalScheduledReport = z.infer<typeof insertLegalScheduledReportSchema>;

// Generated legal reports
export const legalGeneratedReports = pgTable("legal_generated_reports", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  reportDefinitionId: integer("report_definition_id").notNull(),
  scheduledReportId: integer("scheduled_report_id"), // If generated from a scheduled report
  name: text("name").notNull(),
  format: legalReportFormatEnum("format").notNull(),
  parameters: jsonb("parameters"), // Parameters used for generation
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  startDate: date("start_date"), // Report period start
  endDate: date("end_date"), // Report period end
  generationTime: integer("generation_time"), // Milliseconds to generate
  generatedById: integer("generated_by_id").notNull(),
  isPublic: boolean("is_public").default(false), // Whether visible to all firm users
  createdAt: timestamp("created_at").defaultNow()
});

export const insertLegalGeneratedReportSchema = createInsertSchema(legalGeneratedReports).omit({
  id: true,
  createdAt: true,
  generationTime: true
});

export type LegalGeneratedReport = typeof legalGeneratedReports.$inferSelect;
export type InsertLegalGeneratedReport = z.infer<typeof insertLegalGeneratedReportSchema>;

// Legal report templates
export const legalReportTemplates = pgTable("legal_report_templates", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  name: text("name").notNull(),
  description: text("description"),
  headerHtml: text("header_html"),
  footerHtml: text("footer_html"),
  cssStyles: text("css_styles"),
  logoPath: text("logo_path"),
  isDefault: boolean("is_default").default(false),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertLegalReportTemplateSchema = createInsertSchema(legalReportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type LegalReportTemplate = typeof legalReportTemplates.$inferSelect;
export type InsertLegalReportTemplate = z.infer<typeof insertLegalReportTemplateSchema>;

// Legal dashboard widgets
export const legalDashboardWidgets = pgTable("legal_dashboard_widgets", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(), // Law firm
  reportDefinitionId: integer("report_definition_id"),
  userId: integer("user_id").notNull(), // The user whose dashboard this is
  name: text("name").notNull(),
  type: text("type").notNull(), // chart, metric, list, calendar, etc.
  parameters: jsonb("parameters"), // Widget configuration
  refreshInterval: integer("refresh_interval"), // Seconds between refreshes
  position: integer("position"), // Order on dashboard
  width: integer("width").notNull().default(1), // Widget width (1-4)
  height: integer("height").notNull().default(1), // Widget height (1-4)
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertLegalDashboardWidgetSchema = createInsertSchema(legalDashboardWidgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type LegalDashboardWidget = typeof legalDashboardWidgets.$inferSelect;
export type InsertLegalDashboardWidget = z.infer<typeof insertLegalDashboardWidgetSchema>;

// Portal sessions table
export const legalPortalSessions = pgTable("legal_portal_sessions", {
  id: serial("id").primaryKey(),
  portalUserId: integer("portal_user_id").notNull(),
  clientId: integer("client_id").notNull(),
  merchantId: integer("merchant_id").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  invalidatedAt: timestamp("invalidated_at")
});

export const insertLegalPortalSessionSchema = createInsertSchema(legalPortalSessions).omit({
  id: true,
  createdAt: true
});

export type LegalPortalSession = typeof legalPortalSessions.$inferSelect;
export type InsertLegalPortalSession = z.infer<typeof insertLegalPortalSessionSchema>;

// Portal activity log table
export const legalPortalActivities = pgTable("legal_portal_activities", {
  id: serial("id").primaryKey(),
  portalUserId: integer("portal_user_id"),
  clientId: integer("client_id").notNull(),
  merchantId: integer("merchant_id").notNull(),
  activityType: text("activity_type", { enum: [
    "login_success", "login_failed", "logout", "password_reset_requested", 
    "password_reset_completed", "document_viewed", "document_downloaded", 
    "invoice_viewed", "invoice_downloaded", "matter_viewed", "payment_made", 
    "account_created", "account_updated", "document_shared", "message_sent", "message_read"
  ] }).notNull(),
  description: text("description").notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow()
});

export const insertLegalPortalActivitySchema = createInsertSchema(legalPortalActivities).omit({
  id: true,
  timestamp: true
});

export type LegalPortalActivity = typeof legalPortalActivities.$inferSelect;
export type InsertLegalPortalActivity = z.infer<typeof insertLegalPortalActivitySchema>;

// Shared documents table for client portal
export const legalPortalSharedDocuments = pgTable("legal_portal_shared_documents", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  clientId: integer("client_id").notNull(),
  merchantId: integer("merchant_id").notNull(),
  matterId: integer("matter_id"),
  sharedById: integer("shared_by_id").notNull(),
  sharedAt: timestamp("shared_at").notNull(),
  note: text("note"),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  viewedAt: timestamp("viewed_at")
});

export const insertLegalPortalSharedDocumentSchema = createInsertSchema(legalPortalSharedDocuments).omit({
  id: true,
  sharedAt: true,
  viewedAt: true
});

export type LegalPortalSharedDocument = typeof legalPortalSharedDocuments.$inferSelect;
export type InsertLegalPortalSharedDocument = z.infer<typeof insertLegalPortalSharedDocumentSchema>;

// Client-portal messages
export const legalPortalMessages = pgTable("legal_portal_messages", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  clientId: integer("client_id").notNull(),
  matterId: integer("matter_id"),
  senderId: integer("sender_id").notNull(),
  senderType: text("sender_type", { enum: ["firm", "client"] }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  attachmentIds: integer("attachment_ids").array(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertLegalPortalMessageSchema = createInsertSchema(legalPortalMessages).omit({
  id: true,
  isRead: true,
  readAt: true,
  createdAt: true
});

export type LegalPortalMessage = typeof legalPortalMessages.$inferSelect;
export type InsertLegalPortalMessage = z.infer<typeof insertLegalPortalMessageSchema>;

// Type declarations for Express request interface
declare global {
  namespace Express {
    interface Request {
      portalUser?: LegalPortalUser;
      portalSession?: LegalPortalSession;
    }
  }
}