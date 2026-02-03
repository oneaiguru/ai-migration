import React from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import type { SiteWithForecast } from '../../types/api';
import { FillBar } from '../shared/FillBar';
import { RiskBadge } from '../shared/RiskBadge';

const col = createColumnHelper<SiteWithForecast>();

export function RoutesTanStackTable({ rows, startIndex = 0, sortedBy }: { rows: SiteWithForecast[]; startIndex?: number; sortedBy?: 'risk' | 'default' }) {
  const columns = React.useMemo(
    () => [
      col.display({ id: 'idx', header: '№', cell: (info) => startIndex + info.row.index + 1 }),
      col.accessor('site_id', { header: 'Код КП', cell: (info) => <span className="font-mono text-sm text-blue-600">{info.getValue()}</span> }),
      col.accessor('address', { header: 'Адрес КП', cell: (info) => info.getValue() ?? '—' }),
      col.accessor('volume', { header: 'Объем', cell: (info) => info.getValue() ?? '—' }),
      col.accessor('schedule', { header: 'График вывоза', cell: (info) => info.getValue() ?? '—' }),
      col.display({ id: 'fill', header: 'Заполнение', cell: (info) => <FillBar pct={info.row.original.fill_pct ?? 0} width={64} height={6} /> }),
      col.display({ id: 'risk', header: 'Риск переполнения', cell: (info) => <div className="text-center"><RiskBadge risk={info.row.original.overflow_prob ?? 0} /></div> }),
      col.accessor('last_service', { header: 'Посл. вывоз', cell: (info) => <div className="text-center text-sm text-gray-600">{info.getValue() ?? '—'}</div> }),
    ],
    [startIndex]
  );

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="table-container">
      <table className="w-full compact-table">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="table-header border-b">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  scope="col"
                  className={"px-3 py-2 " + (h.column.id === 'risk' || h.column.id === 'fill' || h.column.id === 'last_service' ? 'bg-green-50' : '')}
                  aria-sort={sortedBy === 'risk' && h.column.id === 'risk' ? 'descending' : undefined}
                >
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((r) => (
            <tr key={r.id} className={"border-b hover:bg-gray-50 " + ((r.original.overflow_prob ?? 0) >= 0.8 ? 'bg-yellow-50' : '')}>
              {r.getVisibleCells().map((c) => (
                <td key={c.id} className="px-3 py-2 text-sm">
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
