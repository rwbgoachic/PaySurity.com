import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateSitemap } from "./sitemap";
import { z } from "zod";
import { sendOrderStatusSms } from "./services/sms";
import { deliveryService } from "./services/delivery/delivery-service";
import { processOrderModifications } from "./services/orderModification";
import { generateOrderModificationUrl } from "./services/qrcode";
import { taxCalculationService } from "./services/payroll/tax-calculation-service";
import { taxDataService } from "./services/payroll/tax-data-service";
import { payrollProcessorService } from "./services/payroll/payroll-processor-service";
import { 
  insertWalletSchema, 
  insertTransactionSchema, 
  insertBankAccountSchema, 
  insertFundRequestSchema,
  insertAffiliateProfileSchema,
  insertMerchantProfileSchema,
  insertMerchantReferralSchema,
  insertAffiliatePayoutSchema,
  referralStatusEnum,
  insertPaymentGatewaySchema,
  insertHelcimIntegrationSchema,
  insertExpenseReportSchema,
  insertExpenseLineItemSchema,
  insertFamilyGroupSchema,
  insertFamilyMemberSchema,
  insertAllowanceSchema,
  insertSavingsGoalSchema,
  insertSpendingRequestSchema,
  insertSpendingRulesSchema,
  
  // POS schemas
  insertPosLocationSchema,
  insertPosTableSchema,
  insertPosAreaSchema,
  insertPosCategorySchema,
  insertPosMenuItemSchema,
  insertPosOrderSchema,
  insertPosOrderItemSchema,
  insertPosInventoryItemSchema,
  insertPosStaffSchema,
  insertPosPaymentSchema,
  
  // Restaurant POS schemas
  insertRestaurantTableSchema,
  insertRestaurantOrderSchema,
  insertRestaurantOrderItemSchema,
  insertRestaurantInventoryItemSchema,
  insertRestaurantInventoryTransactionSchema,
  restaurantTableStatusEnum,
  restaurantOrderStatusEnum,
} from "@shared/schema";

// Import delivery schema
import {
  insertDeliveryProviderSchema,
  insertBusinessDeliverySettingsSchema,
  insertDeliveryOrderSchema,
  deliveryStatusEnum
} from "@shared/delivery-schema";

// Define extended WebSocket interface with channels support
interface ExtendedWebSocket extends WebSocket {
  channels?: string[];
  userId?: number;
  isAffiliate?: boolean;
  affiliateId?: number;
  isEmployer?: boolean;
  isEmployee?: boolean;
  lastActivity?: number;
  employerId?: number;
  walletId?: number;
}

// Helper function to broadcast messages to all connected WebSocket clients
// that are subscribed to the specified channel
function broadcast(channel: string, message: any) {
  const wss = (global as any).wss;
  if (!wss) return;
  
  wss.clients.forEach((client: WebSocket) => {
    const extClient = client as ExtendedWebSocket;
    if (extClient.readyState === WebSocket.OPEN && extClient.channels && extClient.channels.includes(channel)) {
      extClient.send(JSON.stringify(message));
    }
  });
}

