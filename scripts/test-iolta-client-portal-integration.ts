/**
 * Test IOLTA and Client Portal Integration
 * 
 * This script tests the integration between the IOLTA service and client portal service
 * to ensure they work together correctly, particularly focusing on the client ID handling
 * and proper service usage.
 * 
 * Run with: npx tsx scripts/test-iolta-client-portal-integration.ts
 */

import { db } from '../server/db';
import { clientPortalService } from '../server/services/legal/client-portal-service';
import { ioltaService } from '../server/services/legal/iolta-service';
import { toIoltaClientId, toPortalClientId } from '../server/services/legal/client-id-helper';
import { 
  legalClients, 
  ioltaTrustAccounts, 
  ioltaClientLedgers,
  ioltaTransactions 
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';

async function testIntegration() {
  console.log('Starting IOLTA and Client Portal integration test');
  
  try {
    // 1. Find an existing merchant with clients in the system
    console.log('\n1. Finding test merchant and client...');
    const [merchant] = await db.select()
      .from(legalClients)
      .limit(1);
    
    if (!merchant) {
      throw new Error('No test merchant found in the database');
    }
    
    console.log(`Found merchant ID: ${merchant.merchantId}`);
    const merchantId = merchant.merchantId;
    
    // 2. Find an existing client
    const [client] = await db.select()
      .from(legalClients)
      .where(
        eq(legalClients.merchantId, merchantId)
      )
      .limit(1);
    
    if (!client) {
      throw new Error('No test client found for the merchant');
    }
    
    const clientId = client.id;
    console.log(`Found client ID: ${clientId} (${client.firstName} ${client.lastName})`);
    
    // 3. Get trust accounts via ClientPortalService
    console.log('\n2. Getting trust accounts via ClientPortalService...');
    const trustAccounts = await clientPortalService.getClientTrustAccounts(clientId, merchantId);
    console.log(`Found ${trustAccounts.length} trust accounts`);
    
    if (trustAccounts.length === 0) {
      // Check if there are any trust accounts for this merchant
      const allTrustAccounts = await db.select()
        .from(ioltaTrustAccounts)
        .where(
          eq(ioltaTrustAccounts.merchantId, merchantId)
        );
      
      if (allTrustAccounts.length === 0) {
        console.log('No trust accounts found for this merchant. Creating a test trust account...');
        
        // Create a test trust account
        const [newTrustAccount] = await ioltaService.createTrustAccount({
          merchantId,
          accountName: 'Test IOLTA Account',
          accountNumber: `TEST-${Date.now()}`,
          bankName: 'Test Bank',
          accountStatus: 'active',
          accountType: 'iolta'
        });
        
        console.log(`Created test trust account: ${newTrustAccount.id}`);
        
        // Create a test client ledger
        const ioltaClientId = toIoltaClientId(clientId);
        const [newClientLedger] = await ioltaService.createClientLedger({
          merchantId,
          trustAccountId: newTrustAccount.id,
          clientId: ioltaClientId,
          clientName: `${client.firstName} ${client.lastName}`,
          matterName: 'Test Matter',
          matterNumber: `TEST-${Date.now()}`,
          balance: '0.00',
          status: 'active'
        });
        
        console.log(`Created test client ledger: ${newClientLedger.id}`);
        
        // Add a test transaction
        const newTransaction = await ioltaService.recordTransaction({
          merchantId,
          trustAccountId: newTrustAccount.id,
          clientLedgerId: newClientLedger.id,
          amount: '1000.00',
          balanceAfter: '1000.00',
          description: 'Initial deposit',
          transactionType: 'deposit',
          status: 'completed',
          createdBy: 1 // Admin user
        });
        
        console.log(`Created test transaction: ${newTransaction.id}`);
        
        // Retry getting trust accounts
        const updatedTrustAccounts = await clientPortalService.getClientTrustAccounts(clientId, merchantId);
        console.log(`After creating test data: Found ${updatedTrustAccounts.length} trust accounts`);
        
        if (updatedTrustAccounts.length > 0) {
          console.log('Successfully created test trust account and confirmed it appears in client portal service');
        }
      } else {
        console.log(`Merchant has ${allTrustAccounts.length} trust accounts but none with ledgers for this client`);
        
        // Create a test client ledger in the first trust account
        const trustAccountId = allTrustAccounts[0].id;
        const ioltaClientId = toIoltaClientId(clientId);
        
        const [newClientLedger] = await ioltaService.createClientLedger({
          merchantId,
          trustAccountId,
          clientId: ioltaClientId,
          clientName: `${client.firstName} ${client.lastName}`,
          matterName: 'Test Matter',
          matterNumber: `TEST-${Date.now()}`,
          balance: '0.00',
          status: 'active'
        });
        
        console.log(`Created test client ledger: ${newClientLedger.id}`);
        
        // Add a test transaction
        const newTransaction = await ioltaService.recordTransaction({
          merchantId,
          trustAccountId,
          clientLedgerId: newClientLedger.id,
          amount: '1000.00',
          balanceAfter: '1000.00',
          description: 'Initial deposit',
          transactionType: 'deposit',
          status: 'completed'
        });
        
        console.log(`Created test transaction: ${newTransaction.id}`);
        
        // Retry getting trust accounts
        const updatedTrustAccounts = await clientPortalService.getClientTrustAccounts(clientId, merchantId);
        console.log(`After creating test data: Found ${updatedTrustAccounts.length} trust accounts`);
      }
    } else {
      console.log('First trust account:', trustAccounts[0]);
      
      // 4. Get client ledgers for the first trust account
      const trustAccountId = trustAccounts[0].id;
      console.log(`\n3. Getting client ledgers for trust account ${trustAccountId}...`);
      
      const clientLedgers = await clientPortalService.getClientTrustLedgers(clientId, merchantId, trustAccountId);
      console.log(`Found ${clientLedgers.length} client ledgers`);
      
      if (clientLedgers.length > 0) {
        console.log('First client ledger:', clientLedgers[0]);
        
        // 5. Get transactions for the first client ledger
        const ledgerId = clientLedgers[0].id;
        console.log(`\n4. Getting transactions for client ledger ${ledgerId}...`);
        
        const transactions = await clientPortalService.getLedgerTransactions(clientId, merchantId, ledgerId);
        console.log(`Found ${transactions.length} transactions`);
        
        if (transactions.length > 0) {
          console.log('First transaction:', transactions[0]);
        } else {
          console.log('No transactions found for this ledger. Creating a test transaction...');
          
          // Add a test transaction
          const newTransaction = await ioltaService.recordTransaction({
            merchantId,
            trustAccountId,
            clientLedgerId: ledgerId,
            amount: '500.00',
            balanceAfter: '500.00',
            description: 'Test deposit',
            transactionType: 'deposit',
            status: 'completed'
          });
          
          console.log(`Created test transaction: ${newTransaction.id}`);
          
          // Retry getting transactions
          const updatedTransactions = await clientPortalService.getLedgerTransactions(clientId, merchantId, ledgerId);
          console.log(`After creating test transaction: Found ${updatedTransactions.length} transactions`);
          
          if (updatedTransactions.length > 0) {
            console.log('Successfully created test transaction and confirmed it appears in client portal service');
          }
        }
        
        // 6. Get client trust statement
        console.log('\n5. Getting client trust statement...');
        const statement = await clientPortalService.getClientTrustStatement(clientId, merchantId);
        console.log(`Generated statement with ${statement.accounts.length} accounts`);
        
        // Verify we have account and ledger data in the statement
        if (statement.accounts.length > 0 && 
            statement.accounts[0].ledgers && 
            statement.accounts[0].ledgers.length > 0) {
          console.log('✅ Client trust statement successfully generated');
          
          // Log the first account's first ledger summary
          const firstLedger = statement.accounts[0].ledgers[0];
          console.log(`Ledger summary: Opening balance: ${firstLedger.openingBalance}, Closing balance: ${firstLedger.closingBalance}, Transactions: ${firstLedger.transactions.length}`);
        } else {
          console.log('❌ Client trust statement missing account or ledger data');
        }
      } else {
        console.log('No client ledgers found for this trust account. Creating a test ledger...');
        
        // Create a test client ledger
        const ioltaClientId = toIoltaClientId(clientId);
        const [newClientLedger] = await ioltaService.createClientLedger({
          merchantId,
          trustAccountId,
          clientId: ioltaClientId,
          clientName: `${client.firstName} ${client.lastName}`,
          matterName: 'Test Matter',
          matterNumber: `TEST-${Date.now()}`,
          balance: '0.00',
          status: 'active'
        });
        
        console.log(`Created test client ledger: ${newClientLedger.id}`);
        
        // Retry getting client ledgers
        const updatedClientLedgers = await clientPortalService.getClientTrustLedgers(clientId, merchantId, trustAccountId);
        console.log(`After creating test ledger: Found ${updatedClientLedgers.length} client ledgers`);
      }
    }
    
    // 7. Test client ID conversion functions
    console.log('\n6. Testing client ID conversion functions...');
    const portalClientId = clientId;
    const ioltaClientId = toIoltaClientId(portalClientId);
    const convertedBackPortalClientId = toPortalClientId(ioltaClientId);
    
    console.log(`Portal client ID: ${portalClientId} (${typeof portalClientId})`);
    console.log(`Converted to IOLTA client ID: ${ioltaClientId} (${typeof ioltaClientId})`);
    console.log(`Converted back to Portal client ID: ${convertedBackPortalClientId} (${typeof convertedBackPortalClientId})`);
    
    if (portalClientId === convertedBackPortalClientId) {
      console.log('✅ Client ID conversion functions working correctly');
    } else {
      console.log('❌ Client ID conversion functions not working correctly!');
    }
    
    console.log('\n✅ IOLTA and Client Portal integration test completed successfully');
    
  } catch (error) {
    console.error('Error testing IOLTA and Client Portal integration:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testIntegration();