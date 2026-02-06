import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarPlus,
  Download,
  Edit3,
  Plus,
  Repeat,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  ExceptionInterval,
  ExceptionTemplate,
  ExceptionTemplateInput,
  ForecastHorizonOption,
} from '../../../types/forecasting';
import {
  deleteExceptionTemplate,
  exportExceptionsCsv,
  fetchExceptionTemplates,
  saveExceptionTemplate,
} from '../../../services/forecastingApi';
import { forecastHorizonOptions, queueTree, exceptionWorkspaceDefaults } from '../../../data/forecastingFixtures';
import { useTimezone } from '../common/TimezoneContext';
import { convertDateInputToUtcIso, convertUtcIsoToDateInput, timezoneShortLabel } from '../../../utils/timezone';

interface IntervalDraft extends Omit<ExceptionInterval, 'id'> {
  id?: string;
}

interface QueueOption {
  id: string;
  label: string;
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье',
};

const flattenQueues = (nodes: typeof queueTree, prefix = ''): QueueOption[] =>
  nodes.flatMap((node) => {
    const label = prefix ? `${prefix} / ${node.name}` : node.name;
    if (!node.children?.length) {
      return [{ id: node.id, label }];
    }
    return [{ id: node.id, label }, ...flattenQueues(node.children, label)];
  });

const createInterval = (mode: 'day' | 'interval'): IntervalDraft =>
  mode === 'day'
    ? {
        mode,
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      }
    : {
        mode,
        dayOfWeek: 'monday',
        start: '09:00',
        end: '18:00',
        smoothing: 0.2,
      };

const calculateDaysBetween = (startISO: string, endISO: string): number => {
  const startDate = new Date(startISO);
  const endDate = new Date(endISO);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0;
  }
  const diff = endDate.getTime() - startDate.getTime();
  if (diff <= 0) return 0;
  return Math.max(1, Math.round(diff / (24 * 60 * 60 * 1000)));
};

const computeHistoryRange = (days: number, buildStartISO: string): { start: string; end: string } => {
  const endDate = buildStartISO ? new Date(buildStartISO) : new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
};

const buildTemplateMode = (intervals: IntervalDraft[]): ExceptionTemplateInput['mode'] =>
  intervals.some((interval) => interval.mode === 'interval') ? 'periodic' : 'single';

