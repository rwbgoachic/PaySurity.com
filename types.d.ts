// Declare modules that don't have type definitions
declare module 'jsonwebtoken';
declare module 'express-brute';
declare module 'connect-pg-simple';

// Add additional types as needed
declare namespace Express {
  export function createSecureHeaders(options?: any): any;

  interface Request {
    csrfToken(): string;
  }
}