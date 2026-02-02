import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type HTMLAttributes,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Row } from "@tanstack/react-table";
import {
  colorVar,
  fontSizeVar,
  fontVar,
  fontWeightVar,
  radiusVar,
  shadowVar,
  spacingVar,
} from "../shared/tokens";

type RowAttributes = HTMLAttributes<HTMLTableRowElement> & {
  ref?: (element: HTMLTableRowElement | null) => void;
};

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  height?: number;
  rowHeight?: number;
  testId?: string;
  ariaLabel?: string;
  emptyMessage?: string;
  getRowId?: (row: TData, index: number) => string;
  className?: string;
  onRowClick?: (context: {
    row: Row<TData>;
    index: number;
    event: MouseEvent<HTMLTableRowElement> | KeyboardEvent<HTMLTableRowElement>;
  }) => void;
  onRowKeyDown?: (context: {
    row: Row<TData>;
    index: number;
    event: KeyboardEvent<HTMLTableRowElement>;
  }) => boolean | void;
  onRowFocus?: (context: {
    row: Row<TData>;
    index: number;
    event: FocusEvent<HTMLTableRowElement>;
  }) => void;
  getRowProps?: (context: { row: Row<TData>; index: number }) => RowAttributes;
  enableKeyboardNavigation?: boolean;
}

type ColumnMeta = {
  headerClassName?: string;
  headerStyle?: CSSProperties;
  cellClassName?: string;
  cellStyle?: CSSProperties;
};

const containerStyle = {
  width: "100%",
  borderRadius: radiusVar("lg"),
  border: `1px solid ${colorVar("borderMuted")}`,
  backgroundColor: colorVar("surface"),
  boxShadow: shadowVar("sm"),
};

const headerCellStyle = {
  padding: "12px 24px",
  fontFamily: fontVar("fontFamily"),
  fontSize: fontSizeVar("sizeXs"),
  fontWeight: fontWeightVar("fontWeightBold"),
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  textAlign: "left" as const,
  color: colorVar("mutedForeground"),
  borderBottom: "1px solid rgba(59, 130, 246, 0.35)",
  backgroundColor: colorVar("surfaceMuted"),
  position: "sticky" as const,
  top: 0,
  flex: "0 0 auto",
  display: "flex",
  alignItems: "center",
  whiteSpace: "nowrap" as const,
};

const dataCellStyle = {
  padding: "12px 24px",
  borderBottom: "1px solid rgba(59, 130, 246, 0.25)",
  fontFamily: fontVar("fontFamily"),
  fontSize: fontSizeVar("sizeSm"),
  color: colorVar("emphasisForeground"),
  flex: "0 0 auto",
  whiteSpace: "nowrap" as const,
  alignItems: "center",
};

const emptyStateStyle = {
  padding: `${spacingVar("lg")} ${spacingVar("xl")}`,
  textAlign: "center" as const,
  color: colorVar("mutedForeground"),
};

