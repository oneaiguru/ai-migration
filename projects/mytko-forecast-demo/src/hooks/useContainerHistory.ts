import { useEffect, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import Papa from 'papaparse';

export type HistoryMode = 'daily' | 'weekly' | 'monthly';

export interface ContainerHistoryRow {
  siteId: string;
  date: Dayjs;
  actualM3: number;
  forecastM3: number | null;
  fillPct: number | null;
  overflowProb: number | null;
  isCollection: boolean;
  lastServiceDt: Dayjs | null;
}

export interface AggregatedHistoryRow {
  label: string;
  periodStart: Dayjs;
  actualM3: number;
  forecastM3: number;
  collectionMarker: number | null;
}

export interface HistoryHookResult {
  loading: boolean;
  error: string | null;
  rows: ContainerHistoryRow[];
  aggregatedRows: AggregatedHistoryRow[];
  totals: { actual: number; forecast: number };
  lastServiceDate: Dayjs | null;
  overallLastServiceDate: Dayjs | null;
  refetch: () => void;
}

const DATA_URL = '/demo_data/containers_summary.csv';

export function useContainerHistory(
  siteId: string | null,
  dateRange: [Dayjs, Dayjs],
  mode: HistoryMode,
  vehicleVolume: number
): HistoryHookResult {
  const [rawRows, setRawRows] = useState<ContainerHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!siteId) {
      setRawRows([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.text();
      })
      .then((text) => {
        if (cancelled) {
          return;
        }
        const parsed = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,
        });
        const parsedRows = parsed.data as Record<string, string>[];
        const rows = parsedRows
          .filter((row) => (row.site_id || row.siteId) === siteId)
          .map((row) => mapRow(row))
          .filter((row): row is ContainerHistoryRow => Boolean(row));
        setRawRows(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setRawRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [siteId, tick]);

  const rows = useMemo(() => {
    const [start, end] = dateRange;
    return rawRows
      .filter(
        (row) =>
          row.date.isValid() &&
          !row.date.isBefore(start.startOf('day')) &&
          !row.date.isAfter(end.endOf('day'))
      )
      .map((row) => ({
        ...row,
        fillPct: deriveFillPct(row, vehicleVolume),
      }));
  }, [rawRows, dateRange, vehicleVolume]);

  const aggregatedRows = useMemo(() => aggregateRows(rows, mode), [rows, mode]);
  const totals = useMemo(
    () => ({
      actual: rows.reduce((acc, row) => acc + row.actualM3, 0),
      forecast: rows.reduce((acc, row) => acc + (row.forecastM3 ?? 0), 0),
    }),
    [rows]
  );
  const lastServiceDate = useMemo(() => deriveLastService(rows), [rows]);
  const overallLastServiceDate = useMemo(() => deriveLastService(rawRows), [rawRows]);

  return {
    loading,
    error,
    rows,
    aggregatedRows,
    totals,
    lastServiceDate,
    overallLastServiceDate,
    refetch: () => setTick((value) => value + 1),
  };
}

function mapRow(row: Record<string, string>): ContainerHistoryRow | null {
  const date = dayjs(row.date ?? row[' date'] ?? '');
  if (!date.isValid()) {
    return null;
  }
  const lastServiceRaw = row.last_service_dt || row.lastServiceDt || '';
  const forecastValue = safeNumber(row.forecast_m3, true);
  return {
    siteId: row.site_id || row.siteId || '',
    date,
    actualM3: safeNumber(row.actual_m3),
    forecastM3: Number.isNaN(forecastValue) ? null : forecastValue,
    fillPct: formatNullable(row.fill_pct),
    overflowProb: formatNullable(row.overflow_prob),
    isCollection: row.is_collection === '1' || row.is_collection === 'true',
    lastServiceDt: lastServiceRaw ? dayjs(lastServiceRaw) : null,
  };
}

function safeNumber(value: string | undefined, allowEmpty = false): number {
  if (!value) {
    return allowEmpty ? NaN : 0;
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return allowEmpty ? NaN : 0;
  }
  return num;
}

function aggregateRows(rows: ContainerHistoryRow[], mode: HistoryMode): AggregatedHistoryRow[] {
  if (mode === 'daily') {
    return rows.map((row) => ({
      label: row.date.format('DD.MM'),
      periodStart: row.date,
      actualM3: row.actualM3,
      forecastM3: row.forecastM3 ?? 0,
      collectionMarker: row.isCollection ? row.actualM3 : null,
    }));
  }
  const buckets = new Map<string, AggregatedHistoryRow>();
  rows.forEach((row) => {
    const start = row.date.startOf(mode === 'weekly' ? 'week' : 'month');
    const key = start.format('YYYY-MM-DD');
    const label =
      mode === 'weekly'
        ? `${start.format('DD.MM')} – ${start.add(6, 'day').format('DD.MM')}`
        : start.format('MMMM YYYY');
    const existing = buckets.get(key);
    const forecastValue = row.forecastM3 ?? 0;
    if (existing) {
      existing.actualM3 += row.actualM3;
      existing.forecastM3 += forecastValue;
      if (row.isCollection) {
        existing.collectionMarker = (existing.collectionMarker ?? 0) + row.actualM3;
      }
    } else {
      buckets.set(key, {
        label,
        periodStart: start,
        actualM3: row.actualM3,
        forecastM3: forecastValue,
        collectionMarker: row.isCollection ? row.actualM3 : null,
      });
    }
  });
  return Array.from(buckets.values()).sort((a, b) => a.periodStart.valueOf() - b.periodStart.valueOf());
}

function formatNullable(value: string | undefined): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function deriveLastService(rows: ContainerHistoryRow[]): Dayjs | null {
  const dates = rows
    .map((row) => row.lastServiceDt)
    .filter((value): value is Dayjs => Boolean(value && value.isValid()));
  if (!dates.length) {
    return null;
  }
  return dates.reduce((latest, value) => (value.isAfter(latest) ? value : latest));
}

function deriveFillPct(row: ContainerHistoryRow, vehicleVolume: number): number | null {
  if (row.fillPct != null && !Number.isNaN(row.fillPct)) {
    return row.fillPct;
  }
  if (!vehicleVolume || vehicleVolume <= 0) {
    return null;
  }
  if (row.forecastM3 == null || Number.isNaN(row.forecastM3)) {
    return null;
  }
  const derived = row.forecastM3 / vehicleVolume;
  if (!Number.isFinite(derived)) {
    return null;
  }
  return Math.min(Math.max(derived, 0), 1);
}
