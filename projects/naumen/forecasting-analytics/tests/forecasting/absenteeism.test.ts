import { describe, expect, it } from 'vitest';
import { calculateAbsenteeism } from '../../src/services/forecastingApi';
import { absenteeismCalculatorPresets, queueTree } from '../../src/data/forecastingFixtures';

const firstLeaf = (() => {
  const walk = (nodes: typeof queueTree): string | null => {
    for (const node of nodes) {
      if (!node.children?.length) return node.id;
      const child = walk(node.children);
      if (child) return child;
    }
    return null;
  };
  return walk(queueTree) ?? 'support-l1';
})();

describe('calculateAbsenteeism', () => {
  it('returns recommended percent and series for preset input', async () => {
    const preset = absenteeismCalculatorPresets[0];
    const result = await calculateAbsenteeism({
      queueId: firstLeaf,
      templateId: 'template-weekday',
      historyDays: preset.historyDays,
      forecastDays: preset.forecastDays,
      intervalMinutes: preset.intervalMinutes,
    });
    expect(result.series).toHaveLength(preset.forecastDays);
    expect(result.recommendedPercent).toBeGreaterThanOrEqual(result.baselinePercent);
    expect(result.queueId).toBe(firstLeaf);
  });

  it('keeps baseline percent available for notifications display', async () => {
    const preset = absenteeismCalculatorPresets[1] ?? absenteeismCalculatorPresets[0];
    const result = await calculateAbsenteeism({
      queueId: firstLeaf,
      templateId: 'template-weekday',
      historyDays: preset.historyDays,
      forecastDays: preset.forecastDays,
      intervalMinutes: preset.intervalMinutes,
    });
    expect(result.baselinePercent).toBeGreaterThan(0);
  });
});
