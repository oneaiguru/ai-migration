import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { Employee, EmployeeStatus } from '../types/employee';

export interface CsvColumnDefinition {
  key: string;
  label: string;
}

export interface CsvValidationResult {
  valid: boolean;
  missingHeaders: string[];
  message?: string;
}

const normalizeHeader = (value: string) => value.replace(/"/g, '').trim().toLowerCase();

const formatStatusLabel = (status: EmployeeStatus) => {
  switch (status) {
    case 'active':
      return 'Активен';
    case 'probation':
      return 'Испытательный';
    case 'vacation':
      return 'В отпуске';
    case 'inactive':
      return 'Неактивен';
    case 'terminated':
      return 'Уволен';
    default:
      return status;
  }
};

export const generateEmployeeCsv = (
  employees: Employee[],
  columns: CsvColumnDefinition[],
): string => {
  const header = columns.map((column) => column.label);
  const rows = employees.map((employee) =>
    columns.map((column) => {
      switch (column.key) {
        case 'fio':
          return `${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim();
        case 'position':
          return employee.workInfo.position;
        case 'orgUnit':
          return employee.orgPlacement.orgUnit;
        case 'team':
          return employee.workInfo.team.name;
        case 'scheme':
          return employee.orgPlacement.workScheme?.name ?? '';
        case 'hourNorm':
          return String(employee.orgPlacement.hourNorm);
        case 'status':
          return formatStatusLabel(employee.status);
        case 'hireDate':
          return employee.workInfo.hireDate.toLocaleDateString('ru-RU');
        default:
          return '';
      }
    }),
  );

  return Papa.unparse({ fields: header, data: rows });
};

export const generateVacationCsv = (
  employees: Employee[],
  statusLabel: (status: EmployeeStatus) => string,
): string | null => {
  const rows = employees
    .filter((employee) => employee.status === 'vacation')
    .map((employee) => [
      employee.credentials.wfmLogin,
      `${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim(),
      statusLabel(employee.status),
      employee.workInfo.team.name,
      'Отпуск по графику',
    ]);

  if (rows.length === 0) {
    return null;
  }

  const fields = ['login', 'ФИО', 'Статус', 'Команда', 'Комментарий'];
  return Papa.unparse({ fields, data: rows });
};

export const generateTagCsv = (employees: Employee[]): string | null => {
  const rows = employees.flatMap((employee) => {
    const fio = `${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim();

    if (employee.tags.length === 0) {
      return [[employee.credentials.wfmLogin, fio, '']];
    }

    return employee.tags.map((tag) => [employee.credentials.wfmLogin, fio, tag]);
  });

  if (rows.length === 0) {
    return null;
  }

  const fields = ['login', 'ФИО', 'Тег'];
  return Papa.unparse({ fields, data: rows });
};

export const validateCsvHeaders = (text: string, required: string[]): CsvValidationResult => {
  const [firstLine] = text.split(/\r?\n/).filter(Boolean);

  if (!firstLine) {
    return {
      valid: false,
      missingHeaders: required,
      message: 'Файл не содержит данных.',
    };
  }

  const normalizedHeaders = firstLine
    .split(',')
    .map(normalizeHeader)
    .filter((header) => header.length > 0);

  const missingHeaders = required.filter((header) => !normalizedHeaders.includes(header.toLowerCase()));

  return {
    valid: missingHeaders.length === 0,
    missingHeaders,
  };
};

export const parseWorkbookHeaders = async (file: File): Promise<string[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const [firstSheetName] = workbook.SheetNames;
  if (!firstSheetName) {
    return [];
  }
  const worksheet = workbook.Sheets[firstSheetName];
  const json = XLSX.utils.sheet_to_json<string[]>({ ...worksheet, '!range': undefined }, { header: 1 });
  const [headerRow] = json;
  return (headerRow ?? []).map((value) => String(value ?? '').trim());
};

export const stripRichTextToPlain = (html: string): string => {
  if (!html) {
    return '';
  }

  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?p>/gi, '\n')
    .replace(/<\/?li>/gi, '\n')
    .replace(/<\/?div>/gi, '\n')
    .replace(/<\/?h\d>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
};

export const toRichText = (value: string): string => {
  if (!value) {
    return '<p></p>';
  }

  const lines = value.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return '<p></p>';
  }

  return lines.map((line) => `<p>${line}</p>`).join('');
};
