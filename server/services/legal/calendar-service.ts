import { db } from '../../db';
import { eq, and, gte, lte, desc, sql, isNull, or } from 'drizzle-orm';
import { 
  LegalCalendarEvent, 
  InsertLegalCalendarEvent, 
  legalCalendarEvents,
  LegalCalendarReminder,
  InsertLegalCalendarReminder,
  legalCalendarReminders,
  LegalDeadline,
  InsertLegalDeadline,
  legalDeadlines,
} from '@shared/schema';
import * as dateUtils from '../../utils/date-utils';
import { sendEmailNotification } from '../../utils/email';

/**
 * Service class for managing calendar events, deadlines, and reminders
 */
class CalendarService {
  /**
   * Create a new calendar event
   */
  async createEvent(eventData: InsertLegalCalendarEvent): Promise<LegalCalendarEvent> {
    try {
      // If it's a recurring event, store the pattern
      if (eventData.recurringPattern && !eventData.parentEventId) {
        // For recurring events, we'll create the first occurrence
        const [event] = await db.insert(legalCalendarEvents)
          .values(eventData)
          .returning();
        
        return event;
      } else {
        // Regular non-recurring event
        const [event] = await db.insert(legalCalendarEvents)
          .values(eventData)
          .returning();
        
        // If reminder is enabled, create reminder notifications
        if (eventData.reminderEnabled && eventData.reminderTimes?.length) {
          await this.setupEventReminders(event);
        }
        
        return event;
      }
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Create or update calendar event occurrences for recurring events
   */
  async createRecurringEventOccurrences(
    parentEventId: number, 
    occurrences: number = 10
  ): Promise<LegalCalendarEvent[]> {
    try {
      // Get the parent event
      const parentEvent = await this.getEvent(parentEventId);
      if (!parentEvent || !parentEvent.recurringPattern) {
        throw new Error('Parent event not found or not a recurring event');
      }
      
      // Parse the recurring pattern
      const { type, interval } = dateUtils.parseRecurringPattern(parentEvent.recurringPattern);
      
      // Get the end date if specified
      const endDate = parentEvent.recurringEndDate || undefined;
      
      // Generate the occurrence dates
      const occurrenceDates = dateUtils.generateOccurrences(
        parentEvent.startDate, 
        type, 
        occurrences,
        endDate
      );
      
      // Skip the first date since it's the parent event itself
      const futureDates = occurrenceDates.slice(1);
      
      // Check for existing occurrences to avoid duplicates
      const existingOccurrences = await db.select()
        .from(legalCalendarEvents)
        .where(eq(legalCalendarEvents.parentEventId, parentEventId));
      
      // Create new occurrences
      const newOccurrences: LegalCalendarEvent[] = [];
      
      for (const date of futureDates) {
        // Skip if an occurrence with this date already exists
        const exists = existingOccurrences.some(e => 
          e.startDate.getTime() === date.getTime()
        );
        
        if (!exists) {
          // Calculate end date if the parent event has one
          let endDate = null;
          if (parentEvent.endDate) {
            const duration = parentEvent.endDate.getTime() - parentEvent.startDate.getTime();
            endDate = new Date(date.getTime() + duration);
          }
          
          // Create the occurrence as a child event
          const [occurrence] = await db.insert(legalCalendarEvents)
            .values({
              merchantId: parentEvent.merchantId,
              createdById: parentEvent.createdById,
              title: parentEvent.title,
              description: parentEvent.description,
              eventType: parentEvent.eventType,
              startDate: date,
              endDate,
              isAllDay: parentEvent.isAllDay,
              location: parentEvent.location,
              matterId: parentEvent.matterId,
              clientId: parentEvent.clientId,
              assignedToIds: parentEvent.assignedToIds,
              priority: parentEvent.priority,
              status: 'pending',
              reminderEnabled: parentEvent.reminderEnabled,
              reminderTimes: parentEvent.reminderTimes,
              parentEventId,
              showInClientPortal: parentEvent.showInClientPortal
            })
            .returning();
          
          // Setup reminders for this occurrence if enabled
          if (parentEvent.reminderEnabled && parentEvent.reminderTimes?.length) {
            await this.setupEventReminders(occurrence);
          }
          
          newOccurrences.push(occurrence);
        }
      }
      
      return newOccurrences;
    } catch (error) {
      console.error('Error creating recurring event occurrences:', error);
      throw new Error('Failed to create recurring event occurrences');
    }
  }

  /**
   * Get a single calendar event by ID
   */
  async getEvent(id: number): Promise<LegalCalendarEvent | undefined> {
    try {
      const [event] = await db.select()
        .from(legalCalendarEvents)
        .where(eq(legalCalendarEvents.id, id));
      
      return event;
    } catch (error) {
      console.error('Error getting calendar event:', error);
      throw new Error('Failed to retrieve calendar event');
    }
  }

  /**
   * Update a calendar event
   */
  async updateEvent(id: number, eventData: Partial<LegalCalendarEvent>): Promise<LegalCalendarEvent> {
    try {
      const [updatedEvent] = await db.update(legalCalendarEvents)
        .set({
          ...eventData,
          updatedAt: new Date()
        })
        .where(eq(legalCalendarEvents.id, id))
        .returning();
      
      // If reminder settings changed, update reminders
      if (
        'reminderEnabled' in eventData || 
        'reminderTimes' in eventData || 
        'startDate' in eventData
      ) {
        // Delete existing reminders
        await db.delete(legalCalendarReminders)
          .where(eq(legalCalendarReminders.eventId, id));
        
        // Create new reminders if enabled
        if (updatedEvent.reminderEnabled && updatedEvent.reminderTimes?.length) {
          await this.setupEventReminders(updatedEvent);
        }
      }
      
      return updatedEvent;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(id: number): Promise<void> {
    try {
      // First check if this is a parent event with child occurrences
      const event = await this.getEvent(id);
      if (event?.recurringPattern && !event?.parentEventId) {
        // This is a parent event, also delete child occurrences
        await db.delete(legalCalendarEvents)
          .where(eq(legalCalendarEvents.parentEventId, id));
      }
      
      // Delete the event itself
      await db.delete(legalCalendarEvents)
        .where(eq(legalCalendarEvents.id, id));
      
      // Delete associated reminders
      await db.delete(legalCalendarReminders)
        .where(eq(legalCalendarReminders.eventId, id));
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Get calendar events for a merchant
   */
  async getEvents(
    merchantId: number, 
    options: {
      startDate?: Date;
      endDate?: Date;
      matterId?: number;
      clientId?: number;
      eventType?: string;
      assignedToId?: number;
    } = {}
  ): Promise<LegalCalendarEvent[]> {
    try {
      const { startDate, endDate, matterId, clientId, eventType, assignedToId } = options;
      
      // Base query
      let query = db.select()
        .from(legalCalendarEvents)
        .where(eq(legalCalendarEvents.merchantId, merchantId));
      
      // Apply filters
      if (startDate) {
        query = query.where(gte(legalCalendarEvents.startDate, startDate));
      }
      
      if (endDate) {
        query = query.where(lte(legalCalendarEvents.startDate, endDate));
      }
      
      if (matterId) {
        query = query.where(eq(legalCalendarEvents.matterId, matterId));
      }
      
      if (clientId) {
        query = query.where(eq(legalCalendarEvents.clientId, clientId));
      }
      
      if (eventType) {
        query = query.where(sql`${legalCalendarEvents.eventType} = ${eventType}`);
      }
      
      if (assignedToId) {
        // Check if the user is in the assignedToIds array
        query = query.where(sql`${assignedToId} = ANY(${legalCalendarEvents.assignedToIds})`);
      }
      
      // Get events ordered by start date
      const events = await query
        .orderBy(legalCalendarEvents.startDate);
      
      return events;
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw new Error('Failed to retrieve calendar events');
    }
  }

  /**
   * Setup reminders for an event
   */
  private async setupEventReminders(event: LegalCalendarEvent): Promise<void> {
    if (!event.reminderEnabled || !event.reminderTimes?.length) {
      return;
    }
    
    try {
      // Create a reminder for each time specified
      for (const minutesBefore of event.reminderTimes) {
        await db.insert(legalCalendarReminders)
          .values({
            merchantId: event.merchantId,
            eventId: event.id,
            reminderType: 'email', // Default to email
            minutesBefore,
            recipientIds: event.assignedToIds || [],
            status: 'pending'
          });
      }
    } catch (error) {
      console.error('Error setting up event reminders:', error);
      throw new Error('Failed to setup reminders for event');
    }
  }

  /**
   * Process due reminders and send notifications
   */
  async processDueReminders(): Promise<void> {
    try {
      const now = new Date();
      
      // Find reminders that are due but not yet sent
      const dueReminders = await db.select()
        .from(legalCalendarReminders)
        .innerJoin(
          legalCalendarEvents,
          eq(legalCalendarReminders.eventId, legalCalendarEvents.id)
        )
        .where(
          and(
            eq(legalCalendarReminders.status, 'pending'),
            isNull(legalCalendarReminders.sentAt)
          )
        );
      
      // Process each due reminder
      for (const reminder of dueReminders) {
        const event = reminder.legal_calendar_events;
        const reminderTime = new Date(event.startDate);
        
        // Calculate when the reminder should be sent
        reminderTime.setMinutes(reminderTime.getMinutes() - reminder.legal_calendar_reminders.minutesBefore);
        
        // If it's time to send the reminder
        if (reminderTime <= now) {
          // Send the notification based on reminderType
          await this.sendReminderNotification(reminder.legal_calendar_reminders, event);
          
          // Update the reminder as sent
          await db.update(legalCalendarReminders)
            .set({
              status: 'sent',
              sentAt: now,
              updatedAt: now
            })
            .where(eq(legalCalendarReminders.id, reminder.legal_calendar_reminders.id));
        }
      }
    } catch (error) {
      console.error('Error processing due reminders:', error);
      throw new Error('Failed to process reminders');
    }
  }

  /**
   * Send a reminder notification based on the reminder type
   */
  private async sendReminderNotification(
    reminder: LegalCalendarReminder, 
    event: LegalCalendarEvent
  ): Promise<void> {
    try {
      // Format the event time for display
      const eventTime = dateUtils.formatDate(event.startDate, 'datetime');
      
      // Get the event time until formatting
      const timeUntil = dateUtils.getTimeUntil(event.startDate);
      
      // Construct the notification message
      const subject = `Reminder: ${event.title} - ${timeUntil} from now`;
      const message = `
        <h2>Event Reminder</h2>
        <p>This is a reminder for the following event:</p>
        <p><strong>Event:</strong> ${event.title}</p>
        <p><strong>Time:</strong> ${eventTime}</p>
        <p><strong>Location:</strong> ${event.location || 'Not specified'}</p>
        <p><strong>Description:</strong> ${event.description || 'No description'}</p>
        <p>This event is scheduled to begin in ${timeUntil}.</p>
      `;
      
      // Send based on reminder type
      switch (reminder.reminderType) {
        case 'email':
          // In a real implementation, you would look up the email addresses
          // for the recipients and send to each one
          await sendEmailNotification({
            subject,
            message,
            recipientIds: reminder.recipientIds || []
          });
          break;
          
        case 'sms':
          // SMS implementation would go here
          break;
          
        case 'in_app':
          // In-app notification would go here
          break;
          
        case 'all':
          // Send all notification types
          await sendEmailNotification({
            subject,
            message,
            recipientIds: reminder.recipientIds || []
          });
          // Plus SMS and in-app notifications
          break;
      }
    } catch (error) {
      console.error('Error sending reminder notification:', error);
      throw new Error('Failed to send reminder notification');
    }
  }

  /**
   * Create a legal deadline
   */
  async createDeadline(deadlineData: InsertLegalDeadline): Promise<LegalDeadline> {
    try {
      const [deadline] = await db.insert(legalDeadlines)
        .values(deadlineData)
        .returning();
      
      // If this is a deadline that should also appear in the calendar,
      // create a calendar event for it
      if (deadlineData.relatedEventId === undefined) {
        const [event] = await db.insert(legalCalendarEvents)
          .values({
            merchantId: deadlineData.merchantId,
            createdById: deadlineData.createdById,
            title: deadlineData.title,
            description: deadlineData.description,
            eventType: 'filing_deadline', // Assuming this is for a filing deadline
            startDate: deadlineData.dueDate,
            isAllDay: true,
            matterId: deadlineData.matterId,
            assignedToIds: deadlineData.assignedToIds,
            priority: deadlineData.priority,
            status: 'pending',
            reminderEnabled: deadlineData.reminderEnabled,
            showInClientPortal: deadlineData.showInClientPortal
          })
          .returning();
        
        // Now update the deadline with the related event ID
        await db.update(legalDeadlines)
          .set({ relatedEventId: event.id })
          .where(eq(legalDeadlines.id, deadline.id));
        
        deadline.relatedEventId = event.id;
      }
      
      return deadline;
    } catch (error) {
      console.error('Error creating legal deadline:', error);
      throw new Error('Failed to create legal deadline');
    }
  }

  /**
   * Get a deadline by ID
   */
  async getDeadline(id: number): Promise<LegalDeadline | undefined> {
    try {
      const [deadline] = await db.select()
        .from(legalDeadlines)
        .where(eq(legalDeadlines.id, id));
      
      return deadline;
    } catch (error) {
      console.error('Error getting deadline:', error);
      throw new Error('Failed to retrieve deadline');
    }
  }

  /**
   * Update a legal deadline
   */
  async updateDeadline(id: number, deadlineData: Partial<LegalDeadline>): Promise<LegalDeadline> {
    try {
      const [updatedDeadline] = await db.update(legalDeadlines)
        .set({
          ...deadlineData,
          updatedAt: new Date()
        })
        .where(eq(legalDeadlines.id, id))
        .returning();
      
      // If the deadline has a related event, update that too
      if (updatedDeadline.relatedEventId) {
        const eventUpdates: Partial<LegalCalendarEvent> = {};
        
        // Map the deadline fields to calendar event fields
        if ('title' in deadlineData) eventUpdates.title = deadlineData.title;
        if ('description' in deadlineData) eventUpdates.description = deadlineData.description;
        if ('dueDate' in deadlineData) eventUpdates.startDate = deadlineData.dueDate;
        if ('priority' in deadlineData) eventUpdates.priority = deadlineData.priority;
        if ('assignedToIds' in deadlineData) eventUpdates.assignedToIds = deadlineData.assignedToIds;
        if ('status' in deadlineData) {
          // Map the deadline status to an event status
          switch (deadlineData.status) {
            case 'completed':
              eventUpdates.status = 'completed';
              break;
            case 'cancelled':
              eventUpdates.status = 'cancelled';
              break;
            case 'extended':
              eventUpdates.status = 'rescheduled';
              break;
            default:
              eventUpdates.status = 'pending';
          }
        }
        
        // Only update the event if we have changes to make
        if (Object.keys(eventUpdates).length > 0) {
          await db.update(legalCalendarEvents)
            .set(eventUpdates)
            .where(eq(legalCalendarEvents.id, updatedDeadline.relatedEventId));
        }
      }
      
      return updatedDeadline;
    } catch (error) {
      console.error('Error updating deadline:', error);
      throw new Error('Failed to update deadline');
    }
  }

  /**
   * Delete a legal deadline
   */
  async deleteDeadline(id: number): Promise<void> {
    try {
      // First get the deadline to check for a related event
      const deadline = await this.getDeadline(id);
      
      // Delete the deadline
      await db.delete(legalDeadlines)
        .where(eq(legalDeadlines.id, id));
      
      // If there's a related event, delete that too
      if (deadline?.relatedEventId) {
        await db.delete(legalCalendarEvents)
          .where(eq(legalCalendarEvents.id, deadline.relatedEventId));
        
        // Also delete any reminders for this event
        await db.delete(legalCalendarReminders)
          .where(eq(legalCalendarReminders.eventId, deadline.relatedEventId));
      }
    } catch (error) {
      console.error('Error deleting deadline:', error);
      throw new Error('Failed to delete deadline');
    }
  }

  /**
   * Get deadlines for a merchant
   */
  async getDeadlines(
    merchantId: number,
    options: {
      matterId?: number;
      status?: string;
      startDate?: Date;
      endDate?: Date;
      jurisdiction?: string;
      assignedToId?: number;
      deadlineType?: string;
    } = {}
  ): Promise<LegalDeadline[]> {
    try {
      const { matterId, status, startDate, endDate, jurisdiction, assignedToId, deadlineType } = options;
      
      // Base query
      let query = db.select()
        .from(legalDeadlines)
        .where(eq(legalDeadlines.merchantId, merchantId));
      
      // Apply filters
      if (matterId) {
        query = query.where(eq(legalDeadlines.matterId, matterId));
      }
      
      if (status) {
        query = query.where(sql`${legalDeadlines.status} = ${status}`);
      }
      
      if (startDate) {
        query = query.where(gte(legalDeadlines.dueDate, startDate));
      }
      
      if (endDate) {
        query = query.where(lte(legalDeadlines.dueDate, endDate));
      }
      
      if (jurisdiction) {
        query = query.where(eq(legalDeadlines.jurisdiction, jurisdiction));
      }
      
      if (assignedToId) {
        // Check if the user is in the assignedToIds array
        query = query.where(sql`${assignedToId} = ANY(${legalDeadlines.assignedToIds})`);
      }
      
      if (deadlineType) {
        query = query.where(sql`${legalDeadlines.deadlineType} = ${deadlineType}`);
      }
      
      // Get deadlines ordered by due date
      const deadlines = await query
        .orderBy(legalDeadlines.dueDate);
      
      return deadlines;
    } catch (error) {
      console.error('Error getting deadlines:', error);
      throw new Error('Failed to retrieve deadlines');
    }
  }

  /**
   * Mark a deadline as completed
   */
  async completeDeadline(id: number, userId: number): Promise<LegalDeadline> {
    try {
      const [updatedDeadline] = await db.update(legalDeadlines)
        .set({
          status: 'completed',
          completedAt: new Date(),
          completedById: userId,
          updatedAt: new Date()
        })
        .where(eq(legalDeadlines.id, id))
        .returning();
      
      // If there's a related event, mark it as completed too
      if (updatedDeadline.relatedEventId) {
        await db.update(legalCalendarEvents)
          .set({
            status: 'completed',
            updatedAt: new Date()
          })
          .where(eq(legalCalendarEvents.id, updatedDeadline.relatedEventId));
      }
      
      return updatedDeadline;
    } catch (error) {
      console.error('Error completing deadline:', error);
      throw new Error('Failed to complete deadline');
    }
  }

  /**
   * Get approaching deadlines for the next 7 days
   */
  async getApproachingDeadlines(merchantId: number): Promise<LegalDeadline[]> {
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const deadlines = await db.select()
        .from(legalDeadlines)
        .where(
          and(
            eq(legalDeadlines.merchantId, merchantId),
            gte(legalDeadlines.dueDate, now),
            lte(legalDeadlines.dueDate, sevenDaysFromNow),
            or(
              eq(legalDeadlines.status, 'pending'),
              eq(legalDeadlines.status, 'extended')
            )
          )
        )
        .orderBy(legalDeadlines.dueDate);
      
      return deadlines;
    } catch (error) {
      console.error('Error getting approaching deadlines:', error);
      throw new Error('Failed to retrieve approaching deadlines');
    }
  }

  /**
   * Get overdue deadlines
   */
  async getOverdueDeadlines(merchantId: number): Promise<LegalDeadline[]> {
    try {
      const now = new Date();
      
      const deadlines = await db.select()
        .from(legalDeadlines)
        .where(
          and(
            eq(legalDeadlines.merchantId, merchantId),
            lte(legalDeadlines.dueDate, now),
            or(
              eq(legalDeadlines.status, 'pending'),
              eq(legalDeadlines.status, 'extended')
            )
          )
        )
        .orderBy(legalDeadlines.dueDate);
      
      return deadlines;
    } catch (error) {
      console.error('Error getting overdue deadlines:', error);
      throw new Error('Failed to retrieve overdue deadlines');
    }
  }

  /**
   * Calculate a deadline based on jurisdiction rules
   */
  calculateDeadline(
    baseDate: Date,
    jurisdictionRules: {
      businessDays: number;
      calendarDays: number;
    }
  ): Date {
    return dateUtils.calculateJurisdictionDeadline(baseDate, jurisdictionRules);
  }
}

export const calendarService = new CalendarService();