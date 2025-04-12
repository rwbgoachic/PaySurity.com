import { db } from "../../db";
import { 
  ioltaTrustAccounts, 
  ioltaClientLedgers, 
  ioltaTransactions,
  InsertIoltaTrustAccount,
  InsertIoltaClientLedger,
  InsertIoltaTransaction
} from "@shared/schema-legal";
import { eq, and, desc, sql, lt, gte, lte } from "drizzle-orm";
import { Decimal } from "decimal.js";
import { ioltaTransactionSqlService } from "./iolta-transaction-sql-service";

/**
 * IOLTA Service - Handles Interest on Lawyers Trust Accounts compliance
 * 
 * This service provides functionality for managing trust accounts, client ledgers,
 * and transactions in compliance with legal ethics rules:
 * 
 * 1. Automatic separation of earned and unearned funds
 * 2. Prevention of commingling client and operating funds
 * 3. Fee deduction from operating account only
 * 4. Audit trails for all trust accounting
 */
export class IoltaService {
  
  /**
   * Creates a new trust account
   */
  async createTrustAccount(data: InsertIoltaTrustAccount) {
    const [account] = await db.insert(ioltaTrustAccounts).values(data).returning();
    return account;
  }
  
  /**
   * Gets a trust account by ID
   */
  async getTrustAccount(id: number) {
    const [account] = await db.select().from(ioltaTrustAccounts).where(eq(ioltaTrustAccounts.id, id));
    return account;
  }
  
  /**
   * Gets all trust accounts for a merchant
   */
  async getTrustAccountsByMerchant(merchantId: number) {
    return await db.select().from(ioltaTrustAccounts).where(eq(ioltaTrustAccounts.merchantId, merchantId));
  }
  
  /**
   * Creates a new client ledger within a trust account
   */
  async createClientLedger(data: InsertIoltaClientLedger) {
    const [ledger] = await db.insert(ioltaClientLedgers).values(data).returning();
    return ledger;
  }
  
  /**
   * Gets a client ledger by ID or client ID
   * 
   * @param id The ID of the ledger or client to retrieve
   * @param isClientId If true, retrieve by client ID instead of ledger ID
   */
  async getClientLedger(id: number, isClientId: boolean = false) {
    let ledger;
    if (isClientId) {
      // Find by client ID (converted to string to match schema type)
      const [result] = await db.select().from(ioltaClientLedgers).where(eq(ioltaClientLedgers.clientId, id.toString()));
      ledger = result;
    } else {
      // Find by ledger ID
      const [result] = await db.select().from(ioltaClientLedgers).where(eq(ioltaClientLedgers.id, id));
      ledger = result;
    }
    return ledger;
  }
  
  /**
   * Gets all client ledgers for a trust account
   */
  async getClientLedgersByTrustAccount(trustAccountId: number) {
    return await db.select().from(ioltaClientLedgers).where(eq(ioltaClientLedgers.trustAccountId, trustAccountId));
  }
  
  /**
   * Gets all client ledgers for a merchant
   */
  async getClientLedgersByMerchant(merchantId: number) {
    return await db.select().from(ioltaClientLedgers).where(eq(ioltaClientLedgers.merchantId, merchantId));
  }
  
  /**
   * Records a transaction in the IOLTA system
   * This will update both the client ledger balance and the trust account balance
   * 
   * This implementation uses our direct SQL service to ensure proper handling of
   * balance calculations and updates in the database
   */
  async recordTransaction(data: InsertIoltaTransaction) {
    try {
      // Verify the client ledger exists
      const ledger = await this.getClientLedger(data.clientLedgerId);
      if (!ledger) {
        throw new Error("Client ledger not found");
      }
      
      // Verify the trust account exists
      const account = await this.getTrustAccount(data.trustAccountId);
      if (!account) {
        throw new Error("Trust account not found");
      }
      
      // Use the SQL service to create the transaction with proper balance handling
      const result = await ioltaTransactionSqlService.createTransaction({
        merchantId: data.merchantId,
        trustAccountId: data.trustAccountId,
        clientLedgerId: data.clientLedgerId,
        amount: data.amount,
        description: data.description,
        transactionType: data.transactionType as any, // type conversion
        fundType: data.fundType as any, // type conversion
        createdBy: data.createdBy,
        status: data.status as any, // type conversion
        checkNumber: data.checkNumber,
        referenceNumber: data.referenceNumber,
        payee: data.payee,
        payor: data.payor,
        notes: data.notes,
        bankReference: data.bankReference
      });
      
      // Return the created transaction
      return result.transaction;
    } catch (error) {
      // Log the error and rethrow
      console.error('Error recording IOLTA transaction:', error);
      throw error;
    }
  }
  
  /**
   * Gets a transaction by ID
   */
  async getTransaction(id: number) {
    try {
      // Use SQL service for consistent transaction handling
      return await ioltaTransactionSqlService.getTransaction(id);
    } catch (error) {
      console.error('Error getting IOLTA transaction:', error);
      throw error;
    }
  }
  