export function DataTable<TData>({
  data,
  columns,
  height = 420,
  rowHeight = 48,
  testId,
  ariaLabel,
  emptyMessage = "Нет записей для отображения",
  getRowId,
  className,
  onRowClick,
  onRowKeyDown,
  onRowFocus,
  getRowProps,
  enableKeyboardNavigation = true,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  });

  const rows = table.getRowModel().rows;
  const [focusedRowIndex, setFocusedRowIndex] = useState(() => (rows.length > 0 ? 0 : -1));

  useEffect(() => {
    if (!enableKeyboardNavigation) {
      return;
    }

    if (!rows.length) {
      setFocusedRowIndex(-1);
      return;
    }

    setFocusedRowIndex((previous) => {
      if (previous < 0) {
        return 0;
      }

      if (previous >= rows.length) {
        return rows.length - 1;
      }

      return previous;
    });
  }, [rows.length, enableKeyboardNavigation]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => rowHeight,
    overscan: 6,
    getScrollElement: () => scrollRef.current,
  });

  const scheduleRowFocus = useCallback(
    (targetIndex: number, attempt = 0) => {
      if (!enableKeyboardNavigation || attempt > 20) {
        return;
      }
      requestAnimationFrame(() => {
        const container = scrollRef.current;
        if (!container) {
          return;
        }
        const rowElement = container.querySelector<HTMLTableRowElement>(
          `tr[data-row-index="${targetIndex}"]`
        );
        if (rowElement) {
          rowElement.focus({ preventScroll: true });
        } else {
          scheduleRowFocus(targetIndex, attempt + 1);
        }
      });
    },
    [enableKeyboardNavigation, virtualizer]
  );

  useEffect(() => {
    if (!enableKeyboardNavigation || focusedRowIndex < 0) {
      return;
    }

    scheduleRowFocus(focusedRowIndex);
  }, [focusedRowIndex, enableKeyboardNavigation, scheduleRowFocus]);

  const totalHeight = rows.length === 0 ? height : virtualizer.getTotalSize();

  const focusableRowIndex = useMemo(() => {
    if (!enableKeyboardNavigation || focusedRowIndex < 0) {
      return undefined;
    }
    return focusedRowIndex;
  }, [enableKeyboardNavigation, focusedRowIndex]);

  const handleRowFocus = (index: number) => {
    if (!enableKeyboardNavigation) {
      return;
    }
    setFocusedRowIndex(index);
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, index: number) => {
    if (!enableKeyboardNavigation) {
      return;
    }

    const { key } = event;
    const lastIndex = rows.length - 1;

    if (key === "ArrowDown" || key === "j") {
      event.preventDefault();
      const nextIndex = Math.min(lastIndex, index + 1);
      setFocusedRowIndex(nextIndex);
      virtualizer.scrollToIndex(nextIndex, { align: "auto" });
      return;
    }

    if (key === "ArrowUp" || key === "k") {
      event.preventDefault();
      const previousIndex = Math.max(0, index - 1);
      setFocusedRowIndex(previousIndex);
      virtualizer.scrollToIndex(previousIndex, { align: "auto" });
      return;
    }

    if (key === "Home" || key === "PageUp") {
      event.preventDefault();
      setFocusedRowIndex(0);
      virtualizer.scrollToIndex(0, { align: "start" });
      return;
    }

    if (key === "End" || key === "PageDown") {
      event.preventDefault();
      const target = Math.max(0, lastIndex);
      setFocusedRowIndex(target);
      virtualizer.scrollToIndex(target, { align: "end" });
      return;
    }

    if (key === "Enter") {
      event.preventDefault();
      const row = rows[index];
      if (row) {
        onRowClick?.({ row, index, event });
      }
    }
  };

  if (rows.length === 0) {
    return (
      <div
        style={{ ...containerStyle, minHeight: height }}
        data-testid={testId}
        className={className}
      >
        <div style={emptyStateStyle}>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div
      style={{ ...containerStyle, height }}
      data-testid={testId}
      className={className}
    >
      <div
        ref={scrollRef}
        style={{ height, overflow: "auto", borderRadius: radiusVar("lg") }}
        role="presentation"
      >
        <table
          aria-label={ariaLabel}
          style={{ width: "max-content", minWidth: "100%", borderCollapse: "separate", borderSpacing: 0 }}
        >
          <thead style={{ display: "block" }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} style={{ display: "flex" }}>
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();
                  const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                  const combinedHeaderStyle = {
                    ...headerCellStyle,
                    ...(meta?.headerStyle ?? {}),
                  } satisfies CSSProperties;
                  const headerClassName = meta?.headerClassName ?? "";
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      style={combinedHeaderStyle}
                      className={headerClassName}
                      aria-sort={
                        sortable
                          ? sortState === "asc"
                            ? "ascending"
                            : sortState === "desc"
                            ? "descending"
                            : "none"
                          : undefined
                      }
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          style={{
                            all: "unset",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: spacingVar("2xs"),
                          }}
                          aria-label={
                            sortState
                              ? `Сортировка: ${sortState === "asc" ? "по возрастанию" : "по убыванию"}`
                              : "Изменить порядок сортировки"
                          }
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortState ? (sortState === "asc" ? "↑" : "↓") : null}
                        </button>
                      ) : (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: spacingVar("2xs"),
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody style={{ position: "relative", display: "block", height: totalHeight }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                const top = virtualRow.start;
                const rowContext = { row, index: virtualRow.index } as const;
                const externalRowProps = getRowProps?.(rowContext) ?? {};
                const {
                  className: externalClassName,
                  style: externalStyle,
                  onClick: externalOnClick,
                  onKeyDown: externalOnKeyDown,
                  onFocus: externalOnFocus,
                  ref: externalRef,
                  ...restRowProps
                } = externalRowProps;
                const baseRowClassName = [externalClassName]
                  .filter(Boolean)
                  .join(" ");
                const baseRowStyle: CSSProperties = {
                  position: "absolute",
                  top,
                  left: 0,
                  right: 0,
                  height: rowHeight,
                  display: "flex",
                  transition: "background-color 120ms ease",
                  borderBottom: "1px solid rgba(59, 130, 246, 0.25)",
                  ...(externalStyle ?? {}),
                };
                return (
                  <tr
                    key={row.id}
                    role="row"
                    data-row-index={virtualRow.index}
                    {...restRowProps}
                    ref={externalRef}
                    onClick={(event) => {
                      externalOnClick?.(event);
                      if (event.defaultPrevented) {
                        return;
                      }
                      onRowClick?.({ row, index: virtualRow.index, event });
                    }}
                    tabIndex={focusableRowIndex === virtualRow.index ? 0 : -1}
                    aria-rowindex={virtualRow.index + 1}
                    onFocus={(event) => {
                      handleRowFocus(virtualRow.index);
                      onRowFocus?.({ row, index: virtualRow.index, event });
                      externalOnFocus?.(event);
                    }}
                    onKeyDown={(event) => {
                      externalOnKeyDown?.(event);
                      if (event.defaultPrevented) {
                        return;
                      }
                      const handledByCaller = onRowKeyDown?.({
                        row,
                        index: virtualRow.index,
                        event,
                      });
                      if (handledByCaller === true) {
                        return;
                      }
                      handleRowKeyDown(event, virtualRow.index);
                    }}
                    style={baseRowStyle}
                    className={baseRowClassName}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        role="cell"
                        style={{
                          ...dataCellStyle,
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "transparent",
                          ...(((cell.column.columnDef.meta as ColumnMeta | undefined)?.cellStyle) ?? {}),
                        }}
                        className={
                          (cell.column.columnDef.meta as ColumnMeta | undefined)?.cellClassName ?? ""
                        }
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
    </div>
  );
}
