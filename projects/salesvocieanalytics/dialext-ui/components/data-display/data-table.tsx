import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
  monospace?: boolean;
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
}

function getAlignClass(align?: string): string {
  switch (align) {
    case 'right':
      return 'text-right';
    case 'center':
      return 'text-center';
    default:
      return 'text-left';
  }
}

export function DataTable<T = Record<string, unknown>>({ columns, data }: DataTableProps<T>) {
  return (
    <div className="border border-gray-300 rounded overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={getAlignClass(col.align)}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => {
                const rowData = row as Record<string, unknown>;
                const cellValue = rowData[col.key];
                const alignClass = getAlignClass(col.align);
                const fontClass = col.monospace ? 'font-mono text-sm' : '';
                return (
                  <TableCell
                    key={col.key}
                    className={`${alignClass} ${fontClass}`}
                  >
                    {col.render ? col.render(row) : (cellValue as React.ReactNode)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
