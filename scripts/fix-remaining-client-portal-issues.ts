/**
 * Fix Remaining Client Portal Issues
 * 
 * This script fixes:
 * 1. Adds parent_document_id column to legal_documents table
 * 2. Fixes test-client-portal.ts to properly define test results array
 * 
 * Run with: npx tsx scripts/fix-remaining-client-portal-issues.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';
import path from 'path';

neonConfig.webSocketConstructor = ws;

async function fixRemainingClientPortalIssues() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Fixing remaining client portal issues...");

    // 1. Add parent_document_id column to legal_documents
    console.log("Checking for parent_document_id column in legal_documents...");
    
    const hasParentDocumentId = await checkColumnExists('legal_documents', 'parent_document_id');
    
    if (!hasParentDocumentId) {
      await pool.query(`
        ALTER TABLE legal_documents
        ADD COLUMN parent_document_id INTEGER REFERENCES legal_documents(id)
      `);
      console.log("Added parent_document_id column to legal_documents table");
    } else {
      console.log("parent_document_id column already exists in legal_documents table");
    }
    
    // 2. Fix the testInvoiceAccess method in test-client-portal.ts
    console.log("Fixing testInvoiceAccess method in test-client-portal.ts...");
    
    const testClientPortalPath = path.join(process.cwd(), 'server', 'services', 'testing', 'test-client-portal.ts');
    
    if (fs.existsSync(testClientPortalPath)) {
      let content = fs.readFileSync(testClientPortalPath, 'utf8');
      
      // Fix the testInvoiceAccess method to properly define test results array
      const testInvoiceAccessPattern = /private async testInvoiceAccess\(\)[^}]*}/s;
      
      if (testInvoiceAccessPattern.test(content)) {
        const fixedMethod = `private async testInvoiceAccess(): Promise<TestGroup> {
    const tests: TestResult[] = [];
    let groupPassed = true;
    
    try {
      // Get invoices for the client
      const invoices = await this.clientPortalService.getClientInvoices(
        this.testClientId,
        this.testMerchantId
      );
      
      // Validate invoice data
      const valid = Array.isArray(invoices) && invoices.length > 0;
      tests.push({
        name: 'Get client invoices',
        passed: valid,
        description: 'Should retrieve invoices for the client',
        error: valid ? null : 'Failed to retrieve client invoices'
      });
      
      if (!valid) {
        groupPassed = false;
      }
      
    } catch (error) {
      console.error('Error getting client invoices:', error);
      tests.push({
        name: 'Get client invoices',
        passed: false,
        description: 'Should retrieve invoices for the client',
        error: error instanceof Error ? error.message : String(error)
      });
      groupPassed = false;
    }
    
    return {
      name: 'Invoice Access',
      description: 'Tests for accessing client invoices via the portal',
      tests,
      passed: groupPassed
    };
  }`;
        
        const updatedContent = content.replace(testInvoiceAccessPattern, fixedMethod);
        fs.writeFileSync(testClientPortalPath, updatedContent, 'utf8');
        console.log("Updated testInvoiceAccess method in test-client-portal.ts");
      } else {
        console.log("Couldn't find testInvoiceAccess method in test-client-portal.ts");
      }
    }
    
    console.log("Remaining client portal issues fixed!");
  } catch (error) {
    console.error("Error fixing remaining client portal issues:", error);
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

fixRemainingClientPortalIssues().catch(console.error);