import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertFundRequestSchema, 
  insertTransactionSchema, 
  insertBankAccountSchema, 
  insertWalletSchema,
  insertMerchantProfileSchema,
  insertPaymentGatewaySchema,
  insertPointOfSaleSystemSchema,
  insertLoyaltyProgramSchema,
  insertCustomerLoyaltyAccountSchema,
  insertPromotionalCampaignSchema,
  insertAnalyticsReportSchema,
  insertBusinessFinancingSchema,
  insertVirtualTerminalSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Wallet routes
  app.get("/api/wallets", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const userId = req.user?.id;
      const wallets = await storage.getWalletsByUserId(userId);
      res.json(wallets);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/wallets/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const walletId = parseInt(req.params.id);
      const wallet = await storage.getWallet(walletId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Only return the wallet if it belongs to the user or the user is an employer
      if (wallet.userId !== req.user?.id && req.user?.role !== "employer") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(wallet);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/wallets", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "employer") return res.status(403).json({ message: "Only employers can create wallets" });
      
      const validatedData = insertWalletSchema.parse(req.body);
      const wallet = await storage.createWallet(validatedData);
      res.status(201).json(wallet);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/wallets/:id/allocate", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "employer") return res.status(403).json({ message: "Only employers can allocate funds" });
      
      const walletId = parseInt(req.params.id);
      const { amount } = z.object({ amount: z.string() }).parse(req.body);
      
      const updatedWallet = await storage.allocateFunds(walletId, amount);
      res.json(updatedWallet);
    } catch (error) {
      next(error);
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const userId = req.user?.id;
      const transactions = req.user?.role === "employer"
        ? await storage.getAllTransactions() // Employers can see all transactions
        : await storage.getTransactionsByUserId(userId); // Employees see only their transactions
      
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/transactions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Verify the user owns the wallet or is an employer
      const wallet = await storage.getWallet(validatedData.walletId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      if (wallet.userId !== req.user?.id && req.user?.role !== "employer") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/transactions/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const transactionId = parseInt(req.params.id);
      const { expenseType } = z.object({ expenseType: z.string() }).parse(req.body);
      
      // Get the transaction to check ownership
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Check if the user owns the transaction or is an employer
      if (transaction.userId !== req.user?.id && req.user?.role !== "employer") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedTransaction = await storage.updateTransactionExpenseType(transactionId, expenseType);
      res.json(updatedTransaction);
    } catch (error) {
      next(error);
    }
  });

  // Bank account routes
  app.get("/api/bank-accounts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const userId = req.user?.id;
      const bankAccounts = await storage.getBankAccountsByUserId(userId);
      res.json(bankAccounts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/bank-accounts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const validatedData = insertBankAccountSchema.parse(req.body);
      
      // Ensure users can only create bank accounts for themselves
      if (validatedData.userId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const bankAccount = await storage.createBankAccount(validatedData);
      res.status(201).json(bankAccount);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/bank-accounts/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const bankAccountId = parseInt(req.params.id);
      
      // Get the bank account to check ownership
      const bankAccount = await storage.getBankAccount(bankAccountId);
      if (!bankAccount) {
        return res.status(404).json({ message: "Bank account not found" });
      }
      
      // Check if the user owns the bank account
      if (bankAccount.userId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteBankAccount(bankAccountId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Add route to add funds from bank account to wallet
  app.post("/api/bank-accounts/:id/add-funds", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const bankAccountId = parseInt(req.params.id);
      const { walletId, amount } = z.object({ 
        walletId: z.number(),
        amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
          message: "Amount must be a positive number"
        })
      }).parse(req.body);
      
      // Get the bank account to check ownership
      const bankAccount = await storage.getBankAccount(bankAccountId);
      if (!bankAccount) {
        return res.status(404).json({ message: "Bank account not found" });
      }
      
      // Check if the user owns the bank account
      if (bankAccount.userId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Get the wallet to check ownership
      const wallet = await storage.getWallet(walletId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Check if the user owns the wallet
      if (wallet.userId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Add funds to the wallet
      const updatedWallet = await storage.allocateFunds(walletId, amount);
      
      // Create a transaction record
      const transaction = await storage.createTransaction({
        walletId,
        userId: req.user.id,
        amount,
        type: "incoming",
        method: "ach",
        merchantName: bankAccount.bankName,
        expenseType: "deposit",
        sourceOfFunds: `${bankAccount.bankName} - ${bankAccount.accountType} (${bankAccount.accountNumber})`,
      });
      
      res.status(200).json({ wallet: updatedWallet, transaction });
    } catch (error) {
      next(error);
    }
  });

  // Add route to transfer funds from wallet to bank account
  app.post("/api/wallets/:id/transfer-to-bank", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const walletId = parseInt(req.params.id);
      const { bankAccountId, amount } = z.object({ 
        bankAccountId: z.number(),
        amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
          message: "Amount must be a positive number"
        })
      }).parse(req.body);
      
      // Get the wallet to check ownership
      const wallet = await storage.getWallet(walletId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Check if the user owns the wallet
      if (wallet.userId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Transfer funds to bank account
      const updatedWallet = await storage.transferFundsToBank(walletId, bankAccountId, amount);
      
      res.status(200).json({ wallet: updatedWallet });
    } catch (error) {
      next(error);
    }
  });

  // Fund request routes
  app.get("/api/fund-requests", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const userId = req.user?.id;
      const fundRequests = req.user?.role === "employer"
        ? await storage.getAllFundRequests() // Employers see all requests
        : await storage.getFundRequestsByUserId(userId); // Employees see only their requests
      
      res.json(fundRequests);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/fund-requests", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const validatedData = insertFundRequestSchema.parse({
        ...req.body,
        requesterId: req.user?.id,
        status: "pending"
      });
      
      const fundRequest = await storage.createFundRequest(validatedData);
      res.status(201).json(fundRequest);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/fund-requests/:id/approve", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "employer") return res.status(403).json({ message: "Only employers can approve fund requests" });
      
      const requestId = parseInt(req.params.id);
      const updatedRequest = await storage.approveFundRequest(requestId, req.user?.id);
      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/fund-requests/:id/reject", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "employer") return res.status(403).json({ message: "Only employers can reject fund requests" });
      
      const requestId = parseInt(req.params.id);
      const { reason } = z.object({ reason: z.string().optional() }).parse(req.body);
      
      const updatedRequest = await storage.rejectFundRequest(requestId, req.user?.id, reason);
      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  });

  // Merchant Profile routes
  app.get("/api/merchant-profiles", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      // Admin users can see all merchant profiles
      if (req.user?.role === "admin") {
        const profiles = await storage.getMerchantProfilesByStatus("all");
        return res.json(profiles);
      }
      
      // Regular users can only see their own merchant profile
      const profile = await storage.getMerchantProfileByUserId(req.user?.id);
      res.json(profile ? [profile] : []);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/merchant-profiles/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const profileId = parseInt(req.params.id);
      const profile = await storage.getMerchantProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Only allow access to profile owner or admins
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(profile);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/merchant-profiles", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      // Validate the data
      const validatedData = insertMerchantProfileSchema.parse({
        ...req.body,
        userId: req.user?.id, // Ensure the profile is created for the authenticated user
        status: "pending", // New merchant profiles start with pending status
        verificationStatus: "pending"
      });
      
      // Check if user already has a merchant profile
      const existingProfile = await storage.getMerchantProfileByUserId(req.user?.id);
      if (existingProfile) {
        return res.status(409).json({ message: "User already has a merchant profile" });
      }
      
      const profile = await storage.createMerchantProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/merchant-profiles/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const profileId = parseInt(req.params.id);
      const profile = await storage.getMerchantProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Only allow updates by the profile owner
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Admins can update status and verification status
      if (req.user?.role === "admin" && req.body.status) {
        const updatedProfile = await storage.updateMerchantStatus(profileId, req.body.status);
        return res.json(updatedProfile);
      }
      
      // Regular users can update basic profile information but not status
      const { status, verificationStatus, ...updateData } = req.body;
      const updatedProfile = await storage.updateMerchantProfile(profileId, updateData);
      res.json(updatedProfile);
    } catch (error) {
      next(error);
    }
  });

  // Payment Gateway routes
  app.get("/api/merchant-profiles/:merchantId/payment-gateways", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const merchantId = parseInt(req.params.merchantId);
      const profile = await storage.getMerchantProfile(merchantId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Only allow access to profile owner or admins
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const gateways = await storage.getPaymentGatewaysByMerchantId(merchantId);
      res.json(gateways);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/merchant-profiles/:merchantId/payment-gateways", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const merchantId = parseInt(req.params.merchantId);
      const profile = await storage.getMerchantProfile(merchantId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Only allow access to profile owner or admins
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertPaymentGatewaySchema.parse({
        ...req.body,
        merchantId
      });
      
      const gateway = await storage.createPaymentGateway(validatedData);
      res.status(201).json(gateway);
    } catch (error) {
      next(error);
    }
  });

  // Loyalty Program routes
  app.get("/api/merchant-profiles/:merchantId/loyalty-programs", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const merchantId = parseInt(req.params.merchantId);
      const profile = await storage.getMerchantProfile(merchantId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Allow public access to active loyalty programs
      if (req.query.active === "true") {
        const activePrograms = await storage.getLoyaltyProgramsByMerchantId(merchantId);
        return res.json(activePrograms.filter(program => program.isActive));
      }
      
      // Only allow full access to profile owner or admins
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const programs = await storage.getLoyaltyProgramsByMerchantId(merchantId);
      res.json(programs);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/merchant-profiles/:merchantId/loyalty-programs", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const merchantId = parseInt(req.params.merchantId);
      const profile = await storage.getMerchantProfile(merchantId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Only allow access to profile owner or admins
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertLoyaltyProgramSchema.parse({
        ...req.body,
        merchantId
      });
      
      const program = await storage.createLoyaltyProgram(validatedData);
      res.status(201).json(program);
    } catch (error) {
      next(error);
    }
  });

  // Promotional Campaign routes
  app.get("/api/merchant-profiles/:merchantId/promotional-campaigns", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const merchantId = parseInt(req.params.merchantId);
      const profile = await storage.getMerchantProfile(merchantId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Allow public access to active campaigns
      if (req.query.active === "true") {
        const activeCampaigns = await storage.getPromotionalCampaignsByMerchantId(merchantId);
        return res.json(activeCampaigns.filter(campaign => campaign.isActive));
      }
      
      // Only allow full access to profile owner or admins
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const campaigns = await storage.getPromotionalCampaignsByMerchantId(merchantId);
      res.json(campaigns);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/merchant-profiles/:merchantId/promotional-campaigns", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const merchantId = parseInt(req.params.merchantId);
      const profile = await storage.getMerchantProfile(merchantId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Only allow access to profile owner or admins
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertPromotionalCampaignSchema.parse({
        ...req.body,
        merchantId,
        currentRedemptions: 0
      });
      
      const campaign = await storage.createPromotionalCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      next(error);
    }
  });

  // Analytics Report routes
  app.get("/api/merchant-profiles/:merchantId/analytics-reports", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const merchantId = parseInt(req.params.merchantId);
      const profile = await storage.getMerchantProfile(merchantId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Only allow access to profile owner or admins
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const reports = await storage.getAnalyticsReportsByMerchantId(merchantId);
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/merchant-profiles/:merchantId/analytics-reports", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const merchantId = parseInt(req.params.merchantId);
      const profile = await storage.getMerchantProfile(merchantId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Only allow access to profile owner or admins
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertAnalyticsReportSchema.parse({
        ...req.body,
        merchantId,
        createdById: req.user?.id
      });
      
      const report = await storage.createAnalyticsReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      next(error);
    }
  });

  // Business Financing routes
  app.get("/api/merchant-profiles/:merchantId/financing", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const merchantId = parseInt(req.params.merchantId);
      const profile = await storage.getMerchantProfile(merchantId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Only allow access to profile owner or admins
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const financingOptions = await storage.getBusinessFinancingsByMerchantId(merchantId);
      res.json(financingOptions);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/merchant-profiles/:merchantId/financing", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const merchantId = parseInt(req.params.merchantId);
      const profile = await storage.getMerchantProfile(merchantId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Only allow access to profile owner or admins
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertBusinessFinancingSchema.parse({
        ...req.body,
        merchantId,
        status: "applied",
        applicationDate: new Date(),
        totalRepaid: "0"
      });
      
      const financing = await storage.createBusinessFinancing(validatedData);
      res.status(201).json(financing);
    } catch (error) {
      next(error);
    }
  });

  // Virtual Terminal routes
  app.get("/api/merchant-profiles/:merchantId/virtual-terminals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const merchantId = parseInt(req.params.merchantId);
      const profile = await storage.getMerchantProfile(merchantId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Only allow access to profile owner or admins
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const terminals = await storage.getVirtualTerminalsByMerchantId(merchantId);
      res.json(terminals);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/merchant-profiles/:merchantId/virtual-terminals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const merchantId = parseInt(req.params.merchantId);
      const profile = await storage.getMerchantProfile(merchantId);
      
      if (!profile) {
        return res.status(404).json({ message: "Merchant profile not found" });
      }
      
      // Only allow access to profile owner or admins
      if (profile.userId !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertVirtualTerminalSchema.parse({
        ...req.body,
        merchantId
      });
      
      const terminal = await storage.createVirtualTerminal(validatedData);
      res.status(201).json(terminal);
    } catch (error) {
      next(error);
    }
  });

  // Set up WebSocket server for real-time notifications
  const httpServer = createServer(app);
  
  // Add WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws'
  });
  
  // Extend WebSocket to include user data and channels
  interface ExtendedWebSocket extends WebSocket {
    userId?: number;
    channels?: string[];
  }
  
  wss.on('connection', (ws: ExtendedWebSocket) => {
    // Handle new connections
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'subscribe') {
          // Attach user information to the connection for authorization
          ws.userId = data.userId;
          ws.channels = data.channels || [];
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
  });
  
  // Utility function to broadcast messages to subscribed clients
  const broadcastToChannel = (channel: string, data: any) => {
    wss.clients.forEach((client) => {
      const extClient = client as ExtendedWebSocket;
      if (client.readyState === WebSocket.OPEN && extClient.channels && extClient.channels.includes(channel)) {
        client.send(JSON.stringify(data));
      }
    });
  };
  
  return httpServer;
}
