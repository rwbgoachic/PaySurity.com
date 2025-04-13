import { Router } from "express";
import { IoltaReconciliationService } from "./iolta-reconciliation-service";
import { IoltaService } from "./iolta-service";
import { validateUserAuth, validateMerchantAccess } from "./auth-middleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Set up storage for bank statement uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads", "bank-statements");
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const router = Router();
const reconciliationService = new IoltaReconciliationService();
const ioltaService = new IoltaService();

/**
 * Get reconciliation balances for three-way reconciliation
 */
router.get(
  "/api/legal/iolta/reconciliation/balances/:trustAccountId",
  validateUserAuth,
  validateMerchantAccess,
  async (req, res) => {
    try {
      const trustAccountId = parseInt(req.params.trustAccountId);
      
      if (isNaN(trustAccountId)) {
        return res.status(400).json({ error: "Invalid trust account ID" });
      }
      
      const balances = await reconciliationService.getReconciliationBalances(trustAccountId);
      res.json(balances);
    } catch (error: any) {
      console.error("Error getting reconciliation balances:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get bank statements for a trust account
 */
router.get(
  "/api/legal/iolta/bank-statements/:trustAccountId",
  validateUserAuth,
  validateMerchantAccess,
  async (req, res) => {
    try {
      const trustAccountId = parseInt(req.params.trustAccountId);
      
      if (isNaN(trustAccountId)) {
        return res.status(400).json({ error: "Invalid trust account ID" });
      }
      
      const statements = await reconciliationService.getBankStatementsByTrustAccount(trustAccountId);
      res.json(statements);
    } catch (error: any) {
      console.error("Error getting bank statements:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get reconciliation history for a trust account
 */
router.get(
  "/api/legal/iolta/reconciliations/:trustAccountId",
  validateUserAuth,
  validateMerchantAccess,
  async (req, res) => {
    try {
      const trustAccountId = parseInt(req.params.trustAccountId);
      
      if (isNaN(trustAccountId)) {
        return res.status(400).json({ error: "Invalid trust account ID" });
      }
      
      const reconciliations = await reconciliationService.getReconciliationsByTrustAccount(trustAccountId);
      res.json(reconciliations);
    } catch (error: any) {
      console.error("Error getting reconciliation history:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get transactions for reconciliation
 */
router.get(
  "/api/legal/iolta/reconciliation/transactions/:trustAccountId",
  validateUserAuth,
  validateMerchantAccess,
  async (req, res) => {
    try {
      const trustAccountId = parseInt(req.params.trustAccountId);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      
      if (isNaN(trustAccountId)) {
        return res.status(400).json({ error: "Invalid trust account ID" });
      }
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      
      const transactions = await reconciliationService.getTransactionsForReconciliation(
        trustAccountId,
        startDate,
        endDate
      );
      
      res.json(transactions);
    } catch (error: any) {
      console.error("Error getting transactions for reconciliation:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Generate a comprehensive reconciliation report for an IOLTA account
 */
router.get(
  "/api/legal/iolta/reconciliation/report/:trustAccountId",
  validateUserAuth,
  validateMerchantAccess,
  async (req, res) => {
    try {
      const trustAccountId = parseInt(req.params.trustAccountId);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      
      if (isNaN(trustAccountId)) {
        return res.status(400).json({ error: "Invalid trust account ID" });
      }
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      
      // Get merchant ID from authenticated user
      const merchantId = req.user!.merchantId;
      
      const report = await reconciliationService.generateReconciliationReport(
        trustAccountId,
        merchantId,
        startDate,
        endDate
      );
      
      res.json(report);
    } catch (error: any) {
      console.error("Error generating reconciliation report:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Generate a reconciliation report for a specific client's IOLTA ledger
 */
router.get(
  "/api/legal/iolta/reconciliation/client-report/:clientId/:trustAccountId",
  validateUserAuth,
  validateMerchantAccess,
  async (req, res) => {
    try {
      const clientId = req.params.clientId;
      const trustAccountId = parseInt(req.params.trustAccountId);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      
      if (!clientId) {
        return res.status(400).json({ error: "Invalid client ID" });
      }
      
      if (isNaN(trustAccountId)) {
        return res.status(400).json({ error: "Invalid trust account ID" });
      }
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      
      // Get merchant ID from authenticated user
      const merchantId = req.user!.merchantId;
      
      const report = await reconciliationService.generateClientReconciliationReport(
        clientId,
        trustAccountId,
        merchantId,
        startDate,
        endDate
      );
      
      res.json(report);
    } catch (error: any) {
      console.error("Error generating client reconciliation report:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Mark a transaction as cleared
 */
router.post(
  "/api/legal/iolta/reconciliation/mark-cleared",
  validateUserAuth,
  validateMerchantAccess,
  async (req, res) => {
    try {
      const schema = z.object({
        transactionId: z.number(),
        clearedDate: z.string().refine(val => !isNaN(new Date(val).getTime()), {
          message: "Invalid cleared date"
        }),
        bankReference: z.string().optional()
      });
      
      try {
        const data = schema.parse(req.body);
        const clearedDate = new Date(data.clearedDate);
        
        const updatedTransaction = await reconciliationService.markTransactionCleared(
          data.transactionId,
          clearedDate,
          data.bankReference
        );
        
        res.json(updatedTransaction);
      } catch (validationError: any) {
        return res.status(400).json({ error: fromZodError(validationError).message });
      }
    } catch (error: any) {
      console.error("Error marking transaction as cleared:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Mark multiple transactions as cleared
 */
router.post(
  "/api/legal/iolta/reconciliation/mark-multiple-cleared",
  validateUserAuth,
  validateMerchantAccess,
  async (req, res) => {
    try {
      const schema = z.object({
        transactionIds: z.array(z.number()),
        clearedDate: z.string().refine(val => !isNaN(new Date(val).getTime()), {
          message: "Invalid cleared date"
        })
      });
      
      try {
        const data = schema.parse(req.body);
        const clearedDate = new Date(data.clearedDate);
        
        const updateCount = await reconciliationService.markTransactionsCleared(
          data.transactionIds,
          clearedDate
        );
        
        res.json({ success: true, count: updateCount });
      } catch (validationError: any) {
        return res.status(400).json({ error: fromZodError(validationError).message });
      }
    } catch (error: any) {
      console.error("Error marking multiple transactions as cleared:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Complete a reconciliation
 */
router.post(
  "/api/legal/iolta/reconciliation/complete",
  validateUserAuth,
  validateMerchantAccess,
  async (req, res) => {
    try {
      const schema = z.object({
        trustAccountId: z.number(),
        reconciliationDate: z.string().refine(val => !isNaN(new Date(val).getTime()), {
          message: "Invalid reconciliation date"
        }),
        bookBalance: z.string(),
        bankBalance: z.string(),
        adjustedBookBalance: z.string(),
        adjustedBankBalance: z.string(),
        difference: z.string(),
        outstandingChecks: z.array(
          z.object({
            id: z.number(),
            transactionType: z.string(),
            amount: z.string(),
            description: z.string(),
            checkNumber: z.string().optional(),
            date: z.string().refine(val => !isNaN(new Date(val).getTime()), {
              message: "Invalid date"
            })
          })
        ),
        outstandingDeposits: z.array(
          z.object({
            id: z.number(),
            transactionType: z.string(),
            amount: z.string(),
            description: z.string(),
            date: z.string().refine(val => !isNaN(new Date(val).getTime()), {
              message: "Invalid date"
            })
          })
        ),
        bankFeesAdjustment: z.string().optional(),
        interestEarnedAdjustment: z.string().optional(),
        otherAdjustments: z.array(z.any()).optional(),
        reconciliationNotes: z.string().optional(),
        bankStatementId: z.number().optional()
      });
      
      try {
        const data = schema.parse(req.body);
        
        // Convert string dates to Date objects
        const reconciliationDate = new Date(data.reconciliationDate);
        const outstandingChecks = data.outstandingChecks.map(item => ({
          ...item,
          date: new Date(item.date)
        }));
        const outstandingDeposits = data.outstandingDeposits.map(item => ({
          ...item,
          date: new Date(item.date)
        }));
        
        // Get the merchant ID from the user
        const merchantId = req.user!.merchantId; 
        const createdById = req.user!.id;
        
        const reconciliation = await reconciliationService.completeReconciliation(
          data.trustAccountId,
          merchantId,
          createdById, // reconcilerId
          reconciliationDate,
          data.bookBalance,
          data.bankBalance,
          data.difference,
          outstandingChecks,
          outstandingDeposits,
          data.reconciliationNotes, // notes
          data.bankStatement, // bank statement object if any
          undefined, // reviewerId - optional
          undefined // reviewedAt - optional
        );
        
        res.json(reconciliation);
      } catch (validationError: any) {
        return res.status(400).json({ error: fromZodError(validationError).message });
      }
    } catch (error: any) {
      console.error("Error completing reconciliation:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Upload and process a bank statement
 */
router.post(
  "/api/legal/iolta/bank-statements/upload",
  validateUserAuth,
  validateMerchantAccess,
  upload.single("statementFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No statement file uploaded" });
      }
      
      const schema = z.object({
        trustAccountId: z.string().transform((val) => parseInt(val)),
        statementDate: z.string().refine(val => !isNaN(new Date(val).getTime()), {
          message: "Invalid statement date"
        }),
        startDate: z.string().refine(val => !isNaN(new Date(val).getTime()), {
          message: "Invalid start date"
        }),
        endDate: z.string().refine(val => !isNaN(new Date(val).getTime()), {
          message: "Invalid end date"
        }),
        startingBalance: z.string(),
        endingBalance: z.string()
      });
      
      try {
        const data = schema.parse(req.body);
        
        // Convert string dates to Date objects
        const statementDate = new Date(data.statementDate);
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        
        if (isNaN(data.trustAccountId)) {
          return res.status(400).json({ error: "Invalid trust account ID" });
        }
        
        // Get the merchant ID from the user
        const merchantId = req.user!.merchantId;
        const uploadedById = req.user!.id;
        
        const result = await reconciliationService.importBankStatementCSV(
          data.trustAccountId,
          merchantId,
          uploadedById,
          req.file.path,
          statementDate,
          startDate,
          endDate,
          data.startingBalance,
          data.endingBalance
        );
        
        res.json(result);
      } catch (validationError: any) {
        // Clean up the uploaded file if validation fails
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(400).json({ error: fromZodError(validationError).message });
      }
    } catch (error: any) {
      console.error("Error uploading bank statement:", error);
      
      // Clean up the uploaded file if processing fails
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get a single bank statement by ID
 */
router.get(
  "/api/legal/iolta/bank-statements/detail/:statementId",
  validateUserAuth,
  validateMerchantAccess,
  async (req, res) => {
    try {
      const statementId = parseInt(req.params.statementId);
      
      if (isNaN(statementId)) {
        return res.status(400).json({ error: "Invalid bank statement ID" });
      }
      
      const statement = await reconciliationService.getBankStatement(statementId);
      
      if (!statement) {
        return res.status(404).json({ error: "Bank statement not found" });
      }
      
      res.json(statement);
    } catch (error: any) {
      console.error("Error getting bank statement:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get a single reconciliation by ID
 */
router.get(
  "/api/legal/iolta/reconciliations/detail/:reconciliationId",
  validateUserAuth,
  validateMerchantAccess,
  async (req, res) => {
    try {
      const reconciliationId = parseInt(req.params.reconciliationId);
      
      if (isNaN(reconciliationId)) {
        return res.status(400).json({ error: "Invalid reconciliation ID" });
      }
      
      const reconciliation = await reconciliationService.getReconciliation(reconciliationId);
      
      if (!reconciliation) {
        return res.status(404).json({ error: "Reconciliation not found" });
      }
      
      res.json(reconciliation);
    } catch (error: any) {
      console.error("Error getting reconciliation:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;