/**
 * Script to create the missing legal_document_versions table
 * 
 * This script creates the table for document versioning which is needed
 * for the IOLTA document integration tests to work
 * 
 * Run with: npx tsx scripts/fix-document-versions-table.ts
 */

import { neon } from '@neondatabase/serverless';
import { db } from '../server/db';

async function fixDocumentVersionsTable() {
  console.log("Starting to fix document versions table...");
  
  try {
    // Check if table exists first
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'legal_document_versions'
      );
    `;
    
    const tableExistsResult = await db.execute(tableExistsQuery);
    console.log("Table exists query result:", tableExistsResult);
    const exists = tableExistsResult && tableExistsResult.length > 0 ? tableExistsResult[0].exists === true : false;
    
    if (exists) {
      console.log("legal_document_versions table already exists");
      return;
    }
    
    console.log("Creating legal_document_versions table...");
    
    // Create the legal_document_versions table
    const createTableQuery = `
      CREATE TABLE legal_document_versions (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL,
        version_number TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by_id INTEGER NOT NULL,
        file_location TEXT NOT NULL,
        file_size INTEGER,
        change_description TEXT,
        metadata JSONB,
        CONSTRAINT fk_document
          FOREIGN KEY(document_id) 
          REFERENCES legal_documents(id)
          ON DELETE CASCADE
      );
    `;
    
    await db.execute(createTableQuery);
    console.log("Successfully created legal_document_versions table");
    
    // Also need to create the legal_document_templates table if it doesn't exist
    const templateTableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'legal_document_templates'
      );
    `;
    
    const templateTableExists = await db.execute(templateTableExistsQuery);
    const templateExists = templateTableExists[0].exists;
    
    if (templateExists) {
      console.log("legal_document_templates table already exists");
      return;
    }
    
    console.log("Creating legal_document_templates table...");
    
    // Create the legal_document_templates table
    const createTemplateTableQuery = `
      CREATE TABLE legal_document_templates (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        document_type TEXT NOT NULL,
        practice_area TEXT NOT NULL,
        file_location TEXT NOT NULL,
        variables JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by_id INTEGER NOT NULL,
        last_modified_at TIMESTAMP,
        last_modified_by_id INTEGER,
        is_active BOOLEAN DEFAULT TRUE,
        usage_count INTEGER DEFAULT 0
      );
    `;
    
    await db.execute(createTemplateTableQuery);
    console.log("Successfully created legal_document_templates table");
    
    console.log("Document table fixes complete!");
    
  } catch (error) {
    console.error("Error fixing document versions table:", error);
  }
}

// Run the script
fixDocumentVersionsTable().catch(console.error);