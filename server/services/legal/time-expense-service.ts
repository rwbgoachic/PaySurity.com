/**
 * Legal Time and Expense Service
 * 
 * This service provides functionality for tracking billable time entries,
 * expenses, and generating invoices for legal services.
 */

import { db } from "../../db";
import { 
  legalTimeEntries, 
  legalExpenseEntries, 
  legalInvoices,
  legalInvoiceTimeEntries,
  legalInvoiceExpenseEntries,
  insertLegalTimeEntrySchema, 
  insertLegalExpenseEntrySchema,
  insertLegalInvoiceSchema,
  type InsertLegalTimeEntry,
  type InsertLegalExpenseEntry,
  type InsertLegalInvoice,
  type LegalTimeEntry,
  type LegalExpenseEntry,
  type LegalInvoice
} from "@shared/schema";
import { and, eq, between, gte, lte, sql, desc, isNull, not } from "drizzle-orm";
import { Decimal } from "decimal.js";

/**
 * Interface for date range filters
 */
interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

/**
 * Interface for billable summary
 */
interface BillableSummary {
  totalHours: string;
  totalBillableAmount: string;
  totalExpenses: string;
  totalBillable: string;
  timeEntryCount: number;
  expenseEntryCount: number;
  periodStart?: Date;
  periodEnd?: Date;
}

/**
 * Invoice creation options
 */
interface InvoiceCreationOptions {
  timeEntryIds: number[];
  expenseEntryIds: number[];
  autoCalculateSubtotal?: boolean;
}

/**
 * Invoice entries (time and expense)
 */
interface InvoiceEntries {
  invoice: LegalInvoice;
  timeEntries: LegalTimeEntry[];
  expenseEntries: LegalExpenseEntry[];
}

