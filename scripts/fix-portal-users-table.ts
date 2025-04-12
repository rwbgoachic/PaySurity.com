/**
 * Fix Portal Users Table Schema
 * 
 * This script adds the missing columns to the legal_portal_users table
 * to match the schema definition in schema-portal.ts
 * 
 * Run with: npx tsx scripts/fix-portal-users-table.ts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function fixPortalUsersTables() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Fixing portal users and sessions tables...");

    // Check portal_user_id in sessions table
    console.log("Checking legal_portal_sessions table for column naming issues...");
    
    const checkPortalUserIdResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'legal_portal_sessions' AND column_name = 'portal_user_id'
    `);
    
    if (checkPortalUserIdResult.rows.length === 0) {
      // Check if portalUserId exists instead
      const checkPortalUserIdCamelResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'legal_portal_sessions' AND column_name = 'portalUserId'
      `);
      
      if (checkPortalUserIdCamelResult.rows.length === 1) {
        console.log("Need to rename portalUserId column to portal_user_id");
        
        await pool.query(`
          ALTER TABLE legal_portal_sessions
          RENAME COLUMN "portalUserId" TO portal_user_id
        `);
        
        console.log("Renamed portalUserId to portal_user_id in legal_portal_sessions table");
      } else {
        // Column doesn't exist at all, add it
        await pool.query(`
          ALTER TABLE legal_portal_sessions
          ADD COLUMN portal_user_id INTEGER NOT NULL
        `);
        console.log("Added portal_user_id column to legal_portal_sessions table");
      }
    } else {
      console.log("portal_user_id column already exists in legal_portal_sessions table");
    }
    
    // Fix document_status in legal_documents table
    console.log("Checking legal_documents table for document_status column...");
    
    const checkDocStatusResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'legal_documents' AND column_name = 'document_status'
    `);
    
    if (checkDocStatusResult.rows.length === 0) {
      // Check if status exists instead
      const checkStatusResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'legal_documents' AND column_name = 'status'
      `);
      
      if (checkStatusResult.rows.length === 0) {
        // Neither column exists, add status
        await pool.query(`
          ALTER TABLE legal_documents
          ADD COLUMN status VARCHAR(50) DEFAULT 'draft' NOT NULL
        `);
        console.log("Added status column to legal_documents table");
      } else {
        console.log("status column already exists in legal_documents table");
      }
    } else {
      // Need to rename document_status to status
      await pool.query(`
        ALTER TABLE legal_documents
        RENAME COLUMN document_status TO status
      `);
      console.log("Renamed document_status to status in legal_documents table");
    }
    
    // Fix matter_number in legal_matters table
    console.log("Checking legal_matters table for matter_number column...");
    
    const checkMatterNumberResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'legal_matters' AND column_name = 'matter_number'
    `);
    
    if (checkMatterNumberResult.rows.length === 0) {
      // Add matter_number column
      await pool.query(`
        ALTER TABLE legal_matters
        ADD COLUMN matter_number VARCHAR(50)
      `);
      console.log("Added matter_number column to legal_matters table");
      
      // Update existing records with a default matter number
      await pool.query(`
        UPDATE legal_matters
        SET matter_number = CONCAT('M-', id) 
        WHERE matter_number IS NULL
      `);
      console.log("Updated existing matters with default matter numbers");
    } else {
      console.log("matter_number column already exists in legal_matters table");
    }
    
    console.log("Done fixing portal tables!");
  } catch (error) {
    console.error("Error fixing portal tables:", error);
  } finally {
    await pool.end();
  }
}

fixPortalUsersTables().catch(console.error);