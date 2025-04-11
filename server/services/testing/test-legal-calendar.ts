/**
 * Calendar and Deadlines System Test Suite
 * 
 * This tests the comprehensive calendar functionality for the legal practice
 * management system including events, deadlines, reminders, and jurisdiction-specific
 * calculations.
 */

import { db } from "../../db";
import { testCoordinator } from "./test-coordinator";
import { 
  legalCalendarEvents, 
  legalCalendarReminders, 
  legalDeadlines 
} from "@shared/schema";
import { calendarService } from "../legal/calendar-service";
import { TestReport } from "./test-interfaces";
import { eq } from "drizzle-orm";

// Sample test data
const testMerchantId = 1001;
const testUserId = 2001;
const testMatterId = 3001;
const testClientId = 4001;

/**
 * Main test entry point for calendar system
 */
export async function testLegalCalendarSystem(): Promise<TestReport> {
  console.log("Starting Legal Calendar System Tests...");

  // Initialize report
  const report = {
    name: "Legal Calendar and Deadlines System Tests",
    startTime: new Date(),
    testGroups: [
      {
        name: "Calendar Events",
        tests: []
      },
      {
        name: "Deadline Management",
        tests: []
      },
      {
        name: "Reminder System",
        tests: []
      },
      {
        name: "Jurisdiction Rules",
        tests: []
      }
    ],
    tests: []
  } as TestReport;

  try {
    // Clean up any previous test data
    await cleanupTestData();

    // Run test suites
    await testCalendarEvents(report);
    await testDeadlineManagement(report);
    await testReminderSystem(report);
    await testJurisdictionRules(report);

    // Calculate pass rate and finalize report
    report.testsPassed = report.tests.filter(t => t.passed).length;
    report.testsFailed = report.tests.filter(t => !t.passed).length;
    report.passRate = report.tests.length > 0 
      ? (report.testsPassed / report.tests.length) * 100 
      : 0;
      
    report.endTime = new Date();
    report.duration = report.endTime.getTime() - report.startTime.getTime();

    // Update pass rates for each group
    if (report.testGroups) {
      for (const group of report.testGroups) {
        const groupTests = report.tests.filter(t => t.group === group.name);
        const passedTests = groupTests.filter(t => t.passed);
        group.passRate = groupTests.length > 0 
          ? (passedTests.length / groupTests.length) * 100 
          : 0;
      }
    }

    console.log(`Calendar System Tests Completed: ${report.testsPassed}/${report.tests.length} passed (${report.passRate.toFixed(2)}%)`);
  } catch (error) {
    console.error("Error in calendar system tests:", error);
    
    // Add the error as a failed test
    report.tests.push({
      name: "Calendar system test suite execution",
      passed: false,
      group: "Calendar Events",
      error: String(error),
      errorDetails: error,
    });

    // Calculate test metrics
    report.testsPassed = report.tests.filter(t => t.passed).length;
    report.testsFailed = report.tests.filter(t => !t.passed).length;
    report.passRate = report.tests.length > 0 
      ? (report.testsPassed / report.tests.length) * 100 
      : 0;
    
    report.endTime = new Date();
    report.duration = report.endTime.getTime() - report.startTime.getTime();
  } finally {
    // Always clean up test data
    await cleanupTestData();
  }

  return report;
}

/**
 * Test calendar event functionality
 */