class LegalTimeExpenseService {
  /**
   * Create a new time entry
   */
  async createTimeEntry(data: InsertLegalTimeEntry): Promise<LegalTimeEntry> {
    try {
      const validatedData = insertLegalTimeEntrySchema.parse(data);
      
      // Calculate billable amount - will be stored in totalAmount field
      const billingRate = validatedData.billingRate || new Decimal(0);
      const duration = new Decimal(validatedData.duration);
      const totalAmount = duration.mul(billingRate);
      
      // Insert the time entry
      const [timeEntry] = await db
        .insert(legalTimeEntries)
        .values({
          ...validatedData,
          totalAmount: totalAmount.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return timeEntry;
    } catch (error) {
      console.error("Error creating time entry:", error);
      throw error;
    }
  }
  
  /**
   * Get time entries by merchant ID
   */
  async getTimeEntriesByMerchant(merchantId: number, filter?: DateRangeFilter): Promise<LegalTimeEntry[]> {
    try {
      let query = db
        .select()
        .from(legalTimeEntries)
        .where(eq(legalTimeEntries.merchantId, merchantId));
      
      // Add date filters if provided
      if (filter) {
        if (filter.startDate) {
          query = query.where(gte(legalTimeEntries.dateOfWork, filter.startDate.toISOString().split('T')[0]));
        }
        
        if (filter.endDate) {
          query = query.where(lte(legalTimeEntries.dateOfWork, filter.endDate.toISOString().split('T')[0]));
        }
      }
      
      // Only return active time entries (not deleted)
      query = query.where(eq(legalTimeEntries.status, "active"));
      
      // Order by date descending
      query = query.orderBy(desc(legalTimeEntries.dateOfWork));
      
      return await query;
    } catch (error) {
      console.error("Error retrieving time entries:", error);
      throw error;
    }
  }
  
  /**
   * Get a specific time entry by ID
   */
  async getTimeEntryById(id: number): Promise<LegalTimeEntry | undefined> {
    try {
      const [timeEntry] = await db
        .select()
        .from(legalTimeEntries)
        .where(eq(legalTimeEntries.id, id));
      
      return timeEntry;
    } catch (error) {
      console.error("Error retrieving time entry:", error);
      throw error;
    }
  }
  
  /**
   * Update a time entry
   */
  async updateTimeEntry(id: number, data: Partial<LegalTimeEntry>): Promise<LegalTimeEntry | undefined> {
    try {
      // Get existing time entry
      const [timeEntry] = await db
        .select()
        .from(legalTimeEntries)
        .where(eq(legalTimeEntries.id, id));
      
      if (!timeEntry) {
        return undefined;
      }
      
      // If duration or billing rate is updated, recalculate total amount
      let totalAmount = timeEntry.totalAmount;
      
      if (data.duration || data.billingRate) {
        const duration = new Decimal(data.duration || timeEntry.duration);
        const billingRate = new Decimal(data.billingRate || timeEntry.billingRate || 0);
        totalAmount = duration.mul(billingRate).toString();
      }
      
      // Update the time entry
      const [updatedTimeEntry] = await db
        .update(legalTimeEntries)
        .set({
          ...data,
          totalAmount,
          updatedAt: new Date()
        })
        .where(eq(legalTimeEntries.id, id))
        .returning();
      
      return updatedTimeEntry;
    } catch (error) {
      console.error("Error updating time entry:", error);
      throw error;
    }
  }
  
  /**
   * Delete a time entry (soft delete)
   */
  async deleteTimeEntry(id: number): Promise<LegalTimeEntry | undefined> {
    try {
      // Soft delete by setting status to "deleted"
      const [deletedTimeEntry] = await db
        .update(legalTimeEntries)
        .set({
          status: "deleted",
          updatedAt: new Date()
        })
        .where(eq(legalTimeEntries.id, id))
        .returning();
      
      return deletedTimeEntry;
    } catch (error) {
      console.error("Error deleting time entry:", error);
      throw error;
    }
  }
  
  /**
   * Create a new expense entry
   */
  async createExpenseEntry(data: InsertLegalExpenseEntry): Promise<LegalExpenseEntry> {
    try {
      const validatedData = insertLegalExpenseEntrySchema.parse(data);
      
      // Calculate total billable amount including markup
      const amount = new Decimal(validatedData.amount);
      const markupPercentage = validatedData.markupPercentage 
        ? new Decimal(validatedData.markupPercentage) 
        : new Decimal(0);
      
      const markupMultiplier = markupPercentage.div(100).plus(1);
      const totalBillableAmount = amount.mul(markupMultiplier);
      
      // Insert the expense entry
      const [expenseEntry] = await db
        .insert(legalExpenseEntries)
        .values({
          ...validatedData,
          totalBillableAmount: totalBillableAmount.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return expenseEntry;
    } catch (error) {
      console.error("Error creating expense entry:", error);
      throw error;
    }
  }
  
  /**
   * Get expense entries by merchant ID
   */
  async getExpenseEntriesByMerchant(merchantId: number, filter?: DateRangeFilter): Promise<LegalExpenseEntry[]> {
    try {
      let query = db
        .select()
        .from(legalExpenseEntries)
        .where(eq(legalExpenseEntries.merchantId, merchantId));
      
      // Add date filters if provided
      if (filter) {
        if (filter.startDate) {
          query = query.where(gte(legalExpenseEntries.expenseDate, filter.startDate.toISOString().split('T')[0]));
        }
        
        if (filter.endDate) {
          query = query.where(lte(legalExpenseEntries.expenseDate, filter.endDate.toISOString().split('T')[0]));
        }
      }
      
      // Only return active expense entries (not deleted)
      query = query.where(eq(legalExpenseEntries.status, "active"));
      
      // Order by date descending
      query = query.orderBy(desc(legalExpenseEntries.expenseDate));
      
      return await query;
    } catch (error) {
      console.error("Error retrieving expense entries:", error);
      throw error;
    }
  }
  
  /**
   * Get a specific expense entry by ID
   */
  async getExpenseEntryById(id: number): Promise<LegalExpenseEntry | undefined> {
    try {
      const [expenseEntry] = await db
        .select()
        .from(legalExpenseEntries)
        .where(eq(legalExpenseEntries.id, id));
      
      return expenseEntry;
    } catch (error) {
      console.error("Error retrieving expense entry:", error);
      throw error;
    }
  }
  
  /**
   * Update an expense entry
   */
  async updateExpenseEntry(id: number, data: Partial<LegalExpenseEntry>): Promise<LegalExpenseEntry | undefined> {
    try {
      // Get existing expense entry
      const [expenseEntry] = await db
        .select()
        .from(legalExpenseEntries)
        .where(eq(legalExpenseEntries.id, id));
      
      if (!expenseEntry) {
        return undefined;
      }
      
      // If amount or markup percentage is updated, recalculate total billable amount
      let totalBillableAmount = expenseEntry.totalBillableAmount;
      
      if (data.amount || data.markupPercentage !== undefined) {
        const amount = new Decimal(data.amount || expenseEntry.amount);
        const markupPercentage = data.markupPercentage !== undefined
          ? new Decimal(data.markupPercentage)
          : new Decimal(expenseEntry.markupPercentage || 0);
        
        const markupMultiplier = markupPercentage.div(100).plus(1);
        totalBillableAmount = amount.mul(markupMultiplier).toString();
      }
      
      // Update the expense entry
      const [updatedExpenseEntry] = await db
        .update(legalExpenseEntries)
        .set({
          ...data,
          totalBillableAmount,
          updatedAt: new Date()
        })
        .where(eq(legalExpenseEntries.id, id))
        .returning();
      
      return updatedExpenseEntry;
    } catch (error) {
      console.error("Error updating expense entry:", error);
      throw error;
    }
  }
  
  /**
   * Delete an expense entry (soft delete)
   */
  async deleteExpenseEntry(id: number): Promise<LegalExpenseEntry | undefined> {
    try {
      // Soft delete by setting status to "deleted"
      const [deletedExpenseEntry] = await db
        .update(legalExpenseEntries)
        .set({
          status: "deleted",
          updatedAt: new Date()
        })
        .where(eq(legalExpenseEntries.id, id))
        .returning();
      
      return deletedExpenseEntry;
    } catch (error) {
      console.error("Error deleting expense entry:", error);
      throw error;
    }
  }
  
  /**
   * Get billable summary for a merchant
   */
  async getBillableSummary(merchantId: number, filter?: DateRangeFilter): Promise<BillableSummary> {
    try {
      // Base query conditions
      const baseTimeConditions = [eq(legalTimeEntries.merchantId, merchantId), eq(legalTimeEntries.status, "active")];
      const baseExpenseConditions = [eq(legalExpenseEntries.merchantId, merchantId), eq(legalExpenseEntries.status, "active")];
      
      // Add date filters if provided
      if (filter) {
        if (filter.startDate) {
          baseTimeConditions.push(gte(legalTimeEntries.dateOfWork, filter.startDate.toISOString().split('T')[0]));
          baseExpenseConditions.push(gte(legalExpenseEntries.expenseDate, filter.startDate.toISOString().split('T')[0]));
        }
        
        if (filter.endDate) {
          baseTimeConditions.push(lte(legalTimeEntries.dateOfWork, filter.endDate.toISOString().split('T')[0]));
          baseExpenseConditions.push(lte(legalExpenseEntries.expenseDate, filter.endDate.toISOString().split('T')[0]));
        }
      }
      
      // Get sum of time entry hours and billable amount
      const [timeResult] = await db
        .select({
          totalHours: sql<string>`SUM(${legalTimeEntries.duration})`,
          totalAmount: sql<string>`SUM(${legalTimeEntries.totalAmount})`
        })
        .from(legalTimeEntries)
        .where(and(...baseTimeConditions));
      
      // Get sum of expense entry billable amount
      const [expenseResult] = await db
        .select({
          totalExpenses: sql<string>`SUM(${legalExpenseEntries.totalBillableAmount})`
        })
        .from(legalExpenseEntries)
        .where(and(...baseExpenseConditions));
      
      // Count number of entries
      const [timeCountResult] = await db
        .select({
          count: sql<number>`COUNT(*)`
        })
        .from(legalTimeEntries)
        .where(and(...baseTimeConditions));
      
      const [expenseCountResult] = await db
        .select({
          count: sql<number>`COUNT(*)`
        })
        .from(legalExpenseEntries)
        .where(and(...baseExpenseConditions));
      
      // Calculate total billable amounts
      const totalHours = timeResult.totalHours || "0";
      const totalBillableAmount = timeResult.totalAmount || "0";
      const totalExpenses = expenseResult.totalExpenses || "0";
      
      const totalBillable = new Decimal(totalBillableAmount).plus(new Decimal(totalExpenses)).toString();
      
      return {
        totalHours,
        totalBillableAmount,
        totalExpenses,
        totalBillable,
        timeEntryCount: timeCountResult.count || 0,
        expenseEntryCount: expenseCountResult.count || 0,
        periodStart: filter?.startDate,
        periodEnd: filter?.endDate
      };
    } catch (error) {
      console.error("Error retrieving billable summary:", error);
      throw error;
    }
  }
  
  /**
   * Create an invoice from time and expense entries
   */
  async createInvoiceFromEntries(
    invoiceData: InsertLegalInvoice,
    options: InvoiceCreationOptions
  ): Promise<LegalInvoice> {
    return await db.transaction(async (tx) => {
      try {
        const validatedData = insertLegalInvoiceSchema.parse(invoiceData);
        
        let finalInvoiceData = validatedData;
        
        // Auto-calculate subtotal from time and expense entries if needed
        if (options.autoCalculateSubtotal) {
          let subtotal = new Decimal(0);
          
          // Get time entries
          const timeEntries = await Promise.all(
            options.timeEntryIds.map(async (id) => {
              const [entry] = await tx
                .select()
                .from(legalTimeEntries)
                .where(eq(legalTimeEntries.id, id));
              return entry;
            })
          );
          
          // Get expense entries
          const expenseEntries = await Promise.all(
            options.expenseEntryIds.map(async (id) => {
              const [entry] = await tx
                .select()
                .from(legalExpenseEntries)
                .where(eq(legalExpenseEntries.id, id));
              return entry;
            })
          );
          
          // Calculate subtotal
          timeEntries.forEach((entry) => {
            if (entry && entry.totalAmount) {
              subtotal = subtotal.plus(new Decimal(entry.totalAmount));
            }
          });
          
          expenseEntries.forEach((entry) => {
            if (entry && entry.billable && entry.totalBillableAmount) {
              subtotal = subtotal.plus(new Decimal(entry.totalBillableAmount));
            }
          });
          
          finalInvoiceData = {
            ...validatedData,
            subtotal: subtotal.toString(),
            totalAmount: subtotal.toString(),
            balanceDue: subtotal.toString()
          };
        }
        
        // Create the invoice
        const [invoice] = await tx
          .insert(legalInvoices)
          .values({
            ...finalInvoiceData,
            status: "draft",
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        // Link time entries to the invoice
        if (options.timeEntryIds.length > 0) {
          await tx
            .insert(legalInvoiceTimeEntries)
            .values(
              options.timeEntryIds.map((timeEntryId) => ({
                invoiceId: invoice.id,
                timeEntryId,
                createdAt: new Date()
              }))
            );
          
          // Mark time entries as invoiced
          for (const timeEntryId of options.timeEntryIds) {
            await tx
              .update(legalTimeEntries)
              .set({
                invoiced: true,
                updatedAt: new Date()
              })
              .where(eq(legalTimeEntries.id, timeEntryId));
          }
        }
        
        // Link expense entries to the invoice
        if (options.expenseEntryIds.length > 0) {
          await tx
            .insert(legalInvoiceExpenseEntries)
            .values(
              options.expenseEntryIds.map((expenseEntryId) => ({
                invoiceId: invoice.id,
                expenseEntryId,
                createdAt: new Date()
              }))
            );
          
          // Mark expense entries as invoiced
          for (const expenseEntryId of options.expenseEntryIds) {
            await tx
              .update(legalExpenseEntries)
              .set({
                invoiced: true,
                updatedAt: new Date()
              })
              .where(eq(legalExpenseEntries.id, expenseEntryId));
          }
        }
        
        return invoice;
      } catch (error) {
        console.error("Error creating invoice:", error);
        throw error;
      }
    });
  }
  
  /**
   * Get entries linked to an invoice
   */
  async getInvoiceEntries(invoiceId: number): Promise<InvoiceEntries | undefined> {
    try {
      // Get the invoice
      const [invoice] = await db
        .select()
        .from(legalInvoices)
        .where(eq(legalInvoices.id, invoiceId));
      
      if (!invoice) {
        return undefined;
      }
      
      // Get time entries linked to the invoice
      const timeEntriesJoin = await db
        .select({
          timeEntry: legalTimeEntries
        })
        .from(legalInvoiceTimeEntries)
        .innerJoin(
          legalTimeEntries,
          eq(legalInvoiceTimeEntries.timeEntryId, legalTimeEntries.id)
        )
        .where(eq(legalInvoiceTimeEntries.invoiceId, invoiceId));
      
      // Get expense entries linked to the invoice
      const expenseEntriesJoin = await db
        .select({
          expenseEntry: legalExpenseEntries
        })
        .from(legalInvoiceExpenseEntries)
        .innerJoin(
          legalExpenseEntries,
          eq(legalInvoiceExpenseEntries.expenseEntryId, legalExpenseEntries.id)
        )
        .where(eq(legalInvoiceExpenseEntries.invoiceId, invoiceId));
      
      const timeEntries = timeEntriesJoin.map(row => row.timeEntry);
      const expenseEntries = expenseEntriesJoin.map(row => row.expenseEntry);
      
      return {
        invoice,
        timeEntries,
        expenseEntries
      };
    } catch (error) {
      console.error("Error retrieving invoice entries:", error);
      throw error;
    }
  }
}

export const legalTimeExpenseService = new LegalTimeExpenseService();