/**
 * Fix Portal Schema
 * 
 * This script adds the password field to the insertLegalPortalUserSchema
 * to address the authentication issues in the client portal.
 * 
 * Run with: npx tsx scripts/fix-portal-schema.ts
 */

import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_PORTAL_PATH = path.join(__dirname, '../shared/schema-portal.ts');

async function fixPortalSchema() {
  console.log('Fixing schema-portal.ts to include password field...');
  
  try {
    // Read the current file
    let content = fs.readFileSync(SCHEMA_PORTAL_PATH, 'utf8');
    
    // Find the insert schema definition
    const insertSchemaRegex = /export const insertLegalPortalUserSchema = createInsertSchema\(legalPortalUsers\)\.omit\({[\s\S]*?\}\);/m;
    const insertSchemaMatch = content.match(insertSchemaRegex);
    
    if (!insertSchemaMatch) {
      console.log('Could not find insertLegalPortalUserSchema definition');
      return;
    }
    
    // Check if we need to add the password extend
    if (!content.includes('insertLegalPortalUserSchema.extend({')) {
      // Add the extend for password field after the omit definition
      const newContent = content.replace(
        insertSchemaMatch[0],
        `${insertSchemaMatch[0]}\n\n// Extend the schema to allow password for user creation
export const insertLegalPortalUserSchema = insertLegalPortalUserSchema.extend({
  password: z.string().optional() // Allow password field for createPortalUser
});`
      );
      
      // Write the updated content
      fs.writeFileSync(SCHEMA_PORTAL_PATH, newContent);
      
      console.log('Successfully added password field to insertLegalPortalUserSchema');
    } else {
      console.log('Password field already exists in schema definition');
    }
    
  } catch (error) {
    console.error('Error fixing portal schema:', error);
  }
}

// Run the fix
fixPortalSchema().catch(console.error);