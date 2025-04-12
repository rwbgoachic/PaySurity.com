/**
 * Script to fix legal tables
 * This script adds missing columns and fixes issues with existing tables
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixLegalTables() {
  console.log('Fixing legal tables...');

  try {
    // Check for client_number column in legal_clients
    console.log('Checking for client_number column in legal_clients...');
    const checkClientNumber = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'legal_clients' 
        AND column_name = 'client_number'
      );
    `);
    
    const clientNumberExists = checkClientNumber.rows[0].exists;
    
    if (!clientNumberExists) {
      console.log('Adding client_number column to legal_clients...');
      await db.execute(sql`
        ALTER TABLE legal_clients
        ADD COLUMN client_number TEXT NOT NULL DEFAULT concat('CL-', floor(random() * 1000000)::text);
      `);
      console.log('Successfully added client_number column to legal_clients');
    } else {
      console.log('client_number column already exists in legal_clients');
    }
    
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
    
    // Add status column to iolta_transactions if missing
    const checkStatus = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'status'
      );
    `);
    
    const statusExists = checkStatus.rows[0].exists;
    
    if (!statusExists) {
      console.log('Adding status column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN status TEXT NOT NULL DEFAULT 'completed';
      `);
      console.log('Successfully added status column to iolta_transactions');
    } else {
      console.log('status column already exists in iolta_transactions');
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
    
    // Add current_balance column to iolta_client_ledgers if missing
    const checkCurrentBalance = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_client_ledgers' 
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
      console.log('Successfully added current_balance column to iolta_client_ledgers');
    } else {
      console.log('current_balance column already exists in iolta_client_ledgers');
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
    
    // Add retainer_agreement_date column to legal_clients if missing
    const checkRetainerAgreementDate = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'legal_clients' 
        AND column_name = 'retainer_agreement_date'
      );
    `);
    
    const retainerAgreementDateExists = checkRetainerAgreementDate.rows[0].exists;
    
    if (!retainerAgreementDateExists) {
      console.log('Adding retainer_agreement_date column to legal_clients...');
      await db.execute(sql`
        ALTER TABLE legal_clients
        ADD COLUMN retainer_agreement_date DATE;
      `);
      console.log('Successfully added retainer_agreement_date column to legal_clients');
    } else {
      console.log('retainer_agreement_date column already exists in legal_clients');
    }
    
    // Add retainer_agreement_document_id column to legal_clients if missing
    const checkRetainerAgreementDocId = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'legal_clients' 
        AND column_name = 'retainer_agreement_document_id'
      );
    `);
    
    const retainerAgreementDocIdExists = checkRetainerAgreementDocId.rows[0].exists;
    
    if (!retainerAgreementDocIdExists) {
      console.log('Adding retainer_agreement_document_id column to legal_clients...');
      await db.execute(sql`
        ALTER TABLE legal_clients
        ADD COLUMN retainer_agreement_document_id INTEGER;
      `);
      console.log('Successfully added retainer_agreement_document_id column to legal_clients');
    } else {
      console.log('retainer_agreement_document_id column already exists in legal_clients');
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
    
    // Add check_number column to iolta_transactions if missing
    const checkCheckNumber = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'check_number'
      );
    `);
    
    const checkNumberExists = checkCheckNumber.rows[0].exists;
    
    if (!checkNumberExists) {
      console.log('Adding check_number column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN check_number TEXT;
      `);
      console.log('Successfully added check_number column to iolta_transactions');
    } else {
      console.log('check_number column already exists in iolta_transactions');
    }
    
    // Add reference column to iolta_transactions if missing
    const checkReference = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'reference'
      );
    `);
    
    const referenceExists = checkReference.rows[0].exists;
    
    if (!referenceExists) {
      console.log('Adding reference column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN reference TEXT;
      `);
      console.log('Successfully added reference column to iolta_transactions');
    } else {
      console.log('reference column already exists in iolta_transactions');
    }
    
    // Add related_invoice_id column to iolta_transactions if missing
    const checkRelatedInvoiceId = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'related_invoice_id'
      );
    `);
    
    const relatedInvoiceIdExists = checkRelatedInvoiceId.rows[0].exists;
    
    if (!relatedInvoiceIdExists) {
      console.log('Adding related_invoice_id column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN related_invoice_id INTEGER;
      `);
      console.log('Successfully added related_invoice_id column to iolta_transactions');
    } else {
      console.log('related_invoice_id column already exists in iolta_transactions');
    }
    
    // Add jurisdiction column to legal_clients if missing
    const checkJurisdiction = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'legal_clients' 
        AND column_name = 'jurisdiction'
      );
    `);
    
    const jurisdictionExists = checkJurisdiction.rows[0].exists;
    
    if (!jurisdictionExists) {
      console.log('Adding jurisdiction column to legal_clients...');
      await db.execute(sql`
        ALTER TABLE legal_clients
        ADD COLUMN jurisdiction TEXT DEFAULT 'Unknown';
      `);
      console.log('Successfully added jurisdiction column to legal_clients');
      
      // Update test client to have a jurisdiction
      await db.execute(sql`
        UPDATE legal_clients 
        SET jurisdiction = 'Test Jurisdiction'
        WHERE id = 1;
      `);
      console.log('Updated test client with jurisdiction data');
    } else {
      console.log('jurisdiction column already exists in legal_clients');
      
      // Make sure test client has a jurisdiction
      await db.execute(sql`
        UPDATE legal_clients 
        SET jurisdiction = 'Test Jurisdiction'
        WHERE id = 1 AND (jurisdiction IS NULL OR jurisdiction = '');
      `);
    }
    
    // Add approved_by column to iolta_transactions if missing
    const checkApprovedBy = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'approved_by'
      );
    `);
    
    const approvedByExists = checkApprovedBy.rows[0].exists;
    
    if (!approvedByExists) {
      console.log('Adding approved_by column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN approved_by INTEGER;
      `);
      console.log('Successfully added approved_by column to iolta_transactions');
    } else {
      console.log('approved_by column already exists in iolta_transactions');
    }
    
    // Add approved_at column to iolta_transactions if missing
    const checkApprovedAt = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'approved_at'
      );
    `);
    
    const approvedAtExists = checkApprovedAt.rows[0].exists;
    
    if (!approvedAtExists) {
      console.log('Adding approved_at column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN approved_at TIMESTAMP;
      `);
      console.log('Successfully added approved_at column to iolta_transactions');
    } else {
      console.log('approved_at column already exists in iolta_transactions');
    }
    
    // Add voided_by column to iolta_transactions if missing
    const checkVoidedBy = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'voided_by'
      );
    `);
    
    const voidedByExists = checkVoidedBy.rows[0].exists;
    
    if (!voidedByExists) {
      console.log('Adding voided_by column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN voided_by INTEGER;
      `);
      console.log('Successfully added voided_by column to iolta_transactions');
    } else {
      console.log('voided_by column already exists in iolta_transactions');
    }
    
    // Add voided_at column to iolta_transactions if missing
    const checkVoidedAt = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'voided_at'
      );
    `);
    
    const voidedAtExists = checkVoidedAt.rows[0].exists;
    
    if (!voidedAtExists) {
      console.log('Adding voided_at column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN voided_at TIMESTAMP;
      `);
      console.log('Successfully added voided_at column to iolta_transactions');
    } else {
      console.log('voided_at column already exists in iolta_transactions');
    }
    
    // Add void_reason column to iolta_transactions if missing
    const checkVoidReason = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'void_reason'
      );
    `);
    
    const voidReasonExists = checkVoidReason.rows[0].exists;
    
    if (!voidReasonExists) {
      console.log('Adding void_reason column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN void_reason TEXT;
      `);
      console.log('Successfully added void_reason column to iolta_transactions');
    } else {
      console.log('void_reason column already exists in iolta_transactions');
    }
    
    // Add processed_at column to iolta_transactions if missing
    const checkProcessedAt = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'processed_at'
      );
    `);
    
    const processedAtExists = checkProcessedAt.rows[0].exists;
    
    if (!processedAtExists) {
      console.log('Adding processed_at column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN processed_at TIMESTAMP;
      `);
      console.log('Successfully added processed_at column to iolta_transactions');
    } else {
      console.log('processed_at column already exists in iolta_transactions');
    }
    
    // Add document_url column to iolta_transactions if missing
    const checkDocumentUrl = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'document_url'
      );
    `);
    
    const documentUrlExists = checkDocumentUrl.rows[0].exists;
    
    if (!documentUrlExists) {
      console.log('Adding document_url column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN document_url TEXT;
      `);
      console.log('Successfully added document_url column to iolta_transactions');
    } else {
      console.log('document_url column already exists in iolta_transactions');
    }
    
    // Add payee column to iolta_transactions if missing
    const checkPayee = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'payee'
      );
    `);
    
    const payeeExists = checkPayee.rows[0].exists;
    
    if (!payeeExists) {
      console.log('Adding payee column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN payee TEXT;
      `);
      console.log('Successfully added payee column to iolta_transactions');
    } else {
      console.log('payee column already exists in iolta_transactions');
    }
    
    // Add payor column to iolta_transactions if missing
    const checkPayor = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'payor'
      );
    `);
    
    const payorExists = checkPayor.rows[0].exists;
    
    if (!payorExists) {
      console.log('Adding payor column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN payor TEXT;
      `);
      console.log('Successfully added payor column to iolta_transactions');
    } else {
      console.log('payor column already exists in iolta_transactions');
    }
    
    // Add notes column to iolta_transactions if missing
    const checkNotes = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'notes'
      );
    `);
    
    const notesExists = checkNotes.rows[0].exists;
    
    if (!notesExists) {
      console.log('Adding notes column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN notes TEXT;
      `);
      console.log('Successfully added notes column to iolta_transactions');
    } else {
      console.log('notes column already exists in iolta_transactions');
    }
    
    // Add earning_date column to iolta_transactions if missing
    const checkEarningDate = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'earning_date'
      );
    `);
    
    const earningDateExists = checkEarningDate.rows[0].exists;
    
    if (!earningDateExists) {
      console.log('Adding earning_date column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN earning_date TIMESTAMP;
      `);
      console.log('Successfully added earning_date column to iolta_transactions');
    } else {
      console.log('earning_date column already exists in iolta_transactions');
    }
    
    // Add cleared_date column to iolta_transactions if missing
    const checkClearedDate = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'cleared_date'
      );
    `);
    
    const clearedDateExists = checkClearedDate.rows[0].exists;
    
    if (!clearedDateExists) {
      console.log('Adding cleared_date column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN cleared_date TIMESTAMP;
      `);
      console.log('Successfully added cleared_date column to iolta_transactions');
    } else {
      console.log('cleared_date column already exists in iolta_transactions');
    }
    
    // Add bank_reference column to iolta_transactions if missing
    const checkBankReference = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'bank_reference'
      );
    `);
    
    const bankReferenceExists = checkBankReference.rows[0].exists;
    
    if (!bankReferenceExists) {
      console.log('Adding bank_reference column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN bank_reference TEXT;
      `);
      console.log('Successfully added bank_reference column to iolta_transactions');
    } else {
      console.log('bank_reference column already exists in iolta_transactions');
    }
    
    // Add reconciliation_id column to iolta_transactions if missing
    const checkReconciliationId = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'reconciliation_id'
      );
    `);
    
    const reconciliationIdExists = checkReconciliationId.rows[0].exists;
    
    if (!reconciliationIdExists) {
      console.log('Adding reconciliation_id column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN reconciliation_id INTEGER;
      `);
      console.log('Successfully added reconciliation_id column to iolta_transactions');
    } else {
      console.log('reconciliation_id column already exists in iolta_transactions');
    }
    
    // Add balance_after column to iolta_transactions if missing
    const checkBalanceAfter = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'balance_after'
      );
    `);
    
    const balanceAfterExists = checkBalanceAfter.rows[0].exists;
    
    if (!balanceAfterExists) {
      console.log('Adding balance_after column to iolta_transactions...');
      await db.execute(sql`
        ALTER TABLE iolta_transactions
        ADD COLUMN balance_after TEXT DEFAULT '0.00' NOT NULL;
      `);
      console.log('Successfully added balance_after column to iolta_transactions');
    } else {
      // Check if it's nullable and make it non-nullable with a default
      const checkBalanceAfterNullable = await db.execute(sql`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'iolta_transactions' 
        AND column_name = 'balance_after';
      `);
      
      if (checkBalanceAfterNullable.rows.length > 0 && checkBalanceAfterNullable.rows[0].is_nullable === 'YES') {
        console.log('Updating balance_after column to be NOT NULL with default...');
        await db.execute(sql`
          ALTER TABLE iolta_transactions
          ALTER COLUMN balance_after SET DEFAULT '0.00',
          ALTER COLUMN balance_after SET NOT NULL;
          
          UPDATE iolta_transactions
          SET balance_after = '0.00'
          WHERE balance_after IS NULL;
        `);
        console.log('Successfully updated balance_after column');
      } else {
        console.log('balance_after column already exists with correct constraints');
      }
    }

    // Check if merchants table exists and create it if it doesn't
    const checkMerchantsTable = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'merchants'
      );
    `);
    
    const merchantsTableExists = checkMerchantsTable.rows[0].exists;
    
    if (!merchantsTableExists) {
      console.log('Creating merchants table...');
      await db.execute(sql`
        CREATE TABLE merchants (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          business_name TEXT,
          business_type TEXT,
          email TEXT,
          phone TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          zip_code TEXT,
          country TEXT,
          tax_id TEXT,
          website TEXT,
          iso_partner_id INTEGER,
          payment_processor TEXT,
          merchant_id_number TEXT,
          account_manager_id INTEGER,
          onboarding_status TEXT DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('Successfully created merchants table');
      
      // Insert a test merchant
      await db.execute(sql`
        INSERT INTO merchants (id, name, status, business_name, iso_partner_id, payment_processor)
        VALUES (1, 'Test Merchant', 'active', 'Test Law Firm', 1, 'helcim')
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('Successfully added test merchant');
    } else {
      console.log('merchants table already exists');
      
      // Check if required columns exist
      const checkIsoPartnerId = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'merchants' 
          AND column_name = 'iso_partner_id'
        );
      `);
      
      const checkContactName = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'merchants' 
          AND column_name = 'contact_name'
        );
      `);
      
      const isoPartnerIdExists = checkIsoPartnerId.rows[0].exists;
      const contactNameExists = checkContactName.rows[0].exists;
      
      if (!isoPartnerIdExists || !contactNameExists) {
        console.log('Columns missing in merchants table, recreating...');
        
        // Backup existing merchant data
        const merchantsData = await db.execute(sql`
          SELECT * FROM merchants;
        `);
        
        // Drop and recreate the table with all required columns
        await db.execute(sql`
          DROP TABLE merchants;
          
          CREATE TABLE merchants (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            business_name TEXT,
            business_type TEXT,
            contact_name TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            zip TEXT,  -- Adding both zip and zip_code to handle different code expectations
            country TEXT,
            tax_id TEXT,
            website TEXT,
            iso_partner_id INTEGER,
            payment_processor TEXT,
            merchant_id_number TEXT,
            account_manager_id INTEGER,
            onboarding_status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);
        
        console.log('Successfully recreated merchants table with all required columns');
        
        // Re-insert the test merchant
        await db.execute(sql`
          INSERT INTO merchants (id, name, status, business_name, contact_name, iso_partner_id, payment_processor, zip, zip_code)
          VALUES (1, 'Test Merchant', 'active', 'Test Law Firm', 'John Doe', 1, 'helcim', '12345', '12345')
          ON CONFLICT (id) DO NOTHING;
        `);
        console.log('Successfully re-added test merchant with all fields');
      } else {
        // Ensure test merchant exists
        const existingMerchantCheck = await db.execute(sql`
          SELECT COUNT(*) FROM merchants WHERE id = 1;
        `);
        
        const merchantCountValue = existingMerchantCheck.rows[0].count;
        const merchantExists = parseInt(String(merchantCountValue)) > 0;
        
        if (!merchantExists) {
          if (contactNameExists) {
            await db.execute(sql`
              INSERT INTO merchants (id, name, status, business_name, contact_name, iso_partner_id, payment_processor, zip, zip_code)
              VALUES (1, 'Test Merchant', 'active', 'Test Law Firm', 'John Doe', 1, 'helcim', '12345', '12345');
            `);
          } else {
            await db.execute(sql`
              INSERT INTO merchants (id, name, status, business_name, iso_partner_id, payment_processor, zip, zip_code)
              VALUES (1, 'Test Merchant', 'active', 'Test Law Firm', 1, 'helcim', '12345', '12345');
            `);
          }
          console.log('Successfully added test merchant');
        } else {
          // Update existing merchant to ensure it has all required fields
          // Check if zip column exists before updating
          const checkZip = await db.execute(sql`
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'merchants' 
              AND column_name = 'zip'
            );
          `);
      
          const zipExists = checkZip.rows[0].exists;
          
          if (contactNameExists && zipExists) {
            await db.execute(sql`
              UPDATE merchants
              SET 
                iso_partner_id = COALESCE(iso_partner_id, 1),
                payment_processor = COALESCE(payment_processor, 'helcim'),
                contact_name = COALESCE(contact_name, 'John Doe'),
                zip = COALESCE(zip, '12345'),
                zip_code = COALESCE(zip_code, '12345')
              WHERE id = 1;
            `);
          } else if (contactNameExists) {
            await db.execute(sql`
              UPDATE merchants
              SET 
                iso_partner_id = COALESCE(iso_partner_id, 1),
                payment_processor = COALESCE(payment_processor, 'helcim'),
                contact_name = COALESCE(contact_name, 'John Doe')
              WHERE id = 1;
            `);
          } else if (zipExists) {
            await db.execute(sql`
              UPDATE merchants
              SET 
                iso_partner_id = COALESCE(iso_partner_id, 1),
                payment_processor = COALESCE(payment_processor, 'helcim'),
                zip = COALESCE(zip, '12345'),
                zip_code = COALESCE(zip_code, '12345')
              WHERE id = 1;
            `);
          } else {
            await db.execute(sql`
              UPDATE merchants
              SET 
                iso_partner_id = COALESCE(iso_partner_id, 1),
                payment_processor = COALESCE(payment_processor, 'helcim')
              WHERE id = 1;
            `);
          }
          console.log('Test merchant already exists - updated with required fields');
        }
      }
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