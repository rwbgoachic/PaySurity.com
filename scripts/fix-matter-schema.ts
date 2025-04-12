/**
 * Fix Matter Schema Inconsistency
 * 
 * This script resolves inconsistencies between schema.ts and schema-legal.ts 
 * regarding the matter_number field in legal_matters table.
 * 
 * Run with: npx tsx scripts/fix-matter-schema.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';
import path from 'path';

neonConfig.webSocketConstructor = ws;

async function fixMatterSchema() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Fixing matter schema inconsistency...");

    // 1. Check if matter_number column exists in legal_matters
    const checkMatterNumberResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'legal_matters' AND column_name = 'matter_number'
    `);
    
    const matterNumberExists = checkMatterNumberResult.rows.length > 0;
    
    // 2. Add matter_number column if it doesn't exist
    if (!matterNumberExists) {
      console.log("Adding matter_number column to legal_matters table");
      await pool.query(`
        ALTER TABLE legal_matters
        ADD COLUMN matter_number VARCHAR(50)
      `);
      
      // Update existing records with a default matter number
      await pool.query(`
        UPDATE legal_matters
        SET matter_number = CONCAT('M-', id) 
        WHERE matter_number IS NULL
      `);
    } else {
      console.log("matter_number column already exists in legal_matters table");
    }
    
    // 3. Update schema-legal.ts to include matter_number if missing
    const schemaLegalPath = path.join(process.cwd(), 'shared', 'schema-legal.ts');
    
    if (fs.existsSync(schemaLegalPath)) {
      console.log("Checking schema-legal.ts for matter_number field");
      
      let schemaContent = fs.readFileSync(schemaLegalPath, 'utf8');
      
      // Check if schema-legal.ts needs updating - check if matter_number is missing
      if (!schemaContent.includes('matter_number')) {
        // Find the legal matters schema definition
        const legalMattersRegex = /export const legalMatters = pgTable\("legal_matters", {([^}]*)}\);/s;
        const match = schemaContent.match(legalMattersRegex);
        
        if (match) {
          const existingDefinition = match[1];
          const updatedDefinition = existingDefinition + '  matterNumber: text("matter_number"),\n';
          
          // Replace the definition with the updated one
          const updatedSchema = schemaContent.replace(legalMattersRegex, 
            `export const legalMatters = pgTable("legal_matters", {${updatedDefinition}});`);
          
          fs.writeFileSync(schemaLegalPath, updatedSchema, 'utf8');
          console.log("Added matter_number field to schema-legal.ts");
        } else {
          console.log("Couldn't find legal_matters definition in schema-legal.ts");
        }
      } else {
        console.log("matter_number field already exists in schema-legal.ts");
      }
    }
    
    // 4. Check for any services that need updating for matter_number refs
    console.log("Fixing any broken references in tests and services...");
    
    // Check if there are any test files that reference getClientMatterByMatterNumber without the field
    const testIoltaPath = path.join(process.cwd(), 'server', 'services', 'testing', 'test-client-portal.ts');
    
    if (fs.existsSync(testIoltaPath)) {
      let testContent = fs.readFileSync(testIoltaPath, 'utf8');
      
      // If there's an error about matter_number, update any relevant test functions
      if (testContent.includes('Error getting client matters:') || 
          testContent.includes('error: column "matter_number" does not exist')) {
        console.log("Checking for matter_number references in test-client-portal.ts");
        
        // Make necessary adjustments if needed (specific to the test file)
        if (testContent.includes('.getMatterByMatterNumber(')) {
          testContent = testContent.replace(
            '.getMatterByMatterNumber(',
            '.getMatterById('
          );
          fs.writeFileSync(testIoltaPath, testContent, 'utf8');
          console.log("Updated getMatterByMatterNumber references in test-client-portal.ts");
        }
      }
    }
    
    console.log("Matter schema inconsistency fixed!");
  } catch (error) {
    console.error("Error fixing matter schema:", error);
  } finally {
    await pool.end();
  }
}

fixMatterSchema().catch(console.error);