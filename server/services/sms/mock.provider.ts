import { ISmsProvider } from './provider.interface';

export class MockSmsProvider implements ISmsProvider {
  private sentMessages: Array<{to: string, message: string, timestamp: Date}> = [];
  
  constructor() {}
  
  public isConfigured(): boolean {
    return true; // Always configured
  }
  
  public getName(): string {
    return 'Mock SMS Provider (Testing Mode)';
  }
  
  public async sendSms(to: string, message: string): Promise<boolean> {
    // Format phone number for display
    const formattedPhone = this.formatPhoneNumber(to);
    
    // Store the message for potential retrieval later
    this.sentMessages.push({
      to,
      message,
      timestamp: new Date()
    });
    
    // Enhanced console logging for testing
    console.log('\n=================== MOCK SMS MESSAGE ===================');
    console.log(`TO: ${formattedPhone}`);
    console.log(`TIME: ${new Date().toLocaleString()}`);
    console.log(`MESSAGE CONTENT:`);
    console.log(`-----------------------------------------------------------`);
    console.log(message);
    console.log(`-----------------------------------------------------------`);
    console.log('NOTE: This is a test message only. No actual SMS was sent.');
    console.log('==========================================================\n');
    
    return true; // Always succeeds
  }
  
  // Helper method to format phone number for display
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
    }
    
    // Return as is if it doesn't match expected formats
    return phoneNumber;
  }
  
  // Method to get last N messages for testing verification
  public getRecentMessages(count: number = 5): Array<{to: string, message: string, timestamp: Date}> {
    return this.sentMessages.slice(-count);
  }
}
