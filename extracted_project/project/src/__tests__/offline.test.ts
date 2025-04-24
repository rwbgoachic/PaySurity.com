import { syncManager } from '../lib/sync';
import { db } from '../lib/db';
import { supabase } from '../lib/supabase';
import Decimal from 'decimal.js';

// Mock IndexedDB
require('fake-indexeddb/auto');

// Mock localStorage with complete Storage interface
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: (index: number) => null,
  removeItem: jest.fn(),
} as Storage;

global.localStorage = localStorageMock;

// Mock Intl.DateTimeFormat
const mockDateTimeFormat = {
  resolvedOptions: () => ({
    locale: 'en-US',
    calendar: 'gregory',
    numberingSystem: 'latn',
    timeZone: 'America/New_York'
  })
};

jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => mockDateTimeFormat as unknown as Intl.DateTimeFormat);

describe('Offline Transaction Handling', () => {
  beforeEach(() => {
    // Clear IndexedDB
    db.transactions.clear();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock online status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  describe('Transaction Creation', () => {
    it('should store transaction locally when offline', async () => {
      // Set offline
      Object.defineProperty(navigator, 'onLine', { value: false });

      const transaction = {
        organizationId: 'test-org',
        serviceType: 'pos',
        amount: '100.0000'
      };

      const id = await syncManager.addTransaction(transaction);
      
      // Verify stored in IndexedDB
      const stored = await db.transactions.get(parseInt(id));
      expect(stored).toBeTruthy();
      expect(stored?.status).toBe('pending');
      expect(stored?.amount).toBe(transaction.amount);
      expect(stored?.timezone).toBe('America/New_York');
    });

    it('should sync transaction with timezone when back online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false });

      const transaction = {
        organizationId: 'test-org',
        serviceType: 'pos',
        amount: '100.0000'
      };

      await syncManager.addTransaction(transaction);

      // Mock Supabase response
      const mockInsert = jest.fn().mockResolvedValue({
        data: { id: 'remote-id' },
        error: null
      });
      jest.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: mockInsert,
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'remote-id' },
          error: null
        })
      } as any));

      // Go online and sync
      Object.defineProperty(navigator, 'onLine', { value: true });
      await syncManager.sync();

      // Verify synced to server with timezone
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          timezone: 'America/New_York'
        })
      );
      
      // Verify local status updated
      const stored = await db.transactions.toArray();
      expect(stored[0].status).toBe('synced');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid data', async () => {
      const invalidTransaction = {
        organizationId: 'test-org',
        serviceType: 'pos',
        amount: 'invalid'
      };

      // Attempt to add invalid transaction
      await expect(syncManager.addTransaction(invalidTransaction))
        .rejects.toThrow();

      // Verify nothing stored
      const stored = await db.transactions.toArray();
      expect(stored.length).toBe(0);
    });

    it('should handle network timeouts', async () => {
      const transaction = {
        organizationId: 'test-org',
        serviceType: 'pos',
        amount: '100.0000'
      };

      await db.transactions.add({
        ...transaction,
        status: 'pending',
        timezone: 'America/New_York',
        createdAt: new Date()
      });

      // Mock timeout
      jest.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: jest.fn().mockRejectedValue(new Error('Network timeout')),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Network timeout'))
      } as any));

      // Sync
      await syncManager.sync();

      // Verify transaction still pending
      const stored = await db.transactions.get(1);
      expect(stored?.status).toBe('pending');
    });
  });
});