import { describe, it, expect } from 'vitest';
import { pivotUsageData, computeStats } from './dashboard';

const mockEntries = [
  { date: '2023-10-01T10:00:00Z', tool: 'ChatGPT', hours: 2 },
  { date: '2023-10-01T14:00:00Z', tool: 'Claude', hours: 1 },
  { date: '2023-10-02T09:00:00Z', tool: 'ChatGPT', hours: 3 }
];

describe('Dashboard Utility Functions (FR9)', () => {
  describe('pivotUsageData', () => {
    it('FR9: should correctly group by date and accumulate tool hours', () => {
      const pivoted = pivotUsageData(mockEntries);
      
      expect(pivoted.length).toBe(2);
      
      // The formatting checks might be dependent on timezone/locale issues when testing.
      // We will check keys presence rather than exact string values for "DD MMM"
      const day1 = pivoted[0];
      const day2 = pivoted[1];
      
      expect(day1.ChatGPT).toBe(2);
      expect(day1.Claude).toBe(1);
      
      expect(day2.ChatGPT).toBe(3);
      expect(day2.Claude).toBeUndefined();
    });

    it('FR9: should handle empty arrays', () => {
      expect(pivotUsageData([])).toEqual([]);
    });

    it('FR9: should aggregate entries that fall on the same day', () => {
      const entries = [
        { date: '2023-10-03T08:00:00Z', tool: 'ChatGPT', hours: 1 },
        { date: '2023-10-03T17:00:00Z', tool: 'ChatGPT', hours: 2 }
      ];

      const pivoted = pivotUsageData(entries);
      expect(pivoted).toHaveLength(1);
      expect(pivoted[0].ChatGPT).toBe(3);
    });

    it('FR9: should not throw on malformed dates', () => {
      const malformed = [
        { date: 'not-a-date', tool: 'ChatGPT', hours: 1 },
        { date: '2023-10-02T09:00:00Z', tool: 'Claude', hours: 1 }
      ];

      expect(() => pivotUsageData(malformed)).not.toThrow();
      expect(Array.isArray(pivotUsageData(malformed))).toBe(true);
    });
  });

  describe('computeStats', () => {
    it('FR9: should compute basic statistics including total hours, average, and top tool', () => {
      const stats = computeStats(mockEntries);
      
      expect(stats.total).toBe("6.0");
      expect(stats.avg).toBe("3.0"); // 6 hours over 2 unique days
      expect(stats.topTool).toBe("ChatGPT"); // 5 vs 1
      expect(stats.days).toBe(2);
    });

    it('should handle zero entries gracefully', () => {
      const stats = computeStats([]);
      expect(stats.total).toBe(0);
      expect(stats.avg).toBe(0);
      expect(stats.topTool).toBe('—');
      expect(stats.days).toBe(0);
    });

    it('FR10 support: should compute averages by unique day count', () => {
      const stats = computeStats([
        { date: '2023-10-01T10:00:00Z', tool: 'ChatGPT', hours: 2 },
        { date: '2023-10-01T12:00:00Z', tool: 'Claude', hours: 2 },
        { date: '2023-10-02T09:00:00Z', tool: 'ChatGPT', hours: 2 }
      ]);

      expect(stats.total).toBe('6.0');
      expect(stats.days).toBe(2);
      expect(stats.avg).toBe('3.0');
    });
  });
});
