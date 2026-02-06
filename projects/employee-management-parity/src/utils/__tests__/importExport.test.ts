import { describe, expect, it } from 'vitest';
import {
  generateEmployeeCsv,
  generateTagCsv,
  generateVacationCsv,
  stripRichTextToPlain,
  toRichText,
  validateCsvHeaders,
} from '../importExport';
import type { Employee } from '../../types/employee';

describe('import/export helpers', () => {
  const employee: Employee = {
    id: '1',
    employeeId: 'EMP-1',
    status: 'vacation',
    personalInfo: {
      lastName: 'Иванов',
      firstName: 'Иван',
      middleName: undefined,
      email: 'ivanov@example.com',
      phone: '+7 999 123-45-67',
      photo: undefined,
      address: 'Москва',
      emergencyContact: undefined,
      dateOfBirth: undefined,
    },
    credentials: {
      wfmLogin: 'ivanov',
      externalLogins: ['sip:ivanov'],
      passwordSet: true,
      passwordLastUpdated: new Date('2024-01-01'),
    },
    workInfo: {
      position: 'Оператор',
      team: {
        id: 'team-1',
        name: 'Команда 1',
        description: undefined,
        color: '#2563eb',
        managerId: 'mgr-1',
        memberCount: 10,
        targetUtilization: 90,
      },
      manager: {
        id: 'mgr-1',
        fullName: 'Мария Петрова',
      },
      hireDate: new Date('2022-01-01'),
      contractType: 'full-time',
      salary: undefined,
      workLocation: 'Москва',
      department: 'Контакт-центр',
    },
    orgPlacement: {
      orgUnit: 'MOW',
      office: 'Москва-Сити',
      timeZone: 'Europe/Moscow',
      hourNorm: 40,
      workScheme: { id: 'scheme-1', name: '2/2', type: 'shift', effectiveFrom: new Date('2024-01-01') },
      workSchemeHistory: [],
    },
    skills: [],
    reserveSkills: [],
    tags: ['ментор'],
    preferences: {
      preferredShifts: ['Дневная'],
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
      schemePreferences: [],
    },
    performance: {
      averageHandleTime: 250,
      callsPerHour: 12,
      qualityScore: 98,
      adherenceScore: 95,
      customerSatisfaction: 4.9,
      lastEvaluation: new Date('2024-09-01'),
    },
    certifications: [],
    metadata: {
      createdAt: new Date('2022-01-01'),
      updatedAt: new Date('2024-10-01'),
      createdBy: 'system',
      lastModifiedBy: 'system',
      lastLogin: new Date('2024-09-15'),
      previousStatus: 'active',
    },
    tasks: [],
    personnelNumber: '12345',
    actualAddress: 'Москва',
  };

  it('generates CSV for selected columns', () => {
    const csv = generateEmployeeCsv([employee], [
      { key: 'fio', label: 'Ф.И.О.' },
      { key: 'team', label: 'Команда' },
      { key: 'status', label: 'Статус' },
    ]);

    expect(csv).toContain('Ф.И.О.,Команда,Статус');
    expect(csv).toContain('Иванов Иван,Команда 1,В отпуске');
  });

  it('formats hire date using Russian locale', () => {
    const csv = generateEmployeeCsv([employee], [{ key: 'hireDate', label: 'Дата найма' }]);
    expect(csv).toContain('Дата найма');
    expect(csv).toContain('01.01.2022');
  });

  it('generates vacation CSV when employees on vacation exist', () => {
    const csv = generateVacationCsv([employee], () => 'В отпуске');
    expect(csv).not.toBeNull();
    expect(csv).toContain('Отпуск по графику');
  });

  it('returns null for vacation CSV when no matching employees', () => {
    const csv = generateVacationCsv([{ ...employee, status: 'active' }], () => 'Активен');
    expect(csv).toBeNull();
  });

  it('generates tag CSV for employees with and without tags', () => {
    const csv = generateTagCsv([employee, { ...employee, id: '2', tags: [] }]);
    expect(csv).not.toBeNull();
    expect(csv).toContain('ментор');
  });

  it('returns null for tag CSV when no employees provided', () => {
    const csv = generateTagCsv([]);
    expect(csv).toBeNull();
  });

  it('validates required headers', () => {
    const result = validateCsvHeaders('login,email\nivanov,ivanov@example.com', ['login']);
    expect(result.valid).toBe(true);
    expect(result.missingHeaders).toHaveLength(0);

    const invalid = validateCsvHeaders('email\nivanov@example.com', ['login']);
    expect(invalid.valid).toBe(false);
    expect(invalid.missingHeaders).toEqual(['login']);
  });

  it('returns validation message when CSV has no data', () => {
    const empty = validateCsvHeaders('', ['login']);
    expect(empty.valid).toBe(false);
    expect(empty.message).toBe('Файл не содержит данных.');
  });

  it('converts rich text to plain string', () => {
    const plain = stripRichTextToPlain('<p>Привет</p><p>Команда</p>');
    expect(plain).toBe('Привет\nКоманда');
  });

  it('wraps plain text into rich text paragraphs', () => {
    const richText = toRichText('Привет\nКоманда');
    expect(richText).toBe('<p>Привет</p><p>Команда</p>');
  });
});
