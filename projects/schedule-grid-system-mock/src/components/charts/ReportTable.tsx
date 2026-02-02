import React from 'react';
import type { ReportTableProps } from './types';

const ReportTable: React.FC<ReportTableProps> = ({
  columns,
  rows,
  export: exportCfg,
  ariaTitle,
  ariaDesc,
}) => {
  const title = ariaTitle ?? 'Отчётная таблица';
  const desc = ariaDesc ?? 'Сводный отчёт по выбранным показателям';
  const summary = `${rows.length} строк, ${columns.length} колонок`;

  const hasRows = rows.length > 0;

  return (
    <figure
      aria-label={title}
      aria-description={desc}
      className="rounded-lg border border-gray-200 bg-white p-4"
    >
      {exportCfg ? (
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500" aria-hidden>
          Экспорт: {exportCfg.pdf ? 'PDF' : null} {exportCfg.xlsx ? 'XLSX' : null} {exportCfg.csv ? 'CSV' : null}
        </div>
      ) : null}
      <div className="max-h-96 overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-white shadow-[0_1px_0_0_rgba(226,232,240,1)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hasRows ? (
              rows.map((row, rowIndex) => (
                <tr
                  key={`${rowIndex}-${columns[0]?.id ?? 'row'}`}
                  className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                >
                  {columns.map((col) => (
                    <td key={col.id} className="whitespace-nowrap px-3 py-2 text-gray-900">
                      {String(row[col.id] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-sm text-gray-500">
                  Данные для отображения отсутствуют.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
};

export default ReportTable;
