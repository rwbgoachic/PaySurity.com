declare module 'content-security-policy' {
  export function createSecureHeaders(options?: any): any;
}

// Add Express request CSRF token function
declare namespace Express {
  interface Request {
    csrfToken(): string;
  }
}