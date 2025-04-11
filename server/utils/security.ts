import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure random token of specified length
 * @param length The length of the token in bytes (output will be 2x this in hex)
 * @returns A hex string token
 */
export function generateToken(length: number): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a cryptographically secure random token with specific prefix
 * @param prefix The prefix to add to the token
 * @param length The length of the random part of the token in bytes
 * @returns A token with the specified prefix followed by random hex string
 */
export function generatePrefixedToken(prefix: string, length: number): string {
  return `${prefix}_${randomBytes(length).toString('hex')}`;
}

/**
 * Validate if a token has the correct format and hasn't expired
 * @param token The token to validate
 * @param expiresAt Optional expiration date
 * @returns Boolean indicating if the token is valid
 */
export function validateToken(token: string, expiresAt?: Date): boolean {
  if (!token || typeof token !== 'string' || token.length < 8) {
    return false;
  }
  
  if (expiresAt && expiresAt < new Date()) {
    return false;
  }
  
  return true;
}