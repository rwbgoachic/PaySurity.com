/**
 * Schema Validation Script
 * 
 * This script compares the actual database schema with Drizzle ORM definitions
 * to identify missing columns or mismatches that could cause runtime errors.
 * 
 * Usage: npx tsx scripts/validate-schema-consistency.ts
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import * as schema from '../shared/schema';
import * as legalSchema from '../shared/schema-legal';
import { PgColumn } from 'drizzle-orm/pg-core';

interface ColumnInfo {
  tableName: string;
  columnName: string;
  dataType: string;
  isNullable: boolean;
}

interface SchemaMismatch {
  type: 'missing_column' | 'data_type_mismatch' | 'nullable_mismatch';
  tableName: string;
  columnName: string;
  dbInfo?: ColumnInfo;
  ormInfo?: {
    dataType: string;
    isNullable: boolean;
  };
}

async function validateSchemaConsistency() {
  console.log('Validating database schema consistency with ORM definitions...');

  // Get all tables from combined schema
  const ormTables = extractTablesFromSchema();
  console.log(`Found ${Object.keys(ormTables).length} tables in ORM schema definitions`);

  // Get all tables and columns from database
  const dbColumns = await getDbColumns();
  console.log(`Found ${dbColumns.length} columns in database schema`);

  // Convert DB columns to a map for easier lookup
  const dbColumnMap = dbColumns.reduce((map, col) => {
    const key = `${col.tableName}.${col.columnName}`;
    map[key] = col;
    return map;
  }, {} as Record<string, ColumnInfo>);

  // Check for mismatches
  const mismatches: SchemaMismatch[] = [];

  // Check ORM tables against DB schema
  for (const [tableName, columns] of Object.entries(ormTables)) {
    for (const [columnName, dataInfo] of Object.entries(columns)) {
      const dbColumnKey = `${tableName}.${columnName}`;
      const dbColumn = dbColumnMap[dbColumnKey];

      if (!dbColumn) {
        // Column defined in ORM but missing in DB
        mismatches.push({
          type: 'missing_column',
          tableName,
          columnName,
          ormInfo: {
            dataType: dataInfo.dataType,
            isNullable: dataInfo.isNullable,
          }
        });
      } else {
        // Check data type compatibility
        const isTypeCompatible = isDataTypeCompatible(dataInfo.dataType, dbColumn.dataType);
        if (!isTypeCompatible) {
          mismatches.push({
            type: 'data_type_mismatch',
            tableName,
            columnName,
            dbInfo: dbColumn,
            ormInfo: {
              dataType: dataInfo.dataType,
              isNullable: dataInfo.isNullable,
            }
          });
        }

        // Check nullability
        if (dataInfo.isNullable !== dbColumn.isNullable) {
          mismatches.push({
            type: 'nullable_mismatch',
            tableName,
            columnName,
            dbInfo: dbColumn,
            ormInfo: {
              dataType: dataInfo.dataType,
              isNullable: dataInfo.isNullable,
            }
          });
        }
      }
    }
  }

  // Check DB columns against ORM schema to find columns in DB but not in ORM
  for (const column of dbColumns) {
    const { tableName, columnName } = column;
    
    // Skip system tables
    if (tableName.startsWith('pg_') || tableName === 'information_schema') {
      continue;
    }
    
    // Check if this table exists in ORM schema
    if (!ormTables[tableName]) {
      continue; // Skip tables not defined in ORM
    }
    
    // Check if this column exists in ORM schema for this table
    if (!ormTables[tableName][columnName]) {
      mismatches.push({
        type: 'missing_column',
        tableName,
        columnName,
        dbInfo: column
      });
    }
  }

  // Report results
  if (mismatches.length === 0) {
    console.log('✅ Database schema is consistent with ORM definitions');
  } else {
    console.log(`❌ Found ${mismatches.length} schema inconsistencies:`);
    
    // Group by table name
    const tableGroups = mismatches.reduce((groups, mismatch) => {
      if (!groups[mismatch.tableName]) {
        groups[mismatch.tableName] = [];
      }
      groups[mismatch.tableName].push(mismatch);
      return groups;
    }, {} as Record<string, SchemaMismatch[]>);
    
    // Display grouped mismatches
    for (const [tableName, tableIssues] of Object.entries(tableGroups)) {
      console.log(`\nTable: ${tableName} (${tableIssues.length} issues)`);
      
      for (const issue of tableIssues) {
        switch (issue.type) {
          case 'missing_column':
            if (issue.ormInfo) {
              console.log(`  - Column "${issue.columnName}" exists in ORM but missing in database`);
            } else if (issue.dbInfo) {
              console.log(`  - Column "${issue.columnName}" exists in database but missing in ORM`);
            }
            break;
            
          case 'data_type_mismatch':
            console.log(`  - Column "${issue.columnName}" has type mismatch: DB=${issue.dbInfo?.dataType}, ORM=${issue.ormInfo?.dataType}`);
            break;
            
          case 'nullable_mismatch':
            console.log(`  - Column "${issue.columnName}" has nullability mismatch: DB=${issue.dbInfo?.isNullable ? 'NULL' : 'NOT NULL'}, ORM=${issue.ormInfo?.isNullable ? 'NULL' : 'NOT NULL'}`);
            break;
        }
      }
    }
    
    // Generate SQL to fix critical issues
    console.log('\nSQL statements to fix critical issues:');
    generateFixSql(mismatches);
  }
}

function isDataTypeCompatible(ormType: string, dbType: string): boolean {
  // Simplified type compatibility check
  // This could be expanded with more detailed type compatibility rules
  
  // Normalize types
  const normalizedOrmType = ormType.toLowerCase();
  const normalizedDbType = dbType.toLowerCase();
  
  // Direct matches
  if (normalizedOrmType === normalizedDbType) {
    return true;
  }
  
  // Common compatibility mappings
  const compatibilityMap: Record<string, string[]> = {
    'number': ['integer', 'numeric', 'decimal', 'real', 'double precision', 'bigint', 'smallint'],
    'string': ['text', 'character varying', 'varchar', 'char', 'character'],
    'boolean': ['boolean', 'bool'],
    'date': ['timestamp', 'timestamptz', 'date', 'time', 'timetz'],
    'json': ['json', 'jsonb']
  };
  
  // Check if db type is compatible with orm type
  for (const [baseType, compatibleTypes] of Object.entries(compatibilityMap)) {
    if (normalizedOrmType === baseType && compatibleTypes.some(t => normalizedDbType.includes(t))) {
      return true;
    }
  }
  
  return false;
}

function generateFixSql(mismatches: SchemaMismatch[]): void {
  // Handle missing columns in database
  const missingInDb = mismatches.filter(m => m.type === 'missing_column' && m.ormInfo);
  
  for (const mismatch of missingInDb) {
    const dataType = getPostgresTypeFromOrmType(mismatch.ormInfo!.dataType);
    const nullableStr = mismatch.ormInfo!.isNullable ? '' : ' NOT NULL';
    
    console.log(`ALTER TABLE ${mismatch.tableName} ADD COLUMN ${mismatch.columnName} ${dataType}${nullableStr};`);
  }
  
  // Handle data type mismatches
  const typeMismatches = mismatches.filter(m => m.type === 'data_type_mismatch');
  
  for (const mismatch of typeMismatches) {
    const dataType = getPostgresTypeFromOrmType(mismatch.ormInfo!.dataType);
    console.log(`ALTER TABLE ${mismatch.tableName} ALTER COLUMN ${mismatch.columnName} TYPE ${dataType} USING ${mismatch.columnName}::${dataType};`);
  }
  
  // Handle nullability mismatches
  const nullabilityMismatches = mismatches.filter(m => m.type === 'nullable_mismatch');
  
  for (const mismatch of nullabilityMismatches) {
    if (mismatch.ormInfo!.isNullable) {
      console.log(`ALTER TABLE ${mismatch.tableName} ALTER COLUMN ${mismatch.columnName} DROP NOT NULL;`);
    } else {
      console.log(`ALTER TABLE ${mismatch.tableName} ALTER COLUMN ${mismatch.columnName} SET NOT NULL;`);
    }
  }
}

function getPostgresTypeFromOrmType(ormType: string): string {
  // Map ORM types to PostgreSQL types
  const typeMap: Record<string, string> = {
    'number': 'NUMERIC',
    'string': 'TEXT',
    'boolean': 'BOOLEAN',
    'date': 'TIMESTAMP',
    'json': 'JSONB',
    'serial': 'SERIAL'
  };
  
  return typeMap[ormType.toLowerCase()] || 'TEXT';
}

async function getDbColumns(): Promise<ColumnInfo[]> {
  const result = await db.execute(sql`
    SELECT 
      table_name AS "tableName",
      column_name AS "columnName",
      data_type AS "dataType",
      is_nullable = 'YES' AS "isNullable"
    FROM 
      information_schema.columns
    WHERE 
      table_schema = 'public'
    ORDER BY 
      table_name, ordinal_position
  `);
  
  return result.rows.map(row => ({
    tableName: row.tableName as string,
    columnName: row.columnName as string,
    dataType: row.dataType as string,
    isNullable: row.isNullable as boolean
  }));
}

function extractTablesFromSchema(): Record<string, Record<string, { dataType: string; isNullable: boolean }>> {
  const tables: Record<string, Record<string, { dataType: string; isNullable: boolean }>> = {};
  
  // Extract from combined schema
  const combinedSchema = { ...schema, ...legalSchema };
  
  for (const [key, value] of Object.entries(combinedSchema)) {
    // Skip non-table entries
    if (!value || typeof value !== 'object' || !('$schema' in value)) {
      continue;
    }
    
    const tableDef = value as any;
    
    if (tableDef.name) {
      const tableName = tableDef.name;
      tables[tableName] = {};
      
      // Process columns
      if (tableDef.columns) {
        for (const [colName, colDef] of Object.entries(tableDef.columns)) {
          if (colDef && typeof colDef === 'object' && colDef instanceof PgColumn) {
            const pgCol = colDef as any;
            const dataType = extractDataTypeFromColumn(pgCol);
            const isNullable = !pgCol.notNull;
            
            // Convert to snake_case for DB comparison
            const dbColName = camelToSnakeCase(colName);
            tables[tableName][dbColName] = { dataType, isNullable };
          }
        }
      }
    }
  }
  
  return tables;
}

function extractDataTypeFromColumn(column: any): string {
  // Try to extract data type from column definition
  if (column.dataType) {
    return column.dataType;
  }
  
  // Fallback: infer from column type name
  const colType = column.constructor?.name || '';
  
  if (colType.includes('Serial')) {
    return 'serial';
  } else if (colType.includes('Text')) {
    return 'string';
  } else if (colType.includes('Integer')) {
    return 'number';
  } else if (colType.includes('Boolean')) {
    return 'boolean';
  } else if (colType.includes('Timestamp')) {
    return 'date';
  } else if (colType.includes('Json')) {
    return 'json';
  }
  
  return 'unknown';
}

function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Execute the validation
validateSchemaConsistency()
  .then(() => {
    console.log('Schema validation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during schema validation:', error);
    process.exit(1);
  });