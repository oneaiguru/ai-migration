import { describe, it, expect } from 'vitest';
import {
  listOrganisationQueues,
  createDefaultHorizons,
  buildHorizon,
  buildForecastSummary,
  listAbsenteeismRuns,
  generateTrendTables,
  generateAccuracyTable,
  createReportDownloadNotice,
} from '../data';

describe('Queue Tree', () => {
  it('returns cloned queue nodes', () => {
    const q1 = listOrganisationQueues();
    const q2 = listOrganisationQueues();
    expect(q1).not.toBe(q2);
    expect(q1).toEqual(q2);
  });

  it('includes favourites at root level', () => {
    const queues = listOrganisationQueues();
    expect(queues.find(q => q.favourite)).toBeDefined();
  });

  it('has correct hierarchy structure', () => {
    const queues = listOrganisationQueues();
    expect(queues).toHaveLength(3);
    expect(queues[0].label).toBe('Контакт-центр 1010.ru');
    expect(queues[0].children).toBeDefined();
    expect(queues[0].children?.length).toBeGreaterThan(0);
  });

  it('includes skills count for queues', () => {
    const queues = listOrganisationQueues();
    const allQueues = flattenQueues(queues);
    const queueWithSkills = allQueues.find(q => q.type === 'queue' && q.skills);
    expect(queueWithSkills?.skills).toBeDefined();
    expect(queueWithSkills?.skills).toBeGreaterThan(0);
  });
});

describe('Horizons', () => {
  it('creates default baseline and promo', () => {
    const horizons = createDefaultHorizons();
    expect(horizons).toHaveLength(2);
    expect(horizons[0].id).toBe('baseline');
    expect(horizons[0].label).toBe('Базовый');
    expect(horizons[1].id).toBe('promo');
    expect(horizons[1].label).toBe('Промо-период');
  });

  it('baseline horizon has 8 weeks history and projection', () => {
    const horizons = createDefaultHorizons();
    const baseline = horizons.find(h => h.id === 'baseline');
    expect(baseline?.historyWeeks).toBe(8);
    expect(baseline?.projectionWeeks).toBe(8);
  });

  it('builds custom horizon with nanoid', () => {
    const h = buildHorizon(10, 6, 'Test');
    expect(h.label).toBe('Test');
    expect(h.historyWeeks).toBe(10);
    expect(h.projectionWeeks).toBe(6);
    expect(h.id).toMatch(/^[a-zA-Z0-9_-]{6}$/);
  });

  it('builds horizon with default label', () => {
    const h = buildHorizon(5, 4);
    expect(h.label).toBe('Дополнительный диапазон');
  });

  it('throws on invalid historyWeeks', () => {
    expect(() => buildHorizon(0, 5)).toThrow('Invalid historyWeeks');
    expect(() => buildHorizon(-1, 5)).toThrow('Invalid historyWeeks');
    expect(() => buildHorizon(NaN, 5)).toThrow('Invalid historyWeeks');
  });

  it('throws on invalid projectionWeeks', () => {
    expect(() => buildHorizon(5, 0)).toThrow('Invalid projectionWeeks');
    expect(() => buildHorizon(5, -1)).toThrow('Invalid projectionWeeks');
    expect(() => buildHorizon(5, NaN)).toThrow('Invalid projectionWeeks');
  });
});

describe('Absenteeism Runs', () => {
  it('returns 4 runs with correct status types', () => {
    const runs = listAbsenteeismRuns();
    expect(runs).toHaveLength(4);
    expect(runs.map(r => r.status)).toContain('completed');
    expect(runs.map(r => r.status)).toContain('scheduled');
    expect(runs.map(r => r.status)).toContain('failed');
  });

  it('clones runs on each call', () => {
    const r1 = listAbsenteeismRuns();
    const r2 = listAbsenteeismRuns();
    expect(r1[0]).not.toBe(r2[0]);
  });

  it('includes profile mode runs', () => {
    const runs = listAbsenteeismRuns();
    const profileRun = runs.find(r => r.mode === 'profile');
    expect(profileRun).toBeDefined();
    expect(profileRun?.profileName).toBeDefined();
  });

  it('includes value mode runs', () => {
    const runs = listAbsenteeismRuns();
    const valueRun = runs.find(r => r.mode === 'value');
    expect(valueRun).toBeDefined();
    expect(valueRun?.absenteeismPercent).toBeDefined();
  });

  it('has requested by field', () => {
    const runs = listAbsenteeismRuns();
    expect(runs[0].requestedBy).toMatch(/@.*\.ru$/);
  });
});

