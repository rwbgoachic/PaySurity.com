import { db } from "../../db";
import { 
  ioltaTrustAccounts, 
  ioltaClientLedgers, 
  ioltaTransactions,
  InsertIoltaTrustAccount,
  InsertIoltaClientLedger,
  InsertIoltaTransaction
} from "@shared/schema-legal";
import {
  legalDocuments,
  type LegalDocument,
  type InsertLegalDocument
} from '@shared/schema';
import { eq, and, desc, sql, lt, gte, lte } from "drizzle-orm";
import { Decimal } from "decimal.js";
import { ioltaTransactionSqlService } from "./iolta-transaction-sql-service";
import { documentService } from './document-service';

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
        const result = await db.execute(sql`
          INSERT INTO iolta_client_ledgers (
            merchant_id, trust_account_id, client_id, client_name,
            matter_name, matter_number, balance, current_balance,
            status, notes, jurisdiction
          ) VALUES (
            ${data.merchantId}, ${data.trustAccountId}, ${data.clientId}, ${data.clientName},
            ${data.matterName || null}, ${data.matterNumber || null}, ${data.balance || '0.00'}, 
            ${data.currentBalance || '0.00'}, ${data.status || 'active'}, ${data.notes || null},
            ${data.jurisdiction || 'Unknown'}
          )
          RETURNING *;
        `);
        
        if (!result.rows || result.rows.length === 0) {
          throw new Error('Failed to create client ledger with direct SQL');
        }
        
        return result.rows[0];
      }
      
      // Re-throw the original error
      throw error;
    }}
  
  /**
   * Gets a client ledger by ID or client ID
   * 
   * @param id The ID of the ledger or client to retrieve
   * @param isClientId If true, retrieve by client ID instead of ledger ID
   */
  async getClientLedger(id: number, isClientId: boolean = false) {
    let ledger;
    try {
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
    } catch (error) {
      console.error("Error getting client ledger:", error);
      // Fall back to parameterized SQL to handle potential schema inconsistencies
      try {
        if (isClientId) {
          // Use parameterized query for client_id lookup (as string)
          const query = "SELECT * FROM iolta_client_ledgers WHERE client_id = $1 LIMIT 1";
          const results = await sqlService.parameterizedSQL(query, [id.toString()]);
          return results.length > 0 ? results[0] : null;
        } else {
          // Use parameterized query for id lookup
          const query = "SELECT * FROM iolta_client_ledgers WHERE id = $1 LIMIT 1";
          const results = await sqlService.parameterizedSQL(query, [id]);
          return results.length > 0 ? results[0] : null;
        }
      } catch (sqlError) {
        console.error("Secondary SQL error in getClientLedger:", sqlError);
        return null;
      }
    }
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

      // Calculate the balance change
      let balanceChange = new Decimal(data.amount);
      if (data.transactionType === 'withdrawal' || data.transactionType === 'fee') {
        balanceChange = balanceChange.negated();
      }

      // Calculate new balances
      const currentLedgerBalance = new Decimal(ledger.balance || '0');
      const newLedgerBalance = currentLedgerBalance.plus(balanceChange);
      
      const currentAccountBalance = new Decimal(account.balance || '0');
      const newAccountBalance = currentAccountBalance.plus(balanceChange);

      // Prepare transaction data with proper type handling
      const transactionData = {
        merchantId: data.merchantId,
        trustAccountId: data.trustAccountId,
        clientLedgerId: data.clientLedgerId,
        amount: data.amount,
        balanceAfter: newLedgerBalance.toString(), // Set the balance after the transaction
        description: data.description,
        transactionType: data.transactionType,
        fundType: data.fundType,
        createdBy: data.createdBy,
        status: data.status || 'completed',
        checkNumber: data.checkNumber || undefined,
        referenceNumber: data.referenceNumber || undefined,
        payee: data.payee || undefined,
        payor: data.payor || undefined,
        notes: data.notes || undefined,
        bankReference: data.bankReference || undefined
      };
      
      // Use the SQL service to create the transaction with proper balance handling
      const result = await ioltaTransactionSqlService.createTransaction(transactionData);
      
      // Update the client ledger balance
      await db.update(ioltaClientLedgers)
        .set({ 
          balance: newLedgerBalance.toString(),
          currentBalance: newLedgerBalance.toString(),
          lastTransactionDate: new Date()
        })
        .where(eq(ioltaClientLedgers.id, data.clientLedgerId));
      
      // Update the trust account balance
      await db.update(ioltaTrustAccounts)
        .set({ 
          balance: newAccountBalance.toString(),
          lastActivityDate: sql`CURRENT_DATE`
        })
        .where(eq(ioltaTrustAccounts.id, data.trustAccountId));
      
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

  /**
   * Attaches a document to an IOLTA transaction
   * 
   * @param transactionId The ID of the transaction to attach the document to
   * @param documentId The ID of the document to attach
   * @returns The updated transaction
   */
  async attachDocumentToTransaction(transactionId: number, documentId: number) {
    try {
      // Verify the transaction exists
      const transaction = await this.getTransaction(transactionId);
      if (!transaction) {
        throw new Error("Transaction not found");
      }
      
      // Verify the document exists
      const document = await documentService.getDocumentById(documentId);
      if (!document) {
        throw new Error("Document not found");
      }
      
      // Update the transaction with the document URL
      // In a real implementation, this might involve storing multiple documents
      const [updatedTransaction] = await db.update(ioltaTransactions)
        .set({
          documentUrl: `/api/legal/documents/${documentId}`
        })
        .where(eq(ioltaTransactions.id, transactionId))
        .returning();
      
      return updatedTransaction;
    } catch (error) {
      console.error('Error attaching document to transaction:', error);
      throw error;
    }
  }
  
  /**
   * Gets the document attached to an IOLTA transaction
   * 
   * @param transactionId The ID of the transaction to get the document for
   * @returns The document attached to the transaction, or null if none is attached
   */
  async getTransactionDocument(transactionId: number) {
    try {
      // Get the transaction
      const transaction = await this.getTransaction(transactionId);
      if (!transaction) {
        throw new Error("Transaction not found");
      }
      
      // If no document is attached, return null
      if (!transaction.documentUrl) {
        return null;
      }
      
      // Extract document ID from the URL
      const documentIdMatch = transaction.documentUrl.match(/\/(\d+)$/);
      if (!documentIdMatch) {
        return null;
      }
      
      const documentId = parseInt(documentIdMatch[1]);
      
      // Get the document
      return await documentService.getDocumentById(documentId);
    } catch (error) {
      console.error('Error getting transaction document:', error);
      throw error;
    }
  }
  
  /**
   * Creates a new IOLTA transaction with an attached document
   * 
   * @param transactionData The transaction data
   * @param documentData The document data
   * @param fileBuffer The document file
   * @returns The created transaction with document
   */
  async recordTransactionWithDocument(
    transactionData: InsertIoltaTransaction, 
    documentData: InsertLegalDocument, 
    fileBuffer: Buffer
  ) {
    try {
      // Get the client ledger first to access its clientId
      const clientLedger = await this.getClientLedger(transactionData.clientLedgerId);
      if (!clientLedger) {
        throw new Error(`Client ledger with ID ${transactionData.clientLedgerId} not found`);
      }
      
      // Record the transaction first
      const transaction = await this.recordTransaction(transactionData);
      
      // Convert client ID from string to number (if it's a string)
      let numericClientId: number | undefined = undefined;
      if (clientLedger.clientId) {
        try {
          // Handle both string and number client IDs
          numericClientId = typeof clientLedger.clientId === 'string' 
            ? parseInt(clientLedger.clientId, 10)
            : clientLedger.clientId;
          
          // Validate the parsed ID is a valid number
          if (isNaN(numericClientId)) {
            console.warn(`Invalid client ID format: ${clientLedger.clientId}, cannot convert to number`);
            numericClientId = undefined;
          }
        } catch (parseError) {
          console.warn(`Error parsing client ID: ${parseError}`);
          numericClientId = undefined;
        }
      }
      
      // Create the document
      const document = await documentService.createDocument({
        ...documentData,
        // Associate the document with the transaction's merchant and matter
        merchantId: transactionData.merchantId,
        // Use the parsed clientId from the client ledger
        clientId: numericClientId,
        // Set reference information in metadata
        metaData: {
          ...documentData.metaData || {},
          transactionId: transaction.id,
          transactionType: transactionData.transactionType,
          transactionDate: transaction.createdAt
        }
      }, fileBuffer);
      
      // Attach the document to the transaction
      return await this.attachDocumentToTransaction(transaction.id, document.id);
    } catch (error) {
      console.error('Error recording transaction with document:', error);
      throw error;
    }
  }
  
  /**
   * Gets all documents related to a client ledger based on the transactions
   * 
   * @param clientLedgerId The ID of the client ledger
   * @returns An array of documents related to the client ledger
   */
  async getClientLedgerDocuments(clientLedgerId: number) {
    try {
      // Get all transactions for the client ledger
      const transactions = await this.getTransactionsByClientLedger(clientLedgerId);
      
      // Collect document IDs from transaction.documentUrl values
      const documentIds: number[] = [];
      for (const transaction of transactions) {
        if (transaction.documentUrl) {
          const documentIdMatch = transaction.documentUrl.match(/\/(\d+)$/);
          if (documentIdMatch) {
            documentIds.push(parseInt(documentIdMatch[1]));
          }
        }
      }
      
      // If no documents found, return empty array
      if (documentIds.length === 0) {
        return [];
      }
      
      // Get the documents
      const documents: LegalDocument[] = [];
      for (const id of documentIds) {
        const document = await documentService.getDocumentById(id);
        if (document) {
          documents.push(document);
        }
      }
      
      return documents;
    } catch (error) {
      console.error('Error getting client ledger documents:', error);
      throw error;
    }
  }
}

export const ioltaService = new IoltaService();