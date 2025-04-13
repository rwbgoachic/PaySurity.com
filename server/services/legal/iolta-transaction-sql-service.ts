/**
 * IOLTA Transaction SQL Service
 * 
 * This service uses direct SQL queries to handle IOLTA transactions,
 * ensuring that balance calculations and updates work correctly by 
 * bypassing Drizzle ORM schema issues.
 */

import { db, pool } from '../../db';
import { sql } from 'drizzle-orm';
import * as schema from '../../../shared/schema-legal';
import { IoltaTransaction, InsertIoltaTransaction } from '../../../shared/schema-legal';
import { eq } from 'drizzle-orm';

interface CreateTransactionArgs {
  merchantId: number;
  trustAccountId: number;
  clientLedgerId: number;
  amount: string;
  description: string;
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'interest' | 'fee';
  fundType: 'retainer' | 'settlement' | 'trust' | 'operating' | 'other';
  createdBy: number;
  status?: 'pending' | 'completed' | 'voided' | 'rejected';
  checkNumber?: string;
  referenceNumber?: string;
  payee?: string;
  payor?: string;
  notes?: string;
  bankReference?: string;
}

interface TransactionResult {
  transaction: IoltaTransaction;
  updatedLedgerBalance: string;
  updatedAccountBalance: string;
}

/**
 * IOLTA Transaction SQL Service provides direct SQL implementations for
 * transaction-related operations, ensuring proper balance handling.
 */
