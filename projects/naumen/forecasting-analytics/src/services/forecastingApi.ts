import { addDays } from 'date-fns';

import {
  absenteeismProfiles,
  absenteeismTemplates as absenteeismTemplateFixtures,
  absenteeismCalculatorPresets,
  buildForecastDefaults,
  exceptionTemplates as exceptionTemplateFixtures,
  forecastDetailRows,
  forecastHorizonOptions,
  forecastSeries,
  forecastWindowOptions,
  granularityModes,
  queueTree,
  timezoneOptions,
  trendSeedDefaults,
  trendSeriesByQueue,
} from '../data/forecastingFixtures';
import type {
  AbsenteeismTemplate,
  AbsenteeismTemplateInput,
  AbsenteeismCalculationInput,
  AbsenteeismCalculationResult,
  AbsenteeismCalculatorPreset,
  AbsenteeismExportRequest,
  ExceptionTemplate,
  ExceptionTemplateInput,
  ExportPayload,
  ExceptionsExportRequest,
  ForecastExportRequest,
  ForecastBuildRequest,
  ForecastBuildResponse,
  ForecastDetailRequest,
  ForecastDetailRow,
  ForecastOptions,
  ForecastPeriod,
  ForecastUploadKind,
  QueueNode,
  TrendExportRequest,
  UploadResult,
} from '../types/forecasting';
import type { AdjustmentPayload, AdjustmentResult } from '../types/adjustments';

const API_URL = import.meta.env.VITE_FORECASTING_API_URL;
const hasApiEndpoint = typeof API_URL === 'string' && API_URL.length > 0;

const withBase = (path: string): string => (hasApiEndpoint ? `${API_URL!.replace(/\/$/, '')}${path}` : path);

const cloneExceptions = (templates: ExceptionTemplate[]): ExceptionTemplate[] =>
  templates.map((template) => ({
    ...template,
    intervals: template.intervals.map((interval) => ({ ...interval })),
  }));

const cloneAbsenteeism = (templates: AbsenteeismTemplate[]): AbsenteeismTemplate[] =>
  templates.map((template) => ({
    ...template,
    periodicRules: template.periodicRules.map((rule) => ({ ...rule })),
    singleOverrides: template.singleOverrides.map((override) => ({ ...override })),
  }));

const cloneQueueNodes = (nodes: QueueNode[]): QueueNode[] =>
  nodes.map((node) => ({
    ...node,
    children: node.children ? cloneQueueNodes(node.children) : undefined,
  }));

const findExceptionTemplate = (id: string): ExceptionTemplate | undefined =>
  exceptionStore.find((template) => template.id === id);

const findAbsenteeismTemplate = (id: string): AbsenteeismTemplate | undefined =>
  absenteeismStore.find((template) => template.id === id);

const exceptionStore = cloneExceptions(exceptionTemplateFixtures);
const absenteeismStore = cloneAbsenteeism(absenteeismTemplateFixtures);

const wait = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const ruNumber = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const ruPercent = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const ensuredQueues = (): QueueNode[] =>
  queueTree.length ? queueTree : [{ id: 'default-queue', name: 'Основная очередь', children: [] }];

const defaultQueueIds = () => {
  const nodes = ensuredQueues();
  const [first] = nodes;
  return first ? [first.id] : ['queue'];
};

const flatChildIds = (nodes: QueueNode[]): string[] =>
  nodes.flatMap((node) => [node.id, ...(node.children ? flatChildIds(node.children) : [])]);

const resolveTimezone = (id: string | undefined) =>
  timezoneOptions.find((option) => option.id === id) ?? timezoneOptions[0];

const describeTimezone = (id: string | undefined): string => {
  const match = resolveTimezone(id);
  if (!match) {
    return id ?? 'UTC';
  }
  return match.shortLabel || match.label || match.id;
};

