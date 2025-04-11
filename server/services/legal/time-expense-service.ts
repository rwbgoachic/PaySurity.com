import { db } from "../../db";
import { 
  legalTimeEntries, 
  legalExpenseEntries,
  legalInvoices,
  InsertLegalTimeEntry,
  InsertLegalExpenseEntry,
  InsertLegalInvoice
} from "@shared/schema";
import { eq, and, desc, between, sql } from "drizzle-orm";
import { Decimal } from "decimal.js";

/**
 * Legal Time and Expense Tracking Service
 * 
 * Provides functionality for tracking and managing billable time entries,
 * expenses, and invoicing for legal professionals.
 */
export class LegalTimeExpenseService {
  
  /**
   * Creates a new time entry
   */
  async createTimeEntry(data: InsertLegalTimeEntry) {
    // Calculate the total amount if billing rate is provided
    let totalAmount = null;
    if (data.billingRate && data.duration) {
      totalAmount = new Decimal(data.billingRate).times(data.duration).toString();
    }
    
    const [entry] = await db.insert(legalTimeEntries).values({
      ...data,
      totalAmount
    }).returning();
    
    return entry;
  }
  
  /**
   * Gets a time entry by ID
   */
  async getTimeEntry(id: number) {
    const [entry] = await db.select().from(legalTimeEntries).where(eq(legalTimeEntries.id, id));
    return entry;
  }
  
  /**
   * Gets time entries for a merchant
   */
  async getTimeEntriesByMerchant(merchantId: number, options: {
    clientId?: number,
    matterNumber?: string,
    startDate?: Date,
    endDate?: Date,
    unbilledOnly?: boolean
  } = {}) {
    let query = db.select().from(legalTimeEntries)
      .where(eq(legalTimeEntries.merchantId, merchantId));
    
    if (options.clientId) {
      query = query.where(eq(legalTimeEntries.clientId, options.clientId));
    }
    
    if (options.matterNumber) {
      query = query.where(eq(legalTimeEntries.matterNumber, options.matterNumber));
    }
    
    if (options.startDate && options.endDate) {
      query = query.where(
        between(legalTimeEntries.dateOfWork, options.startDate, options.endDate)
      );
    } else if (options.startDate) {
      query = query.where(legalTimeEntries.dateOfWork >= options.startDate);
    } else if (options.endDate) {
      query = query.where(legalTimeEntries.dateOfWork <= options.endDate);
    }
    
    if (options.unbilledOnly) {
      query = query.where(eq(legalTimeEntries.invoiced, false));
    }
    
    return await query.orderBy(desc(legalTimeEntries.dateOfWork));
  }
  
  /**
   * Updates a time entry
   */
  async updateTimeEntry(id: number, data: Partial<InsertLegalTimeEntry>) {
    // Calculate total amount if billing rate or duration is updated
    let updates: any = { ...data, updatedAt: new Date() };
    
    if (data.billingRate || data.duration) {
      // Get the current entry to use existing values if not provided
      const [currentEntry] = await db.select().from(legalTimeEntries).where(eq(legalTimeEntries.id, id));
      if (!currentEntry) {
        throw new Error("Time entry not found");
      }
      
      const billingRate = data.billingRate || currentEntry.billingRate;
      const duration = data.duration || currentEntry.duration;
      
      if (billingRate && duration) {
        updates.totalAmount = new Decimal(billingRate).times(duration).toString();
      }
    }
    
    const [updatedEntry] = await db.update(legalTimeEntries)
      .set(updates)
      .where(eq(legalTimeEntries.id, id))
      .returning();
      
    return updatedEntry;
  }
  
  /**
   * Deletes a time entry (soft delete)
   */
  async deleteTimeEntry(id: number) {
    const [deletedEntry] = await db.update(legalTimeEntries)
      .set({ status: "deleted", updatedAt: new Date() })
      .where(eq(legalTimeEntries.id, id))
      .returning();
      
    return deletedEntry;
  }
  
