import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateSitemap } from "./sitemap";
import { z } from "zod";
import { insertWalletSchema, insertTransactionSchema, insertBankAccountSchema, insertFundRequestSchema } from "@shared/schema";

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

  // Serve documentation files
  app.use('/docs', express.static(path.join(process.cwd(), 'docs')));

  // Sitemap for SEO
  app.get("/sitemap.xml", generateSitemap);

  // WebSocket for real-time notifications
  const httpServer = createServer(app);
  
  interface ExtendedWebSocket extends WebSocket {
    userId?: number;
    channels?: string[];
  }

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.channels = [];

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'subscribe' && data.channel) {
          if (!ws.channels) ws.channels = [];
          if (!ws.channels.includes(data.channel)) {
            ws.channels.push(data.channel);
            ws.send(JSON.stringify({ type: 'subscribed', channel: data.channel }));
          }
        } else if (data.type === 'unsubscribe' && data.channel) {
          if (ws.channels) {
            ws.channels = ws.channels.filter(ch => ch !== data.channel);
            ws.send(JSON.stringify({ type: 'unsubscribed', channel: data.channel }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    // Clean up on disconnect
    ws.on('close', () => {
      // Clear any resources or remove from any tracking
    });
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

  return httpServer;
}