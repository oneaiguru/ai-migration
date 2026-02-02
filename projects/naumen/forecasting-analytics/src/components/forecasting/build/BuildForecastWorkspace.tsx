import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Download,
  FileDown,
  FileText,
  PlayCircle,
  Upload,
} from 'lucide-react';
import type {
  AbsenteeismProfile,
  ForecastBuildRequest,
  ForecastOptions,
  ForecastPeriod,
  ForecastWindowOption,
  QueueNode,
} from '../../../types/forecasting';
import {
  exportForecastCsv,
  fetchForecastBuildOptions,
  runForecastBuild,
  uploadForecastFile,
  createTemplateExport,
} from '../../../services/forecastingApi';
import type { ForecastUploadKind } from '../../../types/forecasting';
import QueueSelector, { collectAllLeafIds, collectLeafIdsForNode } from '../shared/QueueSelector';
import { useTimezone } from '../common/TimezoneContext';
import { useNotificationCenter } from '../common/NotificationCenter';
import { triggerBrowserDownload } from '../../../utils/download';
import {
  convertDateInputToUtcIso,
  convertDateTimeInputToUtcIso,
  convertUtcIsoToDateInput,
  convertUtcIsoToDateTimeInput,
  timezoneShortLabel,
} from '../../../utils/timezone';

interface BuildLogEntry {
  id: string;
  timestamp: string;
  queues: number;
  historyDays: number;
  forecastDays: number;
  granularity: string;
  message: string;
}

const clampForecastDays = (value: number): number => {
  if (Number.isNaN(value)) return 1;
  return Math.min(120, Math.max(1, Math.round(value)));
};

const formatDateHuman = (value: string) => {
  try {
    return new Date(value).toLocaleString('ru-RU');
  } catch (error) {
    return value;
  }
};

const defaultPeriod = (): ForecastPeriod => {
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { start: now.toISOString(), end: end.toISOString() };
};

const ensureSet = (ids: Iterable<string>) => new Set(Array.from(ids));

const computeHistoryRangeFromDays = (days: number, endISO: string): { start: string; end: string } => {
  const endDate = endISO ? new Date(endISO) : new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
};

const calculateHistoryDays = (startISO: string, endISO: string): number => {
  const startDate = new Date(startISO);
  const endDate = new Date(endISO);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0;
  }
  const diff = endDate.getTime() - startDate.getTime();
  if (diff <= 0) return 0;
  return Math.max(1, Math.round(diff / (24 * 60 * 60 * 1000)));
};

