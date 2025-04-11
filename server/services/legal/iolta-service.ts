import { db } from "../../db";
import { 
  ioltaTrustAccounts, 
  ioltaClientLedgers, 
  ioltaTransactions,
  InsertIoltaTrustAccount,
  InsertIoltaClientLedger,
  InsertIoltaTransaction
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { Decimal } from "decimal.js";

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
   * Gets a client ledger by ID
   */
  async getClientLedger(id: number) {
    const [ledger] = await db.select().from(ioltaClientLedgers).where(eq(ioltaClientLedgers.id, id));
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
   */
  async recordTransaction(data: InsertIoltaTransaction) {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Insert the transaction record
      const [transaction] = await tx.insert(ioltaTransactions).values({
        ...data,
        processedAt: new Date()
      }).returning();
      
      // Get the client ledger
      const [ledger] = await tx.select().from(ioltaClientLedgers).where(eq(ioltaClientLedgers.id, data.clientLedgerId));
      if (!ledger) {
        throw new Error("Client ledger not found");
      }
      
      // Get the trust account
      const [account] = await tx.select().from(ioltaTrustAccounts).where(eq(ioltaTrustAccounts.id, data.trustAccountId));
      if (!account) {
        throw new Error("Trust account not found");
      }
      
      // Calculate new balances based on transaction type
      let ledgerBalanceChange = new Decimal(0);
      let accountBalanceChange = new Decimal(0);
      
      switch (data.transactionType) {
        case "deposit":
          ledgerBalanceChange = new Decimal(data.amount);
          accountBalanceChange = new Decimal(data.amount);
          break;
        case "withdrawal":
          ledgerBalanceChange = new Decimal(data.amount).negated();
          accountBalanceChange = new Decimal(data.amount).negated();
          break;
        case "transfer":
          // If transferring between clients in the same trust account, 
          // account balance doesn't change, but client ledger does
          ledgerBalanceChange = new Decimal(data.amount).negated();
          // No change to the account balance for internal transfers
          break;
        case "payment":
          // For payments, always reduce the client ledger
          ledgerBalanceChange = new Decimal(data.amount).negated();
          
          // If the fund type is "earned", these funds are moved out of trust
          if (data.fundType === "earned" || data.fundType === "operating") {
            accountBalanceChange = new Decimal(data.amount).negated();
          }
          break;
      }
      
      // Update the client ledger balance
      const newLedgerBalance = new Decimal(ledger.balance).plus(ledgerBalanceChange).toString();
      await tx.update(ioltaClientLedgers)
        .set({ balance: newLedgerBalance, updatedAt: new Date() })
        .where(eq(ioltaClientLedgers.id, data.clientLedgerId));
      
      // Update the trust account balance
      if (!accountBalanceChange.isZero()) {
        const newAccountBalance = new Decimal(account.balance).plus(accountBalanceChange).toString();
        await tx.update(ioltaTrustAccounts)
          .set({ balance: newAccountBalance, updatedAt: new Date() })
          .where(eq(ioltaTrustAccounts.id, data.trustAccountId));
      }
      
      return transaction;
    });
  }
  
  /**
   * Gets a transaction by ID
   */
  async getTransaction(id: number) {
    const [transaction] = await db.select().from(ioltaTransactions).where(eq(ioltaTransactions.id, id));
    return transaction;
  }
  
  /**
   * Gets transactions for a client ledger
   */
  async getTransactionsByClientLedger(clientLedgerId: number) {
    return await db.select().from(ioltaTransactions)
      .where(eq(ioltaTransactions.clientLedgerId, clientLedgerId))
      .orderBy(desc(ioltaTransactions.createdAt));
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