import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, type DataTableProps } from "../data/DataTable";

type DemoRow = {
  id: string;
  name: string;
};

const rows: DemoRow[] = [
  { id: "row-1", name: "Алексей" },
  { id: "row-2", name: "Мария" },
];

const columns: ColumnDef<DemoRow>[] = [
  {
    header: "Имя",
    accessorKey: "name",
  },
];

describe("DataTable wrapper", () => {
  const renderTable = async (props: Partial<DataTableProps<DemoRow>> = {}) => {
    const utils = render(
      <DataTable<DemoRow>
        data={rows}
        columns={columns}
        height={160}
        rowHeight={48}
        testId="table"
        getRowId={(row) => row.id}
        {...props}
      />
    );
    const container = utils.getByTestId("table");
    await waitFor(() => {
      const row = container.querySelector('[data-row-index="0"]');
      if (!row) {
        throw new Error("Expected first row to be present");
      }
    });
    const firstRow = container.querySelector('[data-row-index="0"]') as HTMLElement;
    return { ...utils, container, firstRow };
  };

  it("calls onRowClick with row context", async () => {
    const handleRowClick = vi.fn();
    const { firstRow } = await renderTable({ onRowClick: handleRowClick });

    fireEvent.click(firstRow);

    expect(handleRowClick).toHaveBeenCalledOnce();
    const payload = handleRowClick.mock.calls[0][0];
    expect(payload.row.original.id).toBe("row-1");
    expect(payload.index).toBe(0);
  });

  it("fires onRowClick when Enter is pressed", async () => {
    const handleRowClick = vi.fn();
    const { firstRow } = await renderTable({ onRowClick: handleRowClick });

    firstRow.focus();
    fireEvent.keyDown(firstRow, { key: "Enter" });

    expect(handleRowClick).toHaveBeenCalledOnce();
  });
});
