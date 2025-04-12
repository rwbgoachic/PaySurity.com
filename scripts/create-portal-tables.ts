/**
 * Create Missing Portal Tables Script
 * 
 * This script creates the missing portal-related tables based on the schema
 * definitions in shared/schema-portal.ts
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';

async function createMissingPortalTables() {
  console.log(chalk.blue.bold('Creating Missing Portal Tables...'));
  
  try {
    // Create legal_portal_activities table if it doesn't exist
    console.log('Checking for legal_portal_activities table...');
    const activitiesTableExists = await checkTableExists('legal_portal_activities');
    
    if (!activitiesTableExists) {
      console.log(chalk.yellow('Creating legal_portal_activities table...'));
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS legal_portal_activities (
          id SERIAL PRIMARY KEY,
          portal_user_id INTEGER,
          client_id INTEGER NOT NULL,
          merchant_id INTEGER NOT NULL,
          activity_type TEXT NOT NULL,
          description TEXT NOT NULL,
          details JSONB,
          timestamp TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log(chalk.green('✓ legal_portal_activities table created'));
    } else {
      console.log(chalk.green('✓ legal_portal_activities table already exists'));
    }

    // Check for legal_portal_shared_documents table
    console.log('Checking for legal_portal_shared_documents table...');
    const sharedDocsTableExists = await checkTableExists('legal_portal_shared_documents');
    
    if (!sharedDocsTableExists) {
      console.log(chalk.yellow('Creating legal_portal_shared_documents table...'));
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS legal_portal_shared_documents (
          id SERIAL PRIMARY KEY,
          document_id INTEGER NOT NULL,
          client_id INTEGER NOT NULL,
          merchant_id INTEGER NOT NULL,
          matter_id INTEGER,
          shared_by_id INTEGER NOT NULL,
          shared_at TIMESTAMP NOT NULL DEFAULT NOW(),
          note TEXT,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          expires_at TIMESTAMP,
          viewed_at TIMESTAMP
        )
      `);
      console.log(chalk.green('✓ legal_portal_shared_documents table created'));
    } else {
      console.log(chalk.green('✓ legal_portal_shared_documents table already exists'));
    }

    // Check for legal_portal_messages table
    console.log('Checking for legal_portal_messages table...');
    const messagesTableExists = await checkTableExists('legal_portal_messages');
    
    if (!messagesTableExists) {
      console.log(chalk.yellow('Creating legal_portal_messages table...'));
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS legal_portal_messages (
          id SERIAL PRIMARY KEY,
          merchant_id INTEGER NOT NULL,
          client_id INTEGER NOT NULL,
          matter_id INTEGER,
          sender_id INTEGER NOT NULL,
          sender_type TEXT NOT NULL,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          attachment_ids INTEGER[],
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          read_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log(chalk.green('✓ legal_portal_messages table created'));
    } else {
      console.log(chalk.green('✓ legal_portal_messages table already exists'));
    }
    
    console.log(chalk.green.bold('✅ Portal tables creation completed'));
  } catch (error) {
    console.error(chalk.red('Error creating portal tables:'), error);
    throw error;
  }
}

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    `);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    throw error;
  }
}

// Run the function
createMissingPortalTables().catch(console.error);