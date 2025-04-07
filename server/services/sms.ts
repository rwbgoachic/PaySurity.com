import twilio from 'twilio';
import { RestaurantOrder } from '@shared/schema';
import { formatCurrency } from '../utils';

// Initialize Twilio client with environment variables
let twilioClient: twilio.Twilio | null = null;

// Check if we have necessary Twilio credentials
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client if credentials are available
if (twilioAccountSid && twilioAuthToken) {
  twilioClient = twilio(twilioAccountSid, twilioAuthToken);
}

/**
 * Get estimated order preparation time based on recent order history
 * In a real implementation, this would analyze the last 60 minutes of order history
 * and calculate an average preparation time, plus a buffer.
 * @param merchantId The merchant ID
 * @returns Estimated prep time in minutes
 */
export async function getEstimatedPrepTime(merchantId: number): Promise<number> {
  // In a real implementation, this would be calculated based on recent order history
  // For now, return a default value
  return 15; // Default 15 minutes
}

/**
 * Formats a list of order items for SMS
 * @param order Order with items
 * @returns Formatted item string
 */
export function formatOrderItemsForSms(order: any): string {
  if (!order.items || order.items.length === 0) {
    return 'No items';
  }

  // Limit to 3 items with "and X more" for brevity
  const itemsToShow = order.items.slice(0, 3);
  const remainingItems = order.items.length - 3;
  
  const itemsString = itemsToShow.map((item: any) => {
    return `${item.quantity}x ${item.name}`;
  }).join(', ');
  
  if (remainingItems > 0) {
    return `${itemsString}, and ${remainingItems} more item${remainingItems === 1 ? '' : 's'}`;
  }
  
  return itemsString;
}

/**
 * Send order confirmation SMS
 * @param order Order object
 * @param modificationUrl URL for modifying the order
 * @returns Boolean indicating success or failure
 */
export async function sendOrderConfirmationSms(
  order: RestaurantOrder,
  orderItems: any[],
  modificationUrl: string
): Promise<boolean> {
  if (!twilioClient || !twilioPhoneNumber || !order.customerPhone || !order.smsOptedIn) {
    console.log('SMS not sent: missing required data or customer not opted in');
    return false;
  }

  try {
    const estimatedPrepTime = order.estimatedPrepTime || await getEstimatedPrepTime(order.merchantId);
    
    // Format the SMS message
    const message = `
PaySurity BistroBeast: Your order #${order.orderNumber} has been received! 
Estimated prep time: ${estimatedPrepTime} min. 
Total: ${formatCurrency(order.total)}
Items: ${formatOrderItemsForSms({ items: orderItems })}

Modify your order (valid for the next 10 min): ${modificationUrl}

Reply STOP to unsubscribe.
    `.trim();

    // Send the SMS
    await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: order.customerPhone
    });

    return true;
  } catch (error) {
    console.error('Error sending order confirmation SMS:', error);
    return false;
  }
}

/**
 * Send order status update SMS
 * @param order Order object
 * @param status New status
 * @returns Boolean indicating success or failure
 */
export async function sendOrderStatusSms(
  order: RestaurantOrder,
  status: 'ready' | 'canceled'
): Promise<boolean> {
  if (!twilioClient || !twilioPhoneNumber || !order.customerPhone || !order.smsOptedIn) {
    console.log('SMS not sent: missing required data or customer not opted in');
    return false;
  }

  try {
    // Format the SMS message based on status
    let message = '';
    
    if (status === 'ready') {
      message = `
PaySurity BistroBeast: Great news! Your order #${order.orderNumber} is now ready for pickup.

Reply STOP to unsubscribe.
      `.trim();
    } else if (status === 'canceled') {
      message = `
PaySurity BistroBeast: Your order #${order.orderNumber} has been canceled. 
Please contact the restaurant for more information.

Reply STOP to unsubscribe.
      `.trim();
    }

    // Send the SMS
    await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: order.customerPhone
    });

    return true;
  } catch (error) {
    console.error('Error sending order status SMS:', error);
    return false;
  }
}