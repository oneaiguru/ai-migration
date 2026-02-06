import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import EmployeeListContainer from './EmployeeListContainer';
import type { Employee } from '../../types/employee';

type Args = Record<string, never>;

const buildEmployee = (overrides: Partial<Employee> & { id: string }): Employee => ({
  id: overrides.id,
  employeeId: overrides.id.toUpperCase(),
  status: 'active',
  personalInfo: {
    firstName: 'Имя',
    lastName: 'Фамилия',
    middleName: '',
    email: 'user@example.com',
    phone: '+996555000000',
    ...overrides.personalInfo,
  },
  credentials: {
    wfmLogin: 'user.login',
    externalLogins: [],
    passwordSet: true,
    ...overrides.credentials,
  },
  workInfo: {
    position: 'Специалист',
    team: {
      id: 'team_support',
      name: 'Поддержка',
      description: '',
      color: '#2563eb',
      managerId: 'mgr',
      memberCount: 8,
      targetUtilization: 0.8,
    },
    manager: 'mgr',
    hireDate: new Date('2021-01-01'),
    contractType: 'full-time',
    workLocation: 'Бишкек',
    department: 'Контакт-центр',
    ...overrides.workInfo,
  },
  orgPlacement: {
    orgUnit: 'Центр',
    office: 'Бишкек',
    timeZone: 'Asia/Bishkek',
    hourNorm: 40,
    ...overrides.orgPlacement,
  },
  skills: overrides.skills ?? [],
  reserveSkills: overrides.reserveSkills ?? [],
  tags: overrides.tags ?? [],
  preferences: overrides.preferences ?? {
    preferredShifts: [],
    notifications: {
      email: true,
      sms: false,
      push: true,
      scheduleChanges: true,
      announcements: true,
      reminders: true,
    },
    language: 'ru',
    workingHours: { start: '09:00', end: '18:00' },
  },
  performance: overrides.performance ?? {
    averageHandleTime: 0,
    callsPerHour: 0,
    qualityScore: 92,
    adherenceScore: 95,
    customerSatisfaction: 90,
    lastEvaluation: new Date('2024-01-01'),
  },
  certifications: overrides.certifications ?? [],
  metadata: overrides.metadata ?? {
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'system',
    lastModifiedBy: 'system',
  },
});

const SAMPLE_EMPLOYEES: Employee[] = [
  buildEmployee({
    id: 'emp_demo_1',
    personalInfo: { firstName: 'Динара', lastName: 'Абдуллаева' },
    credentials: { wfmLogin: 'd.abdullaeva' },
    workInfo: { position: 'Старший оператор', team: { ...buildEmployee({ id: 'stub' }).workInfo.team, name: 'Контроль качества' } },
    tags: ['качество', 'голос'],
  }),
  buildEmployee({
    id: 'emp_demo_2',
    personalInfo: { firstName: 'Самат', lastName: 'Ибраимов' },
    credentials: { wfmLogin: 's.ibraimov' },
    workInfo: { position: 'Аналитик', team: { ...buildEmployee({ id: 'stub' }).workInfo.team, name: 'Аналитика' } },
    tags: ['резерв'],
  }),
  buildEmployee({
    id: 'emp_demo_3',
    personalInfo: { firstName: 'Айдана', lastName: 'Мирбек кызы' },
    credentials: { wfmLogin: 'a.mirbek' },
    workInfo: { position: 'HR-специалист', team: { ...buildEmployee({ id: 'stub' }).workInfo.team, name: 'HR-служба' } },
    tags: ['hr'],
  }),
];

const meta: Meta<Args> = {
  title: 'EmployeeList/EmployeeListContainer',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<Args>;

export const WithMiniSearch: Story = {
  render: () => {
    const [employees, setEmployees] = useState(SAMPLE_EMPLOYEES);
    const focusEmployeeId = useMemo(() => employees[0]?.id ?? null, [employees]);

    return (
      <div style={{ padding: 24, minHeight: '80vh', background: '#f8fafc' }}>
        <p style={{ marginBottom: 16, color: '#1e293b' }}>
          Попробуйте ввести «абдуллаев» или «аналит» в поле поиска: таблица подсветит совпадения и отсортирует
          сотрудников по релевантности.
        </p>
        <EmployeeListContainer
          employees={employees}
          onEmployeesChange={(updater) => setEmployees((prev) => updater([...prev]))}
          onOpenQuickAdd={() => {}}
          focusEmployeeId={focusEmployeeId}
        />
      </div>
    );
  },
};
