
import { expect } from 'chai';
import { storage } from '../server/storage';
import { sendEmail } from '../server/utils/email';

describe('Demo Scheduling System', () => {
  const testDemo = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '1234567890',
    companyName: 'Test Company',
    industry: 'Technology',
    message: 'Test demo request',
    appointmentDate: new Date(),
    appointmentTime: '14:00',
    status: 'scheduled'
  };

  let sentEmails: any[] = [];

  before(() => {
    // Mock email sending
    const originalSendEmail = sendEmail;
    global.sendEmail = async (options: any) => {
      sentEmails.push(options);
      return true;
    };
  });

  beforeEach(() => {
    sentEmails = [];
  });

  after(() => {
    // Restore original email function
    global.sendEmail = sendEmail;
  });

  it('should create a demo request and send notifications', async () => {
    // Create demo request
    const demoRequest = await storage.createDemoRequest(testDemo);
    
    expect(demoRequest).to.exist;
    expect(demoRequest.email).to.equal(testDemo.email);
    
    // Verify emails were sent
    expect(sentEmails.length).to.equal(2);
    
    // Verify user email
    const userEmail = sentEmails.find(e => e.to === testDemo.email);
    expect(userEmail).to.exist;
    expect(userEmail.subject).to.include('Demo Confirmation');
    
    // Verify admin email
    const adminEmail = sentEmails.find(e => e.to === process.env.ADMIN_EMAIL);
    expect(adminEmail).to.exist;
    expect(adminEmail.subject).to.include('[Admin] New Demo Request');
    
    // Verify dashboard entry
    const dashboardEntry = await storage.getDemoRequest(demoRequest.id);
    expect(dashboardEntry).to.exist;
    expect(dashboardEntry.status).to.equal('scheduled');
  });
});
