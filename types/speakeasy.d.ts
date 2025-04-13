declare module 'speakeasy' {
  export interface GenerateSecretOptions {
    length?: number;
    name?: string;
    issuer?: string;
    encoding?: 'ascii' | 'hex' | 'base32';
    symbols?: boolean;
    otpauth_url?: boolean;
  }

  export interface VerifyOptions {
    secret: string;
    encoding?: 'ascii' | 'hex' | 'base32';
    token: string;
    window?: number;
    counter?: number;
    step?: number;
    time?: number;
    timestamp?: number;
    digits?: number;
    algorithm?: 'sha1' | 'sha256' | 'sha512';
  }

  export interface GenerateSecretResult {
    ascii: string;
    hex: string;
    base32: string;
    otpauth_url?: string;
  }

  export interface GenerateTokenOptions {
    secret: string;
    encoding?: 'ascii' | 'hex' | 'base32';
    counter?: number;
    step?: number;
    time?: number;
    timestamp?: number;
    digits?: number;
    algorithm?: 'sha1' | 'sha256' | 'sha512';
  }

  export namespace hotp {
    export function generate(options: GenerateTokenOptions): string;
    export function verify(options: VerifyOptions): boolean;
  }

  export namespace totp {
    export function generate(options: GenerateTokenOptions): string;
    export function verify(options: VerifyOptions): boolean;
  }

  export function generateSecret(options?: GenerateSecretOptions): GenerateSecretResult;
}