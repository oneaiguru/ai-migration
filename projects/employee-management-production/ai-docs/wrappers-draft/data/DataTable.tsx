import { useRef, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

/**
 * Lightweight reference demo for planners. Production adds keyboard navigation,
 * tokenised styling, and focus guards – see `src/wrappers/data/DataTable.tsx`.
 */
type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  /** Height of the scroll viewport (px). */
  height?: number;
  /** Estimated row height for the virtualiser (px). */
  rowHeight?: number;
};

export function DataTable<TData>({ data, columns, height = 320, rowHeight = 44 }: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const virtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => rowHeight,
    overscan: 6,
    getScrollElement: () => scrollRef.current,
  });

  return (
    <div
      ref={scrollRef}
      style={{
        height,
        width: "100%",
        overflow: "auto",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", position: "relative" }}>
        <thead style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 1 }}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    borderBottom: "1px solid #e2e8f0",
                    cursor: header.column.getCanSort() ? "pointer" : "default",
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody style={{ position: "relative", display: "block", height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                style={{
                  display: "flex",
                  position: "absolute",
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderBottom: "1px solid #f1f5f9",
                      background: virtualRow.index % 2 === 0 ? "#fff" : "#f8fafc",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
