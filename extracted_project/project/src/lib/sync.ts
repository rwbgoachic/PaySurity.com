import { db } from './db';
import { supabase } from './supabase';
import Decimal from 'decimal.js';

export interface Transaction {
  id?: number;
  externalId?: string;
  organizationId: string;
  serviceType: string;
  amount: string;
  status: 'pending' | 'synced' | 'error';
  createdAt: Date;
  timezone: string;
  syncedAt?: Date;
}

export class SyncManager {
  private syncInterval: number = 30000; // 30 seconds
  private intervalId?: number;
  private isOnline: boolean = navigator.onLine;

  start() {
    // Initial sync
    this.sync();

    // Set up periodic sync
    this.intervalId = window.setInterval(() => {
      this.sync();
    }, this.syncInterval);

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.sync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }

  async addTransaction(data: {
    organizationId: string;
    serviceType: string;
    amount: string;
  }): Promise<string> {
    // Validate amount format
    try {
      new Decimal(data.amount);
    } catch {
      throw new Error('Invalid amount format');
    }

    // Add to local DB with timezone info
    const id = await db.transactions.add({
      ...data,
      status: 'pending',
      createdAt: new Date(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    // If online, sync immediately
    if (this.isOnline) {
      await this.sync();
    }

    return id.toString();
  }

  private async sync() {
    if (!this.isOnline) return;

    try {
      const pendingTransactions = await db.transactions
        .where('status')
        .equals('pending')
        .toArray();

      for (const transaction of pendingTransactions) {
        try {
          // Create transaction with timezone info
          const { data, error } = await supabase
            .from('transactions')
            .insert({
              organization_id: transaction.organizationId,
              service_type: transaction.serviceType,
              amount: transaction.amount,
              created_at: transaction.createdAt.toISOString(),
              timezone: transaction.timezone
            })
            .select()
            .single();

          if (error) throw error;

          // Update local record
          await db.transactions.update(transaction.id!, {
            status: 'synced',
            externalId: data.id,
            syncedAt: new Date(),
          });
        } catch (error) {
          console.error('Transaction sync failed:', error);
          await db.transactions.update(transaction.id!, {
            status: 'error',
          });
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// Create a singleton instance
export const syncManager = new SyncManager();