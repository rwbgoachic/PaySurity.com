/**
 * Final Portal Fixes Script
 * 
 * This script addresses the last remaining issues with the client portal:
 * 1. user_id column in legal_portal_sessions 
 * 2. Missing description column in legal_documents
 * 3. Any other missing columns needed for tests
 * 
 * Run with: npx tsx scripts/final-portal-fixes.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function finalPortalFixes() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Running final portal fixes...");

    // 1. Check the structure of legal_portal_sessions table
    console.log("Examining legal_portal_sessions table structure...");
    
    const sessionsColumns = await pool.query(`
      SELECT column_name, is_nullable, column_default, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'legal_portal_sessions'
      ORDER BY ordinal_position
    `);
    
    console.log(`Found ${sessionsColumns.rows.length} columns in legal_portal_sessions table`);
    
    const hasUserIdColumn = sessionsColumns.rows.some(col => col.column_name === 'user_id');
    const hasPortalUserIdColumn = sessionsColumns.rows.some(col => col.column_name === 'portal_user_id');
    
    // If both user_id and portal_user_id exist, we need to align them or remove one
    if (hasUserIdColumn && hasPortalUserIdColumn) {
      console.log("Both user_id and portal_user_id found in legal_portal_sessions table");
      
      // Check if user_id has non-null values
      const userIdValues = await pool.query(`
        SELECT COUNT(*) FROM legal_portal_sessions WHERE user_id IS NOT NULL
      `);
      
      const hasUserIdValues = parseInt(userIdValues.rows[0].count) > 0;
      
      // If user_id has values, copy them to portal_user_id
      if (hasUserIdValues) {
        await pool.query(`
          UPDATE legal_portal_sessions
          SET portal_user_id = user_id
          WHERE user_id IS NOT NULL AND portal_user_id IS NULL
        `);
        console.log("Copied values from user_id to portal_user_id");
      }
      
      // Make user_id nullable so it doesn't block INSERT operations
      try {
        await pool.query(`
          ALTER TABLE legal_portal_sessions
          ALTER COLUMN user_id DROP NOT NULL
        `);
        console.log("Changed user_id to be nullable");
      } catch (error) {
        console.log("Couldn't modify user_id constraint - might already be nullable");
      }
    } else if (hasUserIdColumn && !hasPortalUserIdColumn) {
      console.log("Found user_id but no portal_user_id in legal_portal_sessions table");
      
      // Rename user_id to portal_user_id to match schema
      await pool.query(`
        ALTER TABLE legal_portal_sessions
        RENAME COLUMN user_id TO portal_user_id
      `);
      console.log("Renamed user_id to portal_user_id in legal_portal_sessions table");
    } else if (!hasUserIdColumn && hasPortalUserIdColumn) {
      console.log("Found portal_user_id in legal_portal_sessions table");
      
      // Add a user_id column that's nullable
      await pool.query(`
        ALTER TABLE legal_portal_sessions
        ADD COLUMN user_id INTEGER
      `);
      
      // Copy values from portal_user_id
      await pool.query(`
        UPDATE legal_portal_sessions
        SET user_id = portal_user_id
      `);
      
      console.log("Added user_id column mirroring portal_user_id");
    } else {
      console.log("Neither user_id nor portal_user_id found - adding both");
      
      await pool.query(`
        ALTER TABLE legal_portal_sessions
        ADD COLUMN portal_user_id INTEGER NOT NULL DEFAULT 1,
        ADD COLUMN user_id INTEGER
      `);
      console.log("Added both user_id and portal_user_id columns");
    }

    // 2. Add description to legal_documents if missing
    console.log("Checking for description column in legal_documents...");
    
    const hasDescription = await checkColumnExists('legal_documents', 'description');
    
    if (!hasDescription) {
      await pool.query(`
        ALTER TABLE legal_documents
        ADD COLUMN description TEXT
      `);
      console.log("Added description column to legal_documents table");
    } else {
      console.log("description column already exists in legal_documents table");
    }
    
    // 3. Add any other potentially missing columns in legal_documents
    console.log("Adding other potentially missing columns to legal_documents...");
    
    const columns = [
      { name: 'file_location', type: 'TEXT' },
      { name: 'file_size', type: 'INTEGER' },
      { name: 'file_type', type: 'TEXT' },
      { name: 'author_id', type: 'INTEGER' },
      { name: 'version_number', type: 'TEXT' },
      { name: 'document_type', type: 'TEXT' },
      { name: 'tags', type: 'TEXT[]' },
      { name: 'metadata', type: 'JSONB' }
    ];
    
    for (const column of columns) {
      const hasColumn = await checkColumnExists('legal_documents', column.name);
      
      if (!hasColumn) {
        await pool.query(`
          ALTER TABLE legal_documents
          ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`Added ${column.name} column to legal_documents table`);
      }
    }
    
    // 4. Add status field to legal_matters if missing
    const hasStatus = await checkColumnExists('legal_matters', 'status');
    
    if (!hasStatus) {
      await pool.query(`
        ALTER TABLE legal_matters
        ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
      `);
      console.log("Added status column to legal_matters table");
    }
    
    // 5. Add show_in_client_portal field to legal_matters if missing
    const hasShowInClientPortal = await checkColumnExists('legal_matters', 'show_in_client_portal');
    
    if (!hasShowInClientPortal) {
      await pool.query(`
        ALTER TABLE legal_matters
        ADD COLUMN show_in_client_portal BOOLEAN NOT NULL DEFAULT TRUE
      `);
      console.log("Added show_in_client_portal column to legal_matters table");
    }
    
    console.log("Final portal fixes complete!");
  } catch (error) {
    console.error("Error during final portal fixes:", error);
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

finalPortalFixes().catch(console.error);