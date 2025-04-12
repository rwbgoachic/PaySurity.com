/**
 * Legal Practice Management System Schema
 * This file contains database schema definitions for the legal practice management system
 * including IOLTA trust accounting, client management, and matter tracking.
 */

import { pgTable, text, serial, integer, boolean, numeric, timestamp, pgEnum, date, jsonb, varchar, decimal, time, primaryKey, foreignKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// IOLTA trust account status enum
export const ioltaAccountStatusEnum = pgEnum("iolta_account_status", ["active", "inactive", "closed"]);

// IOLTA transaction type enum
export const ioltaTransactionTypeEnum = pgEnum("iolta_transaction_type", ["deposit", "withdrawal", "transfer", "interest", "fee"]);

// IOLTA fund type enum
export const ioltaFundTypeEnum = pgEnum("iolta_fund_type", ["retainer", "settlement", "trust", "operating", "other"]);

// IOLTA transaction status enum
export const ioltaTransactionStatusEnum = pgEnum("iolta_transaction_status", ["pending", "completed", "voided", "rejected"]);

// Legal client type enum
export const legalClientTypeEnum = pgEnum("legal_client_type", ["individual", "organization", "government"]);

// Legal matter status enum
export const legalMatterStatusEnum = pgEnum("legal_matter_status", ["active", "inactive", "closed", "pending"]);

// Legal practice area enum
export const legalPracticeAreaEnum = pgEnum("legal_practice_area", [
  "corporate",
  "litigation",
  "real_estate",
  "intellectual_property",
  "employment",
  "family",
  "criminal",
  "immigration",
  "bankruptcy",
  "tax",
  "estate_planning",
  "personal_injury",
  "medical_malpractice",
  "other"
]);

// Legal clients schema
export const legalClients = pgTable("legal_clients", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  status: text("status", { enum: ["active", "inactive", "former"] }).notNull().default("active"),
  clientType: text("client_type", { enum: ["individual", "organization", "government"] }).notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  companyName: text("company_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").default("USA"),
  taxId: text("tax_id"),
  notes: text("notes"),
  portalAccess: boolean("portal_access").default(false),
  portalUserId: integer("portal_user_id"),
  retainer_agreement_signed: boolean("retainer_agreement_signed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLegalClientSchema = createInsertSchema(legalClients);

export type LegalClient = typeof legalClients.$inferSelect;
export type InsertLegalClient = typeof legalClients.$inferInsert;

// Legal matters schema
export const legalMatters = pgTable("legal_matters", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  clientId: integer("client_id").notNull().references(() => legalClients.id),
  status: text("status", { enum: ["active", "inactive", "closed", "pending"] }).notNull().default("active"),
  title: text("title").notNull(),
  description: text("description"),
  practiceArea: text("practice_area", { enum: [
    "corporate",
    "litigation",
    "real_estate",
    "intellectual_property",
    "employment",
    "family",
    "criminal",
    "immigration",
    "bankruptcy",
    "tax",
    "estate_planning",
    "personal_injury",
    "medical_malpractice",
    "other"
  ] }).notNull(),
  openDate: date("open_date").notNull().default(sql`CURRENT_DATE`),
  closeDate: date("close_date"),
  responsibleAttorneyId: integer("responsible_attorney_id"),
  rateType: text("rate_type", { enum: ["hourly", "flat", "contingency", "mixed"] }),
  rateAmount: numeric("rate_amount"),
  estimatedHours: numeric("estimated_hours"),
  conflictChecked: boolean("conflict_checked").default(false),
  conflictNotes: text("conflict_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLegalMatterSchema = createInsertSchema(legalMatters).omit({ createdAt: true, updatedAt: true });

export type LegalMatter = typeof legalMatters.$inferSelect;
export type InsertLegalMatter = typeof legalMatters.$inferInsert;

// IOLTA trust accounts schema
export const ioltaTrustAccounts = pgTable("iolta_trust_accounts", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  clientId: integer("client_id").notNull().references(() => legalClients.id),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  bankName: text("bank_name").notNull(),
  routingNumber: text("routing_number").notNull(),
  accountType: text("account_type").notNull().default("iolta"),
  status: text("status", { enum: ["active", "inactive", "closed"] }).notNull().default("active"),
  balance: numeric("balance").notNull().default("0"),
  lastReconciliationDate: date("last_reconciliation_date"),
  interestRate: numeric("interest_rate"),
  interestAccrued: numeric("interest_accrued").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIoltaTrustAccountSchema = createInsertSchema(ioltaTrustAccounts).omit({ createdAt: true, updatedAt: true });

export type IoltaTrustAccount = typeof ioltaTrustAccounts.$inferSelect;
export type InsertIoltaTrustAccount = typeof ioltaTrustAccounts.$inferInsert;

// IOLTA client ledgers schema
export const ioltaClientLedgers = pgTable("iolta_client_ledgers", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  trustAccountId: integer("trust_account_id").notNull().references(() => ioltaTrustAccounts.id),
  clientId: text("client_id").notNull(), // Usually a string identifier for the client
  clientName: text("client_name").notNull(),
  matterName: text("matter_name"),
  matterNumber: text("matter_number"),
  balance: numeric("balance").notNull().default("0"),
  status: text("status", { enum: ["active", "inactive", "closed"] }).notNull().default("active"),
  lastTransactionDate: timestamp("last_transaction_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIoltaClientLedgerSchema = createInsertSchema(ioltaClientLedgers).omit({ createdAt: true, updatedAt: true });

export type IoltaClientLedger = typeof ioltaClientLedgers.$inferSelect;
export type InsertIoltaClientLedger = typeof ioltaClientLedgers.$inferInsert;

// IOLTA transactions schema
export const ioltaTransactions = pgTable("iolta_transactions", {
  id: serial("id").primaryKey(),
  trustAccountId: integer("trust_account_id").notNull().references(() => ioltaTrustAccounts.id),
  clientLedgerId: integer("client_ledger_id").references(() => ioltaClientLedgers.id),
  transactionDate: timestamp("transaction_date").defaultNow(),
  amount: numeric("amount").notNull(),
  description: text("description").notNull(),
  transactionType: text("transaction_type", { enum: ["deposit", "withdrawal", "transfer", "interest", "fee"] }).notNull(),
  fundType: text("fund_type", { enum: ["retainer", "settlement", "trust", "operating", "other"] }).notNull(),
  checkNumber: text("check_number"),
  referenceNumber: text("reference_number"),
  payee: text("payee"),
  payor: text("payor"),
  status: text("status", { enum: ["pending", "completed", "voided", "rejected"] }).notNull().default("completed"),
  createdBy: integer("created_by").notNull(),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  voidedBy: integer("voided_by"),
  voidedAt: timestamp("voided_at"),
  voidReason: text("void_reason"),
  documentUrl: text("document_url"), // URL to related document (receipt, etc.)
  payment_method_id: integer("payment_method_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIoltaTransactionSchema = createInsertSchema(ioltaTransactions).omit({ createdAt: true, updatedAt: true });

export type IoltaTransaction = typeof ioltaTransactions.$inferSelect;
export type InsertIoltaTransaction = typeof ioltaTransactions.$inferInsert;

// IOLTA reconciliations schema
export const ioltaReconciliations = pgTable("iolta_reconciliations", {
  id: serial("id").primaryKey(),
  trustAccountId: integer("trust_account_id").notNull().references(() => ioltaTrustAccounts.id),
  reconciliationDate: date("reconciliation_date").notNull(),
  bankStatement: jsonb("bank_statement"), // JSON with statement details
  bankBalance: numeric("bank_balance").notNull(),
  bookBalance: numeric("book_balance").notNull(),
  difference: numeric("difference").notNull(),
  isBalanced: boolean("is_balanced").notNull(),
  notes: text("notes"),
  reconcilerId: integer("reconciler_id").notNull(),
  reviewerId: integer("reviewer_id"),
  reviewedAt: timestamp("reviewed_at"),
  status: text("status", { enum: ["draft", "completed", "reviewed", "disputed"] }).notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIoltaReconciliationSchema = createInsertSchema(ioltaReconciliations).omit({ createdAt: true, updatedAt: true });

export type IoltaReconciliation = typeof ioltaReconciliations.$inferSelect;
export type InsertIoltaReconciliation = typeof ioltaReconciliations.$inferInsert;

// IOLTA bank statements schema
export const ioltaBankStatements = pgTable("iolta_bank_statements", {
  id: serial("id").primaryKey(),
  trustAccountId: integer("trust_account_id").notNull().references(() => ioltaTrustAccounts.id),
  statementDate: date("statement_date").notNull(),
  beginningBalance: numeric("beginning_balance").notNull(),
  endingBalance: numeric("ending_balance").notNull(),
  deposits: numeric("deposits").notNull().default("0"),
  withdrawals: numeric("withdrawals").notNull().default("0"),
  fees: numeric("fees").notNull().default("0"),
  interest: numeric("interest").notNull().default("0"),
  uploadedBy: integer("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  fileUrl: text("file_url"), // URL to uploaded statement file
  isImported: boolean("is_imported").default(false),
  importedAt: timestamp("imported_at"),
  importNotes: text("import_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIoltaBankStatementSchema = createInsertSchema(ioltaBankStatements).omit({ createdAt: true, updatedAt: true });

export type IoltaBankStatement = typeof ioltaBankStatements.$inferSelect;
export type InsertIoltaBankStatement = typeof ioltaBankStatements.$inferInsert;

// Legal time entries schema
export const legalTimeEntries = pgTable("legal_time_entries", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  matterId: integer("matter_id").notNull().references(() => legalMatters.id),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  timeSpent: numeric("time_spent").notNull(), // In hours
  isBillable: boolean("is_billable").notNull().default(true),
  billableAmount: numeric("billable_amount"),
  billingCode: text("billing_code"),
  status: text("status", { enum: ["draft", "pending", "approved", "billed", "rejected"] }).notNull().default("draft"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  invoiceId: integer("invoice_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLegalTimeEntrySchema = createInsertSchema(legalTimeEntries).omit({ createdAt: true, updatedAt: true });

export type LegalTimeEntry = typeof legalTimeEntries.$inferSelect;
export type InsertLegalTimeEntry = typeof legalTimeEntries.$inferInsert;

// Legal expense entries schema
export const legalExpenseEntries = pgTable("legal_expense_entries", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  matterId: integer("matter_id").notNull().references(() => legalMatters.id),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  isBillable: boolean("is_billable").notNull().default(true),
  markup: numeric("markup").default("0"), // Percentage markup
  billableAmount: numeric("billable_amount"),
  expenseCategory: text("expense_category").notNull(),
  status: text("status", { enum: ["draft", "pending", "approved", "billed", "rejected"] }).notNull().default("draft"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  invoiceId: integer("invoice_id"),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLegalExpenseEntrySchema = createInsertSchema(legalExpenseEntries).omit({ createdAt: true, updatedAt: true });

export type LegalExpenseEntry = typeof legalExpenseEntries.$inferSelect;
export type InsertLegalExpenseEntry = typeof legalExpenseEntries.$inferInsert;

// Legal invoices schema
export const legalInvoices = pgTable("legal_invoices", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  clientId: integer("client_id").notNull().references(() => legalClients.id),
  matterId: integer("matter_id").notNull().references(() => legalMatters.id),
  invoiceNumber: text("invoice_number").notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  amount: numeric("amount").notNull(),
  balance: numeric("balance").notNull(),
  status: text("status", { enum: ["draft", "sent", "paid", "partial", "overdue", "void"] }).notNull().default("draft"),
  timeEntryIds: integer("time_entry_ids").array(),
  expenseEntryIds: integer("expense_entry_ids").array(),
  notes: text("notes"),
  terms: text("terms"),
  sentAt: timestamp("sent_at"),
  sentBy: integer("sent_by"),
  reminders: integer("reminders").default(0),
  lastReminderAt: timestamp("last_reminder_at"),
  paidAmount: numeric("paid_amount").default("0"),
  paidAt: timestamp("paid_at"),
  paymentMethod: text("payment_method"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLegalInvoiceSchema = createInsertSchema(legalInvoices).omit({ createdAt: true, updatedAt: true });

export type LegalInvoice = typeof legalInvoices.$inferSelect;
export type InsertLegalInvoice = typeof legalInvoices.$inferInsert;

// Legal portal users schema (for client portal access)
export const legalPortalUsers = pgTable("legal_portal_users", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => legalClients.id),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").default("USA"),
  isEnabled: boolean("is_enabled").default(true),
  lastLogin: timestamp("last_login"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  termsAccepted: boolean("terms_accepted").default(false),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLegalPortalUserSchema = createInsertSchema(legalPortalUsers);

export type LegalPortalUser = typeof legalPortalUsers.$inferSelect;
export type InsertLegalPortalUser = typeof legalPortalUsers.$inferInsert;

// Legal portal sessions schema
export const legalPortalSessions = pgTable("legal_portal_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => legalPortalUsers.id),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  isRevoked: boolean("is_revoked").default(false),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLegalPortalSessionSchema = createInsertSchema(legalPortalSessions).omit({ createdAt: true });

export type LegalPortalSession = typeof legalPortalSessions.$inferSelect;
export type InsertLegalPortalSession = typeof legalPortalSessions.$inferInsert;