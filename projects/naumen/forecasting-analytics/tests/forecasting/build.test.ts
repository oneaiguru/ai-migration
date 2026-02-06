import { describe, expect, it } from 'vitest';
import { fetchForecastBuildOptions, createTemplateExport } from '../../src/services/forecastingApi';
import { collectAllLeafIds, collectLeafIdsForNode } from '../../src/components/forecasting/shared/QueueSelector';
import { queueTree } from '../../src/data/forecastingFixtures';

describe('forecast build options', () => {
  it('collects leaf queues for a parent branch', () => {
    const leaves = collectLeafIdsForNode(queueTree, 'support');
    expect(leaves).toEqual(expect.arrayContaining(['support-l1', 'support-l2']));
  });

  it('returns defaults with forecast windows and leaf queue ids', async () => {
    const options = await fetchForecastBuildOptions();
    expect(options.forecastWindows.length).toBeGreaterThan(0);
    const leafIds = new Set(collectAllLeafIds(queueTree));
    expect(options.defaults.queueIds.length).toBeGreaterThan(0);
    options.defaults.queueIds.forEach((id) => {
      expect(leafIds.has(id)).toBe(true);
    });
    expect(typeof options.defaults.historyStart).toBe('string');
    expect(typeof options.defaults.historyEnd).toBe('string');
    expect(typeof options.defaults.buildPeriodStart).toBe('string');
    expect(typeof options.defaults.buildPeriodEnd).toBe('string');
  });

  it('adds timezone metadata to template exports', () => {
    const now = new Date().toISOString();
    const result = createTemplateExport('forecast', ['support-l1'], { start: now, end: now }, { timezoneId: 'asia-yekaterinburg' });
    expect(result.content.startsWith('# timezone=')).toBe(true);
    expect(result.filename).toContain('UTC+05');
  });
});
