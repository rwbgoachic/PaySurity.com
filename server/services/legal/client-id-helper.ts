/**
 * Client ID Helper Functions
 * 
 * This module provides helper functions for working with clientId values
 * in the IOLTA trust accounting system. It helps standardize the handling
 * of clientId fields that may be stored as text in the database but used
 * as numbers in the application code.
 */

/**
 * Ensures that a clientId is properly formatted as a string for storage
 * @param clientId The client ID (number or string)
 * @returns The client ID as a string
 */
export function ensureStringClientId(clientId: number | string): string {
  return String(clientId);
}

/**
 * Compares two clientId values safely, handling type conversion
 * @param id1 First client ID (can be number or string)
 * @param id2 Second client ID (can be number or string)
 * @returns True if the IDs match when normalized
 */
export function compareClientIds(id1: number | string | null | undefined, id2: number | string | null | undefined): boolean {
  if (id1 === null || id1 === undefined || id2 === null || id2 === undefined) {
    return false;
  }
  return String(id1) === String(id2);
}

/**
 * Converts a string clientId to a number if possible
 * @param clientId The client ID as a string
 * @returns The client ID as a number, or null if invalid
 */
export function parseClientId(clientId: string | null | undefined): number | null {
  if (!clientId) return null;
  
  const parsed = parseInt(clientId, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Normalize client ID values in an object
 * @param obj Object containing client ID fields
 * @returns New object with normalized client IDs 
 */
export function normalizeClientIdFields<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  
  if ('clientId' in obj && obj.clientId !== undefined && obj.clientId !== null) {
    (result as any).clientId = ensureStringClientId(obj.clientId);
  }
  
  return result;
}