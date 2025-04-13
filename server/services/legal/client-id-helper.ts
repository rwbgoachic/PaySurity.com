/**
 * Client ID Helper Functions
 * 
 * Utility functions for handling client ID type inconsistencies between IOLTA tables
 * (which use string clientIds) and client portal tables (which use number clientIds).
 */

/**
 * Convert a client ID to the format needed for IOLTA tables (string)
 * 
 * @param clientId Client ID as string or number
 * @returns Client ID as string for IOLTA operations
 */
export function toIoltaClientId(clientId: string | number): string {
  return String(clientId);
}

/**
 * Convert a client ID to the format needed for portal tables (number)
 * 
 * @param clientId Client ID as string or number
 * @returns Client ID as number for portal operations
 */
export function toPortalClientId(clientId: string | number): number {
  return typeof clientId === 'string' ? parseInt(clientId, 10) : clientId;
}

/**
 * Check if two client IDs match, regardless of their type (string or number)
 * 
 * @param clientId1 First client ID (string or number)
 * @param clientId2 Second client ID (string or number) 
 * @returns True if the client IDs represent the same client
 */
export function clientIdsMatch(clientId1: string | number, clientId2: string | number): boolean {
  return String(clientId1) === String(clientId2);
}