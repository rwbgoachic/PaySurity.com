/**
 * Email service utility
 * Provides functionality for sending various types of emails
 */
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { users } from '@shared/schema';

/**
 * Email sending options
 */
interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Notification options
 */
interface NotificationOptions {
  subject: string;
  message: string;
  recipientIds: number[];
  cc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Send an email
 * @param options Email options including recipient, subject, and content
 * @returns Promise resolving to boolean indicating success
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // For now, this is just a stub as we don't have an email provider set up
    // In production, this would use SendGrid, Mailgun, or another email service
    
    // Send to the specified recipient
    console.log('Sending email:', {
      to: options.to,
      subject: options.subject,
      text: options.text?.substring(0, 50) + (options.text && options.text.length > 50 ? '...' : '')
    });

    // If this is a demo request, also send to admin
    if (options.subject?.includes('Demo Request')) {
      console.log('Sending admin notification:', {
        to: 'admin@paysurity.com',
        subject: `[Admin] ${options.subject}`,
        text: options.text
      });
    }
    
    // Return true to simulate successful sending
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send a template-based email
 * @param templateId Identifier of the email template to use
 * @param to Recipient email address
 * @param data Data to populate the template
 * @returns Promise resolving to boolean indicating success
 */
export async function sendTemplateEmail(
  templateId: string,
  to: string | string[],
  data: Record<string, any>
): Promise<boolean> {
  try {
    // In production, this would fetch templates from database or CMS
    // and render them with the provided data
    
    console.log(`Sending template email (${templateId}) to:`, to);
    
    // Template rendering logic would go here
    const subject = `Template Email: ${templateId}`;
    const text = `This is a template email with data: ${JSON.stringify(data)}`;
    
    return sendEmail({ to, subject, text });
  } catch (error) {
    console.error('Error sending template email:', error);
    return false;
  }
}

/**
 * Send notification emails to users
 * @param options Options including subject, message, and recipient user IDs
 * @returns Promise resolving to boolean indicating success
 */
export async function sendEmailNotification(options: NotificationOptions): Promise<boolean> {
  try {
    const { subject, message, recipientIds, cc, attachments } = options;
    
    // Get email addresses for recipient users
    const recipientUsers = await db.select()
      .from(users)
      .where(sql`${users.id} = ANY(${recipientIds})`);
    
    if (!recipientUsers.length) {
      console.warn('No users found for notification recipients');
      return false;
    }
    
    // Extract email addresses
    const recipientEmails = recipientUsers
      .filter(user => !!user.email)
      .map(user => user.email as string);
    
    if (!recipientEmails.length) {
      console.warn('No valid email addresses found for notification recipients');
      return false;
    }
    
    // Send the email
    return sendEmail({
      to: recipientEmails,
      subject,
      html: message,
      cc,
      attachments
    });
  } catch (error) {
    console.error('Error sending notification emails:', error);
    return false;
  }
}