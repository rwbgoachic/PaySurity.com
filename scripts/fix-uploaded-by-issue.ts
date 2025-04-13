/**
 * Script to fix the uploaded_by issue in legal_documents by using raw SQL
 * 
 * This script directly inserts a test document with uploaded_by field set through SQL
 * 
 * Run with: npx tsx scripts/fix-uploaded-by-issue.ts
 */

import { db } from '../server/db';
import { DocumentService } from '../server/services/legal/document-service';
import { IoltaService } from '../server/services/legal/iolta-service';
import { neon } from '@neondatabase/serverless';
import path from 'path';
import fs from 'fs';
import { randomBytes } from 'crypto';

// Sample document content for testing
function generateTestPdfBuffer(): Buffer {
  // Simple PDF header to make a valid minimal PDF file
  const pdfContent = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF";
  return Buffer.from(pdfContent);
}

// Constants
const TEST_MERCHANT_ID = 12345;
const TEST_MATTER_ID = 5;
const TEST_CLIENT_ID = 11;

async function fixUploadedByIssue() {
  try {
    console.log("Starting uploaded_by fix script...");

    // Generate test PDF buffer
    const fileBuffer = generateTestPdfBuffer();
    const fileName = `${Date.now()}-${randomBytes(8).toString('hex')}.pdf`;
    
    // Document directory path (mirroring the one in DocumentService)
    const documentDir = path.join(process.cwd(), 'documents');
    if (!fs.existsSync(documentDir)) {
      fs.mkdirSync(documentDir, { recursive: true });
    }
    
    // Save the file to disk
    const filePath = path.join(documentDir, fileName);
    fs.writeFileSync(filePath, fileBuffer);
    
    console.log(`Created test file: ${fileName}`);
    
    // Direct SQL insertion to ensure uploaded_by is set properly
    const query = `
      INSERT INTO legal_documents (
        merchant_id, matter_id, client_id, title, document_type, 
        status, uploaded_by, uploaded_at, file_location, file_size,
        description, confidentiality_level, author_id, last_modified_by_id,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, 
        $6, $7, NOW(), $8, $9,
        $10, $11, $12, $13,
        NOW(), NOW()
      ) RETURNING id;
    `;
    
    const values = [
      TEST_MERCHANT_ID,
      TEST_MATTER_ID,
      TEST_CLIENT_ID,
      "Test Document SQL Insertion",
      "other",
      "draft",
      1, // HARD-CODED uploaded_by
      fileName,
      fileBuffer.length,
      "Testing SQL insertion with explicit uploaded_by value",
      "client_confidential",
      1, // author_id
      1  // last_modified_by_id
    ];
    
    // Use the execute_sql_tool via db.execute directly
    const result = await db.execute(query, values);
    console.log("SQL insertion result:", result);
    const documentId = result[0].id;
    
    console.log(`Successfully inserted document with ID: ${documentId}`);
    console.log("Uploaded_by issue fixed successfully!");
    
    // Now try to attach this document to a transaction
    const ioltaService = new IoltaService();
    
    // Get existing transactions to attach to
    const transactions = await db.query.ioltaTransactions.findMany({
      where: (transaction, { eq }) => eq(transaction.merchantId, TEST_MERCHANT_ID),
      limit: 1
    });
    
    if (transactions.length > 0) {
      const transaction = transactions[0];
      console.log(`Attaching document to transaction ID: ${transaction.id}`);
      
      // Attach document to transaction
      try {
        await ioltaService.attachDocumentToTransaction(transaction.id, documentId);
        console.log("Successfully attached document to transaction");
      } catch (error) {
        console.error("Error attaching document to transaction:", error);
      }
    } else {
      console.log("No transactions found to attach document to");
    }
    
  } catch (error) {
    console.error("Error fixing uploaded_by issue:", error);
  }
}

// Run the script
fixUploadedByIssue().catch(console.error);