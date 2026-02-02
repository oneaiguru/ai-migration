import { describe, expect, it } from 'vitest';
import type { Employee, Team } from '../../types/employee';
import {
  buildEmployeeSearchDocuments,
  createEmployeeMiniSearch,
  searchEmployees,
} from '../search';

const defaultTeam: Team = {
  id: 'team_default',
  name: 'Команда',
  description: '',
  color: '#2563eb',
  managerId: 'mgr',
  memberCount: 1,
  targetUtilization: 0.8,
};

const makeEmployee = (overrides: Partial<Employee> & { id: string }): Employee => {
  const base: Employee = {
    id: overrides.id,
    employeeId: overrides.id,
    status: 'active',
    personalInfo: {
      firstName: 'Имя',
      lastName: 'Фамилия',
      middleName: '',
      email: 'user@example.com',
      phone: '+996000000000',
    },
    credentials: {
      wfmLogin: 'demo.login',
      externalLogins: [],
      passwordSet: true,
    },
    workInfo: {
      position: 'Специалист',
      team: { ...defaultTeam },
      manager: 'mgr',
      hireDate: new Date('2024-01-01'),
      contractType: 'full-time',
      workLocation: 'Бишкек',
      department: 'Контакт-центр',
    },
    orgPlacement: {
      orgUnit: 'Центр',
      office: 'Бишкек',
      timeZone: 'Asia/Bishkek',
      hourNorm: 40,
    },
    skills: [],
    reserveSkills: [],
    tags: [],
    preferences: {
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
    performance: {
      averageHandleTime: 0,
      callsPerHour: 0,
      qualityScore: 0,
      adherenceScore: 0,
      customerSatisfaction: 0,
      lastEvaluation: new Date('2024-01-01'),
    },
    certifications: [],
    metadata: {
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  };

  return {
    ...base,
    ...overrides,
    personalInfo: { ...base.personalInfo, ...overrides.personalInfo },
    credentials: { ...base.credentials, ...overrides.credentials },
    workInfo: {
      ...base.workInfo,
      ...overrides.workInfo,
      team: overrides.workInfo?.team ?? base.workInfo.team,
    },
    orgPlacement: { ...base.orgPlacement, ...overrides.orgPlacement },
    preferences: { ...base.preferences, ...overrides.preferences },
    performance: { ...base.performance, ...overrides.performance },
    metadata: { ...base.metadata, ...overrides.metadata },
  };
};

describe('employee MiniSearch helpers', () => {
  const employees: Employee[] = [
    makeEmployee({
      id: 'emp_1',
      personalInfo: { firstName: 'Динара', lastName: 'Абдуллаева' },
      credentials: { wfmLogin: 'd.abdullaeva' },
      workInfo: {
        position: 'Старший оператор',
        team: { ...defaultTeam, id: 'team_quality', name: 'Контроль качества' },
      },
      tags: ['качество', 'голос'],
    }),
    makeEmployee({
      id: 'emp_2',
      personalInfo: { firstName: 'Самат', lastName: 'Ибраимов' },
      credentials: { wfmLogin: 's.ibraimov' },
      workInfo: {
        position: 'Аналитик',
        team: { ...defaultTeam, id: 'team_analytics', name: 'Аналитика' },
      },
      tags: ['резерв'],
    }),
  ];

  const documents = buildEmployeeSearchDocuments(employees);
  const index = createEmployeeMiniSearch(documents);

  it('matches fuzzy queries on full name', () => {
    const summary = searchEmployees(index, 'абдуллаев');
    expect(summary?.ids.has('emp_1')).toBe(true);
  });

  it('matches prefix queries on login and team names', () => {
    const loginSummary = searchEmployees(index, 'd.abd');
    const teamSummary = searchEmployees(index, 'аналит');
    expect(loginSummary?.ids.has('emp_1')).toBe(true);
    expect(teamSummary?.ids.has('emp_2')).toBe(true);
  });

  it('produces stable ranking order', () => {
    const summary = searchEmployees(index, 'ан');
    expect(summary).not.toBeNull();
    const order = summary?.order;
    expect(order?.get('emp_1')).toBeDefined();
    expect(order?.get('emp_2')).toBeDefined();
  });

  it('returns null summary for empty queries', () => {
    expect(searchEmployees(index, '   ')).toBeNull();
  });
});
