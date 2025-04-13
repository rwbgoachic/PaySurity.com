/**
 * Simple debug script to test client ledger retrieval with IOLTA services
 * This will help diagnose issues with client ID type handling
 */

import { ioltaService } from '../server/services/legal/iolta-service';
import { ClientPortalService } from '../server/services/legal/client-portal-service';
import { db } from '../server/db';
import { ioltaTrustAccounts, ioltaClientLedgers } from '@shared/schema';
import { and, eq } from 'drizzle-orm';
import { toIoltaClientId, toPortalClientId } from '../server/services/legal/client-id-helper';

const clientPortalService = new ClientPortalService();

async function debugClientLedgerAccess() {
  console.log('Starting IOLTA client ledger debug test...');
  
  const testMerchantId = 1;
  const testClientId = 1;
  
  try {
    // First, check if we have any trust accounts in the system
    console.log(`Looking for trust accounts for merchant ${testMerchantId}...`);
    
    const accounts = await ioltaService.getTrustAccountsByMerchant(testMerchantId);
    console.log(`Found ${accounts.length} trust accounts`);
    
    if (accounts.length === 0) {
      // Create a test account
      console.log('Creating a test trust account...');
      const account = await ioltaService.createTrustAccount({
        merchantId: testMerchantId,
        accountNumber: `TEST-DBG-${Date.now()}`,
        accountName: 'Debug Test IOLTA Account',
        bankName: 'First National Debug Bank',
        routingNumber: '123456789',
        accountType: 'iolta' as const,
        status: 'active',
        balance: '10000.00'
      });
      
      console.log(`Created test account with ID ${account.id}`);
      
      // Add a client ledger
      console.log(`Creating client ledger for client ${testClientId}...`);
      await ioltaService.createClientLedger({
        merchantId: testMerchantId,
        clientId: toIoltaClientId(testClientId), // Use our new helper function
        trustAccountId: account.id,
        clientName: 'Test Debug Client',
        matterName: 'Test Debug Matter',
        matterNumber: 'TDM-001',
        balance: '1000.00',
        status: 'active'
      });
      
      console.log('Client ledger created successfully');
      
      // Directly verify the ledger exists with raw SQL
      const ledgers = await db.select()
        .from(ioltaClientLedgers)
        .where(and(
          eq(ioltaClientLedgers.trustAccountId, account.id),
          eq(ioltaClientLedgers.merchantId, testMerchantId)
        ));
      
      console.log(`Direct DB query found ${ledgers.length} ledgers`);
      console.log('First ledger:', ledgers[0]);
      
      // Now use the ClientPortalService to access the same data
      console.log('\nTesting ClientPortalService access:');
      
      // Get trust accounts via portal service
      const portalAccounts = await clientPortalService.getClientTrustAccounts(
        testClientId,
        testMerchantId
      );
      
      console.log(`ClientPortalService found ${portalAccounts.length} trust accounts`);
      
      if (portalAccounts.length > 0) {
        const firstAccountId = portalAccounts[0].id;
        
        // Get client ledgers via portal service
        const portalLedgers = await clientPortalService.getClientTrustLedgers(
          testClientId,
          testMerchantId,
          firstAccountId
        );
        
        console.log(`ClientPortalService found ${portalLedgers.length} ledgers for account ${firstAccountId}`);
        
        if (portalLedgers.length > 0) {
          const firstLedgerId = portalLedgers[0].id;
          
          // Try to get transactions
          const transactions = await clientPortalService.getLedgerTransactions(
            testClientId,
            testMerchantId,
            firstLedgerId
          );
          
          console.log(`Found ${transactions.length} transactions for ledger ${firstLedgerId}`);
        }
      }
      
      console.log('\nDebug test completed successfully');
    } else {
      // Use existing accounts
      const firstAccountId = accounts[0].id;
      console.log(`Using existing account ${firstAccountId}`);
      
      // Check for existing ledgers
      const ledgers = await db.select()
        .from(ioltaClientLedgers)
        .where(and(
          eq(ioltaClientLedgers.trustAccountId, firstAccountId),
          eq(ioltaClientLedgers.merchantId, testMerchantId)
        ));
      
      console.log(`Found ${ledgers.length} ledgers for account ${firstAccountId}`);
      
      if (ledgers.length > 0) {
        console.log('First ledger client ID:', ledgers[0].clientId);
        console.log('First ledger client ID type:', typeof ledgers[0].clientId);
      } else {
        // Create a client ledger
        console.log(`Creating client ledger for client ${testClientId}...`);
        await ioltaService.createClientLedger({
          merchantId: testMerchantId,
          clientId: toIoltaClientId(testClientId),
          trustAccountId: firstAccountId,
          clientName: 'Test Debug Client',
          matterName: 'Test Debug Matter',
          matterNumber: 'TDM-001',
          balance: '1000.00',
          status: 'active'
        });
        
        console.log('Client ledger created successfully');
      }
      
      // Now use the ClientPortalService to access the same data
      console.log('\nTesting ClientPortalService access:');
      
      // Get trust accounts via portal service
      const portalAccounts = await clientPortalService.getClientTrustAccounts(
        testClientId,
        testMerchantId
      );
      
      console.log(`ClientPortalService found ${portalAccounts.length} trust accounts`);
      
      if (portalAccounts.length > 0) {
        const firstAccountId = portalAccounts[0].id;
        
        // Get client ledgers via portal service
        const portalLedgers = await clientPortalService.getClientTrustLedgers(
          testClientId,
          testMerchantId,
          firstAccountId
        );
        
        console.log(`ClientPortalService found ${portalLedgers.length} ledgers for account ${firstAccountId}`);
        
        if (portalLedgers.length > 0) {
          const firstLedgerId = portalLedgers[0].id;
          
          // Try to get transactions
          const transactions = await clientPortalService.getLedgerTransactions(
            testClientId,
            testMerchantId,
            firstLedgerId
          );
          
          console.log(`Found ${transactions.length} transactions for ledger ${firstLedgerId}`);
        }
      }
      
      console.log('\nDebug test completed successfully');
    }
  } catch (error) {
    console.error('Error during debug test:', error);
  }
}

// Run the debug test
debugClientLedgerAccess();