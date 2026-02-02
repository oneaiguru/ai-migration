import type { FC } from 'react';
import type { Employee } from '../../types/employee';
import { DataTable } from '../../wrappers/data/DataTable';
import type { EmployeeListState } from './useEmployeeListState';

interface TableProps {
  state: EmployeeListState;
}

export const Table: FC<TableProps> = ({ state }) => (
  <>
    {state.visibleCount === 0 ? (
      <div className="p-12 text-center text-gray-500">
        <div className="text-5xl mb-3">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Сотрудники не найдены</h3>
        <p className="text-sm">Измените фильтры или снимите ограничения, чтобы увидеть сотрудников</p>
      </div>
    ) : (
      <DataTable<Employee>
        data={state.sortedEmployees}
        columns={state.tableColumns}
        rowHeight={state.rowHeight}
        height={state.tableHeight}
        testId="employee-table"
        ariaLabel="Список сотрудников"
        getRowId={(row) => row.id}
        getRowProps={state.getTableRowProps}
      />
    )}

    {state.isInitialLoading && (
      <div className="absolute inset-0 z-20 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-transparent rounded-full animate-spin" />
        <div className="w-full max-w-4xl space-y-3 px-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`loader-row-${index}`}
              className="h-11 rounded-lg bg-gray-200/80 animate-pulse"
            />
          ))}
        </div>
      </div>
    )}
  </>
);

export default Table;
