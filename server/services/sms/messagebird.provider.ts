import { ISmsProvider } from './provider.interface';

export class MessageBirdProvider implements ISmsProvider {
  private client: any;
  
  constructor() {
    if (this.isConfigured()) {
      try {
        // We don't want to crash if messagebird is not installed
        const messagebird = require('messagebird');
        this.client = messagebird(process.env.MESSAGEBIRD_API_KEY);
      } catch (e) {
        console.warn('MessageBird package not installed');
      }
    }
  }
  
  public isConfigured(): boolean {
    return !!(
      process.env.MESSAGEBIRD_API_KEY &&
      process.env.MESSAGEBIRD_ORIGINATOR
    );
  }
  
  public getName(): string {
    return 'MessageBird';
  }
  
  public async sendSms(to: string, message: string): Promise<boolean> {
    if (!this.isConfigured() || !this.client) {
      console.error('MessageBird is not configured');
      return false;
    }
    
    return new Promise((resolve) => {
      this.client.messages.create({
        originator: process.env.MESSAGEBIRD_ORIGINATOR,
        recipients: [to],
        body: message
      }, 
      (err: any) => {
        if (err) {
          console.error('MessageBird SMS Error:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
