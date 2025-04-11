import { db } from "../../db";
import { eq, and, between, desc, sql, lt, gt, gte, lte, isNotNull } from "drizzle-orm";
import { 
  ioltaAccounts, 
  ioltaTransactions, 
  ioltaClientLedgers, 
  ioltaReconciliations,
  ioltaBankStatements,
  InsertIoltaReconciliation,
  InsertIoltaBankStatement,
  IoltaReconciliation,
  IoltaBankStatement,
  IoltaTransaction
} from "../../../shared/schema";
import { getCurrentDateFormatted } from "../../utils/date-utils";
import { IoltaService } from "./iolta-service";
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

export interface ReconciliationBalances {
  trustAccountId: number;
  bookBalance: string;
  calculatedClientLedgerTotal: string;
  difference: string;
  isBalanced: boolean;
  outstandingChecks: OutstandingItem[];
  outstandingDeposits: OutstandingItem[];
  clearedTransactions: IoltaTransaction[];
  unclearedTransactions: IoltaTransaction[];
  reconciliationDate: Date;
}

export interface OutstandingItem {
  id: number;
  transactionType: string;
  amount: string;
  description: string;
  checkNumber?: string;
  date: Date;
}

export interface BankStatementImportResult {
  uploadId: number;
  processed: number;
  matched: number;
  unmatched: number;
  newTransactions: number;
  errors: string[];
}

export interface ReconciliationItem {
  transactionId: number;
  checkNumber?: string;
  date: Date;
  description: string;
  amount: string;
  type: string;
  clearedDate?: Date;
  status: string; // "cleared", "outstanding", "unmatched"
}

export class IoltaReconciliationService {
  private ioltaService: IoltaService;

  constructor() {
    this.ioltaService = new IoltaService();
  }

  /**
   * Create a new bank statement record
   */
  async createBankStatement(data: InsertIoltaBankStatement): Promise<IoltaBankStatement> {
    const [bankStatement] = await db.insert(ioltaBankStatements).values(data).returning();
    return bankStatement;
  }

  /**
   * Get a bank statement by ID
   */
  async getBankStatement(id: number): Promise<IoltaBankStatement | undefined> {
    const [bankStatement] = await db.select().from(ioltaBankStatements).where(eq(ioltaBankStatements.id, id));
    return bankStatement;
  }

  /**
   * Get all bank statements for a trust account
   */
  async getBankStatementsByTrustAccount(trustAccountId: number): Promise<IoltaBankStatement[]> {
    return await db
      .select()
      .from(ioltaBankStatements)
      .where(eq(ioltaBankStatements.trustAccountId, trustAccountId))
      .orderBy(desc(ioltaBankStatements.statementDate));
  }

  /**
   * Create a new reconciliation record
   */
  async createReconciliation(data: InsertIoltaReconciliation): Promise<IoltaReconciliation> {
    const [reconciliation] = await db.insert(ioltaReconciliations).values(data).returning();
    return reconciliation;
  }

  /**
   * Get a reconciliation by ID
   */
  async getReconciliation(id: number): Promise<IoltaReconciliation | undefined> {
    const [reconciliation] = await db.select().from(ioltaReconciliations).where(eq(ioltaReconciliations.id, id));
    return reconciliation;
  }

  /**
   * Get all reconciliations for a trust account
   */
  async getReconciliationsByTrustAccount(trustAccountId: number): Promise<IoltaReconciliation[]> {
    return await db
      .select()
      .from(ioltaReconciliations)
      .where(eq(ioltaReconciliations.trustAccountId, trustAccountId))
      .orderBy(desc(ioltaReconciliations.reconciliationDate));
  }

  /**
   * Get the latest reconciliation for a trust account
   */
  async getLatestReconciliation(trustAccountId: number): Promise<IoltaReconciliation | undefined> {
    const [reconciliation] = await db
      .select()
      .from(ioltaReconciliations)
      .where(eq(ioltaReconciliations.trustAccountId, trustAccountId))
      .orderBy(desc(ioltaReconciliations.reconciliationDate))
      .limit(1);
    return reconciliation;
  }

