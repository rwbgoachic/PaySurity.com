import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

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