/**
 * Fix Document Schema Inconsistency
 * 
 * This script aligns the database schema with the code references by:
 * 1. Checking if legal_documents has column "status" (renamed from document_status)
 * 2. Updating the schema.ts file to refer to the correct column name
 * 
 * Run with: npx tsx scripts/fix-document-schema.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';
import path from 'path';

neonConfig.webSocketConstructor = ws;

async function fixDocumentSchema() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Fixing document schema inconsistency...");

    // 1. Check if status column exists on legal_documents
    const checkStatusResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'legal_documents' AND column_name = 'status'
    `);
    
    const statusExists = checkStatusResult.rows.length > 0;
    
    // 2. Check if document_status column exists on legal_documents
    const checkDocStatusResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'legal_documents' AND column_name = 'document_status'
    `);
    
    const docStatusExists = checkDocStatusResult.rows.length > 0;
    
    // 3. Fix the database schema if needed
    if (docStatusExists && !statusExists) {
      console.log("Renaming document_status to status in legal_documents table");
      await pool.query(`
        ALTER TABLE legal_documents
        RENAME COLUMN document_status TO status
      `);
    } else if (!docStatusExists && !statusExists) {
      console.log("Adding status column to legal_documents table");
      await pool.query(`
        ALTER TABLE legal_documents
        ADD COLUMN status VARCHAR(50) DEFAULT 'draft' NOT NULL
      `);
    } else {
      console.log("Status column already exists in legal_documents table");
    }
    
    // 4. Update schema.ts to match the database
    const schemaPath = path.join(process.cwd(), 'shared', 'schema.ts');
    
    if (fs.existsSync(schemaPath)) {
      console.log("Updating schema.ts to match the database schema");
      
      let schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      // Check if schema needs updating - look for status: legalDocumentStatusEnum("document_status")
      if (schemaContent.includes('status: legalDocumentStatusEnum("document_status")')) {
        // Replace with status: legalDocumentStatusEnum("status")
        schemaContent = schemaContent.replace(
          'status: legalDocumentStatusEnum("document_status")',
          'status: legalDocumentStatusEnum("status")'
        );
        
        fs.writeFileSync(schemaPath, schemaContent, 'utf8');
        console.log("Updated schema.ts to use 'status' column name");
      } else {
        console.log("Schema.ts already using correct column name");
      }
    }
    
    // 5. Check for query references to document_status
    console.log("Checking for service references to document_status...");
    const clientPortalServicePath = path.join(process.cwd(), 'server', 'services', 'legal', 'client-portal-service.ts');
    
    if (fs.existsSync(clientPortalServicePath)) {
      let serviceContent = fs.readFileSync(clientPortalServicePath, 'utf8');
      
      // Find and update any references to document_status
      const hasDocStatusRefs = serviceContent.includes('document_status');
      
      if (hasDocStatusRefs) {
        serviceContent = serviceContent.replace(/document_status/g, 'status');
        fs.writeFileSync(clientPortalServicePath, serviceContent, 'utf8');
        console.log("Updated client-portal-service.ts to use 'status' column name");
      } else {
        console.log("No references to document_status found in client-portal-service.ts");
      }
    }
    
    console.log("Document schema inconsistency fixed!");
  } catch (error) {
    console.error("Error fixing document schema:", error);
  } finally {
    await pool.end();
  }
}

fixDocumentSchema().catch(console.error);