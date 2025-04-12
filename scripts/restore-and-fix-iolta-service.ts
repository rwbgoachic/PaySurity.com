/**
 * Restore and Fix IOLTA Service
 * 
 * This script:
 * 1. Creates a backup of the current iolta-service.ts file
 * 2. Restores the file to its original state
 * 3. Adds targeted fixes for the client ledger creation issue
 * 
 * Run with: npx tsx scripts/restore-and-fix-iolta-service.ts
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function restoreAndFixIoltaService() {
  console.log("Starting restore and fix for IOLTA service...");
  
  try {
    const servicePath = path.join(process.cwd(), 'server/services/legal/iolta-service.ts');
    
    // 1. Create a backup of the current file
    if (fs.existsSync(servicePath)) {
      const backupPath = `${servicePath}.bak`;
      fs.copyFileSync(servicePath, backupPath);
      console.log(`Created backup at ${backupPath}`);
    }
    
    // 2. Get the original version from Git history
    // This approach assumes the original file is in the Git history
    try {
      const originalContent = execSync('git show HEAD~5:server/services/legal/iolta-service.ts', { 
        stdio: ['pipe', 'pipe', 'ignore'] 
      }).toString();
      
      fs.writeFileSync(servicePath, originalContent);
      console.log("Restored original iolta-service.ts file from Git history");
    } catch (gitError) {
      console.log("Could not restore from Git, using a clean template");
      
      // If we can't get from Git, we'll create a clean implementation
      const cleanTemplate = createCleanTemplate();
      fs.writeFileSync(servicePath, cleanTemplate);
      console.log("Created clean implementation of iolta-service.ts");
    }
    
    // 3. Now apply our targeted fix for client ledger creation
    let content = fs.readFileSync(servicePath, 'utf8');
    
    // Find the createClientLedger method
    const methodStart = content.indexOf('async createClientLedger(data: InsertIoltaClientLedger)');
    if (methodStart === -1) {
      throw new Error('Could not find createClientLedger method');
    }
    
    // Find method body start and end
    const bodyStart = content.indexOf('{', methodStart) + 1;
    let bodyEnd = bodyStart;
    let braceCount = 1;
    
    while (braceCount > 0 && bodyEnd < content.length) {
      bodyEnd++;
      if (content[bodyEnd] === '{') braceCount++;
      if (content[bodyEnd] === '}') braceCount--;
    }
    
    // Extract the original method body
    const originalBody = content.substring(bodyStart, bodyEnd);
    
    // Replace with our fixed version that handles the jurisdiction field properly
    const newBody = `
    try {
      console.log("Creating client ledger with data:", JSON.stringify(data, null, 2));
      
      // Make sure we include the jurisdiction field
      if (!data.jurisdiction) {
        data.jurisdiction = "Unknown";
      }
      
      // Use the normal Drizzle ORM insert, but with more explicit error handling
      const [ledger] = await db.insert(ioltaClientLedgers).values(data).returning();
      console.log("Created client ledger:", JSON.stringify(ledger, null, 2));
      return ledger;
    } catch (error) {
      console.error("Error creating client ledger:", error);
      
      // If there's a column not found error, try direct SQL as a fallback
      if (error.message && (
          error.message.includes("column") || 
          error.message.includes("does not exist")
      )) {
        console.log("Attempting direct SQL insert as fallback");
        
        // Fall back to direct SQL insert to bypass schema validation
        const result = await db.execute(sql\`
          INSERT INTO iolta_client_ledgers (
            merchant_id, trust_account_id, client_id, client_name,
            matter_name, matter_number, balance, current_balance,
            status, notes, jurisdiction
          ) VALUES (
            \${data.merchantId}, \${data.trustAccountId}, \${data.clientId}, \${data.clientName},
            \${data.matterName || null}, \${data.matterNumber || null}, \${data.balance || '0.00'}, 
            \${data.currentBalance || '0.00'}, \${data.status || 'active'}, \${data.notes || null},
            \${data.jurisdiction || 'Unknown'}
          )
          RETURNING *;
        \`);
        
        if (!result.rows || result.rows.length === 0) {
          throw new Error('Failed to create client ledger with direct SQL');
        }
        
        return result.rows[0];
      }
      
      // Re-throw the original error
      throw error;
    }`;
    
    // Replace the method body
    content = content.substring(0, bodyStart) + newBody + content.substring(bodyEnd);
    
    // Write the updated file
    fs.writeFileSync(servicePath, content);
    
    console.log("✅ Successfully fixed createClientLedger method in iolta-service.ts");
    
  } catch (error) {
    console.error("Error during restore and fix:", error);
    process.exit(1);
  }
}

function createCleanTemplate() {
  return `/**
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

import { db } from '../../db';
import { sql, eq, and, desc } from 'drizzle-orm';
import { Decimal } from 'decimal.js';

import {
  ioltaTrustAccounts,
  ioltaClientLedgers,
  ioltaTransactions,
  InsertIoltaTrustAccount,
  InsertIoltaClientLedger,
  InsertIoltaTransaction
} from '@shared/schema-legal';

import { ioltaTransactionSqlService } from './iolta-transaction-sql-service';

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
        transactionType: data.transactionType,
        fundType: data.fundType,
        createdBy: data.createdBy,
        status: data.status,
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
    
    // Get transactions for this client ledger
    const transactions = await this.getTransactionsByClientLedger(clientLedgerId);
    
    // Filter by date if provided
    let filteredTransactions = transactions;
    if (startDate || endDate) {
      filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        if (startDate && endDate) {
          return txDate >= startDate && txDate <= endDate;
        } else if (startDate) {
          return txDate >= startDate;
        } else if (endDate) {
          return txDate <= endDate;
        }
        return true;
      });
    }
    
    // Calculate opening balance
    let openingBalance = "0.00";
    if (startDate && transactions.length > 0) {
      // Calculate balance from transactions before start date
      const priorTransactions = transactions.filter(tx => 
        new Date(tx.createdAt) < startDate
      );
      
      let balance = new Decimal(0);
      for (const tx of priorTransactions) {
        if (tx.transactionType === "deposit") {
          balance = balance.plus(tx.amount);
        } else if (tx.transactionType === "withdrawal") {
          balance = balance.minus(tx.amount);
        }
      }
      
      openingBalance = balance.toString();
    }
    
    // Return the statement
    return {
      ledger,
      transactions: filteredTransactions,
      openingBalance,
      closingBalance: ledger.balance,
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
    const clientLedgers = await this.getClientLedgersByTrustAccount(trustAccountId);
    
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
    const account = await this.getTrustAccount(trustAccountId);
    if (!account) {
      throw new Error("Trust account not found");
    }
    
    // Get all client ledgers for this trust account
    const clientLedgers = await this.getClientLedgersByTrustAccount(trustAccountId);
    
    // Sum up all client ledger balances
    let totalClientBalances = new Decimal(0);
    for (const ledger of clientLedgers) {
      totalClientBalances = totalClientBalances.plus(ledger.balance);
    }
    
    // Get recent transactions
    const recentTransactions = await this.getTransactionsByTrustAccount(trustAccountId);
    
    // Return the reconciliation report
    return {
      account,
      reconciliationDate,
      trustAccountBalance: account.balance,
      totalClientLedgerBalances: totalClientBalances.toString(),
      difference: new Decimal(account.balance).minus(totalClientBalances).toString(),
      clientLedgers,
      recentTransactions: recentTransactions.slice(0, 50), // Limit to 50 most recent
      generatedAt: new Date(),
      isBalanced: new Decimal(account.balance).equals(totalClientBalances)
    };
  }
}

export const ioltaService = new IoltaService();
`;
}

// Run the fix
restoreAndFixIoltaService()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });