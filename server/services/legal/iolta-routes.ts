import { Router } from "express";
import { ioltaService } from "./iolta-service";
import { 
  insertIoltaTrustAccountSchema, 
  insertIoltaClientLedgerSchema, 
  insertIoltaTransactionSchema 
} from "@shared/schema";
import { ensureAuthenticated, ensureLegalMerchant } from "./auth-middleware";

// Create router
export const ioltaRouter = Router();

/**
 * Trust Accounts APIs
 */

// Create a trust account
ioltaRouter.post("/trust-accounts", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
  try {
    // Set merchantId from authenticated user for security
    const data = {
      ...req.body,
      merchantId: req.user?.merchantId || req.body.merchantId
    };
    
    const validatedData = insertIoltaTrustAccountSchema.parse(data);
    const trustAccount = await ioltaService.createTrustAccount(validatedData);
    res.status(201).json(trustAccount);
  } catch (error) {
    console.error("Error creating trust account:", error);
    res.status(400).json({ error: error.message || "Failed to create trust account" });
  }
});

// Get trust accounts for merchant
ioltaRouter.get("/trust-accounts", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
  try {
    const merchantId = req.user?.merchantId || Number(req.query.merchantId);
    const trustAccounts = await ioltaService.getTrustAccountsByMerchant(merchantId);
    res.json(trustAccounts);
  } catch (error) {
    console.error("Error retrieving trust accounts:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve trust accounts" });
  }
});

// Get a specific trust account
ioltaRouter.get("/trust-accounts/:id", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const trustAccount = await ioltaService.getTrustAccount(id);
    
    if (!trustAccount) {
      return res.status(404).json({ error: "Trust account not found" });
    }
    
    // Security check - ensure the trust account belongs to the merchant
    if (trustAccount.merchantId !== req.user?.merchantId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json(trustAccount);
  } catch (error) {
    console.error("Error retrieving trust account:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve trust account" });
  }
});

/**
 * Client Ledger APIs
 */

// Create a client ledger
ioltaRouter.post("/client-ledgers", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
  try {
    // Set merchantId from authenticated user for security
    const data = {
      ...req.body,
      merchantId: req.user?.merchantId || req.body.merchantId
    };
    
    const validatedData = insertIoltaClientLedgerSchema.parse(data);
    
    // Verify the trust account exists and belongs to the merchant
    const trustAccount = await ioltaService.getTrustAccount(validatedData.trustAccountId);
    if (!trustAccount) {
      return res.status(404).json({ error: "Trust account not found" });
    }
    
    if (trustAccount.merchantId !== req.user?.merchantId) {
      return res.status(403).json({ error: "Access denied to the specified trust account" });
    }
    
    const clientLedger = await ioltaService.createClientLedger(validatedData);
    res.status(201).json(clientLedger);
  } catch (error) {
    console.error("Error creating client ledger:", error);
    res.status(400).json({ error: error.message || "Failed to create client ledger" });
  }
});

// Get client ledgers for a trust account
ioltaRouter.get("/trust-accounts/:id/client-ledgers", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
  try {
    const trustAccountId = Number(req.params.id);
    
    // Verify the trust account exists and belongs to the merchant
    const trustAccount = await ioltaService.getTrustAccount(trustAccountId);
    if (!trustAccount) {
      return res.status(404).json({ error: "Trust account not found" });
    }
    
    if (trustAccount.merchantId !== req.user?.merchantId) {
      return res.status(403).json({ error: "Access denied to the specified trust account" });
    }
    
    const clientLedgers = await ioltaService.getClientLedgersByTrustAccount(trustAccountId);
    res.json(clientLedgers);
  } catch (error) {
    console.error("Error retrieving client ledgers:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve client ledgers" });
  }
});

// Get a specific client ledger
ioltaRouter.get("/client-ledgers/:id", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const clientLedger = await ioltaService.getClientLedger(id);
    
    if (!clientLedger) {
      return res.status(404).json({ error: "Client ledger not found" });
    }
    
    // Security check - ensure the client ledger belongs to the merchant
    if (clientLedger.merchantId !== req.user?.merchantId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json(clientLedger);
  } catch (error) {
    console.error("Error retrieving client ledger:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve client ledger" });
  }
});

// Get client ledger statement with transactions
ioltaRouter.get("/client-ledgers/:id/statement", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    // First check if the client ledger exists and belongs to the merchant
    const clientLedger = await ioltaService.getClientLedger(id);
    
    if (!clientLedger) {
      return res.status(404).json({ error: "Client ledger not found" });
    }
    
    // Security check - ensure the client ledger belongs to the merchant
    if (clientLedger.merchantId !== req.user?.merchantId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const statement = await ioltaService.getClientLedgerStatement(id, startDate, endDate);
    res.json(statement);
  } catch (error) {
    console.error("Error retrieving client ledger statement:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve client ledger statement" });
  }
});

/**
 * Transaction APIs
 */

// Record a transaction
ioltaRouter.post("/transactions", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
  try {
    // Set merchantId from authenticated user for security
    const data = {
      ...req.body,
      merchantId: req.user?.merchantId || req.body.merchantId,
      createdById: req.user?.id || req.body.createdById
    };
    
    const validatedData = insertIoltaTransactionSchema.parse(data);
    
    // Verify the client ledger exists and belongs to the merchant
    const clientLedger = await ioltaService.getClientLedger(validatedData.clientLedgerId);
    if (!clientLedger) {
      return res.status(404).json({ error: "Client ledger not found" });
    }
    
    if (clientLedger.merchantId !== req.user?.merchantId) {
      return res.status(403).json({ error: "Access denied to the specified client ledger" });
    }
    
    // Also verify the trust account
    const trustAccount = await ioltaService.getTrustAccount(validatedData.trustAccountId);
    if (!trustAccount) {
      return res.status(404).json({ error: "Trust account not found" });
    }
    
    if (trustAccount.merchantId !== req.user?.merchantId) {
      return res.status(403).json({ error: "Access denied to the specified trust account" });
    }
    
    // For withdrawals, check that there are sufficient funds
    if (validatedData.transactionType === "withdrawal" || 
        (validatedData.transactionType === "payment" && validatedData.fundType === "earned")) {
      
      const availableBalance = parseFloat(clientLedger.balance);
      const withdrawalAmount = parseFloat(validatedData.amount);
      
      if (withdrawalAmount > availableBalance) {
        return res.status(400).json({ 
          error: "Insufficient funds", 
          availableBalance: clientLedger.balance,
          requestedAmount: validatedData.amount
        });
      }
    }
    
    const transaction = await ioltaService.recordTransaction(validatedData);
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error recording transaction:", error);
    res.status(400).json({ error: error.message || "Failed to record transaction" });
  }
});

// Get transactions for a client ledger
ioltaRouter.get("/client-ledgers/:id/transactions", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
  try {
    const clientLedgerId = Number(req.params.id);
    
    // First check if the client ledger exists and belongs to the merchant
    const clientLedger = await ioltaService.getClientLedger(clientLedgerId);
    
    if (!clientLedger) {
      return res.status(404).json({ error: "Client ledger not found" });
    }
    
    // Security check - ensure the client ledger belongs to the merchant
    if (clientLedger.merchantId !== req.user?.merchantId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const transactions = await ioltaService.getTransactionsByClientLedger(clientLedgerId);
    res.json(transactions);
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve transactions" });
  }
});

// Get transactions for a trust account
ioltaRouter.get("/trust-accounts/:id/transactions", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
  try {
    const trustAccountId = Number(req.params.id);
    
    // First check if the trust account exists and belongs to the merchant
    const trustAccount = await ioltaService.getTrustAccount(trustAccountId);
    
    if (!trustAccount) {
      return res.status(404).json({ error: "Trust account not found" });
    }
    
    // Security check - ensure the trust account belongs to the merchant
    if (trustAccount.merchantId !== req.user?.merchantId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const transactions = await ioltaService.getTransactionsByTrustAccount(trustAccountId);
    res.json(transactions);
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve transactions" });
  }
});

// Get a specific transaction
ioltaRouter.get("/transactions/:id", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const transaction = await ioltaService.getTransaction(id);
    
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    
    // Security check - ensure the transaction belongs to the merchant
    if (transaction.merchantId !== req.user?.merchantId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error("Error retrieving transaction:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve transaction" });
  }
});

/**
 * Reconciliation APIs
 */

// Get trust account reconciliation
ioltaRouter.get("/trust-accounts/:id/reconciliation", ensureAuthenticated, ensureLegalMerchant, async (req, res) => {
  try {
    const trustAccountId = Number(req.params.id);
    const reconciliationDate = req.query.date ? new Date(req.query.date as string) : new Date();
    
    // First check if the trust account exists and belongs to the merchant
    const trustAccount = await ioltaService.getTrustAccount(trustAccountId);
    
    if (!trustAccount) {
      return res.status(404).json({ error: "Trust account not found" });
    }
    
    // Security check - ensure the trust account belongs to the merchant
    if (trustAccount.merchantId !== req.user?.merchantId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const reconciliation = await ioltaService.getTrustAccountReconciliation(trustAccountId, reconciliationDate);
    res.json(reconciliation);
  } catch (error) {
    console.error("Error generating reconciliation report:", error);
    res.status(500).json({ error: error.message || "Failed to generate reconciliation report" });
  }
});