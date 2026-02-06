import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calculator, Undo2, Redo2, Plus, Minus, AlertTriangle } from 'lucide-react';
import { ReportTable } from '../charts';
import { buildAdjustmentTable } from '../../adapters/forecasting';
import { fetchForecastSeries, saveAdjustments, validateAdjustments } from '../../services/forecastingApi';

type ForecastInterval = {
  id: string;
  timestamp: string;
  timeSlot: string;
  predicted: number;
  adjustment: number;
  total: number;
  requiredAgents: number;
  confidence: number;
  isWeekend: boolean;
};

type HistoryEntry = {
  id: string;
  previous: number;
  next: number;
};

type ValidationState = 'idle' | 'pending' | 'warning' | 'error' | 'ok' | 'saving' | 'saved';

const ManualAdjustmentSystem: React.FC = () => {
  const [intervals, setIntervals] = useState<ForecastInterval[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryEntry[][]>([]);
  const [future, setFuture] = useState<HistoryEntry[][]>([]);
  const [statusMap, setStatusMap] = useState<Map<string, ValidationState>>(new Map());
  const [messageMap, setMessageMap] = useState<Map<string, string>>(new Map());

  const selectedIntervals = useMemo(
    () => intervals.filter((interval) => selectedIds.has(interval.id)),
    [intervals, selectedIds],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const series = await fetchForecastSeries();
        const mapped = series.map((item) => {
          const timestamp = new Date(item.timestamp);
          const isWeekend = [0, 6].includes(timestamp.getDay());
          return {
            id: item.id,
            timestamp: item.timestamp,
            timeSlot: `${timestamp.toLocaleDateString('ru-RU')} ${timestamp.toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}`,
            predicted: item.predicted,
            adjustment: item.adjustment,
            total: item.total,
            requiredAgents: item.requiredAgents,
            confidence: isWeekend ? 78 : 92,
            isWeekend,
          } satisfies ForecastInterval;
        });
        setIntervals(mapped);
      } catch (error) {
        console.warn('Не удалось загрузить данные корректировок', error);
      }
    };

    void load();
  }, []);

  const intervalById = useMemo(() => new Map(intervals.map((interval) => [interval.id, interval])), [intervals]);

  const pendingEvaluation = useRef<{ entries: HistoryEntry[]; intervals: ForecastInterval[] } | null>(null);

  useEffect(() => {
    const ids = new Set(intervals.map((interval) => interval.id));
    setStatusMap((prev) => {
      const next = new Map(prev);
      next.forEach((_, id) => {
        if (!ids.has(id)) {
          next.delete(id);
        }
      });
      intervals.forEach((interval) => {
        if (!next.has(interval.id)) {
          next.set(interval.id, 'idle');
        }
      });
      return next;
    });

    setMessageMap((prev) => {
      const next = new Map(prev);
      next.forEach((_, id) => {
        if (!ids.has(id)) {
          next.delete(id);
        }
      });
      return next;
    });
  }, [intervals]);

  const setStatuses = useCallback((ids: string[], status: ValidationState) => {
    if (!ids.length) return;
    setStatusMap((prev) => {
      const next = new Map(prev);
      ids.forEach((id) => {
        next.set(id, status);
      });
      return next;
    });
  }, []);

  const updateMessages = useCallback((entries: Array<{ id: string; message?: string }>) => {
    if (!entries.length) return;
    setMessageMap((prev) => {
      const next = new Map(prev);
      entries.forEach(({ id, message }) => {
        if (message) {
          next.set(id, message);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  }, []);

  const processAdjustments = useCallback(
    async (entries: HistoryEntry[], updatedIntervals: ForecastInterval[]) => {
      if (!entries.length) return;

      const lookup = new Map(updatedIntervals.map((interval) => [interval.id, interval]));
      const payload = entries
        .map((entry) => lookup.get(entry.id))
        .filter((interval): interval is ForecastInterval => Boolean(interval))
        .map((interval) => ({
          id: interval.id,
          timestamp: interval.timestamp,
          predicted: interval.predicted,
          adjustment: interval.adjustment,
          total: interval.total,
          requiredAgents: interval.requiredAgents,
        }));

      if (!payload.length) return;

      const ids = payload.map((item) => item.id);
      setStatuses(ids, 'pending');

      try {
        const validationResults = await validateAdjustments(payload);
        const hasError = validationResults.some((result) => result.status === 'error');

        setStatusMap((prev) => {
          const next = new Map(prev);
          validationResults.forEach((result) => {
            const mapped: ValidationState = result.status === 'error'
              ? 'error'
              : result.status === 'warning'
                ? 'warning'
                : 'ok';
            next.set(result.id, mapped);
          });
          return next;
        });

        updateMessages(validationResults.map((result) => ({ id: result.id, message: result.message })));

        if (hasError) {
          return;
        }

        setStatuses(ids, 'saving');
        try {
          await saveAdjustments(payload);
          setStatuses(ids, 'saved');
        } catch (error) {
          console.warn('Сохранение корректировок завершилось с ошибкой', error);
          setStatuses(ids, 'error');
          updateMessages(ids.map((id) => ({ id, message: 'Не удалось сохранить корректировки' })));
        }
      } catch (error) {
        console.warn('Ошибка обработки корректировок', error);
        setStatuses(ids, 'error');
        updateMessages(ids.map((id) => ({ id, message: 'Ошибка валидации корректировок' })));
      }
    },
    [setStatuses, updateMessages],
  );

  const table = useMemo(() => {
    const rows = intervals.map((interval) => ({
      ...interval,
      status: selectedIds.has(interval.id) ? 'Выбрано' : interval.isWeekend ? 'Выходной' : 'Рабочий день',
    }));
    return buildAdjustmentTable(rows);
  }, [intervals, selectedIds]);

  const pushHistory = (entries: HistoryEntry[]) => {
    if (!entries.length) return;
    setHistory((prev) => [...prev, entries]);
    setFuture([]);
  };

  const applyChange = (entries: HistoryEntry[]) => {
    if (!entries.length) return;
    setIntervals((prev) => {
      const next = prev.map((interval) => {
        const match = entries.find((entry) => entry.id === interval.id);
        if (!match) return interval;
        const adjustment = match.next;
        const total = interval.predicted + adjustment;
        return {
          ...interval,
          adjustment,
          total,
          requiredAgents: Math.max(0, Math.round(total * 0.18)),
        };
      });
      pendingEvaluation.current = { entries, intervals: next };
      return next;
    });
  };

  useEffect(() => {
    if (!pendingEvaluation.current) return;
    const payload = pendingEvaluation.current;
    pendingEvaluation.current = null;
    void processAdjustments(payload.entries, payload.intervals);
  }, [intervals, processAdjustments]);

  const handleRowToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSetAdjustment = (value: number) => {
    if (Number.isNaN(value)) return;
    const targets = selectedIntervals;
    if (!targets.length) return;

    const changes: HistoryEntry[] = targets.map((interval) => ({
      id: interval.id,
      previous: interval.adjustment,
      next: value,
    }));

    pushHistory(changes);
    applyChange(changes);
  };

  const handleIncrement = (delta: number) => {
    const targets = selectedIntervals;
    if (!targets.length) return;

    const changes: HistoryEntry[] = targets.map((interval) => ({
      id: interval.id,
      previous: interval.adjustment,
      next: interval.adjustment + delta,
    }));

    pushHistory(changes);
    applyChange(changes);
  };

  const undo = () => {
    setHistory((prev) => {
      if (!prev.length) return prev;
      const entries = prev[prev.length - 1];
      setFuture((next) => [...next, entries]);
      applyChange(entries.map((entry) => ({ id: entry.id, previous: entry.next, next: entry.previous })));
      return prev.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((prev) => {
      if (!prev.length) return prev;
      const entries = prev[prev.length - 1];
      applyChange(entries);
      setHistory((next) => [...next, entries]);
      return prev.slice(0, -1);
    });
  };

  const selectedCount = selectedIds.size;

  const renderStatusBadge = (interval: ForecastInterval | undefined, isSelected: boolean) => {
    if (!interval) {
      return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">—</span>;
    }

    if (isSelected) {
      return <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">Выбрано</span>;
    }

    const status = statusMap.get(interval.id);
    const message = messageMap.get(interval.id);

    if (status === 'pending') {
      return <span title={message} className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">Проверка…</span>;
    }

    if (status === 'saving') {
      return <span title={message} className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">Сохранение…</span>;
    }

    if (status === 'saved') {
      return <span title={message} className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Сохранено</span>;
    }

    if (status === 'warning') {
      return <span title={message} className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">Проверить</span>;
    }

    if (status === 'error') {
      return <span title={message} className="rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700">Ошибка</span>;
    }

    if (status === 'ok') {
      return <span title={message} className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">OK</span>;
    }

    const ratio = Math.abs(interval.adjustment) / Math.max(interval.predicted || 1, 1);
    if (ratio >= 0.2) {
      return <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700">Требует проверки</span>;
    }
    if (ratio >= 0.1) {
      return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">Проверить</span>;
    }
    if (interval.isWeekend) {
      return <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">Выходной</span>;
    }
    return <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">OK</span>;
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Ручные корректировки прогноза</h2>
          <p className="text-sm text-gray-500">Выберите интервалы, измените прогноз и фиксируйте правки через историю изменений.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-gray-300 disabled:opacity-40"
            disabled={!history.length}
          >
            <Undo2 className="h-4 w-4" /> Отменить
          </button>
          <button
            onClick={redo}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-gray-300 disabled:opacity-40"
            disabled={!future.length}
          >
            <Redo2 className="h-4 w-4" /> Повторить
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_minmax(280px,1fr)]">
        <div className="space-y-4">
          <ReportTable
            columns={table.columns}
            rows={table.rows.map((row) => {
              const { id, timeSlot, ...rest } = row;
              const label = String(timeSlot);
              const interval = intervalById.get(String(id));
              const isSelected = selectedIds.has(String(id));
              return {
                id,
                ...rest,
                timeSlot: (
                  <button
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    isSelected
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                    onClick={() => handleRowToggle(String(id))}
                    type="button"
                  >
                    {label}
                  </button>
                ),
                status: renderStatusBadge(interval, isSelected),
              };
            })}
            ariaTitle="Таблица корректировок"
            ariaDesc="Таблица прогнозных интервалов с возможностью выбора строк"
          />
        </div>

        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Панель корректировок</div>
              <div className="text-sm text-gray-900">Выбрано интервалов: {selectedCount}</div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Установить значение</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 disabled:bg-gray-100 disabled:text-gray-400"
                placeholder="Корректировка, чел"
                onChange={(event) => handleSetAdjustment(Number(event.target.value))}
                disabled={selectedCount === 0}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Быстрые действия</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleIncrement(10)}
                disabled={selectedCount === 0}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" /> +10
              </button>
              <button
                type="button"
                onClick={() => handleIncrement(-10)}
                disabled={selectedCount === 0}
                className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Minus className="h-4 w-4" /> -10
              </button>
              <button
                type="button"
                onClick={() => handleSetAdjustment(0)}
                disabled={selectedCount === 0}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Сбросить
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <p>
                Корректировки выше ±20% автоматически помечаются как «Требует проверки». Используйте панель истории, чтобы вернуть значения перед публикацией.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManualAdjustmentSystem;
