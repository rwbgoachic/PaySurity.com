/**
 * Fix IOLTA Transaction Balances
 * 
 * This script updates all IOLTA transactions to ensure the balance_after column is
 * correctly populated based on the transaction type and amount.
 * 
 * Run with: npx tsx scripts/fix-iolta-transaction-balances.ts
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';
import Decimal from 'decimal.js';

// Main function to fix IOLTA transaction balances
async function fixIoltaTransactionBalances() {
  console.log(chalk.blue('Starting IOLTA transaction balances fix...'));
  
  try {
    // Get all client ledgers with their current balances
    const ledgers = await db.execute(sql`
      SELECT id, current_balance, trust_account_id 
      FROM iolta_client_ledgers
      ORDER BY id
    `);
    
    console.log(chalk.blue(`Found ${ledgers.rows.length} client ledgers to process`));
    
    // Process each client ledger
    for (const ledger of ledgers.rows) {
      console.log(chalk.green(`Processing client ledger ID: ${ledger.id}`));
      
      // Get all transactions for this ledger ordered by creation date
      const transactions = await db.execute(sql`
        SELECT id, amount, transaction_type, created_at
        FROM iolta_transactions
        WHERE client_ledger_id = ${ledger.id}
        ORDER BY created_at, id
      `);
      
      if (transactions.rows.length === 0) {
        console.log(chalk.yellow(`No transactions found for client ledger ID: ${ledger.id}`));
        continue;
      }
      
      console.log(chalk.blue(`Found ${transactions.rows.length} transactions to update`));
      
      // Calculate running balance
      let runningBalance = new Decimal(0);
      
      for (const tx of transactions.rows) {
        const amount = new Decimal(tx.amount || 0);
        
        // Update running balance based on transaction type
        if (tx.transaction_type === 'deposit' || tx.transaction_type === 'interest') {
          runningBalance = runningBalance.plus(amount);
        } else if (tx.transaction_type === 'withdrawal' || tx.transaction_type === 'fee' || tx.transaction_type === 'payment') {
          runningBalance = runningBalance.minus(amount);
        }
        
        // Update the balance_after for this transaction
        await db.execute(sql`
          UPDATE iolta_transactions
          SET balance_after = ${runningBalance.toString()}
          WHERE id = ${tx.id}
        `);
        
        console.log(chalk.green(`Updated transaction ID: ${tx.id}, new balance: ${runningBalance.toString()}`));
      }
      
      // Update the client ledger with the final balance
      await db.execute(sql`
        UPDATE iolta_client_ledgers
        SET current_balance = ${runningBalance.toString()}, 
            balance = ${runningBalance.toString()}
        WHERE id = ${ledger.id}
      `);
      
      console.log(chalk.green(`Updated client ledger ID: ${ledger.id} with final balance: ${runningBalance.toString()}`));
    }
    
    // Update trust account balances based on sum of client ledgers
    const trustAccounts = await db.execute(sql`
      SELECT id
      FROM iolta_trust_accounts
    `);
    
    for (const account of trustAccounts.rows) {
      // Sum all client ledger balances for this trust account
      const sumResult = await db.execute(sql`
        SELECT COALESCE(SUM(current_balance::numeric), 0) as total_balance
        FROM iolta_client_ledgers
        WHERE trust_account_id = ${account.id}
      `);
      
      const totalBalance = sumResult.rows[0].total_balance as string;
      
      // Update the trust account balance
      await db.execute(sql`
        UPDATE iolta_trust_accounts
        SET balance = ${totalBalance.toString()}
        WHERE id = ${account.id}
      `);
      
      console.log(chalk.green(`Updated trust account ID: ${account.id} with total balance: ${totalBalance.toString()}`));
    }
    
    console.log(chalk.blue('IOLTA transaction balances fix completed successfully.'));
    
  } catch (error) {
    console.error(chalk.red('Error fixing IOLTA transaction balances:'), error);
    throw error;
  }
}

// Run the fix function
fixIoltaTransactionBalances()
  .then(() => {
    console.log(chalk.green.bold('✅ IOLTA transaction balances have been fixed successfully!'));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red.bold('❌ Failed to fix IOLTA transaction balances:'), error);
    process.exit(1);
  });