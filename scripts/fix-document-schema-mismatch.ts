/**
 * Script to fix the document schema mismatch between code and database
 * 
 * This script:
 * 1. Adds an "uploaded_by" reference to the schema definition in shared/schema.ts
 * 2. Updates the test integration script to set uploaded_by
 * 
 * Run with: npx tsx scripts/fix-document-schema-mismatch.ts
 */

import fs from 'fs';
import path from 'path';
import { db } from '../server/db';

async function fixDocumentSchemaMismatch() {
  console.log("Starting document schema mismatch fix...");
  
  try {
    // 1. Update the schema in shared/schema.ts to add uploaded_by field
    const schemaFilePath = path.join(process.cwd(), 'shared', 'schema.ts');
    
    if (!fs.existsSync(schemaFilePath)) {
      console.error("Could not find schema.ts file");
      return;
    }
    
    let schemaContent = fs.readFileSync(schemaFilePath, 'utf8');
    
    // Check if the uploaded_by field already exists in the schema
    if (schemaContent.includes('uploaded_by:')) {
      console.log("uploaded_by field already exists in schema definition");
    } else {
      // Add uploaded_by field to legalDocuments definition in schema.ts
      // Look for the authorId field, and add uploaded_by right after it
      const authorIdPattern = /authorId: integer\("author_id"\)\.notNull\(\),/;
      
      if (authorIdPattern.test(schemaContent)) {
        schemaContent = schemaContent.replace(
          authorIdPattern,
          'authorId: integer("author_id"),\n  uploaded_by: integer("uploaded_by").notNull(),  // Required by database schema'
        );
        
        // Write the updated schema back to the file
        fs.writeFileSync(schemaFilePath, schemaContent, 'utf8');
        console.log("Added uploaded_by field to schema definition");
      } else {
        console.error("Could not find authorId field in schema to add uploaded_by");
      }
    }
    
    // 2. Update the document-service.ts file to handle the uploaded_by field
    const documentServicePath = path.join(process.cwd(), 'server', 'services', 'legal', 'document-service.ts');
    
    if (!fs.existsSync(documentServicePath)) {
      console.error("Could not find document-service.ts file");
      return;
    }
    
    let documentServiceContent = fs.readFileSync(documentServicePath, 'utf8');
    
    // Check if we need to update the service to handle uploaded_by properly
    if (documentServiceContent.includes('uploaded_by: document.uploaded_by || document.authorId')) {
      console.log("Document service already handles uploaded_by field");
    } else {
      // Update the createDocument method to set uploaded_by from authorId
      const documentToInsertPattern = /const documentToInsert = \{[\s\S]*?fileLocation: fileName[\s\S]*?file_url: fileName[\s\S]*?\};/;
      
      if (documentToInsertPattern.test(documentServiceContent)) {
        documentServiceContent = documentServiceContent.replace(
          documentToInsertPattern,
          `const documentToInsert = {
        ...document,
        fileLocation: fileName,
        lastModifiedAt: new Date(),
        // Set file_url to the same as fileLocation for backward compatibility
        file_url: fileName,
        // Handle uploaded_by field required by database schema
        uploaded_by: document.uploaded_by || document.authorId || 1
      };`
        );
        
        // Write the updated service back to the file
        fs.writeFileSync(documentServicePath, documentServiceContent, 'utf8');
        console.log("Updated document-service.ts to handle uploaded_by field");
      } else {
        console.error("Could not find documentToInsert in document-service.ts to update");
      }
    }
    
    // 3. Update the test script to ensure uploaded_by is set
    const testScriptPath = path.join(process.cwd(), 'scripts', 'test-iolta-document-integration.ts');
    
    if (!fs.existsSync(testScriptPath)) {
      console.error("Could not find test-iolta-document-integration.ts file");
      return;
    }
    
    let testScriptContent = fs.readFileSync(testScriptPath, 'utf8');
    
    // Check if the test script already sets uploaded_by
    if (testScriptContent.includes('uploaded_by:')) {
      console.log("Test script already sets uploaded_by field");
    } else {
      // Add uploaded_by to the document data in the test script
      const documentDataPattern = /const documentData: InsertLegalDocument = \{[\s\S]*?authorId: testUserId/;
      
      if (documentDataPattern.test(testScriptContent)) {
        testScriptContent = testScriptContent.replace(
          documentDataPattern,
          `const documentData: InsertLegalDocument = {
      merchantId: testMerchantId,
      matterId: testMatterId,
      title: "Test IOLTA Transaction Document",
      description: "This is a test document for IOLTA transaction",
      documentType: "other",
      status: "final",
      authorId: testUserId,
      uploaded_by: testUserId // Set uploaded_by explicitly`
        );
        
        // Write the updated test script back to the file
        fs.writeFileSync(testScriptPath, testScriptContent, 'utf8');
        console.log("Updated test script to set uploaded_by field");
      } else {
        console.error("Could not find documentData in test script to update");
      }
    }
    
    console.log("Document schema mismatch fix completed successfully!");
    
  } catch (error) {
    console.error("Error fixing document schema mismatch:", error);
  }
}

// Run the fix script
fixDocumentSchemaMismatch().catch(console.error);