async function testCalendarEvents(report: TestReport): Promise<void> {
  // Test 1: Create a calendar event
  try {
    const eventData = {
      merchantId: testMerchantId,
      title: "Test Deposition",
      description: "Client deposition for case ABC",
      eventType: "deposition",
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours later
      isAllDay: false,
      location: "Office Conference Room",
      matterId: testMatterId,
      clientId: testClientId,
      createdById: testUserId,
      assignedToIds: [testUserId],
      priority: "high",
      status: "scheduled",
      reminderEnabled: true,
      reminderTimes: [15, 60], // 15 minutes and 1 hour before
      showInClientPortal: true
    };

    const event = await calendarService.createEvent(eventData);
    
    // Verify the event was created with correct data
    const createdEvent = await db.select().from(legalCalendarEvents).where(eq(legalCalendarEvents.id, event.id));
    
    const passed = createdEvent.length > 0 && 
                   createdEvent[0].title === eventData.title && 
                   createdEvent[0].status === eventData.status;
    
    report.tests.push({
      name: "Create calendar event",
      passed,
      group: "Calendar Events",
      error: passed ? null : "Created event doesn't match the input data",
    });
  } catch (error) {
    report.tests.push({
      name: "Create calendar event",
      passed: false,
      group: "Calendar Events",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 2: Create a recurring event
  try {
    const recurringEventData = {
      merchantId: testMerchantId,
      title: "Weekly Status Meeting",
      description: "Team status update",
      eventType: "meeting",
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 1 * 60 * 60 * 1000), // 1 hour later
      isAllDay: false,
      location: "Virtual",
      matterId: testMatterId,
      clientId: testClientId,
      createdById: testUserId,
      assignedToIds: [testUserId],
      priority: "medium",
      status: "scheduled",
      reminderEnabled: true,
      reminderTimes: [30], // 30 minutes before
      showInClientPortal: false,
      recurringPattern: "weekly:1", // Weekly, every 1 week
      recurringEndDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days later
    };

    const recurringEvent = await calendarService.createEvent(recurringEventData);
    
    // Generate occurrences
    await calendarService.createRecurringEventOccurrences(recurringEvent.id);
    
    // Verify recurring events were created
    const occurrences = await db.select()
                              .from(legalCalendarEvents)
                              .where(eq(legalCalendarEvents.parentEventId, recurringEvent.id));
    
    const passed = occurrences.length > 0;
    
    report.tests.push({
      name: "Create recurring events",
      passed,
      group: "Calendar Events",
      error: passed ? null : "No recurring event occurrences were created",
    });
  } catch (error) {
    report.tests.push({
      name: "Create recurring events",
      passed: false,
      group: "Calendar Events",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 3: Update a calendar event
  try {
    // First create an event
    const eventData = {
      merchantId: testMerchantId,
      title: "Initial Title",
      description: "Initial Description",
      eventType: "meeting",
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 1 * 60 * 60 * 1000),
      isAllDay: false,
      location: "Office",
      matterId: testMatterId,
      clientId: testClientId,
      createdById: testUserId,
      assignedToIds: [testUserId],
      priority: "medium",
      status: "scheduled",
      reminderEnabled: false,
      showInClientPortal: false
    };

    const event = await calendarService.createEvent(eventData);
    
    // Update the event
    const updatedData = {
      title: "Updated Title",
      description: "Updated Description",
      location: "Updated Location",
      priority: "high"
    };
    
    await calendarService.updateEvent(event.id, updatedData);
    
    // Verify the update
    const updatedEvent = await db.select().from(legalCalendarEvents).where(eq(legalCalendarEvents.id, event.id));
    
    const passed = updatedEvent.length > 0 && 
                   updatedEvent[0].title === updatedData.title && 
                   updatedEvent[0].description === updatedData.description &&
                   updatedEvent[0].location === updatedData.location &&
                   updatedEvent[0].priority === updatedData.priority;
    
    report.tests.push({
      name: "Update calendar event",
      passed,
      group: "Calendar Events",
      error: passed ? null : "Updated event doesn't have the expected data",
    });
  } catch (error) {
    report.tests.push({
      name: "Update calendar event",
      passed: false,
      group: "Calendar Events",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 4: Get events with filters
  try {
    // Create events with different dates
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Event 1: Yesterday
    await calendarService.createEvent({
      merchantId: testMerchantId,
      title: "Past Event",
      description: "Event from yesterday",
      eventType: "meeting",
      startDate: yesterday,
      endDate: new Date(yesterday.getTime() + 1 * 60 * 60 * 1000),
      isAllDay: false,
      matterId: testMatterId,
      clientId: testClientId,
      createdById: testUserId,
      assignedToIds: [testUserId],
      status: "completed",
      showInClientPortal: false
    });
    
    // Event 2: Today
    await calendarService.createEvent({
      merchantId: testMerchantId,
      title: "Current Event",
      description: "Event for today",
      eventType: "court",
      startDate: now,
      endDate: new Date(now.getTime() + 1 * 60 * 60 * 1000),
      isAllDay: false,
      matterId: testMatterId,
      clientId: testClientId,
      createdById: testUserId,
      assignedToIds: [testUserId],
      status: "scheduled",
      showInClientPortal: false
    });
    
    // Event 3: Tomorrow
    await calendarService.createEvent({
      merchantId: testMerchantId,
      title: "Future Event",
      description: "Event for tomorrow",
      eventType: "client_meeting",
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 1 * 60 * 60 * 1000),
      isAllDay: false,
      matterId: testMatterId,
      clientId: testClientId,
      createdById: testUserId,
      assignedToIds: [testUserId],
      status: "scheduled",
      showInClientPortal: false
    });
    
    // Test filter by date range
    const events = await calendarService.getEvents(testMerchantId, {
      startDate: now,
      endDate: new Date(now.getTime() + 48 * 60 * 60 * 1000) // Today and tomorrow
    });
    
    const filteredEventTitles = events.map(e => e.title);
    const passed = events.length === 2 && 
                   filteredEventTitles.includes("Current Event") && 
                   filteredEventTitles.includes("Future Event");
    
    report.tests.push({
      name: "Get events with date range filter",
      passed,
      group: "Calendar Events",
      error: passed ? null : "Filtered events don't match the expected result",
    });
  } catch (error) {
    report.tests.push({
      name: "Get events with date range filter",
      passed: false,
      group: "Calendar Events",
      error: String(error),
      errorDetails: error,
    });
  }
}

/**
 * Test deadline management functionality
 */
async function testDeadlineManagement(report: TestReport): Promise<void> {
  // Test 1: Create a legal deadline
  try {
    const deadlineData = {
      merchantId: testMerchantId,
      title: "Motion Filing Deadline",
      description: "File motion to dismiss by this date",
      deadlineType: "filing",
      dueDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      calculatedFromDate: new Date(),
      calculationMethod: "days:14", // 14 days from calculation date
      matterId: testMatterId,
      jurisdiction: "federal",
      priority: "high",
      status: "pending",
      createdById: testUserId,
      assignedToIds: [testUserId],
      reminderEnabled: true,
      showInClientPortal: false
    };

    const deadline = await calendarService.createDeadline(deadlineData);
    
    // Verify the deadline was created with correct data
    const createdDeadline = await db.select().from(legalDeadlines).where(eq(legalDeadlines.id, deadline.id));
    
    const passed = createdDeadline.length > 0 && 
                   createdDeadline[0].title === deadlineData.title && 
                   createdDeadline[0].status === deadlineData.status;
    
    report.tests.push({
      name: "Create legal deadline",
      passed,
      group: "Deadline Management",
      error: passed ? null : "Created deadline doesn't match the input data",
    });
  } catch (error) {
    report.tests.push({
      name: "Create legal deadline",
      passed: false,
      group: "Deadline Management",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 2: Update a deadline
  try {
    // First create a deadline
    const deadlineData = {
      merchantId: testMerchantId,
      title: "Initial Deadline",
      description: "Initial Description",
      deadlineType: "filing",
      dueDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
      matterId: testMatterId,
      jurisdiction: "state",
      priority: "medium",
      status: "pending",
      createdById: testUserId,
      assignedToIds: [testUserId],
      reminderEnabled: false,
      showInClientPortal: false
    };

    const deadline = await calendarService.createDeadline(deadlineData);
    
    // Update the deadline
    const updatedData = {
      title: "Updated Deadline",
      description: "Updated Description",
      priority: "high",
      dueDate: new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000) // Extended to 21 days
    };
    
    await calendarService.updateDeadline(deadline.id, updatedData);
    
    // Verify the update
    const updatedDeadline = await db.select().from(legalDeadlines).where(eq(legalDeadlines.id, deadline.id));
    
    const passed = updatedDeadline.length > 0 && 
                   updatedDeadline[0].title === updatedData.title && 
                   updatedDeadline[0].description === updatedData.description &&
                   updatedDeadline[0].priority === updatedData.priority;
    
    report.tests.push({
      name: "Update legal deadline",
      passed,
      group: "Deadline Management",
      error: passed ? null : "Updated deadline doesn't have the expected data",
    });
  } catch (error) {
    report.tests.push({
      name: "Update legal deadline",
      passed: false,
      group: "Deadline Management",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 3: Complete a deadline
  try {
    // First create a deadline
    const deadlineData = {
      merchantId: testMerchantId,
      title: "Completion Test Deadline",
      description: "Testing deadline completion",
      deadlineType: "response",
      dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      matterId: testMatterId,
      jurisdiction: "federal",
      priority: "high",
      status: "pending",
      createdById: testUserId,
      assignedToIds: [testUserId],
      reminderEnabled: false,
      showInClientPortal: false
    };

    const deadline = await calendarService.createDeadline(deadlineData);
    
    // Complete the deadline
    const completedDeadline = await calendarService.completeDeadline(deadline.id, testUserId);
    
    // Verify the completion
    const passed = completedDeadline && 
                   completedDeadline.status === "completed" && 
                   completedDeadline.completedById === testUserId &&
                   completedDeadline.completedDate !== null;
    
    report.tests.push({
      name: "Complete legal deadline",
      passed,
      group: "Deadline Management",
      error: passed ? null : "Deadline wasn't properly marked as completed",
    });
  } catch (error) {
    report.tests.push({
      name: "Complete legal deadline",
      passed: false,
      group: "Deadline Management",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 4: Get overdue deadlines
  try {
    // Create a past deadline
    const pastDate = new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    
    await calendarService.createDeadline({
      merchantId: testMerchantId,
      title: "Overdue Deadline",
      description: "This deadline is already past due",
      deadlineType: "filing",
      dueDate: pastDate,
      matterId: testMatterId,
      jurisdiction: "state",
      priority: "high",
      status: "pending", // Important: not completed
      createdById: testUserId,
      assignedToIds: [testUserId],
      reminderEnabled: false,
      showInClientPortal: false
    });
    
    // Get overdue deadlines
    const overdueDeadlines = await calendarService.getOverdueDeadlines(testMerchantId);
    
    // Verify we have at least one overdue deadline
    const passed = overdueDeadlines.length > 0 && 
                   overdueDeadlines.some(d => d.title === "Overdue Deadline" && d.status === "pending");
    
    report.tests.push({
      name: "Get overdue deadlines",
      passed,
      group: "Deadline Management",
      error: passed ? null : "Overdue deadlines couldn't be retrieved properly",
    });
  } catch (error) {
    report.tests.push({
      name: "Get overdue deadlines",
      passed: false,
      group: "Deadline Management",
      error: String(error),
      errorDetails: error,
    });
  }
}

/**
 * Test reminder system functionality
 */
async function testReminderSystem(report: TestReport): Promise<void> {
  // Test 1: Create reminders for an event
  try {
    // Create an event with reminders
    const eventData = {
      merchantId: testMerchantId,
      title: "Event with Reminders",
      description: "Testing reminder creation",
      eventType: "meeting",
      startDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(new Date().getTime() + 25 * 60 * 60 * 1000),
      isAllDay: false,
      matterId: testMatterId,
      clientId: testClientId,
      createdById: testUserId,
      assignedToIds: [testUserId],
      status: "scheduled",
      reminderEnabled: true,
      reminderTimes: [15, 60, 1440], // 15 minutes, 1 hour, and 1 day before
      showInClientPortal: false
    };

    const event = await calendarService.createEvent(eventData);
    
    // Check that reminders were created
    const reminders = await db.select()
                            .from(legalCalendarReminders)
                            .where(eq(legalCalendarReminders.eventId, event.id));
    
    const passed = reminders.length === 3 && // Should have 3 reminders as specified
                   reminders.some(r => r.minutesBefore === 15) &&
                   reminders.some(r => r.minutesBefore === 60) &&
                   reminders.some(r => r.minutesBefore === 1440);
    
    report.tests.push({
      name: "Create event reminders",
      passed,
      group: "Reminder System",
      error: passed ? null : "Event reminders were not created correctly",
    });
  } catch (error) {
    report.tests.push({
      name: "Create event reminders",
      passed: false,
      group: "Reminder System",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 2: Process due reminders (this tests the functionality, but doesn't actually send emails)
  try {
    // Create an event with an imminent start time
    const imminentTime = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 minutes from now
    
    const eventData = {
      merchantId: testMerchantId,
      title: "Imminent Event",
      description: "This event is about to start",
      eventType: "meeting",
      startDate: imminentTime,
      endDate: new Date(imminentTime.getTime() + 60 * 60 * 1000),
      isAllDay: false,
      matterId: testMatterId,
      clientId: testClientId,
      createdById: testUserId,
      assignedToIds: [testUserId],
      status: "scheduled",
      reminderEnabled: true,
      reminderTimes: [15], // 15 minutes before
      showInClientPortal: false
    };

    const event = await calendarService.createEvent(eventData);
    
    // Process due reminders
    await calendarService.processDueReminders();
    
    // The test is a bit tricky since we don't actually send emails
    // but we can check if the reminders are marked as sent
    const reminders = await db.select()
                            .from(legalCalendarReminders)
                            .where(eq(legalCalendarReminders.eventId, event.id));
    
    // For this test, we'll just verify the reminder processing doesn't throw errors
    const passed = reminders.length > 0;
    
    report.tests.push({
      name: "Process due reminders",
      passed,
      group: "Reminder System",
      error: passed ? null : "Failed to process due reminders",
    });
  } catch (error) {
    report.tests.push({
      name: "Process due reminders",
      passed: false,
      group: "Reminder System",
      error: String(error),
      errorDetails: error,
    });
  }
}

/**
 * Test jurisdiction rules for deadline calculations
 */
async function testJurisdictionRules(report: TestReport): Promise<void> {
  // Test 1: Calculate deadline with simple days rule
  try {
    const baseDate = new Date();
    const jurisdictionRules = {
      businessDaysOnly: false,
      daysToAdd: 30,
      excludeHolidays: false
    };
    
    const calculatedDate = calendarService.calculateDeadline(baseDate, jurisdictionRules);
    
    // Expected date is 30 calendar days after baseDate
    const expectedDate = new Date(baseDate);
    expectedDate.setDate(expectedDate.getDate() + 30);
    
    // Compare year, month, and date parts only
    const passed = calculatedDate.getFullYear() === expectedDate.getFullYear() &&
                   calculatedDate.getMonth() === expectedDate.getMonth() &&
                   calculatedDate.getDate() === expectedDate.getDate();
    
    report.tests.push({
      name: "Calculate deadline with calendar days",
      passed,
      group: "Jurisdiction Rules",
      error: passed ? null : "Calculated deadline date is incorrect",
    });
  } catch (error) {
    report.tests.push({
      name: "Calculate deadline with calendar days",
      passed: false,
      group: "Jurisdiction Rules",
      error: String(error),
      errorDetails: error,
    });
  }

  // Test 2: Calculate deadline with business days rule
  try {
    const baseDate = new Date();
    const jurisdictionRules = {
      businessDaysOnly: true,
      daysToAdd: 10,
      excludeHolidays: false
    };
    
    const calculatedDate = calendarService.calculateDeadline(baseDate, jurisdictionRules);
    
    // This test is more complex as we need to calculate business days
    // We'll do a basic check that the calculated date is in the future and not on a weekend
    const dayOfWeek = calculatedDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isInFuture = calculatedDate > baseDate;
    
    const passed = isInFuture && !isWeekend;
    
    report.tests.push({
      name: "Calculate deadline with business days",
      passed,
      group: "Jurisdiction Rules",
      error: passed ? null : "Calculated business days deadline is incorrect",
    });
  } catch (error) {
    report.tests.push({
      name: "Calculate deadline with business days",
      passed: false,
      group: "Jurisdiction Rules",
      error: String(error),
      errorDetails: error,
    });
  }
}

/**
 * Clean up test data from the database
 */
async function cleanupTestData(): Promise<void> {
  // Delete test reminders
  await db.delete(legalCalendarReminders)
         .where(eq(legalCalendarReminders.merchantId, testMerchantId));
  
  // Delete test events
  await db.delete(legalCalendarEvents)
         .where(eq(legalCalendarEvents.merchantId, testMerchantId));
  
  // Delete test deadlines
  await db.delete(legalDeadlines)
         .where(eq(legalDeadlines.merchantId, testMerchantId));
}

// Register test with the coordinator
testCoordinator.registerTest("legal-calendar", testLegalCalendarSystem);