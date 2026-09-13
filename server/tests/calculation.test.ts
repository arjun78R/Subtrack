import { CalculationService } from '../src/services/calculation.service';

describe('CalculationService - Business Logic & Normalization Tests', () => {
  describe('getMonthlyEquivalent', () => {
    it('should normalize Weekly cost: (cost * 52) / 12', () => {
      // 100 * 52 / 12 = 433.3333...
      const result = CalculationService.getMonthlyEquivalent(100, 'Weekly');
      expect(Math.round(result * 100) / 100).toBe(433.33);
    });

    it('should return exact cost for Monthly cycle', () => {
      const result = CalculationService.getMonthlyEquivalent(649, 'Monthly');
      expect(result).toBe(649);
    });

    it('should normalize Quarterly cost: cost / 3', () => {
      const result = CalculationService.getMonthlyEquivalent(600, 'Quarterly');
      expect(result).toBe(200);
    });

    it('should normalize Half-Yearly cost: cost / 6', () => {
      const result = CalculationService.getMonthlyEquivalent(1200, 'Half-Yearly');
      expect(result).toBe(200);
    });

    it('should normalize Yearly cost: cost / 12', () => {
      const result = CalculationService.getMonthlyEquivalent(1200, 'Yearly');
      expect(result).toBe(100);
    });

    it('should handle zero or negative cost gracefully', () => {
      expect(CalculationService.getMonthlyEquivalent(0, 'Monthly')).toBe(0);
      expect(CalculationService.getMonthlyEquivalent(-50, 'Monthly')).toBe(0);
    });
  });

  describe('getAnnualEquivalent', () => {
    it('should multiply monthly equivalent by 12', () => {
      const monthlyResult = CalculationService.getAnnualEquivalent(500, 'Monthly');
      expect(monthlyResult).toBe(6000);

      const quarterlyResult = CalculationService.getAnnualEquivalent(600, 'Quarterly');
      // monthly is 200 -> annual is 2400
      expect(quarterlyResult).toBe(2400);
    });
  });

  describe('evaluateUsageStatus (Rule-Based Inactivity Engine)', () => {
    const today = new Date('2026-09-15T12:00:00Z');

    it('should flag as "Never Used" when lastUsedDate is null and creation is old', () => {
      const createdDate = new Date('2026-07-01T12:00:00Z'); // > 30 days ago
      const evalResult = CalculationService.evaluateUsageStatus(null, createdDate, 30, today);

      expect(evalResult.status).toBe('Never Used');
      expect(evalResult.isUnusedFlagged).toBe(true);
      expect(evalResult.daysSinceLastUsed).toBeNull();
    });

    it('should flag as "Not Used Recently" when days since last used exceed threshold', () => {
      const lastUsed = new Date('2026-08-01T12:00:00Z'); // 45 days ago
      const createdDate = new Date('2026-01-01T12:00:00Z');

      const evalResult = CalculationService.evaluateUsageStatus(lastUsed, createdDate, 30, today);

      expect(evalResult.status).toBe('Not Used Recently');
      expect(evalResult.isUnusedFlagged).toBe(true);
      expect(evalResult.daysSinceLastUsed).toBe(45);
    });

    it('should evaluate as "Used Recently" when within threshold', () => {
      const lastUsed = new Date('2026-09-10T12:00:00Z'); // 5 days ago
      const createdDate = new Date('2026-01-01T12:00:00Z');

      const evalResult = CalculationService.evaluateUsageStatus(lastUsed, createdDate, 30, today);

      expect(evalResult.status).toBe('Used Recently');
      expect(evalResult.isUnusedFlagged).toBe(false);
      expect(evalResult.daysSinceLastUsed).toBe(5);
    });
  });
});
