/**
 * Script to manually create missing IOLTA tables
 * This script is a temporary solution to manually create the missing IOLTA tables
 * until we resolve the drizzle migration issues.
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function createMissingTables() {
  console.log('Creating missing IOLTA tables...');

  try {
    // Check if iolta_client_ledgers exists
    const checkClientLedgers = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'iolta_client_ledgers'
      );
    `);
    
    const clientLedgersExists = checkClientLedgers.rows[0].exists;
    
    if (!clientLedgersExists) {
      console.log('Creating iolta_client_ledgers table...');
      await db.execute(sql`
        CREATE TABLE iolta_client_ledgers (
          id SERIAL PRIMARY KEY,
          merchant_id INTEGER NOT NULL,
          trust_account_id INTEGER NOT NULL REFERENCES iolta_trust_accounts(id),
          client_id TEXT NOT NULL,
          client_name TEXT NOT NULL,
          matter_name TEXT,
          matter_number TEXT,
          balance NUMERIC NOT NULL DEFAULT '0',
          status TEXT NOT NULL DEFAULT 'active',
          last_transaction_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('Successfully created iolta_client_ledgers table');
    } else {
      console.log('iolta_client_ledgers table already exists');
    }

    // Check if iolta_reconciliations exists
    const checkReconciliations = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'iolta_reconciliations'
      );
    `);
    
    const reconciliationsExists = checkReconciliations.rows[0].exists;
    
    if (!reconciliationsExists) {
      console.log('Creating iolta_reconciliations table...');
      await db.execute(sql`
        CREATE TABLE iolta_reconciliations (
          id SERIAL PRIMARY KEY,
          trust_account_id INTEGER NOT NULL REFERENCES iolta_trust_accounts(id),
          reconciliation_date DATE NOT NULL,
          bank_statement JSONB,
          bank_balance NUMERIC NOT NULL,
          book_balance NUMERIC NOT NULL,
          difference NUMERIC NOT NULL,
          is_balanced BOOLEAN NOT NULL,
          notes TEXT,
          reconciler_id INTEGER NOT NULL,
          reviewer_id INTEGER,
          reviewed_at TIMESTAMP,
          status TEXT NOT NULL DEFAULT 'draft',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('Successfully created iolta_reconciliations table');
    } else {
      console.log('iolta_reconciliations table already exists');
    }

    // Check if iolta_bank_statements exists
    const checkBankStatements = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'iolta_bank_statements'
      );
    `);
    
    const bankStatementsExists = checkBankStatements.rows[0].exists;
    
    if (!bankStatementsExists) {
      console.log('Creating iolta_bank_statements table...');
      await db.execute(sql`
        CREATE TABLE iolta_bank_statements (
          id SERIAL PRIMARY KEY,
          trust_account_id INTEGER NOT NULL REFERENCES iolta_trust_accounts(id),
          statement_date DATE NOT NULL,
          beginning_balance NUMERIC NOT NULL,
          ending_balance NUMERIC NOT NULL,
          deposits NUMERIC NOT NULL DEFAULT '0',
          withdrawals NUMERIC NOT NULL DEFAULT '0',
          fees NUMERIC NOT NULL DEFAULT '0',
          interest NUMERIC NOT NULL DEFAULT '0',
          uploaded_by INTEGER NOT NULL,
          uploaded_at TIMESTAMP DEFAULT NOW(),
          file_url TEXT,
          is_imported BOOLEAN DEFAULT FALSE,
          imported_at TIMESTAMP,
          import_notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('Successfully created iolta_bank_statements table');
    } else {
      console.log('iolta_bank_statements table already exists');
    }

    // Check if legal_portal_users exists
    const checkPortalUsers = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'legal_portal_users'
      );
    `);
    
    const portalUsersExists = checkPortalUsers.rows[0].exists;
    
    if (!portalUsersExists) {
      console.log('Creating legal_portal_users table...');
      await db.execute(sql`
        CREATE TABLE legal_portal_users (
          id SERIAL PRIMARY KEY,
          client_id INTEGER NOT NULL REFERENCES legal_clients(id),
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          phone TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          zip_code TEXT,
          country TEXT DEFAULT 'USA',
          is_enabled BOOLEAN DEFAULT TRUE,
          last_login TIMESTAMP,
          password_reset_token TEXT,
          password_reset_expires TIMESTAMP,
          two_factor_enabled BOOLEAN DEFAULT FALSE,
          two_factor_secret TEXT,
          terms_accepted BOOLEAN DEFAULT FALSE,
          terms_accepted_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('Successfully created legal_portal_users table');
    } else {
      console.log('legal_portal_users table already exists');
    }

    // Check if legal_portal_sessions exists
    const checkPortalSessions = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'legal_portal_sessions'
      );
    `);
    
    const portalSessionsExists = checkPortalSessions.rows[0].exists;
    
    if (!portalSessionsExists) {
      console.log('Creating legal_portal_sessions table...');
      await db.execute(sql`
        CREATE TABLE legal_portal_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES legal_portal_users(id),
          token TEXT NOT NULL UNIQUE,
          ip_address TEXT,
          user_agent TEXT,
          expires_at TIMESTAMP NOT NULL,
          last_activity_at TIMESTAMP DEFAULT NOW(),
          is_revoked BOOLEAN DEFAULT FALSE,
          revoked_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('Successfully created legal_portal_sessions table');
    } else {
      console.log('legal_portal_sessions table already exists');
    }

    console.log('All missing IOLTA tables created successfully');
    return true;
  } catch (error) {
    console.error('Error creating missing IOLTA tables:', error);
    return false;
  }
}

// Run the function immediately in ESM context
createMissingTables()
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

export { createMissingTables };