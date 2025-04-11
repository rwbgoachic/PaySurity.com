/**
 * Add missing columns to IOLTA tables
 * 
 * This script adds the missing columns to the IOLTA tables
 * to align with the schema definition in shared/schema.ts.
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function updateIoltaColumns() {
  console.log('Starting IOLTA column update process...');
  
  try {
    // Begin transaction to ensure all alterations succeed or fail together
    await db.transaction(async (tx) => {
      // Add missing columns to iolta_trust_accounts
      console.log('Adding missing columns to iolta_trust_accounts...');
      await tx.execute(sql`
        ALTER TABLE iolta_trust_accounts 
        ADD COLUMN IF NOT EXISTS account_name TEXT,
        ADD COLUMN IF NOT EXISTS account_type TEXT,
        ADD COLUMN IF NOT EXISTS bank_name TEXT,
        ADD COLUMN IF NOT EXISTS routing_number TEXT,
        ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending_verification',
        ADD COLUMN IF NOT EXISTS interest_beneficiary TEXT DEFAULT 'state_bar_foundation',
        ADD COLUMN IF NOT EXISTS bar_association_id TEXT,
        ADD COLUMN IF NOT EXISTS last_reconcile_date TIMESTAMP,
        ADD COLUMN IF NOT EXISTS last_reconciled_balance DECIMAL(12,2),
        ADD COLUMN IF NOT EXISTS last_reconciled_date TIMESTAMP,
        ADD COLUMN IF NOT EXISTS last_bank_statement_date DATE,
        ADD COLUMN IF NOT EXISTS reconciliation_notes TEXT;
      `);
      
      // Update account_name for existing records to prevent NULL issues
      console.log('Setting default values for required columns...');
      await tx.execute(sql`
        UPDATE iolta_trust_accounts
        SET 
          account_name = CONCAT('Trust Account ', id),
          account_type = 'iolta',
          bank_name = 'Default Bank',
          routing_number = '000000000',
          account_status = 'active'
        WHERE account_name IS NULL;
      `);
      
      // Add missing client portal columns
      console.log('Checking for client portal tables...');
      
      // Check if legal_clients table exists and add missing columns
      await tx.execute(sql`
        DO $$
        BEGIN
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'legal_clients') THEN
            ALTER TABLE legal_clients
            ADD COLUMN IF NOT EXISTS zip_code TEXT;
          END IF;
        END $$;
      `);
      
      // Check if legal_portal_users table exists and add missing columns
      await tx.execute(sql`
        DO $$
        BEGIN
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'legal_portal_users') THEN
            ALTER TABLE legal_portal_users
            ADD COLUMN IF NOT EXISTS zip_code TEXT;
          END IF;
        END $$;
      `);
    });
    
    console.log('IOLTA column update process completed successfully.');
    
  } catch (error) {
    console.error('Error updating IOLTA columns:', error);
    process.exit(1);
  }
}

// Run the update function
updateIoltaColumns()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });