/**
 * Validate Affiliate Tables
 * 
 * This script attempts to validate the affiliate-related tables using the exact
 * same queries as in the test-affiliate-system.ts file to help debug the issue.
 * 
 * Run with: npx tsx scripts/validate-affiliate-tables.ts
 */

import { db } from '../server/db';

async function validateAffiliateTables() {
  console.log('Validating affiliate tables using test queries...');

  // Check affiliate_profiles
  console.log('\nChecking affiliate_profiles:');
  const profilesResult = await db.execute(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'affiliate_profiles')
    );
  `);
  console.log('Query result:', profilesResult);
  console.log('Exists?', profilesResult[0]?.exists);

  // Check directly
  const directProfileResult = await db.execute(`
    SELECT count(*) FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'affiliate_profiles';
  `);
  console.log('Direct count result:', directProfileResult);
  
  // Check if the table truly exists
  try {
    const tableData = await db.execute(`SELECT * FROM affiliate_profiles LIMIT 1;`);
    console.log('Can query affiliate_profiles? YES');
    console.log('Sample data:', tableData);
  } catch (error) {
    console.log('Can query affiliate_profiles? NO -', error.message);
  }

  // Check merchant_referrals
  console.log('\nChecking merchant_referrals:');
  const referralsResult = await db.execute(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'merchant_referrals')
    );
  `);
  console.log('Query result:', referralsResult);
  console.log('Exists?', referralsResult[0]?.exists);

  // Check affiliate_commissions (view we created)
  console.log('\nChecking affiliate_commissions:');
  const commissionsResult = await db.execute(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'affiliate_commissions')
    );
  `);
  console.log('Query result:', commissionsResult);
  console.log('Exists?', commissionsResult[0]?.exists);

  // Check if views are included in the information_schema.tables
  console.log('\nChecking view detection:');
  const viewsResult = await db.execute(`
    SELECT table_name, table_type 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'affiliate_commissions';
  `);
  console.log('Views result:', viewsResult);

  // Check affiliate_payouts
  console.log('\nChecking affiliate_payouts:');
  const payoutsResult = await db.execute(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'affiliate_payouts')
    );
  `);
  console.log('Query result:', payoutsResult);
  console.log('Exists?', payoutsResult[0]?.exists);
}

// Run the validation
validateAffiliateTables()
  .then(() => {
    console.log('\nValidation complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Validation failed:', error);
    process.exit(1);
  });