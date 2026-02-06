import { describe, expect, it } from 'vitest';
import { buildAdjustmentTable } from '../../src/adapters/forecasting/adjustments';

const sample = [
  {
    id: 'slot-1',
    timeSlot: '20.10.2025 08:00',
    predicted: 120,
    adjustment: 10,
    total: 130,
    requiredAgents: 24,
    confidence: 90,
    status: 'Рабочий день',
  },
];

describe('buildAdjustmentTable', () => {
  it('returns columns with formatted rows', () => {
    const table = buildAdjustmentTable(sample);
    expect(table.columns).toHaveLength(7);
    expect(table.rows[0].adjustment).toBe('10');
    expect(table.rows[0].id).toBe('slot-1');
  });
});
