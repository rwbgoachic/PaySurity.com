/**
 * Fix Client Ledger Creation Method
 * 
 * This script modifies the createClientLedger method in iolta-service.ts to
 * properly handle the jurisdiction field by using raw SQL.
 * 
 * Run with: npx tsx scripts/fix-client-ledger-creation.ts
 */

import fs from 'fs';
import path from 'path';

async function fixClientLedgerCreation() {
  console.log("Starting fix for client ledger creation...");
  
  try {
    // Modify the iolta-service.ts file
    const servicePath = path.join(process.cwd(), 'server/services/legal/iolta-service.ts');
    let content = fs.readFileSync(servicePath, 'utf8');
    
    // Find the createClientLedger method
    const methodStart = content.indexOf('async createClientLedger(data: InsertIoltaClientLedger)');
    if (methodStart === -1) {
      throw new Error('Could not find createClientLedger method');
    }
    
    // Find method body start and end
    const bodyStart = content.indexOf('{', methodStart) + 1;
    let bodyEnd = bodyStart;
    let braceCount = 1;
    
    while (braceCount > 0 && bodyEnd < content.length) {
      bodyEnd++;
      if (content[bodyEnd] === '{') braceCount++;
      if (content[bodyEnd] === '}') braceCount--;
    }
    
    // Replace method body with a version that uses SQL directly
    const newMethodBody = `{
    try {
      console.log("Creating client ledger with data:", JSON.stringify(data, null, 2));
      
      // Create client ledger using SQL to avoid Drizzle ORM schema validation issues
      const result = await db.execute(sql\`
        INSERT INTO iolta_client_ledgers (
          merchant_id, trust_account_id, client_id, client_name,
          matter_name, matter_number, balance, current_balance,
          status, notes, jurisdiction
        ) VALUES (
          \${data.merchantId}, \${data.trustAccountId}, \${data.clientId}, \${data.clientName},
          \${data.matterName || null}, \${data.matterNumber || null}, \${data.balance || '0.00'}, 
          \${data.currentBalance || '0.00'}, \${data.status || 'active'}, \${data.notes || null},
          \${data.jurisdiction || 'Unknown'}
        )
        RETURNING *;
      \`);
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error('Failed to create client ledger');
      }
      
      const ledger = result.rows[0];
      console.log("Created client ledger:", JSON.stringify(ledger, null, 2));
      return ledger;
    } catch (error) {
      console.error("Error creating client ledger:", error);
      throw error;
    }
  }`;
    
    // Replace the method body
    content = content.slice(0, bodyStart) + newMethodBody + content.slice(bodyEnd + 1);
    
    // Write the updated file
    fs.writeFileSync(servicePath, content);
    
    console.log("✅ Successfully updated createClientLedger method in iolta-service.ts");
    
  } catch (error) {
    console.error("Error fixing client ledger creation:", error);
    process.exit(1);
  }
}

// Run the fix
fixClientLedgerCreation()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });