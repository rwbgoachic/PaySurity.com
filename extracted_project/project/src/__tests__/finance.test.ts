import { CashflowManager } from '../lib/finance';
import Decimal from 'decimal.js';

describe('CashflowManager', () => {
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
});