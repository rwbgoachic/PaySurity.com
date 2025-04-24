import { FraudDetection } from '../lib/fraud';
import { supabase } from '../lib/supabase';
import Decimal from 'decimal.js';

describe('Risk Detection System', () => {
  // Mock transaction data
  const normalTransaction = {
    id: 'test-transaction-1',
    amount: new Decimal('100.0000'),
    organizationId: 'test-org-id',
    serviceType: 'pos',
    createdAt: new Date()
  };

  const anomalousTransaction = {
    id: 'test-transaction-2',
    amount: new Decimal('5000.0000'), // Much higher than normal
    organizationId: 'test-org-id',
    serviceType: 'pos',
    createdAt: new Date()
  };

  beforeEach(() => {
    // Reset all mocks
    jest.resetAllMocks();
    
    // Mock the Supabase client with proper method chaining
    jest.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'transaction_stats') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              mean_amount: '100.0000',
              std_dev: '20.0000'
            },
            error: null
          })
        } as any;
      }
      
      if (table === 'fraud_alerts') {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-alert-id' },
            error: null
          })
        } as any;
      }
      
      if (table === 'transactions') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              organization_id: 'test-org-id'
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
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('detectAnomalies', () => {
    it('should not flag normal transactions', async () => {
      const result = await FraudDetection.detectAnomalies(normalTransaction);
      expect(result).toBe(false);
    });

    it('should flag transactions with amounts significantly above the mean', async () => {
      const result = await FraudDetection.detectAnomalies(anomalousTransaction);
      expect(result).toBe(true);
    });
  });

  describe('flagTransaction', () => {
    it('should create a fraud alert for flagged transactions', async () => {
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'test-alert-id' },
          error: null
        })
      });

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
        
        if (table === 'transactions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { organization_id: 'test-org-id' },
              error: null
            })
          } as any;
        }
        
        return {} as any;
      });

      await FraudDetection.flagTransaction(
        anomalousTransaction.id,
        'Amount exceeds threshold'
      );

      expect(insertMock).toHaveBeenCalledWith({
        transaction_id: anomalousTransaction.id,
        organization_id: 'test-org-id',
        reason: 'Amount exceeds threshold'
      });
    });
  });
});