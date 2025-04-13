/**
 * Test IOLTA Document Integration 
 * 
 * This script tests the integration between IOLTA trust accounting and the document
 * management system, verifying that documents can be attached to transactions.
 * 
 * Run with: npx tsx scripts/test-iolta-document-integration.ts
 */

import { db } from '../server/db';
import { eq } from 'drizzle-orm';
import { ioltaService } from '../server/services/legal/iolta-service';
import { documentService } from '../server/services/legal/document-service';
import { sqlService } from '../server/services/sql-service';
import { 
  ioltaTrustAccounts, 
  ioltaClientLedgers, 
  ioltaTransactions, 
  legalClients 
} from '../shared/schema';
import { InsertIoltaTransaction, InsertLegalDocument } from '../shared/schema';

// Helper function to generate a test file buffer
function generateTestPdfBuffer(): Buffer {
  const pdfContent = `%PDF-1.4
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Kids[3 0 R]/Count 1>>
endobj
3 0 obj
<</Type/Page/MediaBox[0 0 612 792]/Resources<<>>/Contents 4 0 R/Parent 2 0 R>>
endobj
4 0 obj
<</Length 22>>
stream
BT
/F1 12 Tf
100 700 Td
(Test IOLTA Document) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000056 00000 n
0000000107 00000 n
0000000212 00000 n
trailer
<</Size 5/Root 1 0 R>>
startxref
292
%%EOF
`;
  return Buffer.from(pdfContent);
}

