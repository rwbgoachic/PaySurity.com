/**
 * Schema Consistency Validator
 * 
 * This script validates that the database schema defined in shared/schema.ts is consistent
 * with the actual database structure, and that test files are correctly aligned with
 * the schema definitions.
 * 
 * Usage: npx tsx scripts/validate-schema-consistency.ts
 */

import { db } from '../server/db';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';

interface SchemaIssue {
  type: string;
  tableName: string;
  columnName?: string;
  dbType?: string;
  schemaType?: string;
  dbNullable?: boolean;
  schemaNullable?: boolean;
  message: string;
}

interface CodeIssue {
  file: string;
  issue: string;
  suggestion: string;
}

async function validateSchemaConsistency() {
  console.log(chalk.blue('\n======= Schema Consistency Validator =======\n'));
  
  const schemaIssues: SchemaIssue[] = [];
  const codeIssues: CodeIssue[] = [];
  
  // Get all tables defined in the schema
  const schemaTables = Object.entries(schema)
    .filter(([_, value]) => typeof value === 'object' && value !== null && 'name' in value)
    .map(([_, value]) => (value as any).name as string);
  
  // Get all tables from the database
  const dbTablesResult = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
  `);
  
  const dbTables = dbTablesResult.rows.map(row => (row as any).table_name as string);
  
  // Check for tables in schema but not in DB
  for (const tableName of schemaTables) {
    if (!dbTables.includes(tableName)) {
      schemaIssues.push({
        type: 'missing_table_in_db',
        tableName,
        message: `Table ${tableName} is defined in schema but does not exist in the database.`
      });
    }
  }
  
  // Check for tables in DB but not in schema
  for (const tableName of dbTables) {
    if (!schemaTables.includes(tableName)) {
      schemaIssues.push({
        type: 'missing_table_in_schema',
        tableName,
        message: `Table ${tableName} exists in the database but is not defined in schema.`
      });
    }
  }
  
  // For each table that exists in both, check column consistency
  for (const tableName of schemaTables) {
    if (!dbTables.includes(tableName)) continue; // Skip if table doesn't exist in DB
    
    // Get column information from DB
    const dbColumnsResult = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
    `);
    
    const dbColumns = dbColumnsResult.rows.map(row => ({
      name: (row as any).column_name as string,
      type: (row as any).data_type as string,
      nullable: (row as any).is_nullable === 'YES'
    }));
    
    // Find the schema table definition
    const schemaTable = Object.entries(schema)
      .find(([_, value]) => typeof value === 'object' && value !== null && 'name' in value && (value as any).name === tableName);
    
    if (!schemaTable) continue; // Shouldn't happen but just in case
    
    const schemaColumns = Object.entries((schemaTable[1] as any).columns || {})
      .map(([colName, colDef]) => ({
        name: colName,
        // These can only be rough approximations since drizzle uses its own type system
        type: (colDef as any).dataType || 'unknown',
        nullable: !(colDef as any).notNull
      }));
    
    // Check for columns in DB but not in schema
    for (const dbCol of dbColumns) {
      const schemaCol = schemaColumns.find(col => col.name === dbCol.name);
      if (!schemaCol) {
        schemaIssues.push({
          type: 'missing_column_in_schema',
          tableName,
          columnName: dbCol.name,
          message: `Column ${dbCol.name} exists in table ${tableName} but is missing in schema.`
        });
      }
    }
    
    // Check for columns in schema but not in DB
    for (const schemaCol of schemaColumns) {
      const dbCol = dbColumns.find(col => col.name === schemaCol.name);
      if (!dbCol) {
        schemaIssues.push({
          type: 'missing_column_in_db',
          tableName,
          columnName: schemaCol.name,
          message: `Column ${schemaCol.name} is defined in schema for table ${tableName} but does not exist in the database.`
        });
        continue;
      }
      
      // Type compatibility check - simplified, could be improved
      const dbType = dbCol.type.toLowerCase();
      const schemaType = schemaCol.type.toLowerCase();
      
      // Basic type compatibility check
      let typeCompatible = false;
      if (
        (dbType.includes('int') && (schemaType === 'number' || schemaType === 'integer')) ||
        (dbType === 'text' && schemaType === 'string') ||
        (dbType.includes('char') && schemaType === 'string') ||
        (dbType.includes('bool') && schemaType === 'boolean') ||
        (dbType.includes('timestamp') && schemaType === 'date') ||
        (dbType.includes('date') && schemaType === 'date') ||
        (dbType.includes('decimal') && schemaType === 'string') || // Decimal is often handled as string in JS
        (dbType.includes('numeric') && schemaType === 'string')
      ) {
        typeCompatible = true;
      }
      
      if (!typeCompatible) {
        schemaIssues.push({
          type: 'type_mismatch',
          tableName,
          columnName: schemaCol.name,
          dbType,
          schemaType,
          message: `Type mismatch for column ${schemaCol.name} in table ${tableName}: DB type is ${dbType}, schema type is ${schemaType}.`
        });
      }
      
      // Nullability check
      if (dbCol.nullable !== schemaCol.nullable) {
        schemaIssues.push({
          type: 'nullability_mismatch',
          tableName,
          columnName: schemaCol.name,
          dbNullable: dbCol.nullable,
          schemaNullable: schemaCol.nullable,
          message: `Nullability mismatch for column ${schemaCol.name} in table ${tableName}: DB nullable is ${dbCol.nullable}, schema nullable is ${schemaCol.nullable}.`
        });
      }
    }
  }
  
  // Check test files for schema consistency
  const testDir = path.join(process.cwd(), 'server', 'services', 'testing');
  if (fs.existsSync(testDir)) {
    const testFiles = fs.readdirSync(testDir)
      .filter(file => (file.startsWith('test-') && (file.endsWith('.ts') || file.endsWith('.js'))));
    
    for (const testFile of testFiles) {
      const filePath = path.join(testDir, testFile);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Look for clientId comparisons that might be problematic
      if (content.includes('clientId ===') || content.includes('clientId !==')) {
        // Check if ioltaClientLedgers is imported
        if (content.includes('ioltaClientLedgers')) {
          codeIssues.push({
            file: filePath,
            issue: 'Potential clientId type mismatch in comparison',
            suggestion: 'Make sure clientId comparisons use .toString() for ioltaClientLedgers'
          });
        }
      }
      
      // Look for other common schema mismatches
      if (content.includes('accountStatus')) {
        codeIssues.push({
          file: filePath,
          issue: 'Using deprecated "accountStatus" field',
          suggestion: 'Use "status" field instead of "accountStatus"'
        });
      }
      
      // Look for issues with reconciliation fields
      if (content.includes('ioltaAccountId')) {
        codeIssues.push({
          file: filePath,
          issue: 'Using non-existent "ioltaAccountId" field',
          suggestion: 'Use "trustAccountId" instead of "ioltaAccountId"'
        });
      }
    }
  }
  
  // Display issues
  if (schemaIssues.length === 0 && codeIssues.length === 0) {
    console.log(chalk.green('No schema consistency issues found!'));
  } else {
    if (schemaIssues.length > 0) {
      console.log(chalk.red(`Found ${schemaIssues.length} schema consistency issues:`));
      schemaIssues.forEach((issue, index) => {
        console.log(chalk.yellow(`\n${index + 1}. ${issue.type.toUpperCase()} in ${issue.tableName}${issue.columnName ? '.' + issue.columnName : ''}`));
        console.log(chalk.white(issue.message));
      });
    }
    
    if (codeIssues.length > 0) {
      console.log(chalk.red(`\nFound ${codeIssues.length} code consistency issues:`));
      codeIssues.forEach((issue, index) => {
        console.log(chalk.yellow(`\n${index + 1}. Issue in ${path.basename(issue.file)}`));
        console.log(chalk.white(`Issue: ${issue.issue}`));
        console.log(chalk.green(`Suggestion: ${issue.suggestion}`));
      });
    }
  }
  
  return {
    schemaIssues,
    codeIssues,
    totalIssues: schemaIssues.length + codeIssues.length
  };
}

async function main() {
  try {
    const result = await validateSchemaConsistency();
    
    if (result.totalIssues > 0) {
      console.log(chalk.yellow('\nActions to consider:'));
      console.log(chalk.cyan('1. Update shared/schema.ts to match the database structure'));
      console.log(chalk.cyan('2. Run database migrations to update the database structure'));
      console.log(chalk.cyan('3. Fix test files to match the correct schema types'));
      
      process.exit(1); // Exit with error code
    } else {
      console.log(chalk.green('\nSchema validation completed successfully!'));
    }
  } catch (error) {
    console.error(chalk.red('Error during schema validation:'));
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { validateSchemaConsistency };