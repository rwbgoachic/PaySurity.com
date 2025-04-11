import { pgTable, text, serial, integer, boolean, numeric, timestamp, pgEnum, date, jsonb, varchar, decimal, time } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Portal activity type enum
export const legalPortalActivityTypeEnum = pgEnum("legal_portal_activity_type", [
  "login_success",
  "login_failed",
  "logout",
  "password_reset_requested",
  "password_reset_completed",
  "document_viewed",
  "document_downloaded",
  "invoice_viewed",
  "invoice_downloaded",
  "matter_viewed",
  "payment_made",
  "account_created",
  "account_updated",
  "document_shared",
  "message_sent",
  "message_read"
]);

// Portal user table
export const legalPortalUsers = pgTable("legal_portal_users", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull(),
  clientId: integer("client_id").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  isActive: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  resetToken: varchar("reset_token", { length: 64 }),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  acceptedTermsAt: timestamp("accepted_terms_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertLegalPortalUserSchema = createInsertSchema(legalPortalUsers).omit({
  id: true,
  lastLogin: true,
  failedLoginAttempts: true,
  resetToken: true,
  resetTokenExpiry: true,
  createdAt: true,
  updatedAt: true
});

export type LegalPortalUser = typeof legalPortalUsers.$inferSelect;
export type InsertLegalPortalUser = z.infer<typeof insertLegalPortalUserSchema>;

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