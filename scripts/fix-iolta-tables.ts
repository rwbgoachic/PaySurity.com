/**
 * Fix IOLTA Tables Script
 * 
 * This script adds missing columns to IOLTA-related tables
 * based on the schema definition in shared/schema-legal.ts.
 * 
 * Run with: npx tsx scripts/fix-iolta-tables.ts
 */

import { Pool } from '@neondatabase/serverless';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';

// Main function to fix IOLTA tables
async function fixIoltaTables() {
  console.log(chalk.blue('Starting IOLTA table verification and fixes...'));
  
  try {
    // Check if critical columns exist
    const checkResults = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM information_schema.columns 
          WHERE table_name = 'iolta_transactions' AND column_name = 'merchant_id') > 0 AS has_merchant_id,
        (SELECT COUNT(*) FROM information_schema.columns 
          WHERE table_name = 'iolta_transactions' AND column_name = 'balance_after') > 0 AS has_balance_after,
        (SELECT COUNT(*) FROM information_schema.columns 
          WHERE table_name = 'iolta_client_ledgers' AND column_name = 'current_balance') > 0 AS has_current_balance
    `);
    
    const results = checkResults.rows[0];
    
    // Add missing columns if needed
    if (!results.has_merchant_id) {
      console.log(chalk.yellow('Adding merchant_id column to iolta_transactions table...'));
      await db.execute(sql`
        ALTER TABLE iolta_transactions ADD COLUMN merchant_id INTEGER
      `);
      console.log(chalk.green('merchant_id column added successfully.'));
    } else {
      console.log(chalk.green('merchant_id column already exists in iolta_transactions table.'));
    }
    
    if (!results.has_balance_after) {
      console.log(chalk.yellow('Adding balance_after column to iolta_transactions table...'));
      await db.execute(sql`
        ALTER TABLE iolta_transactions ADD COLUMN balance_after TEXT
      `);
      console.log(chalk.green('balance_after column added successfully.'));
    } else {
      console.log(chalk.green('balance_after column already exists in iolta_transactions table.'));
    }
    
    if (!results.has_current_balance) {
      console.log(chalk.yellow('Adding current_balance column to iolta_client_ledgers table...'));
      await db.execute(sql`
        ALTER TABLE iolta_client_ledgers ADD COLUMN current_balance TEXT DEFAULT '0.00'
      `);
      
      // Update current_balance to match balance
      await db.execute(sql`
        UPDATE iolta_client_ledgers SET current_balance = balance
      `);
      
      console.log(chalk.green('current_balance column added successfully and initialized with balance values.'));
    } else {
      console.log(chalk.green('current_balance column already exists in iolta_client_ledgers table.'));
    }
    
    // Check if last_transaction_date column exists in iolta_client_ledgers
    const hasLastTransactionDate = await checkColumnExists('iolta_client_ledgers', 'last_transaction_date');
    
    if (!hasLastTransactionDate) {
      console.log(chalk.yellow('Adding last_transaction_date column to iolta_client_ledgers table...'));
      await db.execute(sql`
        ALTER TABLE iolta_client_ledgers ADD COLUMN last_transaction_date TIMESTAMP WITH TIME ZONE
      `);
      console.log(chalk.green('last_transaction_date column added successfully.'));
    } else {
      console.log(chalk.green('last_transaction_date column already exists in iolta_client_ledgers table.'));
    }
    
    // Check if jurisdiction column exists in legal_clients
    const hasJurisdiction = await checkColumnExists('legal_clients', 'jurisdiction');
    
    if (!hasJurisdiction) {
      console.log(chalk.yellow('Adding jurisdiction column to legal_clients table...'));
      await db.execute(sql`
        ALTER TABLE legal_clients ADD COLUMN jurisdiction TEXT
      `);
      console.log(chalk.green('jurisdiction column added successfully.'));
    } else {
      console.log(chalk.green('jurisdiction column already exists in legal_clients table.'));
    }
    
    // Verify other nullable columns are present
    const columnChecks = [
      { table: 'iolta_transactions', column: 'reference_number' },
      { table: 'iolta_transactions', column: 'payor' },
      { table: 'iolta_transactions', column: 'payee' },
      { table: 'iolta_transactions', column: 'check_number' },
      { table: 'iolta_transactions', column: 'notes' },
      { table: 'iolta_transactions', column: 'bank_reference' }
    ];
    
    for (const check of columnChecks) {
      const columnExists = await checkColumnExists(check.table, check.column);
      
      if (!columnExists) {
        console.log(chalk.yellow(`Adding ${check.column} column to ${check.table} table...`));
        await db.execute(sql.raw(`
          ALTER TABLE ${check.table} ADD COLUMN ${check.column} TEXT
        `));
        console.log(chalk.green(`${check.column} column added successfully.`));
      } else {
        console.log(chalk.green(`${check.column} column already exists in ${check.table} table.`));
      }
    }
    
    console.log(chalk.blue('IOLTA table verification and fixes completed.'));
    
  } catch (error) {
    console.error(chalk.red('Error fixing IOLTA tables:'), error);
    throw error;
  }
}

/**
 * Check if a column exists in a table
 */
async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT COUNT(*) > 0 AS column_exists 
    FROM information_schema.columns 
    WHERE table_name = ${tableName} 
    AND column_name = ${columnName}
  `);
  
  return result.rows[0].column_exists;
}

// Run the fix function
fixIoltaTables()
  .then(() => {
    console.log(chalk.green.bold('✅ IOLTA tables have been verified and fixed successfully!'));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red.bold('❌ Failed to fix IOLTA tables:'), error);
    process.exit(1);
  });