  /**
   * Creates a new expense entry
   */
  async createExpenseEntry(data: InsertLegalExpenseEntry) {
    // Calculate the total billable amount if markup is provided
    let totalBillableAmount = null;
    if (data.amount) {
      const amount = new Decimal(data.amount);
      if (data.markupPercentage) {
        const markup = amount.times(new Decimal(data.markupPercentage).dividedBy(100));
        totalBillableAmount = amount.plus(markup).toString();
      } else {
        totalBillableAmount = amount.toString();
      }
    }
    
    const [entry] = await db.insert(legalExpenseEntries).values({
      ...data,
      totalBillableAmount
    }).returning();
    
    return entry;
  }
  
  /**
   * Gets an expense entry by ID
   */
  async getExpenseEntry(id: number) {
    const [entry] = await db.select().from(legalExpenseEntries).where(eq(legalExpenseEntries.id, id));
    return entry;
  }
  
  /**
   * Gets expense entries for a merchant
   */
  async getExpenseEntriesByMerchant(merchantId: number, options: {
    clientId?: number,
    matterNumber?: string,
    startDate?: Date,
    endDate?: Date,
    unbilledOnly?: boolean
  } = {}) {
    let query = db.select().from(legalExpenseEntries)
      .where(eq(legalExpenseEntries.merchantId, merchantId));
    
    if (options.clientId) {
      query = query.where(eq(legalExpenseEntries.clientId, options.clientId));
    }
    
    if (options.matterNumber) {
      query = query.where(eq(legalExpenseEntries.matterNumber, options.matterNumber));
    }
    
    if (options.startDate && options.endDate) {
      query = query.where(
        between(legalExpenseEntries.expenseDate, options.startDate, options.endDate)
      );
    } else if (options.startDate) {
      query = query.where(legalExpenseEntries.expenseDate >= options.startDate);
    } else if (options.endDate) {
      query = query.where(legalExpenseEntries.expenseDate <= options.endDate);
    }
    
    if (options.unbilledOnly) {
      query = query.where(eq(legalExpenseEntries.invoiced, false));
    }
    
    return await query.orderBy(desc(legalExpenseEntries.expenseDate));
  }
  
  /**
   * Updates an expense entry
   */
  async updateExpenseEntry(id: number, data: Partial<InsertLegalExpenseEntry>) {
    // Calculate total billable amount if amount or markup is updated
    let updates: any = { ...data, updatedAt: new Date() };
    
    if (data.amount || data.markupPercentage) {
      // Get the current entry to use existing values if not provided
      const [currentEntry] = await db.select().from(legalExpenseEntries).where(eq(legalExpenseEntries.id, id));
      if (!currentEntry) {
        throw new Error("Expense entry not found");
      }
      
      const amount = data.amount || currentEntry.amount;
      const markupPercentage = data.markupPercentage || currentEntry.markupPercentage || "0.00";
      
      const decimalAmount = new Decimal(amount);
      const markup = decimalAmount.times(new Decimal(markupPercentage).dividedBy(100));
      updates.totalBillableAmount = decimalAmount.plus(markup).toString();
    }
    
    const [updatedEntry] = await db.update(legalExpenseEntries)
      .set(updates)
      .where(eq(legalExpenseEntries.id, id))
      .returning();
      
    return updatedEntry;
  }
  
  /**
   * Deletes an expense entry (soft delete)
   */
  async deleteExpenseEntry(id: number) {
    const [deletedEntry] = await db.update(legalExpenseEntries)
      .set({ status: "deleted", updatedAt: new Date() })
      .where(eq(legalExpenseEntries.id, id))
      .returning();
      
    return deletedEntry;
  }
  
