/**
 * Create Missing Portal Tables Script
 * 
 * This script creates the missing portal-related tables based on the schema
 * definitions in shared/schema-portal.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function createMissingPortalTables() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Creating missing portal tables...");

    // First check if legal_portal_sessions exists
    if (!await checkTableExists('legal_portal_sessions')) {
      console.log("Creating legal_portal_sessions table...");
      await pool.query(`
        CREATE TABLE legal_portal_sessions (
          id SERIAL PRIMARY KEY,
          portal_user_id INTEGER NOT NULL,
          client_id INTEGER NOT NULL,
          merchant_id INTEGER NOT NULL,
          token VARCHAR(64) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          ip_address VARCHAR(45),
          user_agent VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          invalidated_at TIMESTAMP
        )
      `);
      console.log("legal_portal_sessions table created");
    } else {
      console.log("legal_portal_sessions table already exists");
      
      // Check and add any missing columns
      await ensureColumnExists('legal_portal_sessions', 'portal_user_id', 'INTEGER NOT NULL');
      await ensureColumnExists('legal_portal_sessions', 'client_id', 'INTEGER NOT NULL');
      await ensureColumnExists('legal_portal_sessions', 'merchant_id', 'INTEGER NOT NULL');
    }
    
    // Check if legal_portal_activities exists
    if (!await checkTableExists('legal_portal_activities')) {
      console.log("Creating legal_portal_activities table...");
      await pool.query(`
        CREATE TABLE legal_portal_activities (
          id SERIAL PRIMARY KEY,
          portal_user_id INTEGER,
          client_id INTEGER NOT NULL,
          merchant_id INTEGER NOT NULL,
          activity_type TEXT NOT NULL,
          description TEXT NOT NULL,
          details JSONB,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("legal_portal_activities table created");
    } else {
      console.log("legal_portal_activities table already exists");
    }
    
    // Check if legal_portal_shared_documents exists
    if (!await checkTableExists('legal_portal_shared_documents')) {
      console.log("Creating legal_portal_shared_documents table...");
      await pool.query(`
        CREATE TABLE legal_portal_shared_documents (
          id SERIAL PRIMARY KEY,
          document_id INTEGER NOT NULL,
          client_id INTEGER NOT NULL,
          merchant_id INTEGER NOT NULL,
          matter_id INTEGER,
          shared_by_id INTEGER NOT NULL,
          shared_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          note TEXT,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          expires_at TIMESTAMP,
          viewed_at TIMESTAMP
        )
      `);
      console.log("legal_portal_shared_documents table created");
    } else {
      console.log("legal_portal_shared_documents table already exists");
    }
    
    // Check if legal_portal_messages exists
    if (!await checkTableExists('legal_portal_messages')) {
      console.log("Creating legal_portal_messages table...");
      await pool.query(`
        CREATE TABLE legal_portal_messages (
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("legal_portal_messages table created");
    } else {
      console.log("legal_portal_messages table already exists");
    }
    
    // Fix legal_documents table to ensure it has status column
    if (await checkTableExists('legal_documents')) {
      const hasStatus = await checkColumnExists('legal_documents', 'status');
      const hasDocStatus = await checkColumnExists('legal_documents', 'document_status');
      
      if (!hasStatus && !hasDocStatus) {
        console.log("Adding status column to legal_documents table");
        await pool.query(`
          ALTER TABLE legal_documents
          ADD COLUMN status VARCHAR(50) DEFAULT 'draft' NOT NULL
        `);
      } else if (hasDocStatus && !hasStatus) {
        console.log("Renaming document_status to status in legal_documents table");
        await pool.query(`
          ALTER TABLE legal_documents
          RENAME COLUMN document_status TO status
        `);
      }
    }
    
    // Fix legal_matters table to ensure it has matter_number column
    if (await checkTableExists('legal_matters')) {
      const hasMatterNumber = await checkColumnExists('legal_matters', 'matter_number');
      
      if (!hasMatterNumber) {
        console.log("Adding matter_number column to legal_matters table");
        await pool.query(`
          ALTER TABLE legal_matters
          ADD COLUMN matter_number VARCHAR(50)
        `);
        
        // Update existing records with a default matter number
        await pool.query(`
          UPDATE legal_matters
          SET matter_number = CONCAT('M-', id) 
          WHERE matter_number IS NULL
        `);
      }
    }
    
    console.log("Portal tables setup complete!");
  } catch (error) {
    console.error("Error setting up portal tables:", error);
  } finally {
    await pool.end();
  }

  /**
   * Check if a table exists in the database
   */
  async function checkTableExists(tableName: string): Promise<boolean> {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )
    `, [tableName]);
    
    return result.rows[0].exists;
  }
  
  /**
   * Check if a column exists in a table
   */
  async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      )
    `, [tableName, columnName]);
    
    return result.rows[0].exists;
  }
  
  /**
   * Ensure a column exists in a table, adding it if it doesn't
   */
  async function ensureColumnExists(tableName: string, columnName: string, columnType: string): Promise<void> {
    const exists = await checkColumnExists(tableName, columnName);
    
    if (!exists) {
      console.log(`Adding ${columnName} column to ${tableName} table`);
      await pool.query(`
        ALTER TABLE ${tableName}
        ADD COLUMN ${columnName} ${columnType}
      `);
    } else {
      console.log(`Column ${columnName} already exists in ${tableName} table`);
    }
  }
}

createMissingPortalTables().catch(console.error);