export class IoltaTransactionSqlService {
  /**
   * Create a new IOLTA transaction using direct SQL
   * This bypasses Drizzle ORM issues with column mapping
   */
  async createTransaction(data: CreateTransactionArgs): Promise<TransactionResult> {
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Get current ledger balance
      const ledgerResult = await client.query(
        'SELECT current_balance FROM iolta_client_ledgers WHERE id = $1',
        [data.clientLedgerId]
      );
      
      if (ledgerResult.rows.length === 0) {
        throw new Error(`Client ledger with ID ${data.clientLedgerId} not found`);
      }
      
      let currentLedgerBalance = parseFloat(ledgerResult.rows[0].current_balance) || 0;
      
      // 2. Get current trust account balance
      const accountResult = await client.query(
        'SELECT balance FROM iolta_trust_accounts WHERE id = $1',
        [data.trustAccountId]
      );
      
      if (accountResult.rows.length === 0) {
        throw new Error(`Trust account with ID ${data.trustAccountId} not found`);
      }
      
      let currentAccountBalance = parseFloat(accountResult.rows[0].balance) || 0;
      
      // 3. Calculate new balances
      const amountValue = parseFloat(data.amount);
      let newLedgerBalance = currentLedgerBalance;
      let newAccountBalance = currentAccountBalance;
      
      if (data.transactionType === 'deposit') {
        newLedgerBalance += amountValue;
        newAccountBalance += amountValue;
      } else if (data.transactionType === 'withdrawal') {
        newLedgerBalance -= amountValue;
        newAccountBalance -= amountValue;
        
        // Verify sufficient funds
        if (newLedgerBalance < 0) {
          throw new Error('Insufficient funds in client ledger for withdrawal');
        }
        
        if (newAccountBalance < 0) {
          throw new Error('Insufficient funds in trust account for withdrawal');
        }
      } else if (data.transactionType === 'interest') {
        newLedgerBalance += amountValue;
        newAccountBalance += amountValue;
      } else if (data.transactionType === 'fee') {
        newLedgerBalance -= amountValue;
        newAccountBalance -= amountValue;
      }
      
      // 4. Insert the transaction with the calculated balance_after
      // Log parameters to help with debugging
      console.log('Transaction parameters:', {
        merchantId: data.merchantId,
        trustAccountId: data.trustAccountId,
        clientLedgerId: data.clientLedgerId,
        amount: data.amount,
        balanceAfter: newLedgerBalance.toString(), // This is the key field causing errors
        description: data.description,
        transactionType: data.transactionType,
        fundType: data.fundType
      });
      
      const insertResult = await client.query(
        `INSERT INTO iolta_transactions (
          merchant_id, 
          trust_account_id, 
          client_ledger_id, 
          transaction_date, 
          amount, 
          balance_after, 
          description, 
          transaction_type, 
          fund_type, 
          check_number, 
          reference_number, 
          payee, 
          payor, 
          status, 
          created_by, 
          notes, 
          bank_reference
        ) VALUES (
          $1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6, $7, $8, $9, 
          $10, $11, $12, $13, $14, $15, $16
        ) RETURNING *`,
        [
          data.merchantId,
          data.trustAccountId,
          data.clientLedgerId,
          data.amount,
          newLedgerBalance.toString(), // The balance_after value - ensuring string format
          data.description,
          data.transactionType,
          data.fundType,
          data.checkNumber || null,
          data.referenceNumber || null,
          data.payee || null,
          data.payor || null,
          data.status || 'completed',
          data.createdBy,
          data.notes || null,
          data.bankReference || null
        ]
      );
      
      const transaction = insertResult.rows[0];
      
      // 5. Update the client ledger balance
      await client.query(
        'UPDATE iolta_client_ledgers SET current_balance = $1, balance = $1, last_transaction_date = CURRENT_TIMESTAMP WHERE id = $2',
        [newLedgerBalance.toString(), data.clientLedgerId]
      );
      
      // 6. Update the trust account balance
      await client.query(
        'UPDATE iolta_trust_accounts SET balance = $1 WHERE id = $2',
        [newAccountBalance.toString(), data.trustAccountId]
      );
      
      // Commit the transaction
      await client.query('COMMIT');
      
      // Convert the raw transaction to the expected format
      const formattedTransaction: IoltaTransaction = {
        id: transaction.id,
        merchantId: transaction.merchant_id,
        trustAccountId: transaction.trust_account_id,
        clientLedgerId: transaction.client_ledger_id,
        transactionDate: transaction.transaction_date,
        amount: transaction.amount,
        balanceAfter: transaction.balance_after,
        description: transaction.description,
        transactionType: transaction.transaction_type,
        fundType: transaction.fund_type,
        checkNumber: transaction.check_number,
        reference: transaction.reference,
        referenceNumber: transaction.reference_number,
        payee: transaction.payee,
        payor: transaction.payor,
        status: transaction.status,
        createdBy: transaction.created_by,
        approvedBy: transaction.approved_by,
        approvedAt: transaction.approved_at,
        voidedBy: transaction.voided_by,
        voidedAt: transaction.voided_at,
        voidReason: transaction.void_reason,
        documentUrl: transaction.document_url,
        payment_method_id: transaction.payment_method_id,
        related_invoice_id: transaction.related_invoice_id,
        notes: transaction.notes,
        earningDate: transaction.earning_date,
        clearedDate: transaction.cleared_date,
        bankReference: transaction.bank_reference,
        reconciliationId: transaction.reconciliation_id,
        processedAt: transaction.processed_at,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      };
      
      return {
        transaction: formattedTransaction,
        updatedLedgerBalance: newLedgerBalance.toString(),
        updatedAccountBalance: newAccountBalance.toString()
      };
      
    } catch (error) {
      // Rollback in case of an error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  }
  
  /**
   * Get a transaction by ID
   */
  async getTransaction(id: number): Promise<IoltaTransaction | null> {
    const result = await db.select().from(schema.ioltaTransactions).where(eq(schema.ioltaTransactions.id, id));
    return result[0] || null;
  }
  
  /**
   * Get transactions for a client ledger
   */
  async getClientLedgerTransactions(clientLedgerId: number): Promise<IoltaTransaction[]> {
    // Use raw SQL for consistency
    const result = await db.execute(sql`
      SELECT * FROM iolta_transactions 
      WHERE client_ledger_id = ${clientLedgerId}
      ORDER BY transaction_date DESC, id DESC
    `);
    
    return result.rows.map(row => ({
      id: row.id as number,
      merchantId: row.merchant_id as number,
      trustAccountId: row.trust_account_id as number,
      clientLedgerId: row.client_ledger_id as number,
      transactionDate: row.transaction_date as Date,
      amount: row.amount as string,
      balanceAfter: row.balance_after as string,
      description: row.description as string,
      transactionType: row.transaction_type as any,
      fundType: row.fund_type as any,
      checkNumber: row.check_number as string | null,
      reference: row.reference as string | null,
      referenceNumber: row.reference_number as string | null,
      payee: row.payee as string | null,
      payor: row.payor as string | null,
      status: row.status as any,
      createdBy: row.created_by as number,
      approvedBy: row.approved_by as number | null,
      approvedAt: row.approved_at as Date | null,
      voidedBy: row.voided_by as number | null,
      voidedAt: row.voided_at as Date | null,
      voidReason: row.void_reason as string | null,
      documentUrl: row.document_url as string | null,
      payment_method_id: row.payment_method_id as number | null,
      related_invoice_id: row.related_invoice_id as number | null,
      notes: row.notes as string | null,
      earningDate: row.earning_date as Date | null,
      clearedDate: row.cleared_date as Date | null,
      bankReference: row.bank_reference as string | null,
      reconciliationId: row.reconciliation_id as number | null,
      processedAt: row.processed_at as Date | null,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date
    }));
  }
  
  /**
   * Get client ledger balance including pending transactions
   */
  async getClientLedgerBalance(clientLedgerId: number): Promise<{ 
    currentBalance: string; 
    pendingBalance: string; 
    availableBalance: string; 
  }> {
    // Use raw SQL for consistency
    const result = await db.execute(sql`
      SELECT 
        cl.current_balance,
        COALESCE(SUM(
          CASE WHEN t.status = 'pending' AND t.transaction_type = 'deposit' THEN t.amount::numeric
               WHEN t.status = 'pending' AND t.transaction_type IN ('withdrawal', 'fee') THEN -t.amount::numeric
               ELSE 0
          END
        ), 0) as pending_amount
      FROM iolta_client_ledgers cl
      LEFT JOIN iolta_transactions t ON cl.id = t.client_ledger_id AND t.status = 'pending'
      WHERE cl.id = ${clientLedgerId}
      GROUP BY cl.id, cl.current_balance
    `);
    
    if (result.rows.length === 0) {
      throw new Error(`Client ledger with ID ${clientLedgerId} not found`);
    }
    
    const currentBalance = parseFloat(result.rows[0].current_balance as string) || 0;
    const pendingAmount = parseFloat(result.rows[0].pending_amount as string) || 0;
    
    return {
      currentBalance: currentBalance.toString(),
      pendingBalance: pendingAmount.toString(),
      availableBalance: (currentBalance + pendingAmount).toString()
    };
  }
  
  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    id: number, 
    status: 'pending' | 'completed' | 'voided' | 'rejected',
    userId: number
  ): Promise<IoltaTransaction> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get the transaction
      const txResult = await client.query(
        'SELECT * FROM iolta_transactions WHERE id = $1',
        [id]
      );
      
