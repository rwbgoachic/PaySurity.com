/**
 * Create Affiliate Marketing Tables
 * 
 * This script creates the required tables for the affiliate marketing system
 * - affiliate_profiles: Stores affiliate user profiles
 * - merchant_referrals: Tracks merchant referrals from affiliates
 * - affiliate_commissions: Records commissions earned by affiliates
 * - affiliate_payouts: Tracks payouts made to affiliates
 * 
 * Run with: npx tsx scripts/create-affiliate-tables.ts
 */

import { db } from '../server/db';

async function createAffiliateTables() {
  console.log('Creating affiliate marketing tables...');

  try {
    // Check if tables already exist
    const affiliate_profiles_exists = await checkTableExists('affiliate_profiles');
    const merchant_referrals_exists = await checkTableExists('merchant_referrals');
    const affiliate_commissions_exists = await checkTableExists('affiliate_commissions');
    const affiliate_payouts_exists = await checkTableExists('affiliate_payouts');

    // Create affiliate_profiles table if it doesn't exist
    if (!affiliate_profiles_exists) {
      console.log('Creating affiliate_profiles table...');
      await db.execute(`
        CREATE TABLE affiliate_profiles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          merchant_id INTEGER,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          company_name TEXT,
          website TEXT,
          tax_id TEXT,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
          approval_date TIMESTAMP,
          approved_by INTEGER,
          rejection_reason TEXT,
          affiliate_code TEXT UNIQUE,
          commission_rate NUMERIC DEFAULT 0.15,
          commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
          payment_method TEXT DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'paypal', 'check', 'crypto')),
          payment_details JSONB,
          address_line1 TEXT,
          address_line2 TEXT,
          city TEXT,
          state TEXT,
          postal_code TEXT,
          country TEXT,
          phone TEXT,
          profile_photo TEXT,
          bio TEXT,
          marketing_materials JSONB,
          social_media JSONB,
          traffic_sources TEXT[],
          monthly_visitors INTEGER,
          marketing_strategy TEXT,
          terms_accepted BOOLEAN DEFAULT FALSE,
          terms_accepted_date TIMESTAMP,
          payment_threshold NUMERIC DEFAULT 100.00,
          lifetime_earnings NUMERIC DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('affiliate_profiles table created successfully');
    } else {
      console.log('affiliate_profiles table already exists');
      
      // Check if profile_photo column exists, add if it doesn't
      const profile_photo_exists = await checkColumnExists('affiliate_profiles', 'profile_photo');
      if (!profile_photo_exists) {
        console.log('Adding profile_photo column to affiliate_profiles table...');
        await db.execute(`ALTER TABLE affiliate_profiles ADD COLUMN profile_photo TEXT;`);
        console.log('profile_photo column added successfully');
      }
    }

    // Create merchant_referrals table if it doesn't exist
    if (!merchant_referrals_exists) {
      console.log('Creating merchant_referrals table...');
      await db.execute(`
        CREATE TABLE merchant_referrals (
          id SERIAL PRIMARY KEY,
          affiliate_id INTEGER NOT NULL,
          merchant_id INTEGER,
          referral_code TEXT NOT NULL,
          referral_date TIMESTAMP DEFAULT NOW(),
          conversion_date TIMESTAMP,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'qualified', 'converted', 'lost')),
          conversion_value NUMERIC,
          commission_amount NUMERIC,
          commission_paid BOOLEAN DEFAULT FALSE,
          commission_paid_date TIMESTAMP,
          notes TEXT,
          contact_info JSONB,
          merchant_type TEXT,
          processing_volume TEXT,
          lead_source TEXT,
          marketing_campaign TEXT,
          conversion_details JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('merchant_referrals table created successfully');
    } else {
      console.log('merchant_referrals table already exists');
    }

    // Create affiliate_commissions table if it doesn't exist
    if (!affiliate_commissions_exists) {
      console.log('Creating affiliate_commissions table...');
      await db.execute(`
        CREATE TABLE affiliate_commissions (
          id SERIAL PRIMARY KEY,
          affiliate_id INTEGER NOT NULL,
          referral_id INTEGER,
          merchant_id INTEGER,
          amount NUMERIC NOT NULL,
          commission_type TEXT DEFAULT 'referral' CHECK (commission_type IN ('referral', 'recurring', 'bonus', 'promotion')),
          description TEXT,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
          approved_by INTEGER,
          approval_date TIMESTAMP,
          rejected_reason TEXT,
          payment_id INTEGER,
          transaction_reference TEXT,
          transaction_date TIMESTAMP DEFAULT NOW(),
          revenue_time_period JSONB,
          merchant_monthly_volume NUMERIC,
          commission_rate NUMERIC,
          commission_details JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('affiliate_commissions table created successfully');
    } else {
      console.log('affiliate_commissions table already exists');
    }

    // Create affiliate_payouts table if it doesn't exist
    if (!affiliate_payouts_exists) {
      console.log('Creating affiliate_payouts table...');
      await db.execute(`
        CREATE TABLE affiliate_payouts (
          id SERIAL PRIMARY KEY,
          affiliate_id INTEGER NOT NULL,
          amount NUMERIC NOT NULL,
          payment_method TEXT NOT NULL,
          payment_details JSONB,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
          transaction_id TEXT,
          payout_date TIMESTAMP,
          payout_period_start TIMESTAMP,
          payout_period_end TIMESTAMP,
          commission_ids INTEGER[],
          notes TEXT,
          processed_by INTEGER,
          tax_withholding NUMERIC DEFAULT 0.00,
          tax_form_submitted BOOLEAN DEFAULT FALSE,
          tax_form_type TEXT,
          receipt_sent BOOLEAN DEFAULT FALSE,
          receipt_url TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('affiliate_payouts table created successfully');
    } else {
      console.log('affiliate_payouts table already exists');
    }

    console.log('All affiliate marketing tables created successfully!');
  } catch (error) {
    console.error('Error creating affiliate tables:', error);
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
createAffiliateTables()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });