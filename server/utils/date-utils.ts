/**
 * Date utility functions for calendar and deadline calculations
 */

/**
 * Add a number of business days to a date, excluding weekends
 * @param date The starting date
 * @param days Number of business days to add
 * @returns A new date with the business days added
 */
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  let daysAdded = 0;
  
  while (daysAdded < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++; // Only count weekdays (not Saturday or Sunday)
    }
  }
  
  return result;
}

/**
 * Calculate business days between two dates
 * @param startDate The start date
 * @param endDate The end date
 * @returns Number of business days between dates
 */
export function getBusinessDaysBetween(startDate: Date, endDate: Date): number {
  let count = 0;
  const currentDate = new Date(startDate.getTime());
  
  while (currentDate < endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return count;
}

/**
 * Check if a date is a business day (not a weekend)
 * @param date The date to check
 * @returns True if the date is a business day
 */
export function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6;
}

/**
 * Get next occurrence based on a recurring pattern
 * @param baseDate The base date
 * @param pattern The recurring pattern (daily, weekly, monthly, etc.)
 * @param interval The interval (every X days, weeks, etc.)
 * @returns The next occurrence date
 */
export function getNextOccurrence(baseDate: Date, pattern: string, interval: number = 1): Date {
  const result = new Date(baseDate.getTime());
  
  switch (pattern) {
    case 'daily':
      result.setDate(result.getDate() + interval);
      break;
    case 'weekly':
      result.setDate(result.getDate() + (interval * 7));
      break;
    case 'biweekly':
      result.setDate(result.getDate() + (interval * 14));
      break;
    case 'monthly':
      result.setMonth(result.getMonth() + interval);
      break;
    case 'quarterly':
      result.setMonth(result.getMonth() + (interval * 3));
      break;
    case 'yearly':
      result.setFullYear(result.getFullYear() + interval);
      break;
    default:
      throw new Error(`Unknown recurrence pattern: ${pattern}`);
  }
  
  return result;
}

/**
 * Format a date for display in the UI
 * @param date The date to format
 * @param format The format to use (short, long, etc.)
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'datetime' = 'short'): string {
  const options: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case 'short':
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
      break;
    case 'long':
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      options.weekday = 'long';
      break;
    case 'datetime':
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Gets the remaining time until a date in a human-readable format
 * @param targetDate The target date
 * @returns Human readable time remaining (e.g., "2 days", "3 hours", etc.)
 */
export function getTimeUntil(targetDate: Date): string {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'past due';
  }
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  } else {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`;
  }
}

/**
 * Calculate a deadline date based on a jurisdiction's rules
 * @param baseDate The base date for calculation
 * @param jurisdictionRules Rules for calculating deadlines
 * @returns The calculated deadline date
 */
export function calculateJurisdictionDeadline(
  baseDate: Date, 
  jurisdictionRules: {
    businessDays: number;
    calendarDays: number;
    excludeHolidays?: boolean;
  }
): Date {
  let result = new Date(baseDate.getTime());
  
  // Add calendar days first
  if (jurisdictionRules.calendarDays > 0) {
    result.setDate(result.getDate() + jurisdictionRules.calendarDays);
  }
  
  // Then add business days if needed
  if (jurisdictionRules.businessDays > 0) {
    result = addBusinessDays(result, jurisdictionRules.businessDays);
  }
  
  // Holiday handling would go here if needed
  // For now, we're keeping it simple
  
  return result;
}

/**
 * Check if a deadline is approaching (within the next 7 days)
 * @param deadlineDate The deadline date
 * @returns True if the deadline is approaching
 */
export function isDeadlineApproaching(deadlineDate: Date): boolean {
  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  return deadlineDate > now && deadlineDate <= sevenDaysFromNow;
}

/**
 * Check if a deadline is overdue
 * @param deadlineDate The deadline date
 * @returns True if the deadline is overdue
 */
export function isDeadlineOverdue(deadlineDate: Date): boolean {
  const now = new Date();
  return deadlineDate < now;
}

/**
 * Parse a recurring pattern string
 * @param pattern The pattern string (e.g., "weekly:1", "monthly:3", etc.)
 * @returns The pattern and interval
 */
export function parseRecurringPattern(pattern: string): { type: string; interval: number } {
  const parts = pattern.split(':');
  const type = parts[0];
  const interval = parts.length > 1 ? parseInt(parts[1], 10) : 1;
  
  return { type, interval };
}

/**
 * Generate a list of occurrences from a recurring pattern
 * @param startDate The start date
 * @param pattern The recurring pattern
 * @param occurrences The number of occurrences to generate
 * @param endDate Optional end date to stop at
 * @returns Array of occurrence dates
 */
export function generateOccurrences(
  startDate: Date,
  pattern: string,
  occurrences: number,
  endDate?: Date
): Date[] {
  const { type, interval } = parseRecurringPattern(pattern);
  const result: Date[] = [new Date(startDate.getTime())];
  
  for (let i = 1; i < occurrences; i++) {
    const nextDate = getNextOccurrence(result[i - 1], type, interval);
    
    if (endDate && nextDate > endDate) {
      break;
    }
    
    result.push(nextDate);
  }
  
  return result;
}