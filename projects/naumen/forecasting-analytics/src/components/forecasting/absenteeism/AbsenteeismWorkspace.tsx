import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calculator,
  Download,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import type {
  AbsenteeismCalculatorPreset,
  AbsenteeismCalculationResult,
  AbsenteeismRule,
  AbsenteeismTemplate,
  AbsenteeismTemplateInput,
} from '../../../types/forecasting';
import {
  calculateAbsenteeism,
  deleteAbsenteeismTemplate,
  exportAbsenteeismCsv,
  fetchAbsenteeismTemplates,
  saveAbsenteeismTemplate,
} from '../../../services/forecastingApi';
import { absenteeismCalculatorPresets, queueTree } from '../../../data/forecastingFixtures';
import type { AbsenteeismCalculationInput } from '../../../types/forecasting';
import { useNotificationCenter } from '../common/NotificationCenter';
import { triggerBrowserDownload } from '../../../utils/download';

interface RuleDraft extends Omit<AbsenteeismRule, 'id'> {
  id?: string;
}

interface OverrideDraft {
  id?: string;
  date: string;
  valuePercent: number;
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

const createRule = (): RuleDraft => ({
  dayOfWeek: 'monday',
  start: '09:00',
  end: '18:00',
  valuePercent: 5,
});

const createOverride = (): OverrideDraft => ({
  date: new Date().toISOString().split('T')[0],
  valuePercent: 10,
});

const AbsenteeismWorkspace: React.FC = () => {
  const [templates, setTemplates] = useState<AbsenteeismTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('Новый профиль');
  const [coverage, setCoverage] = useState('Пн–Пт, 09:00–18:00');
  const [valuePercent, setValuePercent] = useState<number>(5);
  const [rules, setRules] = useState<RuleDraft[]>([createRule()]);
  const [overrides, setOverrides] = useState<OverrideDraft[]>([]);

  const queueOptions = useMemo<QueueOption[]>(() => flattenQueues(queueTree), []);
  const [calculatorTemplateId, setCalculatorTemplateId] = useState<string>('');
  const [calculatorPresetId, setCalculatorPresetId] = useState<string>(
    absenteeismCalculatorPresets[0]?.id ?? '',
  );
  const [calculatorQueueId, setCalculatorQueueId] = useState<string>('');
  const [calculatorResult, setCalculatorResult] = useState<AbsenteeismCalculationResult | null>(null);
  const [calculatorLoading, setCalculatorLoading] = useState(false);

  const { pushNotification, pushError } = useNotificationCenter();

  useEffect(() => {
    setCalculatorQueueId(queueOptions[0]?.id ?? '');
  }, [queueOptions]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await fetchAbsenteeismTemplates();
        if (active) {
          setTemplates(result);
          if (result.length) {
            setCalculatorTemplateId(result[0].id);
          }
        }
      } catch (fetchError) {
        console.error(fetchError);
        setError('Не удалось получить шаблоны абсентеизма.');
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

  const resetForm = () => {
    setEditingId(null);
    setName('Новый профиль');
    setCoverage('Пн–Пт, 09:00–18:00');
    setValuePercent(5);
    setRules([createRule()]);
    setOverrides([]);
    setStatus(null);
    setError(null);
  };

  const editTemplate = (template: AbsenteeismTemplate) => {
    setEditingId(template.id);
    setName(template.name);
    setCoverage(template.coverage);
    setValuePercent(template.valuePercent);
    setRules(template.periodicRules.map((rule) => ({ ...rule })));
    setOverrides(template.singleOverrides.map((override) => ({ ...override })));
    setCalculatorTemplateId(template.id);
    setStatus(null);
    setError(null);
  };

  const removeTemplate = async (id: string) => {
    try {
      await deleteAbsenteeismTemplate(id);
      setTemplates((prev) => {
        const next = prev.filter((template) => template.id !== id);
        if (calculatorTemplateId === id) {
          setCalculatorTemplateId(next[0]?.id ?? '');
        }
        return next;
      });
      setStatus('Профиль удалён.');
      if (editingId === id) {
        resetForm();
      }
    } catch (deleteError) {
      console.error(deleteError);
      setError('Не удалось удалить профиль.');
    }
  };

  const updateRule = (index: number, key: keyof RuleDraft, value: string | number) => {
    setRules((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const updateOverride = (index: number, key: keyof OverrideDraft, value: string | number) => {
    setOverrides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const buildPayload = (): AbsenteeismTemplateInput => ({
    id: editingId ?? undefined,
    name,
    coverage,
    valuePercent,
    periodicRules: rules.map(({ id, ...rest }) => rest),
    singleOverrides: overrides.map(({ id, ...rest }) => rest),
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setError(null);

    if (!name.trim()) {
      setError('Укажите название профиля.');
      return;
    }

    try {
      const saved = await saveAbsenteeismTemplate(buildPayload());
      setTemplates((prev) => {
        const index = prev.findIndex((item) => item.id === saved.id);
        if (index >= 0) {
          const next = [...prev];
          next.splice(index, 1, saved);
          return next;
        }
        return [saved, ...prev];
      });
      setStatus(editingId ? 'Профиль обновлён.' : 'Профиль сохранён.');
      if (!editingId) {
        setEditingId(saved.id);
        setCalculatorTemplateId(saved.id);
      }
    } catch (submitError) {
      console.error(submitError);
      setError('Не удалось сохранить профиль.');
    }
  };

  const handleTemplateExport = (templateId: string) => {
    try {
      const payload = exportAbsenteeismCsv({ templateIds: [templateId] });
      triggerBrowserDownload({
        filename: payload.filename,
        mimeType: payload.mimeType,
        content: payload.content,
      });
      const href = `data:${payload.mimeType};charset=utf-8,${encodeURIComponent(payload.content)}`;
      pushNotification({
        title: 'Экспорт шаблона выполнен',
        message: `Файл ${payload.filename} доступен для скачивания`,
        kind: 'success',
        downloadHref: href,
        downloadLabel: payload.filename,
      });
      setStatus('CSV экспортирован. Файл доступен в колокольчике.');
    } catch (exportError) {
      console.error(exportError);
      setError('Не удалось сформировать CSV.');
      pushError('Ошибка экспорта шаблона', 'Повторите попытку позже.');
    }
  };

  const handleCalculate = async () => {
    if (!calculatorTemplateId) {
      setError('Выберите шаблон для расчёта.');
      return;
    }
    const preset: AbsenteeismCalculatorPreset | undefined = absenteeismCalculatorPresets.find(
      (item) => item.id === calculatorPresetId,
    );
    if (!preset) {
      setError('Выберите пресет расчёта.');
      return;
    }
    const payload: AbsenteeismCalculationInput = {
      queueId: calculatorQueueId,
      templateId: calculatorTemplateId,
      historyDays: preset.historyDays,
      forecastDays: preset.forecastDays,
      intervalMinutes: preset.intervalMinutes,
    };

    try {
      setCalculatorLoading(true);
      const result = await calculateAbsenteeism(payload);
      setCalculatorResult(result);
      setStatus('Расчёт абсентеизма выполнен. Итоги доступны ниже.');
      pushNotification({
        title: 'Расчёт абсентеизма готов',
        message: `Шаблон ${preset.name} обработан, результаты доступны в таблице.`,
        kind: 'success',
      });
    } catch (calcError) {
      console.error(calcError);
      setError('Не удалось выполнить расчёт абсентеизма.');
      pushError('Ошибка расчёта абсентеизма', 'Не удалось получить результат. Обновите страницу и повторите.');
    } finally {
      setCalculatorLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Calculator className="h-4 w-4 animate-spin text-purple-500" /> Загружаем данные абсентеизма…
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Расчёт абсентеизма</h2>
        <p className="mt-2 text-sm text-gray-500">Повторяем §4.3: управляйте профилями, скачивайте CSV и запускайте калькулятор для оценки влияния.</p>
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
              <h3 className="text-sm font-semibold text-gray-900">Сохранённые профили</h3>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-purple-200 hover:text-purple-600"
              >
                <Plus className="h-3 w-3" /> Новый
              </button>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              {templates.map((template) => (
                <li
                  key={template.id}
                  className={`rounded-lg border px-3 py-2 ${editingId === template.id ? 'border-purple-400 bg-purple-50 text-purple-700 shadow-inner' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-xs text-gray-500">{template.coverage}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => editTemplate(template)}
                        className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-purple-200 hover:text-purple-600"
                      >
                        Редакт.
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTemplateExport(template.id)}
                        className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-purple-200 hover:text-purple-600"
                      >
                        <Download className="h-3 w-3" />
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
              {!templates.length ? (
                <li className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  Профили не найдены. Создайте первый шаблон справа.
                </li>
              ) : null}
            </ul>
          </article>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Название профиля
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Охват
                <input
                  type="text"
                  value={coverage}
                  onChange={(event) => setCoverage(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <span className="text-xs uppercase text-gray-500">Среднее значение</span>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={valuePercent}
                  onChange={(event) => setValuePercent(Number(event.target.value))}
                  className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </label>
              <span className="text-xs text-gray-500">%</span>
            </div>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Периодические правила</h3>
              <button
                type="button"
                onClick={() => setRules((prev) => [...prev, createRule()])}
                className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-purple-200 hover:text-purple-600"
              >
                <Plus className="h-3 w-3" /> Добавить правило
              </button>
            </div>
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <div key={rule.id ?? index} className="rounded-lg border border-gray-200 px-4 py-3">
                  <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-5">
                    <label className="flex flex-col gap-1">
                      День недели
                      <select
                        value={rule.dayOfWeek}
                        onChange={(event) => updateRule(index, 'dayOfWeek', event.target.value)}
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
                        value={rule.start}
                        onChange={(event) => updateRule(index, 'start', event.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      Конец
                      <input
                        type="time"
                        value={rule.end}
                        onChange={(event) => updateRule(index, 'end', event.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      Значение, %
                      <input
                        type="number"
                        min={0}
                        max={40}
                        value={rule.valuePercent}
                        onChange={(event) => updateRule(index, 'valuePercent', Number(event.target.value))}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </label>
                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => setRules((prev) => prev.filter((_, idx) => idx !== index))}
                        className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-rose-200 hover:text-rose-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!rules.length ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  Нет периодических правил. Добавьте новое правило выше.
                </div>
              ) : null}
            </div>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Разовые исключения</h3>
              <button
                type="button"
                onClick={() => setOverrides((prev) => [...prev, createOverride()])}
                className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-purple-200 hover:text-purple-600"
              >
                <Plus className="h-3 w-3" /> Добавить дату
              </button>
            </div>
            <div className="space-y-3">
              {overrides.map((override, index) => (
                <div key={override.id ?? index} className="rounded-lg border border-gray-200 px-4 py-3">
                  <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-3">
                    <label className="flex flex-col gap-1">
                      Дата
                      <input
                        type="date"
                        value={override.date}
                        onChange={(event) => updateOverride(index, 'date', event.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      Значение, %
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={override.valuePercent}
                        onChange={(event) => updateOverride(index, 'valuePercent', Number(event.target.value))}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </label>
                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => setOverrides((prev) => prev.filter((_, idx) => idx !== index))}
                        className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-rose-200 hover:text-rose-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!overrides.length ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  Нет исключений. Добавьте даты, когда требуется повышенный норматив.
                </div>
              ) : null}
            </div>
          </article>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-purple-700"
            >
              <Save className="h-4 w-4" /> Сохранить профиль
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:border-purple-200"
            >
              Сбросить
            </button>
          </div>
        </form>
      </div>

      <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Калькулятор абсентеизма</h3>
            <p className="text-xs text-gray-500">Сценарное моделирование (§4.3, карточка «Рассчитать»).</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <label className="flex items-center gap-2">
              Шаблон
              <select
                value={calculatorTemplateId}
                onChange={(event) => setCalculatorTemplateId(event.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              Очередь
              <select
                value={calculatorQueueId}
                onChange={(event) => setCalculatorQueueId(event.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                {queueOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-2">
              {absenteeismCalculatorPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setCalculatorPresetId(preset.id)}
                  className={`rounded-full px-4 py-1 text-xs font-medium transition ${
                    calculatorPresetId === preset.id ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleCalculate}
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-1.5 text-xs font-medium text-white shadow hover:bg-purple-700"
              disabled={calculatorLoading}
            >
              <Calculator className="h-3 w-3" /> {calculatorLoading ? 'Расчёт…' : 'Рассчитать'}
            </button>
          </div>
        </div>

        {calculatorResult ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {calculatorResult.message}
            </div>
            <div className="grid gap-4 md:grid-cols-4 text-sm text-gray-700">
              <div>
                <div className="text-xs text-gray-500">Базовый норматив</div>
                <div className="text-lg font-semibold">{calculatorResult.baselinePercent}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Рекомендация</div>
                <div className="text-lg font-semibold">{calculatorResult.recommendedPercent}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Прирост</div>
                <div className="text-lg font-semibold">{calculatorResult.deltaPercent >= 0 ? '+' : ''}{calculatorResult.deltaPercent}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Горизонт прогноза</div>
                <div className="text-lg font-semibold">{calculatorResult.forecastDays} дн.</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Дата</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Базовый %</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Сценарий %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {calculatorResult.series.map((point) => (
                    <tr key={point.timestamp}>
                      <td className="px-3 py-2">{new Date(point.timestamp).toLocaleDateString('ru-RU')}</td>
                      <td className="px-3 py-2">{point.baselinePercent}</td>
                      <td className="px-3 py-2 text-purple-700">{point.scenarioPercent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
            Запустите калькулятор, чтобы увидеть рекомендуемый норматив и серию прогнозов.
          </div>
        )}
      </article>
    </section>
  );
};

export default AbsenteeismWorkspace;