async function testIoltaDocumentIntegration() {
  console.log("Starting IOLTA Document Integration Test...");
  
  try {
    // Check for existing test data
    const testMerchantId = 12345; // Use a known test merchant ID
    
    // First, make sure we have a test legal client
    console.log("Checking for existing test client...");
    let testClient = await db.query.legalClients.findFirst({
      where: eq(legalClients.merchantId, testMerchantId)
    });
    
    // If no test client exists, create one using direct SQL
    if (!testClient) {
      console.log("Creating test legal client...");
      
      // Use direct SQL to create a client record
      const clientInsertResult = await sqlService.rawSQL(`
        INSERT INTO legal_clients 
          (merchant_id, client_type, first_name, last_name, email, phone, client_number, jurisdiction, is_active, created_at, updated_at) 
        VALUES 
          (${testMerchantId}, 'individual', 'Test', 'Client', 'test@example.com', '555-123-4567', 'TC-${Date.now()}', 'CA', true, NOW(), NOW())
        RETURNING id
      `);
      
      // Get the ID of the newly created client
      const clientId = clientInsertResult[0].id;
      console.log(`Created test client with ID: ${clientId}`);
      
      // Fetch the new client record
      testClient = await db.query.legalClients.findFirst({
        where: eq(legalClients.id, clientId)
      });
    } else {
      console.log(`Using existing test client with ID: ${testClient.id}`);
    }
    
    // Check if we have an IOLTA trust account for our test
    let account = await db.query.ioltaTrustAccounts.findFirst({
      where: eq(ioltaTrustAccounts.merchantId, testMerchantId)
    });
    
    // If no account exists, create a new one
    if (!account) {
      console.log("Creating test trust account...");
      account = await ioltaService.createTrustAccount({
        merchantId: testMerchantId,
        accountName: "Test IOLTA Trust Account",
        accountNumber: "TEST-ACCT-" + Date.now(),
        bankName: "Test Bank",
        routing: "123456789",
        balance: "0.00",
        status: "active",
        notes: "Test account for document integration testing",
        clientId: testClient.id, // Use the ID of our test client
        firmId: testMerchantId
      });
      console.log(`Created trust account with ID: ${account.id}`);
    } else {
      console.log(`Using existing trust account with ID: ${account.id}`);
    }
    
    // Check if we have a client ledger for our test
    let clientLedger = await db.query.ioltaClientLedgers.findFirst({
      where: eq(ioltaClientLedgers.trustAccountId, account.id)
    });
    
    // If no client ledger exists, create a new one
    if (!clientLedger) {
      console.log("Creating test client ledger...");
      clientLedger = await ioltaService.createClientLedger({
        merchantId: testMerchantId,
        trustAccountId: account.id,
        clientId: testClient.id.toString(), // Use the client ID from our test client
        clientName: testClient.firstName + " " + testClient.lastName,
        matterName: "Test Matter",
        matterNumber: "TM-" + Date.now(),
        balance: "0.00",
        currentBalance: "0.00",
        status: "active",
        jurisdiction: "CA",
        notes: "Test client ledger for document integration testing"
      });
      console.log(`Created client ledger with ID: ${clientLedger.id}`);
    } else {
      console.log(`Using existing client ledger with ID: ${clientLedger.id}`);
    }
    
    // Create a test transaction
    console.log("Creating test transaction...");
    
    // Get or create a test user ID for the createdBy field
    let testUserId = 1; // Default test user ID
    
    const transactionData: InsertIoltaTransaction = {
      merchantId: testMerchantId,
      trustAccountId: account.id,
      clientLedgerId: clientLedger.id,
      transactionType: "deposit",
      amount: "1000.00",
      description: "Test deposit with document",
      reference: "REF-DOC-" + Date.now(),
      createdBy: testUserId,
      cleared: false
    };
    
    const transaction = await ioltaService.recordTransaction(transactionData);
    console.log(`Created transaction with ID: ${transaction.id}`);
    
    // Create a test document
    console.log("Creating test document...");
    
    // Create a test matter if needed
    console.log("Creating or finding test matter...");
    let testMatterId;
    const matterResult = await sqlService.rawSQL(`
      SELECT id FROM legal_matters 
      WHERE merchant_id = ${testMerchantId} AND client_id = ${testClient.id}
      LIMIT 1
    `);
    
    if (matterResult.length === 0) {
      console.log("Creating test matter...");
      const matterNumber = `TM-${Date.now()}`;
      const matterInsertResult = await sqlService.rawSQL(`
        INSERT INTO legal_matters 
          (merchant_id, client_id, title, description, practice_area, open_date, status, matter_number, matter_type, billing_type, created_at, updated_at) 
        VALUES 
          (${testMerchantId}, ${testClient.id}, 'Test Matter', 'Matter for IOLTA document testing', 'other', NOW(), 'active', '${matterNumber}', 'general', 'hourly', NOW(), NOW())
        RETURNING id
      `);
      testMatterId = matterInsertResult[0].id;
      console.log(`Created test matter with ID: ${testMatterId}`);
    } else {
      testMatterId = matterResult[0].id;
      console.log(`Using existing matter with ID: ${testMatterId}`);
    }
    
    // Generate a test PDF file buffer
    const fileBuffer = generateTestPdfBuffer();
    
    // Log the test user ID to verify it's a valid integer
    console.log("Test user ID (should be numeric):", testUserId);
    
    const documentData: InsertLegalDocument = {
      merchantId: testMerchantId,
      matterId: testMatterId, // Add the required matterId field
      title: "Test IOLTA Transaction Document",
      description: "This is a test document for IOLTA transaction",
      documentType: "other", // Using one of the allowed document types
      status: "final",
      authorId: testUserId, // Use numeric user ID
      lastModifiedById: testUserId, // Use numeric user ID
      uploaded_by: 1, // Explicitly set the uploaded_by field to a hardcoded integer value
      clientId: testClient.id, // Use the test client's ID
      fileLocation: "test-document.pdf", // Add required fileLocation field
      fileSize: fileBuffer.length, // Add file size based on buffer length
      metaData: {
        transactionType: "deposit",
        amount: "1000.00",
        documentCategory: "iolta_transaction" // Store the IOLTA-specific type in metadata
      }
    };
    
    // Create the document
    const document = await documentService.createDocument(documentData, fileBuffer);
    console.log(`Created document with ID: ${document.id}`);
    
    // Attach the document to the transaction
    console.log("Attaching document to transaction...");
    const updatedTransaction = await ioltaService.attachDocumentToTransaction(transaction.id, document.id);
    console.log(`Document attached to transaction. Document URL: ${updatedTransaction.documentUrl}`);
    
    // Test retrieving the document from the transaction
    console.log("Retrieving document from transaction...");
    const retrievedDocument = await ioltaService.getTransactionDocument(transaction.id);
    
    if (retrievedDocument) {
      console.log(`Successfully retrieved document: ${retrievedDocument.title}`);
      console.log("Document details:", JSON.stringify(retrievedDocument, null, 2));
    } else {
      console.error("Failed to retrieve document from transaction!");
    }
    
    // Test the combined method to create transaction with document in one call
    console.log("\nTesting recordTransactionWithDocument method...");
    
    const newTransactionData: InsertIoltaTransaction = {
      merchantId: testMerchantId,
      trustAccountId: account.id,
      clientLedgerId: clientLedger.id,
      transactionType: "deposit",
      amount: "500.00",
      description: "Second test deposit with document",
      reference: "REF-DOC-COMBINED-" + Date.now(),
      createdBy: testUserId, // Use numeric ID instead of string
      cleared: false
    };
    
    const newDocumentData: InsertLegalDocument = {
      merchantId: testMerchantId,
      matterId: testMatterId, // Include the required matterId field
      title: "Combined Transaction Document",
      description: "Document created with transaction in a single call",
      documentType: "other", // Using one of the allowed document types
      status: "final",
      authorId: testUserId, // Use numeric user ID 
      lastModifiedById: testUserId, // Use numeric user ID
      uploaded_by: 1, // Explicitly set the uploaded_by field to a hardcoded integer value
      clientId: testClient.id, // Use the test client's ID
      fileLocation: "combined-transaction-document.pdf", // Add required fileLocation field
      fileSize: fileBuffer.length, // Add file size based on buffer length
      metaData: {
        documentCategory: "iolta_transaction"
      }
    };
    
    const combinedResult = await ioltaService.recordTransactionWithDocument(
      newTransactionData,
      newDocumentData,
      fileBuffer
    );
    
    console.log(`Created transaction with document in one call. Transaction ID: ${combinedResult.id}`);
    console.log(`Document URL: ${combinedResult.documentUrl}`);
    
    // Test retrieving all documents for a client ledger
    console.log("\nTesting getClientLedgerDocuments method...");
    const ledgerDocuments = await ioltaService.getClientLedgerDocuments(clientLedger.id);
    
    console.log(`Found ${ledgerDocuments.length} documents for client ledger`);
    if (ledgerDocuments.length > 0) {
      console.log("Document list:", ledgerDocuments.map(doc => ({
        id: doc.id,
        title: doc.title
      })));
    }
    
    console.log("\nIOLTA Document Integration Test Completed Successfully!");
    
  } catch (error) {
    console.error("Error testing IOLTA document integration:", error);
  }
}

// Run the test
testIoltaDocumentIntegration().catch(console.error);