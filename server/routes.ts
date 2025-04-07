import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateSitemap } from "./sitemap";
import { z } from "zod";
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
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Authentication Routes
  setupAuth(app);

  // API Routes
  app.get("/api/healthcheck", (req, res) => {
    res.json({ status: "ok" });
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
  const httpServer = createServer(app);
  
  interface ExtendedWebSocket extends WebSocket {
    userId?: number;
    channels?: string[];
    affiliateId?: number;
    isAffiliate?: boolean;
    isEmployer?: boolean;
    isEmployee?: boolean;
    employerId?: number;
    walletId?: number;
    lastActivity?: number;
  }

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

  return httpServer;
}