import { describe, expect, it } from 'vitest';
import {
  applyAdjustment,
  applyBulkAdjustment,
  createAdjustmentSession,
  redoAdjustment,
  summariseAdjustments,
  undoAdjustment,
} from '../adjustments';

describe('forecasting adjustments', () => {
  it('updates rows and recalculates totals when applying adjustments', () => {
    const session = createAdjustmentSession({ seed: 3 });
    const target = session.rows[0];
    const updated = applyAdjustment(session, target.id, 0.1);
    expect(updated.rows[0].total).not.toEqual(target.total);
  });

  it('supports bulk adjustments and undo/redo history', () => {
    let session = createAdjustmentSession({ seed: 4 });
    session = applyBulkAdjustment(session, 0.05);
    const undone = undoAdjustment(session);
    expect(undone.rows[0].total).not.toEqual(session.rows[0].total);
    const redone = redoAdjustment(undone);
    expect(redone.rows[0].total).toEqual(session.rows[0].total);
  });

  it('produces adjustment summary metrics', () => {
    const session = createAdjustmentSession({ seed: 18 });
    const summary = summariseAdjustments(session.rows);
    expect(summary).toHaveProperty('positive');
    expect(summary).toHaveProperty('warnings');
  });
});
