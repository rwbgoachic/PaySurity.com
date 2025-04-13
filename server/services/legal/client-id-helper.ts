/**
 * Client ID Helper
 * 
 * Utility functions to handle the conversion between string and numeric client IDs
 * across different parts of the legal practice management system.
 * 
 * This is needed because:
 * - IOLTA tables store clientId as string
 * - Portal tables store clientId as number
 */

/**
 * Convert client ID to string format for IOLTA operations
 */
export function toIoltaClientId(clientId: string | number): string {
  return String(clientId);
}

/**
 * Convert client ID to number format for portal operations
 */
export function toPortalClientId(clientId: string | number): number {
  // If it's already a number, return it
  if (typeof clientId === 'number') return clientId;
  
  // Try to convert to number
  const numericId = Number(clientId);
  
  // Check if conversion was successful and valid
  if (isNaN(numericId)) {
    throw new Error(`Invalid client ID: ${clientId}`);
  }
  
  return numericId;
}

/**
 * Safely compare client IDs regardless of type
 */
export function clientIdsMatch(id1: string | number, id2: string | number): boolean {
  return String(id1) === String(id2);
}
