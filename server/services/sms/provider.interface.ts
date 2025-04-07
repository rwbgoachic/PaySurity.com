/**
 * Interface for SMS service providers
 */
export interface ISmsProvider {
  /**
   * Send an SMS message
   * @param to Phone number to send the message to
   * @param message The message content
   * @returns Promise resolving to success status
   */
  sendSms(to: string, message: string): Promise<boolean>;
  
  /**
   * Check if the provider is configured and ready to use
   * @returns Boolean indicating if the provider is ready
   */
  isConfigured(): boolean;
  
  /**
   * Get the provider name
   * @returns The name of the provider
   */
  getName(): string;
}
