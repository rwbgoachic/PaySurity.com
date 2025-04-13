import { db } from "../../db";
import { eq, and, between, desc, sql, lt, gt, gte, lte, isNotNull } from "drizzle-orm";
import { 
  ioltaTransactions, 
  ioltaClientLedgers,
  ioltaTrustAccounts,
  IoltaTransaction
} from "../../../shared/schema";
import { 
  ioltaReconciliations,
  ioltaBankStatements,
  InsertIoltaReconciliation,
  InsertIoltaBankStatement,
  IoltaReconciliation,
  IoltaBankStatement
} from "../../../shared/schema-legal";
import { format } from "date-fns"; // Using date-fns instead of getCurrentDateFormatted
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
   * Get all reconciliations for a trust account with merchant access control
   * 
   * First checks if the trust account belongs to the given merchant for security
   */
  async getReconciliations(trustAccountId: number, merchantId: number): Promise<IoltaReconciliation[]> {
    // First verify the trust account belongs to the merchant
    const trustAccount = await db.query.ioltaTrustAccounts.findFirst({
      where: and(
        eq(ioltaTrustAccounts.id, trustAccountId),
        eq(ioltaTrustAccounts.merchantId, merchantId)
      )
    });
    
    if (!trustAccount) {
      throw new Error('Trust account not found or unauthorized');
    }
    
    // Now get the reconciliations for the validated trust account
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
    reconcilerId: number,
    reconciliationDate: Date,
    bookBalance: string,
    bankBalance: string,
    difference: string,
    outstandingChecks: OutstandingItem[],
    outstandingDeposits: OutstandingItem[],
    notes?: string,
    bankStatement?: any,
    reviewerId?: number,
    reviewedAt?: Date
  ): Promise<IoltaReconciliation> {
    // Determine if the reconciliation is balanced
    const isBalanced = difference === "0.00";
    
    // Create the reconciliation record
    const reconciliation = await this.createReconciliation({
      trustAccountId,
      merchantId,
      reconciliationDate,
      bankStatement: bankStatement ? JSON.stringify(bankStatement) : null,
      bookBalance,
      bankBalance,
      difference,
      isBalanced,
      notes,
      reconcilerId,
      reviewerId,
      reviewedAt,
      status: isBalanced ? "completed" : "draft"
    });

    // In the future we might add handling for bank fees or interest adjustments
    // Implementation for creating adjustment transactions would go here

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
  
  /**
   * Generate a comprehensive reconciliation report for an IOLTA account
   */
  async generateReconciliationReport(
    accountId: number,
    merchantId: number,
    startDate: Date | string,
    endDate: Date | string
  ): Promise<{
    accountId: number;
    account: any;
    clientLedgers: any[];
    transactions: any[];
    startingBalance: string;
    endingBalance: string;
    deposits: any[];
    withdrawals: any[];
    calculatedBalance: string;
    reconciliationDate: Date;
  }> {
    try {
      // Convert string dates to Date objects if necessary
      const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
      const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
      
      // Get the trust account details
      const account = await this.ioltaService.getTrustAccount(accountId);
      if (!account || account.merchantId !== merchantId) {
        throw new Error('Trust account not found or unauthorized');
      }
      
      // Get client ledgers associated with this trust account
      const clientLedgers = await this.ioltaService.getClientLedgersByTrustAccount(accountId);
      
      // Calculate total balance from client ledgers
      const totalClientBalance = clientLedgers.reduce(
        (sum, ledger) => sum + Number(ledger.currentBalance || 0),
        0
      ).toFixed(2);
      
      // Get transactions for the period
      const transactions = await db
        .select()
        .from(ioltaTransactions)
        .where(
          and(
            eq(ioltaTransactions.trustAccountId, accountId),
            eq(ioltaTransactions.status, "completed"),
            gte(ioltaTransactions.createdAt!, startDateObj),
            lte(ioltaTransactions.createdAt!, endDateObj)
          )
        )
        .orderBy(ioltaTransactions.createdAt!);
      
      // Calculate starting balance by looking at transactions before the start date
      const startingBalanceResult = await db.execute(sql`
        SELECT COALESCE(SUM(
          CASE 
            WHEN transaction_type = 'deposit' THEN CAST(amount AS DECIMAL)
            WHEN transaction_type IN ('withdrawal', 'payment', 'transfer', 'fee') THEN -CAST(amount AS DECIMAL)
            ELSE 0
          END
        ), 0) as starting_balance
        FROM iolta_transactions
        WHERE trust_account_id = ${accountId}
        AND status = 'completed'
        AND created_at < ${startDateObj.toISOString()}
      `);
      
      let startingBalance = "0.00";
      if (startingBalanceResult?.rows?.[0]?.starting_balance) {
        startingBalance = Number(startingBalanceResult.rows[0].starting_balance).toFixed(2);
      }
      
      // Split transactions into deposits and withdrawals for the report
      const deposits = transactions.filter(t => 
        t.transactionType === 'deposit' || 
        (t.transactionType === 'transfer' && Number(t.amount) > 0)
      );
      
      const withdrawals = transactions.filter(t => 
        t.transactionType === 'withdrawal' || 
        t.transactionType === 'payment' || 
        t.transactionType === 'fee' ||
        (t.transactionType === 'transfer' && Number(t.amount) < 0)
      );
      
      // Calculate ending balance
      const depositsTotal = deposits.reduce((sum, t) => sum + Number(t.amount), 0);
      const withdrawalsTotal = withdrawals.reduce((sum, t) => sum + Number(t.amount), 0);
      const endingBalance = (Number(startingBalance) + depositsTotal - withdrawalsTotal).toFixed(2);
      
      return {
        accountId,
        account,
        clientLedgers,
        transactions,
        startingBalance,
        endingBalance,
        deposits,
        withdrawals,
        calculatedBalance: totalClientBalance,
        reconciliationDate: new Date()
      };
    } catch (error) {
      console.error("Error generating reconciliation report:", error);
      throw new Error(`Failed to generate reconciliation report: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Generate a reconciliation report for a specific client's IOLTA ledger
   */
  async generateClientReconciliationReport(
    clientId: number | string,
    accountId: number,
    merchantId: number,
    startDate: Date | string,
    endDate: Date | string
  ): Promise<{
    clientId: string;
    accountId: number;
    ledger: any;
    transactions: any[];
    startingBalance: string;
    endingBalance: string;
    deposits: any[];
    withdrawals: any[];
    reconciliationDate: Date;
  }> {
    try {
      // Convert string dates to Date objects if necessary
      const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
      const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
      
      // Get the client ledger
      const ledger = await this.ioltaService.getClientLedger(clientId.toString(), accountId, merchantId);
      if (!ledger) {
        throw new Error('Client ledger not found');
      }
      
      // First, get the client ledger ID(s) for this client and trust account
      const clientLedgers = await db
        .select()
        .from(ioltaClientLedgers)
        .where(
          and(
            eq(ioltaClientLedgers.trustAccountId, accountId),
            eq(ioltaClientLedgers.clientId, clientId.toString())
          )
        );
      
      if (!clientLedgers || clientLedgers.length === 0) {
        throw new Error(`No client ledger found for client ID ${clientId} in trust account ${accountId}`);
      }
      
      // Get the client ledger IDs
      const clientLedgerIds = clientLedgers.map(ledger => ledger.id);
      
      // Get transactions for these client ledgers in the period
      const transactions = await db
        .select()
        .from(ioltaTransactions)
        .where(
          and(
            eq(ioltaTransactions.trustAccountId, accountId),
            eq(ioltaTransactions.status, "completed"),
            inArray(ioltaTransactions.clientLedgerId, clientLedgerIds),
            gte(ioltaTransactions.createdAt!, startDateObj),
            lte(ioltaTransactions.createdAt!, endDateObj)
          )
        )
        .orderBy(ioltaTransactions.createdAt!);
      
      // Calculate starting balance by looking at transactions before the start date
      const clientLedgerIdsArray = clientLedgerIds.map(id => id.toString());
      const clientLedgerIdsString = clientLedgerIdsArray.join(',');
      
      console.log(`Client Ledger IDs: ${clientLedgerIdsString}`);
      
      // Debug the query
      const startBalanceQuery = sql`
        SELECT COALESCE(SUM(
          CASE 
            WHEN transaction_type = 'deposit' THEN CAST(amount AS DECIMAL)
            WHEN transaction_type IN ('withdrawal', 'payment', 'transfer', 'fee') THEN -CAST(amount AS DECIMAL)
            ELSE 0
          END
        ), 0) as starting_balance
        FROM iolta_transactions
        WHERE trust_account_id = ${accountId}
        AND client_ledger_id IN (${sql.raw(clientLedgerIdsString)})
        AND status = 'completed'
        AND created_at < ${startDateObj.toISOString()}
      `;
      
      console.log("SQL Query for starting balance:", startBalanceQuery);
      
      const startingBalanceResult = await db.execute(startBalanceQuery);
      
      let startingBalance = "0.00";
      if (startingBalanceResult?.rows?.[0]?.starting_balance) {
        startingBalance = Number(startingBalanceResult.rows[0].starting_balance).toFixed(2);
      }
      
      // Split transactions into deposits and withdrawals for the report
      const deposits = transactions.filter(t => 
        t.transactionType === 'deposit' || 
        (t.transactionType === 'transfer' && Number(t.amount) > 0)
      );
      
      const withdrawals = transactions.filter(t => 
        t.transactionType === 'withdrawal' || 
        t.transactionType === 'payment' || 
        t.transactionType === 'fee' ||
        (t.transactionType === 'transfer' && Number(t.amount) < 0)
      );
      
      // Calculate ending balance
      const depositsTotal = deposits.reduce((sum, t) => sum + Number(t.amount), 0);
      const withdrawalsTotal = withdrawals.reduce((sum, t) => sum + Number(t.amount), 0);
      const endingBalance = (Number(startingBalance) + depositsTotal - withdrawalsTotal).toFixed(2);
      
      return {
        clientId: clientId.toString(),
        accountId,
        ledger,
        transactions,
        startingBalance,
        endingBalance,
        deposits,
        withdrawals,
        reconciliationDate: new Date()
      };
    } catch (error) {
      console.error("Error generating client reconciliation report:", error);
      throw new Error(`Failed to generate client reconciliation report: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}