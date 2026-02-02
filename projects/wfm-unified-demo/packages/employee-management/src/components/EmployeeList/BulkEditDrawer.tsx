import type { FC } from 'react';
import type { EmployeeStatus } from '../../types/employee';
import { Overlay } from '../common/Overlay';
import { DialogDescription, DialogTitle } from '../../wrappers/ui/Dialog';
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { EmployeeListState } from './useEmployeeListState';

interface BulkEditDrawerProps {
  state: EmployeeListState;
}

export const BulkEditDrawer: FC<BulkEditDrawerProps> = ({ state }) => (
  <Overlay
    open={state.isBulkEditOpen}
    onOpenChange={(nextOpen) => {
      if (!nextOpen) {
        state.handleBulkEditClose();
      }
    }}
    variant="sheet"
    title="Редактирование данных сотрудников"
    description="Применение массовых изменений для выбранных сотрудников"
    titleHidden
    descriptionHidden
    testId="bulk-edit-overlay"
    contentClassName="relative ml-auto flex h-full w-full max-w-2xl flex-col"
    showCloseButton={false}
  >
    <form className="flex flex-col h-full" onSubmit={state.handleBulkEditSubmit}>
      <DialogTitle asChild>
        <VisuallyHidden>Редактирование данных сотрудников</VisuallyHidden>
      </DialogTitle>
      <DialogDescription asChild>
        <VisuallyHidden>Применение массовых изменений для выбранных сотрудников</VisuallyHidden>
      </DialogDescription>
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Редактирование данных сотрудников</h3>
          <p className="text-sm text-gray-500">
            Выбрано: {state.selectedEmployees.size}{' '}
            {state.selectedEmployees.size === 1 ? 'сотрудник' : 'сотрудников'}.
          </p>
        </div>
        <button
          type="button"
          onClick={state.handleBulkEditClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Закрыть массовое редактирование"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-5 space-y-6">
            {state.bulkEditError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {state.bulkEditError}
              </div>
            )}

            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-900">
              Отметьте действие «Добавить / Заменить / Удалить» для нужных полей. Значения будут применены ко всем выбранным сотрудникам.
            </div>

            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Статус</p>
                    <p className="text-xs text-gray-500">Массовая замена статуса сотрудников.</p>
                  </div>
                  {state.renderActionButtons('status')}
                </div>
                <select
                  id="bulk-edit-status"
                  value={state.bulkEditMatrix.status.value}
                  onChange={(event) => state.updateMatrixValue('status', event.target.value as EmployeeStatus | '')}
                  disabled={state.bulkEditMatrix.status.action === 'none'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Выберите статус</option>
                  {Object.entries(state.STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </section>

              <section className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Команда</p>
                    <p className="text-xs text-gray-500">Переместить сотрудников в другую команду.</p>
                  </div>
                  {state.renderActionButtons('team')}
                </div>
                <select
                  id="bulk-edit-team"
                  value={state.bulkEditMatrix.team.value}
                  onChange={(event) => state.updateMatrixValue('team', event.target.value)}
                  disabled={state.bulkEditMatrix.team.action === 'none'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Выберите команду</option>
                  {state.teamOptions.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </section>

              <section className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Норма часов</p>
                    <p className="text-xs text-gray-500">Заменить норму рабочего времени.</p>
                  </div>
                  {state.renderActionButtons('hourNorm')}
                </div>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={state.bulkEditMatrix.hourNorm.value}
                  onChange={(event) => state.updateMatrixValue('hourNorm', event.target.value)}
                  disabled={state.bulkEditMatrix.hourNorm.action === 'none'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="Например: 40"
                />
              </section>

              <section className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Схема работы</p>
                    <p className="text-xs text-gray-500">Добавить, заменить или снять назначенную схему.</p>
                  </div>
                  {state.renderActionButtons('workScheme')}
                </div>
                <select
                  value={state.bulkEditMatrix.workScheme.value}
                  onChange={(event) => state.updateMatrixValue('workScheme', event.target.value)}
                  disabled={
                    state.bulkEditMatrix.workScheme.action === 'none' ||
                    state.bulkEditMatrix.workScheme.action === 'remove'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Выберите схему</option>
                  {state.schemeOptions.map((scheme) => (
                    <option key={scheme.id} value={scheme.id}>
                      {scheme.name}
                    </option>
                  ))}
                </select>
                {state.bulkEditMatrix.workScheme.action === 'remove' && (
                  <p className="text-xs text-gray-500">Схема будет снята у всех выбранных сотрудников.</p>
                )}
              </section>

              <section className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Навыки</p>
                    <p className="text-xs text-gray-500">Каждый навык с новой строки или через запятую.</p>
                  </div>
                  {state.renderActionButtons('skills')}
                </div>
                <textarea
                  value={state.bulkEditMatrix.skills.value.join('\n')}
                  onChange={(event) => {
                    const tokens = event.target.value
                      .split(/[\n,;]+/)
                      .map((token) => token.trim())
                      .filter(Boolean);
                    const unique = Array.from(new Set(tokens));
                    state.setBulkEditMatrix((prev) => ({
                      ...prev,
                      skills: {
                        action:
                          unique.length === 0
                            ? 'none'
                            : prev.skills.action === 'none'
                              ? 'add'
                              : prev.skills.action,
                        value: unique,
                      },
                    }));
                  }}
                  disabled={state.bulkEditMatrix.skills.action === 'none'}
                  className="w-full min-h-[92px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="CRM, Работа с возражениями"
                />
              </section>

              <section className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Резервные навыки</p>
                    <p className="text-xs text-gray-500">Список резервных навыков для выбранных сотрудников.</p>
                  </div>
                  {state.renderActionButtons('reserveSkills')}
                </div>
                <textarea
                  value={state.bulkEditMatrix.reserveSkills.value.join('\n')}
                  onChange={(event) => {
                    const tokens = event.target.value
                      .split(/[\n,;]+/)
                      .map((token) => token.trim())
                      .filter(Boolean);
                    const unique = Array.from(new Set(tokens));
                    state.setBulkEditMatrix((prev) => ({
                      ...prev,
                      reserveSkills: {
                        action:
                          unique.length === 0
                            ? 'none'
                            : prev.reserveSkills.action === 'none'
                              ? 'add'
                              : prev.reserveSkills.action,
                        value: unique,
                      },
                    }));
                  }}
                  disabled={state.bulkEditMatrix.reserveSkills.action === 'none'}
                  className="w-full min-h-[92px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="Английский, Чаты"
                />
              </section>

              <section className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Теги</p>
                    <p className="text-xs text-gray-500">Добавить, заменить или удалить теги.</p>
                  </div>
                  {state.renderActionButtons('tags')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {state.allTags.map((tag) => {
                    const active = state.bulkEditMatrix.tags.value.includes(tag);
                    return (
                      <button
                        key={`bulk-tag-${tag}`}
                        type="button"
                        onClick={() => {
                          state.setBulkEditMatrix((prev) => {
                            const nextSet = new Set(prev.tags.value);
                            if (nextSet.has(tag)) {
                              nextSet.delete(tag);
                            } else {
                              nextSet.add(tag);
                            }
                            const nextValues = Array.from(nextSet);
                            return {
                              ...prev,
                              tags: {
                                action:
                                  nextValues.length === 0
                                    ? 'none'
                                    : prev.tags.action === 'none'
                                      ? 'add'
                                      : prev.tags.action,
                                value: nextValues,
                              },
                            };
                          });
                        }}
                        className={`px-2 py-1 rounded-full border text-xs transition-colors ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  value={state.bulkEditMatrix.tags.value.join('\n')}
                  onChange={(event) => {
                    const tokens = event.target.value
                      .split(/[\n,;]+/)
                      .map((token) => token.trim())
                      .filter(Boolean);
                    const unique = Array.from(new Set(tokens));
                    state.setBulkEditMatrix((prev) => ({
                      ...prev,
                      tags: {
                        action:
                          unique.length === 0
                            ? 'none'
                            : prev.tags.action === 'none'
                              ? 'add'
                              : prev.tags.action,
                        value: unique,
                      },
                    }));
                  }}
                  disabled={state.bulkEditMatrix.tags.action === 'none'}
                  className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="VIP, Новичок"
                />
              </section>

              <section className="space-y-3">
                <p className="text-sm font-semibold text-gray-900">Комментарий / задача</p>
                <textarea
                  id="bulk-edit-comment"
                  value={state.bulkEditMatrix.comment}
                  onChange={(event) => state.updateMatrixComment(event.target.value)}
                  className="w-full min-h-[92px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Заметка появится в таймлайне задач"
                />
                <p className="text-xs text-gray-400">Комментарий добавится в блок задач каждого сотрудника.</p>
              </section>
            </div>

            {state.selectedEmployeeList.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">Выбранные сотрудники</p>
                  <span className="text-xs text-gray-500">Всего: {state.selectedEmployeeList.length}</span>
                </div>
                <ul className="space-y-1 max-h-36 overflow-y-auto">
                  {state.selectedEmployeeList.slice(0, 8).map((emp) => (
                    <li key={emp.id} className="flex items-center justify-between gap-3">
                      <span>{emp.personalInfo.lastName} {emp.personalInfo.firstName}</span>
                      <span className="text-xs text-gray-500">{emp.workInfo.team.name}</span>
                    </li>
                  ))}
                  {state.selectedEmployeeList.length > 8 && (
                    <li className="text-xs text-gray-500">и ещё {state.selectedEmployeeList.length - 8}…</li>
                  )}
                </ul>
              </div>
            )}

            {state.matrixSummary.length > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 space-y-2">
                <p className="font-medium">Предстоящие изменения</p>
                <ul className="list-disc list-inside space-y-1">
                  {state.matrixSummary.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

      <div className="py-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          onClick={state.handleBulkEditClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Применить изменения
        </button>
      </div>
    </form>
  </Overlay>


);

export default BulkEditDrawer;
