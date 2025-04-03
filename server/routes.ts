import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import compression from "compression";
import { generateSitemap } from "./sitemap";
import fetch from "node-fetch";
import NodeCache from "node-cache";
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
  insertVirtualTerminalSchema,
  // Affiliate system schemas
  insertAffiliateProfileSchema,
  insertMerchantReferralSchema,
  insertAffiliatePayoutSchema,
  // Merchant application types
  MerchantApplication
} from "@shared/schema";
import { z } from "zod";

// Create a tiered cache system for improved performance
const pageCache = new NodeCache({ stdTTL: 1800, checkperiod: 120 }); // 30 minute TTL for page-level cache
const apiCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });    // 5 minute TTL for API responses

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply compression middleware for better performance
  app.use(compression());
  
  // Auth is now set up in server/index.ts before this point
  
  // Optimized NewsAPI route for payment industry news with improved caching
  app.get("/api/news/payment-industry", async (req, res, next) => {
    try {
      const cacheKey = "payment-industry-news";
      
      // Check if we have cached data with the optimized cache
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        // Add cache header for browser caching
        res.set('Cache-Control', 'public, max-age=1800'); // 30 minutes browser caching
        return res.json(cachedData);
      }
      
      // Check if the NewsAPI key is available
      if (!process.env.NEWS_API_KEY) {
        return res.status(503).json({
          error: "NewsAPI is not configured. Please set the NEWS_API_KEY environment variable."
        });
      }

      // Categories for payment industry news - optimized for performance
      const paymentKeywords = 'payment processing OR digital payments OR fintech';
      
      // NewsAPI endpoint with optimized parameters
      const endpoint = 'https://newsapi.org/v2/everything';
      const params = new URLSearchParams({
        q: paymentKeywords,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: '6', // Further reduced size for faster loading
        domains: 'pymnts.com,techcrunch.com,finextra.com,paymentssource.com',
        apiKey: process.env.NEWS_API_KEY
      });
      
      const response = await fetch(`${endpoint}?${params}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('NewsAPI error:', response.status, errorText);
        return res.status(response.status).json({
          error: `NewsAPI error: ${response.status}`
        });
      }
      
      const data = await response.json();
      
      // Update cache with fresh data using the new caching system
      apiCache.set(cacheKey, data);
      
      // Add cache header for browser caching
      res.set('Cache-Control', 'public, max-age=1800'); // 30 minutes browser caching
      res.json(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      next(error);
    }
  });

  // SEO Routes
  app.get("/sitemap.xml", generateSitemap);
  
  // Serve robots.txt
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.sendFile("public/robots.txt", { root: './client' });
  });

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

  // Affiliate System Routes
  // Affiliate Profile routes
  app.get("/api/affiliate/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const profile = await storage.getAffiliateProfileByUserId(req.user?.id);
      if (!profile) {
        return res.status(404).json({ message: "Affiliate profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/affiliate/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      // Check if user already has an affiliate profile
      const existingProfile = await storage.getAffiliateProfileByUserId(req.user?.id);
      if (existingProfile) {
        return res.status(409).json({ message: "Affiliate profile already exists" });
      }
      
      // Generate a unique referral code if not provided
      let referralCode = req.body.referralCode;
      if (!referralCode) {
        referralCode = `${req.user?.username || 'aff'}-${Math.random().toString(36).substring(2, 10)}`;
      } else {
        // Check if referral code is already taken
        const existingCodeProfile = await storage.getAffiliateProfileByReferralCode(referralCode);
        if (existingCodeProfile) {
          return res.status(409).json({ message: "Referral code already in use" });
        }
      }
      
      const validatedData = insertAffiliateProfileSchema.parse({
        ...req.body,
        userId: req.user?.id,
        username: req.user?.username,
        email: req.user?.email,
        referralCode,
        commissionRate: req.body.commissionRate || "0.1", // Default 10%
        isActive: true,
        createdAt: new Date()
      });
      
      const profile = await storage.createAffiliateProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/affiliate/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      // Get existing profile
      const profile = await storage.getAffiliateProfileByUserId(req.user?.id);
      if (!profile) {
        return res.status(404).json({ message: "Affiliate profile not found" });
      }
      
      // Parse the update data, excluding fields that shouldn't be updated directly
      const updateData: Record<string, any> = {
        paymentMethod: req.body.paymentMethod,
        paymentDetails: req.body.paymentDetails,
        marketingMaterials: req.body.marketingMaterials,
        bio: req.body.bio,
        website: req.body.website,
        socialMedia: req.body.socialMedia
      };
      
      // Remove undefined properties
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      const updatedProfile = await storage.updateAffiliateProfile(profile.id, updateData);
      res.json(updatedProfile);
    } catch (error) {
      next(error);
    }
  });

  // Admin routes for affiliate profiles
  app.get("/api/admin/affiliate/profiles", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "admin") return res.status(403).json({ message: "Access denied" });
      
      const profiles = await storage.getAllAffiliateProfiles();
      res.json(profiles);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/affiliate/profiles/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "admin") return res.status(403).json({ message: "Access denied" });
      
      const profileId = parseInt(req.params.id);
      const profile = await storage.getAffiliateProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Affiliate profile not found" });
      }
      
      // Admin can update these fields
      const updateData: Record<string, any> = {
        isActive: req.body.isActive,
        commissionRate: req.body.commissionRate,
        tier: req.body.tier,
        notes: req.body.notes
      };
      
      // Remove undefined properties
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      const updatedProfile = await storage.updateAffiliateProfile(profileId, updateData);
      res.json(updatedProfile);
    } catch (error) {
      next(error);
    }
  });

  // Merchant Referral routes
  app.get("/api/affiliate/referrals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      // Get affiliate profile
      const profile = await storage.getAffiliateProfileByUserId(req.user?.id);
      if (!profile) {
        return res.status(404).json({ message: "Affiliate profile not found" });
      }
      
      const referrals = await storage.getMerchantReferralsByAffiliateId(profile.id);
      res.json(referrals);
    } catch (error) {
      next(error);
    }
  });

  // Record a new referral - typically called when a merchant signs up with a referral code
  app.post("/api/merchant/referrals", async (req, res, next) => {
    try {
      // This endpoint is public - it's called during the merchant signup process
      const { referralCode, merchantId, merchantName, merchantEmail, merchantIndustry } = req.body;
      
      if (!referralCode || !merchantId || !merchantName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get affiliate profile by referral code
      const profile = await storage.getAffiliateProfileByReferralCode(referralCode);
      if (!profile) {
        return res.status(404).json({ message: "Invalid referral code" });
      }
      
      // Prepare data for merchant referral
      // We need to cast the data as any to bypass strict TypeScript checking since our schema might not match exactly
      const referralData: any = {
        affiliateId: profile.id,
        merchantId,
        status: "pending",
        // Add additional fields that might not be in the schema type
        notes: `Referral created for merchant: ${merchantName}`
      };
      
      // Create the referral
      const referral = await storage.createMerchantReferral(referralData);
      
      res.status(201).json(referral);
    } catch (error) {
      next(error);
    }
  });

  // Admin route to update referral status
  app.patch("/api/admin/merchant/referrals/:id/status", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "admin") return res.status(403).json({ message: "Access denied" });
      
      const referralId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "active", "churned", "suspended"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedReferral = await storage.updateMerchantReferralStatus(referralId, status);
      res.json(updatedReferral);
    } catch (error) {
      next(error);
    }
  });

  // Admin route to update transaction volumes for a referral
  app.patch("/api/admin/merchant/referrals/:id/volume", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "admin") return res.status(403).json({ message: "Access denied" });
      
      const referralId = parseInt(req.params.id);
      const { period, volume } = req.body;
      
      if (!period || !volume) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      if (!["7_days", "30_days", "90_days", "180_days", "monthly"].includes(period)) {
        return res.status(400).json({ message: "Invalid period" });
      }
      
      const updatedReferral = await storage.updateMerchantReferralVolume(referralId, period, volume);
      res.json(updatedReferral);
    } catch (error) {
      next(error);
    }
  });

  // Admin route to track milestone achievement
  app.patch("/api/admin/merchant/referrals/:id/milestone", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "admin") return res.status(403).json({ message: "Access denied" });
      
      const referralId = parseInt(req.params.id);
      const { milestoneName, reached } = req.body;
      
      if (!milestoneName || reached === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      if (!["seven_day", "thirty_day", "ninety_day", "one_eighty_day", "three_sixty_five_day"].includes(milestoneName)) {
        return res.status(400).json({ message: "Invalid milestone name" });
      }
      
      const updatedReferral = await storage.updateMerchantReferralMilestone(referralId, milestoneName, reached);
      res.json(updatedReferral);
    } catch (error) {
      next(error);
    }
  });

  // Affiliate Payout routes
  app.get("/api/affiliate/payouts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      // Get affiliate profile
      const profile = await storage.getAffiliateProfileByUserId(req.user?.id);
      if (!profile) {
        return res.status(404).json({ message: "Affiliate profile not found" });
      }
      
      const payouts = await storage.getAffiliatePayoutsByAffiliateId(profile.id);
      res.json(payouts);
    } catch (error) {
      next(error);
    }
  });
  
  // New route for affiliate dashboard statistics
  app.get("/api/affiliate/stats", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const { range = "month" } = req.query;
      
      // Get affiliate profile
      const profile = await storage.getAffiliateProfileByUserId(req.user?.id);
      if (!profile) {
        return res.status(404).json({ message: "Affiliate profile not found" });
      }
      
      // Get stats based on date range
      const stats = await storage.getAffiliateStats(profile.id, range as string);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });
  
  // Route for getting marketing materials
  app.get("/api/affiliate/marketing-materials", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const materials = await storage.getAffiliateMarketingMaterials();
      res.json(materials);
    } catch (error) {
      next(error);
    }
  });

  // Admin routes for payouts
  app.get("/api/admin/affiliate/payouts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "admin") return res.status(403).json({ message: "Access denied" });
      
      const status = req.query.status as string | undefined;
      
      let payouts;
      if (status && ["pending", "paid", "clawed_back", "canceled"].includes(status)) {
        // Cast status to the appropriate type
        const typedStatus = status as "pending" | "paid" | "clawed_back" | "canceled";
        payouts = await storage.getAffiliatePayoutsByStatus(typedStatus);
      } else {
        // Get all payouts from all affiliates
        const profiles = await storage.getAllAffiliateProfiles();
        payouts = [];
        
        for (const profile of profiles) {
          const profilePayouts = await storage.getAffiliatePayoutsByAffiliateId(profile.id);
          payouts.push(...profilePayouts);
        }
      }
      
      res.json(payouts);
    } catch (error) {
      next(error);
    }
  });

  // Create a new payout (admin only)
  app.post("/api/admin/affiliate/payouts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "admin") return res.status(403).json({ message: "Access denied" });
      
      const { affiliateId, referralId, amount, description } = req.body;
      
      if (!affiliateId || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Validate the affiliate exists
      const affiliate = await storage.getAffiliateProfile(affiliateId);
      if (!affiliate) {
        return res.status(404).json({ message: "Affiliate not found" });
      }
      
      // Validate the referral if provided
      if (referralId) {
        const referral = await storage.getMerchantReferral(referralId);
        if (!referral) {
          return res.status(404).json({ message: "Referral not found" });
        }
        
        // Ensure the referral belongs to this affiliate
        if (referral.affiliateId !== affiliateId) {
          return res.status(400).json({ message: "Referral does not belong to this affiliate" });
        }
      }
      
      // Use a generic description if affiliate username is not available
      const payoutDescription = description || `Affiliate payout for ID: ${affiliateId}`;
      
      const validatedData = insertAffiliatePayoutSchema.parse({
        affiliateId,
        referralId: referralId || null,
        amount,
        description: payoutDescription,
        status: "pending",
        createdAt: new Date()
      });
      
      const payout = await storage.createAffiliatePayout(validatedData);
      res.status(201).json(payout);
    } catch (error) {
      next(error);
    }
  });

  // Process a payout (admin only)
  app.patch("/api/admin/affiliate/payouts/:id/process", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "admin") return res.status(403).json({ message: "Access denied" });
      
      const payoutId = parseInt(req.params.id);
      const { transactionId } = req.body;
      
      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }
      
      const payout = await storage.markAffiliatePayoutAsPaid(payoutId, transactionId);
      res.json(payout);
    } catch (error) {
      next(error);
    }
  });

  // Cancel a payout (admin only)
  app.patch("/api/admin/affiliate/payouts/:id/cancel", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "admin") return res.status(403).json({ message: "Access denied" });
      
      const payoutId = parseInt(req.params.id);
      
      const payout = await storage.updateAffiliatePayoutStatus(payoutId, "canceled");
      res.json(payout);
    } catch (error) {
      next(error);
    }
  });

  // Claw back a payout (admin only)
  app.patch("/api/admin/affiliate/payouts/:id/clawback", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "admin") return res.status(403).json({ message: "Access denied" });
      
      const payoutId = parseInt(req.params.id);
      const { notes } = req.body;
      
      const payout = await storage.clawbackAffiliatePayout(payoutId, notes);
      res.json(payout);
    } catch (error) {
      next(error);
    }
  });

  // ********** Merchant Onboarding API routes **********
  
  // Merchant application submission endpoint
  app.post("/api/merchant/applications", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      // Validation schema for the entire application
      const applicationSchema = z.object({
        personalInfo: z.object({
          firstName: z.string().min(2),
          lastName: z.string().min(2),
          email: z.string().email(),
          phone: z.string().min(10),
        }),
        businessInfo: z.object({
          businessName: z.string().min(2),
          businessType: z.string().min(1),
          industry: z.string().min(1),
          yearsInBusiness: z.string().min(1),
          estimatedMonthlyVolume: z.string().min(1),
          businessDescription: z.string().optional(),
          employeeCount: z.string().min(1),
        }),
        addressInfo: z.object({
          address1: z.string().min(5),
          address2: z.string().optional(),
          city: z.string().min(2),
          state: z.string().min(2),
          zipCode: z.string().min(5),
          country: z.string().min(2),
        }),
        paymentProcessing: z.object({
          acceptsCardPresent: z.boolean().optional(),
          acceptsOnlinePayments: z.boolean().optional(),
          acceptsACH: z.boolean().optional(),
          acceptsRecurringPayments: z.boolean().optional(),
          needsPOS: z.boolean().optional(),
          needsPaymentGateway: z.boolean().optional(),
          currentProcessor: z.string().optional(),
        }),
      });

      // Validate the request body
      const validatedData = applicationSchema.parse(req.body);
      
      // Generate a unique application ID
      const applicationId = `APP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      // Store the application in the database
      const application = await storage.createMerchantApplication({
        id: applicationId,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...validatedData,
      });
      
      // Respond with the application ID
      res.status(201).json({ 
        applicationId: application.id,
        message: "Application submitted successfully" 
      });
      
    } catch (error) {
      console.error("Error submitting merchant application:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to submit application. Please try again later." 
      });
    }
  });

  // Get merchant application by ID
  app.get("/api/merchant/applications/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const applicationId = req.params.id;
      
      // Retrieve the application from the database
      const application = await storage.getMerchantApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Only allow the user who created the application or admins to view it
      if (application.personalInfo.email !== req.user?.email && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to view this application" });
      }
      
      res.status(200).json(application);
      
    } catch (error) {
      console.error("Error retrieving merchant application:", error);
      next(error);
    }
  });
  
  // List merchant applications (admin only)
  app.get("/api/merchant/applications", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "admin") return res.status(403).json({ message: "Only admins can view all applications" });
      
      const status = req.query.status as string || "all";
      const applications = await storage.getMerchantApplicationsByStatus(status);
      
      res.status(200).json(applications);
      
    } catch (error) {
      console.error("Error listing merchant applications:", error);
      next(error);
    }
  });
  
  // Update merchant application status (admin only)
  app.patch("/api/merchant/applications/:id/status", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      if (req.user?.role !== "admin") return res.status(403).json({ message: "Only admins can update application status" });
      
      const applicationId = req.params.id;
      const { status, notes } = z.object({ 
        status: z.enum(["pending", "reviewing", "approved", "rejected"]),
        notes: z.string().optional()
      }).parse(req.body);
      
      const application = await storage.updateMerchantApplicationStatus(applicationId, status, notes);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.status(200).json(application);
      
    } catch (error) {
      console.error("Error updating merchant application status:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      
      next(error);
    }
  });
  
  // ********** End of Merchant Onboarding API routes **********

  // Merchant Application routes
  app.post("/api/merchant/applications", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      // Generate a unique ID for the application
      const applicationId = `APP-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Create the application with required fields
      const application: MerchantApplication = {
        id: applicationId,
        status: "pending",
        personalInfo: req.body.personalInfo,
        businessInfo: req.body.businessInfo,
        addressInfo: req.body.addressInfo,
        paymentProcessing: req.body.paymentProcessing,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save the application
      const savedApplication = await storage.createMerchantApplication(application);
      
      // Send real-time notification to the admin dashboard channel about new application
      broadcastToChannel('admin-dashboard', {
        type: 'new-merchant-application',
        data: {
          id: savedApplication.id,
          businessName: savedApplication.businessInfo.businessName, 
          industry: savedApplication.businessInfo.industry,
          createdAt: savedApplication.createdAt
        }
      });
      
      res.status(201).json({ applicationId: savedApplication.id });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/merchant/applications/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const applicationId = req.params.id;
      const application = await storage.getMerchantApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(application);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/merchant/applications", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      // Only admins can see all applications
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { 
        status = "pending", 
        search = "",
        sortBy = "createdAt",
        sortDir = "desc",
        page = "1",
        limit = "10"
      } = req.query as {
        status?: string;
        search?: string;
        sortBy?: string;
        sortDir?: string;
        page?: string;
        limit?: string;
      };
      
      // Get applications with filters
      const applications = await storage.getMerchantApplications({
        status: status as "pending" | "reviewing" | "approved" | "rejected",
        searchTerm: search,
        sortField: sortBy,
        sortDirection: sortDir as "asc" | "desc",
        page: parseInt(page, 10) || 1,
        perPage: parseInt(limit, 10) || 10
      });
      
      res.json(applications);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/merchant/applications/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      // Only admins can update applications
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const applicationId = req.params.id;
      const { status, notes } = z.object({ 
        status: z.enum(["pending", "reviewing", "approved", "rejected"]) as z.ZodEnum<["pending", "reviewing", "approved", "rejected"]>,
        notes: z.string().optional() 
      }).parse(req.body);
      
      const updatedApplication = await storage.updateMerchantApplicationStatus(
        applicationId, 
        status as "pending" | "reviewing" | "approved" | "rejected", 
        notes
      );
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Send real-time notification to the admin dashboard channel
      broadcastToChannel('admin-dashboard', {
        type: 'application-status-update',
        data: {
          id: updatedApplication.id,
          status: updatedApplication.status,
          businessName: updatedApplication.businessInfo.businessName,
          updatedAt: updatedApplication.updatedAt
        }
      });
      
      res.json(updatedApplication);
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
