import type { ReportTableColumn } from '../../components/charts/types';

export interface AdjustmentRow {
  id: string;
  timeSlot: string;
  predicted: number;
  adjustment: number;
  total: number;
  requiredAgents: number;
  confidence: number;
  status: string;
}

export interface AdjustmentTable {
  columns: ReportTableColumn[];
  rows: Array<Record<string, string | number> & { id: string }>;
}

export const buildAdjustmentTable = (rows: AdjustmentRow[]): AdjustmentTable => {
  const columns: ReportTableColumn[] = [
    { id: 'timeSlot', label: 'Интервал' },
    { id: 'predicted', label: 'Прогноз' },
    { id: 'adjustment', label: 'Корректировка' },
    { id: 'total', label: 'Итого' },
    { id: 'requiredAgents', label: 'Треб. агенты' },
    { id: 'confidence', label: 'Доверие %' },
    { id: 'status', label: 'Статус' },
  ];

  const tableRows = rows.map((row) => ({
    id: row.id,
    timeSlot: row.timeSlot,
    predicted: row.predicted.toFixed(0),
    adjustment: row.adjustment.toFixed(0),
    total: row.total.toFixed(0),
    requiredAgents: row.requiredAgents.toFixed(0),
    confidence: `${row.confidence.toFixed(0)}%`,
    status: row.status,
  }));

  return { columns, rows: tableRows };
};
