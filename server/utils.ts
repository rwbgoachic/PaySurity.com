/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string | null, currency: string = 'USD'): string {
  if (amount === null || amount === undefined) {
    return '$0.00';
  }
  
  // Convert to number if it's a string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
}

/**
 * Generate a unique order number
 * @param prefix Optional prefix for the order number
 * @returns Order number string
 */
export function generateOrderNumber(prefix: string = ''): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

/**
 * Convert a date to YYYY-MM-DD format
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format a date and time
 * @param date The date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

/**
 * Calculate future time in minutes
 * @param minutes Minutes to add
 * @returns Future date
 */
export function addMinutes(minutes: number): Date {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

/**
 * Format a phone number to standard format
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a standard 10-digit US number
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // If it already has a country code
  if (cleaned.length > 10) {
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      return `+${cleaned}`;
    }
    return `+${cleaned}`;
  }
  
  // Return original if we can't format it
  return phone;
}

/**
 * Sanitize and validate a phone number
 * @param phone Phone number to validate
 * @returns Sanitized phone number or null if invalid
 */
export function validatePhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Must have at least 10 digits
  if (cleaned.length < 10) return null;
  
  // Format with country code
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  return `+${cleaned}`;
}