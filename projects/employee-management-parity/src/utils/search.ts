import MiniSearch from 'minisearch';
import type { Employee } from '../types/employee';

const normalize = (value: string) => value.normalize('NFC').toLowerCase();

export interface EmployeeSearchDocument {
  id: string;
  fullName: string;
  login: string;
  position: string;
  team: string;
  tags: string;
}

export interface EmployeeSearchSummary {
  ids: Set<string>;
  order: Map<string, number>;
}

const SEARCH_OPTIONS = {
  boost: {
    fullName: 4,
    login: 3,
    team: 2,
    position: 2,
    tags: 1,
  },
  fuzzy: 0.2 as const,
  prefix: true,
};

export const buildEmployeeSearchDocuments = (employees: Employee[]): EmployeeSearchDocument[] =>
  employees.map((employee) => ({
    id: employee.id,
    fullName: normalize(
      [
        employee.personalInfo.lastName,
        employee.personalInfo.firstName,
        employee.personalInfo.middleName ?? '',
      ]
        .filter(Boolean)
        .join(' '),
    ),
    login: normalize(employee.credentials.wfmLogin),
    position: normalize(employee.workInfo.position),
    team: normalize(employee.workInfo.team.name),
    tags: normalize(employee.tags.join(' ')),
  }));

export const createEmployeeMiniSearch = (documents: EmployeeSearchDocument[]) => {
  const index = new MiniSearch<EmployeeSearchDocument>({
    fields: ['fullName', 'login', 'position', 'team', 'tags'],
    storeFields: ['id'],
    searchOptions: SEARCH_OPTIONS,
  });
  index.addAll(documents);
  return index;
};

export const searchEmployees = (
  index: MiniSearch<EmployeeSearchDocument>,
  query: string,
): EmployeeSearchSummary | null => {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const results = index.search(trimmed, SEARCH_OPTIONS);
  const ids = new Set<string>();
  const order = new Map<string, number>();

  results.forEach((result, position) => {
    const id = String(result.id);
    ids.add(id);
    order.set(id, position);
  });

  return {
    ids,
    order,
  };
};