  /**
   * Gets a summary of billable time and expenses for a matter
   */
  async getBillableSummary(merchantId: number, options: {
    clientId?: number,
    matterNumber?: string,
    startDate?: Date,
    endDate?: Date
  } = {}) {
    let timeQuery = db.select({
      totalHours: sql<string>`SUM(${legalTimeEntries.duration})`,
      totalAmount: sql<string>`SUM(${legalTimeEntries.totalAmount})`
    }).from(legalTimeEntries)
      .where(and(
        eq(legalTimeEntries.merchantId, merchantId),
        eq(legalTimeEntries.entryType, "billable"),
        eq(legalTimeEntries.status, "active"),
        eq(legalTimeEntries.invoiced, false)
      ));
    
    let expenseQuery = db.select({
      totalExpenses: sql<string>`SUM(${legalExpenseEntries.totalBillableAmount})`
    }).from(legalExpenseEntries)
      .where(and(
        eq(legalExpenseEntries.merchantId, merchantId),
        eq(legalExpenseEntries.billable, true),
        eq(legalExpenseEntries.status, "active"),
        eq(legalExpenseEntries.invoiced, false)
      ));
    
    // Apply filters
    if (options.clientId) {
      timeQuery = timeQuery.where(eq(legalTimeEntries.clientId, options.clientId));
      expenseQuery = expenseQuery.where(eq(legalExpenseEntries.clientId, options.clientId));
    }
    
    if (options.matterNumber) {
      timeQuery = timeQuery.where(eq(legalTimeEntries.matterNumber, options.matterNumber));
      expenseQuery = expenseQuery.where(eq(legalExpenseEntries.matterNumber, options.matterNumber));
    }
    
    if (options.startDate && options.endDate) {
      timeQuery = timeQuery.where(
        between(legalTimeEntries.dateOfWork, options.startDate, options.endDate)
      );
      expenseQuery = expenseQuery.where(
        between(legalExpenseEntries.expenseDate, options.startDate, options.endDate)
      );
    } else if (options.startDate) {
      timeQuery = timeQuery.where(legalTimeEntries.dateOfWork >= options.startDate);
      expenseQuery = expenseQuery.where(legalExpenseEntries.expenseDate >= options.startDate);
    } else if (options.endDate) {
      timeQuery = timeQuery.where(legalTimeEntries.dateOfWork <= options.endDate);
      expenseQuery = expenseQuery.where(legalExpenseEntries.expenseDate <= options.endDate);
    }
    
    // Execute queries
    const [timeResult] = await timeQuery;
    const [expenseResult] = await expenseQuery;
    
    // Calculate totals
    const totalHours = timeResult.totalHours || "0";
    const totalTimeAmount = timeResult.totalAmount || "0";
    const totalExpenseAmount = expenseResult.totalExpenses || "0";
    const totalBillable = new Decimal(totalTimeAmount).plus(totalExpenseAmount).toString();
    
    return {
      totalHours,
      totalTimeAmount,
      totalExpenseAmount,
      totalBillable,
      filters: options,
      generatedAt: new Date()
    };
  }
  
