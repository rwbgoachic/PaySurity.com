import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertFundRequestSchema, insertTransactionSchema, insertBankAccountSchema, insertWalletSchema } from "@shared/schema";
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

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
