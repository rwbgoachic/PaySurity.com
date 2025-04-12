/**
 * Fix Last Portal Issues Script
 * 
 * This script addresses the very last remaining issues:
 * 1. Missing last_modified_by_id in legal_documents
 * 2. Special fix for the matter_number issue in getClientInvoices
 * 
 * Run with: npx tsx scripts/fix-last-portal-issues.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';
import path from 'path';

neonConfig.webSocketConstructor = ws;

async function fixLastPortalIssues() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Fixing last portal issues...");

    // 1. Add last_modified_by_id to legal_documents
    console.log("Checking for last_modified_by_id column in legal_documents...");
    
    const hasLastModifiedById = await checkColumnExists('legal_documents', 'last_modified_by_id');
    
    if (!hasLastModifiedById) {
      await pool.query(`
        ALTER TABLE legal_documents
        ADD COLUMN last_modified_by_id INTEGER
      `);
      console.log("Added last_modified_by_id column to legal_documents table");
    } else {
      console.log("last_modified_by_id column already exists in legal_documents table");
    }
    
    // Check for any other potentially missing columns in legal_documents
    const missingColumns = [
      { name: 'last_modified_at', type: 'TIMESTAMP' },
      { name: 'signed_at', type: 'TIMESTAMP' },
      { name: 'signed_by_id', type: 'INTEGER' },
      { name: 'expiration_date', type: 'DATE' },
      { name: 'bates_number_prefix', type: 'TEXT' }
    ];
    
    for (const column of missingColumns) {
      const hasColumn = await checkColumnExists('legal_documents', column.name);
      
      if (!hasColumn) {
        await pool.query(`
          ALTER TABLE legal_documents
          ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`Added ${column.name} column to legal_documents table`);
      }
    }
    
    // 2. Special fix for matter_number issue in client-portal-service
    console.log("Checking client-portal-service.ts for matter_number references...");
    
    const clientPortalServicePath = path.join(process.cwd(), 'server', 'services', 'legal', 'client-portal-service.ts');
    
    if (fs.existsSync(clientPortalServicePath)) {
      let content = fs.readFileSync(clientPortalServicePath, 'utf8');
      
      // Check for matter_number query in getClientInvoices
      if (content.includes('matter_number') && content.includes('getClientInvoices')) {
        console.log("Found matter_number reference in getClientInvoices - modifying query");
        
        // Find and replace the getClientInvoices method
        const getClientInvoicesRegex = /async getClientInvoices\([^}]*\}\s*\}\s*catch/s;
        
        const fixedMethod = `async getClientInvoices(clientId: number, merchantId: number): Promise<LegalInvoice[]> {
    try {
      const invoices = await db.select()
        .from(legalInvoices)
        .where(and(
          eq(legalInvoices.clientId, clientId),
          eq(legalInvoices.merchantId, merchantId),
          eq(legalInvoices.status, 'sent')
        ))
        .orderBy(desc(legalInvoices.createdAt));
      
      return invoices;
    }
  } catch`;
        
        // Only replace if the pattern matches
        if (getClientInvoicesRegex.test(content)) {
          content = content.replace(getClientInvoicesRegex, fixedMethod);
          fs.writeFileSync(clientPortalServicePath, content, 'utf8');
          console.log("Updated getClientInvoices method");
        } else {
          console.log("Couldn't find expected getClientInvoices pattern");
        }
      }
    }
    
    // Add showInClientPortal column to relevant tables if missing
    const timeEntryShowInPortal = await checkColumnExists('legal_time_entries', 'show_in_client_portal');
    
    if (!timeEntryShowInPortal) {
      await pool.query(`
        ALTER TABLE legal_time_entries
        ADD COLUMN show_in_client_portal BOOLEAN NOT NULL DEFAULT TRUE
      `);
      console.log("Added show_in_client_portal column to legal_time_entries table");
    }
    
    const expenseEntryShowInPortal = await checkColumnExists('legal_expense_entries', 'show_in_client_portal');
    
    if (!expenseEntryShowInPortal) {
      await pool.query(`
        ALTER TABLE legal_expense_entries
        ADD COLUMN show_in_client_portal BOOLEAN NOT NULL DEFAULT TRUE
      `);
      console.log("Added show_in_client_portal column to legal_expense_entries table");
    }
    
    console.log("Last portal issues fixed!");
  } catch (error) {
    console.error("Error fixing last portal issues:", error);
  } finally {
    await pool.end();
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
}

fixLastPortalIssues().catch(console.error);