describe('Trend Tables', () => {
  it('generates strategic/tactical/operational tables', () => {
    const tables = generateTrendTables();
    expect(tables.strategic).toHaveLength(6);
    expect(tables.tactical).toHaveLength(7);
    expect(tables.operational).toHaveLength(12);
  });

  it('uses RU locale for dates in strategic', () => {
    const tables = generateTrendTables();
    // Date format is like "11 сент. – 17 сент." with dash separator
    const period = tables.strategic[0].period as string;
    expect(period).toContain('–'); // Em dash separator
    expect(/\d{2}/.test(period)).toBe(true); // Has day numbers
  });

  it('tactical has weekday names', () => {
    const tables = generateTrendTables();
    const weekdayPattern = /^(Пн|Вт|Ср|Чт|Пт|Сб|Вс)$/;
    const allAreWeekdays = (tables.tactical as any[]).every(row =>
      weekdayPattern.test(row.day)
    );
    expect(allAreWeekdays).toBe(true);
  });

  it('operational has time intervals', () => {
    const tables = generateTrendTables();
    const timePattern = /^\d{2}:\d{2}$/;
    const allHaveTimes = (tables.operational as any[]).every(row =>
      timePattern.test(row.interval)
    );
    expect(allHaveTimes).toBe(true);
  });

  it('produces deterministic results with same seed', () => {
    const t1 = generateTrendTables({ seed: 100 });
    const t2 = generateTrendTables({ seed: 100 });
    expect(t1).toEqual(t2);
  });

  it('produces different results with different seeds', () => {
    const t1 = generateTrendTables({ seed: 100 });
    const t2 = generateTrendTables({ seed: 200 });
    expect(t1).not.toEqual(t2);
  });

  it('includes forecast/actual/delta columns', () => {
    const tables = generateTrendTables();
    const row = tables.strategic[0] as any;
    expect(row).toHaveProperty('forecast');
    expect(row).toHaveProperty('actual');
    expect(row).toHaveProperty('delta');
  });
});

describe('Accuracy Table', () => {
  it('generates 8 weeks of accuracy data', () => {
    const table = generateAccuracyTable();
    expect(table).toHaveLength(8);
  });

  it('uses RU number formatting', () => {
    const table = generateAccuracyTable();
    // forecast/actual should be formatted numbers (may or may not have decimals)
    expect(table[0].forecast).toMatch(/^\d+(?:,\d+)?$/);
    expect(table[0].actual).toMatch(/^\d+(?:,\d+)?$/);
  });

  it('relativeDelta uses RU formatting', () => {
    const table = generateAccuracyTable();
    // relativeDelta should end with % and use comma separator
    expect(table[0].relativeDelta).toMatch(/^\d+,\d%$/);
  });

  it('absenteeism uses RU formatting', () => {
    const table = generateAccuracyTable();
    expect(table[0].absenteeism).toMatch(/^\d+,\d%$/);
  });

  it('lostCalls uses RU formatting', () => {
    const table = generateAccuracyTable();
    expect(table[0].lostCalls).toMatch(/^\d+,\d%$/);
  });

  it('serviceLevel uses RU formatting', () => {
    const table = generateAccuracyTable();
    expect(table[0].serviceLevel).toMatch(/^\d+,\d%$/);
  });

  it('aht includes Cyrillic hours symbol', () => {
    const table = generateAccuracyTable();
    expect(table[0].aht).toMatch(/ч$/);
    // Format is like "4,6 ч" or "4,62 ч" (number.decimals space ч)
    expect(table[0].aht).toMatch(/^\d+,\d+\sч$/);
  });

  it('includes all required columns', () => {
    const row = generateAccuracyTable()[0];
    expect(row).toHaveProperty('period');
    expect(row).toHaveProperty('forecast');
    expect(row).toHaveProperty('actual');
    expect(row).toHaveProperty('absoluteDelta');
    expect(row).toHaveProperty('relativeDelta');
    expect(row).toHaveProperty('absenteeism');
    expect(row).toHaveProperty('lostCalls');
    expect(row).toHaveProperty('serviceLevel');
    expect(row).toHaveProperty('aht');
  });

  it('clones data on each call', () => {
    const t1 = generateAccuracyTable();
    const t2 = generateAccuracyTable();
    expect(t1[0]).not.toBe(t2[0]);
    expect(t1).toEqual(t2);
  });
});

