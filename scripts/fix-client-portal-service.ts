/**
 * Fix Client Portal Service
 * 
 * This script modifies the client-portal-service.ts file to properly handle
 * clientId type inconsistencies between IOLTA and portal tables.
 * 
 * Run with: npx tsx scripts/fix-client-portal-service.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_PORTAL_PATH = path.join(__dirname, '../server/services/legal/client-portal-service.ts');

async function fixClientPortalService() {
  console.log('Fixing Client Portal Service for clientId type handling...');
  
  try {
    // Read the current file
    let content = fs.readFileSync(CLIENT_PORTAL_PATH, 'utf8');
    
    // Check if the file already imports client-id-helper
    if (!content.includes('import { compareClientIds, parseClientId, ensureStringClientId } from')) {
      // Add the import
      content = content.replace(
        'import { generateToken } from \'../../utils/security\';',
        'import { generateToken } from \'../../utils/security\';\nimport { compareClientIds, parseClientId, ensureStringClientId } from \'./client-id-helper\';'
      );
      
      console.log('Added client-id-helper imports');
    }
    
    // Fix getClientDocuments method
    if (content.includes('getClientDocuments(clientId: number, merchantId: number)')) {
      content = content.replace(
        'getClientDocuments(clientId: number, merchantId: number)',
        'getClientDocuments(clientId: number | string, merchantId: number)'
      );
      
      // Update the query to handle different types
      content = content.replace(
        'eq(legalDocuments.clientId, clientId)',
        'eq(legalDocuments.clientId, Number(clientId))'
      );
      
      console.log('Fixed getClientDocuments method for clientId type flexibility');
    }
    
    // Fix getClientInvoices method
    if (content.includes('getClientInvoices(clientId: number, merchantId: number)')) {
      content = content.replace(
        'getClientInvoices(clientId: number, merchantId: number)',
        'getClientInvoices(clientId: number | string, merchantId: number)'
      );
      
      // Update the query to handle different types
      content = content.replace(
        'eq(legalInvoices.clientId, clientId)',
        'eq(legalInvoices.clientId, Number(clientId))'
      );
      
      console.log('Fixed getClientInvoices method for clientId type flexibility');
    }
    
    // Fix getClientTrustAccounts method
    if (content.includes('getClientTrustAccounts(clientId: number, merchantId: number)')) {
      content = content.replace(
        'getClientTrustAccounts(clientId: number, merchantId: number)',
        'getClientTrustAccounts(clientId: number | string, merchantId: number)'
      );
      
      // Add a function to convert the clientId to string for IOLTA tables
      const trustAccountsMethodContent = content.match(/async getClientTrustAccounts[\s\S]*?trustAccountId\);[\s\S]*?}\);/m);
      
      if (trustAccountsMethodContent) {
        const updatedMethod = trustAccountsMethodContent[0].replace(
          'const clientLedgers = await db.query.ioltaClientLedgers.findMany({',
          `// Convert clientId to string for IOLTA tables which use string clientId
          const clientIdStr = ensureStringClientId(clientId);
          
          const clientLedgers = await db.query.ioltaClientLedgers.findMany({`
        ).replace(
          'eq(ioltaClientLedgers.clientId, clientId)',
          'eq(ioltaClientLedgers.clientId, clientIdStr)'
        );
        
        content = content.replace(trustAccountsMethodContent[0], updatedMethod);
        
        console.log('Fixed getClientTrustAccounts method for clientId type conversion');
      }
    }

    // Fix getLedgerTransactions method
    if (content.includes('getLedgerTransactions')) {
      const transactionsMethodContent = content.match(/async getLedgerTransactions[\s\S]*?return transactions;[\s\S]*?}/m);
      
      if (transactionsMethodContent) {
        const updatedMethod = transactionsMethodContent[0].replace(
          'const clientLedgerId = await this.getClientLedgerId(clientId, merchantId, trustAccountId);',
          `// Convert clientId to string for IOLTA tables which use string clientId
          const clientIdStr = ensureStringClientId(clientId);
          const clientLedgerId = await this.getClientLedgerId(clientIdStr, merchantId, trustAccountId);`
        );
        
        content = content.replace(transactionsMethodContent[0], updatedMethod);
        
        console.log('Fixed getLedgerTransactions method for clientId type conversion');
      }
    }
    
    // Fix getClientLedgerId method
    if (content.includes('private async getClientLedgerId')) {
      content = content.replace(
        'private async getClientLedgerId(clientId: number | string, merchantId: number, trustAccountId: number)',
        'private async getClientLedgerId(clientId: string, merchantId: number, trustAccountId: number)'
      );
      
      console.log('Fixed getClientLedgerId method signature');
    }
    
    // Save the updated file
    fs.writeFileSync(CLIENT_PORTAL_PATH, content);
    
    console.log('Client Portal Service has been successfully updated!');
    console.log('Consistently using ensureStringClientId() to handle clientId type differences between tables');
    
  } catch (error) {
    console.error('Error fixing client portal service:', error);
  }
}

// Run the fix
fixClientPortalService().catch(console.error);