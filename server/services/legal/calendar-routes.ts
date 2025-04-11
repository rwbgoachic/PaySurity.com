import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { calendarService } from './calendar-service';
import { 
  insertLegalCalendarEventSchema, 
  insertLegalCalendarReminderSchema,
  insertLegalDeadlineSchema,
  LegalCalendarEvent,
  LegalDeadline
} from '@shared/schema';

const calendarRouter = Router();

// Middleware to validate authentication
const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Middleware to validate that user belongs to a law firm (merchant)
const ensureLegalMerchant = (req: Request, res: Response, next: Function) => {
  // This would check if the user's merchant has legal features enabled
  // For now, we'll just pass through
  next();
};

// CALENDAR EVENTS ENDPOINTS

// Create a calendar event
calendarRouter.post('/events', ensureAuthenticated, ensureLegalMerchant, async (req: Request, res: Response) => {
  try {
    // Set merchantId and createdById from authenticated user for security
    const data = {
      ...req.body,
      merchantId: req.user?.merchantId || req.body.merchantId,
      createdById: req.user?.id || req.body.createdById
    };
    
    const validatedData = insertLegalCalendarEventSchema.parse(data);
    const event = await calendarService.createEvent(validatedData);
    
    // If it's a recurring event, create the occurrences
    if (event.recurringPattern && !event.parentEventId) {
      await calendarService.createRecurringEventOccurrences(event.id);
    }
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message || 'Failed to create calendar event' });
  }
});

// Get all calendar events for a merchant with filters
calendarRouter.get('/events', ensureAuthenticated, ensureLegalMerchant, async (req: Request, res: Response) => {
  try {
    const merchantId = req.user?.merchantId || Number(req.query.merchantId);
    
    // Parse filters
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const matterId = req.query.matterId ? Number(req.query.matterId) : undefined;
    const clientId = req.query.clientId ? Number(req.query.clientId) : undefined;
    const eventType = req.query.eventType as string | undefined;
    const assignedToId = req.query.assignedToId ? Number(req.query.assignedToId) : undefined;
    
    const events = await calendarService.getEvents(merchantId, {
      startDate,
      endDate,
      matterId,
      clientId,
      eventType,
      assignedToId
    });
    
    res.json(events);
  } catch (error) {
    console.error('Error getting calendar events:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve calendar events' });
  }
});

// Get a specific calendar event by ID
calendarRouter.get('/events/:id', ensureAuthenticated, ensureLegalMerchant, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const event = await calendarService.getEvent(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error getting calendar event:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve calendar event' });
  }
});

// Update a calendar event
calendarRouter.patch('/events/:id', ensureAuthenticated, ensureLegalMerchant, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    // Define what fields can be updated
    const updateSchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      eventType: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      isAllDay: z.boolean().optional(),
      location: z.string().optional(),
      matterId: z.number().optional(),
      clientId: z.number().optional(),
      assignedToIds: z.array(z.number()).optional(),
      priority: z.string().optional(),
      status: z.string().optional(),
      reminderEnabled: z.boolean().optional(),
      reminderTimes: z.array(z.number()).optional(),
      showInClientPortal: z.boolean().optional()
    });
    
    const updates = updateSchema.parse(req.body);
    
    // Update the event
    const updatedEvent = await calendarService.updateEvent(id, updates);
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message || 'Failed to update calendar event' });
  }
});

// Delete a calendar event
calendarRouter.delete('/events/:id', ensureAuthenticated, ensureLegalMerchant, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    await calendarService.deleteEvent(id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: error.message || 'Failed to delete calendar event' });
  }
});

// DEADLINES ENDPOINTS

// Create a legal deadline
calendarRouter.post('/deadlines', ensureAuthenticated, ensureLegalMerchant, async (req: Request, res: Response) => {
  try {
    // Set merchantId and createdById from authenticated user for security
    const data = {
      ...req.body,
      merchantId: req.user?.merchantId || req.body.merchantId,
      createdById: req.user?.id || req.body.createdById
    };
    
    const validatedData = insertLegalDeadlineSchema.parse(data);
    const deadline = await calendarService.createDeadline(validatedData);
    
    res.status(201).json(deadline);
  } catch (error) {
    console.error('Error creating legal deadline:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message || 'Failed to create legal deadline' });
  }
});

// Get all deadlines for a merchant with filters
calendarRouter.get('/deadlines', ensureAuthenticated, ensureLegalMerchant, async (req: Request, res: Response) => {
  try {
    const merchantId = req.user?.merchantId || Number(req.query.merchantId);
    
    // Parse filters
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const matterId = req.query.matterId ? Number(req.query.matterId) : undefined;
    const status = req.query.status as string | undefined;
    const jurisdiction = req.query.jurisdiction as string | undefined;
    const assignedToId = req.query.assignedToId ? Number(req.query.assignedToId) : undefined;
    const deadlineType = req.query.deadlineType as string | undefined;
    
    const deadlines = await calendarService.getDeadlines(merchantId, {
      startDate,
      endDate,
      matterId,
      status,
      jurisdiction,
      assignedToId,
      deadlineType
    });
    
    res.json(deadlines);
  } catch (error) {
    console.error('Error getting deadlines:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve deadlines' });
  }
});

// Get overdue deadlines
calendarRouter.get('/deadlines/overdue', ensureAuthenticated, ensureLegalMerchant, async (req: Request, res: Response) => {
  try {
    const merchantId = req.user?.merchantId || Number(req.query.merchantId);
    
    const overdueDeadlines = await calendarService.getOverdueDeadlines(merchantId);
    
    res.json(overdueDeadlines);
  } catch (error) {
    console.error('Error getting overdue deadlines:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve overdue deadlines' });
  }
});

// Get a specific deadline by ID
calendarRouter.get('/deadlines/:id', ensureAuthenticated, ensureLegalMerchant, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid deadline ID' });
    }
    
    const deadline = await calendarService.getDeadline(id);
    if (!deadline) {
      return res.status(404).json({ error: 'Deadline not found' });
    }
    
    res.json(deadline);
  } catch (error) {
    console.error('Error getting deadline:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve deadline' });
  }
});

// Update a deadline
calendarRouter.patch('/deadlines/:id', ensureAuthenticated, ensureLegalMerchant, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid deadline ID' });
    }
    
    // Define what fields can be updated
    const updateSchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      deadlineType: z.string().optional(),
      dueDate: z.date().optional(),
      calculatedFromDate: z.date().optional(),
      calculationMethod: z.string().optional(),
      jurisdiction: z.string().optional(),
      priority: z.string().optional(),
      status: z.string().optional(),
      assignedToIds: z.array(z.number()).optional(),
      showInClientPortal: z.boolean().optional(),
      reminderEnabled: z.boolean().optional()
    });
    
    const updates = updateSchema.parse(req.body);
    
    // Update the deadline
    const updatedDeadline = await calendarService.updateDeadline(id, updates);
    
    res.json(updatedDeadline);
  } catch (error) {
    console.error('Error updating deadline:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message || 'Failed to update deadline' });
  }
});

// Delete a deadline
calendarRouter.delete('/deadlines/:id', ensureAuthenticated, ensureLegalMerchant, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid deadline ID' });
    }
    
    await calendarService.deleteDeadline(id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting deadline:', error);
    res.status(500).json({ error: error.message || 'Failed to delete deadline' });
  }
});

// Mark a deadline as completed
calendarRouter.post('/deadlines/:id/complete', ensureAuthenticated, ensureLegalMerchant, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid deadline ID' });
    }
    
    const userId = req.user?.id || 0;
    const completedDeadline = await calendarService.completeDeadline(id, userId);
    
    res.json(completedDeadline);
  } catch (error) {
    console.error('Error completing deadline:', error);
    res.status(500).json({ error: error.message || 'Failed to complete deadline' });
  }
});

// Calculate a deadline based on jurisdiction rules
calendarRouter.post('/deadlines/calculate', ensureAuthenticated, ensureLegalMerchant, async (req: Request, res: Response) => {
  try {
    const { baseDate, jurisdictionRules } = req.body;
    
    if (!baseDate || !jurisdictionRules) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const calculatedDate = calendarService.calculateDeadline(
      new Date(baseDate),
      jurisdictionRules
    );
    
    res.json({ calculatedDate });
  } catch (error) {
    console.error('Error calculating deadline:', error);
    res.status(500).json({ error: error.message || 'Failed to calculate deadline' });
  }
});

export default calendarRouter;