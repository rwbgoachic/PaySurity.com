/**
 * Rename IOLTA tables to match schema definition
 * 
 * This script renames the database tables from legal_trust_accounts to iolta_trust_accounts
 * to align with the schema definition in shared/schema.ts.
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function renameIoltaTables() {
  console.log('Starting table rename process...');
  
  try {
    // Begin transaction to ensure all renames succeed or fail together
    await db.transaction(async (tx) => {
      // Rename legal_trust_accounts to iolta_trust_accounts
      console.log('Renaming legal_trust_accounts to iolta_trust_accounts...');
      await tx.execute(sql`
        ALTER TABLE IF EXISTS legal_trust_accounts RENAME TO iolta_trust_accounts;
      `);
      
      // Rename legal_trust_transactions to iolta_transactions
      console.log('Renaming legal_trust_transactions to iolta_transactions...');
      await tx.execute(sql`
        ALTER TABLE IF EXISTS legal_trust_transactions RENAME TO iolta_transactions;
      `);
      
      // Rename legal_client_ledgers to iolta_client_ledgers
      console.log('Renaming legal_client_ledgers to iolta_client_ledgers...');
      await tx.execute(sql`
        ALTER TABLE IF EXISTS legal_client_ledgers RENAME TO iolta_client_ledgers;
      `);
      
      // Rename legal_reconciliations to iolta_reconciliations
      console.log('Renaming legal_reconciliations to iolta_reconciliations...');
      await tx.execute(sql`
        ALTER TABLE IF EXISTS legal_reconciliations RENAME TO iolta_reconciliations;
      `);
      
      // Rename legal_bank_statements to iolta_bank_statements
      console.log('Renaming legal_bank_statements to iolta_bank_statements...');
      await tx.execute(sql`
        ALTER TABLE IF EXISTS legal_bank_statements RENAME TO iolta_bank_statements;
      `);
    });
    
    console.log('Table rename process completed successfully.');
    
  } catch (error) {
    console.error('Error renaming tables:', error);
    process.exit(1);
  }
}

// Run the rename function
renameIoltaTables()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });