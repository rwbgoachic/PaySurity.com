/**
 * Script to fix legal tables
 * This script adds missing columns and fixes issues with existing tables
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixLegalTables() {
  console.log('Fixing legal tables...');

  try {
    // Add tax_id column to legal_clients if missing
    console.log('Checking legal_clients table...');
    const checkTaxId = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'legal_clients' 
        AND column_name = 'tax_id'
      );
    `);
    
    const taxIdExists = checkTaxId.rows[0].exists;
    
    if (!taxIdExists) {
      console.log('Adding tax_id column to legal_clients...');
      await db.execute(sql`
        ALTER TABLE legal_clients
        ADD COLUMN tax_id TEXT;
      `);
      console.log('Successfully added tax_id column to legal_clients');
    } else {
      console.log('tax_id column already exists in legal_clients');
    }

    // Add portal_access and portal_user_id columns to legal_clients if missing
    const checkPortalAccess = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'legal_clients' 
        AND column_name = 'portal_access'
      );
    `);
    
    const portalAccessExists = checkPortalAccess.rows[0].exists;
    
    if (!portalAccessExists) {
      console.log('Adding portal_access column to legal_clients...');
      await db.execute(sql`
        ALTER TABLE legal_clients
        ADD COLUMN portal_access BOOLEAN DEFAULT FALSE;
      `);
      console.log('Successfully added portal_access column to legal_clients');
    } else {
      console.log('portal_access column already exists in legal_clients');
    }

    const checkPortalUserId = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'legal_clients' 
        AND column_name = 'portal_user_id'
      );
    `);
    
    const portalUserIdExists = checkPortalUserId.rows[0].exists;
    
    if (!portalUserIdExists) {
      console.log('Adding portal_user_id column to legal_clients...');
      await db.execute(sql`
        ALTER TABLE legal_clients
        ADD COLUMN portal_user_id INTEGER;
      `);
      console.log('Successfully added portal_user_id column to legal_clients');
    } else {
      console.log('portal_user_id column already exists in legal_clients');
    }

    // Add referral_source column to legal_clients if missing
    const checkReferralSource = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'legal_clients' 
        AND column_name = 'referral_source'
      );
    `);
    
    const referralSourceExists = checkReferralSource.rows[0].exists;
    
    if (!referralSourceExists) {
      console.log('Adding referral_source column to legal_clients...');
      await db.execute(sql`
        ALTER TABLE legal_clients
        ADD COLUMN referral_source TEXT;
      `);
      console.log('Successfully added referral_source column to legal_clients');
    } else {
      console.log('referral_source column already exists in legal_clients');
    }

    // Add client_ledger_id column to iolta_transactions if missing
    const checkClientLedgerId = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'client_ledger_id'
      );
    `);
    
    const clientLedgerIdExists = checkClientLedgerId.rows[0].exists;
    
    if (!clientLedgerIdExists) {
      console.log('Adding client_ledger_id column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN client_ledger_id INTEGER;
      `);
      console.log('Successfully added client_ledger_id column to iolta_transactions');
    } else {
      console.log('client_ledger_id column already exists in iolta_transactions');
    }

    // Add notes column to iolta_client_ledgers if missing
    const checkClientLedgerNotes = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_client_ledgers' 
        AND column_name = 'notes'
      );
    `);
    
    const clientLedgerNotesExists = checkClientLedgerNotes.rows[0].exists;
    
    if (!clientLedgerNotesExists) {
      console.log('Adding notes column to iolta_client_ledgers...');
      await db.execute(sql`
        ALTER TABLE iolta_client_ledgers
        ADD COLUMN notes TEXT;
      `);
      console.log('Successfully added notes column to iolta_client_ledgers');
    } else {
      console.log('notes column already exists in iolta_client_ledgers');
    }

    // Add merchant_id column to iolta_reconciliations if missing
    const checkMerchantId = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_reconciliations' 
        AND column_name = 'merchant_id'
      );
    `);
    
    const merchantIdExists = checkMerchantId.rows[0].exists;
    
    if (!merchantIdExists) {
      console.log('Adding merchant_id column to iolta_reconciliations...');
      await db.execute(sql`
        ALTER TABLE iolta_reconciliations
        ADD COLUMN merchant_id INTEGER;
      `);
      console.log('Successfully added merchant_id column to iolta_reconciliations');
    } else {
      console.log('merchant_id column already exists in iolta_reconciliations');
    }
    
    // Add merchant_id column to iolta_bank_statements if missing
    const checkBankStatementMerchantId = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_bank_statements' 
        AND column_name = 'merchant_id'
      );
    `);
    
    const bankStatementMerchantIdExists = checkBankStatementMerchantId.rows[0].exists;
    
    if (!bankStatementMerchantIdExists) {
      console.log('Adding merchant_id column to iolta_bank_statements...');
      await db.execute(sql`
        ALTER TABLE iolta_bank_statements
        ADD COLUMN merchant_id INTEGER;
      `);
      console.log('Successfully added merchant_id column to iolta_bank_statements');
    } else {
      console.log('merchant_id column already exists in iolta_bank_statements');
    }
    
    // Add fund_type column to iolta_transactions if missing
    const checkFundType = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'fund_type'
      );
    `);
    
    const fundTypeExists = checkFundType.rows[0].exists;
    
    if (!fundTypeExists) {
      console.log('Adding fund_type column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN fund_type TEXT;
      `);
      console.log('Successfully added fund_type column to iolta_transactions');
    } else {
      console.log('fund_type column already exists in iolta_transactions');
    }
    
    // Add conflict_check_notes column to legal_clients if missing
    const checkConflictNotes = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'legal_clients' 
        AND column_name = 'conflict_check_notes'
      );
    `);
    
    const conflictNotesExists = checkConflictNotes.rows[0].exists;
    
    if (!conflictNotesExists) {
      console.log('Adding conflict_check_notes column to legal_clients...');
      await db.execute(sql`
        ALTER TABLE legal_clients
        ADD COLUMN conflict_check_notes TEXT;
      `);
      console.log('Successfully added conflict_check_notes column to legal_clients');
    } else {
      console.log('conflict_check_notes column already exists in legal_clients');
    }
    
    // Add retainer_agreement_signed column to legal_clients if missing
    const checkRetainerAgreement = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'legal_clients' 
        AND column_name = 'retainer_agreement_signed'
      );
    `);
    
    const retainerAgreementExists = checkRetainerAgreement.rows[0].exists;
    
    if (!retainerAgreementExists) {
      console.log('Adding retainer_agreement_signed column to legal_clients...');
      await db.execute(sql`
        ALTER TABLE legal_clients
        ADD COLUMN retainer_agreement_signed BOOLEAN DEFAULT FALSE;
      `);
      console.log('Successfully added retainer_agreement_signed column to legal_clients');
    } else {
      console.log('retainer_agreement_signed column already exists in legal_clients');
    }
    
    // Add payment_method_id column to iolta_transactions if missing
    const checkPaymentMethodId = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'payment_method_id'
      );
    `);
    
    const paymentMethodIdExists = checkPaymentMethodId.rows[0].exists;
    
    if (!paymentMethodIdExists) {
      console.log('Adding payment_method_id column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN payment_method_id INTEGER;
      `);
      console.log('Successfully added payment_method_id column to iolta_transactions');
    } else {
      console.log('payment_method_id column already exists in iolta_transactions');
    }

    // Fix legal_clients by ensuring all required columns match our schema
    // Insert a test client for tests to use
    console.log('Adding test client for IOLTA tests...');
    const existingClientCheck = await db.execute(sql`
      SELECT COUNT(*) FROM legal_clients WHERE id = 1;
    `);
    
    const countValue = existingClientCheck.rows[0].count;
    const clientExists = parseInt(String(countValue)) > 0;
    
    if (!clientExists) {
      await db.execute(sql`
        INSERT INTO legal_clients (
          id, merchant_id, status, client_type, first_name, last_name, 
          email, phone, address, city, state, zip_code, country, 
          tax_id, portal_access, notes, created_at, updated_at,
          client_number, is_active, intake_date, referral_source
        ) VALUES (
          1, 1, 'active', 'individual', 'Test', 'Client', 
          'test@example.com', '555-123-4567', '123 Test St', 'Test City', 'CA', '12345', 'USA',
          '123-45-6789', false, 'Test client for IOLTA tests', NOW(), NOW(),
          'TC-001', true, NOW(), 'Website'
        );
      `);
      console.log('Successfully added test client');
    } else {
      // Update existing client with all required fields
      await db.execute(sql`
        UPDATE legal_clients
        SET 
          referral_source = COALESCE(referral_source, 'Website'),
          conflict_check_notes = COALESCE(conflict_check_notes, 'No conflicts found'),
          retainer_agreement_signed = COALESCE(retainer_agreement_signed, true)
        WHERE id = 1;
      `);
      console.log('Test client already exists - updated with required fields');
    }

    console.log('All legal tables fixed successfully');
    return true;
  } catch (error) {
    console.error('Error fixing legal tables:', error);
    return false;
  }
}

// Run the function immediately
fixLegalTables()
  .then((success) => {
    if (success) {
      console.log('Script completed successfully');
      process.exit(0);
    } else {
      console.error('Script failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });

export { fixLegalTables };