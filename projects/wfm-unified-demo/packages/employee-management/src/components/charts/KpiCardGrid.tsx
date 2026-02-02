import React from 'react';
import type { KpiCardGridProps } from './types';

const VARIANT_CLASSES: Record<NonNullable<KpiCardGridProps['items'][number]['variant']>, string> = {
  primary: 'border-blue-200 bg-blue-50 text-blue-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-rose-200 bg-rose-50 text-rose-900',
  neutral: 'border-gray-200 bg-white text-gray-900',
};

const TREND_SYMBOL: Record<'up' | 'down' | 'stable', string> = {
  up: '▲',
  down: '▼',
  stable: '▬',
};

const TREND_CLASS: Record<'up' | 'down' | 'stable', string> = {
  up: 'text-emerald-600',
  down: 'text-rose-600',
  stable: 'text-gray-500',
};

const KpiCardGrid: React.FC<KpiCardGridProps> = ({ items, ariaTitle, ariaDesc }) => {
  const title = ariaTitle ?? 'KPI карточки';
  const desc = ariaDesc ?? 'Ключевые показатели эффективности';

  const summary = `${items.length} карточек KPI`;

  return (
    <section
      aria-label={title}
      aria-description={desc}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((item, idx) => {
        const variantClass = item.variant ? VARIANT_CLASSES[item.variant] : VARIANT_CLASSES.neutral;
        const trend = item.trend;

        return (
          <article
            key={`${item.label}-${idx}`}
            className={`rounded-xl border p-4 shadow-sm transition duration-150 hover:shadow-md ${variantClass}`}
          >
            <header className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              {item.label}
            </header>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold">{item.value}</span>
              {trend ? (
                <span className={`ml-3 text-xs font-semibold ${TREND_CLASS[trend]}`} aria-label={`Тренд: ${trend}`}>
                  {TREND_SYMBOL[trend]}
                </span>
              ) : null}
            </div>
          </article>
        );
      })}
      <p className="sr-only">{summary}</p>
    </section>
  );
};

export default KpiCardGrid;
