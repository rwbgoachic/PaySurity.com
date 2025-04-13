/**
 * SQL Service
 * 
 * This service provides direct access to SQL for cases where the Drizzle ORM 
 * doesn't provide the needed functionality or when working with legacy SQL code.
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

class SQLService {
  /**
   * Execute a raw SQL query and return the results in a format compatible with @neondatabase/serverless format
   * 
   * @param sqlQuery The SQL query to execute
   * @returns The query results with rows property
   */
  async query(sqlQuery: string): Promise<{ rows: any[] }> {
    try {
      const result = await db.execute(sql.raw(sqlQuery));
      // Return in a format compatible with client expectations
      return { 
        rows: Array.isArray(result) ? result : (result.rows || []) 
      };
    } catch (error) {
      console.error('Error executing SQL query:', error);
      throw error;
    }
  }
  
  /**
   * Execute a raw SQL query and return the results
   * 
   * @param sqlQuery The SQL query to execute
   * @returns The query results as an array
   */
  async rawSQL(sqlQuery: string): Promise<any[]> {
    try {
      const result = await db.execute(sql.raw(sqlQuery));
      // Convert the result to an array if it's not already
      return Array.isArray(result) ? result : (result.rows || []);
    } catch (error) {
      console.error('Error executing raw SQL:', error);
      throw error;
    }
  }

  /**
   * Execute a parameterized SQL query with values and return the results
   * This is safer than rawSQL for user input as it prevents SQL injection
   * 
   * @param sqlQuery The SQL query with $1, $2, etc placeholders
   * @param values The values for the placeholders (optional)
   * @returns The query results as an array
   */
  async parameterizedSQL(sqlQuery: string, values?: any[]): Promise<any[]> {
    try {
      // Execute the query directly - PostgreSQL natively supports parameterized queries
      const result = await db.execute(sqlQuery, values || []);
      // Convert the result to an array if it's not already
      return Array.isArray(result) ? result : (result.rows || []);
    } catch (error) {
      console.error('Error executing parameterized SQL:', error);
      throw error;
    }
  }

  /**
   * Execute a transaction with multiple SQL queries
   * All queries either succeed or fail together
   * 
   * @param callback A function that executes SQL queries within a transaction
   * @returns The result of the callback function
   */
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    try {
      return await db.transaction(async (tx) => {
        // Replace the global db instance with the transaction instance
        const originalDb = db;
        (global as any).db = tx;
        
        try {
          const result = await callback();
          return result;
        } finally {
          // Restore the original db instance
          (global as any).db = originalDb;
        }
      });
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw error;
    }
  }
}

export const sqlService = new SQLService();