// Helper function for specialized employer notifications
function notifyEmployer(employerId: number, message: any) {
  broadcast(`employer-${employerId}`, message);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Authentication Routes
  setupAuth(app);

  // API Routes
  app.get("/api/healthcheck", (req, res) => {
    res.json({ status: "ok" });
  });
  
  // Tax Calculation System API Routes
  
  // Get tax data for a specific year
  app.get("/api/tax/data/:year", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.role || !["admin", "finance", "employer"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized: Insufficient permissions" });
    }
    
    try {
      const year = parseInt(req.params.year);
      if (isNaN(year) || year < 2000 || year > 2050) {
        return res.status(400).json({ error: "Invalid year" });
      }
      
      const taxData = await taxDataService.getTaxDataForYear(year);
      res.json(taxData);
    } catch (error) {
      console.error("Error fetching tax data:", error);
      res.status(500).json({ error: "Failed to fetch tax data" });
    }
  });
  
  // Initialize default tax data for development/testing
  app.post("/api/tax/init-defaults", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.role || !["admin", "finance"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized: Admin access required" });
    }
    
    try {
      const year = req.body.year ? parseInt(req.body.year) : new Date().getFullYear();
      await taxDataService.initializeDefaultTaxData(year);
      res.json({ success: true, message: `Default tax data initialized for ${year}` });
    } catch (error) {
      console.error("Error initializing tax data:", error);
      res.status(500).json({ error: "Failed to initialize tax data" });
    }
  });
  
  // Update federal tax brackets for a specific year and filing status
  app.post("/api/tax/federal-brackets/:year/:filingStatus", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.role || !["admin", "finance"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized: Admin access required" });
    }
    
    try {
      const year = parseInt(req.params.year);
      const filingStatus = req.params.filingStatus;
      const brackets = req.body.brackets;
      
      if (!brackets || !Array.isArray(brackets)) {
        return res.status(400).json({ error: "Invalid tax brackets data" });
      }
      
      const savedBrackets = await taxDataService.upsertFederalTaxBrackets(year, filingStatus, brackets);
      res.json(savedBrackets);
    } catch (error) {
      console.error("Error updating federal tax brackets:", error);
      res.status(500).json({ error: "Failed to update federal tax brackets" });
    }
  });
  
  // Update state tax brackets for a specific state, year, and filing status
  app.post("/api/tax/state-brackets/:state/:year/:filingStatus", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.role || !["admin", "finance"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized: Admin access required" });
    }
    
    try {
      const state = req.params.state.toUpperCase();
      const year = parseInt(req.params.year);
      const filingStatus = req.params.filingStatus;
      const brackets = req.body.brackets;
      
      if (!brackets || !Array.isArray(brackets)) {
        return res.status(400).json({ error: "Invalid tax brackets data" });
      }
      
      const savedBrackets = await taxDataService.upsertStateTaxBrackets(state, year, filingStatus, brackets);
      res.json(savedBrackets);
    } catch (error) {
      console.error("Error updating state tax brackets:", error);
      res.status(500).json({ error: "Failed to update state tax brackets" });
    }
  });
  
  // Update FICA rates for a specific year
  app.post("/api/tax/fica-rates/:year", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.role || !["admin", "finance"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized: Admin access required" });
    }
    
    try {
      const year = parseInt(req.params.year);
      const ratesData = req.body;
      
      if (!ratesData || typeof ratesData !== "object") {
        return res.status(400).json({ error: "Invalid FICA rates data" });
      }
      
      const savedRates = await taxDataService.upsertFicaRates(year, ratesData);
      res.json(savedRates);
    } catch (error) {
      console.error("Error updating FICA rates:", error);
      res.status(500).json({ error: "Failed to update FICA rates" });
    }
  });
  
  // Update employee tax profile
  app.post("/api/tax/employee-profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const profileData = req.body;
      
      // Ensure the request is either for the authenticated user or the user has employer permissions
      const targetUserId = profileData.userId;
      if (
        targetUserId !== req.user.id && 
        (!req.user.role || !["admin", "finance", "employer"].includes(req.user.role))
      ) {
        return res.status(403).json({ error: "Unauthorized: Cannot update another user's tax profile" });
      }
      
      const profile = await taxCalculationService.upsertEmployeeTaxProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating employee tax profile:", error);
      res.status(500).json({ error: "Failed to update employee tax profile" });
    }
  });
  
  // Payroll Processing API Routes
  
  // Process payroll for an employer
  app.post("/api/payroll/process", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.role || !["admin", "finance", "employer"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized: Employer access required" });
    }
    
    try {
      const { employerId, startDate, endDate, payDate } = req.body;
      
      // Ensure the authenticated user is the employer or has admin/finance role
      if (
        employerId !== req.user.id && 
        !["admin", "finance"].includes(req.user.role)
      ) {
        return res.status(403).json({ error: "Unauthorized: Can only process payroll for your own employees" });
      }
      
      // Process the payroll
      const result = await payrollProcessorService.processPayroll(
        employerId,
        new Date(startDate),
        new Date(endDate),
        new Date(payDate),
        req.user.id
      );
      
      // Notify each employee about their payroll via WebSocket
      for (const entry of result.processedEntries) {
        broadcast(`user-${entry.userId}`, {
          type: 'payroll_processed',
          data: {
            id: entry.id,
            payPeriodStart: entry.payPeriodStart,
            payPeriodEnd: entry.payPeriodEnd,
            payDate: entry.payDate,
            grossPay: entry.grossPay,
            netPay: entry.netPay
          }
        });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error processing payroll:", error);
      res.status(500).json({ error: "Failed to process payroll" });
    }
  });
  
  // Generate pay stub for a specific payroll entry
  app.get("/api/payroll/:id/paystub", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const payrollEntryId = parseInt(req.params.id);
      const payStub = await payrollProcessorService.generatePayStub(payrollEntryId);
      
      // Check if the user has permissions to view this pay stub
      if (
        payStub.employee.id !== req.user.id && 
        payStub.employer.id !== req.user.id &&
        !["admin", "finance"].includes(req.user.role || "")
      ) {
        return res.status(403).json({ error: "Unauthorized: Cannot view another user's pay stub" });
      }
      
      res.json(payStub);
    } catch (error) {
      console.error("Error generating pay stub:", error);
      res.status(500).json({ error: "Failed to generate pay stub" });
    }
  });
  
  // Generate payroll report for an employer
  app.post("/api/payroll/report", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.role || !["admin", "finance", "employer"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized: Employer access required" });
    }
    
    try {
      const { employerId, startDate, endDate } = req.body;
      
      // Ensure the authenticated user is the employer or has admin/finance role
      if (
        employerId !== req.user.id && 
        !["admin", "finance"].includes(req.user.role)
      ) {
        return res.status(403).json({ error: "Unauthorized: Can only view payroll reports for your own employees" });
      }
      
      const report = await payrollProcessorService.generatePayrollReport(
        employerId,
        new Date(startDate),
        new Date(endDate)
      );
      
      res.json(report);
    } catch (error) {
      console.error("Error generating payroll report:", error);
      res.status(500).json({ error: "Failed to generate payroll report" });
    }
  });

  // Wallet Management API
  app.get("/api/wallets", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const wallets = await storage.getWalletsByUserId(req.user.id);
      res.json(wallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      res.status(500).json({ error: "Failed to fetch wallets" });
    }
  });
  
  app.post("/api/wallets", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const walletData = insertWalletSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const wallet = await storage.createWallet(walletData);
      res.status(201).json(wallet);
    } catch (error) {
      console.error("Error creating wallet:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid wallet data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create wallet" });
    }
  });
  
  app.get("/api/wallets/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const walletId = parseInt(req.params.id);
      const wallet = await storage.getWallet(walletId);
      
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      if (wallet.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      res.json(wallet);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });
  
  app.patch("/api/wallets/:id/balance", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const walletId = parseInt(req.params.id);
      const wallet = await storage.getWallet(walletId);
      
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      if (wallet.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { balance } = req.body;
      if (typeof balance !== "string") {
        return res.status(400).json({ error: "Invalid balance format" });
      }
      
      const updatedWallet = await storage.updateWalletBalance(walletId, balance);
      res.json(updatedWallet);
    } catch (error) {
      console.error("Error updating wallet balance:", error);
      res.status(500).json({ error: "Failed to update wallet balance" });
    }
  });
  
  app.patch("/api/wallets/:id/limits", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const walletId = parseInt(req.params.id);
      const wallet = await storage.getWallet(walletId);
      
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      if (wallet.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { dailyLimit, weeklyLimit, monthlyLimit } = req.body;
      const updatedWallet = await storage.updateWalletLimits(
        walletId, 
        dailyLimit, 
        weeklyLimit, 
        monthlyLimit
      );
      
      res.json(updatedWallet);
    } catch (error) {
      console.error("Error updating wallet limits:", error);
      res.status(500).json({ error: "Failed to update wallet limits" });
    }
  });
  
  // Transaction API
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const transactions = await storage.getTransactionsByUserId(req.user.id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });
  
  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Validate the wallet belongs to the user
      const wallet = await storage.getWallet(req.body.walletId);
      if (!wallet || wallet.userId !== req.user.id) {
        return res.status(403).json({ error: "Invalid wallet" });
      }
      
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Create the transaction and update wallet balance in a single operation
      const transaction = await storage.createTransaction(transactionData);
      
      // Update wallet balance based on transaction type
      const newBalance = transactionData.type === "incoming" 
        ? (parseFloat(wallet.balance.toString()) + parseFloat(transactionData.amount.toString())).toString()
        : (parseFloat(wallet.balance.toString()) - parseFloat(transactionData.amount.toString())).toString();
      
      await storage.updateWalletBalance(wallet.id, newBalance);
      
      // Broadcast transaction event via WebSocket to relevant subscribers
      broadcast(`wallet-${wallet.id}`, {
        type: 'transaction',
        data: transaction
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid transaction data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });
  
  // Bank Account APIs
  app.get("/api/bank-accounts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const accounts = await storage.getBankAccountsByUserId(req.user.id);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      res.status(500).json({ error: "Failed to fetch bank accounts" });
    }
  });
  
  app.post("/api/bank-accounts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const bankAccountData = insertBankAccountSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const account = await storage.createBankAccount(bankAccountData);
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating bank account:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid bank account data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create bank account" });
    }
  });
  
  // Fund Requests API
  app.post("/api/fund-requests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const fundRequestData = insertFundRequestSchema.parse({
        ...req.body,
        requesterId: req.user.id
      });
      
      const fundRequest = await storage.createFundRequest(fundRequestData);
      
      // Notify the approver about the fund request via WebSocket
      if (fundRequestData.approverId) {
        broadcast(`user-${fundRequestData.approverId}`, {
          type: 'fund_request',
          data: fundRequest
        });
      }
      
      res.status(201).json(fundRequest);
    } catch (error) {
      console.error("Error creating fund request:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid fund request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create fund request" });
    }
  });
  
  app.get("/api/fund-requests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const fundRequests = await storage.getFundRequestsByUserId(req.user.id);
      res.json(fundRequests);
    } catch (error) {
      console.error("Error fetching fund requests:", error);
      res.status(500).json({ error: "Failed to fetch fund requests" });
    }
  });
  
  // Expense Reports API
  app.get("/api/expense-reports", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const expenseReports = await storage.getExpenseReportsByUserId(req.user.id);
      res.json(expenseReports);
    } catch (error) {
      console.error("Error fetching expense reports:", error);
      res.status(500).json({ error: "Failed to fetch expense reports" });
    }
  });
  
  app.post("/api/expense-reports", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const reportData = insertExpenseReportSchema.parse({
        ...req.body,
        userId: req.user.id,
        status: "draft"
      });
      
      const report = await storage.createExpenseReport(reportData);
      
      // Broadcast report creation event to employer using both classic and new methods
      if (reportData.employerId) {
        // Classic broadcast method
        broadcast(`user-${reportData.employerId}`, {
          type: 'expense_report_created',
          data: report
        });
        
        // New employer notification method for real-time updates
        notifyEmployer(reportData.employerId, {
          type: 'new_expense_report_draft',
          report: {
            id: report.id,
            title: report.title,
            status: report.status,
            createdAt: report.createdAt,
            employeeId: report.userId
          }
        });
      }
      
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating expense report:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid expense report data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create expense report" });
    }
  });
  
  app.get("/api/expense-reports/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getExpenseReport(reportId);
      
      if (!report) {
        return res.status(404).json({ error: "Expense report not found" });
      }
      
      // Ensure user has access to this report (either as employee or employer)
      if (report.userId !== req.user.id && report.employerId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const lineItems = await storage.getExpenseLineItemsByReportId(reportId);
      
      res.json({
        ...report,
        lineItems
      });
    } catch (error) {
      console.error("Error fetching expense report:", error);
      res.status(500).json({ error: "Failed to fetch expense report" });
    }
  });
  
  app.post("/api/expense-reports/:id/pay", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getExpenseReport(reportId);
      
      if (!report) {
        return res.status(404).json({ error: "Expense report not found" });
      }
      
      // Only employers can mark reports as paid
      if (report.employerId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: Only employers can process payments" });
      }
      
      // Only approved reports can be paid
      if (report.status !== "approved") {
        return res.status(400).json({ error: "Only approved reports can be paid" });
      }
      
      const { paymentMethod, referenceNumber, notes, sendReceipt } = req.body;
      
      const updatedReport = await storage.updateExpenseReportPayment(
        reportId,
        "paid",
        req.user.id,
        new Date(),
        paymentMethod,
        referenceNumber,
        notes
      );
      
      // Notify employee about payment
      broadcast(`user-${report.userId}`, {
        type: 'expense_report_paid',
        data: updatedReport
      });
      
      // Optionally send email receipt
      if (sendReceipt) {
        // Add email sending logic here when implemented
        console.log(`Payment receipt would be sent to employee ${report.userId}`);
      }
      
      return res.json(updatedReport);
    } catch (error) {
      console.error("Error processing expense report payment:", error);
      return res.status(500).json({ error: "Failed to process payment" });
    }
  });

  app.patch("/api/expense-reports/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getExpenseReport(reportId);
      
      if (!report) {
        return res.status(404).json({ error: "Expense report not found" });
      }
      
      // For submitting a report (employee)
      if (req.body.status === "submitted" && report.userId === req.user.id) {
        const submittedReport = await storage.updateExpenseReportStatus(
          reportId, 
          "submitted",
          null,
          null,
          null
        );
        
        // Notify employer about the submitted report using both classic and new methods
        broadcast(`user-${report.employerId}`, {
          type: 'expense_report_submitted',
          data: submittedReport
        });
        
        // Use our new employer notification method
        if (report.employerId) {
          notifyEmployer(report.employerId, {
            type: 'new_expense_report',
            report: {
              id: report.id,
              title: report.title,
              totalAmount: report.totalAmount,
              submissionDate: new Date().toISOString(),
              employeeId: report.userId
            }
          });
        }
        
        return res.json(submittedReport);
      }
      
      // For reviewing/approving/rejecting a report (employer)
      if (report.employerId === req.user.id) {
        const { status, rejectionReason } = req.body;
        
        if (!["under_review", "approved", "rejected", "paid"].includes(status)) {
          return res.status(400).json({ error: "Invalid status" });
        }
        
        if (status === "rejected" && !rejectionReason) {
          return res.status(400).json({ error: "Rejection reason is required" });
        }
        
        const updatedReport = await storage.updateExpenseReportStatus(
          reportId,
          status,
          req.user.id,
          new Date(),
          rejectionReason
        );
        
        // Notify employee about the status change using both classic and new method
        broadcast(`user-${report.userId}`, {
          type: 'expense_report_status_changed',
          data: updatedReport
        });
        
        // Use our new employee notification method
        if (report.userId) {
          notifyEmployee(report.userId, {
            type: 'expense_report_status_update',
            report: {
              id: report.id,
              title: report.title,
              status: status,
              totalAmount: report.totalAmount,
              reviewDate: new Date().toISOString(),
              reviewNotes: status === "rejected" ? rejectionReason : null
            }
          });
        }
        
        return res.json(updatedReport);
      }
      
      return res.status(403).json({ error: "Forbidden" });
    } catch (error) {
      console.error("Error updating expense report status:", error);
      res.status(500).json({ error: "Failed to update expense report status" });
    }
  });
  
  app.post("/api/expense-reports/:id/line-items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getExpenseReport(reportId);
      
      if (!report) {
        return res.status(404).json({ error: "Expense report not found" });
      }
      
      // Only the owner of the report can add line items
      if (report.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Cannot add line items to submitted or processed reports
      if (report.status !== "draft") {
        return res.status(400).json({ error: "Cannot add items to a submitted or processed report" });
      }
      
      const lineItemData = insertExpenseLineItemSchema.parse({
        ...req.body,
        expenseReportId: reportId
      });
      
      const lineItem = await storage.createExpenseLineItem(lineItemData);
      
      // Update the total amount of the expense report
      const lineItems = await storage.getExpenseLineItemsByReportId(reportId);
      const totalAmount = lineItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0).toString();
      
      await storage.updateExpenseReportTotalAmount(reportId, totalAmount);
      
      // Notify about the new line item
      notifyExpenseLineItemChange(
        { userId: report.userId, employerId: report.employerId }, 
        { ...lineItem, reportStatus: report.status }, 
        'added'
      );
      
      res.status(201).json(lineItem);
    } catch (error) {
      console.error("Error adding expense line item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid line item data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to add expense line item" });
    }
  });
  
  app.patch("/api/expense-reports/line-items/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const lineItemId = parseInt(req.params.id);
      const lineItem = await storage.getExpenseLineItem(lineItemId);
      
      if (!lineItem) {
        return res.status(404).json({ error: "Expense line item not found" });
      }
      
      const report = await storage.getExpenseReport(lineItem.expenseReportId);
      
      // Only the owner of the report can update line items
      if (report.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Cannot update line items in submitted or processed reports
      if (report.status !== "draft") {
        return res.status(400).json({ error: "Cannot modify items in a submitted or processed report" });
      }
      
      const updatedLineItem = await storage.updateExpenseLineItem(lineItemId, req.body);
      
      // Update the total amount of the expense report
      const lineItems = await storage.getExpenseLineItemsByReportId(report.id);
      const totalAmount = lineItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0).toString();
      
      await storage.updateExpenseReportTotalAmount(report.id, totalAmount);
      
      // Notify about the updated line item
      notifyExpenseLineItemChange(
        { userId: report.userId, employerId: report.employerId }, 
        { ...updatedLineItem, reportStatus: report.status }, 
        'updated'
      );
      
      res.json(updatedLineItem);
    } catch (error) {
      console.error("Error updating expense line item:", error);
      res.status(500).json({ error: "Failed to update expense line item" });
    }
  });
  
  app.delete("/api/expense-reports/line-items/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const lineItemId = parseInt(req.params.id);
      const lineItem = await storage.getExpenseLineItem(lineItemId);
      
      if (!lineItem) {
        return res.status(404).json({ error: "Expense line item not found" });
      }
      
      const report = await storage.getExpenseReport(lineItem.expenseReportId);
      
      // Only the owner of the report can delete line items
      if (report.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Cannot delete line items in submitted or processed reports
      if (report.status !== "draft") {
        return res.status(400).json({ error: "Cannot delete items from a submitted or processed report" });
      }
      
      // Save the line item data before deleting it for the notification
      const lineItemData = { ...lineItem, reportStatus: report.status };
      
      // Delete the line item
      await storage.deleteExpenseLineItem(lineItemId);
      
      // Update the total amount of the expense report
      const lineItems = await storage.getExpenseLineItemsByReportId(report.id);
      const totalAmount = lineItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0).toString();
      
      await storage.updateExpenseReportTotalAmount(report.id, totalAmount);
      
      // Notify about the deleted line item
      notifyExpenseLineItemChange(
        { userId: report.userId, employerId: report.employerId }, 
        lineItemData, 
        'deleted'
      );
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting expense line item:", error);
      res.status(500).json({ error: "Failed to delete expense line item" });
    }
  });
  
  // For employers to get all pending expense reports from their employees
  app.get("/api/employer/expense-reports/pending", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Verify the user is an employer
      if (!req.user.role.includes('employer')) {
        return res.status(403).json({ error: "Only employers can access this endpoint" });
      }
      
      const pendingReports = await storage.getPendingExpenseReportsByEmployerId(req.user.id);
      res.json(pendingReports);
    } catch (error) {
      console.error("Error fetching pending expense reports:", error);
      res.status(500).json({ error: "Failed to fetch pending expense reports" });
    }
  });
  
  // For employers to get all expense reports from their employees
  app.get("/api/employer/expense-reports", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Verify the user is an employer
      if (!req.user.role.includes('employer')) {
        return res.status(403).json({ error: "Only employers can access this endpoint" });
      }
      
      const reports = await storage.getExpenseReportsByEmployerId(req.user.id);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching employer expense reports:", error);
      res.status(500).json({ error: "Failed to fetch employer expense reports" });
    }
  });
  
  // Affiliate Management API
  app.get("/api/affiliate/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const profile = await storage.getAffiliateProfileByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: "Affiliate profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching affiliate profile:", error);
      res.status(500).json({ error: "Failed to fetch affiliate profile" });
    }
  });
  
  app.post("/api/affiliate/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Check if profile already exists
      const existingProfile = await storage.getAffiliateProfileByUserId(req.user.id);
      if (existingProfile) {
        return res.status(409).json({ error: "Affiliate profile already exists" });
      }
      
      // Generate unique referral code if not provided
      const referralCode = req.body.referralCode || 
        `${req.user.username.substring(0, 5)}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`.toLowerCase();
      
      const profileData = insertAffiliateProfileSchema.parse({
        ...req.body,
        userId: req.user.id,
        referralCode
      });
      
      const profile = await storage.createAffiliateProfile(profileData);
      
      // Update user role to include affiliate
      await storage.updateUser(req.user.id, { role: "affiliate" });
      
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating affiliate profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid profile data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create affiliate profile" });
    }
  });
  
  app.patch("/api/affiliate/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const profile = await storage.getAffiliateProfileByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: "Affiliate profile not found" });
      }
      
      const updatedProfile = await storage.updateAffiliateProfile(profile.id, req.body);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating affiliate profile:", error);
      res.status(500).json({ error: "Failed to update affiliate profile" });
    }
  });
  
  app.get("/api/affiliate/referrals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const profile = await storage.getAffiliateProfileByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: "Affiliate profile not found" });
      }
      
      const referrals = await storage.getMerchantReferralsByAffiliateId(profile.id);
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });
  
  app.get("/api/affiliate/payouts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const profile = await storage.getAffiliateProfileByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: "Affiliate profile not found" });
      }
      
      const payouts = await storage.getAffiliatePayoutsByAffiliateId(profile.id);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });
  
  app.get("/api/affiliate/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const profile = await storage.getAffiliateProfileByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: "Affiliate profile not found" });
      }
      
      const range = req.query.range as string || 'month';
      const stats = await storage.getAffiliateStats(profile.id, range);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching affiliate stats:", error);
      res.status(500).json({ error: "Failed to fetch affiliate stats" });
    }
  });
  
  // Merchant Profiles API
  app.post("/api/merchant-profiles", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Check if profile already exists
      const existingProfile = await storage.getMerchantProfileByUserId(req.user.id);
      if (existingProfile) {
        return res.status(409).json({ error: "Merchant profile already exists" });
      }
      
      // Process referral code if provided
      const { referralCode, ...merchantData } = req.body;
      let affiliateProfile = null;
      
      if (referralCode) {
        // Look up the affiliate by referral code
        affiliateProfile = await storage.getAffiliateProfileByReferralCode(referralCode);
        if (!affiliateProfile) {
          return res.status(400).json({ error: "Invalid referral code" });
        }
      }
      
      // Create merchant profile with validated data
      const profileData = insertMerchantProfileSchema.parse({
        ...merchantData,
        userId: req.user.id,
        referralCode: referralCode || null,
      });
      
      const merchantProfile = await storage.createMerchantProfile(profileData);
      
      // If referral code was provided and valid, create a referral record
      let referral = null;
      if (affiliateProfile) {
        const referralData = insertMerchantReferralSchema.parse({
          affiliateId: affiliateProfile.id,
          merchantId: merchantProfile.id,
          referralCode: referralCode,
          status: "pending",
          notes: "Created via merchant onboarding form"
        });
        
        referral = await storage.createMerchantReferral(referralData);
        
        // Notify the affiliate about the new referral via WebSocket
        notifyAffiliate(affiliateProfile.userId, {
          type: 'new_referral',
          referral: {
            id: referral.id,
            name: merchantProfile.businessName,
            date: new Date().toISOString(),
            status: "pending",
            revenue: 0,
            commission: 0,
            type: 'referral',
            title: 'New Merchant Referral',
            message: `${merchantProfile.businessName} just signed up using your referral link`
          }
        });
      }
      
      res.status(201).json({ 
        merchantProfile,
        referral
      });
    } catch (error) {
      console.error("Error creating merchant profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid merchant profile data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create merchant profile" });
    }
  });
  
  app.get("/api/merchant-profiles", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const merchantProfile = await storage.getMerchantProfileByUserId(req.user.id);
      if (!merchantProfile) {
        return res.status(404).json({ error: "Merchant profile not found" });
      }
      
      res.json(merchantProfile);
    } catch (error) {
      console.error("Error fetching merchant profile:", error);
      res.status(500).json({ error: "Failed to fetch merchant profile" });
    }
  });
  
  app.get("/api/affiliate/marketing-materials", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const profile = await storage.getAffiliateProfileByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: "Affiliate profile not found" });
      }
      
      // For now, we'll return a static list of marketing materials
      // In the future, this would be dynamically generated based on the affiliate's profile
      const marketingMaterials = [
        {
          id: 1,
          name: "Banner - Generic",
          type: "image",
          size: "300x250",
          url: "/affiliate/banners/banner1.png",
          category: "general",
          html: `<a href="https://paysurity.com/ref/${profile.referralCode}"><img src="https://paysurity.com/affiliate/banners/banner1.png" alt="PaySurity Payment Solutions" width="300" height="250" /></a>`
        },
        {
          id: 2,
          name: "Banner - Restaurant",
          type: "image",
          size: "728x90",
          url: "/affiliate/banners/banner2.png",
          category: "restaurant",
          html: `<a href="https://paysurity.com/ref/${profile.referralCode}"><img src="https://paysurity.com/affiliate/banners/banner2.png" alt="PaySurity Payment Solutions for Restaurants" width="728" height="90" /></a>`
        },
        {
          id: 3,
          name: "Banner - Retail",
          type: "image",
          size: "300x250",
          url: "/affiliate/banners/banner3.png",
          category: "retail",
          html: `<a href="https://paysurity.com/ref/${profile.referralCode}"><img src="https://paysurity.com/affiliate/banners/banner3.png" alt="PaySurity Payment Solutions for Retail" width="300" height="250" /></a>`
        },
        {
          id: 4,
          name: "Text Link - Standard",
          type: "text",
          category: "general",
          html: `<a href="https://paysurity.com/ref/${profile.referralCode}">PaySurity - Modern Payment Solutions for Businesses</a>`
        },
        {
          id: 5,
          name: "Text Link - Healthcare",
          type: "text",
          category: "healthcare",
          html: `<a href="https://paysurity.com/ref/${profile.referralCode}">PaySurity - Secure Healthcare Payment Processing</a>`
        }
      ];
      
      res.json(marketingMaterials);
    } catch (error) {
      console.error("Error fetching marketing materials:", error);
      res.status(500).json({ error: "Failed to fetch marketing materials" });
    }
  });
  
  // Admin API for managing affiliate payouts
  app.post("/api/admin/affiliate/process-payouts", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized. Admin access required." });
    }
    
    try {
      const { affiliateId, month, year, amount, notes } = req.body;
      
      // Validate the affiliate exists
      const affiliate = await storage.getAffiliateProfile(affiliateId);
      if (!affiliate) {
        return res.status(404).json({ error: "Affiliate not found" });
      }
      
      // Create the payout
      // Get a random referral for this affiliate to link the payout to
      const referrals = await storage.getMerchantReferralsByAffiliateId(affiliateId);
      if (!referrals.length) {
        return res.status(400).json({ error: "Affiliate has no referrals to process payment for" });
      }
      
      // Define payout data with correct schema
      const payoutData = insertAffiliatePayoutSchema.parse({
        affiliateId,
        referralId: referrals[0].id, // Use the first referral
        milestoneName: `Monthly payout ${year}-${month.toString().padStart(2, '0')}`,
        amount,
        status: "pending",
        notes: notes || `Processed by admin: ${req.user.username}`
      });
      
      const payout = await storage.createAffiliatePayout(payoutData);
      
      // Notify the affiliate about the payout via WebSocket
      broadcast(`affiliate-${affiliateId}`, {
        type: 'payout_processed',
        data: payout
      });
      
      res.status(201).json(payout);
    } catch (error) {
      console.error("Error processing affiliate payout:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid payout data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process payout" });
    }
  });
  
  // API endpoint to validate a referral code
  app.get("/api/validate-referral-code/:code", async (req, res) => {
    try {
      const referralCode = req.params.code;
      const affiliate = await storage.getAffiliateProfileByReferralCode(referralCode);
      
      if (!affiliate) {
        return res.status(404).json({ valid: false, message: "Invalid referral code" });
      }
      
      // Return minimal info about the affiliate for validation display
      res.json({
        valid: true,
        affiliate: {
          id: affiliate.id,
          name: affiliate.companyName || "Affiliate Partner",
          referralCode: affiliate.referralCode
        }
      });
    } catch (error) {
      console.error("Error validating referral code:", error);
      res.status(500).json({ valid: false, message: "Error validating referral code" });
    }
  });
  
  // Merchant registration with referral tracking
  app.post("/api/register-with-referral", async (req, res) => {
    try {
      const { referralCode, ...userData } = req.body;
      
      // Validate the referral code
      const affiliate = await storage.getAffiliateProfileByReferralCode(referralCode);
      if (!affiliate) {
        return res.status(404).json({ error: "Invalid referral code" });
      }
      
      // Register the user
      const user = await storage.createUser(userData);
      
      // Create a merchant profile for the user
      const merchantProfile = await storage.createMerchantProfile({
        userId: user.id,
        businessName: userData.businessName || "New Business",
        businessType: userData.businessType || "retail",
        taxId: userData.taxId || "",
        address: userData.address || "",
        city: userData.city || "",
        state: userData.state || "",
        zip: userData.zip || "",
        country: "USA",
        phone: userData.phone || "",
        email: userData.email,
        status: "pending"
      });
      
      // Create a merchant referral record
      // Define referral data with proper validation
      const referralData = insertMerchantReferralSchema.parse({
        affiliateId: affiliate.id,
        merchantId: merchantProfile.id,
        referralCode: referralCode,
        status: "pending"
      });
      
      const referral = await storage.createMerchantReferral(referralData);
      
      // Notify the affiliate about the referral via WebSocket
      notifyAffiliate(affiliate.userId, {
        type: 'new_referral',
        referral: {
          id: referral.id,
          name: merchantProfile.businessName,
          date: new Date().toISOString(),
          status: "pending",
          revenue: 0,
          commission: 0,
          type: 'referral',
          title: 'New Merchant Referral',
          message: `${merchantProfile.businessName} just signed up using your referral link`
        }
      });
      
      // Log the user in automatically
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed after registration" });
        }
        return res.status(201).json({ user, merchantProfile, referral });
      });
    } catch (error) {
      console.error("Error registering with referral:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid registration data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to register with referral" });
    }
  });

  // Serve documentation files
  app.use('/docs', express.static(path.join(process.cwd(), 'docs')));

  // Sitemap for SEO
  app.get("/sitemap.xml", generateSitemap);

  // Import payment gateway services
  const { paymentGatewayService, HelcimPaymentMethod, HelcimTransactionType } = await import('./services');

  // Payment Gateway API Routes
  app.get("/api/payment-gateways", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Validate user has merchant access
      const merchant = await storage.getMerchantProfileByUserId(req.user.id);
      if (!merchant) {
        return res.status(403).json({ error: "User is not associated with a merchant account" });
      }
      
      const gateways = await paymentGatewayService.getMerchantPaymentGateways(merchant.id);
      res.json(gateways);
    } catch (error) {
      console.error("Error fetching payment gateways:", error);
      res.status(500).json({ error: "Failed to fetch payment gateways" });
    }
  });

  // Get available payment gateways (for public checkout)
  app.get("/api/payment-gateways/available", async (req, res) => {
    try {
      // Import necessary modules
      const { db } = await import('./db');
      const { paymentGateways } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // For public checkout, we need to find at least one active gateway
      const availableGateways = await db
        .select()
        .from(paymentGateways)
        .where(eq(paymentGateways.isActive, true))
        .limit(5); // Limit to 5 active gateways
      
      if (!availableGateways || availableGateways.length === 0) {
        return res.status(404).json({ error: "No available payment gateways found" });
      }
      
      // Remove sensitive fields
      const safeGateways = availableGateways.map((gateway: any) => ({
        id: gateway.id,
        gatewayType: gateway.gatewayType,
        merchantId: gateway.merchantId,
        supportedPaymentMethods: gateway.supportedPaymentMethods
      }));
      
      res.json(safeGateways);
    } catch (error) {
      console.error("Error fetching available payment gateways:", error);
      res.status(500).json({ error: "Failed to fetch available payment gateways" });
    }
  });

  // Create a new payment gateway
  app.post("/api/payment-gateways", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Validate user has merchant access
      const merchant = await storage.getMerchantProfileByUserId(req.user.id);
      if (!merchant) {
        return res.status(403).json({ error: "User is not associated with a merchant account" });
      }

      // Parse request body
      const createSchema = z.object({
        gatewayType: z.enum(["stripe", "paypal", "square", "adyen", "helcim", "custom"]),
        accountId: z.string().optional(),
        apiKey: z.string().optional(),
        publicKey: z.string().optional(),
        webhookSecret: z.string().optional(),
        supportedPaymentMethods: z.array(z.string()).optional(),
        processingFeeSettings: z.any().optional(),
      });

      const validatedData = createSchema.parse(req.body);
      
      // Create payment gateway
      const gateway = await paymentGatewayService.createPaymentGateway({
        merchantId: merchant.id,
        ...validatedData,
      });
      
      res.status(201).json(gateway);
    } catch (error) {
      console.error("Error creating payment gateway:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create payment gateway" });
    }
  });

  // Get payment gateway details
  app.get("/api/payment-gateways/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid payment gateway ID" });
      }
      
      // Get gateway
      const gateway = await paymentGatewayService.getPaymentGateway(id);
      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }

      // Validate user has access to this merchant
      const merchant = await storage.getMerchantProfileByUserId(req.user.id);
      if (!merchant || merchant.id !== gateway.merchantId) {
        return res.status(403).json({ error: "Unauthorized access to payment gateway" });
      }
      
      res.json(gateway);
    } catch (error) {
      console.error("Error fetching payment gateway:", error);
      res.status(500).json({ error: "Failed to fetch payment gateway" });
    }
  });

  // Update payment gateway
  app.put("/api/payment-gateways/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid payment gateway ID" });
      }
      
      // Get gateway
      const gateway = await paymentGatewayService.getPaymentGateway(id);
      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }

      // Validate user has access to this merchant
      const merchant = await storage.getMerchantProfileByUserId(req.user.id);
      if (!merchant || merchant.id !== gateway.merchantId) {
        return res.status(403).json({ error: "Unauthorized access to payment gateway" });
      }

      // Parse request body
      const updateSchema = z.object({
        gatewayType: z.enum(["stripe", "paypal", "square", "adyen", "helcim", "custom"]).optional(),
        accountId: z.string().optional(),
        apiKey: z.string().optional(),
        publicKey: z.string().optional(),
        webhookSecret: z.string().optional(),
        isActive: z.boolean().optional(),
        supportedPaymentMethods: z.array(z.string()).optional(),
        processingFeeSettings: z.any().optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      
      // Update payment gateway
      const updatedGateway = await paymentGatewayService.updatePaymentGateway(id, validatedData);
      res.json(updatedGateway);
    } catch (error) {
      console.error("Error updating payment gateway:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update payment gateway" });
    }
  });

  // Delete payment gateway
  app.delete("/api/payment-gateways/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid payment gateway ID" });
      }
      
      // Get gateway
      const gateway = await paymentGatewayService.getPaymentGateway(id);
      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }

      // Validate user has access to this merchant
      const merchant = await storage.getMerchantProfileByUserId(req.user.id);
      if (!merchant || merchant.id !== gateway.merchantId) {
        return res.status(403).json({ error: "Unauthorized access to payment gateway" });
      }
      
      // Delete gateway
      await paymentGatewayService.deletePaymentGateway(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting payment gateway:", error);
      res.status(500).json({ error: "Failed to delete payment gateway" });
    }
  });

  // Helcim Integration API Routes
  app.post("/api/payment-gateways/:id/helcim", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const paymentGatewayId = parseInt(req.params.id);
      if (isNaN(paymentGatewayId)) {
        return res.status(400).json({ error: "Invalid payment gateway ID" });
      }
      
      // Get gateway
      const gateway = await paymentGatewayService.getPaymentGateway(paymentGatewayId);
      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }

      // Validate user has access to this merchant
      const merchant = await storage.getMerchantProfileByUserId(req.user.id);
      if (!merchant || merchant.id !== gateway.merchantId) {
        return res.status(403).json({ error: "Unauthorized access to payment gateway" });
      }

      // Parse request body
      const createSchema = z.object({
        helcimAccountId: z.string(),
        helcimApiKey: z.string(),
        helcimTerminalId: z.string().optional(),
        testMode: z.boolean().default(true),
      });

      const validatedData = createSchema.parse(req.body);
      
      // Create Helcim integration
      const integration = await paymentGatewayService.createHelcimIntegration({
        paymentGatewayId,
        merchantId: merchant.id,
        ...validatedData,
      });
      
      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating Helcim integration:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create Helcim integration" });
    }
  });

  // Update Helcim integration
  app.put("/api/payment-gateways/:id/helcim", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const paymentGatewayId = parseInt(req.params.id);
      if (isNaN(paymentGatewayId)) {
        return res.status(400).json({ error: "Invalid payment gateway ID" });
      }
      
      // Get gateway
      const gateway = await paymentGatewayService.getPaymentGateway(paymentGatewayId);
      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }

      // Validate user has access to this merchant
      const merchant = await storage.getMerchantProfileByUserId(req.user.id);
      if (!merchant || merchant.id !== gateway.merchantId) {
        return res.status(403).json({ error: "Unauthorized access to payment gateway" });
      }

      // Check if integration exists
      const existingIntegration = await paymentGatewayService.getHelcimIntegration(paymentGatewayId);
      if (!existingIntegration) {
        return res.status(404).json({ error: "Helcim integration not found" });
      }

      // Parse request body
      const updateSchema = z.object({
        helcimAccountId: z.string().optional(),
        helcimApiKey: z.string().optional(),
        helcimTerminalId: z.string().optional(),
        testMode: z.boolean().optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      
      // Update Helcim integration
      const integration = await paymentGatewayService.updateHelcimIntegration(
        paymentGatewayId, 
        validatedData
      );
      
      res.json(integration);
    } catch (error) {
      console.error("Error updating Helcim integration:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update Helcim integration" });
    }
  });

  // Get Helcim integration
  app.get("/api/payment-gateways/:id/helcim", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const paymentGatewayId = parseInt(req.params.id);
      if (isNaN(paymentGatewayId)) {
        return res.status(400).json({ error: "Invalid payment gateway ID" });
      }
      
      // Get gateway
      const gateway = await paymentGatewayService.getPaymentGateway(paymentGatewayId);
      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }

      // Validate user has access to this merchant
      const merchant = await storage.getMerchantProfileByUserId(req.user.id);
      if (!merchant || merchant.id !== gateway.merchantId) {
        return res.status(403).json({ error: "Unauthorized access to payment gateway" });
      }

      // Get integration
      const integration = await paymentGatewayService.getHelcimIntegration(paymentGatewayId);
      if (!integration) {
        return res.status(404).json({ error: "Helcim integration not found" });
      }
      
      res.json(integration);
    } catch (error) {
      console.error("Error fetching Helcim integration:", error);
      res.status(500).json({ error: "Failed to fetch Helcim integration" });
    }
  });

  // Test Helcim integration
  app.post("/api/payment-gateways/:id/helcim/test", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const paymentGatewayId = parseInt(req.params.id);
      if (isNaN(paymentGatewayId)) {
        return res.status(400).json({ error: "Invalid payment gateway ID" });
      }
      
      // Get gateway
      const gateway = await paymentGatewayService.getPaymentGateway(paymentGatewayId);
      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }

      // Validate user has access to this merchant
      const merchant = await storage.getMerchantProfileByUserId(req.user.id);
      if (!merchant || merchant.id !== gateway.merchantId) {
        return res.status(403).json({ error: "Unauthorized access to payment gateway" });
      }

      // Test integration
      const isValid = await paymentGatewayService.verifyHelcimIntegration(paymentGatewayId);
      
      res.json({ success: isValid });
    } catch (error) {
      console.error("Error testing Helcim integration:", error);
      res.status(500).json({ error: "Failed to test Helcim integration" });
    }
  });

  // Process a payment through Helcim
  app.post("/api/payment-gateways/:id/helcim/payment", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const paymentGatewayId = parseInt(req.params.id);
      if (isNaN(paymentGatewayId)) {
        return res.status(400).json({ error: "Invalid payment gateway ID" });
      }
      
      // Get gateway
      const gateway = await paymentGatewayService.getPaymentGateway(paymentGatewayId);
      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }

      // Validate user has access to this merchant
      const merchant = await storage.getMerchantProfileByUserId(req.user.id);
      if (!merchant || merchant.id !== gateway.merchantId) {
        return res.status(403).json({ error: "Unauthorized access to payment gateway" });
      }

      // Get integration
      const integration = await paymentGatewayService.getHelcimIntegration(paymentGatewayId);
      if (!integration) {
        return res.status(404).json({ error: "Helcim integration not found" });
      }

      // Parse request body
      const paymentSchema = z.object({
        amount: z.number().positive(),
        currency: z.string().optional(),
        paymentMethod: z.nativeEnum(HelcimPaymentMethod),
        transactionType: z.nativeEnum(HelcimTransactionType),
        cardToken: z.string().optional(),
        cardNumber: z.string().optional(),
        cardExpiry: z.string().optional(),
        cardCvv: z.string().optional(),
        cardHolderName: z.string().optional(),
        billingAddress: z.object({
          name: z.string().optional(),
          street1: z.string().optional(),
          street2: z.string().optional(),
          city: z.string().optional(),
          province: z.string().optional(),
          country: z.string().optional(),
          postalCode: z.string().optional(),
          phoneNumber: z.string().optional(),
          email: z.string().optional(),
        }).optional(),
        customer: z.object({
          id: z.string().optional(),
          name: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
        }).optional(),
        taxAmount: z.number().optional(),
        invoiceNumber: z.string().optional(),
        orderNumber: z.string().optional(),
        comments: z.string().optional(),
      });

      const validatedData = paymentSchema.parse(req.body);
      
      // Create Helcim service
      const helcimService = await import('./services').then(m => 
        m.createHelcimService(integration)
      );
      
      // Process payment
      const paymentResponse = await helcimService.processPayment(validatedData);
      
      // Record transaction in our system
      if (paymentResponse.success || (paymentResponse as any).approved) {
        try {
          // Check if there's a wallet specified for this merchant
          const merchantWallets = await storage.getWalletsByUserId(req.user.id);
          const defaultWallet = merchantWallets.find(w => w.walletType === "main") || merchantWallets[0];
          
          if (defaultWallet) {
            // Create a transaction record
            const transactionData: any = {
              userId: req.user.id,
              walletId: defaultWallet.id,
              amount: validatedData.amount.toString(),
              type: "incoming",
              method: "credit_card", // Using transactionMethodEnum values 
              description: `Payment via Helcim - ${paymentResponse.response?.transactionId || "Unknown"}`,
              category: "payment",
              metadata: { 
                gatewayResponse: paymentResponse,
                paymentMethod: validatedData.paymentMethod,
                customerInfo: validatedData.customer,
                transactionType: validatedData.transactionType
              }
            };
            
            await storage.createTransaction(transactionData);
            
            // Update wallet balance if needed
            const newBalance = (parseFloat(defaultWallet.balance) + validatedData.amount).toString();
            await storage.updateWalletBalance(defaultWallet.id, newBalance);
            
            // Notify via WebSocket
            broadcast(`wallet-${defaultWallet.id}`, {
              type: 'transaction',
              data: {
                amount: validatedData.amount,
                currency: validatedData.currency || "USD",
                status: "completed",
                description: `Payment received via Helcim`
              }
            });
          }
        } catch (txError) {
          console.error("Error recording transaction:", txError);
          // Don't fail the overall request if just the record keeping fails
        }
      }

      res.json(paymentResponse);
    } catch (error) {
      console.error("Error processing Helcim payment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  // WebSocket for real-time notifications

  // Set up periodic checking of orders being modified
  const ORDER_MODIFICATION_CHECK_INTERVAL = 60000; // Check every minute
  
  // Start periodic checking of order modifications
  const orderModificationInterval = setInterval(async () => {
    try {
      await processOrderModifications();
    } catch (error) {
      console.error("Error processing order modifications:", error);
    }
  }, ORDER_MODIFICATION_CHECK_INTERVAL);
  

  // SMS Provider administration routes
  app.get("/api/admin/sms-providers", (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      // Import and use directly from the module to avoid circular dependencies
      const { SmsService } = require("./services/sms");
      const smsService = new SmsService();
      const availableProviders = smsService.getAvailableProviders();

      res.json({
        active: process.env.SMS_PROVIDER || "mock",
        available: availableProviders,
        isConfigured: availableProviders.length > 0
      });
    } catch (error: any) {
      console.error("Error getting SMS providers:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/sms-providers", (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({ error: "Missing provider" });
    }

    try {
      // Import and use directly from the module to avoid circular dependencies
      const { SmsService } = require("./services/sms");
      const smsService = new SmsService();
      const success = smsService.setProvider(provider);

      if (success) {
        // Update environment variable (in memory only)
        process.env.SMS_PROVIDER = provider;
        res.json({ success: true, provider });
      } else {
        res.status(400).json({ error: "Failed to set provider" });
      }
    } catch (error: any) {
      console.error("Error setting SMS provider:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Test SMS endpoint
  app.post("/api/admin/test-sms", (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Import and use directly from the module to avoid circular dependencies
      const { SmsService } = require("./services/sms");
      const smsService = new SmsService();
      smsService.sendSms(phoneNumber, message)
        .then((success: boolean) => {
          if (success) {
            res.json({ success: true });
          } else {
            res.status(400).json({ error: "Failed to send SMS" });
          }
        })
        .catch((error: Error) => {
          throw error;
        });
    } catch (error: any) {
      console.error("Error sending test SMS:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // API endpoint to retrieve test SMS messages for development/debugging
  app.get("/api/admin/test-sms/logs", (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    const count = req.query.count ? parseInt(req.query.count as string) : 10;
    
    // Import function directly from the module to avoid circular dependencies
    const { getRecentTestMessages } = require("./services/sms");
    const logs = getRecentTestMessages(count);
    
    res.json({ 
      logs,
      provider: "mock",
      count: logs.length,
      note: "These are test messages sent via the mock SMS provider and won't appear when using an actual SMS provider."
    });
  });

  // Delivery Management API
  // -------------------------------------------------
  
  // Get all active delivery providers
  app.get("/api/delivery/providers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const providers = deliveryService.listProviders();
      res.json(providers);
    } catch (error) {
      console.error("Error fetching delivery providers:", error);
      res.status(500).json({ error: "Failed to fetch delivery providers" });
    }
  });
  
  // Get providers available for a specific region
  app.get("/api/delivery/regions/:regionId/providers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const regionId = parseInt(req.params.regionId);
      const providers = await deliveryService.getProvidersForRegion(regionId);
      res.json(providers);
    } catch (error) {
      console.error("Error fetching region delivery providers:", error);
      res.status(500).json({ error: "Failed to fetch region delivery providers" });
    }
  });
  
  // Get business delivery settings
  app.get("/api/delivery/business/:businessId/settings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const businessId = parseInt(req.params.businessId);
      
      // Check if user has access to this business
      if (req.user.role !== "admin" && req.user.businessId !== businessId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const settings = await deliveryService.getBusinessDeliverySettings(businessId);
      
      if (!settings) {
        return res.status(404).json({ error: "Delivery settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching business delivery settings:", error);
      res.status(500).json({ error: "Failed to fetch business delivery settings" });
    }
  });
  
  // Create or update business delivery settings
  app.post("/api/delivery/business/:businessId/settings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const businessId = parseInt(req.params.businessId);
      
      // Check if user has access to manage this business
      if (req.user.role !== "admin" && req.user.businessId !== businessId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const settingsData = insertBusinessDeliverySettingsSchema.parse({
        ...req.body,
        businessId
      });
      
      // TODO: Implement the createOrUpdateBusinessDeliverySettings method in deliveryService
      // For now, just returning the validated data
      res.status(200).json(settingsData);
    } catch (error) {
      console.error("Error updating business delivery settings:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid delivery settings data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update business delivery settings" });
    }
  });
  
  // Get delivery quotes for an order
  app.post("/api/delivery/quotes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { pickup, delivery, orderDetails } = req.body;
      
      if (!pickup || !delivery || !orderDetails) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const quotes = await deliveryService.getDeliveryQuotes(
        pickup, 
        delivery, 
        orderDetails
      );
      
      res.json(quotes);
    } catch (error) {
      console.error("Error getting delivery quotes:", error);
      res.status(500).json({ error: "Failed to get delivery quotes" });
    }
  });
  
  // Create a delivery order
  app.post("/api/delivery/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { orderDetails } = req.body;
      
      if (!orderDetails) {
        return res.status(400).json({ error: "Missing required orderDetails" });
      }
      
      const order = await deliveryService.createDelivery(orderDetails);
      
      // Send notification via WebSocket
      if (orderDetails.businessId) {
        broadcast(`business-${orderDetails.businessId}`, {
          type: 'delivery_order_created',
          data: order
        });
      }
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating delivery order:", error);
      res.status(500).json({ error: "Failed to create delivery order" });
    }
  });
  
  // Get delivery order details
  app.get("/api/delivery/orders/:orderId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await deliveryService.getDeliveryOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Delivery order not found" });
      }
      
      // Check if user has access to this business
      if (req.user.role !== "admin" && req.user.businessId !== order.businessId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching delivery order:", error);
      res.status(500).json({ error: "Failed to fetch delivery order" });
    }
  });
  
  // Get all delivery orders for a business
  app.get("/api/delivery/business/:businessId/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const businessId = parseInt(req.params.businessId);
      
      // Check if user has access to this business
      if (req.user.role !== "admin" && req.user.businessId !== businessId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Parse query parameters
      const { startDate, endDate, status } = req.query;
      
      // Convert string dates to Date objects if provided
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      // Validate status if provided
      let validatedStatus: any = undefined;
      if (status && typeof status === 'string') {
        try {
          validatedStatus = deliveryStatusEnum.enum[status as any];
        } catch (e) {
          return res.status(400).json({ error: "Invalid status" });
        }
      }
      
      const orders = await deliveryService.getBusinessDeliveryOrders(
        businessId,
        start,
        end,
        validatedStatus
      );
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching business delivery orders:", error);
      res.status(500).json({ error: "Failed to fetch business delivery orders" });
    }
  });
  
  // Update delivery order status
  app.patch("/api/delivery/orders/:orderId/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const orderId = parseInt(req.params.orderId);
      const { status, driverInfo } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      // Validate status
      try {
        deliveryStatusEnum.enum[status as any];
      } catch (e) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const order = await deliveryService.getDeliveryOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Delivery order not found" });
      }
      
      // Check if user has access to this business
      if (req.user.role !== "admin" && req.user.businessId !== order.businessId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const updatedOrder = await deliveryService.updateDeliveryOrderStatus(
        orderId,
        status,
        driverInfo
      );
      
      // Send notification via WebSocket
      broadcast(`business-${order.businessId}`, {
        type: 'delivery_order_updated',
        data: updatedOrder
      });
      
      broadcast(`delivery-order-${orderId}`, {
        type: 'status_updated',
        status: status,
        order: updatedOrder
      });
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating delivery order status:", error);
      res.status(500).json({ error: "Failed to update delivery order status" });
    }
  });
  
  // Cancel delivery order
  app.post("/api/delivery/orders/:orderId/cancel", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await deliveryService.getDeliveryOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Delivery order not found" });
      }
      
      // Check if user has access to this business
      if (req.user.role !== "admin" && req.user.businessId !== order.businessId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Check if order is in a cancellable state
      const cancellableStates = ['pending', 'accepted', 'assigned'];
      if (!cancellableStates.includes(order.status)) {
        return res.status(400).json({ 
          error: "Cannot cancel order in current state", 
          status: order.status 
        });
      }
      
      // Find the order in the database with its provider details
      const { db } = await import('./db');
      const { deliveryOrders, deliveryProviders } = await import('@shared/delivery-schema');
      const { eq } = await import('drizzle-orm');
      
      // Get provider ID for the order
      const [deliveryOrderWithProvider] = await db
        .select()
        .from(deliveryOrders)
        .where(eq(deliveryOrders.id, orderId));
        
      if (!deliveryOrderWithProvider || !deliveryOrderWithProvider.providerId) {
        return res.status(404).json({ error: "Delivery order provider information not found" });
      }
      
      const cancelledOrder = await deliveryService.cancelDelivery(
        deliveryOrderWithProvider.providerId, 
        order.externalOrderId
      );
      
      // Send notification via WebSocket
      broadcast(`business-${order.businessId}`, {
        type: 'delivery_order_cancelled',
        data: cancelledOrder
      });
      
      broadcast(`delivery-order-${orderId}`, {
        type: 'status_updated',
        status: 'cancelled',
        order: cancelledOrder
      });
      
      res.json(cancelledOrder);
    } catch (error) {
      console.error("Error cancelling delivery order:", error);
      res.status(500).json({ error: "Failed to cancel delivery order" });
    }
  });
  
  // Webhook endpoint for delivery providers
  app.post("/api/delivery/webhook/:provider", async (req, res) => {
    try {
      const providerName = req.params.provider;
      
      // Import the necessary modules
      const { db } = await import('./db');
      const { 
        deliveryProviders, 
        deliveryOrders 
      } = await import('@shared/delivery-schema');
      const { and, eq } = await import('drizzle-orm');
      const deliveryService = (await import('./services/delivery/delivery-service')).default;
      
      // Find the provider by name
      const [provider] = await db
        .select()
        .from(deliveryProviders)
        .where(
          and(
            eq(deliveryProviders.name, providerName),
            eq(deliveryProviders.isActive, true)
          )
        );
      
      if (!provider) {
        return res.status(404).json({ error: `Provider "${providerName}" not found` });
      }
      
      // Get the adapter for the provider
      const adapter = deliveryService.getProviderAdapter(provider.id);
      if (!adapter) {
        return res.status(400).json({ error: `No adapter available for provider "${providerName}"` });
      }
      
      // Verify webhook signature if applicable
      const signature = req.headers['x-delivery-signature'] || 
                       req.headers['x-doordash-signature'] ||
                       req.headers['signature'];
                       
      if (provider.webhookSecret && signature) {
        const isValid = await adapter.verifyWebhookSignature(
          req.body,
          req.headers as Record<string, string>,
          provider.webhookSecret
        );
        
        if (!isValid) {
          return res.status(401).json({ error: "Invalid webhook signature" });
        }
      }
      
      // Parse webhook data
      const webhookData = await adapter.parseWebhookData(
        req.body,
        req.headers as Record<string, string>
      );
      
      // Find the delivery order by external ID
      const [deliveryOrder] = await db
        .select()
        .from(deliveryOrders)
        .where(eq(deliveryOrders.externalOrderId, webhookData.externalOrderId));
      
      if (!deliveryOrder) {
        return res.status(404).json({ error: `Delivery order with external ID "${webhookData.externalOrderId}" not found` });
      }
      
      // Update the order status
      await deliveryService.updateDeliveryOrderStatus(
        deliveryOrder.id,
        webhookData.status,
        webhookData.driverInfo
      );
      
      // Send a real-time notification via WebSocket
      broadcast(`business-${deliveryOrder.businessId}`, {
        type: "delivery_update",
        data: {
          orderId: deliveryOrder.orderId,
          deliveryOrderId: deliveryOrder.id,
          status: webhookData.status,
          driverInfo: webhookData.driverInfo,
          timestamp: webhookData.timestamp
        }
      });
      
      // Acknowledge receipt
      res.status(200).json({ status: "processed" });
    } catch (error) {
      console.error("Error processing delivery webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });
  
  // End of Delivery Management API
  // -------------------------------------------------
  
  // Test API Endpoints
  // -------------------------------------------------
  
  // Run comprehensive test suite
  app.post("/api/tests/run", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Only admins can run tests
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Only admins can run tests" });
    }
    
    try {
      const { suite, format = 'json' } = req.body;
      
      // Import test coordinator
      const { testCoordinator } = await import('./services/testing/test-coordinator');
      
      let report;
      if (suite) {
        // Run specific test suite
        report = await testCoordinator.runTestSuite(suite);
        
        if (!report) {
          return res.status(404).json({ error: `Test suite not found: ${suite}` });
        }
      } else {
        // Run all test suites
        report = await testCoordinator.runAllTests();
      }
      
      // Generate report in requested format
      const formats = (Array.isArray(format) ? format : [format]) as ('console' | 'html' | 'json')[];
      const reportPaths = testCoordinator.saveReports(report, formats);
      
      // Return report summary
      res.json({
        passed: report.passed,
        timestamp: report.timestamp,
        testGroups: report.testGroups.map(group => ({
          name: group.name,
          passed: group.passed,
          testCount: group.tests.length,
          failedTests: group.tests.filter(test => !test.passed).length
        })),
        reportPaths
      });
    } catch (error) {
      console.error("Error running tests:", error);
      res.status(500).json({ error: "Failed to run tests" });
    }
  });
  
  // Get available test suites (no auth required for testing purposes)
  app.get("/api/tests/suites", async (req, res) => {
    try {
      // Import test coordinator
      const { testCoordinator } = await import('./services/testing/test-coordinator');
      
      // Get available test suites
      const suites = testCoordinator.getAvailableTestSuites();
      
      res.json({ suites });
    } catch (error) {
      console.error("Error getting test suites:", error);
      res.status(500).json({ error: "Failed to get test suites" });
    }
  });
  
  // Run a specific test suite (no auth required for testing)
  app.get("/api/tests/run/:suiteName", async (req, res) => {
    try {
      const suiteName = req.params.suiteName;
      
      // Import test coordinator
      const { testCoordinator } = await import('./services/testing/test-coordinator');
      
      // Run test suite
      const report = await testCoordinator.runTestSuite(suiteName);
      
      if (!report) {
        return res.status(404).json({ error: "Test suite not found" });
      }
      
      // Save report to disk
      const reportPaths = testCoordinator.saveReports(report, ['html', 'json']);
      
      // Return simplified report
      res.json({
        name: report.name,
        passed: report.passed,
        timestamp: report.timestamp,
        testGroups: report.testGroups.map(group => ({
          name: group.name,
          passed: group.passed,
          testCount: group.tests.length,
          passedTests: group.tests.filter(t => t.passed).length
        })),
        reportPaths
      });
    } catch (error) {
      console.error("Error running test suite:", error);
      res.status(500).json({ error: "Failed to run test suite" });
    }
  });
  
  // View test report (no auth required for testing purposes)
  app.get("/api/tests/reports/:reportName", async (req, res) => {
    
    try {
      const reportName = req.params.reportName;
      const format = req.query.format as string || 'html';
      
      // Import fs and path
      const fs = await import('fs');
      const path = await import('path');
      
      // Construct report path
      const reportPath = path.join(process.cwd(), 'test-reports', reportName);
      
      // Check if report exists
      if (!fs.existsSync(reportPath)) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      // Read report
      const reportContent = fs.readFileSync(reportPath, 'utf-8');
      
      // Set content type based on format
      if (format === 'html' || reportName.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html');
      } else if (format === 'json' || reportName.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json');
      } else {
        res.setHeader('Content-Type', 'text/plain');
      }
      
      res.send(reportContent);
    } catch (error) {
      console.error("Error viewing test report:", error);
      res.status(500).json({ error: "Failed to view test report" });
    }
  });
  
  // End of Test API
  // -------------------------------------------------
  
  // Health Check API
  // -------------------------------------------------
  
  // Simple health check endpoint for automated monitoring
  app.get("/api/health", (req, res) => {
    const healthCheck = {
      uptime: process.uptime(),
      status: 'OK',
      timestamp: Date.now()
    };
    
    try {
      res.json(healthCheck);
    } catch (error) {
      healthCheck.status = 'ERROR';
      res.status(503).json(healthCheck);
    }
  });
  
  // End of Health Check API
  // -------------------------------------------------

  const httpServer = createServer(app);

  // Public Payment Processing API Endpoint for Helcim
  app.post('/api/payment-gateways/:id/helcim/payment', async (req, res) => {
    try {
      const { id } = req.params;
      const paymentGatewayId = parseInt(id);
      
      if (isNaN(paymentGatewayId)) {
        return res.status(400).json({ error: "Invalid payment gateway ID" });
      }
      
      // Get the payment gateway
      const gateway = await paymentGatewayService.getPaymentGateway(paymentGatewayId);
      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }
      
      // Get the Helcim integration
      const helcimIntegration = await paymentGatewayService.getHelcimIntegration(paymentGatewayId);
      if (!helcimIntegration) {
        return res.status(404).json({ error: "Helcim integration not found for this gateway" });
      }
      
      // Import services and create Helcim service
      const { createHelcimService, HelcimPaymentMethod, HelcimTransactionType } = await import('./services');
      const helcimService = createHelcimService(helcimIntegration);
      
      // Process the payment
      const paymentData = req.body;
      
      // Transform the payment method if needed
      let paymentMethod = paymentData.paymentMethod;
      if (paymentMethod === 'creditCard') {
        paymentMethod = HelcimPaymentMethod.CREDIT_CARD;
      } else if (paymentMethod === 'bankAccount') {
        paymentMethod = HelcimPaymentMethod.BANK_ACCOUNT;
      }
      
      // Transform the transaction type if needed
      let transactionType = paymentData.transactionType;
      if (transactionType === 'purchase') {
        transactionType = HelcimTransactionType.PURCHASE;
      } else if (transactionType === 'preAuth') {
        transactionType = HelcimTransactionType.PRE_AUTHORIZATION;
      }
      
      // Build the request object for Helcim
      const helcimPaymentRequest = {
        amount: parseFloat(paymentData.amount),
        currency: paymentData.currency || 'USD',
        paymentMethod,
        transactionType,
        cardNumber: paymentData.cardNumber,
        cardExpiry: paymentData.cardExpiry,
        cardCvv: paymentData.cardCvv,
        cardHolderName: paymentData.cardHolderName,
        billingAddress: paymentData.billingAddress,
        customer: paymentData.customer,
        invoiceNumber: paymentData.invoiceNumber,
        orderNumber: paymentData.orderNumber,
        comments: paymentData.comments,
      };
      
      // Process the payment with Helcim
      const paymentResponse = await helcimService.processPayment(helcimPaymentRequest);
      
      // Record the transaction in our database
      if (paymentResponse.success) {
        try {
          // Import db and schema for transaction storage
          const { db } = await import('./db');
          const { merchantTransactions } = await import('@shared/schema');
          
          // Store transaction details
          const transactionData = {
            merchantId: gateway.merchantId,
            paymentGatewayId: gateway.id,
            amount: String(paymentResponse.response.amount),
            currency: paymentResponse.response.currency,
            paymentMethod: paymentData.paymentMethod,
            status: paymentResponse.success ? 'completed' : 'failed',
            externalId: paymentResponse.response.transactionId,
            description: paymentData.comments || 'Payment processed via Helcim',
            metadata: JSON.stringify({
              responseDetails: paymentResponse.response,
            }),
            customerInfo: JSON.stringify(paymentData.customer || {}),
          };
          
          // Insert transaction record
          await db.insert(merchantTransactions).values([transactionData]);
          console.log('Transaction recorded successfully:', transactionData.externalId);
        } catch (transactionError: any) {
          // Log error but don't fail the payment processing
          console.error('Error recording transaction:', transactionError?.message || transactionError);
        }
      }
      
      // Return the response to the client
      return res.json(paymentResponse);
    } catch (error: any) {
      console.error('Error processing payment:', error);
      return res.status(500).json({
        success: false,
        error: 'Payment processing failed',
        notice: error?.message || 'An unknown error occurred'
      });
    }
  });

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store WebSocket server in global scope for use in broadcast functions
  (global as any).wss = wss;
  
  // Track active visitors for affiliates
  const activeVisitors: Record<string, number> = {};
  
  // Send periodic stats to all connected affiliate users
  setInterval(() => {
    wss.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (
        extClient.readyState === WebSocket.OPEN &&
        extClient.isAffiliate &&
        extClient.channels?.includes('affiliate')
      ) {
        // Get active visitors for this affiliate
        const visitorCount = activeVisitors[`affiliate-${extClient.affiliateId}`] || 0;
        
        // Send real-time stats update
        extClient.send(JSON.stringify({
          type: 'stats_update',
          stats: {
            activeVisitors: visitorCount,
            // Other stats could be fetched from storage
          }
        }));
      }
    });
  }, 30000); // Every 30 seconds
  
  // Simulate some visitor activity for demo purposes
  setInterval(() => {
    wss.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (
        extClient.readyState === WebSocket.OPEN &&
        extClient.isAffiliate &&
        extClient.channels?.includes('affiliate')
      ) {
        const affiliateId = extClient.affiliateId;
        if (!affiliateId) return;
        
        // Simulate visitor activity
        const eventTypes = ['pageview', 'click', 'form_start', 'signup_started', 'merchant_registration'];
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const isConversion = randomEvent === 'merchant_registration';
        
        // Visitor tracking for this affiliate
        const visitorKey = `affiliate-${affiliateId}`;
        if (!activeVisitors[visitorKey]) {
          activeVisitors[visitorKey] = 0;
        }
        
        // Create random activity (only for demo purposes)
        const locations = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco'];
        const pages = ['Home Page', 'Pricing', 'Features', 'About Us', 'Contact'];
        const sources = ['Google', 'Facebook', 'Direct', 'Twitter', 'LinkedIn'];
        
        // Don't increase too much to be realistic
        if (Math.random() > 0.8) {
          activeVisitors[visitorKey] += 1;
        }
        
        extClient.send(JSON.stringify({
          type: 'visitor_activity',
          activity: {
            event: randomEvent,
            isConversion,
            details: `Visitor from ${locations[Math.floor(Math.random() * locations.length)]} viewed ${pages[Math.floor(Math.random() * pages.length)]} via ${sources[Math.floor(Math.random() * sources.length)]}`,
            time: new Date().toISOString()
          },
          activeVisitors: activeVisitors[visitorKey]
        }));
      }
    });
  }, 15000); // Every 15 seconds

  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.channels = [];
    ws.lastActivity = Date.now();

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'subscribe') {
          if (!ws.channels) ws.channels = [];
          
          // Add channel to subscription list
          if (data.channel && !ws.channels.includes(data.channel)) {
            ws.channels.push(data.channel);
            ws.send(JSON.stringify({ type: 'subscribed', channel: data.channel }));
            
            // Special handling for affiliate dashboard
            if (data.channel === 'affiliate' && data.userId) {
              ws.userId = data.userId;
              
              // Lookup affiliate profile
              const profile = await storage.getAffiliateProfileByUserId(data.userId);
              if (profile) {
                ws.isAffiliate = true;
                ws.affiliateId = profile.id;
                
                // Initialize visitor count
                const visitorKey = `affiliate-${profile.id}`;
                if (!activeVisitors[visitorKey]) {
                  activeVisitors[visitorKey] = Math.floor(Math.random() * 20) + 5; // Random initial count
                }
                
                // Send initial stats
                ws.send(JSON.stringify({
                  type: 'stats_update',
                  stats: {
                    activeVisitors: activeVisitors[visitorKey],
                    totalReferrals: (await storage.getMerchantReferralsByAffiliateId(profile.id)).length,
                  }
                }));
              }
            }
            
            // Special handling for employer wallet
            if (data.channel === 'employer_wallet' && data.userId) {
              ws.userId = data.userId;
              
              try {
                // Check if user is an employer
                const user = await storage.getUser(data.userId);
                if (user && user.role === 'employer') {
                  ws.isEmployer = true;
                  
                  // Send initial data
                  ws.send(JSON.stringify({
                    type: 'connected',
                    role: 'employer',
                    timestamp: new Date().toISOString()
                  }));
                  
                  // Get pending expense reports
                  const pendingReports = await storage.getPendingExpenseReportsByEmployerId(data.userId);
                  
                  if (pendingReports.length > 0) {
                    ws.send(JSON.stringify({
                      type: 'expense_reports_pending',
                      count: pendingReports.length,
                      reports: pendingReports.map(report => ({
                        id: report.id,
                        title: report.title,
                        totalAmount: report.totalAmount,
                        submissionDate: report.submissionDate,
                        employeeId: report.userId
                      }))
                    }));
                  }
                }
              } catch (error) {
                console.error('Error setting up employer wallet channel:', error);
              }
            }
            
            // Special handling for employee wallet
            if (data.channel === 'employee_wallet' && data.userId) {
              ws.userId = data.userId;
              
              try {
                // Check if user is an employee
                const user = await storage.getUser(data.userId);
                if (user && user.role === 'employee') {
                  ws.isEmployee = true;
                  
                  // Send initial data
                  ws.send(JSON.stringify({
                    type: 'connected',
                    role: 'employee',
                    timestamp: new Date().toISOString()
                  }));
                  
                  // Get expense reports
                  const expenseReports = await storage.getExpenseReportsByUserId(data.userId);
                  
                  if (expenseReports.length > 0) {
                    ws.send(JSON.stringify({
                      type: 'expense_reports_status',
                      reports: expenseReports.map(report => ({
                        id: report.id,
                        title: report.title,
                        totalAmount: report.totalAmount,
                        status: report.status,
                        submissionDate: report.submissionDate,
                        reviewDate: report.reviewDate,
                        paymentDate: report.paymentDate
                      }))
                    }));
                  }
                }
              } catch (error) {
                console.error('Error setting up employee wallet channel:', error);
              }
            }
          }
        } else if (data.type === 'unsubscribe' && data.channel) {
          if (ws.channels) {
            ws.channels = ws.channels.filter(ch => ch !== data.channel);
            ws.send(JSON.stringify({ type: 'unsubscribed', channel: data.channel }));
          }
        }
        
        ws.lastActivity = Date.now();
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    // Clean up on disconnect
    ws.on('close', () => {
      if (ws.isAffiliate && ws.affiliateId) {
        // Reduce active visitor count gradually when affiliate disconnects
        const visitorKey = `affiliate-${ws.affiliateId}`;
        if (activeVisitors[visitorKey]) {
          // Reduce by 30% but keep some visitors
          activeVisitors[visitorKey] = Math.max(
            Math.floor(activeVisitors[visitorKey] * 0.7), 
            3
          );
        }
      }
    });
    
    // Send ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  });

  // Broadcast helper function
  const broadcast = (channel: string, data: any) => {
    wss.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (extClient.readyState === WebSocket.OPEN && extClient.channels?.includes(channel)) {
        extClient.send(JSON.stringify(data));
      }
    });
  };
  
  // Helper function to notify affiliate about specific events
  const notifyAffiliate = (affiliateUserId: number, data: any) => {
    wss.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (
        extClient.readyState === WebSocket.OPEN &&
        extClient.userId === affiliateUserId &&
        extClient.channels?.includes('affiliate')
      ) {
        extClient.send(JSON.stringify(data));
      }
    });
  };
  
  // Helper function to notify employer about expense reports
  const notifyEmployer = (employerId: number, data: any) => {
    console.log(`Notifying employer (ID: ${employerId}) about:`, data.type);
    wss.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (
        extClient.readyState === WebSocket.OPEN &&
        extClient.userId === employerId &&
        extClient.isEmployer &&
        extClient.channels?.includes('employer_wallet')
      ) {
        extClient.send(JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          priority: data.type.includes('new') ? 'high' : 'normal'
        }));
      }
    });
  };
  
  // Helper function to notify employee about expense reports
  const notifyEmployee = (employeeId: number, data: any) => {
    console.log(`Notifying employee (ID: ${employeeId}) about:`, data.type);
    wss.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (
        extClient.readyState === WebSocket.OPEN &&
        extClient.userId === employeeId &&
        extClient.isEmployee &&
        extClient.channels?.includes('employee_wallet')
      ) {
        extClient.send(JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          priority: data.type.includes('status_update') ? 'high' : 'normal'
        }));
      }
    });
  };
  
  // Helper function to notify about expense report line item changes
  const notifyExpenseLineItemChange = (reportInfo: { userId: number, employerId: number }, itemData: any, action: 'added' | 'updated' | 'deleted') => {
    // Notify the employee (owner of the report)
    notifyEmployee(reportInfo.userId, {
      type: `expense_line_item_${action}`,
      item: itemData,
      reportId: itemData.expenseReportId
    });
    
    // If the report is submitted, also notify the employer
    if (reportInfo.employerId && ['submitted', 'under_review'].includes(itemData.reportStatus)) {
      notifyEmployer(reportInfo.employerId, {
        type: `expense_line_item_${action}`,
        item: itemData,
        reportId: itemData.expenseReportId,
        employeeId: reportInfo.userId
      });
    }
  };

  // Helper function to notify a parent about child wallet activities
  const notifyParent = (parentId: number, data: any) => {
    console.log(`Notifying parent (ID: ${parentId}) about:`, data.type);
    wss.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (
        extClient.readyState === WebSocket.OPEN &&
        extClient.userId === parentId
      ) {
        extClient.send(JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          priority: data.type.includes('request') ? 'high' : 'normal'
        }));
      }
    });
  };

  // Helper function to notify a child about wallet activities
  const notifyChild = (childId: number, data: any) => {
    console.log(`Notifying child (ID: ${childId}) about:`, data.type);
    wss.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (
        extClient.readyState === WebSocket.OPEN &&
        extClient.userId === childId
      ) {
        extClient.send(JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          priority: data.type.includes('allowance') || data.type.includes('approved') ? 'high' : 'normal'
        }));
      }
    });
  };

  // PARENT-CHILD WALLET SYSTEM APIs
  
  // Family Group APIs
  app.post("/api/family-groups", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const familyGroupData = insertFamilyGroupSchema.parse({
        ...req.body,
        parentUserId: req.user.id,
      });
      
      const familyGroup = await storage.createFamilyGroup(familyGroupData);
      res.status(201).json(familyGroup);
    } catch (error) {
      console.error("Error creating family group:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid family group data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create family group" });
    }
  });
  
  app.get("/api/family-groups", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const familyGroups = await storage.getFamilyGroupsByParentId(req.user.id);
      res.json(familyGroups);
    } catch (error) {
      console.error("Error fetching family groups:", error);
      res.status(500).json({ error: "Failed to fetch family groups" });
    }
  });
  
  app.get("/api/family-groups/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const groupId = parseInt(req.params.id);
      const familyGroup = await storage.getFamilyGroup(groupId);
      
      if (!familyGroup) {
        return res.status(404).json({ error: "Family group not found" });
      }
      
      if (familyGroup.parentUserId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const familyMembers = await storage.getFamilyMembersByGroupId(groupId);
      
      res.json({
        ...familyGroup,
        members: familyMembers
      });
    } catch (error) {
      console.error("Error fetching family group:", error);
      res.status(500).json({ error: "Failed to fetch family group" });
    }
  });
  
  // Family Member (Child Account) APIs
  app.post("/api/family-members", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Verify the family group belongs to the user
      const familyGroup = await storage.getFamilyGroup(req.body.familyGroupId);
      if (!familyGroup || familyGroup.parentUserId !== req.user.id) {
        return res.status(403).json({ error: "Invalid family group" });
      }
      
      const familyMemberData = insertFamilyMemberSchema.parse(req.body);
      
      // Create child account with its wallet
      const familyMember = await storage.createFamilyMember(familyMemberData);
      
      // Create wallet for child
      const walletData = insertWalletSchema.parse({
        name: `${familyMember.name}'s Wallet`,
        type: "child",
        currency: "USD",
        balance: "0.00",
        userId: familyMember.userId,
        childId: familyMember.id
      });
      
      const wallet = await storage.createWallet(walletData);
      
      res.status(201).json({
        ...familyMember,
        wallet
      });
    } catch (error) {
      console.error("Error creating family member:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid family member data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create family member" });
    }
  });
  
  app.get("/api/family-members", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const familyMembers = await storage.getFamilyMembersByParentId(req.user.id);
      res.json(familyMembers);
    } catch (error) {
      console.error("Error fetching family members:", error);
      res.status(500).json({ error: "Failed to fetch family members" });
    }
  });
  
  app.get("/api/family-members/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const memberId = parseInt(req.params.id);
      const familyMember = await storage.getFamilyMember(memberId);
      
      if (!familyMember) {
        return res.status(404).json({ error: "Family member not found" });
      }
      
      // Check if user is the parent
      const familyGroup = await storage.getFamilyGroup(familyMember.familyGroupId);
      if (!familyGroup || familyGroup.parentUserId !== req.user.id) {
        // Check if user is the child account
        if (familyMember.userId !== req.user.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }
      
      res.json(familyMember);
    } catch (error) {
      console.error("Error fetching family member:", error);
      res.status(500).json({ error: "Failed to fetch family member" });
    }
  });
  
  // Allowance APIs
  app.post("/api/allowances", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Verify the child account belongs to the parent
      const childId = req.body.childId;
      const familyMember = await storage.getFamilyMember(childId);
      
      if (!familyMember) {
        return res.status(404).json({ error: "Child account not found" });
      }
      
      const familyGroup = await storage.getFamilyGroup(familyMember.familyGroupId);
      if (!familyGroup || familyGroup.parentUserId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const allowanceData = insertAllowanceSchema.parse({
        ...req.body,
        parentId: req.user.id
      });
      
      const allowance = await storage.createAllowance(allowanceData);
      
      // Notify the child about the allowance setup
      notifyChild(familyMember.userId, {
        type: 'allowance_created',
        data: allowance
      });
      
      res.status(201).json(allowance);
    } catch (error) {
      console.error("Error creating allowance:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid allowance data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create allowance" });
    }
  });
  
  app.get("/api/children/:childId/allowance", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const childId = parseInt(req.params.childId);
      const familyMember = await storage.getFamilyMember(childId);
      
      if (!familyMember) {
        return res.status(404).json({ error: "Child account not found" });
      }
      
      // Check if user is the parent or the child
      const familyGroup = await storage.getFamilyGroup(familyMember.familyGroupId);
      const isParent = familyGroup && familyGroup.parentUserId === req.user.id;
      const isChild = familyMember.userId === req.user.id;
      
      if (!isParent && !isChild) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const allowance = await storage.getAllowanceByChildId(childId);
      
      if (!allowance) {
        return res.status(404).json({ error: "Allowance not found" });
      }
      
      res.json(allowance);
    } catch (error) {
      console.error("Error fetching allowance:", error);
      res.status(500).json({ error: "Failed to fetch allowance" });
    }
  });
  
  app.patch("/api/allowances/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const allowanceId = parseInt(req.params.id);
      const allowance = await storage.getAllowance(allowanceId);
      
      if (!allowance) {
        return res.status(404).json({ error: "Allowance not found" });
      }
      
      if (allowance.parentId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const updatedAllowance = await storage.updateAllowance(allowanceId, req.body);
      
      // Get the child's user ID to send notification
      const familyMember = await storage.getFamilyMember(allowance.childId);
      if (familyMember) {
        notifyChild(familyMember.userId, {
          type: 'allowance_updated',
          data: updatedAllowance
        });
      }
      
      res.json(updatedAllowance);
    } catch (error) {
      console.error("Error updating allowance:", error);
      res.status(500).json({ error: "Failed to update allowance" });
    }
  });
  
  // Spending Rules APIs
  app.post("/api/children/:childId/spending-rules", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const childId = parseInt(req.params.childId);
      const familyMember = await storage.getFamilyMember(childId);
      
      if (!familyMember) {
        return res.status(404).json({ error: "Child account not found" });
      }
      
      const familyGroup = await storage.getFamilyGroup(familyMember.familyGroupId);
      if (!familyGroup || familyGroup.parentUserId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const spendingRules = await storage.createSpendingRules(childId, req.body);
      
      // Notify the child about spending rules update
      notifyChild(familyMember.userId, {
        type: 'spending_rules_updated',
        data: spendingRules
      });
      
      res.status(201).json(spendingRules);
    } catch (error) {
      console.error("Error creating spending rules:", error);
      res.status(500).json({ error: "Failed to create spending rules" });
    }
  });
  
  app.get("/api/children/:childId/spending-rules", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const childId = parseInt(req.params.childId);
      const familyMember = await storage.getFamilyMember(childId);
      
      if (!familyMember) {
        return res.status(404).json({ error: "Child account not found" });
      }
      
      // Check if user is the parent or the child
      const familyGroup = await storage.getFamilyGroup(familyMember.familyGroupId);
      const isParent = familyGroup && familyGroup.parentUserId === req.user.id;
      const isChild = familyMember.userId === req.user.id;
      
      if (!isParent && !isChild) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const spendingRules = await storage.getSpendingRulesByChildId(childId);
      
      if (!spendingRules) {
        return res.status(404).json({ error: "Spending rules not found" });
      }
      
      res.json(spendingRules);
    } catch (error) {
      console.error("Error fetching spending rules:", error);
      res.status(500).json({ error: "Failed to fetch spending rules" });
    }
  });
  
  app.patch("/api/children/:childId/spending-rules", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const childId = parseInt(req.params.childId);
      const familyMember = await storage.getFamilyMember(childId);
      
      if (!familyMember) {
        return res.status(404).json({ error: "Child account not found" });
      }
      
      const familyGroup = await storage.getFamilyGroup(familyMember.familyGroupId);
      if (!familyGroup || familyGroup.parentUserId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Get the spending rules for this child
      const spendingRules = await storage.getSpendingRulesByChildId(childId);
      
      if (!spendingRules) {
        return res.status(404).json({ error: "Spending rules not found for this child" });
      }
      
      const updatedRules = await storage.updateSpendingRules(spendingRules.id, req.body);
      
      // Notify the child about spending rules update
      notifyChild(familyMember.userId, {
        type: 'spending_rules_updated',
        data: updatedRules
      });
      
      res.json(updatedRules);
    } catch (error) {
      console.error("Error updating spending rules:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid spending rules data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update spending rules" });
    }
  });
  
  // Spending Requests APIs
  app.post("/api/spending-requests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Verify this is a child account
      const childAccount = await storage.getFamilyMemberByUserId(req.user.id);
      
      if (!childAccount) {
        return res.status(403).json({ error: "Only child accounts can create spending requests" });
      }
      
      const spendingRequestData = insertSpendingRequestSchema.parse({
        ...req.body,
        childId: childAccount.id,
        status: "pending",
        requestDate: new Date().toISOString()
      });
      
      const spendingRequest = await storage.createSpendingRequest(spendingRequestData);
      
      // Get parent info to send notification
      const familyGroup = await storage.getFamilyGroup(childAccount.familyGroupId);
      if (familyGroup) {
        notifyParent(familyGroup.parentUserId, {
          type: 'new_spending_request',
          data: {
            ...spendingRequest,
            childName: childAccount.displayName || "Child"
          }
        });
      }
      
      res.status(201).json(spendingRequest);
    } catch (error) {
      console.error("Error creating spending request:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid spending request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create spending request" });
    }
  });
  
  app.get("/api/spending-requests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // For parent: get all requests from their children
      // For child: get all their requests
      const childAccount = await storage.getFamilyMemberByUserId(req.user.id);
      
      let spendingRequests;
      
      if (childAccount) {
        // This is a child account, get their requests
        spendingRequests = await storage.getSpendingRequestsByChildId(childAccount.id);
      } else {
        // Assume this is a parent, get requests from all their children
        const familyGroups = await storage.getFamilyGroupsByParentId(req.user.id);
        if (!familyGroups || familyGroups.length === 0) {
          return res.json([]);
        }
        
        const familyGroupIds = familyGroups.map(group => group.id);
        const childrenIds = await storage.getFamilyMemberIdsByGroupIds(familyGroupIds);
        
        if (childrenIds.length === 0) {
          return res.json([]);
        }
        
        spendingRequests = await storage.getSpendingRequestsByChildrenIds(childrenIds);
      }
      
      res.json(spendingRequests);
    } catch (error) {
      console.error("Error fetching spending requests:", error);
      res.status(500).json({ error: "Failed to fetch spending requests" });
    }
  });
  
  app.patch("/api/spending-requests/:id/approve", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const requestId = parseInt(req.params.id);
      const spendingRequest = await storage.getSpendingRequest(requestId);
      
      if (!spendingRequest) {
        return res.status(404).json({ error: "Spending request not found" });
      }
      
      // Verify user is the parent of this child
      const childAccount = await storage.getFamilyMember(spendingRequest.childId);
      if (!childAccount) {
        return res.status(404).json({ error: "Child account not found" });
      }
      
      const familyGroup = await storage.getFamilyGroup(childAccount.familyGroupId);
      if (!familyGroup || familyGroup.parentUserId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { parentNote } = req.body;
      
      const approvedRequest = await storage.updateSpendingRequestStatus(
        requestId, 
        "approved", 
        new Date().toISOString(),
        parentNote
      );
      
      // Notify the child about approval
      notifyChild(childAccount.userId, {
        type: 'spending_request_approved',
        data: approvedRequest
      });
      
      res.json(approvedRequest);
    } catch (error) {
      console.error("Error approving spending request:", error);
      res.status(500).json({ error: "Failed to approve spending request" });
    }
  });
  
  app.patch("/api/spending-requests/:id/reject", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const requestId = parseInt(req.params.id);
      const spendingRequest = await storage.getSpendingRequest(requestId);
      
      if (!spendingRequest) {
        return res.status(404).json({ error: "Spending request not found" });
      }
      
      // Verify user is the parent of this child
      const childAccount = await storage.getFamilyMember(spendingRequest.childId);
      if (!childAccount) {
        return res.status(404).json({ error: "Child account not found" });
      }
      
      const familyGroup = await storage.getFamilyGroup(childAccount.familyGroupId);
      if (!familyGroup || familyGroup.parentUserId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { parentNote } = req.body;
      
      const rejectedRequest = await storage.updateSpendingRequestStatus(
        requestId, 
        "rejected", 
        new Date().toISOString(),
        parentNote
      );
      
      // Notify the child about rejection
      notifyChild(childAccount.userId, {
        type: 'spending_request_rejected',
        data: rejectedRequest
      });
      
      res.json(rejectedRequest);
    } catch (error) {
      console.error("Error rejecting spending request:", error);
      res.status(500).json({ error: "Failed to reject spending request" });
    }
  });
  
  // Savings Goals APIs
  app.post("/api/savings-goals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Determine if this is a child or parent
      const childAccount = await storage.getFamilyMemberByUserId(req.user.id);
      
      let savingsGoalData;
      
      if (childAccount) {
        // Child is creating their own goal
        savingsGoalData = insertSavingsGoalSchema.parse({
          ...req.body,
          childId: childAccount.id,
          creatorType: "child",
          createdAt: new Date().toISOString(),
          isCompleted: false
        });
      } else if (req.body.childId) {
        // Parent is creating a goal for child
        const targetChild = await storage.getFamilyMember(req.body.childId);
        
        if (!targetChild) {
          return res.status(404).json({ error: "Child account not found" });
        }
        
        const familyGroup = await storage.getFamilyGroup(targetChild.familyGroupId);
        if (!familyGroup || familyGroup.parentUserId !== req.user.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
        
        savingsGoalData = insertSavingsGoalSchema.parse({
          ...req.body,
          creatorType: "parent",
          createdAt: new Date().toISOString(),
          isCompleted: false
        });
      } else {
        return res.status(400).json({ error: "Invalid request. Missing childId" });
      }
      
      const savingsGoal = await storage.createSavingsGoal(savingsGoalData);
      
      // If parent created goal, notify child
      if (savingsGoalData.creatorType === "parent") {
        const childAccount = await storage.getFamilyMember(savingsGoalData.childId);
        if (childAccount) {
          notifyChild(childAccount.userId, {
            type: 'savings_goal_created_by_parent',
            data: savingsGoal
          });
        }
      }
      
      // If child created goal with parent contribution, notify parent
      if (
        savingsGoalData.creatorType === "child" && 
        savingsGoalData.parentContribution && 
        savingsGoalData.parentContribution > 0
      ) {
        const childAccount = await storage.getFamilyMember(savingsGoalData.childId);
        if (childAccount) {
          const familyGroup = await storage.getFamilyGroup(childAccount.familyGroupId);
          if (familyGroup) {
            notifyParent(familyGroup.parentUserId, {
              type: 'savings_goal_contribution_request',
              data: {
                ...savingsGoal,
                childName: childAccount.name
              }
            });
          }
        }
      }
      
      res.status(201).json(savingsGoal);
    } catch (error) {
      console.error("Error creating savings goal:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid savings goal data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create savings goal" });
    }
  });
  
  app.get("/api/children/:childId/savings-goals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const childId = parseInt(req.params.childId);
      const childAccount = await storage.getFamilyMember(childId);
      
      if (!childAccount) {
        return res.status(404).json({ error: "Child account not found" });
      }
      
      // Check if user is the parent or the child
      const familyGroup = await storage.getFamilyGroup(childAccount.familyGroupId);
      const isParent = familyGroup && familyGroup.parentUserId === req.user.id;
      const isChild = childAccount.userId === req.user.id;
      
      if (!isParent && !isChild) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const savingsGoals = await storage.getSavingsGoalsByChildId(childId);
      res.json(savingsGoals);
    } catch (error) {
      console.error("Error fetching savings goals:", error);
      res.status(500).json({ error: "Failed to fetch savings goals" });
    }
  });
  
  app.patch("/api/savings-goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const goalId = parseInt(req.params.id);
      const savingsGoal = await storage.getSavingsGoal(goalId);
      
      if (!savingsGoal) {
        return res.status(404).json({ error: "Savings goal not found" });
      }
      
      const childAccount = await storage.getFamilyMember(savingsGoal.childId);
      if (!childAccount) {
        return res.status(404).json({ error: "Child account not found" });
      }
      
      // Check if user is the parent or the child
      const familyGroup = await storage.getFamilyGroup(childAccount.familyGroupId);
      const isParent = familyGroup && familyGroup.parentUserId === req.user.id;
      const isChild = childAccount.userId === req.user.id;
      
      if (!isParent && !isChild) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Some updates might only be allowed by parent or child
      const updates = { ...req.body };
      
      // Only parents can approve parent contributions
      if (!isParent && updates.hasOwnProperty('parentContributionApproved')) {
        delete updates.parentContributionApproved;
      }
      
      const updatedGoal = await storage.updateSavingsGoal(goalId, updates);
      
      // Send notification to the other party about updates
      if (isParent) {
        notifyChild(childAccount.userId, {
          type: updates.parentContributionApproved ? 'savings_goal_contribution_approved' : 'savings_goal_updated_by_parent',
          data: updatedGoal
        });
      } else if (isChild) {
        notifyParent(familyGroup.parentUserId, {
          type: 'savings_goal_updated_by_child',
          data: {
            ...updatedGoal,
            childName: childAccount.name
          }
        });
      }
      
      res.json(updatedGoal);
    } catch (error) {
      console.error("Error updating savings goal:", error);
      res.status(500).json({ error: "Failed to update savings goal" });
    }
  });
  
  app.patch("/api/savings-goals/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const goalId = parseInt(req.params.id);
      const savingsGoal = await storage.getSavingsGoal(goalId);
      
      if (!savingsGoal) {
        return res.status(404).json({ error: "Savings goal not found" });
      }
      
      const childAccount = await storage.getFamilyMember(savingsGoal.childId);
      if (!childAccount) {
        return res.status(404).json({ error: "Child account not found" });
      }
      
      // Check if user is the parent or the child
      const familyGroup = await storage.getFamilyGroup(childAccount.familyGroupId);
      const isParent = familyGroup && familyGroup.parentUserId === req.user.id;
      const isChild = childAccount.userId === req.user.id;
      
      if (!isParent && !isChild) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { completionNote } = req.body;
      
      const completedGoal = await storage.completeSavingsGoal(
        goalId, 
        new Date().toISOString(), 
        req.user.id, 
        completionNote
      );
      
      // Send notification to the other party about completion
      if (isParent) {
        notifyChild(childAccount.userId, {
          type: 'savings_goal_completed_by_parent',
          data: completedGoal
        });
      } else if (isChild) {
        notifyParent(familyGroup.parentUserId, {
          type: 'savings_goal_completed_by_child',
          data: {
            ...completedGoal,
            childName: childAccount.name
          }
        });
      }
      
      res.json(completedGoal);
    } catch (error) {
      console.error("Error completing savings goal:", error);
      res.status(500).json({ error: "Failed to complete savings goal" });
    }
  });

  // =========================================
  // BistroBeast POS API Routes
  // =========================================

  // POS Locations API
  app.get("/api/pos/locations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = req.user.id;
      const locations = await storage.getPosLocationsByUserId(userId);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching POS locations:", error);
      res.status(500).json({ error: "Failed to fetch POS locations" });
    }
  });

  app.post("/api/pos/locations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const locationData = insertPosLocationSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const location = await storage.createPosLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      console.error("Error creating POS location:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid location data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create POS location" });
    }
  });

  // POS Tables API
  app.get("/api/pos/tables", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { locationId } = req.query;
      
      if (!locationId || typeof locationId !== 'string') {
        return res.status(400).json({ error: "Location ID is required" });
      }
      
      const tables = await storage.getPosTables(parseInt(locationId));
      res.json(tables);
    } catch (error) {
      console.error("Error fetching POS tables:", error);
      res.status(500).json({ error: "Failed to fetch POS tables" });
    }
  });
  
  app.post("/api/pos/tables", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const tableData = insertPosTableSchema.parse({
        ...req.body
      });
      
      const table = await storage.createPosTable(tableData);
      
      // Notify clients about new table
      broadcast(`pos-location-${tableData.locationId}`, {
        type: 'table_created',
        data: table
      });
      
      res.status(201).json(table);
    } catch (error) {
      console.error("Error creating POS table:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid table data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create POS table" });
    }
  });
  
  app.put("/api/pos/tables/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      const { status, currentOrderId } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const updatedTable = await storage.updatePosTableStatus(parseInt(id), status, currentOrderId);
      
      if (!updatedTable) {
        return res.status(404).json({ error: "Table not found" });
      }
      
      // Notify clients about table status change
      broadcast(`pos-location-${updatedTable.locationId}`, {
        type: 'table_updated',
        data: updatedTable
      });
      
      res.json(updatedTable);
    } catch (error) {
      console.error("Error updating POS table status:", error);
      res.status(500).json({ error: "Failed to update POS table status" });
    }
  });
  
  // POS Areas API
  app.get("/api/pos/areas", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { locationId } = req.query;
      
      if (!locationId || typeof locationId !== 'string') {
        return res.status(400).json({ error: "Location ID is required" });
      }
      
      const areas = await storage.getPosAreas(parseInt(locationId));
      res.json(areas);
    } catch (error) {
      console.error("Error fetching POS areas:", error);
      res.status(500).json({ error: "Failed to fetch POS areas" });
    }
  });
  
  app.post("/api/pos/areas", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const areaData = insertPosAreaSchema.parse({
        ...req.body
      });
      
      const area = await storage.createPosArea(areaData);
      
      // Notify clients about new area
      broadcast(`pos-location-${areaData.locationId}`, {
        type: 'area_created',
        data: area
      });
      
      res.status(201).json(area);
    } catch (error) {
      console.error("Error creating POS area:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid area data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create POS area" });
    }
  });
  
  // POS Categories API
  app.get("/api/pos/categories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { locationId } = req.query;
      
      if (!locationId || typeof locationId !== 'string') {
        return res.status(400).json({ error: "Location ID is required" });
      }
      
      const categories = await storage.getPosCategories(parseInt(locationId));
      res.json(categories);
    } catch (error) {
      console.error("Error fetching POS categories:", error);
      res.status(500).json({ error: "Failed to fetch POS categories" });
    }
  });
  
  app.post("/api/pos/categories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const categoryData = insertPosCategorySchema.parse({
        ...req.body
      });
      
      const category = await storage.createPosCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating POS category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid category data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create POS category" });
    }
  });
  
  // POS Menu Items API
  app.get("/api/pos/menu-items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { locationId, categoryId } = req.query;
      
      if (categoryId && typeof categoryId === 'string') {
        const menuItems = await storage.getPosMenuItemsByCategory(parseInt(categoryId));
        return res.json(menuItems);
      }
      
      if (!locationId || typeof locationId !== 'string') {
        return res.status(400).json({ error: "Location ID is required" });
      }
      
      const menuItems = await storage.getPosMenuItems(parseInt(locationId));
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching POS menu items:", error);
      res.status(500).json({ error: "Failed to fetch POS menu items" });
    }
  });
  
  app.post("/api/pos/menu-items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const menuItemData = insertPosMenuItemSchema.parse({
        ...req.body
      });
      
      const menuItem = await storage.createPosMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating POS menu item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid menu item data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create POS menu item" });
    }
  });
  
  // POS Orders API
  app.get("/api/pos/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { locationId, status } = req.query;
      
      if (!locationId || typeof locationId !== 'string') {
        return res.status(400).json({ error: "Location ID is required" });
      }
      
      if (status && typeof status === 'string') {
        const orders = await storage.getPosOrdersByStatus(parseInt(locationId), status);
        return res.json(orders);
      }
      
      const orders = await storage.getPosOrders(parseInt(locationId));
      res.json(orders);
    } catch (error) {
      console.error("Error fetching POS orders:", error);
      res.status(500).json({ error: "Failed to fetch POS orders" });
    }
  });
  
  app.get("/api/pos/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      const order = await storage.getPosOrder(parseInt(id));
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Get order items
      const orderItems = await storage.getPosOrderItems(parseInt(id));
      
      res.json({
        ...order,
        items: orderItems
      });
    } catch (error) {
      console.error("Error fetching POS order:", error);
      res.status(500).json({ error: "Failed to fetch POS order" });
    }
  });
  
  app.post("/api/pos/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const orderData = insertPosOrderSchema.parse({
        ...req.body
      });
      
      const order = await storage.createPosOrder(orderData);
      
      // Notify clients about new order
      broadcast(`pos-location-${orderData.locationId}`, {
        type: 'order_created',
        data: order
      });
      
      // If table is provided, update table status
      if (orderData.tableId) {
        await storage.updatePosTableStatus(orderData.tableId, "occupied", order.id);
        
        // Get updated table to broadcast
        const updatedTable = await storage.getPosTable(orderData.tableId);
        if (updatedTable) {
          broadcast(`pos-location-${orderData.locationId}`, {
            type: 'table_updated',
            data: updatedTable
          });
        }
      }
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating POS order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create POS order" });
    }
  });
  
  app.put("/api/pos/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const updatedOrder = await storage.updatePosOrderStatus(parseInt(id), status);
      
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Notify clients about order status change
      broadcast(`pos-location-${updatedOrder.locationId}`, {
        type: 'order_updated',
        data: updatedOrder
      });
      
      // If order is completed and there's a table, update table status to available
      if (status === "completed" && updatedOrder.tableId) {
        await storage.updatePosTableStatus(updatedOrder.tableId, "available", null);
        
        // Get updated table to broadcast
        const updatedTable = await storage.getPosTable(updatedOrder.tableId);
        if (updatedTable) {
          broadcast(`pos-location-${updatedOrder.locationId}`, {
            type: 'table_updated',
            data: updatedTable
          });
        }
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating POS order status:", error);
      res.status(500).json({ error: "Failed to update POS order status" });
    }
  });
  
  app.post("/api/pos/orders/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      const { paymentMethod, totalPaid } = req.body;
      
      if (!paymentMethod || !totalPaid) {
        return res.status(400).json({ error: "Payment method and total paid are required" });
      }
      
      const completedOrder = await storage.completePosOrder(parseInt(id), paymentMethod, totalPaid);
      
      if (!completedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Notify clients about order completion
      broadcast(`pos-location-${completedOrder.locationId}`, {
        type: 'order_completed',
        data: completedOrder
      });
      
      // If there's a table, update table status to available
      if (completedOrder.tableId) {
        await storage.updatePosTableStatus(completedOrder.tableId, "available", null);
        
        // Get updated table to broadcast
        const updatedTable = await storage.getPosTable(completedOrder.tableId);
        if (updatedTable) {
          broadcast(`pos-location-${completedOrder.locationId}`, {
            type: 'table_updated',
            data: updatedTable
          });
        }
      }
      
      res.json(completedOrder);
    } catch (error) {
      console.error("Error completing POS order:", error);
      res.status(500).json({ error: "Failed to complete POS order" });
    }
  });
  
  // POS Order Items API
  app.get("/api/pos/order-items/:orderId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { orderId } = req.params;
      const orderItems = await storage.getPosOrderItems(parseInt(orderId));
      res.json(orderItems);
    } catch (error) {
      console.error("Error fetching POS order items:", error);
      res.status(500).json({ error: "Failed to fetch POS order items" });
    }
  });
  
  app.post("/api/pos/order-items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const orderItemData = insertPosOrderItemSchema.parse({
        ...req.body
      });
      
      const orderItem = await storage.createPosOrderItem(orderItemData);
      
      // Get the updated order with new totals
      const updatedOrder = await storage.getPosOrder(orderItemData.orderId);
      
      // Notify clients about updated order
      if (updatedOrder) {
        broadcast(`pos-location-${updatedOrder.locationId}`, {
          type: 'order_updated',
          data: updatedOrder
        });
        
        // Also notify specifically for the order
        broadcast(`pos-order-${orderItemData.orderId}`, {
          type: 'order_item_added',
          data: orderItem
        });
      }
      
      res.status(201).json(orderItem);
    } catch (error) {
      console.error("Error creating POS order item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order item data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create POS order item" });
    }
  });
  
  app.put("/api/pos/order-items/:id/quantity", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (quantity === undefined || quantity < 1) {
        return res.status(400).json({ error: "Valid quantity is required" });
      }
      
      const updatedItem = await storage.updatePosOrderItemQuantity(parseInt(id), quantity);
      
      if (!updatedItem) {
        return res.status(404).json({ error: "Order item not found" });
      }
      
      // Get the updated order with new totals
      const updatedOrder = await storage.getPosOrder(updatedItem.orderId);
      
      // Notify clients about updated order
      if (updatedOrder) {
        broadcast(`pos-location-${updatedOrder.locationId}`, {
          type: 'order_updated',
          data: updatedOrder
        });
        
        // Also notify specifically for the order
        broadcast(`pos-order-${updatedItem.orderId}`, {
          type: 'order_item_updated',
          data: updatedItem
        });
      }
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating POS order item quantity:", error);
      res.status(500).json({ error: "Failed to update order item quantity" });
    }
  });
  
  app.delete("/api/pos/order-items/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      const item = await storage.getPosOrderItem(parseInt(id));
      
      if (!item) {
        return res.status(404).json({ error: "Order item not found" });
      }
      
      const orderId = item.orderId;
      const order = await storage.getPosOrder(orderId);
      
      await storage.deletePosOrderItem(parseInt(id));
      
      // Get the updated order with new totals
      const updatedOrder = await storage.getPosOrder(orderId);
      
      // Notify clients about updated order
      if (order) {
        broadcast(`pos-location-${order.locationId}`, {
          type: 'order_updated',
          data: updatedOrder || order
        });
        
        // Also notify specifically for the order
        broadcast(`pos-order-${orderId}`, {
          type: 'order_item_deleted',
          data: item
        });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting POS order item:", error);
      res.status(500).json({ error: "Failed to delete order item" });
    }
  });
  
  // POS Inventory API
  app.get("/api/pos/inventory", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { locationId } = req.query;
      
      if (!locationId || typeof locationId !== 'string') {
        return res.status(400).json({ error: "Location ID is required" });
      }
      
      const inventoryItems = await storage.getPosInventoryItems(parseInt(locationId));
      res.json(inventoryItems);
    } catch (error) {
      console.error("Error fetching POS inventory:", error);
      res.status(500).json({ error: "Failed to fetch POS inventory" });
    }
  });
  
  app.post("/api/pos/inventory", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const inventoryItemData = insertPosInventoryItemSchema.parse({
        ...req.body
      });
      
      const inventoryItem = await storage.createPosInventoryItem(inventoryItemData);
      res.status(201).json(inventoryItem);
    } catch (error) {
      console.error("Error creating POS inventory item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid inventory item data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create POS inventory item" });
    }
  });
  
  app.put("/api/pos/inventory/:id/stock", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      const { stock } = req.body;
      
      if (stock === undefined) {
        return res.status(400).json({ error: "Stock amount is required" });
      }
      
      const updatedItem = await storage.updatePosInventoryItemStock(parseInt(id), stock.toString());
      
      if (!updatedItem) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating POS inventory stock:", error);
      res.status(500).json({ error: "Failed to update inventory stock" });
    }
  });
  
  // POS Staff API
  app.get("/api/pos/staff", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { locationId } = req.query;
      
      if (!locationId || typeof locationId !== 'string') {
        return res.status(400).json({ error: "Location ID is required" });
      }
      
      const staff = await storage.getPosStaffByLocationId(parseInt(locationId));
      res.json(staff);
    } catch (error) {
      console.error("Error fetching POS staff:", error);
      res.status(500).json({ error: "Failed to fetch POS staff" });
    }
  });
  
  app.post("/api/pos/staff", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const staffData = insertPosStaffSchema.parse({
        ...req.body
      });
      
      const staff = await storage.createPosStaff(staffData);
      res.status(201).json(staff);
    } catch (error) {
      console.error("Error creating POS staff member:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid staff data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create POS staff member" });
    }
  });
  
  app.put("/api/pos/staff/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedStaff = await storage.updatePosStaff(parseInt(id), updates);
      
      if (!updatedStaff) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      
      res.json(updatedStaff);
    } catch (error) {
      console.error("Error updating POS staff member:", error);
      res.status(500).json({ error: "Failed to update staff member" });
    }
  });
  
  app.delete("/api/pos/staff/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      await storage.deletePosStaff(parseInt(id));
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting POS staff member:", error);
      res.status(500).json({ error: "Failed to delete staff member" });
    }
  });
  
  // POS Payments API
  app.get("/api/pos/payments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { locationId, orderId } = req.query;
      
      if (orderId && typeof orderId === 'string') {
        const payments = await storage.getPosPaymentsByOrderId(parseInt(orderId));
        return res.json(payments);
      }
      
      if (!locationId || typeof locationId !== 'string') {
        return res.status(400).json({ error: "Location ID is required" });
      }
      
      const payments = await storage.getPosPaymentsByLocationId(parseInt(locationId));
      res.json(payments);
    } catch (error) {
      console.error("Error fetching POS payments:", error);
      res.status(500).json({ error: "Failed to fetch POS payments" });
    }
  });
  
  // Get a specific payment by ID
  app.get("/api/pos/payments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      const payment = await storage.getPosPayment(parseInt(id));
      
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      res.json(payment);
    } catch (error) {
      console.error("Error fetching POS payment:", error);
      res.status(500).json({ error: "Failed to fetch POS payment" });
    }
  });

  app.post("/api/pos/payments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const paymentData = insertPosPaymentSchema.parse({
        ...req.body
      });
      
      const payment = await storage.createPosPayment(paymentData);
      
      // Get associated order
      const order = await storage.getPosOrder(paymentData.orderId);
      
      // If payment completed, notify clients
      if (payment.status === "paid" && order) {
        broadcast(`pos-location-${order.locationId}`, {
          type: 'payment_completed',
          data: {
            payment,
            order
          }
        });
        
        // Also notify specifically for the order
        broadcast(`pos-order-${paymentData.orderId}`, {
          type: 'payment_completed',
          data: payment
        });
      }
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating POS payment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid payment data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create POS payment" });
    }
  });
  
  // Process a refund for a payment
  app.post("/api/pos/payments/:id/refund", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      const { amount, reason, staffId } = req.body;
      
      // First, get the payment
      const payment = await storage.getPosPayment(parseInt(id));
      
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      // Check if already refunded
      if (payment.status === "refunded") {
        return res.status(400).json({ error: "Payment already refunded" });
      }
      
      // Validate refund amount
      const refundAmount = typeof amount === 'string' ? amount : payment.amount.toString();
      
      // Update the payment with refund information
      const updatedPayment = await storage.updatePosPayment(parseInt(id), {
        status: "refunded",
        refundedAmount: refundAmount,
        refundedAt: new Date(),
        refundReason: reason || "Customer requested refund"
      });
      
      // Get associated order
      const order = await storage.getPosOrder(payment.orderId);
      
      // Notify clients about the refund
      if (order) {
        broadcast(`pos-location-${order.locationId}`, {
          type: 'payment_refunded',
          data: {
            payment: updatedPayment,
            order
          }
        });
        
        // Also notify specifically for the order
        broadcast(`pos-order-${payment.orderId}`, {
          type: 'payment_refunded',
          data: updatedPayment
        });
      }
      
      res.json(updatedPayment);
    } catch (error) {
      console.error("Error processing refund:", error);
      res.status(500).json({ error: "Failed to process refund" });
    }
  });
  
  // POS WebSocket Channels API
  app.post("/api/pos/subscribe", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { channel } = req.body;
      
      if (!channel) {
        return res.status(400).json({ error: "Channel name is required" });
      }
      
      // Find user's websocket connection
      let found = false;
      wss.clients.forEach((client: ExtendedWebSocket) => {
        if (client.userId === req.user!.id) {
          // Add channel to this connection
          if (!client.channels) {
            client.channels = [];
          }
          
          if (!client.channels.includes(channel)) {
            client.channels.push(channel);
          }
          
          found = true;
        }
      });
      
      res.json({ 
        success: found,
        message: found ? `Subscribed to ${channel}` : "No active connection found for user. Try refreshing the page."
      });
    } catch (error) {
      console.error("Error subscribing to POS channel:", error);
      res.status(500).json({ error: "Failed to subscribe to channel" });
    }
  });
  
  app.post("/api/pos/unsubscribe", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { channel } = req.body;
      
      if (!channel) {
        return res.status(400).json({ error: "Channel name is required" });
      }
      
      // Find user's websocket connection
      wss.clients.forEach((client: ExtendedWebSocket) => {
        if (client.userId === req.user!.id && client.channels) {
          // Remove channel from this connection
          client.channels = client.channels.filter(ch => ch !== channel);
        }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error unsubscribing from POS channel:", error);
      res.status(500).json({ error: "Failed to unsubscribe from channel" });
    }
  });
  
  app.patch("/api/restaurant/tables/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const tableId = parseInt(req.params.id);
      const table = await storage.getRestaurantTable(tableId);
      
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      
      if (table.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { status, currentOrderId } = req.body;
      
      // Validate status
      if (!Object.values(restaurantTableStatusEnum.enumValues).includes(status)) {
        return res.status(400).json({ error: "Invalid table status" });
      }
      
      const updatedTable = await storage.updateRestaurantTableStatus(tableId, status, currentOrderId);
      
      // Notify clients about table status change
      broadcast(`merchant-pos-${req.user.id}`, {
        type: 'table_status_changed',
        data: updatedTable
      });
      
      res.json(updatedTable);
    } catch (error) {
      console.error("Error updating restaurant table status:", error);
      res.status(500).json({ error: "Failed to update restaurant table status" });
    }
  });
  
  app.delete("/api/restaurant/tables/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const tableId = parseInt(req.params.id);
      const table = await storage.getRestaurantTable(tableId);
      
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      
      if (table.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      await storage.deleteRestaurantTable(tableId);
      
      // Notify clients about table deletion
      broadcast(`merchant-pos-${req.user.id}`, {
        type: 'table_deleted',
        data: { id: tableId }
      });
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting restaurant table:", error);
      res.status(500).json({ error: "Failed to delete restaurant table" });
    }
  });
  
  // Restaurant Orders API
  app.get("/api/restaurant/orders", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const merchantId = req.user.id;
      const { status } = req.query;
      
      let orders;
      if (status && typeof status === 'string') {
        // Validate status
        if (!Object.values(restaurantOrderStatusEnum.enumValues).includes(status)) {
          return res.status(400).json({ error: "Invalid order status" });
        }
        
        orders = await storage.getRestaurantOrdersByStatus(merchantId, status);
      } else {
        orders = await storage.getRestaurantOrdersByMerchantId(merchantId);
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching restaurant orders:", error);
      res.status(500).json({ error: "Failed to fetch restaurant orders" });
    }
  });
  
  app.get("/api/restaurant/orders/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getRestaurantOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      if (order.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Get order items
      const items = await storage.getRestaurantOrderItemsByOrderId(orderId);
      
      res.json({
        ...order,
        items
      });
    } catch (error) {
      console.error("Error fetching restaurant order:", error);
      res.status(500).json({ error: "Failed to fetch restaurant order" });
    }
  });
  
  app.post("/api/restaurant/orders", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const merchantId = req.user.id;
      const orderData = insertRestaurantOrderSchema.parse({
        ...req.body,
        merchantId,
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`
      });
      
      const order = await storage.createRestaurantOrder(orderData);
      
      // If there are items in the request, add them to the order
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          await storage.createRestaurantOrderItem({
            ...item,
            orderId: order.id
          });
        }
      }
      
      // Get the complete order with items
      const completeOrder = await storage.getRestaurantOrder(order.id);
      const items = await storage.getRestaurantOrderItemsByOrderId(order.id);
      
      // Notify about new order
      broadcast(`merchant-pos-${merchantId}`, {
        type: 'order_created',
        data: {
          ...completeOrder,
          items
        }
      });
      
      res.status(201).json({
        ...completeOrder,
        items
      });
    } catch (error) {
      console.error("Error creating restaurant order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create restaurant order" });
    }
  });
  
  app.post("/api/restaurant/orders/:orderId/modification-qr", async (req, res) => {
    try {
      // Check if authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const orderId = parseInt(req.params.orderId);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }
      
      // Get the order
      const order = await storage.getRestaurantOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Generate the QR code
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Get the order and update it with a modification token
      const qrCodeData = await generateOrderModificationUrl(orderId, baseUrl);
      
      // Update the order with the generated token
      await storage.updateRestaurantOrderModificationToken(
        orderId, 
        qrCodeData.token, 
        new Date(Date.now() + 15 * 60 * 1000) // Token valid for 15 minutes
      );
      
      res.json(qrCodeData);
    } catch (error: any) {
      console.error("Error generating modification QR code:", error);
      res.status(500).json({ error: error.message });
    }
  });


  // Order modification routes
  app.get("/api/orders/:token/modify", async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ error: "Missing token" });
      }
      
      // Find the order by modification token
      const order = await storage.getRestaurantOrderByToken(token);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found or token expired" });
      }
      
      // Check token expiry
      if (order.modificationTokenExpiry && new Date(order.modificationTokenExpiry) < new Date()) {
        return res.status(400).json({ error: "Modification token has expired" });
      }
      
      // Mark the order as being modified
      await storage.startModifyingOrder(order.id);
      
      // Get order items
      const orderItems = await storage.getRestaurantOrderItemsByOrderId(order.id);
      
      // Return order and items information for modification
      res.json({
        order,
        items: orderItems
      });
      
    } catch (error: any) {
      console.error("Error modifying order:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/orders/:token/complete", async (req, res) => {
    try {
      const { token } = req.params;
      const { wasModified } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: "Missing token" });
      }
      
      // Find the order by modification token
      const order = await storage.getRestaurantOrderByToken(token);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found or token expired" });
      }
      
      // Complete the modification
      await storage.finishModifyingOrder(order.id, wasModified);
      
      // Return success
      res.json({ success: true });
      
    } catch (error: any) {
      console.error("Error completing order modification:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Process modification timeouts - intended to be called periodically
  app.post("/api/orders/process-modifications", async (req, res) => {
    try {
      const ordersBeingModified = await storage.getOrdersBeingModified();
      const now = new Date();
      
      for (const order of ordersBeingModified) {
        if (!order.modificationStartTime) continue;
        
        const modificationStartTime = new Date(order.modificationStartTime);
        const minutesSinceStart = Math.floor((now.getTime() - modificationStartTime.getTime()) / (1000 * 60));
        
        // Send reminder after 5 minutes if not already sent
        if (minutesSinceStart >= 5 && !order.modificationReminderSent) {
          // Construct modification link
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          const modificationLink = `${baseUrl}/order-modify/${order.modificationToken}`;
          
          // Send SMS reminder
          const message = `You were modifying your order #${order.orderNumber}. Until you complete the modified or the same order, your order will not be prepared. Click the link to continue: ${modificationLink}`;
          
          if (order.customerPhone && order.smsOptedIn) {
            const success = await sendOrderStatusSms({
              ...order,
              modificationLink
            }, "modifying", message);
            
            if (success) {
              await storage.updateOrderModificationReminder(order.id, true);
            }
          }
        }
        
        // Cancel and send timeout notification after 15 minutes (5 + 10)
        if (minutesSinceStart >= 15 && !order.modificationTimeoutSent) {
          // Send SMS timeout notification
          const message = `Since you didn't complete your modification for order #${order.orderNumber}, it has been cancelled.`;
          
          if (order.customerPhone && order.smsOptedIn) {
            const success = await sendOrderStatusSms(order, "canceled", message);
            
            if (success) {
              await storage.updateOrderModificationTimeout(order.id, true);
            }
          }
          
          // Cancel the order
          await storage.cancelOrderDueToModificationTimeout(order.id);
        }
      }
      
      res.json({ success: true, processed: ordersBeingModified.length });
      
    } catch (error: any) {
      console.error("Error processing order modifications:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.patch("/api/restaurant/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getRestaurantOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      if (order.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { status } = req.body;
      
      // Validate status
      if (!Object.values(restaurantOrderStatusEnum.enumValues).includes(status)) {
        return res.status(400).json({ error: "Invalid order status" });
      }
      
      const updatedOrder = await storage.updateRestaurantOrderStatus(orderId, status);
      
      // Notify about order status change
      broadcast(`merchant-pos-${req.user.id}`, {
        type: 'order_status_changed',
        data: updatedOrder
      });
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating restaurant order status:", error);
      res.status(500).json({ error: "Failed to update restaurant order status" });
    }
  });
  
  // Restaurant Order Items Status API
  app.patch("/api/restaurant/orders/:orderId/items/:itemId/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const orderId = parseInt(req.params.orderId);
      const itemId = parseInt(req.params.itemId);
      const order = await storage.getRestaurantOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      if (order.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const item = await storage.getRestaurantOrderItem(itemId);
      
      if (!item || item.orderId !== orderId) {
        return res.status(404).json({ error: "Order item not found" });
      }
      
      const { status } = req.body;
      
      // Validate status
      const validItemStatuses = ["pending", "preparing", "ready", "served"];
      if (!validItemStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid item status" });
      }
      
      const updatedItem = await storage.updateRestaurantOrderItemStatus(itemId, status);
      
      // Check if all items are in the same status to update the order status
      const orderItems = await storage.getRestaurantOrderItemsByOrderId(orderId);
      
      // If all items are ready, update the order status to ready
      if (status === "ready" && orderItems.every(item => item.status === "ready")) {
        await storage.updateRestaurantOrderStatus(orderId, "ready");
        
        // Notify about order status change
        broadcast(`merchant-pos-${req.user.id}`, {
          type: 'order_status_changed',
          data: {
            ...order,
            status: "ready"
          }
        });
      }
      
      // If any item is preparing and order is in placed status, update to preparing
      if (status === "preparing" && order.status === "placed") {
        await storage.updateRestaurantOrderStatus(orderId, "preparing");
        
        // Notify about order status change
        broadcast(`merchant-pos-${req.user.id}`, {
          type: 'order_status_changed',
          data: {
            ...order,
            status: "preparing"
          }
        });
      }
      
      // Notify about item status change
      broadcast(`merchant-pos-${req.user.id}`, {
        type: 'order_item_status_changed',
        data: {
          orderId,
          item: updatedItem
        }
      });
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating restaurant order item status:", error);
      res.status(500).json({ error: "Failed to update order item status" });
    }
  });
  
  app.post("/api/restaurant/orders/:id/complete", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getRestaurantOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      if (order.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { paymentMethod, totalPaid } = req.body;
      
      if (!paymentMethod) {
        return res.status(400).json({ error: "Payment method is required" });
      }
      
      const updatedOrder = await storage.completeRestaurantOrder(orderId, paymentMethod, totalPaid || order.total);
      
      // Notify about order completion
      broadcast(`merchant-pos-${req.user.id}`, {
        type: 'order_completed',
        data: updatedOrder
      });
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error completing restaurant order:", error);
      res.status(500).json({ error: "Failed to complete restaurant order" });
    }
  });
  
  app.delete("/api/restaurant/orders/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getRestaurantOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      if (order.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      await storage.deleteRestaurantOrder(orderId);
      
      // Notify about order deletion
      broadcast(`merchant-pos-${req.user.id}`, {
        type: 'order_deleted',
        data: { id: orderId }
      });
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting restaurant order:", error);
      res.status(500).json({ error: "Failed to delete restaurant order" });
    }
  });
  
  // Restaurant Order Items API
  app.post("/api/restaurant/orders/:orderId/items", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getRestaurantOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      if (order.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const itemData = insertRestaurantOrderItemSchema.parse({
        ...req.body,
        orderId
      });
      
      const item = await storage.createRestaurantOrderItem(itemData);
      
      // Get updated order
      const updatedOrder = await storage.getRestaurantOrder(orderId);
      
      // Notify about item addition
      broadcast(`merchant-pos-${req.user.id}`, {
        type: 'order_item_added',
        data: {
          item,
          order: updatedOrder
        }
      });
      
      res.status(201).json(item);
    } catch (error) {
      console.error("Error adding order item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order item data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to add order item" });
    }
  });
  
  app.patch("/api/restaurant/order-items/:id/quantity", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const itemId = parseInt(req.params.id);
      const item = await storage.getRestaurantOrderItem(itemId);
      
      if (!item) {
        return res.status(404).json({ error: "Order item not found" });
      }
      
      const order = await storage.getRestaurantOrder(item.orderId);
      
      if (!order || order.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: "Invalid quantity" });
      }
      
      // If quantity is 0, delete the item
      if (quantity === 0) {
        await storage.deleteRestaurantOrderItem(itemId);
        
        // Get updated order
        const updatedOrder = await storage.getRestaurantOrder(item.orderId);
        const updatedItems = await storage.getRestaurantOrderItemsByOrderId(item.orderId);
        
        // Notify about item removal
        broadcast(`merchant-pos-${req.user.id}`, {
          type: 'order_item_removed',
          data: {
            itemId,
            order: updatedOrder,
            items: updatedItems
          }
        });
        
        return res.status(200).json({ 
          message: "Item removed",
          order: updatedOrder,
          items: updatedItems
        });
      }
      
      // Update item quantity
      const updatedItem = await storage.updateRestaurantOrderItemQuantity(itemId, quantity);
      
      // Get updated order
      const updatedOrder = await storage.getRestaurantOrder(item.orderId);
      
      // Notify about item update
      broadcast(`merchant-pos-${req.user.id}`, {
        type: 'order_item_updated',
        data: {
          item: updatedItem,
          order: updatedOrder
        }
      });
      
      res.json({
        item: updatedItem,
        order: updatedOrder
      });
    } catch (error) {
      console.error("Error updating order item quantity:", error);
      res.status(500).json({ error: "Failed to update order item quantity" });
    }
  });
  
  app.delete("/api/restaurant/order-items/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const itemId = parseInt(req.params.id);
      const item = await storage.getRestaurantOrderItem(itemId);
      
      if (!item) {
        return res.status(404).json({ error: "Order item not found" });
      }
      
      const order = await storage.getRestaurantOrder(item.orderId);
      
      if (!order || order.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const orderId = item.orderId;
      
      await storage.deleteRestaurantOrderItem(itemId);
      
      // Get updated order
      const updatedOrder = await storage.getRestaurantOrder(orderId);
      const updatedItems = await storage.getRestaurantOrderItemsByOrderId(orderId);
      
      // Notify about item removal
      broadcast(`merchant-pos-${req.user.id}`, {
        type: 'order_item_removed',
        data: {
          itemId,
          order: updatedOrder,
          items: updatedItems
        }
      });
      
      res.status(200).json({
        message: "Item removed",
        order: updatedOrder,
        items: updatedItems
      });
    } catch (error) {
      console.error("Error deleting order item:", error);
      res.status(500).json({ error: "Failed to delete order item" });
    }
  });
  
  // Restaurant Inventory API
  app.get("/api/restaurant/inventory", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const merchantId = req.user.id;
      const items = await storage.getRestaurantInventoryItems(merchantId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ error: "Failed to fetch inventory items" });
    }
  });
  
  app.get("/api/restaurant/inventory/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const itemId = parseInt(req.params.id);
      const item = await storage.getRestaurantInventoryItem(itemId);
      
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      
      if (item.merchantId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Get transaction history
      const transactions = await storage.getRestaurantInventoryTransactionsByItemId(itemId);
      
      res.json({
        ...item,
        transactions
      });
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      res.status(500).json({ error: "Failed to fetch inventory item" });
    }
  });
  
  app.post("/api/restaurant/inventory", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const merchantId = req.user.id;
      const itemData = insertRestaurantInventoryItemSchema.parse({
        ...req.body,
        merchantId
      });
      
      const item = await storage.createRestaurantInventoryItem(itemData);
      
      // Notify about new inventory item
      broadcast(`merchant-pos-${merchantId}`, {
        type: 'inventory_item_created',
        data: item
      });
      
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid inventory item data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create inventory item" });
    }
  });
  
  app.patch("/api/restaurant/inventory/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const itemId = parseInt(req.params.id);
      const merchantId = req.user.id;
      const item = await storage.getRestaurantInventoryItem(itemId);
      
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      
      if (item.merchantId !== merchantId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const updatedItem = await storage.updateRestaurantInventoryItem(itemId, req.body, merchantId);
      
      // Notify about inventory item update
      broadcast(`merchant-pos-${merchantId}`, {
        type: 'inventory_item_updated',
        data: updatedItem
      });
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid inventory item data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update inventory item" });
    }
  });
  
  app.patch("/api/restaurant/inventory/:id/stock", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const itemId = parseInt(req.params.id);
      const merchantId = req.user.id;
      const item = await storage.getRestaurantInventoryItem(itemId);
      
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      
      if (item.merchantId !== merchantId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const { newStock } = req.body;
      
      if (typeof newStock !== 'number' || newStock < 0) {
        return res.status(400).json({ error: "Invalid stock amount" });
      }
      
      const updatedItem = await storage.updateRestaurantInventoryStock(itemId, newStock);
      
      // Get latest transactions
      const transactions = await storage.getRestaurantInventoryTransactionsByItemId(itemId);
      const latestTransaction = transactions[0];
      
      // Notify about inventory stock update
      broadcast(`merchant-pos-${merchantId}`, {
        type: 'inventory_stock_updated',
        data: {
          item: updatedItem,
          transaction: latestTransaction
        }
      });
      
      res.json({
        item: updatedItem,
        transaction: latestTransaction
      });
    } catch (error) {
      console.error("Error updating inventory stock:", error);
      res.status(500).json({ error: "Failed to update inventory stock" });
    }
  });
  
  app.delete("/api/restaurant/inventory/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const itemId = parseInt(req.params.id);
      const merchantId = req.user.id;
      const item = await storage.getRestaurantInventoryItem(itemId);
      
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      
      if (item.merchantId !== merchantId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      await storage.deleteRestaurantInventoryItem(itemId, merchantId);
      
      // Notify about inventory item deletion
      broadcast(`merchant-pos-${merchantId}`, {
        type: 'inventory_item_deleted',
        data: { id: itemId }
      });
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ error: "Failed to delete inventory item" });
    }
  });
  
  app.post("/api/restaurant/inventory/transactions", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "merchant") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const merchantId = req.user.id;
      const transactionData = insertRestaurantInventoryTransactionSchema.parse({
        ...req.body,
        merchantId,
        userId: req.user.id,
        createdBy: req.user.username
      });
      
      // Validate that the item exists and belongs to the merchant
      const item = await storage.getRestaurantInventoryItem(transactionData.itemId);
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      
      if (item.merchantId !== merchantId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const transaction = await storage.createRestaurantInventoryTransaction(transactionData);
      
      // Update item stock based on transaction type
      const currentStock = parseFloat(item.currentStock.toString());
      const transactionQuantity = parseFloat(transactionData.quantity.toString());
      let newStock: number;
      
      if (transactionData.transactionType === "purchase") {
        newStock = currentStock + transactionQuantity;
      } else {
        newStock = currentStock - transactionQuantity;
      }
      
      // Ensure stock doesn't go below zero
      if (newStock < 0) newStock = 0;
      
      const updatedItem = await storage.updateRestaurantInventoryStock(item.id, newStock);
      
      // Notify about new transaction and stock update
      broadcast(`merchant-pos-${merchantId}`, {
        type: 'inventory_transaction_created',
        data: {
          transaction,
          item: updatedItem
        }
      });
      
      res.status(201).json({
        transaction,
        item: updatedItem
      });
    } catch (error) {
      console.error("Error creating inventory transaction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid transaction data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create inventory transaction" });
    }
  });

  return httpServer;
}
