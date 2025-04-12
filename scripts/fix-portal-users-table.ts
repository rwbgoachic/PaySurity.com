/**
 * Fix Portal Users Table Schema
 * 
 * This script adds the missing merchant_id column to the legal_portal_users table
 * and other related portal tables if needed.
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { Pool } from '@neondatabase/serverless';
import chalk from 'chalk';

async function fixPortalUsersTables() {
  console.log(chalk.blue.bold('Fixing Portal User Tables Schema...'));
  
  try {
    // Check if merchant_id column exists in legal_portal_users
    const columnExists = await checkColumnExists('legal_portal_users', 'merchant_id');
    
    if (!columnExists) {
      console.log(chalk.yellow('Adding missing merchant_id column to legal_portal_users table...'));
      
      // Add the merchant_id column to legal_portal_users
      await db.execute(sql`
        ALTER TABLE legal_portal_users 
        ADD COLUMN merchant_id INTEGER NOT NULL DEFAULT 1
      `);
      
      console.log(chalk.green('✓ Added merchant_id column to legal_portal_users table'));
    } else {
      console.log(chalk.green('✓ merchant_id column already exists in legal_portal_users table'));
    }
    
    // Update legal_portal_users schema to match actual database structure
    const portalUserColumns = await getTableColumns('legal_portal_users');
    console.log('Portal user table columns:', portalUserColumns);
    
    // Check for other portal tables that might need merchant_id column
    await checkAndFixTable('legal_portal_sessions', 'merchant_id');
    await checkAndFixTable('legal_portal_activities', 'merchant_id');
    await checkAndFixTable('legal_portal_shared_documents', 'merchant_id');
    await checkAndFixTable('legal_portal_messages', 'merchant_id');
    
    console.log(chalk.green.bold('✅ Portal users table schema fixes completed'));
  } catch (error) {
    console.error(chalk.red('Error fixing portal users tables:'), error);
    throw error;
  }
}

async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = ${tableName}
      AND column_name = ${columnName}
    `);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    throw error;
  }
}

async function getTableColumns(tableName: string): Promise<string[]> {
  try {
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position
    `);
    
    return result.rows.map(row => row.column_name);
  } catch (error) {
    console.error(`Error getting columns for table ${tableName}:`, error);
    throw error;
  }
}

async function checkAndFixTable(tableName: string, columnName: string): Promise<void> {
  try {
    const columnExists = await checkColumnExists(tableName, columnName);
    
    if (!columnExists) {
      console.log(chalk.yellow(`Adding missing ${columnName} column to ${tableName} table...`));
      
      await db.execute(sql`
        ALTER TABLE ${sql.identifier(tableName)}
        ADD COLUMN ${sql.identifier(columnName)} INTEGER NOT NULL DEFAULT 1
      `);
      
      console.log(chalk.green(`✓ Added ${columnName} column to ${tableName} table`));
    } else {
      console.log(chalk.green(`✓ ${columnName} column already exists in ${tableName} table`));
    }
  } catch (error) {
    console.error(`Error checking/fixing ${columnName} in ${tableName}:`, error);
    throw error;
  }
}

// Run the function
fixPortalUsersTables().catch(console.error);