  /**
   * Gets transactions for a client ledger
   */
  async getTransactionsByClientLedger(clientLedgerId: number) {
    try {
      // Use SQL service for consistent transaction handling
      return await ioltaTransactionSqlService.getClientLedgerTransactions(clientLedgerId);
    } catch (error) {
      console.error('Error getting IOLTA client ledger transactions:', error);
      throw error;
    }
  }
  
  /**
   * Gets transactions for a trust account
   */
  async getTransactionsByTrustAccount(trustAccountId: number) {
    return await db.select().from(ioltaTransactions)
      .where(eq(ioltaTransactions.trustAccountId, trustAccountId))
      .orderBy(desc(ioltaTransactions.createdAt));
  }
  
  /**
   * Gets client ledger statement with transactions
   */
  async getClientLedgerStatement(clientLedgerId: number, startDate?: Date, endDate?: Date) {
    // Get the client ledger
    const [ledger] = await db.select().from(ioltaClientLedgers).where(eq(ioltaClientLedgers.id, clientLedgerId));
    if (!ledger) {
      throw new Error("Client ledger not found");
    }
    
    // Build query for transactions
    let query = db.select().from(ioltaTransactions)
      .where(eq(ioltaTransactions.clientLedgerId, clientLedgerId));
    
    // Add date filters if provided
    if (startDate && endDate) {
      query = query.where(
        and(
          ioltaTransactions.createdAt >= startDate,
          ioltaTransactions.createdAt <= endDate
        )
      );
    } else if (startDate) {
      query = query.where(ioltaTransactions.createdAt >= startDate);
    } else if (endDate) {
      query = query.where(ioltaTransactions.createdAt <= endDate);
    }
    
    // Order by date
    const transactions = await query.orderBy(ioltaTransactions.createdAt);
    
    // Calculate opening and closing balances
    let openingBalance = "0.00";
    if (startDate && transactions.length > 0) {
      // Find the sum of all transactions before the start date
      const priorTransactions = await db.select().from(ioltaTransactions)
        .where(
          and(
            eq(ioltaTransactions.clientLedgerId, clientLedgerId),
            ioltaTransactions.createdAt < startDate
          )
        );
        
      let balance = new Decimal(0);
      for (const tx of priorTransactions) {
        if (tx.transactionType === "deposit") {
          balance = balance.plus(tx.amount);
        } else if (tx.transactionType === "withdrawal" || tx.transactionType === "payment") {
          balance = balance.minus(tx.amount);
        }
        // For transfers, need to check if it's incoming or outgoing
        // This is simplified and might need more complex logic depending on how transfers are recorded
      }
      
      openingBalance = balance.toString();
    }
    
    const closingBalance = ledger.balance;
    
    // Return the statement
    return {
      ledger,
      transactions,
      openingBalance,
      closingBalance,
      startDate,
      endDate,
      generatedAt: new Date()
    };
  }
  
  /**
   * Gets client ledger balances for a trust account
   */
  async getClientLedgerBalances(trustAccountId: number) {
    // Get all client ledgers for this trust account
    const clientLedgers = await db.select().from(ioltaClientLedgers)
      .where(eq(ioltaClientLedgers.trustAccountId, trustAccountId));
    
    // Calculate total balance
    let totalBalance = new Decimal(0);
    for (const ledger of clientLedgers) {
      totalBalance = totalBalance.plus(ledger.balance || '0.00');
    }
    
    return {
      clientLedgers,
      totalBalance: totalBalance.toString()
    };
  }

  /**
   * Gets trust account reconciliation report
   */
  async getTrustAccountReconciliation(trustAccountId: number, reconciliationDate: Date = new Date()) {
    // Get the trust account
    const [account] = await db.select().from(ioltaTrustAccounts).where(eq(ioltaTrustAccounts.id, trustAccountId));
    if (!account) {
      throw new Error("Trust account not found");
    }
    
    // Get all client ledgers for this trust account
    const clientLedgers = await db.select().from(ioltaClientLedgers)
      .where(eq(ioltaClientLedgers.trustAccountId, trustAccountId));
    
    // Sum up all client ledger balances
    let totalClientBalances = new Decimal(0);
    for (const ledger of clientLedgers) {
      totalClientBalances = totalClientBalances.plus(ledger.balance);
    }
    
    // Get recent transactions for the reconciliation
    const recentTransactions = await db.select().from(ioltaTransactions)
      .where(eq(ioltaTransactions.trustAccountId, trustAccountId))
      .orderBy(desc(ioltaTransactions.createdAt))
      .limit(50);  // Limit to recent transactions
    
    // Return the reconciliation report
    return {
      account,
      reconciliationDate,
      trustAccountBalance: account.balance,
      totalClientLedgerBalances: totalClientBalances.toString(),
      difference: new Decimal(account.balance).minus(totalClientBalances).toString(),
      clientLedgers,
      recentTransactions,
      generatedAt: new Date(),
      isBalanced: new Decimal(account.balance).equals(totalClientBalances)
    };
  }
}

export const ioltaService = new IoltaService();