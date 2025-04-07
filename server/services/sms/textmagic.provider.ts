import { ISmsProvider } from './provider.interface';

export class TextMagicProvider implements ISmsProvider {
  constructor() {}
  
  public isConfigured(): boolean {
    return !!(
      process.env.TEXTMAGIC_USERNAME &&
      process.env.TEXTMAGIC_API_KEY
    );
  }
  
  public getName(): string {
    return 'TextMagic';
  }
  
  public async sendSms(to: string, message: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error('TextMagic is not configured');
      return false;
    }
    
    try {
      const response = await fetch('https://rest.textmagic.com/api/v2/messages', {
        method: 'POST',
        headers: {
          'X-TM-Username': process.env.TEXTMAGIC_USERNAME,
          'X-TM-Key': process.env.TEXTMAGIC_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phones: to,
          text: message
        })
      });
      
      if (!response.ok) {
        throw new Error(`TextMagic API error: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('TextMagic SMS Error:', error);
      return false;
    }
  }
}
