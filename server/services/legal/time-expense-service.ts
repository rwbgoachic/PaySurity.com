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
  legalClients,
  merchants,
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
  
  /**
   * Generate a PDF for an invoice
   * @param invoiceId ID of the invoice to generate PDF for
   * @returns Buffer containing the PDF data
   */
  async generateInvoicePdf(invoiceId: number): Promise<Buffer> {
    try {
      // Get the invoice with all its entries
      const invoiceData = await this.getInvoiceEntries(invoiceId);
      
      if (!invoiceData || !invoiceData.invoice) {
        throw new Error('Invoice not found');
      }
      
      // Get client information
      const [client] = await db.select()
        .from(legalClients)
        .where(eq(legalClients.id, invoiceData.invoice.clientId));
      
      if (!client) {
        throw new Error('Client not found');
      }
      
      // Get merchant information
      const [merchant] = await db.select()
        .from(merchants)
        .where(eq(merchants.id, invoiceData.invoice.merchantId));
      
      // Calculate totals
      const timeTotal = invoiceData.timeEntries.reduce(
        (sum, entry) => sum + (parseFloat(entry.amount) || 0), 
        0
      );
      
      const expenseTotal = invoiceData.expenseEntries.reduce(
        (sum, entry) => sum + (parseFloat(entry.amount) || 0), 
        0
      );
      
      // Create PDF document
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      
      // Setup PDF metadata
      doc.info.Title = `Invoice #${invoiceData.invoice.invoiceNumber}`;
      doc.info.Author = merchant?.businessName || 'Law Firm';
      
      // Add header with logo
      if (merchant?.logoUrl) {
        try {
          // In a real implementation, this might fetch the logo from storage
          // For now, we'll skip the logo placement
          // doc.image(merchant.logoUrl, 50, 45, { width: 150 });
        } catch (error) {
          console.error('Error adding logo to invoice PDF:', error);
        }
      }
      
      // Add merchant details
      doc.fontSize(20).text(merchant?.businessName || 'Law Firm', { align: 'right' });
      doc.fontSize(10)
        .text(merchant?.address || '', { align: 'right' })
        .text(merchant?.city + ', ' + merchant?.state + ' ' + merchant?.zip || '', { align: 'right' })
        .text(merchant?.phone || '', { align: 'right' })
        .text(merchant?.email || '', { align: 'right' })
        .moveDown(2);
      
      // Add invoice details
      doc.fontSize(18).text('Invoice', { align: 'center' }).moveDown(0.5);
      
      doc.fontSize(10)
        .text(`Invoice Number: ${invoiceData.invoice.invoiceNumber}`)
        .text(`Invoice Date: ${new Date(invoiceData.invoice.invoiceDate).toLocaleDateString()}`)
        .text(`Due Date: ${new Date(invoiceData.invoice.dueDate).toLocaleDateString()}`)
        .moveDown(0.5);
      
      // Add client information
      doc.text(`Client: ${client.name}`)
        .text(`Matter: ${invoiceData.invoice.matterTitle || 'N/A'}`)
        .moveDown(1);
      
      // Add time entries table
      if (invoiceData.timeEntries.length > 0) {
        doc.fontSize(12).text('Time Entries', { underline: true }).moveDown(0.5);
        
        // Table headers
        const timeTableTop = doc.y;
        doc.fontSize(10)
          .text('Date', 50, timeTableTop)
          .text('Description', 150, timeTableTop)
          .text('Hours', 350, timeTableTop, { width: 50, align: 'right' })
          .text('Rate', 400, timeTableTop, { width: 50, align: 'right' })
          .text('Amount', 500, timeTableTop, { width: 50, align: 'right' })
          .moveDown(0.5);
        
        // Draw a line
        const lineY = doc.y;
        doc.moveTo(50, lineY).lineTo(550, lineY).stroke().moveDown(0.5);
        
        // Table rows
        let yPos = doc.y;
        invoiceData.timeEntries.forEach(entry => {
          const entryDate = entry.entryDate ? new Date(entry.entryDate).toLocaleDateString() : '';
          doc.text(entryDate, 50, yPos)
            .text(entry.description || '', 150, yPos, { width: 190 })
            .text(entry.duration || '', 350, yPos, { width: 50, align: 'right' })
            .text(entry.billingRate ? `$${entry.billingRate}` : '', 400, yPos, { width: 50, align: 'right' })
            .text(entry.amount ? `$${entry.amount}` : '', 500, yPos, { width: 50, align: 'right' });
          
          // Calculate the height needed for this row and move down accordingly
          const textHeight = Math.max(
            doc.heightOfString(entry.description || '', { width: 190 }),
            doc.heightOfString(entryDate, { width: 90 })
          );
          yPos += textHeight + 5;
          doc.y = yPos;
        });
        
        // Time subtotal
        doc.moveDown(0.5);
        doc.text('Time Subtotal:', 400, doc.y, { width: 100, align: 'right' })
          .text(`$${timeTotal.toFixed(2)}`, 500, doc.y, { width: 50, align: 'right' })
          .moveDown(1);
      }
      
      // Add expense entries table
      if (invoiceData.expenseEntries.length > 0) {
        doc.fontSize(12).text('Expense Entries', { underline: true }).moveDown(0.5);
        
        // Table headers
        const expenseTableTop = doc.y;
        doc.fontSize(10)
          .text('Date', 50, expenseTableTop)
          .text('Description', 150, expenseTableTop)
          .text('Category', 350, expenseTableTop)
          .text('Amount', 500, expenseTableTop, { width: 50, align: 'right' })
          .moveDown(0.5);
        
        // Draw a line
        const lineY = doc.y;
        doc.moveTo(50, lineY).lineTo(550, lineY).stroke().moveDown(0.5);
        
        // Table rows
        let yPos = doc.y;
        invoiceData.expenseEntries.forEach(entry => {
          const entryDate = entry.expenseDate ? new Date(entry.expenseDate).toLocaleDateString() : '';
          doc.text(entryDate, 50, yPos)
            .text(entry.description || '', 150, yPos, { width: 190 })
            .text(entry.category || '', 350, yPos, { width: 140 })
            .text(entry.amount ? `$${entry.amount}` : '', 500, yPos, { width: 50, align: 'right' });
          
          // Calculate the height needed for this row and move down accordingly
          const textHeight = Math.max(
            doc.heightOfString(entry.description || '', { width: 190 }),
            doc.heightOfString(entryDate, { width: 90 })
          );
          yPos += textHeight + 5;
          doc.y = yPos;
        });
        
        // Expense subtotal
        doc.moveDown(0.5);
        doc.text('Expense Subtotal:', 400, doc.y, { width: 100, align: 'right' })
          .text(`$${expenseTotal.toFixed(2)}`, 500, doc.y, { width: 50, align: 'right' })
          .moveDown(1);
      }
      
      // Add total
      const total = timeTotal + expenseTotal;
      doc.fontSize(12).text('Total Due:', 400, doc.y, { width: 100, align: 'right' })
        .text(`$${total.toFixed(2)}`, 500, doc.y, { width: 50, align: 'right' })
        .moveDown(2);
      
      // Add payment information
      doc.fontSize(12).text('Payment Information', { underline: true }).moveDown(0.5);
      doc.fontSize(10)
        .text(`Please make checks payable to: ${merchant?.businessName || 'Law Firm'}`)
        .text('For wire transfers or electronic payments, please contact our office for banking details.')
        .text(`Payment Terms: ${invoiceData.invoice.paymentTerms || 'Net 30'}`)
        .moveDown(1);
      
      // Add notes
      if (invoiceData.invoice.notes) {
        doc.fontSize(12).text('Notes', { underline: true }).moveDown(0.5);
        doc.fontSize(10).text(invoiceData.invoice.notes).moveDown(1);
      }
      
      // Add footer
      doc.fontSize(10).text(`Invoice generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
      
      // Finalize PDF
      const buffers: Buffer[] = [];
      
      return new Promise<Buffer>((resolve, reject) => {
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', (err) => reject(err));
        
        // Finalize the document
        doc.end();
      });
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw new Error(`Failed to generate invoice PDF: ${error.message}`);
    }
  }
}

export const legalTimeExpenseService = new LegalTimeExpenseService();