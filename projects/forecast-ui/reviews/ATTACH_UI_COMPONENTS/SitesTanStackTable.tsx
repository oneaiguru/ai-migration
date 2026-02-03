import React from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import type { ApiSite } from '../../src/types/api';
import { RiskBadge } from '../../src/components/shared/RiskBadge';
import { FillBar } from '../../src/components/shared/FillBar';

const col = createColumnHelper<ApiSite>();

export function SitesTanStackTable({ rows, sortedBy }: { rows: ApiSite[]; sortedBy?: 'risk' | 'fill' }) {
  const columns = React.useMemo(
    () => [
      col.accessor('site_id', { header: 'Код КП', cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span> }),
      col.accessor('address', { header: 'Адрес', cell: (info) => info.getValue() ?? '—' }),
      col.display({
        id: 'fill',
        header: 'Заполнение',
        cell: (info) => <FillBar pct={info.row.original.fill_pct ?? 0} width={80} height={8} />,
      }),
      col.display({
        id: 'risk',
        header: 'Риск переполнения',
        cell: (info) => <RiskBadge risk={info.row.original.overflow_prob ?? 0} />,
      }),
      col.accessor('pred_mass_kg', {
        header: 'Прогноз массы',
        cell: (info) => (typeof info.getValue() === 'number' ? `${info.getValue()} кг` : '—'),
      }),
      col.accessor('last_service', { header: 'Последний вывоз', cell: (info) => info.getValue() ?? '—' }),
    ],
    []
  );

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="table-container max-h-[500px] overflow-y-auto">
      <table className="w-full compact-table">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="table-header border-b sticky top-0">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  scope="col"
                  className="px-4 py-3 text-left"
                  aria-sort={sortedBy && h.column.id === (sortedBy === 'risk' ? 'risk' : 'fill') ? 'descending' : undefined}
                >
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((r) => (
            <tr key={r.id} className="border-b hover:bg-gray-50">
              {r.getVisibleCells().map((c) => (
                <td key={c.id} className="px-4 py-3">
                  {flexRender(c.column.columnDef.cell, c.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
