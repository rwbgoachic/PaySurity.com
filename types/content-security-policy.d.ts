declare module 'content-security-policy' {
  export function getCSP(options?: any): {
    policy: string;
    directives: Record<string, any>;
  };
  
  export default function createSecureHeaders(options?: any): {
    policy: string;
    directives: Record<string, any>;
  };
}