  /**
   * Get balances and transaction data for three-way reconciliation
   */
  async getReconciliationBalances(trustAccountId: number): Promise<ReconciliationBalances> {
    const account = await this.ioltaService.getTrustAccount(trustAccountId);
    if (!account) {
      throw new Error("Trust account not found");
    }

    // Get trust account book balance
    const currentBalance = account.currentBalance || "0.00";

    // Calculate sum of client ledger balances
    const clientLedgers = await this.ioltaService.getClientLedgersByTrustAccount(trustAccountId);
    const clientLedgerTotal = clientLedgers.reduce(
      (sum, ledger) => sum + Number(ledger.currentBalance || 0),
      0
    ).toFixed(2);

    // Get transactions that have not been cleared
    const unclearedTransactions = await db
      .select()
      .from(ioltaTransactions)
      .where(
        and(
          eq(ioltaTransactions.trustAccountId, trustAccountId),
          eq(ioltaTransactions.status, "completed"),
          sql`${ioltaTransactions.clearedDate} IS NULL`
        )
      );

    // Get transactions that have been cleared
    const clearedTransactions = await db
      .select()
      .from(ioltaTransactions)
      .where(
        and(
          eq(ioltaTransactions.trustAccountId, trustAccountId),
          eq(ioltaTransactions.status, "completed"),
          sql`${ioltaTransactions.clearedDate} IS NOT NULL`
        )
      );

    // Calculate outstanding checks (withdrawals/payments that have not cleared)
    const outstandingChecks = unclearedTransactions
      .filter(t => ['withdrawal', 'payment'].includes(t.transactionType) && Number(t.amount) > 0)
      .map(t => ({
        id: t.id,
        transactionType: t.transactionType,
        amount: t.amount,
        description: t.description,
        checkNumber: t.checkNumber,
        date: t.createdAt!
      }));

    // Calculate outstanding deposits (deposits that have not cleared)
    const outstandingDeposits = unclearedTransactions
      .filter(t => t.transactionType === 'deposit' && Number(t.amount) > 0)
      .map(t => ({
        id: t.id,
        transactionType: t.transactionType,
        amount: t.amount,
        description: t.description,
        date: t.createdAt!
      }));

    // Calculate difference between book balance and client ledger total
    const difference = (Number(currentBalance) - Number(clientLedgerTotal)).toFixed(2);
    const isBalanced = difference === "0.00";

    return {
      trustAccountId,
      bookBalance: currentBalance,
      calculatedClientLedgerTotal: clientLedgerTotal,
      difference,
      isBalanced,
      outstandingChecks,
      outstandingDeposits,
      clearedTransactions,
      unclearedTransactions,
      reconciliationDate: new Date()
    };
  }

  /**
   * Update transaction clear status
   */
  async markTransactionCleared(
    transactionId: number,
    clearedDate: Date,
    bankReference?: string
  ): Promise<IoltaTransaction> {
    const [updatedTransaction] = await db
      .update(ioltaTransactions)
      .set({
        clearedDate,
        bankReference,
      })
      .where(eq(ioltaTransactions.id, transactionId))
      .returning();

    return updatedTransaction;
  }

  /**
   * Mark multiple transactions as cleared
   */
  async markTransactionsCleared(
    transactionIds: number[],
    clearedDate: Date
  ): Promise<number> {
    if (transactionIds.length === 0) return 0;

    const result = await db
      .update(ioltaTransactions)
      .set({
        clearedDate,
      })
      .where(
        sql`${ioltaTransactions.id} IN (${transactionIds.join(',')})`
      );

    return transactionIds.length;
  }

  /**
   * Save a completed reconciliation
   */
  async completeReconciliation(
    trustAccountId: number,
    merchantId: number,
    createdById: number,
    reconciliationDate: Date,
    bookBalance: string,
    bankBalance: string,
    adjustedBookBalance: string,
    adjustedBankBalance: string,
    difference: string,
    outstandingChecks: OutstandingItem[],
    outstandingDeposits: OutstandingItem[],
    bankFeesAdjustment: string = "0.00",
    interestEarnedAdjustment: string = "0.00",
    otherAdjustments: any[] = [],
    reconciliationNotes?: string,
    bankStatementId?: number
  ): Promise<IoltaReconciliation> {
    // Determine if the reconciliation is balanced
    const isBalanced = difference === "0.00";
    
    // Create the reconciliation record
    const reconciliation = await this.createReconciliation({
      trustAccountId,
      merchantId,
      reconciliationDate,
      bookBalance,
      bankBalance,
      adjustedBookBalance,
      adjustedBankBalance,
      isBalanced,
      difference,
      reconciliationNotes,
      outstandingDeposits: JSON.stringify(outstandingDeposits),
      outstandingChecks: JSON.stringify(outstandingChecks),
      bankFeesAdjustment,
      interestEarnedAdjustment,
      otherAdjustments: JSON.stringify(otherAdjustments),
      bankStatementId,
      createdById,
      status: isBalanced ? "completed" : "discrepancy",
    });

    // If we have bank fees or interest earned, we might need to create adjustment transactions
    if (Number(bankFeesAdjustment) !== 0 || Number(interestEarnedAdjustment) !== 0) {
      // Implementation for creating adjustment transactions would go here
    }

    return reconciliation;
  }