const BuildForecastWorkspace: React.FC = () => {
  const [options, setOptions] = useState<ForecastOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyId, setHistoryId] = useState<string>('');
  const [forecastWindowId, setForecastWindowId] = useState<string>('');
  const [forecastDays, setForecastDays] = useState<number>(30);
  const [period, setPeriod] = useState<ForecastPeriod>(defaultPeriod);
  const [historyRange, setHistoryRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedLeafQueues, setSelectedLeafQueues] = useState<Set<string>>(new Set());
  const [profileId, setProfileId] = useState<string>('');
  const [absenteeismPercent, setAbsenteeismPercent] = useState<number>(5);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [uploadingKind, setUploadingKind] = useState<ForecastUploadKind | null>(null);
  const [logs, setLogs] = useState<BuildLogEntry[]>([]);

  const forecastInputRef = useRef<HTMLInputElement>(null);
  const actualInputRef = useRef<HTMLInputElement>(null);
  const absenteeismInputRef = useRef<HTMLInputElement>(null);
  const statusBannerRef = useRef<HTMLDivElement>(null);
  const { timezone, configureTimezones } = useTimezone();
  const { pushNotification, pushError } = useNotificationCenter();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const loaded = await fetchForecastBuildOptions();
        if (!alive) return;
        setOptions(loaded);
        setPeriod({ start: loaded.defaults.buildPeriodStart, end: loaded.defaults.buildPeriodEnd });
        setHistoryId(loaded.horizons[0]?.id ?? '');
        setForecastWindowId(loaded.forecastWindows[1]?.id ?? loaded.forecastWindows[0]?.id ?? '');
        setForecastDays(loaded.defaults.forecastDays);
        setProfileId(loaded.defaults.absenteeismProfileId);
        setHistoryRange({
          start: loaded.defaults.historyStart,
          end: loaded.defaults.historyEnd,
        });
        configureTimezones(loaded.timezones ?? [], loaded.defaults.timezoneId);
        const defaultProfile = loaded.absenteeismProfiles.find(
          (profile) => profile.id === loaded.defaults.absenteeismProfileId,
        );
        if (defaultProfile) {
          setAbsenteeismPercent(defaultProfile.valuePercent);
        }
        const defaultLeaves = (loaded.defaults.queueIds ?? []).flatMap((id) =>
          collectLeafIdsForNode(loaded.queueTree as QueueNode[], id),
        );
        const initialQueues = defaultLeaves.length ? defaultLeaves : collectAllLeafIds(loaded.queueTree);
        setSelectedLeafQueues(ensureSet(initialQueues));
      } catch (error) {
        console.error(error);
        setErrorMessage('Не удалось загрузить настройки. Попробуйте обновить страницу.');
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const currentOptions = useMemo(() => options, [options]);

  const historyPreset = useMemo(
    () => currentOptions?.horizons.find((option) => option.id === historyId) ?? null,
    [currentOptions, historyId],
  );

  const forecastWindow = useMemo(
    () => currentOptions?.forecastWindows.find((option) => option.id === forecastWindowId) ?? null,
    [currentOptions, forecastWindowId],
  );

  useEffect(() => {
    if (!forecastWindow) return;
    setForecastDays(forecastWindow.days);
  }, [forecastWindow]);

  useEffect(() => {
    if (!currentOptions) return;
    if (historyId === 'custom') return;
    if (!historyPreset) return;
    const range = computeHistoryRangeFromDays(historyPreset.historyDays, period.start);
    setHistoryRange(range);
  }, [currentOptions, historyId, historyPreset, period.start]);

  const currentProfile = useMemo<AbsenteeismProfile | null>(() => {
    if (!currentOptions) return null;
    return currentOptions.absenteeismProfiles.find((profile) => profile.id === profileId) ?? null;
  }, [currentOptions, profileId]);

  const granularity = historyPreset?.granularity ?? currentOptions?.defaults.granularity ?? 'day';

  const totalQueues = selectedLeafQueues.size;
  const timezoneLabel = useMemo(() => timezoneShortLabel(timezone), [timezone]);

  const updatePeriod = (key: keyof ForecastPeriod, value: string) => {
    setPeriod((prev) => ({ ...prev, [key]: value }));
  };

  const handleForecastDaysChange = (value: number) => {
    setForecastWindowId('custom');
    setForecastDays(clampForecastDays(value));
  };

  const handleSelectionChange = useCallback((next: Set<string>) => {
    setSelectedLeafQueues(new Set(next));
  }, []);

  const selectAllQueues = () => {
    if (!currentOptions) return;
    setSelectedLeafQueues(ensureSet(collectAllLeafIds(currentOptions.queueTree)));
  };

  const clearQueues = () => setSelectedLeafQueues(new Set());

  const handleHistoryPresetChange = (id: string) => {
    setHistoryId(id);
    if (!currentOptions) return;
    const preset = currentOptions.horizons.find((option) => option.id === id);
    if (preset) {
      const range = computeHistoryRangeFromDays(preset.historyDays, period.start);
      setHistoryRange(range);
    }
  };

const handleHistoryDateChange = (key: 'start' | 'end', value: string) => {
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

  const handleForecastPeriodDateChange = (key: 'start' | 'end', value: string) => {
    if (!value) return;
    const iso = convertDateInputToUtcIso(value, timezone.offsetMinutes);
    if (!iso) return;

    setForecastWindowId('custom');
    const nextStart = key === 'start' ? iso : period.start;
    const nextEnd = key === 'end' ? iso : period.end;

    setPeriod((prev) => {
      const next: ForecastPeriod = { ...prev, start: nextStart, end: nextEnd };
      if (next.start && next.end && next.start > next.end) {
        return key === 'start' ? { ...next, end: next.start } : { ...next, start: next.end };
      }
      return next;
    });

    setForecastDays((prev) => {
      const recalculated = calculateHistoryDays(nextStart, nextEnd);
      return recalculated > 0 ? recalculated : prev;
    });
  };

  const handleBuild = async () => {
    if (!currentOptions) return;
    if (!selectedLeafQueues.size) {
      setErrorMessage('Выберите хотя бы одну очередь для расчёта.');
      return;
    }

    setIsBuilding(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const effectiveHistoryStart = historyRange.start || currentOptions.defaults.historyStart;
      const effectiveHistoryEnd = historyRange.end || currentOptions.defaults.historyEnd;
      const effectiveBuildStart = period.start || currentOptions.defaults.buildPeriodStart;
      const effectiveBuildEnd = period.end || currentOptions.defaults.buildPeriodEnd;

      const derivedHistoryDays = historyId === 'custom'
        ? calculateHistoryDays(effectiveHistoryStart, effectiveHistoryEnd) || currentOptions.defaults.historyDays
        : historyPreset?.historyDays ?? currentOptions.defaults.historyDays;

      const payload: ForecastBuildRequest = {
        queueIds: Array.from(selectedLeafQueues),
        period: { start: effectiveBuildStart, end: effectiveBuildEnd },
        historyDays: derivedHistoryDays,
        forecastDays,
        granularity,
        absenteeismProfileId: profileId,
        absenteeismPercent,
        historyStart: effectiveHistoryStart,
        historyEnd: effectiveHistoryEnd,
        buildStart: effectiveBuildStart,
        buildEnd: effectiveBuildEnd,
      };

      const result = await runForecastBuild(payload);
      const message = result.message ?? 'Прогноз рассчитан. Проверьте отчёт и графики.';
      setStatusMessage(message);
      pushNotification({
        title: 'Задача расчёта запущена',
        message: `${payload.queueIds.length} очередей, ${payload.historyDays} дней истории, ${payload.forecastDays} дней прогноза`,
        kind: 'success',
      });
      setLogs((prev) => {
        const entry: BuildLogEntry = {
          id: result.jobId,
          timestamp: result.createdAt,
          queues: payload.queueIds.length,
          historyDays: payload.historyDays,
          forecastDays: payload.forecastDays,
          granularity: payload.granularity,
          message: result.message,
        };
        const combined = [entry, ...prev];
        return combined.slice(0, 5);
      });
    } catch (error) {
      console.error(error);
      setErrorMessage('Не удалось запустить расчёт. Попробуйте ещё раз.');
      pushError('Ошибка расчёта прогноза', 'Не удалось запустить расчёт. Попробуйте ещё раз.');
    } finally {
      setIsBuilding(false);
    }
  };

  const triggerForecastExport = () => {
    if (!currentOptions) return;
    const queueIds = selectedLeafQueues.size
      ? Array.from(selectedLeafQueues)
      : collectAllLeafIds(currentOptions.queueTree);
    const exportPayload = exportForecastCsv({
      queueIds,
      period,
      timezoneId: timezone.id,
    });
    triggerBrowserDownload({
      filename: exportPayload.filename,
      mimeType: exportPayload.mimeType,
      content: exportPayload.content,
    });
    pushNotification({
      title: 'CSV шаблон прогноза готов',
      message: `Файл ${exportPayload.filename} выгружен`,
      kind: 'success',
      downloadHref: `data:${exportPayload.mimeType};charset=utf-8,${encodeURIComponent(exportPayload.content)}`,
      downloadLabel: exportPayload.filename,
    });
    setStatusMessage('Шаблон прогноза выгружен. Заполните CSV и загрузите обратно.');
  };

  const triggerTemplateDownload = (kind: ForecastUploadKind) => {
    const queueIds = currentOptions
      ? selectedLeafQueues.size
        ? Array.from(selectedLeafQueues)
        : collectAllLeafIds(currentOptions.queueTree)
      : Array.from(selectedLeafQueues);
    const exportPayload = createTemplateExport(kind, queueIds, period, { timezoneId: timezone.id });
    triggerBrowserDownload({
      filename: exportPayload.filename,
      mimeType: exportPayload.mimeType,
      content: exportPayload.content,
    });
    pushNotification({
      title: 'Шаблон выгружен',
      message: `Файл ${exportPayload.filename} готов к заполнению`,
      kind: 'success',
      downloadHref: `data:${exportPayload.mimeType};charset=utf-8,${encodeURIComponent(exportPayload.content)}`,
      downloadLabel: exportPayload.filename,
    });
    setStatusMessage('CSV выгружен. Дополните значения и используйте загрузку.');
  };

  const handleUpload = async (kind: ForecastUploadKind, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingKind(kind);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const result = await uploadForecastFile(kind, file);
      setStatusMessage(result.message);
    } catch (error) {
      console.error(error);
      setErrorMessage('Не удалось загрузить файл. Проверьте формат CSV.');
      pushError('Ошибка загрузки CSV', 'Не удалось обработать файл. Проверьте формат.');
    } finally {
      setUploadingKind(null);
      event.target.value = '';
    }
  };

  useEffect(() => {
    if (statusMessage && statusBannerRef.current) {
      statusBannerRef.current.focus();
      statusBannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [statusMessage]);

  if (loading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Clock3 className="h-4 w-4 animate-spin text-purple-500" /> Загружаем настройки построения прогноза…
        </div>
      </section>
    );
  }

  if (!currentOptions) {
    return (
      <section className="rounded-xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5" /> Не удалось инициализировать страницу. Попробуйте обновить.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Построить прогноз</h2>
            <p className="mt-1 text-sm text-gray-500">Повторяем §4.1 руководства: структура → история → прогноз → загрузки CSV.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileText className="h-4 w-4" /> Выбрано очередей: {totalQueues}
          </div>
        </div>
      </header>

      {statusMessage ? (
        <div
          ref={statusBannerRef}
          tabIndex={-1}
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{statusMessage}</span>
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">1. Очереди</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <button
                  type="button"
                  onClick={selectAllQueues}
                  className="rounded border border-gray-200 px-2 py-1 hover:border-purple-200 hover:text-purple-600"
                >
                  Выбрать все
                </button>
                <button
                  type="button"
                  onClick={clearQueues}
                  className="rounded border border-gray-200 px-2 py-1 hover:border-purple-200 hover:text-purple-600"
                >
                  Очистить
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">Структура «Рабочая структура» (§4.1, блок 1). Отмечайте нужные очереди, родитель охватывает поддерево.</p>
            <div className="mt-3 max-h-[420px] overflow-y-auto pr-1">
              <QueueSelector
                tree={currentOptions.queueTree as QueueNode[]}
                selectedLeafIds={selectedLeafQueues}
                onSelectionChange={handleSelectionChange}
              />
            </div>
          </article>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">2. История и прогноз</h3>
            <p className="mt-1 text-xs text-gray-500">Исторический горизонт и окно прогноза — повторяем переключатели из формы Naumen.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CalendarRange className="h-4 w-4 text-purple-500" /> История
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentOptions.horizons.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleHistoryPresetChange(option.id)}
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
                    <span className="text-xs uppercase text-gray-500">
                      Начало истории ({timezoneLabel})
                    </span>
                    <input
                      type="date"
                      value={convertUtcIsoToDateInput(historyRange.start, timezone.offsetMinutes)}
                      onChange={(event) => handleHistoryDateChange('start', event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs uppercase text-gray-500">
                      Конец истории ({timezoneLabel})
                    </span>
                    <input
                      type="date"
                      value={convertUtcIsoToDateInput(historyRange.end, timezone.offsetMinutes)}
                      onChange={(event) => handleHistoryDateChange('end', event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </label>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Текущий выбор: {historyPreset?.historyDays ?? currentOptions.defaults.historyDays} дн., шаг
                  {granularity === 'interval' ? ' 15 минут' : ' сутки'}.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CalendarRange className="h-4 w-4 text-purple-500" /> Окно прогноза
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentOptions.forecastWindows.map((window: ForecastWindowOption) => (
                    <button
                      key={window.id}
                      type="button"
                      onClick={() => {
                        setForecastWindowId(window.id);
                        setForecastDays(window.days);
                      }}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                        forecastWindowId === window.id ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {window.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setForecastWindowId('custom')}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                      forecastWindowId === 'custom' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Свой горизонт
                  </button>
                </div>
                <label className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                  <span className="uppercase">Прогноз, дней</span>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={forecastDays}
                    onChange={(event) => handleForecastDaysChange(Number(event.target.value))}
                    className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </label>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">3. Период построения</h3>
            <p className="mt-1 text-xs text-gray-500">Интервал построения прогнозов. Значения до API сохраняются локально.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase text-gray-500">Начало построения ({timezoneLabel})</span>
                <input
                  type="date"
                  value={convertUtcIsoToDateInput(period.start, timezone.offsetMinutes)}
                  onChange={(event) => handleForecastPeriodDateChange('start', event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase text-gray-500">Конец построения ({timezoneLabel})</span>
                <input
                  type="date"
                  value={convertUtcIsoToDateInput(period.end, timezone.offsetMinutes)}
                  onChange={(event) => handleForecastPeriodDateChange('end', event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </label>
            </div>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">4. Абсентеизм</h3>
            <p className="mt-1 text-xs text-gray-500">Выберите профиль (§4.3, рис.29.9) или задайте своё значение.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {currentOptions.absenteeismProfiles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setProfileId(item.id);
                    setAbsenteeismPercent(item.valuePercent);
                  }}
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    profileId === item.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.coverage}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-600">{item.valuePercent}%</p>
                  {item.notes ? <p className="mt-1 text-xs text-gray-500">{item.notes}</p> : null}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <span className="text-xs uppercase text-gray-500">Своё значение</span>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={absenteeismPercent}
                  onChange={(event) => setAbsenteeismPercent(Math.min(Math.max(Number(event.target.value), 0), 40))}
                  className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
                <span className="text-xs text-gray-500">Применится ко всем очередям</span>
              </label>
              {currentProfile?.notes ? <p className="text-xs text-gray-500">{currentProfile.notes}</p> : null}
            </div>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">5. Действия</h3>
            <p className="mt-1 text-xs text-gray-500">Импорт/экспорт CSV и запуск расчёта (рис.26 руководства).</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleBuild}
                disabled={isBuilding || !selectedLeafQueues.size}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
              >
                <PlayCircle className="h-4 w-4" /> {isBuilding ? 'Построение…' : 'Построить прогноз'}
              </button>
              <button
                type="button"
                onClick={() => triggerForecastExport()}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200"
              >
                <Download className="h-4 w-4" /> Экспорт прогноза
              </button>
              <button
                type="button"
                onClick={() => triggerTemplateDownload('actual')}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200"
              >
                <FileDown className="h-4 w-4" /> Шаблон факта
              </button>
              <button
                type="button"
                onClick={() => triggerTemplateDownload('absenteeism')}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200"
              >
                <FileDown className="h-4 w-4" /> Шаблон абсентеизма
              </button>
              <button
                type="button"
                onClick={() => forecastInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200"
              >
                <Upload className="h-4 w-4" /> Загрузить прогноз
              </button>
              <button
                type="button"
                onClick={() => actualInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200"
              >
                <Upload className="h-4 w-4" /> Загрузить факт
              </button>
              <button
                type="button"
                onClick={() => absenteeismInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200"
              >
                <Upload className="h-4 w-4" /> Загрузить абсентеизм
              </button>
            </div>
            {uploadingKind ? (
              <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <Clock3 className="h-3 w-3 animate-spin" /> Загружаем {uploadingKind === 'forecast' ? 'прогноз' : uploadingKind === 'actual' ? 'факт' : 'абсентеизм'}…
              </p>
            ) : null}

            <input
              ref={forecastInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(event) => handleUpload('forecast', event)}
            />
            <input
              ref={actualInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(event) => handleUpload('actual', event)}
            />
            <input
              ref={absenteeismInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(event) => handleUpload('absenteeism', event)}
            />
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">6. Последние расчёты</h3>
            {logs.length ? (
              <ul className="mt-3 space-y-3 text-sm text-gray-700">
                {logs.map((log) => (
                  <li key={log.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                      <span>{formatDateHuman(log.timestamp)}</span>
                      <span>{log.queues} очеред.</span>
                    </div>
                    <div className="mt-1 text-sm font-medium text-gray-800">{log.message}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      История {log.historyDays} дн. · прогноз {log.forecastDays} дн. · шаг {log.granularity === 'interval' ? '15 минут' : 'сутки'}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-gray-500">Запусков ещё не было. После расчёта появится журнал.</p>
            )}
          </article>
        </div>
      </div>
    </section>
  );
};

export default BuildForecastWorkspace;
