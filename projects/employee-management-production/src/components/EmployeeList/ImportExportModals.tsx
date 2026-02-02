import type { FC } from 'react';
import { Overlay } from '../common/Overlay';
import { DialogDescription, DialogTitle } from '../../wrappers/ui/Dialog';
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { EmployeeListState } from './useEmployeeListState';

interface ImportExportModalsProps {
  state: EmployeeListState;
}

export const ImportExportModals: FC<ImportExportModalsProps> = ({ state }) => (
  <>
  <Overlay
    open={state.showImportModal}
    onOpenChange={(nextOpen) => {
      if (!nextOpen) {
        state.closeImportModal();
      }
    }}
    variant="modal"
    title="Импорт сотрудников"
    description={`Импорт данных для раздела: ${state.importContext}`}
    titleHidden
    descriptionHidden
    testId="import-modal"
    contentClassName="max-w-xl w-full mx-auto"
    showCloseButton={false}
  >
    <DialogTitle asChild>
      <VisuallyHidden>Импорт сотрудников</VisuallyHidden>
    </DialogTitle>
    <DialogDescription asChild>
      <VisuallyHidden>{`Импорт данных для раздела: ${state.importContext}`}</VisuallyHidden>
    </DialogDescription>
    <div className="flex items-center justify-between py-4 border-b border-gray-200">
      <div>
        <h3 id="import-modal-heading" className="text-lg font-semibold text-gray-900">Импорт сотрудников</h3>
        <p className="text-sm text-gray-500">Шаблоны: Appendix 1/3/4/8</p>
      </div>
      <button
        type="button"
        onClick={state.closeImportModal}
        className="text-gray-400 hover:text-gray-600"
        aria-label="Закрыть импорт"
      >
        ✕
      </button>
    </div>
    <div className="py-5 space-y-3 text-sm text-gray-700">
      <p className="text-gray-500">Выбран раздел: <span className="font-medium text-gray-700">{state.importContext}</span></p>
      <ol className="list-decimal list-inside space-y-1">
        <li>Скачайте и заполните шаблон (Appendix 1 — сотрудники, Appendix 3 — навыки, Appendix 4 — активности, Appendix 8 — схемы).</li>
        <li>Проверьте форматы дат и соответствие справочникам системы.</li>
        <li>Загрузите файл: предварительная проверка выполнится на фронте, итоговая загрузка — после подключения бэкенда.</li>
      </ol>
      <button
        type="button"
        onClick={state.handleImportClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Выбрать файл
      </button>
      {state.importFeedback && <p className="text-sm text-blue-700">{state.importFeedback}</p>}
    </div>
  </Overlay>
  {/* Export modal */}
  <Overlay
    open={state.showExportModal}
    onOpenChange={(nextOpen) => {
      if (!nextOpen) {
        state.closeExportModal();
      }
    }}
    variant="modal"
    title="Экспорт списка сотрудников"
    description={`Формирование файла: ${state.exportContext}`}
    titleHidden
    descriptionHidden
    testId="export-modal"
    contentClassName="max-w-xl w-full mx-auto"
    showCloseButton={false}
  >
    <DialogTitle asChild>
      <VisuallyHidden>Экспорт списка сотрудников</VisuallyHidden>
    </DialogTitle>
    <DialogDescription asChild>
      <VisuallyHidden>{`Формирование файла: ${state.exportContext}`}</VisuallyHidden>
    </DialogDescription>
    <div className="flex items-center justify-between py-4 border-b border-gray-200">
      <div>
        <h3 id="export-modal-heading" className="text-lg font-semibold text-gray-900">Экспорт списка сотрудников</h3>
        <p className="text-sm text-gray-500">Учёт активных колонок и фильтров</p>
      </div>
      <button
        type="button"
        onClick={state.closeExportModal}
        className="text-gray-400 hover:text-gray-600"
        aria-label="Закрыть экспорт"
      >
        ✕
      </button>
    </div>
    <div className="py-5 space-y-3 text-sm text-gray-700">
      <p className="text-gray-500">Формат: <span className="font-medium text-gray-700">{state.exportContext}</span></p>
      <p>
        Экспорт формирует CSV-файл в соответствии с выбранными колонками и активными фильтрами.
        Формат соответствует Appendix 1, чтобы можно было исправить данные и загрузить обратно.
      </p>
      <button
        type="button"
        onClick={state.handleExport}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Скачать CSV
      </button>
      {state.exportFeedback && <p className="text-sm text-blue-700">{state.exportFeedback}</p>}
    </div>
  </Overlay>
  </>
);

export default ImportExportModals;
