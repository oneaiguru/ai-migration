import type { FC } from 'react';
import { Overlay } from '../common/Overlay';
import { DialogDescription, DialogTitle } from '../../wrappers/ui/Dialog';
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { EmployeeListState } from './useEmployeeListState';

interface ColumnSettingsOverlayProps {
  state: EmployeeListState;
}

export const ColumnSettingsOverlay: FC<ColumnSettingsOverlayProps> = ({ state }) => (
  <Overlay
    open={state.showColumnSettings}
    onOpenChange={(nextOpen) => {
      if (!nextOpen) {
        state.closeColumnSettings();
      }
    }}
    variant="sheet"
    title="Настройка отображения колонок"
    description="Управление столбцами списка сотрудников"
    titleHidden
    descriptionHidden
    testId="column-settings-overlay"
    contentClassName="flex h-full flex-col"
    showCloseButton={false}
  >
    <DialogTitle asChild>
      <VisuallyHidden>Настройка отображения колонок</VisuallyHidden>
    </DialogTitle>
    <DialogDescription asChild>
      <VisuallyHidden>Управление столбцами списка сотрудников</VisuallyHidden>
    </DialogDescription>
    <div className="flex items-center justify-between py-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={state.closeColumnSettings}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Вернуться к списку сотрудников"
        >
          ←
        </button>
        <h3 id="column-settings-heading" className="text-base font-semibold text-gray-900">Настройка отображения</h3>
      </div>
      <button
        type="button"
        onClick={state.closeColumnSettings}
        className="text-gray-400 hover:text-gray-600"
        aria-label="Закрыть настройки отображения"
      >
        ✕
      </button>
    </div>
    <div className="py-3 border-b border-gray-100">
      <p className="text-sm text-gray-500">Выберите поля для отображения в таблице сотрудников.</p>
    </div>
    <div className="flex-1 overflow-y-auto py-4 space-y-3">
      {state.COLUMN_ORDER.map((column) => (
        <label key={column.key} className="flex items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            className="rounded text-blue-600 focus:ring-blue-500"
            checked={state.columnVisibility[column.key]}
            onChange={() => state.toggleColumn(column.key)}
          />
          <span>{column.label}</span>
        </label>
      ))}
      <button
        type="button"
        onClick={() =>
          state.setColumnVisibility({
            fio: true,
            position: true,
            orgUnit: true,
            team: true,
            scheme: true,
            hourNorm: true,
            status: true,
            hireDate: true,
          })
        }
        className="text-sm text-blue-600 hover:underline"
      >
        Восстановить по умолчанию
      </button>
    </div>
    <div className="py-4 border-t border-gray-200 flex justify-end">
      <button
        type="button"
        onClick={state.closeColumnSettings}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Сохранить изменения
      </button>
    </div>
  </Overlay>


);

export default ColumnSettingsOverlay;