      if (txResult.rows.length === 0) {
        throw new Error(`Transaction with ID ${id} not found`);
      }
      
      const transaction = txResult.rows[0];
      const oldStatus = transaction.status;
      
      // Can't update if already in this status
      if (oldStatus === status) {
        throw new Error(`Transaction is already in ${status} status`);
      }
      
      // Handle different status changes
      if (status === 'completed' && oldStatus === 'pending') {
        // Update the ledger balance if completing a pending transaction
        const ledgerResult = await client.query(
          'SELECT current_balance FROM iolta_client_ledgers WHERE id = $1',
          [transaction.client_ledger_id]
        );
        
        if (ledgerResult.rows.length === 0) {
          throw new Error(`Client ledger with ID ${transaction.client_ledger_id} not found`);
        }
        
        let currentLedgerBalance = parseFloat(ledgerResult.rows[0].current_balance) || 0;
        const amount = parseFloat(transaction.amount);
        
        let newLedgerBalance = currentLedgerBalance;
        if (transaction.transaction_type === 'deposit') {
          newLedgerBalance += amount;
        } else if (transaction.transaction_type === 'withdrawal' || transaction.transaction_type === 'fee') {
          newLedgerBalance -= amount;
          
          // Verify sufficient funds
          if (newLedgerBalance < 0) {
            throw new Error('Insufficient funds in client ledger to complete transaction');
          }
        }
        
        // Update ledger balance
        await client.query(
          'UPDATE iolta_client_ledgers SET current_balance = $1, balance = $1, last_transaction_date = CURRENT_TIMESTAMP WHERE id = $2',
          [newLedgerBalance.toString(), transaction.client_ledger_id]
        );
        
        // Update transaction balance_after
        await client.query(
          'UPDATE iolta_transactions SET balance_after = $1 WHERE id = $2',
          [newLedgerBalance.toString(), id]
        );
        
        // Update the trust account balance
        const accountResult = await client.query(
          'SELECT balance FROM iolta_trust_accounts WHERE id = $1',
          [transaction.trust_account_id]
        );
        
        if (accountResult.rows.length === 0) {
          throw new Error(`Trust account with ID ${transaction.trust_account_id} not found`);
        }
        
        let currentAccountBalance = parseFloat(accountResult.rows[0].balance) || 0;
        let newAccountBalance = currentAccountBalance;
        
        if (transaction.transaction_type === 'deposit') {
          newAccountBalance += amount;
        } else if (transaction.transaction_type === 'withdrawal' || transaction.transaction_type === 'fee') {
          newAccountBalance -= amount;
        }
        
        await client.query(
          'UPDATE iolta_trust_accounts SET balance = $1 WHERE id = $2',
          [newAccountBalance.toString(), transaction.trust_account_id]
        );
      } else if (status === 'voided' && oldStatus === 'completed') {
        // Voiding a completed transaction - reverse the effect on balances
        const ledgerResult = await client.query(
          'SELECT current_balance FROM iolta_client_ledgers WHERE id = $1',
          [transaction.client_ledger_id]
        );
        
        if (ledgerResult.rows.length === 0) {
          throw new Error(`Client ledger with ID ${transaction.client_ledger_id} not found`);
        }
        
        let currentLedgerBalance = parseFloat(ledgerResult.rows[0].current_balance) || 0;
        const amount = parseFloat(transaction.amount);
        
        let newLedgerBalance = currentLedgerBalance;
        if (transaction.transaction_type === 'deposit') {
          newLedgerBalance -= amount;
          
          // Verify sufficient funds
          if (newLedgerBalance < 0) {
            throw new Error('Insufficient funds in client ledger to void transaction');
          }
        } else if (transaction.transaction_type === 'withdrawal' || transaction.transaction_type === 'fee') {
          newLedgerBalance += amount;
        }
        
        // Update ledger balance
        await client.query(
          'UPDATE iolta_client_ledgers SET current_balance = $1, balance = $1 WHERE id = $2',
          [newLedgerBalance.toString(), transaction.client_ledger_id]
        );
        
        // Update the trust account balance
        const accountResult = await client.query(
          'SELECT balance FROM iolta_trust_accounts WHERE id = $1',
          [transaction.trust_account_id]
        );
        
        if (accountResult.rows.length === 0) {
          throw new Error(`Trust account with ID ${transaction.trust_account_id} not found`);
        }
        
        let currentAccountBalance = parseFloat(accountResult.rows[0].balance) || 0;
        let newAccountBalance = currentAccountBalance;
        
        if (transaction.transaction_type === 'deposit') {
          newAccountBalance -= amount;
          
          // Verify sufficient funds
          if (newAccountBalance < 0) {
            throw new Error('Insufficient funds in trust account to void transaction');
          }
        } else if (transaction.transaction_type === 'withdrawal' || transaction.transaction_type === 'fee') {
          newAccountBalance += amount;
        }
        
        await client.query(
          'UPDATE iolta_trust_accounts SET balance = $1 WHERE id = $2',
          [newAccountBalance.toString(), transaction.trust_account_id]
        );
        
        // Set voided_by and voided_at
        await client.query(
          'UPDATE iolta_transactions SET voided_by = $1, voided_at = CURRENT_TIMESTAMP WHERE id = $2',
          [userId, id]
        );
      }
      
