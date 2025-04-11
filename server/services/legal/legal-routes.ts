import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { ioltaService } from './iolta-service';
import { legalTimeExpenseService } from './time-expense-service';
import { paymentPlansService } from './payment-plans-service';
import {
  insertIoltaTrustAccountSchema,
  insertIoltaClientLedgerSchema,
  insertIoltaTransactionSchema,
  insertLegalTimeEntrySchema,
  insertLegalExpenseEntrySchema,
  insertLegalInvoiceSchema,
  insertPaymentPlanSchema,
  insertClientFinancingApplicationSchema
} from '@shared/schema';

/**
 * Register all legal payment features routes
 */
export function registerLegalRoutes(app: Express) {
  // Middleware to ensure user is a legal merchant
  const ensureLegalMerchant = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Check if user is a merchant (would be more specific for legal in production)
    if (req.user.role !== 'merchant') {
      return res.status(403).json({ error: "Forbidden: Legal merchant access required" });
    }
    
    return next();
  };

  // IOLTA Compliance Routes
  
  // Trust Accounts
  app.post('/api/legal/trust-accounts', ensureLegalMerchant, async (req, res) => {
    try {
      const trustAccountData = insertIoltaTrustAccountSchema.parse({
        ...req.body,
        merchantId: req.user.id
      });
      
      const trustAccount = await ioltaService.createTrustAccount(trustAccountData);
      res.status(201).json(trustAccount);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid trust account data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create trust account" });
    }
  });
  
  app.get('/api/legal/trust-accounts', ensureLegalMerchant, async (req, res) => {
    try {
      const trustAccounts = await ioltaService.getTrustAccountsByMerchant(req.user.id);
      res.json(trustAccounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trust accounts" });
    }
  });
  
  app.get('/api/legal/trust-accounts/:id', ensureLegalMerchant, async (req, res) => {
    try {
      const trustAccountId = parseInt(req.params.id);
      const trustAccount = await ioltaService.getTrustAccount(trustAccountId);
      
      if (!trustAccount) {
        return res.status(404).json({ error: "Trust account not found" });
      }
      
      if (trustAccount.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this trust account" });
      }
      
      res.json(trustAccount);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trust account" });
    }
  });
  
  // Client Ledgers
  app.post('/api/legal/client-ledgers', ensureLegalMerchant, async (req, res) => {
    try {
      const clientLedgerData = insertIoltaClientLedgerSchema.parse({
        ...req.body,
        merchantId: req.user.id
      });
      
      // Verify the trust account belongs to the merchant
      const trustAccount = await ioltaService.getTrustAccount(clientLedgerData.trustAccountId);
      if (!trustAccount || trustAccount.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this trust account" });
      }
      
      const clientLedger = await ioltaService.createClientLedger(clientLedgerData);
      res.status(201).json(clientLedger);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid client ledger data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create client ledger" });
    }
  });
  
  app.get('/api/legal/client-ledgers', ensureLegalMerchant, async (req, res) => {
    try {
      const trustAccountId = req.query.trustAccountId ? parseInt(req.query.trustAccountId as string) : undefined;
      
      let clientLedgers;
      if (trustAccountId) {
        // Verify the trust account belongs to the merchant
        const trustAccount = await ioltaService.getTrustAccount(trustAccountId);
        if (!trustAccount || trustAccount.merchantId !== req.user.id) {
          return res.status(403).json({ error: "Forbidden: Access denied to this trust account" });
        }
        
        clientLedgers = await ioltaService.getClientLedgersByTrustAccount(trustAccountId);
      } else {
        clientLedgers = await ioltaService.getClientLedgersByMerchant(req.user.id);
      }
      
      res.json(clientLedgers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client ledgers" });
    }
  });
  
  app.get('/api/legal/client-ledgers/:id', ensureLegalMerchant, async (req, res) => {
    try {
      const clientLedgerId = parseInt(req.params.id);
      const clientLedger = await ioltaService.getClientLedger(clientLedgerId);
      
      if (!clientLedger) {
        return res.status(404).json({ error: "Client ledger not found" });
      }
      
      if (clientLedger.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this client ledger" });
      }
      
      res.json(clientLedger);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client ledger" });
    }
  });
  
  // IOLTA Transactions
  app.post('/api/legal/trust-transactions', ensureLegalMerchant, async (req, res) => {
    try {
      const transactionData = insertIoltaTransactionSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      
      // Verify the client ledger belongs to the merchant
      const clientLedger = await ioltaService.getClientLedger(transactionData.clientLedgerId);
      if (!clientLedger || clientLedger.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this client ledger" });
      }
      
      const transaction = await ioltaService.recordTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid transaction data", details: error.errors });
      }
      console.error("Trust transaction error:", error);
      res.status(500).json({ error: "Failed to record transaction" });
    }
  });
  
  app.get('/api/legal/trust-transactions', ensureLegalMerchant, async (req, res) => {
    try {
      const clientLedgerId = req.query.clientLedgerId ? parseInt(req.query.clientLedgerId as string) : undefined;
      const trustAccountId = req.query.trustAccountId ? parseInt(req.query.trustAccountId as string) : undefined;
      
      let transactions;
      if (clientLedgerId) {
        // Verify the client ledger belongs to the merchant
        const clientLedger = await ioltaService.getClientLedger(clientLedgerId);
        if (!clientLedger || clientLedger.merchantId !== req.user.id) {
          return res.status(403).json({ error: "Forbidden: Access denied to this client ledger" });
        }
        
        transactions = await ioltaService.getTransactionsByClientLedger(clientLedgerId);
      } else if (trustAccountId) {
        // Verify the trust account belongs to the merchant
        const trustAccount = await ioltaService.getTrustAccount(trustAccountId);
        if (!trustAccount || trustAccount.merchantId !== req.user.id) {
          return res.status(403).json({ error: "Forbidden: Access denied to this trust account" });
        }
        
        transactions = await ioltaService.getTransactionsByTrustAccount(trustAccountId);
      } else {
        return res.status(400).json({ error: "Either clientLedgerId or trustAccountId must be provided" });
      }
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });
  
  app.get('/api/legal/client-ledger-statement/:id', ensureLegalMerchant, async (req, res) => {
    try {
      const clientLedgerId = parseInt(req.params.id);
      
      // Verify the client ledger belongs to the merchant
      const clientLedger = await ioltaService.getClientLedger(clientLedgerId);
      if (!clientLedger || clientLedger.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this client ledger" });
      }
      
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const statement = await ioltaService.getClientLedgerStatement(clientLedgerId, startDate, endDate);
      res.json(statement);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate client ledger statement" });
    }
  });
  
  app.get('/api/legal/trust-reconciliation/:id', ensureLegalMerchant, async (req, res) => {
    try {
      const trustAccountId = parseInt(req.params.id);
      
      // Verify the trust account belongs to the merchant
      const trustAccount = await ioltaService.getTrustAccount(trustAccountId);
      if (!trustAccount || trustAccount.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this trust account" });
      }
      
      const reconciliationDate = req.query.date ? new Date(req.query.date as string) : new Date();
      
      const reconciliation = await ioltaService.getTrustAccountReconciliation(trustAccountId, reconciliationDate);
      res.json(reconciliation);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate trust account reconciliation" });
    }
  });
  
  // Legal Time and Expense Tracking Routes
  
  // Time Entries
  app.post('/api/legal/time-entries', ensureLegalMerchant, async (req, res) => {
    try {
      const timeEntryData = insertLegalTimeEntrySchema.parse({
        ...req.body,
        merchantId: req.user.id,
        userId: req.user.id
      });
      
      const timeEntry = await legalTimeExpenseService.createTimeEntry(timeEntryData);
      res.status(201).json(timeEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid time entry data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create time entry" });
    }
  });
  
  app.get('/api/legal/time-entries', ensureLegalMerchant, async (req, res) => {
    try {
      const options = {
        clientId: req.query.clientId ? parseInt(req.query.clientId as string) : undefined,
        matterNumber: req.query.matterNumber as string | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        unbilledOnly: req.query.unbilledOnly === 'true'
      };
      
      const timeEntries = await legalTimeExpenseService.getTimeEntriesByMerchant(req.user.id, options);
      res.json(timeEntries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch time entries" });
    }
  });
  
  app.get('/api/legal/time-entries/:id', ensureLegalMerchant, async (req, res) => {
    try {
      const timeEntryId = parseInt(req.params.id);
      const timeEntry = await legalTimeExpenseService.getTimeEntry(timeEntryId);
      
      if (!timeEntry) {
        return res.status(404).json({ error: "Time entry not found" });
      }
      
      if (timeEntry.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this time entry" });
      }
      
      res.json(timeEntry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch time entry" });
    }
  });
  
  app.patch('/api/legal/time-entries/:id', ensureLegalMerchant, async (req, res) => {
    try {
      const timeEntryId = parseInt(req.params.id);
      
      // Verify the time entry belongs to the merchant
      const timeEntry = await legalTimeExpenseService.getTimeEntry(timeEntryId);
      if (!timeEntry || timeEntry.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this time entry" });
      }
      
      // Don't allow updating merchantId
      const { merchantId, ...updateData } = req.body;
      
      const updatedTimeEntry = await legalTimeExpenseService.updateTimeEntry(timeEntryId, updateData);
      res.json(updatedTimeEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid time entry data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update time entry" });
    }
  });
  
  app.delete('/api/legal/time-entries/:id', ensureLegalMerchant, async (req, res) => {
    try {
      const timeEntryId = parseInt(req.params.id);
      
      // Verify the time entry belongs to the merchant
      const timeEntry = await legalTimeExpenseService.getTimeEntry(timeEntryId);
      if (!timeEntry || timeEntry.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this time entry" });
      }
      
      const deletedTimeEntry = await legalTimeExpenseService.deleteTimeEntry(timeEntryId);
      res.json(deletedTimeEntry);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete time entry" });
    }
  });
  
  // Expense Entries
  app.post('/api/legal/expense-entries', ensureLegalMerchant, async (req, res) => {
    try {
      const expenseEntryData = insertLegalExpenseEntrySchema.parse({
        ...req.body,
        merchantId: req.user.id,
        userId: req.user.id
      });
      
      const expenseEntry = await legalTimeExpenseService.createExpenseEntry(expenseEntryData);
      res.status(201).json(expenseEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid expense entry data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create expense entry" });
    }
  });
  
  app.get('/api/legal/expense-entries', ensureLegalMerchant, async (req, res) => {
    try {
      const options = {
        clientId: req.query.clientId ? parseInt(req.query.clientId as string) : undefined,
        matterNumber: req.query.matterNumber as string | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        unbilledOnly: req.query.unbilledOnly === 'true'
      };
      
      const expenseEntries = await legalTimeExpenseService.getExpenseEntriesByMerchant(req.user.id, options);
      res.json(expenseEntries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense entries" });
    }
  });
  
  app.get('/api/legal/expense-entries/:id', ensureLegalMerchant, async (req, res) => {
    try {
      const expenseEntryId = parseInt(req.params.id);
      const expenseEntry = await legalTimeExpenseService.getExpenseEntry(expenseEntryId);
      
      if (!expenseEntry) {
        return res.status(404).json({ error: "Expense entry not found" });
      }
      
      if (expenseEntry.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this expense entry" });
      }
      
      res.json(expenseEntry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense entry" });
    }
  });
  
  app.patch('/api/legal/expense-entries/:id', ensureLegalMerchant, async (req, res) => {
    try {
      const expenseEntryId = parseInt(req.params.id);
      
      // Verify the expense entry belongs to the merchant
      const expenseEntry = await legalTimeExpenseService.getExpenseEntry(expenseEntryId);
      if (!expenseEntry || expenseEntry.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this expense entry" });
      }
      
      // Don't allow updating merchantId
      const { merchantId, ...updateData } = req.body;
      
      const updatedExpenseEntry = await legalTimeExpenseService.updateExpenseEntry(expenseEntryId, updateData);
      res.json(updatedExpenseEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid expense entry data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update expense entry" });
    }
  });
  
  app.delete('/api/legal/expense-entries/:id', ensureLegalMerchant, async (req, res) => {
    try {
      const expenseEntryId = parseInt(req.params.id);
      
      // Verify the expense entry belongs to the merchant
      const expenseEntry = await legalTimeExpenseService.getExpenseEntry(expenseEntryId);
      if (!expenseEntry || expenseEntry.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this expense entry" });
      }
      
      const deletedExpenseEntry = await legalTimeExpenseService.deleteExpenseEntry(expenseEntryId);
      res.json(deletedExpenseEntry);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense entry" });
    }
  });
  
  app.get('/api/legal/billable-summary', ensureLegalMerchant, async (req, res) => {
    try {
      const options = {
        clientId: req.query.clientId ? parseInt(req.query.clientId as string) : undefined,
        matterNumber: req.query.matterNumber as string | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };
      
      const summary = await legalTimeExpenseService.getBillableSummary(req.user.id, options);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate billable summary" });
    }
  });
  
  // Legal Invoicing
  app.post('/api/legal/invoices', ensureLegalMerchant, async (req, res) => {
    try {
      const { timeEntryIds, expenseEntryIds, autoCalculateSubtotal, ...invoiceData } = req.body;
      
      const validatedInvoiceData = insertLegalInvoiceSchema.parse({
        ...invoiceData,
        merchantId: req.user.id
      });
      
      const invoice = await legalTimeExpenseService.createInvoiceFromEntries(
        validatedInvoiceData,
        {
          timeEntryIds,
          expenseEntryIds,
          autoCalculateSubtotal
        }
      );
      
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid invoice data", details: error.errors });
      }
      console.error("Invoice creation error:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });
  
  app.get('/api/legal/invoices/:id/entries', ensureLegalMerchant, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const entries = await legalTimeExpenseService.getInvoiceEntries(invoiceId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice entries" });
    }
  });
  
  // Payment Plans
  app.post('/api/legal/payment-plans', ensureLegalMerchant, async (req, res) => {
    try {
      const paymentPlanData = insertPaymentPlanSchema.parse({
        ...req.body,
        merchantId: req.user.id
      });
      
      const paymentPlan = await paymentPlansService.createPaymentPlan(paymentPlanData);
      res.status(201).json(paymentPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid payment plan data", details: error.errors });
      }
      console.error("Payment plan creation error:", error);
      res.status(500).json({ error: "Failed to create payment plan" });
    }
  });
  
  app.get('/api/legal/payment-plans', ensureLegalMerchant, async (req, res) => {
    try {
      const options = {
        clientId: req.query.clientId ? parseInt(req.query.clientId as string) : undefined,
        status: req.query.status as string | undefined,
        active: req.query.active === 'true'
      };
      
      const paymentPlans = await paymentPlansService.getPaymentPlansByMerchant(req.user.id, options);
      res.json(paymentPlans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment plans" });
    }
  });
  
  app.get('/api/legal/payment-plans/:id', ensureLegalMerchant, async (req, res) => {
    try {
      const paymentPlanId = parseInt(req.params.id);
      const paymentPlan = await paymentPlansService.getPaymentPlan(paymentPlanId);
      
      if (!paymentPlan) {
        return res.status(404).json({ error: "Payment plan not found" });
      }
      
      if (paymentPlan.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this payment plan" });
      }
      
      res.json(paymentPlan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment plan" });
    }
  });
  
  app.get('/api/legal/payment-plans/:id/transactions', ensureLegalMerchant, async (req, res) => {
    try {
      const paymentPlanId = parseInt(req.params.id);
      
      // Verify the payment plan belongs to the merchant
      const paymentPlan = await paymentPlansService.getPaymentPlan(paymentPlanId);
      if (!paymentPlan || paymentPlan.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this payment plan" });
      }
      
      const transactions = await paymentPlansService.getPaymentPlanTransactions(paymentPlanId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment plan transactions" });
    }
  });
  
  app.patch('/api/legal/payment-plans/:id', ensureLegalMerchant, async (req, res) => {
    try {
      const paymentPlanId = parseInt(req.params.id);
      
      // Verify the payment plan belongs to the merchant
      const paymentPlan = await paymentPlansService.getPaymentPlan(paymentPlanId);
      if (!paymentPlan || paymentPlan.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this payment plan" });
      }
      
      // Don't allow updating merchantId
      const { merchantId, ...updateData } = req.body;
      
      const updatedPaymentPlan = await paymentPlansService.updatePaymentPlan(paymentPlanId, updateData);
      res.json(updatedPaymentPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid payment plan data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update payment plan" });
    }
  });
  
  app.post('/api/legal/payment-plans/:id/cancel', ensureLegalMerchant, async (req, res) => {
    try {
      const paymentPlanId = parseInt(req.params.id);
      
      // Verify the payment plan belongs to the merchant
      const paymentPlan = await paymentPlansService.getPaymentPlan(paymentPlanId);
      if (!paymentPlan || paymentPlan.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this payment plan" });
      }
      
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Cancellation reason is required" });
      }
      
      const cancelledPlan = await paymentPlansService.cancelPaymentPlan(paymentPlanId, reason);
      res.json(cancelledPlan);
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel payment plan" });
    }
  });
  
  app.post('/api/legal/payment-plans/:id/process-payment', ensureLegalMerchant, async (req, res) => {
    try {
      const paymentPlanTransactionId = parseInt(req.params.id);
      
      // Process the payment
      const result = await paymentPlansService.processScheduledPayment(paymentPlanTransactionId);
      res.json(result);
    } catch (error) {
      console.error("Payment processing error:", error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });
  
  app.post('/api/legal/process-due-payments', ensureLegalMerchant, async (req, res) => {
    try {
      const results = await paymentPlansService.processDuePaymentsForMerchant(req.user.id);
      res.json(results);
    } catch (error) {
      console.error("Batch payment processing error:", error);
      res.status(500).json({ error: "Failed to process due payments" });
    }
  });
  
  // Financing
  app.post('/api/legal/financing-applications', ensureLegalMerchant, async (req, res) => {
    try {
      const financingData = insertClientFinancingApplicationSchema.parse({
        ...req.body,
        merchantId: req.user.id
      });
      
      const application = await paymentPlansService.createFinancingApplication(financingData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid financing application data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create financing application" });
    }
  });
  
  app.get('/api/legal/financing-applications', ensureLegalMerchant, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const applications = await paymentPlansService.getFinancingApplicationsByMerchant(req.user.id, status);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch financing applications" });
    }
  });
  
  app.get('/api/legal/financing-applications/:id', ensureLegalMerchant, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await paymentPlansService.getFinancingApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ error: "Financing application not found" });
      }
      
      if (application.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this financing application" });
      }
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch financing application" });
    }
  });
  
  app.post('/api/legal/financing-applications/:id/approve', ensureLegalMerchant, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      
      // Verify the application belongs to the merchant
      const application = await paymentPlansService.getFinancingApplication(applicationId);
      if (!application || application.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this financing application" });
      }
      
      const result = await paymentPlansService.approveFinancingApplication(applicationId, req.user.username);
      res.json(result);
    } catch (error) {
      console.error("Financing approval error:", error);
      res.status(500).json({ error: "Failed to approve financing application" });
    }
  });
  
  app.post('/api/legal/financing-applications/:id/reject', ensureLegalMerchant, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      
      // Verify the application belongs to the merchant
      const application = await paymentPlansService.getFinancingApplication(applicationId);
      if (!application || application.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this financing application" });
      }
      
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }
      
      const rejectedApplication = await paymentPlansService.rejectFinancingApplication(applicationId, reason);
      res.json(rejectedApplication);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject financing application" });
    }
  });
  
  app.post('/api/legal/financing-applications/:id/activate', ensureLegalMerchant, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      
      // Verify the application belongs to the merchant
      const application = await paymentPlansService.getFinancingApplication(applicationId);
      if (!application || application.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Access denied to this financing application" });
      }
      
      const { paymentMethodId } = req.body;
      if (!paymentMethodId) {
        return res.status(400).json({ error: "Payment method ID is required" });
      }
      
      const result = await paymentPlansService.activateFinancingPaymentPlan(applicationId, paymentMethodId);
      res.json(result);
    } catch (error) {
      console.error("Financing activation error:", error);
      res.status(500).json({ error: "Failed to activate financing" });
    }
  });
}