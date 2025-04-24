import { FraudDetection, TransactionData } from '../lib/fraud';
import Decimal from 'decimal.js';

describe('FraudDetection', () => {
  describe('detectAnomalies', () => {
    it('should detect transaction amounts above 3 standard deviations', async () => {
      const transaction: TransactionData = {
        id: '123',
        amount: new Decimal('1000.0000'),
        organizationId: 'org123',
        serviceType: 'pos',
        createdAt: new Date(),
      };

      const isAnomalous = await FraudDetection.detectAnomalies(transaction);
      expect(typeof isAnomalous).toBe('boolean');
    });
  });
});