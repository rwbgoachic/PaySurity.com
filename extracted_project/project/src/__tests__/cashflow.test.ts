import { CashflowManager } from '../lib/finance';
import { supabase } from '../lib/supabase';
import Decimal from 'decimal.js';

describe('Cashflow Monitoring System', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.resetAllMocks();
    
    // Mock the Supabase client with proper method chaining
    jest.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'cashflow_alerts') {
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'test-alert-id' },
              error: null
            })
          }),
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
      
      if (table === 'service_logs') {
        return {
          insert: jest.fn().mockResolvedValue({
            data: { id: 'test-log-id' },
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

  describe('calculateThreshold', () => {
    it('should calculate threshold with 4 decimal places', () => {
      const monthlyPayouts = 30000;
      const monthlyFees = 1000;
      
      const threshold = CashflowManager.calculateThreshold(monthlyPayouts, monthlyFees);
      
      expect(threshold instanceof Decimal).toBe(true);
      expect(threshold.toFixed(4)).toMatch(/^\d+\.\d{4}$/);
    });

    it('should calculate 3 days of operational buffer', () => {
      const monthlyPayouts = 30000; // $30,000 per month
      const monthlyFees = 1000; // $1,000 per month
      
      const threshold = CashflowManager.calculateThreshold(monthlyPayouts, monthlyFees);
      
      // Expected: (30000 + 1000) / 30 * 3 = 3100
      expect(threshold.equals(new Decimal('3100.0000'))).toBe(true);
    });
  });

  describe('checkCashflowThreshold', () => {
    it('should create alert when value is below threshold', async () => {
      const organizationId = 'test-org';
      const currentValue = new Decimal('1000.0000');
      const threshold = new Decimal('2000.0000');

      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'test-alert-id' },
          error: null
        })
      });

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
        
        if (table === 'service_logs') {
          return {
            insert: jest.fn().mockResolvedValue({
              data: { id: 'test-log-id' },
              error: null
            })
          } as any;
        }
        
        return {} as any;
      });

      await CashflowManager.checkCashflowThreshold(
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

    it('should not create alert when value is above threshold', async () => {
      const organizationId = 'test-org';
      const currentValue = new Decimal('3000.0000');
      const threshold = new Decimal('2000.0000');

      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'test-alert-id' },
          error: null
        })
      });

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
        return {} as any;
      });

      await CashflowManager.checkCashflowThreshold(
        organizationId,
        currentValue,
        threshold
      );

      expect(insertMock).not.toHaveBeenCalled();
    });
  });
});