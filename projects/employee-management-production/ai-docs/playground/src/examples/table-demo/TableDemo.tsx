import { useMemo, useRef } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

interface Employee {
  id: number;
  name: string;
  team: string;
  status: "Активен" | "Испытательный" | "Уволен";
  hours: number;
}

const employees: Employee[] = Array.from({ length: 5000 }, (_, idx) => ({
  id: idx + 1,
  name: `Сотрудник ${idx + 1}`,
  team: ["Поддержка", "Развитие", "Аналитика"][idx % 3],
  status: idx % 11 === 0 ? "Уволен" : idx % 3 === 0 ? "Испытательный" : "Активен",
  hours: 160 + (idx % 5) * 4,
}));

export function TableDemo() {
  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      { header: "ФИО", accessorKey: "name" },
      { header: "Команда", accessorKey: "team" },
      { header: "Статус", accessorKey: "status" },
      { header: "Норма часов", accessorKey: "hours" },
    ],
    []
  );

  const table = useReactTable({
    data: employees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 44,
    overscan: 6,
    getScrollElement: () => scrollRef.current,
  });

  return (
    <div
      ref={scrollRef}
      style={{ height: 420, width: "100%", overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", position: "relative" }}>
        <thead style={{ position: "sticky", top: 0, background: "#f8fafc" }}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    padding: "12px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: "left",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody style={{ position: "relative", display: "block", height: rowVirtualizer.getTotalSize() }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                style={{
                  display: "flex",
                  position: "absolute",
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`
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
