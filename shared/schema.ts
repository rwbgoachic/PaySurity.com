import { pgTable, text, serial, integer, boolean, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("employee"),
  department: text("department"),
  organizationId: integer("organization_id"),
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
});

// Wallet schema
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  balance: numeric("balance").notNull().default("0"),
  monthlyLimit: numeric("monthly_limit"),
  isMain: boolean("is_main").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  balance: true,
  monthlyLimit: true,
  isMain: true,
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
