import { AlertManager } from '../lib/alerts';
import { supabase } from '../lib/supabase';
import Decimal from 'decimal.js';

describe('Alert Management System', () => {
  beforeEach(() => {
    // Mock the Supabase client
    jest.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'cashflow_alerts' || table === 'fraud_alerts') {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-alert-id' },
            error: null
          })
        } as any;
      }
      
      if (table === 'organizations') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { 
              alert_email: 'test@example.com',
              name: 'Test Organization'
            },
            error: null
          })
        } as any;
      }
      
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      } as any;
    });

    // Mock the functions invoke method
    jest.spyOn(supabase.functions, 'invoke').mockResolvedValue({ data: {}, error: null });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkCashflowThreshold', () => {
    it('should create alert when value is below threshold', async () => {
      const organizationId = 'test-org';
      const currentValue = new Decimal('1000.0000');
      const threshold = new Decimal('2000.0000');

      const insertMock = jest.fn().mockReturnThis();
      jest.spyOn(supabase, 'from').mockImplementation((table) => {
        if (table === 'cashflow_alerts') {
          return {
            insert: insertMock,
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'test-alert-id' },
              error: null
            })
          } as any;
        }
        
        if (table === 'organizations') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { 
                alert_email: 'test@example.com',
                name: 'Test Organization'
              },
              error: null
            })
          } as any;
        }
        
        return {} as any;
      });

      await AlertManager.checkCashflowThreshold(
        organizationId,
        currentValue,
        threshold
      );

      expect(insertMock).toHaveBeenCalledWith({
        organization_id: organizationId,
        alert_type: 'THRESHOLD_BREACH',
        threshold: '2000.0000',
        current_value: '1000.0000'
      });
    });
  });

  describe('flagFraudulentTransaction', () => {
    it('should create fraud alert with correct data', async () => {
      const organizationId = 'test-org';
      const transactionId = 'test-transaction';
      const reason = 'Amount exceeds 3σ threshold';

      const insertMock = jest.fn().mockReturnThis();
      jest.spyOn(supabase, 'from').mockImplementation((table) => {
        if (table === 'fraud_alerts') {
          return {
            insert: insertMock,
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'test-alert-id' },
              error: null
            })
          } as any;
        }
        
        if (table === 'organizations') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { 
                alert_email: 'test@example.com',
                name: 'Test Organization'
              },
              error: null
            })
          } as any;
        }
        
        return {} as any;
      });

      await AlertManager.flagFraudulentTransaction(
        organizationId,
        transactionId,
        reason
      );

      expect(insertMock).toHaveBeenCalledWith({
        organization_id: organizationId,
        transaction_id: transactionId,
        reason
      });
    });

    it('should send email notification if alert_email is set', async () => {
      const organizationId = 'test-org';
      const transactionId = 'test-transaction';
      const reason = 'Amount exceeds 3σ threshold';

      const invokeMock = jest.fn().mockResolvedValue({ data: {}, error: null });
      jest.spyOn(supabase.functions, 'invoke').mockImplementation(invokeMock);

      await AlertManager.flagFraudulentTransaction(
        organizationId,
        transactionId,
        reason
      );

      expect(invokeMock).toHaveBeenCalled();
    });
  });
});