import type { FC } from 'react';
import type { EmployeeFilters, EmployeeStatus } from '../../types/employee';
import type { EmployeeListState } from './useEmployeeListState';

interface FiltersProps {
  state: EmployeeListState;
}

export const Filters: FC<FiltersProps> = ({ state }) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded text-blue-600 focus:ring-blue-500"
            checked={state.filters.showInactive}
            onChange={(event) => state.handleFilterChange('showInactive', event.target.checked)}
          />
          <span>Показывать уволенных</span>
        </label>
        <span>
          {state.visibleCount}/{state.totalCount}
        </span>
        <button
          type="button"
          onClick={state.handleResetFilters}
          disabled={!state.hasActiveFilters}
          className={`text-sm font-medium ${state.hasActiveFilters ? 'text-blue-600 hover:underline' : 'text-gray-400 cursor-default'}`}
        >
          Снять все фильтры
        </button>
      </div>
    </div>

    {state.activeFilterChips.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {state.activeFilterChips.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100"
          >
            {chip.label}
            <button
              type="button"
              onClick={chip.onRemove}
              className="text-blue-600 hover:text-blue-800"
              aria-label={`Удалить фильтр ${chip.label}`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    )}

    {state.showFilters && (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Поиск</label>
            <input
              type="text"
              value={state.filters.search}
              onChange={(event) => state.handleFilterChange('search', event.target.value)}
              placeholder="ФИО, логин, должность"
              data-testid="employee-search-input"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {state.filters.search.trim() && (
              <p
                className="mt-1 text-xs text-gray-500"
                role="status"
                aria-live="polite"
                data-testid="employee-search-summary"
              >
                {state.searchSummary ? `Совпадений: ${state.searchSummary.ids.size}` : 'Совпадений: 0'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Команда</label>
            <select
              value={state.filters.team}
              onChange={(event) => state.handleFilterChange('team', event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Все команды</option>
              {Array.from(new Map(state.employees.map((emp) => [emp.workInfo.team.id, emp.workInfo.team])).values()).map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Статус</label>
            <select
              value={state.filters.status}
              onChange={(event) => state.handleFilterChange('status', event.target.value as EmployeeStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Все статусы</option>
              {Object.entries(state.STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Должность</label>
            <input
              type="text"
              value={state.filters.position}
              onChange={(event) => state.handleFilterChange('position', event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Точка оргструктуры</label>
            <input
              type="text"
              value={state.filters.orgUnit}
              onChange={(event) => state.handleFilterChange('orgUnit', event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Сортировка</label>
            <select
              value={state.filters.sortBy}
              onChange={(event) => state.handleFilterChange('sortBy', event.target.value as EmployeeFilters['sortBy'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">ФИО</option>
              <option value="position">Должность</option>
              <option value="team">Команда</option>
              <option value="hireDate">Дата найма</option>
              <option value="performance">Качество обслуживания</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Порядок</label>
            <select
              value={state.filters.sortOrder}
              onChange={(event) => state.handleFilterChange('sortOrder', event.target.value as EmployeeFilters['sortOrder'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="asc">Возрастание</option>
              <option value="desc">Убывание</option>
            </select>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default Filters;
