import { describe, expect, it } from 'vitest';
import { exportExceptionsCsv } from '../../src/services/forecastingApi';
import { exceptionTemplates } from '../../src/data/forecastingFixtures';

describe('exportExceptionsCsv', () => {
  it('serialises intervals with queue id and smoothing info', () => {
    const template = exceptionTemplates[0];
    const payload = exportExceptionsCsv({
      templateId: template.id,
      queueId: 'support',
      historyDays: template.historyHorizon,
      historyStart: '2025-09-01T00:00:00.000Z',
      historyEnd: '2025-10-01T00:00:00.000Z',
      buildStart: '2025-10-01T00:00:00.000Z',
      buildEnd: '2025-10-07T00:00:00.000Z',
    });
    expect(payload.content).toContain(template.id);
    expect(payload.content).toContain('support');
    const hasSmoothing = template.intervals.some((interval) => interval.smoothing != null);
    if (hasSmoothing) {
      expect(payload.content).toMatch(/smoothing/);
    }
    expect(payload.content).toContain('2025-09-01');
    expect(payload.content).toContain('2025-10-07');
  });
});
