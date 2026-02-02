import type { FC } from 'react';
import type { EmployeeListState } from './useEmployeeListState';

interface ToolbarProps {
  state: EmployeeListState;
}

export const Toolbar: FC<ToolbarProps> = ({ state }) => (
  <>
    <div className="border-b border-gray-200 p-6 space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Сотрудники</h1>
          <p className="text-gray-600">
            Актуальный список персонала с ключевыми полями карточки и статусами
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <button
            type="button"
            ref={state.filterToggleRef}
            onClick={() => state.setShowFilters((prev) => !prev)}
            className={state.toolbarButtonClass()}
            aria-label={state.showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
            title={state.showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          >
            <span aria-hidden>{state.showFilters ? '📑' : '🔍'}</span>
            <span>{state.showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}</span>
          </button>
          <button
            type="button"
            onClick={state.handleOpenBulkEdit}
            disabled={state.isBulkEditOpen}
            className={state.toolbarButtonClass(state.isBulkEditOpen)}
            aria-label={state.bulkEditButtonTitle}
            title={state.bulkEditButtonTitle}
            aria-pressed={state.isSelectionMode}
            data-testid="toolbar-bulk-edit"
          >
            <span aria-hidden>🛠️</span>
            <span>Массовое редактирование</span>
          </button>
          <button
            type="button"
            onClick={state.openTagManager}
            className={state.toolbarButtonClass()}
            aria-label="Управление тегами"
            title="Управление тегами"
          >
            <span aria-hidden>🏷️</span>
            <span>Теги</span>
          </button>
          <div className="relative" ref={state.importMenuAnchorRef}>
            <button
              type="button"
              onClick={() => {
                state.setShowImportMenu((prev) => !prev);
                state.setShowExportMenu(false);
              }}
              className={state.toolbarButtonClass()}
              aria-haspopup="true"
              aria-expanded={state.showImportMenu}
              title="Импортировать"
            >
              <span aria-hidden>⬇️</span>
              <span>Импорт</span>
            </button>
            {state.showImportMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {state.IMPORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => state.handleImportOptionSelect(option.label)}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={state.exportMenuAnchorRef}>
            <button
              type="button"
              onClick={() => {
                state.setShowExportMenu((prev) => !prev);
                state.setShowImportMenu(false);
              }}
              className={state.toolbarButtonClass()}
              aria-haspopup="true"
              aria-expanded={state.showExportMenu}
              title="Экспортировать"
            >
              <span aria-hidden>⬆️</span>
              <span>Экспорт</span>
            </button>
            {state.showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {state.EXPORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => state.handleExportOptionSelect(option.label)}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={state.openColumnSettings}
            className={state.toolbarButtonClass()}
            aria-label="Настроить отображение колонок"
            title="Настроить отображение колонок"
          >
            <span aria-hidden>🗂️</span>
            <span>Колонки</span>
          </button>
          <button
            type="button"
            onClick={state.onOpenQuickAdd}
            className={state.toolbarPrimaryButtonClass}
            aria-label="Добавить нового сотрудника"
            title="Добавить нового сотрудника"
            data-testid="toolbar-new-employee"
          >
            <span aria-hidden>➕</span>
            <span>Новый сотрудник</span>
          </button>
        </div>
      </div>
    </div>

    {state.showBulkActions && (
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-blue-900">
        <span>Выбрано сотрудников: {state.selectedEmployees.size}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={state.openExportModal}
            className="px-3 py-1 bg-white border border-blue-200 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            Экспорт
          </button>
          <button
            type="button"
            onClick={state.openTagManager}
            className="px-3 py-1 bg-white border border-blue-200 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            Назначить теги
          </button>
          <button
            type="button"
            onClick={() => state.clearSelection()}
            className="text-xs font-medium text-blue-800 hover:underline"
          >
            Очистить
          </button>
        </div>
      </div>
    )}

    {state.bulkEditSuccess && (
      <div className="mx-6 mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
        {state.bulkEditSuccess}
      </div>
    )}

    {state.statusNotice && (
      <div className="mx-6 mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800" role="status">
        {state.statusNotice}
      </div>
    )}

    {state.bulkEditError && !state.isBulkEditOpen && (
      <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
        {state.bulkEditError}
      </div>
    )}
  </>
);

export default Toolbar;