export const fetchForecastBuildOptions = async (): Promise<ForecastOptions> => {
  if (hasApiEndpoint) {
    try {
      const response = await fetch(withBase('/forecast/options'));
      if (response.ok) {
        const json = await response.json();
        const timezones = Array.isArray(json.timezones) && json.timezones.length
          ? json.timezones
          : timezoneOptions;

        return {
          queueTree: cloneQueueNodes(json.queueTree ?? queueTree),
          horizons: (json.horizons ?? forecastHorizonOptions).map((option: ForecastHorizonOption) => ({
            ...option,
            days: option.days ?? option.historyDays,
          })),
          forecastWindows: (json.forecastWindows ?? forecastWindowOptions).map((window: ForecastWindowOption) => ({
            ...window,
          })),
          granularityModes: json.granularityModes ?? granularityModes,
          defaultPeriod: json.defaultPeriod ?? {
            start: buildForecastDefaults.buildPeriodStart,
            end: buildForecastDefaults.buildPeriodEnd,
          },
          absenteeismProfiles: (json.absenteeismProfiles ?? absenteeismProfiles).map((profile: any) => ({ ...profile })),
          defaults: {
            ...buildForecastDefaults,
            ...(json.defaults ?? {}),
            queueIds: Array.isArray(json.defaults?.queueIds)
              ? [...json.defaults.queueIds]
              : [...buildForecastDefaults.queueIds],
            historyStart: json.defaults?.historyStart ?? buildForecastDefaults.historyStart,
            historyEnd: json.defaults?.historyEnd ?? buildForecastDefaults.historyEnd,
            buildPeriodStart: json.defaults?.buildPeriodStart ?? buildForecastDefaults.buildPeriodStart,
            buildPeriodEnd: json.defaults?.buildPeriodEnd ?? buildForecastDefaults.buildPeriodEnd,
            timezoneId: json.defaults?.timezoneId ?? buildForecastDefaults.timezoneId,
          },
          calculatorPresets: (json.calculatorPresets ?? absenteeismCalculatorPresets).map(
            (preset: AbsenteeismCalculatorPreset) => ({ ...preset }),
          ),
          timezones: timezones.map((tz: any) => ({ ...tz })),
        } satisfies ForecastOptions;
      }
    } catch (error) {
      console.warn('Не удалось получить настройки прогноза из API', error);
    }
  }

  return {
    queueTree: cloneQueueNodes(queueTree),
    horizons: forecastHorizonOptions.map((option) => ({ ...option, days: option.days ?? option.historyDays })),
    forecastWindows: forecastWindowOptions.map((window) => ({ ...window })),
    granularityModes: [...granularityModes],
    defaultPeriod: {
      start: buildForecastDefaults.buildPeriodStart,
      end: buildForecastDefaults.buildPeriodEnd,
    },
    absenteeismProfiles: absenteeismProfiles.map((profile) => ({ ...profile })),
    defaults: {
      ...buildForecastDefaults,
      queueIds: [...buildForecastDefaults.queueIds],
      historyStart: buildForecastDefaults.historyStart,
      historyEnd: buildForecastDefaults.historyEnd,
      buildPeriodStart: buildForecastDefaults.buildPeriodStart,
      buildPeriodEnd: buildForecastDefaults.buildPeriodEnd,
      timezoneId: buildForecastDefaults.timezoneId,
    },
    calculatorPresets: absenteeismCalculatorPresets.map((preset) => ({ ...preset })),
    timezones: timezoneOptions.map((timezone) => ({ ...timezone })),
  };
};

/** @deprecated Используйте fetchForecastBuildOptions */
export const fetchForecastOptions = fetchForecastBuildOptions;