describe('Forecast Summary', () => {
  it('builds forecast summary from build result', () => {
    const buildResult = {
      organisation: 'Test Org',
      horizonWeeks: 8,
      projectionWeeks: 8,
      generatedAt: new Date().toISOString(),
      actual: { id: 'a', label: 'A', unit: 'count' as const, points: [] },
      forecast: { id: 'f', label: 'F', unit: 'count' as const, points: [] },
      confidence: {
        lower: { id: 'l', label: 'L', unit: 'count' as const, points: [] },
        upper: { id: 'u', label: 'U', unit: 'count' as const, points: [] },
      },
      table: [],
    };
    const summary = buildForecastSummary(buildResult, 5, { mode: 'value', value: 12 });
    expect(summary.appliedQueues).toBe(5);
    expect(summary.horizonWeeks).toBe(8);
    expect(summary.absenteeismMode).toBe('value');
    expect(summary.absenteeismValue).toBe(12);
  });

  it('handles profile mode absenteeism', () => {
    const buildResult = {
      organisation: 'Test Org',
      horizonWeeks: 8,
      projectionWeeks: 8,
      generatedAt: new Date().toISOString(),
      actual: { id: 'a', label: 'A', unit: 'count' as const, points: [] },
      forecast: { id: 'f', label: 'F', unit: 'count' as const, points: [] },
      confidence: {
        lower: { id: 'l', label: 'L', unit: 'count' as const, points: [] },
        upper: { id: 'u', label: 'U', unit: 'count' as const, points: [] },
      },
      table: [],
    };
    const summary = buildForecastSummary(buildResult, 10, { mode: 'profile', profileName: 'Test Profile' });
    expect(summary.absenteeismMode).toBe('profile');
    expect(summary.absenteeismProfile).toBe('Test Profile');
    expect(summary.absenteeismValue).toBeUndefined();
  });
});

describe('Report Download Notice', () => {
  it('creates notice with nanoid', () => {
    const notice = createReportDownloadNotice('test-report', 'csv');
    expect(notice.id).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(notice.reportId).toBe('test-report');
    expect(notice.format).toBe('csv');
    expect(notice.status).toBe('queued');
  });

  it('generates filename with date', () => {
    const notice = createReportDownloadNotice('my-report', 'xlsx');
    expect(notice.filename).toMatch(/^my-report_\d{4}-\d{2}-\d{2}\.xlsx$/);
  });

  it('handles all report formats', () => {
    const formats = ['csv', 'xlsx', 'pdf'] as const;
    formats.forEach(format => {
      const notice = createReportDownloadNotice('test', format);
      expect(notice.format).toBe(format);
      expect(notice.filename).toContain(`.${format}`);
    });
  });

  it('sets correct initial status', () => {
    const notice = createReportDownloadNotice('report', 'pdf');
    expect(notice.status).toBe('queued');
  });

  it('captures requestedAt timestamp', () => {
    const before = new Date().getTime();
    const notice = createReportDownloadNotice('report', 'csv');
    const after = new Date().getTime();
    const requestedTime = new Date(notice.requestedAt).getTime();
    expect(requestedTime).toBeGreaterThanOrEqual(before);
    expect(requestedTime).toBeLessThanOrEqual(after);
  });
});

// Helper function to flatten queue tree
function flattenQueues(nodes: any[]): any[] {
  return nodes.flatMap(node => [
    node,
    ...(node.children ? flattenQueues(node.children) : []),
  ]);
}
