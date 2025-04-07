import { db } from "../db";
import { restaurantOrders } from "@shared/schema";
import { eq } from "drizzle-orm";
import { storage } from "../storage";
import { sendOrderStatusSms } from "./sms";

/**
 * Start order modification process
 * @param order The order to modify
 * @returns Updated order
 */
export async function startOrderModification(orderId: number) {
  return await storage.startModifyingOrder(orderId);
}

/**
 * Complete order modification process
 * @param order The order that was modified
 * @param wasModified Whether the order was actually modified
 * @returns Updated order
 */
export async function finishOrderModification(orderId: number, wasModified: boolean = false) {
  return await storage.finishModifyingOrder(orderId, wasModified);
}

/**
 * Cancel an order due to modification timeout
 * @param orderId The order ID to cancel
 * @returns Updated order
 */
export async function cancelOrderDueToTimeout(orderId: number) {
  return await storage.cancelOrderDueToModificationTimeout(orderId);
}

/**
 * Send a reminder SMS for an order being modified
 * @param order The order being modified
 * @returns Boolean indicating success
 */
export async function sendModificationReminderSms(order: any) {
  const message = `You were modifying your order #${order.orderNumber}. Until you complete the modified or the same order, your order will not be prepared. Click the link to continue: ${order.modificationLink}`;
  
  const success = await sendOrderStatusSms(order, "modifying", message);
  
  if (success) {
    await storage.updateOrderModificationReminder(order.id, true);
  }
  
  return success;
}

/**
 * Send a timeout notification SMS for an order that expired during modification
 * @param order The order being modified
 * @returns Boolean indicating success
 */
export async function sendModificationTimeoutSms(order: any) {
  const message = `Since you didn't complete your modification for order #${order.orderNumber}, it has been cancelled.`;
  
  const success = await sendOrderStatusSms(order, "canceled", message);
  
  if (success) {
    await storage.updateOrderModificationTimeout(order.id, true);
  }
  
  return success;
}

/**
 * Process orders being modified
 * This function should be called periodically to check for reminder and timeout conditions
 */
export async function processOrderModifications() {
  const ordersBeingModified = await storage.getOrdersBeingModified();
  const now = new Date();
  
  for (const order of ordersBeingModified) {
    if (!order.modificationStartTime) continue;
    
    const modificationStartTime = new Date(order.modificationStartTime);
    const minutesSinceStart = Math.floor((now.getTime() - modificationStartTime.getTime()) / (1000 * 60));
    
    // Send reminder after 5 minutes if not already sent
    if (minutesSinceStart >= 5 && !order.modificationReminderSent) {
      await sendModificationReminderSms(order);
    }
    
    // Cancel and send timeout notification after 15 minutes (5 + 10)
    if (minutesSinceStart >= 15 && !order.modificationTimeoutSent) {
      await sendModificationTimeoutSms(order);
      await cancelOrderDueToTimeout(order.id);
    }
  }
}
