import Dexie, { Table } from 'dexie';

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

export class OfflineDB extends Dexie {
  transactions!: Table<Transaction>;

  constructor() {
    super('PaySurityOffline');
    this.version(1).stores({
      transactions: '++id, externalId, status, organizationId, serviceType, createdAt',
    });
  }

  async addOfflineTransaction(data: Omit<Transaction, 'id' | 'status' | 'createdAt' | 'timezone'>) {
    return await this.transactions.add({
      ...data,
      status: 'pending',
      createdAt: new Date(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }
}

export const db = new OfflineDB();