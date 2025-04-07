import { ISmsProvider } from './provider.interface';

export class TwilioProvider implements ISmsProvider {
  private client: any;
  
  constructor() {
    if (this.isConfigured()) {
      const twilio = require('twilio');
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }
  
  public isConfigured(): boolean {
    return !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    );
  }
  
  public getName(): string {
    return 'Twilio';
  }
  
  public async sendSms(to: string, message: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error('Twilio is not configured');
      return false;
    }
    
    try {
      await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
      return true;
    } catch (error) {
      console.error('Twilio SMS Error:', error);
      return false;
    }
  }
}