export const runForecastBuild = async (payload: ForecastBuildRequest): Promise<ForecastBuildResponse> => {
  if (hasApiEndpoint) {
    const response = await fetch(withBase('/forecast/build'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Forecast build failed: ${response.status}`);
    }
    return response.json();
  }

  await wait(350);

  const historyDays = payload.historyDays ?? payload.horizonDays ?? buildForecastDefaults.historyDays;
  const forecastDays = payload.forecastDays ?? buildForecastDefaults.forecastDays;

  return {
    jobId: `sim-${Date.now()}`,
    createdAt: new Date().toISOString(),
    message: `Расчёт запущен для ${payload.queueIds.length} очеред${payload.queueIds.length === 1 ? 'и' : 'ей'}: история ${historyDays} дн. (${payload.historyStart.slice(0, 10)} → ${payload.historyEnd.slice(0, 10)}), прогноз ${forecastDays} дн. (${payload.buildStart.slice(0, 10)} → ${payload.buildEnd.slice(0, 10)}), шаг ${payload.granularity === 'interval' ? '15 минут' : 'сутки'}, часовой пояс ${describeTimezone(payload.timezoneId)}.`,
  };
};

export const uploadForecastFile = async (kind: ForecastUploadKind, file: File): Promise<UploadResult> => {
  if (hasApiEndpoint) {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(withBase(`/forecast/upload/${kind}`), {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const json = await response.json().catch(() => ({}));
    return {
      kind,
      savedAt: json?.savedAt ?? new Date().toISOString(),
      message: json?.message ?? 'Файл принят на обработку.',
    };
  }

  await wait(180);

  return {
    kind,
    savedAt: new Date().toISOString(),
    message: `Загружен файл «${file.name}» (${Math.round(file.size / 1024)} КБ). Реальное сохранение появится после интеграции API.`,
  };
};

const pickSeries = (count: number) => forecastSeries.slice(0, count);

const templateHeader = (kind: ForecastUploadKind): string => {
  switch (kind) {
    case 'forecast':
      return 'timestamp,queue_id,forecast';
    case 'actual':
      return 'timestamp,queue_id,fact';
    case 'absenteeism':
      return 'date,queue_id,value_percent';
    default:
      return 'timestamp,queue_id,value';
  }
};

const normalizeQueueSelection = (queueIds: string[]): string[] => {
  if (queueIds.length) return queueIds;
  const flattened = flatChildIds(ensuredQueues());
  return flattened.length ? flattened : defaultQueueIds();
};

const sliceByPeriod = (period: ForecastPeriod) =>
  pickSeries(96).filter((point) => point.timestamp >= period.start && point.timestamp <= period.end);

const formatTemplateRow = (kind: ForecastUploadKind, queueId: string, index: number, timestamp: string) => {
  switch (kind) {
    case 'forecast':
      return `${timestamp},${queueId},${Math.round(140 + (index % 8) * 6)}`;
    case 'actual': {
      const base = Math.round(135 + (index % 5) * 4);
      return `${timestamp},${queueId},${base}`;
    }
    case 'absenteeism':
      return `${timestamp.split('T')[0]},${queueId},${ruPercent.format(index % 2 === 0 ? 5 : 7)}`;
    default:
      return `${timestamp},${queueId},0`;
  }
};

export const createTemplateExport = (
  kind: ForecastUploadKind,
  queueIds: string[],
  period: ForecastPeriod,
  options?: { timezoneId?: string },
): ExportPayload => {
  const ids = normalizeQueueSelection(queueIds);
  const header = templateHeader(kind);
  const rows: string[] = [];
  const series = sliceByPeriod(period);

  series.forEach((point, index) => {
    ids.forEach((queueId) => {
      rows.push(formatTemplateRow(kind, queueId, index, point.timestamp));
    });
  });

  const timezoneLabel = options?.timezoneId ? describeTimezone(options.timezoneId) : undefined;
  const safeLabel = timezoneLabel ? timezoneLabel.replace(/[^A-Za-z0-9+]+/g, '-') : undefined;
  const filename = `template_${kind}_${new Date().toISOString().split('T')[0]}${safeLabel ? `_${safeLabel}` : ''}.csv`;
  const timezoneMeta = timezoneLabel ? `# timezone=${timezoneLabel}\n` : '';

  return {
    filename,
    mimeType: 'text/csv;charset=utf-8',
    content: `${timezoneMeta}${header}\n${rows.join('\n')}`,
  };
};

export const exportForecastCsv = (request: ForecastExportRequest): ExportPayload =>
  createTemplateExport('forecast', request.queueIds, request.period, {
    timezoneId: request.timezoneId,
  });

export const exportAbsenteeismCsv = (request: AbsenteeismExportRequest): ExportPayload => {
  if (hasApiEndpoint) {
    // TODO(api): заменить на вызов `/forecast/absenteeism/export` после публикации эндпоинта
  }

  const targets = request.templateIds.length
    ? absenteeismStore.filter((template) => request.templateIds.includes(template.id))
    : absenteeismStore.slice(0, 1);

  const header = 'template_id,entry_type,value,label';
  const rows: string[] = [];

  targets.forEach((template) => {
    template.periodicRules.forEach((rule) => {
      rows.push(
        `${template.id},periodic,${rule.valuePercent},${rule.dayOfWeek} ${rule.start}-${rule.end}`,
      );
    });
    template.singleOverrides.forEach((override) => {
      rows.push(`${template.id},override,${override.valuePercent},${override.date}`);
    });
  });

  return {
    filename: `absenteeism_export_${new Date().toISOString().split('T')[0]}.csv`,
    mimeType: 'text/csv;charset=utf-8',
    content: `${header}\n${rows.join('\n')}`,
  };
};

export const exportExceptionsCsv = (request: ExceptionsExportRequest): ExportPayload => {
  if (hasApiEndpoint) {
    // TODO(api): заменить на вызов `/forecast/exceptions/export` с передачей templateId/queueId/historyDays`
  }

  const template = findExceptionTemplate(request.templateId) ?? exceptionStore[0];
  const header = 'template_id,queue_id,mode,start,end,smoothing,history_start,history_end,build_start,build_end';
  const rows = template.intervals.map((interval) =>
    [
      template.id,
      request.queueId,
      interval.mode,
      interval.mode === 'day' ? interval.start : `${interval.dayOfWeek ?? '—'} ${interval.start}`,
      interval.end,
      interval.smoothing ?? '',
      request.historyStart,
      request.historyEnd,
      request.buildStart,
      request.buildEnd,
    ].join(','),
  );

  const timezoneMeta = request.timezoneId ? `# timezone=${describeTimezone(request.timezoneId)}\n` : '';
  const timezoneSuffix = request.timezoneId ? `_${describeTimezone(request.timezoneId).replace(/[^A-Za-z0-9+]+/g, '-')}` : '';

  return {
    filename: `exceptions_export_${template.id}_${request.historyDays}d${timezoneSuffix}.csv`,
    mimeType: 'text/csv;charset=utf-8',
    content: `${timezoneMeta}${header}\n${rows.join('\n')}`,
  };
};

export const calculateAbsenteeism = async (
  input: AbsenteeismCalculationInput,
): Promise<AbsenteeismCalculationResult> => {
  if (hasApiEndpoint) {
    try {
      const response = await fetch(withBase('/forecast/absenteeism/calculate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('Не удалось выполнить расчёт абсентеизма через API', error);
    }
  }

  await wait(220);

  const template = findAbsenteeismTemplate(input.templateId) ?? absenteeismStore[0];
  const baselinePercent = template?.valuePercent ?? input.historyDays > 45 ? 6 : 4;
  const complexityFactor = (template?.periodicRules.length ?? 1) * 0.15;
  const loadFactor = Math.min(6, input.forecastDays / Math.max(14, input.historyDays)) * 1.8;
  const intervalFactor = input.intervalMinutes >= 60 ? 0.6 : 1.1;
  const recommendedPercent = Number(
    Math.min(28, baselinePercent + complexityFactor + loadFactor * intervalFactor).toFixed(1),
  );
  const deltaPercent = Number((recommendedPercent - baselinePercent).toFixed(1));

  const startDate = new Date(trendSeedDefaults.period.start);
  const series = Array.from({ length: Math.max(1, input.forecastDays) }, (_, day) => {
    const timestamp = addDays(startDate, day).toISOString();
    const seasonalSwing = Math.sin((day + 1) / 3) * 0.4;
    const baselinePoint = Number((baselinePercent + seasonalSwing).toFixed(2));
    const scenarioPoint = Number((baselinePoint + deltaPercent * 0.65).toFixed(2));
    return {
      timestamp,
      baselinePercent: baselinePoint,
      scenarioPercent: scenarioPoint,
    };
  });

  const message =
    deltaPercent > 0
      ? `Рекомендуем увеличить норматив до ${recommendedPercent}% для поддержания SLA.`
      : 'Текущий норматив соответствует расчётам. Дополнительных действий не требуется.';

  return {
    queueId: input.queueId,
    templateId: input.templateId,
    historyDays: input.historyDays,
    forecastDays: input.forecastDays,
    intervalMinutes: input.intervalMinutes,
    baselinePercent,
    recommendedPercent,
    deltaPercent,
    message,
    series,
  } satisfies AbsenteeismCalculationResult;
};

export const fetchExceptionTemplates = async (): Promise<ExceptionTemplate[]> => {
  if (hasApiEndpoint) {
    try {
      const response = await fetch(withBase('/forecast/exceptions/templates'));
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('Не удалось получить шаблоны исключений из API', error);
    }
  }

  await wait(120);
  return cloneExceptions(exceptionStore);
};

export const saveExceptionTemplate = async (
  input: ExceptionTemplateInput,
): Promise<ExceptionTemplate> => {
  if (hasApiEndpoint) {
    const response = await fetch(withBase('/forecast/exceptions/templates'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error(`Exception template save failed: ${response.status}`);
    }
    return response.json();
  }

  await wait(160);

  const id = input.id ?? `exception-${Date.now()}`;
  const template: ExceptionTemplate = {
    id,
    label: input.label,
    historyHorizon: input.historyHorizon,
    periodLabel: input.periodLabel,
    mode: input.mode,
    intervals: input.intervals.map((interval) => ({
      id: `interval-${Math.random().toString(36).slice(2, 8)}`,
      ...interval,
    })),
    lastRunAt: new Date().toISOString(),
    author: 'planner@demo',
  };

  const index = exceptionStore.findIndex((item) => item.id === id);
  if (index >= 0) {
    exceptionStore.splice(index, 1, template);
  } else {
    exceptionStore.push(template);
  }

  return { ...template, intervals: template.intervals.map((interval) => ({ ...interval })) };
};

export const deleteExceptionTemplate = async (id: string): Promise<void> => {
  if (hasApiEndpoint) {
    const response = await fetch(withBase(`/forecast/exceptions/templates/${id}`), { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`Удаление шаблона исключений не удалось: ${response.status}`);
    }
    return;
  }

  await wait(120);
  const index = exceptionStore.findIndex((template) => template.id === id);
  if (index >= 0) {
    exceptionStore.splice(index, 1);
  }
};

export const fetchAbsenteeismTemplates = async (): Promise<AbsenteeismTemplate[]> => {
  if (hasApiEndpoint) {
    try {
      const response = await fetch(withBase('/forecast/absenteeism/templates'));
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('Не удалось получить шаблоны абсентеизма из API', error);
    }
  }

  await wait(120);
  return cloneAbsenteeism(absenteeismStore);
};

export const saveAbsenteeismTemplate = async (
  input: AbsenteeismTemplateInput,
): Promise<AbsenteeismTemplate> => {
  if (hasApiEndpoint) {
    const response = await fetch(withBase('/forecast/absenteeism/templates'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error(`Absenteeism template save failed: ${response.status}`);
    }
    return response.json();
  }

  await wait(160);

  const id = input.id ?? `abs-${Date.now()}`;
  const template: AbsenteeismTemplate = {
    id,
    name: input.name,
    coverage: input.coverage,
    valuePercent: input.valuePercent,
    periodicRules: input.periodicRules.map((rule) => ({
      id: rule.id ?? `rule-${Math.random().toString(36).slice(2, 8)}`,
      ...rule,
    })),
    singleOverrides: input.singleOverrides.map((override) => ({
      id: override.id ?? `override-${Math.random().toString(36).slice(2, 8)}`,
      ...override,
    })),
    updatedAt: new Date().toISOString(),
    author: 'planner@demo',
  };

  const index = absenteeismStore.findIndex((item) => item.id === id);
  if (index >= 0) {
    absenteeismStore.splice(index, 1, template);
  } else {
    absenteeismStore.push(template);
  }

  return cloneAbsenteeism([template])[0];
};

export const deleteAbsenteeismTemplate = async (id: string): Promise<void> => {
  if (hasApiEndpoint) {
    const response = await fetch(withBase(`/forecast/absenteeism/templates/${id}`), { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`Удаление шаблона абсентеизма не удалось: ${response.status}`);
    }
    return;
  }

  await wait(120);
  const index = absenteeismStore.findIndex((template) => template.id === id);
  if (index >= 0) {
    absenteeismStore.splice(index, 1);
  }
};

export const fetchForecastDetail = async (
  request: ForecastDetailRequest,
): Promise<ForecastDetailRow[]> => {
  if (hasApiEndpoint) {
    try {
      const response = await fetch(withBase('/forecast/detail'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('Не удалось получить детализацию прогноза из API', error);
    }
  }

  await wait(80);
  return forecastDetailRows.filter(
    (row) => row.timestamp >= request.period.start && row.timestamp <= request.period.end,
  );
};

export const createTrendExport = (request: TrendExportRequest): ExportPayload => {
  const header = 'timestamp,queue_id,mode,forecast,fact,abs_delta,rel_delta';
  const rows: string[] = [];

  const periodStart = new Date(request.period.start).getTime();
  const periodEnd = new Date(request.period.end).getTime();

  request.queueIds.forEach((queueId) => {
    const fixture = trendSeriesByQueue.find((item) => item.queueId === queueId) ?? trendSeriesByQueue[0];
    const series = fixture[request.mode] ?? fixture.strategic;

    series.forEach((point) => {
      const timestampValue = new Date(point.timestamp).getTime();
      if (timestampValue < periodStart || timestampValue > periodEnd) {
        return;
      }
      const forecast = point.forecast;
      const actual = point.actual ?? point.forecast;
      const abs = actual - forecast;
      const rel = forecast === 0 ? 0 : (abs / forecast) * 100;
      rows.push(
        `${point.timestamp},${queueId},${request.mode},${forecast},${actual},${ruNumber.format(abs)},${ruNumber.format(rel)}`,
      );
    });
  });

  const timezoneLabel = request.timezoneId ? describeTimezone(request.timezoneId) : undefined;
  const timezoneSuffix = timezoneLabel ? `_${timezoneLabel.replace(/[^A-Za-z0-9+]+/g, '-')}` : '';
  const timezoneMeta = timezoneLabel ? `# timezone=${timezoneLabel}\n` : '';

  return {
    filename: `trend_${request.mode}_${new Date().toISOString().split('T')[0]}${timezoneSuffix}.csv`,
    mimeType: 'text/csv;charset=utf-8',
    content: `${timezoneMeta}${header}\n${rows.join('\n')}`,
  };
};

export const createAccuracyExport = async (): Promise<ExportPayload> => {
  const header = 'timestamp,forecast,actual,absenteeism_percent,lost_calls,aht_seconds,service_level';
  const rows = forecastDetailRows
    .map((row) =>
      `${row.timestamp},${row.forecast},${row.actual},${row.absenteeismPercent},${row.lostCalls},${row.ahtSeconds},${row.serviceLevel}`,
    )
    .join('\n');

  return {
    filename: `accuracy_${new Date().toISOString().split('T')[0]}.csv`,
    mimeType: 'text/csv;charset=utf-8',
    content: `${header}\n${rows}`,
  };
};

export const validateAdjustments = async (payload: AdjustmentPayload[]): Promise<AdjustmentResult[]> => {
  if (!payload.length) return [];

  if (hasApiEndpoint) {
    try {
      const response = await fetch(withBase('/adjustments/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustments: payload }),
      });
      if (response.ok) {
        const json = await response.json();
        return (json?.results ?? []).map((item: any) => ({
          id: String(item.id ?? ''),
          status: item.status === 'error' ? 'error' : item.status === 'warning' ? 'warning' : 'ok',
          message: typeof item.message === 'string' ? item.message : undefined,
        }));
      }
    } catch (error) {
      console.warn('Не удалось выполнить запрос валидации корректировок', error);
    }
  }

  return payload.map((item) => {
    const exceeds = Math.abs(item.adjustment ?? 0) > 20;
    return exceeds
      ? { id: item.id, status: 'warning', message: 'Проверьте корректировку — превышение порога 20%' }
      : { id: item.id, status: 'ok' };
  });
};

export const saveAdjustments = async (payload: AdjustmentPayload[]): Promise<void> => {
  if (!payload.length) return;

  if (hasApiEndpoint) {
    const response = await fetch(withBase('/adjustments/save'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustments: payload }),
    });
    if (!response.ok) {
      throw new Error(`Adjustments save failed: ${response.status}`);
    }
    await response.json().catch(() => undefined);
    return;
  }

  await wait(200);
};

export async function fetchForecastSeries(): Promise<Array<AdjustmentPayload & { requiredAgents: number }>> {
  if (hasApiEndpoint) {
    try {
      const response = await fetch(withBase('/forecast/series'));
      if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json?.series)) {
          return json.series;
        }
      }
    } catch (error) {
      console.warn('Не удалось получить серии прогноза из API', error);
    }
  }

  return forecastSeries.slice(0, 48).map((point, index) => ({
    id: `slot-${index}`,
    timestamp: point.timestamp,
    predicted: point.forecast,
    adjustment: 0,
    total: point.actual ?? point.forecast,
    requiredAgents: Math.round((point.forecast / 6) * 0.5),
  }));
}