  /**
   * Import bank statement CSV
   * This is a simplified example - in production, you'd need to handle various bank formats
   */
  async importBankStatementCSV(
    trustAccountId: number,
    merchantId: number,
    uploadedById: number,
    filePath: string,
    statementDate: Date,
    startDate: Date,
    endDate: Date,
    startingBalance: string,
    endingBalance: string
  ): Promise<BankStatementImportResult> {
    try {
      // First, create the bank statement record
      const bankStatement = await this.createBankStatement({
        trustAccountId,
        merchantId,
        statementDate,
        startDate,
        endDate,
        startingBalance,
        endingBalance,
        statementFileName: path.basename(filePath),
        statementFileLocation: filePath,
        uploadedById,
        processingStatus: "processing"
      });

      // Initialize result
      const result: BankStatementImportResult = {
        uploadId: bankStatement.id,
        processed: 0,
        matched: 0,
        unmatched: 0,
        newTransactions: 0,
        errors: []
      };

      // Get all transactions for the trust account within the date range
      const existingTransactions = await db
        .select()
        .from(ioltaTransactions)
        .where(
          and(
            eq(ioltaTransactions.trustAccountId, trustAccountId),
            eq(ioltaTransactions.status, "completed"),
            gte(ioltaTransactions.createdAt!, startDate),
            lte(ioltaTransactions.createdAt!, endDate)
          )
        );

      // Process the CSV file
      const transactions: any[] = [];
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            transactions.push(row);
            result.processed++;
          })
          .on('end', () => {
            resolve();
          })
          .on('error', (err) => {
            result.errors.push(`Error reading CSV: ${err.message}`);
            reject(err);
          });
      });

      // Process each transaction from the CSV
      for (const transaction of transactions) {
        try {
          // Here you would implement your matching logic based on the bank's CSV format
          // This is a simplified example
          const amount = parseFloat(transaction.amount);
          const date = new Date(transaction.date);
          const description = transaction.description;
          const checkNumber = transaction.checkNumber;
          const reference = transaction.reference;

          // Try to match with existing transactions
          let matched = false;
          for (const existingTx of existingTransactions) {
            // Matching criteria would depend on the bank format
            // This is a simplified example - you'd need more sophisticated matching in production
            if (
              existingTx.checkNumber === checkNumber && 
              Math.abs(Number(existingTx.amount) - Math.abs(amount)) < 0.01
            ) {
              // Mark as cleared
              await this.markTransactionCleared(existingTx.id, date, reference);
              result.matched++;
              matched = true;
              break;
            }
          }

          if (!matched) {
            result.unmatched++;
          }
        } catch (err: any) {
          result.errors.push(`Error processing transaction: ${err.message}`);
        }
      }

      // Update the bank statement record
      await db
        .update(ioltaBankStatements)
        .set({
          processingStatus: result.errors.length > 0 ? "error" : "completed",
          processingNotes: result.errors.length > 0 ? JSON.stringify(result.errors) : undefined
        })
        .where(eq(ioltaBankStatements.id, bankStatement.id));

      return result;
    } catch (error: any) {
      console.error("Error importing bank statement:", error);
      throw new Error(`Failed to import bank statement: ${error.message}`);
    }
  }

  /**
   * Get transactions for reconciliation
   */
  async getTransactionsForReconciliation(
    trustAccountId: number,
    startDate: Date,
    endDate: Date
  ): Promise<ReconciliationItem[]> {
    // Get all transactions for the date range
    const transactions = await db
      .select()
      .from(ioltaTransactions)
      .where(
        and(
          eq(ioltaTransactions.trustAccountId, trustAccountId),
          eq(ioltaTransactions.status, "completed"),
          gte(ioltaTransactions.createdAt!, startDate),
          lte(ioltaTransactions.createdAt!, endDate)
        )
      );

    // Format them as reconciliation items
    return transactions.map(t => ({
      transactionId: t.id,
      checkNumber: t.checkNumber,
      date: t.createdAt!,
      description: t.description,
      amount: t.amount,
      type: t.transactionType,
      clearedDate: t.clearedDate || undefined,
      status: t.clearedDate ? "cleared" : "outstanding"
    }));
  }
}