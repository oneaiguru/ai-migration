import type { FC } from 'react';
import { Overlay } from '../common/Overlay';
import { DialogDescription, DialogTitle } from '../../wrappers/ui/Dialog';
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { MAX_TAGS_PER_EMPLOYEE, getColorForTag } from './useEmployeeListState';
import type { EmployeeListState } from './useEmployeeListState';

interface TagManagerOverlayProps {
  state: EmployeeListState;
}

export const TagManagerOverlay: FC<TagManagerOverlayProps> = ({ state }) => (
  <Overlay
    open={state.showTagManager}
    onOpenChange={(nextOpen) => {
      if (!nextOpen) {
        state.closeTagManager();
      }
    }}
    variant="modal"
    title="Управление тегами сотрудников"
    description="Добавление и обновление тегов для отобранных сотрудников"
    titleHidden
    descriptionHidden
    testId="tag-manager-overlay"
    contentClassName="max-w-lg w-full mx-auto"
    showCloseButton={false}
  >
    <DialogTitle asChild>
      <VisuallyHidden>Управление тегами сотрудников</VisuallyHidden>
    </DialogTitle>
    <DialogDescription asChild>
      <VisuallyHidden>Добавление и обновление тегов для отобранных сотрудников</VisuallyHidden>
    </DialogDescription>
    <div className="flex items-center justify-between py-4 border-b border-gray-200">
      <div>
        <h3 id="tag-manager-heading" className="text-lg font-semibold text-gray-900">Управление тегами</h3>
        <p className="text-sm text-gray-500">См. Appendix 6 — Tag Import Template</p>
      </div>
      <button
        type="button"
        onClick={state.closeTagManager}
        className="text-gray-400 hover:text-gray-600"
        aria-label="Закрыть управление тегами"
      >
        ✕
      </button>
    </div>
    <div className="py-5 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Сотрудников выделено: <span className="font-medium">{state.selectedEmployees.size}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {state.MATRIX_ACTIONS.map((action) => (
            <button
              key={`tag-action-${action}`}
              type="button"
              onClick={() => {
                state.setTagAction(action);
                state.setTagError(null);
                if (action !== 'remove') {
                  state.setSelectedTagNames((prev) => prev.slice(0, MAX_TAGS_PER_EMPLOYEE));
                }
              }}
              className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                state.tagAction === action ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
              aria-pressed={state.tagAction === action}
            >
              {state.MATRIX_ACTION_LABELS[action]}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-500">
        {state.tagAction === 'add' && `Добавление новых тегов не превысит лимит в ${MAX_TAGS_PER_EMPLOYEE} на сотрудника.`}
        {state.tagAction === 'replace' && 'Новый набор заменит текущие теги выбранных сотрудников.'}
        {state.tagAction === 'remove' && 'Отметьте теги, которые нужно снять у сотрудников.'}
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Название тега</label>
          <input
            type="text"
            value={state.newTagName}
            onChange={(event) => {
              state.setNewTagName(event.target.value);
              if (state.tagCreationError) {
                state.setTagCreationError(null);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Например: VIP"
          />
        </div>
        <div>
          <span className="block text-xs uppercase font-semibold text-gray-500 mb-2">Цвет</span>
          <div className="flex flex-wrap gap-2">
            {state.TAG_COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => state.setNewTagColor(color)}
                className={`w-7 h-7 rounded-full border transition-shadow ${
                  state.newTagColor === color ? 'border-blue-600 ring-2 ring-blue-300' : 'border-transparent hover:ring-2 hover:ring-blue-200'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Выбрать цвет ${color}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={state.handleCreateTag}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Создать тег
          </button>
          {state.tagCreationError && <span className="text-xs text-red-600">{state.tagCreationError}</span>}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Доступные теги</p>
        <div className="max-h-64 overflow-auto space-y-2">
          {state.renderTagCatalogList()}
        </div>
      </div>

      {state.selectedTags.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 space-y-2">
          <p className="font-semibold text-gray-700">У выбранных сотрудников уже есть</p>
          <div className="flex flex-wrap gap-2">
            {state.selectedTags.map((tag) => (
              <span
                key={`selected-${tag}`}
                className="px-2 py-1 rounded-full border border-gray-200 text-xs font-medium"
                style={{
                  backgroundColor: `${(state.tagCatalog[tag] ?? getColorForTag(tag))}20`,
                  color: '#1f2937',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {state.tagError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.tagError}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={state.closeTagManager}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={state.handleApplyTags}
          disabled={state.selectedEmployees.size === 0}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            state.selectedEmployees.size === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Применить изменения
        </button>
      </div>
    </div>
  </Overlay>

);

export default TagManagerOverlay;
