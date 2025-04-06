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

  // WebSocket for real-time notifications
  const httpServer = createServer(app);
  
  interface ExtendedWebSocket extends WebSocket {
    userId?: number;
    channels?: string[];
    affiliateId?: number;
    isAffiliate?: boolean;
    lastActivity?: number;
  }

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

  return httpServer;
}