  /**
   * Creates an invoice from unbilled time and expense entries
   */
  async createInvoiceFromEntries(data: InsertLegalInvoice, options: {
    timeEntryIds?: number[],
    expenseEntryIds?: number[],
    autoCalculateSubtotal?: boolean
  } = {}) {
    return await db.transaction(async (tx) => {
      let subtotal = new Decimal(data.subtotal || "0");
      
      // If timeEntryIds are provided, include them in the invoice
      if (options.timeEntryIds && options.timeEntryIds.length > 0) {
        // Get the time entries
        const timeEntries = await tx.select().from(legalTimeEntries)
          .where(and(
            eq(legalTimeEntries.merchantId, data.merchantId),
            eq(legalTimeEntries.status, "active"),
            eq(legalTimeEntries.invoiced, false),
            sql`${legalTimeEntries.id} = ANY(${options.timeEntryIds})`
          ));
        
        // Calculate the subtotal from time entries if auto-calculate is enabled
        if (options.autoCalculateSubtotal) {
          for (const entry of timeEntries) {
            if (entry.totalAmount) {
              subtotal = subtotal.plus(entry.totalAmount);
            }
          }
        }
        
        // Mark time entries as invoiced
        if (timeEntries.length > 0) {
          await tx.update(legalTimeEntries)
            .set({ invoiced: true, invoiceId: null, updatedAt: new Date() })
            .where(sql`${legalTimeEntries.id} = ANY(${options.timeEntryIds})`);
        }
      }
      
      // If expenseEntryIds are provided, include them in the invoice
      if (options.expenseEntryIds && options.expenseEntryIds.length > 0) {
        // Get the expense entries
        const expenseEntries = await tx.select().from(legalExpenseEntries)
          .where(and(
            eq(legalExpenseEntries.merchantId, data.merchantId),
            eq(legalExpenseEntries.status, "active"),
            eq(legalExpenseEntries.invoiced, false),
            sql`${legalExpenseEntries.id} = ANY(${options.expenseEntryIds})`
          ));
        
        // Calculate the subtotal from expense entries if auto-calculate is enabled
        if (options.autoCalculateSubtotal) {
          for (const entry of expenseEntries) {
            if (entry.totalBillableAmount) {
              subtotal = subtotal.plus(entry.totalBillableAmount);
            }
          }
        }
        
        // Mark expense entries as invoiced
        if (expenseEntries.length > 0) {
          await tx.update(legalExpenseEntries)
            .set({ invoiced: true, invoiceId: null, updatedAt: new Date() })
            .where(sql`${legalExpenseEntries.id} = ANY(${options.expenseEntryIds})`);
        }
      }
      
      // Calculate final invoice amounts
      const invoiceData = { ...data };
      
      if (options.autoCalculateSubtotal) {
        invoiceData.subtotal = subtotal.toString();
        
        // Calculate tax if rate is provided
        let taxAmount = new Decimal(0);
        if (data.taxRate && parseFloat(data.taxRate) > 0) {
          taxAmount = subtotal.times(new Decimal(data.taxRate).dividedBy(100));
          invoiceData.taxAmount = taxAmount.toString();
        }
        
        // Calculate discount if rate is provided
        let discountAmount = new Decimal(0);
        if (data.discountRate && parseFloat(data.discountRate) > 0) {
          discountAmount = subtotal.times(new Decimal(data.discountRate).dividedBy(100));
          invoiceData.discountAmount = discountAmount.toString();
        }
        
        // Calculate total amount
        const totalAmount = subtotal.plus(taxAmount).minus(discountAmount);
        invoiceData.totalAmount = totalAmount.toString();
        
        // Set balance due (initially equals total amount)
        invoiceData.balanceDue = totalAmount.toString();
      }
      
      // Insert the invoice
      const [invoice] = await tx.insert(legalInvoices).values(invoiceData).returning();
      
      // Update the time and expense entries with the invoice ID
      if (options.timeEntryIds && options.timeEntryIds.length > 0) {
        await tx.update(legalTimeEntries)
          .set({ invoiceId: invoice.id })
          .where(sql`${legalTimeEntries.id} = ANY(${options.timeEntryIds})`);
      }
      
      if (options.expenseEntryIds && options.expenseEntryIds.length > 0) {
        await tx.update(legalExpenseEntries)
          .set({ invoiceId: invoice.id })
          .where(sql`${legalExpenseEntries.id} = ANY(${options.expenseEntryIds})`);
      }
      
      return invoice;
    });
  }
  
  /**
   * Gets all time and expense entries for an invoice
   */
  async getInvoiceEntries(invoiceId: number) {
    const timeEntries = await db.select().from(legalTimeEntries)
      .where(eq(legalTimeEntries.invoiceId, invoiceId))
      .orderBy(legalTimeEntries.dateOfWork);
      
    const expenseEntries = await db.select().from(legalExpenseEntries)
      .where(eq(legalExpenseEntries.invoiceId, invoiceId))
      .orderBy(legalExpenseEntries.expenseDate);
      
    return {
      timeEntries,
      expenseEntries
    };
  }
}

export const legalTimeExpenseService = new LegalTimeExpenseService();