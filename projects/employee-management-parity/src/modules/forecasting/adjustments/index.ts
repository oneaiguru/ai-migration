import { nanoid } from 'nanoid';

export type AdjustmentStatus = 'ok' | 'warning' | 'error';

export interface AdjustmentRow {
  id: string;
  period: string;
  forecast: number;
  adjustmentPercent: number;
  total: number;
  requiredAgents: number;
  confidence: number;
  status: AdjustmentStatus;
}

export interface AdjustmentSession {
  rows: AdjustmentRow[];
  undo: AdjustmentRow[][];
  redo: AdjustmentRow[][];
}

export interface AdjustmentSeedOptions {
  days?: number;
  base?: number;
  seed?: number;
}

const seededRandom = (seed: number) => {
  let current = seed;
  return () => {
    const value = Math.sin(current++) * 10000;
    return value - Math.floor(value);
  };
};

const buildDate = (index: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + index);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

const evaluateStatus = (percent: number): AdjustmentStatus => {
  if (percent > 0.2 || percent < -0.2) {
    return 'error';
  }
  if (percent > 0.1 || percent < -0.1) {
    return 'warning';
  }
  return 'ok';
};

const cloneRows = (rows: AdjustmentRow[]): AdjustmentRow[] => rows.map((row) => ({ ...row }));

const commit = (session: AdjustmentSession, rows: AdjustmentRow[]): AdjustmentSession => ({
  rows,
  undo: [...session.undo, cloneRows(session.rows)],
  redo: [],
});

export const createAdjustmentRows = (options: AdjustmentSeedOptions = {}): AdjustmentRow[] => {
  const days = options.days ?? 14;
  const base = options.base ?? 180;
  const random = seededRandom(options.seed ?? 21);
  return Array.from({ length: days }, (_, index) => {
    const forecast = Math.round(base + random() * 40);
    const adjustmentPercent = Number(((random() - 0.5) * 0.12).toFixed(3));
    const total = Math.round(forecast * (1 + adjustmentPercent));
    return {
      id: nanoid(8),
      period: buildDate(index),
      forecast,
      adjustmentPercent,
      total,
      requiredAgents: Math.max(10, Math.round(total / 8)),
      confidence: Number((0.82 + random() * 0.12).toFixed(3)),
      status: evaluateStatus(adjustmentPercent),
    };
  });
};

export const createAdjustmentSession = (options: AdjustmentSeedOptions = {}): AdjustmentSession => ({
  rows: createAdjustmentRows(options),
  undo: [],
  redo: [],
});

export const applyAdjustment = (
  session: AdjustmentSession,
  rowId: string,
  deltaPercent: number,
): AdjustmentSession => {
  const rows = session.rows.map((row) => {
    if (row.id !== rowId) {
      return row;
    }
    const nextPercent = Number((row.adjustmentPercent + deltaPercent).toFixed(3));
    const total = Math.round(row.forecast * (1 + nextPercent));
    return {
      ...row,
      adjustmentPercent: nextPercent,
      total,
      requiredAgents: Math.max(10, Math.round(total / 8)),
      status: evaluateStatus(nextPercent),
    };
  });
  return commit(session, rows);
};

export const applyBulkAdjustment = (
  session: AdjustmentSession,
  deltaPercent: number,
): AdjustmentSession => {
  const rows = session.rows.map((row) => {
    const nextPercent = Number((row.adjustmentPercent + deltaPercent).toFixed(3));
    const total = Math.round(row.forecast * (1 + nextPercent));
    return {
      ...row,
      adjustmentPercent: nextPercent,
      total,
      requiredAgents: Math.max(10, Math.round(total / 8)),
      status: evaluateStatus(nextPercent),
    };
  });
  return commit(session, rows);
};

export const resetAdjustments = (session: AdjustmentSession): AdjustmentSession => ({
  rows: createAdjustmentRows({ days: session.rows.length }),
  undo: [...session.undo, cloneRows(session.rows)],
  redo: [],
});

export const undoAdjustment = (session: AdjustmentSession): AdjustmentSession => {
  const previous = session.undo.pop();
  if (!previous) {
    return session;
  }
  return {
    rows: previous,
    undo: [...session.undo],
    redo: [cloneRows(session.rows), ...session.redo],
  };
};

export const redoAdjustment = (session: AdjustmentSession): AdjustmentSession => {
  const next = session.redo.shift();
  if (!next) {
    return session;
  }
  return {
    rows: next,
    undo: [...session.undo, cloneRows(session.rows)],
    redo: [...session.redo],
  };
};

export interface AdjustmentSummary {
  positive: number;
  negative: number;
  warnings: number;
  errors: number;
}

export const summariseAdjustments = (rows: AdjustmentRow[]): AdjustmentSummary =>
  rows.reduce<AdjustmentSummary>(
    (summary, row) => {
      if (row.adjustmentPercent > 0) {
        summary.positive += row.adjustmentPercent;
      } else if (row.adjustmentPercent < 0) {
        summary.negative += row.adjustmentPercent;
      }
      if (row.status === 'warning') {
        summary.warnings += 1;
      } else if (row.status === 'error') {
        summary.errors += 1;
      }
      return summary;
    },
    { positive: 0, negative: 0, warnings: 0, errors: 0 },
  );
