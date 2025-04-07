import { ISmsProvider } from './provider.interface';

export class MockSmsProvider implements ISmsProvider {
  constructor() {}
  
  public isConfigured(): boolean {
    return true; // Always configured
  }
  
  public getName(): string {
    return 'Mock SMS Provider';
  }
  
  public async sendSms(to: string, message: string): Promise<boolean> {
    console.log('MOCK SMS:', { to, message });
    return true; // Always succeeds
  }
}
