/**
 * Script to add missing columns to IOLTA tables
 * This script adds current_balance to iolta_client_ledgers and balance_after to iolta_transactions
 * to fix issues with database schema vs code models
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function addMissingColumns() {
  console.log('Adding missing columns to IOLTA tables...');

  try {
    // Check and add current_balance to iolta_client_ledgers
    const checkCurrentBalance = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'iolta_client_ledgers'
        AND column_name = 'current_balance'
      );
    `);
    
    const currentBalanceExists = checkCurrentBalance.rows[0].exists;
    
    if (!currentBalanceExists) {
      console.log('Adding current_balance column to iolta_client_ledgers...');
      await db.execute(sql`
        ALTER TABLE iolta_client_ledgers 
        ADD COLUMN current_balance NUMERIC NOT NULL DEFAULT '0';
      `);
      
      // Initialize current_balance to match balance for existing records
      await db.execute(sql`
        UPDATE iolta_client_ledgers 
        SET current_balance = balance;
      `);
      
      console.log('Successfully added current_balance column to iolta_client_ledgers');
    } else {
      console.log('current_balance column already exists in iolta_client_ledgers');
    }

    // Check and add balance_after to iolta_transactions
    const checkBalanceAfter = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'iolta_transactions'
        AND column_name = 'balance_after'
      );
    `);
    
    const balanceAfterExists = checkBalanceAfter.rows[0].exists;
    
    if (!balanceAfterExists) {
      console.log('Adding balance_after column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions 
        ADD COLUMN balance_after NUMERIC NOT NULL DEFAULT '0';
      `);
      
      console.log('Successfully added balance_after column to iolta_transactions');
    } else {
      console.log('balance_after column already exists in iolta_transactions');
    }

    // Check and add merchant_id to iolta_transactions if missing
    const checkMerchantId = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'iolta_transactions'
        AND column_name = 'merchant_id'
      );
    `);
    
    const merchantIdExists = checkMerchantId.rows[0].exists;
    
    if (!merchantIdExists) {
      console.log('Adding merchant_id column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions 
        ADD COLUMN merchant_id INTEGER;
      `);
      
      console.log('Successfully added merchant_id column to iolta_transactions');
      
      // Update merchant_id values based on trust account relationship
      console.log('Updating merchant_id values in iolta_transactions...');
      await db.execute(sql`
        UPDATE iolta_transactions t
        SET merchant_id = a.merchant_id
        FROM iolta_trust_accounts a
        WHERE t.trust_account_id = a.id;
      `);
      
      // Make merchant_id NOT NULL after updating values
      await db.execute(sql`
        ALTER TABLE iolta_transactions 
        ALTER COLUMN merchant_id SET NOT NULL;
      `);
      
      console.log('Successfully updated merchant_id values in iolta_transactions');
    } else {
      console.log('merchant_id column already exists in iolta_transactions');
    }

    // Check and add jurisdiction to legal_clients if missing
    const checkJurisdiction = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'legal_clients'
        AND column_name = 'jurisdiction'
      );
    `);
    
    const jurisdictionExists = checkJurisdiction.rows[0].exists;
    
    if (!jurisdictionExists) {
      console.log('Adding jurisdiction column to legal_clients...');
      await db.execute(sql`
        ALTER TABLE legal_clients 
        ADD COLUMN jurisdiction TEXT;
      `);
      
      console.log('Successfully added jurisdiction column to legal_clients');
    } else {
      console.log('jurisdiction column already exists in legal_clients');
    }

    console.log('All missing columns have been added successfully');
  } catch (error) {
    console.error('Error adding missing columns:', error);
  }
}

// Execute the function
addMissingColumns()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });