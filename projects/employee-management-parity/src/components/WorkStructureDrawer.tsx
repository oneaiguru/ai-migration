import type { ReactNode } from 'react';
import { Dialog } from '../wrappers';
import type { Employee } from '../types/employee';
import { formatPhone } from '../utils/format';

interface WorkStructureDrawerProps {
  trigger: ReactNode;
  employee: Employee;
}

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</h3>
);

const WorkStructureDrawer = ({ trigger, employee }: WorkStructureDrawerProps) => {
  const path = employee.structurePath ?? [];
  const tree = employee.structureTree ?? [];
  const emergency = employee.emergencyContact ?? employee.personalInfo.emergencyContact;
  const contacts = employee.contacts;
  const workSettings = employee.workSettings;
  const managerName = employee.managerName ?? (typeof employee.workInfo.manager === 'string'
    ? employee.workInfo.manager
    : employee.workInfo.manager.fullName);

  return (
    <Dialog
      variant="sheet"
      size="lg"
      trigger={trigger}
      title="Рабочая структура"
      description="Организационная и контактная информация сотрудника"
      testId="work-structure"
      overlayClassName="bg-slate-900/40"
    >
      <div className="flex flex-col gap-8">
        <section className="space-y-3">
          <SectionTitle>Организационная структура</SectionTitle>
          <ol className="space-y-2 text-sm text-slate-800">
            {path.map((label, index) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {index + 1}
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <SectionTitle>Контакты</SectionTitle>
            <dl className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Руководитель</dt>
                <dd className="text-right font-medium text-slate-900">{managerName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Рабочий телефон</dt>
                <dd className="text-right font-medium text-slate-900">{contacts ? formatPhone(contacts.workPhone) : '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Корпоративная почта</dt>
                <dd className="text-right font-medium text-slate-900">{contacts?.corporateEmail}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <SectionTitle>Рабочие параметры</SectionTitle>
            <dl className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Офис</dt>
                <dd className="text-right font-medium text-slate-900">{workSettings?.office}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Часовой пояс</dt>
                <dd className="text-right font-medium text-slate-900">{workSettings?.timeZone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Схема работы</dt>
                <dd className="text-right font-medium text-slate-900">{workSettings?.workScheme}</dd>
              </div>
            </dl>
          </div>
        </section>

        {tree.length > 0 ? (
          <section className="rounded-lg border border-slate-200 p-4">
            <SectionTitle>Дерево подразделений</SectionTitle>
            <ul className="mt-3 space-y-3 text-sm text-slate-700">
              {tree.map((node) => (
                <li key={node.id}>
                  <p className="font-medium text-slate-900">{node.label}</p>
                  {node.children ? (
                    <ul className="mt-2 space-y-1 border-l border-dashed border-slate-300 pl-4">
                      {node.children.map((child) => (
                        <li key={child.id}>
                          <span>{child.label}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {emergency ? (
          <section className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <SectionTitle>Экстренный контакт</SectionTitle>
            <p className="mt-2 text-sm text-slate-800">
              {emergency.name} • {emergency.relationship} • {formatPhone(emergency.phone)}
            </p>
          </section>
        ) : null}
      </div>
    </Dialog>
  );
};

export default WorkStructureDrawer;