      // Update the status
      await client.query(
        'UPDATE iolta_transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, id]
      );
      
      // Get the updated transaction
      const updatedTxResult = await client.query(
        'SELECT * FROM iolta_transactions WHERE id = $1',
        [id]
      );
      
      // Commit the transaction
      await client.query('COMMIT');
      
      const updated = updatedTxResult.rows[0];
      
      // Convert to expected format
      return {
        id: updated.id,
        merchantId: updated.merchant_id,
        trustAccountId: updated.trust_account_id,
        clientLedgerId: updated.client_ledger_id,
        transactionDate: updated.transaction_date,
        amount: updated.amount,
        balanceAfter: updated.balance_after,
        description: updated.description,
        transactionType: updated.transaction_type,
        fundType: updated.fund_type,
        checkNumber: updated.check_number,
        reference: updated.reference,
        referenceNumber: updated.reference_number,
        payee: updated.payee,
        payor: updated.payor,
        status: updated.status,
        createdBy: updated.created_by,
        approvedBy: updated.approved_by,
        approvedAt: updated.approved_at,
        voidedBy: updated.voided_by,
        voidedAt: updated.voided_at,
        voidReason: updated.void_reason,
        documentUrl: updated.document_url,
        payment_method_id: updated.payment_method_id,
        related_invoice_id: updated.related_invoice_id,
        notes: updated.notes,
        earningDate: updated.earning_date,
        clearedDate: updated.cleared_date,
        bankReference: updated.bank_reference,
        reconciliationId: updated.reconciliation_id,
        processedAt: updated.processed_at,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at
      };
      
    } catch (error) {
      // Rollback in case of an error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  }
}

// Create instance for singleton usage
export const ioltaTransactionSqlService = new IoltaTransactionSqlService();