const ExceptionsWorkspace: React.FC = () => {
  const [templates, setTemplates] = useState<ExceptionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyId, setHistoryId] = useState<string>(forecastHorizonOptions[0]?.id ?? '');
  const [label, setLabel] = useState('Новый шаблон');
  const [periodLabel, setPeriodLabel] = useState('');
  const [intervals, setIntervals] = useState<IntervalDraft[]>([
    createInterval(exceptionWorkspaceDefaults.initialMode),
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [queueId, setQueueId] = useState<string>('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [defaultMode, setDefaultMode] = useState<'day' | 'interval'>(exceptionWorkspaceDefaults.initialMode);
  const [historyRange, setHistoryRange] = useState<{ start: string; end: string }>({
    start: exceptionWorkspaceDefaults.historyStart,
    end: exceptionWorkspaceDefaults.historyEnd,
  });
  const [buildRange, setBuildRange] = useState<{ start: string; end: string }>({
    start: exceptionWorkspaceDefaults.buildStart,
    end: exceptionWorkspaceDefaults.buildEnd,
  });
  const { timezone } = useTimezone();
  const timezoneLabel = useMemo(() => timezoneShortLabel(timezone), [timezone]);

  const queueOptions = useMemo<QueueOption[]>(() => flattenQueues(queueTree), []);

  useEffect(() => {
    setQueueId(queueOptions[0]?.id ?? '');
  }, [queueOptions]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const loaded = await fetchExceptionTemplates();
        if (active) {
          setTemplates(loaded);
        }
      } catch (fetchError) {
        console.error(fetchError);
        setError('Не удалось загрузить сохранённые исключения.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const historyOption = useMemo<ForecastHorizonOption | null>(
    () => forecastHorizonOptions.find((option) => option.id === historyId) ?? null,
    [historyId],
  );

  useEffect(() => {
    if (historyId === 'custom') return;
    const option = forecastHorizonOptions.find((candidate) => candidate.id === historyId);
    if (!option) return;
    const range = computeHistoryRange(option.historyDays, buildRange.start);
    setHistoryRange(range);
  }, [historyId, buildRange.start]);

  useEffect(() => {
    const nextConflicts = new Set<number>();
    const dayKeys = new Map<string, number>();
    const intervalKeys = new Map<string, number>();

    intervals.forEach((interval, index) => {
      if (interval.mode === 'day') {
        const start = interval.start ?? '';
        const end = interval.end ?? '';
        if (start > end) {
          nextConflicts.add(index);
        }
        const key = `${start}-${end}`;
        if (dayKeys.has(key)) {
          nextConflicts.add(index);
          nextConflicts.add(dayKeys.get(key)!);
        } else {
          dayKeys.set(key, index);
        }
      } else {
        const day = interval.dayOfWeek ?? 'monday';
        const start = interval.start ?? '00:00';
        const end = interval.end ?? '23:59';
        if (start >= end) {
          nextConflicts.add(index);
        }
        const key = `${day}-${start}-${end}`;
        if (intervalKeys.has(key)) {
          nextConflicts.add(index);
          nextConflicts.add(intervalKeys.get(key)!);
        } else {
          intervalKeys.set(key, index);
        }
        if (interval.smoothing != null && (interval.smoothing < 0 || interval.smoothing > 1)) {
          nextConflicts.add(index);
        }
      }
    });

    setConflicts(nextConflicts);
  }, [intervals]);

  const resetForm = useCallback(() => {
    setLabel('Новый шаблон');
    setPeriodLabel('');
    setIntervals([createInterval(exceptionWorkspaceDefaults.initialMode)]);
    setEditingId(null);
    setHistoryId(forecastHorizonOptions[0]?.id ?? '');
    setDefaultMode(exceptionWorkspaceDefaults.initialMode);
    setHistoryRange({
      start: exceptionWorkspaceDefaults.historyStart,
      end: exceptionWorkspaceDefaults.historyEnd,
    });
    setBuildRange({
      start: exceptionWorkspaceDefaults.buildStart,
      end: exceptionWorkspaceDefaults.buildEnd,
    });
    setStatus(null);
    setError(null);
  }, []);

  const updateInterval = (index: number, patch: Partial<IntervalDraft>) => {
    setIntervals((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const removeInterval = (index: number) => {
    setIntervals((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleHistoryRangeChange = (key: 'start' | 'end', value: string) => {
    if (!value) return;
    const iso = convertDateInputToUtcIso(value, timezone.offsetMinutes);
    if (!iso) return;
    setHistoryRange((prev) => {
      const next = { ...prev, [key]: iso };
      if (key === 'start' && next.end && iso > next.end) {
        next.end = iso;
      }
      if (key === 'end' && next.start && iso < next.start) {
        next.start = iso;
      }
      return next;
    });
    setHistoryId('custom');
  };

  const handleBuildRangeChange = (key: 'start' | 'end', value: string) => {
    if (!value) return;
    const iso = convertDateInputToUtcIso(value, timezone.offsetMinutes);
    if (!iso) return;
    setBuildRange((prev) => {
      const next = { ...prev, [key]: iso };
      if (key === 'start' && next.end && iso > next.end) {
        next.end = iso;
      }
      if (key === 'end' && next.start && iso < next.start) {
        next.start = iso;
      }
      return next;
    });
  };

  const handleAddInterval = () => {
    setIntervals((prev) => [...prev, createInterval(defaultMode)]);
  };

  const handleHistoryPresetSelect = (id: string) => {
    setHistoryId(id);
    const option = forecastHorizonOptions.find((candidate) => candidate.id === id);
    if (option) {
      const range = computeHistoryRange(option.historyDays, buildRange.start);
      setHistoryRange(range);
    }
  };

  const editTemplate = (template: ExceptionTemplate) => {
    const mappedIntervals: IntervalDraft[] = template.intervals.map((interval) => ({
      id: interval.id,
      mode: interval.mode,
      dayOfWeek: interval.dayOfWeek,
      date: interval.date,
      start: interval.start,
      end: interval.end,
      smoothing: interval.smoothing,
    }));

    setLabel(template.label);
    setPeriodLabel(template.periodLabel);
    setHistoryId(
      forecastHorizonOptions.find((option) => option.historyDays === template.historyHorizon)?.id ??
        forecastHorizonOptions[0]?.id ??
        '',
    );
    const nextDefaultMode = mappedIntervals.some((interval) => interval.mode === 'interval') ? 'interval' : 'day';
    setDefaultMode(nextDefaultMode);
    setIntervals(mappedIntervals.length ? mappedIntervals : [createInterval(nextDefaultMode)]);
    setEditingId(template.id);
    setStatus(null);
    setError(null);
  };

  const removeTemplate = async (id: string) => {
    try {
      await deleteExceptionTemplate(id);
      setTemplates((prev) => prev.filter((template) => template.id !== id));
      setStatus('Шаблон удалён.');
      if (editingId === id) {
        resetForm();
      }
    } catch (deleteError) {
      console.error(deleteError);
      setError('Не удалось удалить шаблон. Попробуйте позже.');
    }
  };

  const derivedHistoryHorizon = historyId === 'custom'
    ? calculateDaysBetween(historyRange.start, historyRange.end) || forecastHorizonOptions[0]?.historyDays || 30
    : historyOption?.historyDays ?? forecastHorizonOptions[0]?.historyDays ?? 30;

  const buildPayload = (): ExceptionTemplateInput => ({
    id: editingId ?? undefined,
    label,
    historyHorizon: derivedHistoryHorizon,
    periodLabel,
    mode: buildTemplateMode(intervals),
    intervals: intervals.map(({ id, ...rest }) => ({ ...rest })),
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setError(null);

    if (!label.trim()) {
      setError('Назовите шаблон, чтобы сохранить его.');
      return;
    }

    if (!intervals.length) {
      setError('Добавьте хотя бы один интервал.');
      return;
    }

    if (conflicts.size) {
      setError('Устраните конфликты в интервалах перед сохранением.');
      return;
    }

    try {
      setSaving(true);
      const saved = await saveExceptionTemplate(buildPayload());
      setTemplates((prev) => {
        const index = prev.findIndex((item) => item.id === saved.id);
        if (index >= 0) {
          const clone = [...prev];
          clone.splice(index, 1, saved);
          return clone;
        }
        return [saved, ...prev];
      });
      setStatus(editingId ? 'Шаблон обновлён.' : 'Шаблон сохранён.');
      if (!editingId) {
        setEditingId(saved.id);
      }
    } catch (submitError) {
      console.error(submitError);
      setError('Не удалось сохранить шаблон.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!editingId) {
      setError('Сохраните шаблон перед экспортом CSV.');
      return;
    }
    try {
      const effectiveHistoryStart = historyRange.start;
      const effectiveHistoryEnd = historyRange.end;
      const effectiveBuildStart = buildRange.start;
      const effectiveBuildEnd = buildRange.end;
      const rawHistoryDays = historyId === 'custom'
        ? calculateDaysBetween(effectiveHistoryStart, effectiveHistoryEnd)
        : historyOption?.historyDays ?? 0;
      const historyDays = rawHistoryDays || calculateDaysBetween(effectiveHistoryStart, effectiveHistoryEnd) || 0;

      const payload = exportExceptionsCsv({
        templateId: editingId,
        queueId,
        historyDays,
        historyStart: effectiveHistoryStart,
        historyEnd: effectiveHistoryEnd,
        buildStart: effectiveBuildStart,
        buildEnd: effectiveBuildEnd,
        timezoneId: timezone.id,
      });
      if (typeof window === 'undefined') {
        console.info(`Download simulated for ${payload.filename}`);
        return;
      }
      const blob = new Blob([payload.content], { type: payload.mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = payload.filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus('CSV экспортирован. Проверьте файл и при необходимости загрузите обратно.');
    } catch (exportError) {
      console.error(exportError);
      setError('Не удалось сформировать CSV.');
    }
  };

  const renderedTemplates = useMemo(
    () => templates.slice().sort((a, b) => a.label.localeCompare(b.label, 'ru')),
    [templates],
  );

  if (loading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Repeat className="h-4 w-4 animate-spin text-purple-500" /> Загружаем шаблоны исключений…
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Задать исключения</h2>
        <p className="mt-2 text-sm text-gray-500">Редактор повторяет §4.2: смешивайте разовые даты и периодические интервалы, задавайте сглаживание и экспортируйте CSV.</p>
      </header>

      {status ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">{status}</div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="space-y-4 lg:col-span-1">
          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Сохранённые шаблоны</h3>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-purple-200 hover:text-purple-600"
              >
                <Plus className="h-3 w-3" /> Новый
              </button>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              {renderedTemplates.map((template) => (
                <li key={template.id} className={`rounded-lg border px-3 py-2 ${editingId === template.id ? 'border-purple-400 bg-purple-50 text-purple-700 shadow-inner' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{template.label}</p>
                      <p className="text-xs text-gray-500">История {template.historyHorizon} дн. · {template.periodLabel || 'Без периода'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => editTemplate(template)}
                        className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-purple-200 hover:text-purple-600"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTemplate(template.id)}
                        className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-rose-200 hover:text-rose-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {!renderedTemplates.length ? (
                <li className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  Шаблонов пока нет. Создайте новый с правой стороны.
                </li>
              ) : null}
            </ul>
          </article>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-gray-900">Параметры шаблона</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Тип исключений:</span>
                <button
                  type="button"
                  onClick={() => setDefaultMode('day')}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition ${
                    defaultMode === 'day'
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  День
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultMode('interval')}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition ${
                    defaultMode === 'interval'
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Интервал
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Название шаблона
                <input
                  type="text"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  placeholder="Например, Праздничная неделя"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Подпись периода
                <input
                  type="text"
                  value={periodLabel}
                  onChange={(event) => setPeriodLabel(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  placeholder="Например, 29.12–08.01"
                />
              </label>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700">История для расчёта</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {forecastHorizonOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleHistoryPresetSelect(option.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                      historyId === option.id ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setHistoryId('custom')}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    historyId === 'custom' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Свой диапазон
                </button>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase text-gray-500">Начало истории ({timezoneLabel})</span>
                  <input
                    type="date"
                    value={convertUtcIsoToDateInput(historyRange.start, timezone.offsetMinutes)}
                    onChange={(event) => handleHistoryRangeChange('start', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase text-gray-500">Конец истории ({timezoneLabel})</span>
                  <input
                    type="date"
                    value={convertUtcIsoToDateInput(historyRange.end, timezone.offsetMinutes)}
                    onChange={(event) => handleHistoryRangeChange('end', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase text-gray-500">Начало построения ({timezoneLabel})</span>
                  <input
                    type="date"
                    value={convertUtcIsoToDateInput(buildRange.start, timezone.offsetMinutes)}
                    onChange={(event) => handleBuildRangeChange('start', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase text-gray-500">Конец построения ({timezoneLabel})</span>
                  <input
                    type="date"
                    value={convertUtcIsoToDateInput(buildRange.end, timezone.offsetMinutes)}
                    onChange={(event) => handleBuildRangeChange('end', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Текущий выбор: история {historyOption?.historyDays ?? forecastHorizonOptions[0]?.historyDays ?? 30} дн., прогноз {historyOption?.forecastDays ?? forecastHorizonOptions[0]?.forecastDays ?? 14} дн.
              </p>
            </div>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Интервалы</h3>
              <button
                type="button"
                onClick={handleAddInterval}
                className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-purple-200 hover:text-purple-600"
              >
                <CalendarPlus className="h-3 w-3" /> Добавить
              </button>
            </div>

            <div className="space-y-3">
              {intervals.map((interval, index) => {
                const hasConflict = conflicts.has(index);
                const isDay = interval.mode === 'day';
                return (
                  <div key={interval.id ?? index} className={`rounded-lg border px-4 py-3 ${hasConflict ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-600">{isDay ? 'Разовая дата' : 'Периодическая запись'}</span>
                        {hasConflict ? <span className="rounded-full bg-amber-200 px-2 py-1 text-xs font-semibold text-amber-800">Проверьте значения</span> : null}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateInterval(index, { mode: isDay ? 'interval' : 'day' })}
                          className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-purple-200 hover:text-purple-600"
                        >
                          Сменить тип
                        </button>
                        <button
                          type="button"
                          onClick={() => removeInterval(index)}
                          className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-rose-200 hover:text-rose-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {isDay ? (
                      <div className="mt-3 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                        <label className="flex flex-col gap-1">
                          Дата начала
                          <input
                            type="date"
                            value={interval.start ?? ''}
                            onChange={(event) => updateInterval(index, { start: event.target.value })}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          Дата окончания
                          <input
                            type="date"
                            value={interval.end ?? ''}
                            onChange={(event) => updateInterval(index, { end: event.target.value })}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="mt-3 grid gap-3 text-sm text-gray-700 md:grid-cols-4">
                        <label className="flex flex-col gap-1">
                          День недели
                          <select
                            value={interval.dayOfWeek ?? 'monday'}
                            onChange={(event) => updateInterval(index, { dayOfWeek: event.target.value })}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                          >
                            {Object.entries(DAY_LABELS).map(([value, title]) => (
                              <option key={value} value={value}>
                                {title}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="flex flex-col gap-1">
                          Начало
                          <input
                            type="time"
                            value={interval.start ?? '09:00'}
                            onChange={(event) => updateInterval(index, { start: event.target.value })}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          Конец
                          <input
                            type="time"
                            value={interval.end ?? '18:00'}
                            onChange={(event) => updateInterval(index, { end: event.target.value })}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          Сглаживание
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={interval.smoothing ?? 0}
                            onChange={(event) => updateInterval(index, { smoothing: Number(event.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-500">{Math.round((interval.smoothing ?? 0) * 100)}%</span>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
              {!intervals.length ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  Добавьте интервал, чтобы настроить шаблон.
                </div>
              ) : null}
            </div>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Очередь для экспорта</span>
                <select
                  value={queueId}
                  onChange={(event) => setQueueId(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  {queueOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-700 hover:border-purple-200"
                >
                  <Download className="h-3 w-3" /> Экспорт CSV
                </button>
                <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-700 hover:border-purple-200">
                  <Upload className="h-3 w-3" /> Импорт CSV
                  <input type="file" accept=".csv" className="hidden" onChange={() => setStatus('Импорт CSV ожидает внедрения API.')} />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
                disabled={saving}
              >
                <Save className="h-4 w-4" /> {saving ? 'Сохраняем…' : 'Сохранить шаблон'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:border-purple-200"
              >
                Сбросить
              </button>
            </div>
          </article>
        </form>
      </div>
    </section>
  );
};

export default ExceptionsWorkspace;
