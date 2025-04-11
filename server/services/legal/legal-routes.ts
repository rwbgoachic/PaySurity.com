/**
 * Register all legal practice management system routes
 */

import { Express, Request, Response, NextFunction } from "express";
import { legalTimeExpenseService } from "./time-expense-service";
import { z } from "zod";
import { insertLegalTimeEntrySchema, insertLegalExpenseEntrySchema, insertLegalInvoiceSchema } from "@shared/schema";
import { documentRouter } from "./document-routes";
import { clientPortalRouter } from "./client-portal-routes";

/**
 * Helper to ensure user is authenticated
 */
const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

/**
 * Helper to ensure user belongs to the merchant
 */
const ensureLegalMerchant = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // This would typically check if the user belongs to the merchant
  // For testing purposes, we'll just pass it through
  // In a real implementation, you would verify the merchant ID is valid for this user
  next();
};

export function registerLegalRoutes(app: Express) {
  // Document Management Routes
  app.use('/api/legal/documents', documentRouter);
  
  // Client Portal Routes
  app.use('/api/legal/client-portal', clientPortalRouter);
  // Time Entries APIs
  
  // Create time entry
  app.post("/api/legal/time-entries", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
    try {
      // Set merchantId from authenticated user for security
      const data = {
        ...req.body,
        merchantId: req.user?.merchantId || req.body.merchantId,
        userId: req.user?.id || req.body.userId
      };
      
      const validatedData = insertLegalTimeEntrySchema.parse(data);
      const timeEntry = await legalTimeExpenseService.createTimeEntry(validatedData);
      res.status(201).json(timeEntry);
    } catch (error) {
      console.error("Error creating time entry:", error);
      res.status(400).json({ error: error.message || "Failed to create time entry" });
    }
  });
  
  // Get all time entries for merchant
  app.get("/api/legal/time-entries", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
    try {
      const merchantId = req.user?.merchantId || Number(req.query.merchantId);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const filter = startDate || endDate ? { startDate, endDate } : undefined;
      
      const timeEntries = await legalTimeExpenseService.getTimeEntriesByMerchant(merchantId, filter);
      res.json(timeEntries);
    } catch (error) {
      console.error("Error retrieving time entries:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve time entries" });
    }
  });
  
  // Get a specific time entry
  app.get("/api/legal/time-entries/:id", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const timeEntry = await legalTimeExpenseService.getTimeEntryById(id);
      
      if (!timeEntry) {
        return res.status(404).json({ error: "Time entry not found" });
      }
      
      // Security check - ensure the time entry belongs to the merchant
      if (timeEntry.merchantId !== req.user?.merchantId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(timeEntry);
    } catch (error) {
      console.error("Error retrieving time entry:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve time entry" });
    }
  });
  
  // Update a time entry
  app.patch("/api/legal/time-entries/:id", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const timeEntry = await legalTimeExpenseService.getTimeEntryById(id);
      
      // Check if time entry exists
      if (!timeEntry) {
        return res.status(404).json({ error: "Time entry not found" });
      }
      
      // Security check - ensure the time entry belongs to the merchant
      if (timeEntry.merchantId !== req.user?.merchantId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Update the time entry
      const updatedTimeEntry = await legalTimeExpenseService.updateTimeEntry(id, req.body);
      res.json(updatedTimeEntry);
    } catch (error) {
      console.error("Error updating time entry:", error);
      res.status(400).json({ error: error.message || "Failed to update time entry" });
    }
  });
  
  // Delete a time entry (soft delete)
  app.delete("/api/legal/time-entries/:id", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const timeEntry = await legalTimeExpenseService.getTimeEntryById(id);
      
      // Check if time entry exists
      if (!timeEntry) {
        return res.status(404).json({ error: "Time entry not found" });
      }
      
      // Security check - ensure the time entry belongs to the merchant
      if (timeEntry.merchantId !== req.user?.merchantId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Delete the time entry
      const deletedTimeEntry = await legalTimeExpenseService.deleteTimeEntry(id);
      res.json(deletedTimeEntry);
    } catch (error) {
      console.error("Error deleting time entry:", error);
      res.status(500).json({ error: error.message || "Failed to delete time entry" });
    }
  });
  
  // Expense Entries APIs
  
  // Create expense entry
  app.post("/api/legal/expense-entries", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
    try {
      // Set merchantId from authenticated user for security
      const data = {
        ...req.body,
        merchantId: req.user?.merchantId || req.body.merchantId,
        userId: req.user?.id || req.body.userId
      };
      
      const validatedData = insertLegalExpenseEntrySchema.parse(data);
      const expenseEntry = await legalTimeExpenseService.createExpenseEntry(validatedData);
      res.status(201).json(expenseEntry);
    } catch (error) {
      console.error("Error creating expense entry:", error);
      res.status(400).json({ error: error.message || "Failed to create expense entry" });
    }
  });
  
  // Get all expense entries for merchant
  app.get("/api/legal/expense-entries", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
    try {
      const merchantId = req.user?.merchantId || Number(req.query.merchantId);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const filter = startDate || endDate ? { startDate, endDate } : undefined;
      
      const expenseEntries = await legalTimeExpenseService.getExpenseEntriesByMerchant(merchantId, filter);
      res.json(expenseEntries);
    } catch (error) {
      console.error("Error retrieving expense entries:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve expense entries" });
    }
  });
  
  // Get a specific expense entry
  app.get("/api/legal/expense-entries/:id", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const expenseEntry = await legalTimeExpenseService.getExpenseEntryById(id);
      
      if (!expenseEntry) {
        return res.status(404).json({ error: "Expense entry not found" });
      }
      
      // Security check - ensure the expense entry belongs to the merchant
      if (expenseEntry.merchantId !== req.user?.merchantId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(expenseEntry);
    } catch (error) {
      console.error("Error retrieving expense entry:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve expense entry" });
    }
  });
  
  // Update an expense entry
  app.patch("/api/legal/expense-entries/:id", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const expenseEntry = await legalTimeExpenseService.getExpenseEntryById(id);
      
      // Check if expense entry exists
      if (!expenseEntry) {
        return res.status(404).json({ error: "Expense entry not found" });
      }
      
      // Security check - ensure the expense entry belongs to the merchant
      if (expenseEntry.merchantId !== req.user?.merchantId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Update the expense entry
      const updatedExpenseEntry = await legalTimeExpenseService.updateExpenseEntry(id, req.body);
      res.json(updatedExpenseEntry);
    } catch (error) {
      console.error("Error updating expense entry:", error);
      res.status(400).json({ error: error.message || "Failed to update expense entry" });
    }
  });
  
  // Delete an expense entry (soft delete)
  app.delete("/api/legal/expense-entries/:id", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const expenseEntry = await legalTimeExpenseService.getExpenseEntryById(id);
      
      // Check if expense entry exists
      if (!expenseEntry) {
        return res.status(404).json({ error: "Expense entry not found" });
      }
      
      // Security check - ensure the expense entry belongs to the merchant
      if (expenseEntry.merchantId !== req.user?.merchantId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Delete the expense entry
      const deletedExpenseEntry = await legalTimeExpenseService.deleteExpenseEntry(id);
      res.json(deletedExpenseEntry);
    } catch (error) {
      console.error("Error deleting expense entry:", error);
      res.status(500).json({ error: error.message || "Failed to delete expense entry" });
    }
  });
  
  // Billable Summary APIs
  
  // Get billable summary for merchant
  app.get("/api/legal/billable-summary", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
    try {
      const merchantId = req.user?.merchantId || Number(req.query.merchantId);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const filter = startDate || endDate ? { startDate, endDate } : undefined;
      
      const summary = await legalTimeExpenseService.getBillableSummary(merchantId, filter);
      res.json(summary);
    } catch (error) {
      console.error("Error retrieving billable summary:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve billable summary" });
    }
  });
  
  // Invoice APIs
  
  // Create invoice from time and expense entries
  app.post("/api/legal/invoices", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
    try {
      const { invoiceData, timeEntryIds, expenseEntryIds, autoCalculateSubtotal } = req.body;
      
      // Set merchantId from authenticated user for security
      const data = {
        ...invoiceData,
        merchantId: req.user?.merchantId || invoiceData.merchantId,
        createdById: req.user?.id || invoiceData.createdById
      };
      
      const validatedData = insertLegalInvoiceSchema.parse(data);
      
      const invoice = await legalTimeExpenseService.createInvoiceFromEntries(
        validatedData,
        {
          timeEntryIds: timeEntryIds || [],
          expenseEntryIds: expenseEntryIds || [],
          autoCalculateSubtotal: autoCalculateSubtotal === undefined ? true : autoCalculateSubtotal
        }
      );
      
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ error: error.message || "Failed to create invoice" });
    }
  });
  
  // Get invoice entries
  app.get("/api/legal/invoices/:id/entries", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const invoiceEntries = await legalTimeExpenseService.getInvoiceEntries(id);
      
      if (!invoiceEntries) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      // Security check - ensure the invoice belongs to the merchant
      if (invoiceEntries.invoice.merchantId !== req.user?.merchantId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(invoiceEntries);
    } catch (error) {
      console.error("Error retrieving invoice entries:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve invoice entries" });
    }
  });
}