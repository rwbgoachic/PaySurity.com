import { SmsProviderFactory } from './factory';
import { storage } from "../../storage";
import { RestaurantOrder } from "@shared/schema";

export class SmsService {
  private factory: SmsProviderFactory;
  
  constructor() {
    this.factory = SmsProviderFactory.getInstance();
  }
  
  /**
   * Send an SMS message
   * @param to Phone number to send the message to
   * @param message The message content
   * @returns Promise resolving to success status
   */
  public async sendSms(to: string, message: string): Promise<boolean> {
    const provider = this.factory.getActiveProvider();
    
    if (!provider) {
      console.error('No active SMS provider');
      return false;
    }
    
    return await provider.sendSms(to, message);
  }
  
  /**
   * Get configured provider names
   * @returns Array of provider names
   */
  public getAvailableProviders(): string[] {
    return this.factory.getAvailableProviders();
  }
  
  /**
   * Change the active SMS provider
   * @param providerName The name of the provider to use
   * @returns Success status
   */
  public setProvider(providerName: string): boolean {
    return this.factory.setActiveProvider(providerName);
  }
  
  /**
   * Retrieve recent SMS messages sent by the mock provider (testing only)
   * @param count Number of recent messages to retrieve
   * @returns Array of recent messages or empty array if not in test mode
   */
  public getRecentTestMessages(count: number = 10): Array<{to: string, message: string, timestamp: Date}> {
    const mockProvider = this.factory.getMockProvider();
    if (mockProvider && typeof mockProvider.getRecentMessages === 'function') {
      return mockProvider.getRecentMessages(count);
    }
    return [];
  }
  
  /**
   * Send an order status notification
   * @param order The order to send notification for
   * @param status The status of the order
   * @param customMessage Optional custom message to send
   * @returns Promise resolving to success status
   */
  public async sendOrderStatusSms(
    order: RestaurantOrder | any,
    status: "placed" | "preparing" | "ready" | "served" | "completed" | "canceled" | "modifying",
    customMessage?: string
  ): Promise<boolean> {
    if (!order.customerPhone || !order.smsOptedIn) {
      console.log("Customer does not have phone number or has not opted in for SMS");
      return false;
    }
    
    let message = customMessage;
    
    if (!message) {
      // Default messages based on status
      switch (status) {
        case "placed":
          message = `Your order #${order.orderNumber} has been received! We'll prepare it within approximately ${this.getEstimatedPrepTime(order)} minutes. Text STOP to unsubscribe.`;
          break;
        case "preparing":
          message = `Your order #${order.orderNumber} is now being prepared. We'll let you know when it's ready! Text STOP to unsubscribe.`;
          break;
        case "ready":
          message = `Great news! Your order #${order.orderNumber} is now ready for pickup. Please present this order number at the counter. Text STOP to unsubscribe.`;
          break;
        case "completed":
          message = `Thank you for your business! Your order #${order.orderNumber} has been completed. We hope to see you again soon! Text STOP to unsubscribe.`;
          break;
        case "canceled":
          message = `Your order #${order.orderNumber} has been canceled. If you have any questions, please contact us. Text STOP to unsubscribe.`;
          break;
        default:
          message = `Update on your order #${order.orderNumber}: status is now ${status}. Text STOP to unsubscribe.`;
      }
    }
    
    // Send the SMS
    const success = await this.sendSms(order.customerPhone, message);
    
    if (success) {
      // Log the SMS notification success
      console.log(`SMS notification sent successfully for order #${order.orderNumber}`);
      
      try {
        // Try to update the order status in the database
        // We'll check if the method is available and use it
        if (typeof storage.updateRestaurantOrderStatus === 'function') {
          await storage.updateRestaurantOrderStatus(order.id, status, { 
            smsNotificationSent: true 
          });
        } else {
          console.log('Restaurant order update method not available, notification status not persisted');
        }
      } catch (error) {
        console.error('Error updating order notification status:', error);
      }
    }
    
    return success;
  }
  
  /**
   * Calculate the estimated preparation time for an order
   * @param order The order to calculate prep time for
   * @returns Estimated prep time in minutes
   */
  public getEstimatedPrepTime(order: RestaurantOrder | any): number {
    if (order.estimatedPrepTime) {
      return order.estimatedPrepTime;
    }
    
    // Default estimated times based on order type and size
    let baseTime = 15; // Base time of 15 minutes
    
    // Adjust for order size/complexity
    if (order.items && order.items.length > 0) {
      const itemCount = order.items.reduce((total: number, item: any) => total + item.quantity, 0);
      
      if (itemCount > 10) {
        baseTime += 15; // Add 15 minutes for large orders
      } else if (itemCount > 5) {
        baseTime += 10; // Add 10 minutes for medium orders
      } else {
        baseTime += 5; // Add 5 minutes for small orders
      }
    }
    
    return baseTime;
  }
}

// Export singleton instance
export const smsService = new SmsService();

// Export convenience functions
export async function sendOrderStatusSms(
  order: RestaurantOrder | any,
  status: "placed" | "preparing" | "ready" | "served" | "completed" | "canceled" | "modifying",
  customMessage?: string
): Promise<boolean> {
  return await smsService.sendOrderStatusSms(order, status, customMessage);
}

export function getEstimatedPrepTime(order: RestaurantOrder | any): number {
  return smsService.getEstimatedPrepTime(order);
}

/**
 * Retrieve recent SMS messages sent by the mock provider (testing only)
 * @param count Number of recent messages to retrieve
 * @returns Array of recent messages or empty array if not in test mode
 */
export function getRecentTestMessages(count: number = 10): Array<{to: string, message: string, timestamp: Date}> {
  return smsService.getRecentTestMessages(count);
}
