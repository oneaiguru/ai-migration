import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, type DataTableProps } from "./DataTable";

type DemoEmployee = {
  id: string;
  name: string;
  team: string;
  status: string;
};

const rows: DemoEmployee[] = Array.from({ length: 24 }).map((_, index) => ({
  id: `emp-${index + 1}`,
  name: `Сотрудник ${index + 1}`,
  team: index % 2 === 0 ? "Support" : "Sales",
  status: index % 3 === 0 ? "Активен" : "Испытательный",
}));

const meta: Meta<DataTableProps<DemoEmployee>> = {
  title: "Wrappers/Data/DataTable",
  component: DataTable<DemoEmployee>,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    enableKeyboardNavigation: { control: "boolean" },
    rowHeight: { control: { type: "number", min: 32, max: 96, step: 4 } },
  },
};

export default meta;

type Story = StoryObj<DataTableProps<DemoEmployee>>;

export const Default: Story = {
  render: (args) => {
    const columns = useMemo<ColumnDef<DemoEmployee>[]>(
      () => [
        {
          header: "ФИО",
          accessorKey: "name",
          meta: {
            headerStyle: { flex: "2 0 200px" },
            cellStyle: { flex: "2 0 200px" },
          },
        },
        {
          header: "Команда",
          accessorKey: "team",
        },
        {
          header: "Статус",
          accessorKey: "status",
        },
      ],
      [],
    );

    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
      <div style={{ height: 360, padding: 16 }}>
        <DataTable
          {...args}
          data={rows}
          columns={columns}
          height={320}
          rowHeight={48}
          testId="storybook-table"
          enableKeyboardNavigation
          onRowClick={({ row }) => setSelectedId(row.original.id)}
          getRowProps={({ row }) => ({
            className: row.original.id === selectedId ? "bg-blue-50" : undefined,
          })}
        />
      </div>
    );
  },
  args: {},
};
