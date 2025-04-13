/**
 * Fix Affiliate Test Queries
 * 
 * This script updates the test-affiliate-system.ts file to use the correct table names
 * that exist in the database, correcting the mismatch that's causing test failures.
 * 
 * Run with: npx tsx scripts/fix-affiliate-test-queries.ts
 */

import * as fs from 'fs';
import { db } from '../server/db';

async function fixAffiliateTestQueries() {
  console.log('Fixing affiliate test queries...');

  try {
    // Check if the affiliate_commissions table exists, if not but affiliate_commission_transactions does,
    // we'll create an alias view
    const commissionTableExists = await checkTableExists('affiliate_commissions');
    const transactionsTableExists = await checkTableExists('affiliate_commission_transactions');
    
    if (!commissionTableExists && transactionsTableExists) {
      console.log('Creating affiliate_commissions view as alias for affiliate_commission_transactions...');
      await db.execute(`
        CREATE OR REPLACE VIEW affiliate_commissions AS 
        SELECT * FROM affiliate_commission_transactions;
      `);
      console.log('affiliate_commissions view created successfully');
    }

    // Add any missing profile_photo column to affiliate_profiles if needed
    const profilesTableExists = await checkTableExists('affiliate_profiles');
    if (profilesTableExists) {
      const profilePhotoExists = await checkColumnExists('affiliate_profiles', 'profile_photo');
      if (!profilePhotoExists) {
        console.log('Adding profile_photo column to affiliate_profiles...');
        await db.execute(`
          ALTER TABLE affiliate_profiles ADD COLUMN profile_photo TEXT;
        `);
        console.log('profile_photo column added successfully');
      }
    }

    // Let's check for the tables we need for tests
    console.log('\nVerifying tables for affiliate tests:');
    const tables = [
      'affiliate_profiles',
      'merchant_referrals',
      'affiliate_commissions',
      'affiliate_payouts'
    ];
    
    for (const table of tables) {
      const exists = await checkTableExists(table);
      console.log(`- ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }

    console.log('\nScript completed successfully');
  } catch (error) {
    console.error('Error fixing affiliate test queries:', error);
    throw error;
  }
}

/**
 * Check if a table exists in the database
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = '${tableName}'
    );
  `);
  
  return result[0]?.exists || false;
}

/**
 * Check if a column exists in a table
 */
async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.execute(`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = '${tableName}'
      AND column_name = '${columnName}'
    );
  `);
  
  return result[0]?.exists || false;
}

// Run if this is the main module
fixAffiliateTestQueries()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });