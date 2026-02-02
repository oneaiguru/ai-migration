import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import {
  Employee,
  EmployeeStatus,
  EmployeeFilters,
  SkillAssignment,
  Team,
  WorkSchemeAssignment,
} from '../../types/employee';
import { createTaskEntry } from '../../utils/task';
import { buildEmployeeSearchDocuments, createEmployeeMiniSearch, searchEmployees } from '../../utils/search';
import {
  generateEmployeeCsv,
  generateTagCsv,
  generateVacationCsv,
  parseWorkbookHeaders,
  validateCsvHeaders,
} from '../../utils/importExport';

export interface EmployeeListContainerProps {
  employees: Employee[];
  onEmployeesChange: (updater: (prev: Employee[]) => Employee[]) => void;
  onOpenQuickAdd: () => void;
  focusEmployeeId: string | null;
}

export const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Активен',
  vacation: 'В отпуске',
  probation: 'Испытательный',
  inactive: 'Неактивен',
  terminated: 'Уволен',
};

export const STATUS_BADGE_CLASSES: Record<EmployeeStatus, string> = {
  active: 'bg-green-100 text-green-800',
  vacation: 'bg-yellow-100 text-yellow-800',
  probation: 'bg-blue-100 text-blue-800',
  inactive: 'bg-gray-100 text-gray-800',
  terminated: 'bg-red-100 text-red-800',
};

export const COLUMN_ORDER = [
  { key: 'fio', label: 'Ф.И.О.' },
  { key: 'position', label: 'Должность' },
  { key: 'orgUnit', label: 'Точка оргструктуры' },
  { key: 'team', label: 'Команда' },
  { key: 'scheme', label: 'Схема работы' },
  { key: 'hourNorm', label: 'Норма часов' },
  { key: 'status', label: 'Статус' },
  { key: 'hireDate', label: 'Дата найма' },
] as const;

type ColumnKey = typeof COLUMN_ORDER[number]['key'];

const COLUMN_STORAGE_KEY = 'employee-list:columns';
const FILTER_STORAGE_KEY = 'employee-list:filters';

export const createDefaultFilters = (): EmployeeFilters => ({
  search: '',
  team: '',
  status: '',
  skill: '',
  position: '',
  orgUnit: '',
  sortBy: 'name',
  sortOrder: 'asc',
  showInactive: false,
});

export const TAG_COLOR_PALETTE = ['#2563eb', '#1d4ed8', '#0ea5e9', '#0f766e', '#16a34a', '#d97706', '#db2777', '#7c3aed'];

export const getColorForTag = (tag: string) => {
  let hash = 0;
  for (let index = 0; index < tag.length; index += 1) {
    hash = (hash << 5) - hash + tag.charCodeAt(index);
    hash |= 0;
  }
  const paletteIndex = Math.abs(hash) % TAG_COLOR_PALETTE.length;
  return TAG_COLOR_PALETTE[paletteIndex];
};

export const IMPORT_OPTIONS = [
  { id: 'employees', label: 'Сотрудника' },
  { id: 'skills', label: 'Навыки' },
  { id: 'vacations', label: 'Отпуска' },
  { id: 'preferences', label: 'Смены предпочтений' },
  { id: 'schemes', label: 'Схемы' },
  { id: 'tags', label: 'Теги' },
];

export const EXPORT_OPTIONS = [
  { id: 'csv', label: 'CSV (текущие колонки)' },
  { id: 'vacations', label: 'Отпуска' },
  { id: 'tags', label: 'Теги' },
];

const FOCUSABLE_WITHIN_ROW =
  'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const IMPORT_CONFIG: Record<string, { extensions: string[]; appendix: string }> = {
  Сотрудника: { extensions: ['csv', 'xlsx', 'xls'], appendix: 'Appendix 1' },
  Навыки: { extensions: ['csv', 'xlsx'], appendix: 'Appendix 3' },
  Отпуска: { extensions: ['csv'], appendix: 'Appendix 5' },
  'Смены предпочтений': { extensions: ['csv'], appendix: 'Appendix 4' },
  Схемы: { extensions: ['csv'], appendix: 'Appendix 5' },
  Теги: { extensions: ['csv'], appendix: 'Appendix 6' },
};

export const EXPORT_FILE_TITLES: Record<string, string> = {
  'CSV (текущие колонки)': 'employees_export',
  Отпуска: 'employees_vacations',
  Теги: 'employees_tags',
};

export const IMPORT_REQUIRED_HEADERS: Record<string, string[]> = {
  Сотрудника: [
    'login',
    'lastName',
    'firstName',
    'email',
    'hiringDate',
    'office',
    'groupExternalId',
    'positionExternalId',
    'telephonyId',
    'personnelNumber',
    'schemeExternalId',
    'calendarExternalId',
    'timeZone',
  ],
  Навыки: ['login', 'skill', 'start', 'end', 'priority'],
  Отпуска: ['login', 'ФИО', 'Статус', 'Команда', 'Комментарий'],
  'Смены предпочтений': ['login', 'activityId', 'start', 'end', 'timeZone'],
  Схемы: ['login', 'id', 'start', 'end'],
  Теги: ['login', 'ФИО', 'Тег'],
};

const TAG_CATALOG_STORAGE_KEY = 'employee-list:tag-catalog';

export type MatrixAction = 'add' | 'replace' | 'remove';
type FieldAction = MatrixAction | 'none';

export interface BulkEditFieldState<T> {
  action: FieldAction;
  value: T;
}

export interface BulkEditMatrixState {
  status: BulkEditFieldState<EmployeeStatus | ''>;
  team: BulkEditFieldState<string>;
  hourNorm: BulkEditFieldState<string>;
  workScheme: BulkEditFieldState<string>;
  skills: BulkEditFieldState<string[]>;
  reserveSkills: BulkEditFieldState<string[]>;
  tags: BulkEditFieldState<string[]>;
  comment: string;
}

export const createInitialBulkEditState = (): BulkEditMatrixState => ({
  status: { action: 'none', value: '' },
  team: { action: 'none', value: '' },
  hourNorm: { action: 'none', value: '' },
  workScheme: { action: 'none', value: '' },
  skills: { action: 'none', value: [] },
  reserveSkills: { action: 'none', value: [] },
  tags: { action: 'none', value: [] },
  comment: '',
});

export const MATRIX_ACTION_LABELS: Record<MatrixAction, string> = {
  add: 'Добавить всем',
  replace: 'Заменить всем',
  remove: 'Удалить у всех',
};

export const MATRIX_ACTIONS: MatrixAction[] = ['add', 'replace', 'remove'];

export const FIELD_ACTION_CONFIG: Record<keyof Omit<BulkEditMatrixState, 'comment'>, MatrixAction[]> = {
  status: ['replace'],
  team: ['replace'],
  hourNorm: ['replace'],
  workScheme: ['add', 'replace', 'remove'],
  skills: ['add', 'replace', 'remove'],
  reserveSkills: ['add', 'replace', 'remove'],
  tags: ['add', 'replace', 'remove'],
};

export const MAX_TAGS_PER_EMPLOYEE = 4;

const loadStoredTagCatalog = () => {
  if (typeof window === 'undefined') {
    return {} as Record<string, string>;
  }

  try {
    const stored = window.localStorage.getItem(TAG_CATALOG_STORAGE_KEY);
    if (!stored) {
      return {} as Record<string, string>;
    }
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed as Record<string, unknown>).reduce((acc, [tag, color]) => {
        if (typeof color === 'string' && color.trim()) {
          acc[tag] = color;
        } else {
          acc[tag] = getColorForTag(tag);
        }
        return acc;
      }, {} as Record<string, string>);
    }
  } catch (error) {
    console.error('Не удалось загрузить сохранённый каталог тегов', error);
  }

  return {} as Record<string, string>;
};

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `task-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const applyCollectionOperation = <T,>(
  existing: T[],
  action: MatrixAction,
  selected: T[],
  identity: (item: T) => string
): T[] => {
  switch (action) {
    case 'add': {
      const map = new Map(existing.map((item) => [identity(item), item] as const));
      selected.forEach((item) => {
        const id = identity(item);
        if (!map.has(id)) {
          map.set(id, item);
        }
      });
      return Array.from(map.values());
    }
    case 'replace':
      return selected;
    case 'remove': {
      const removal = new Set(selected.map((item) => identity(item)));
      return existing.filter((item) => !removal.has(identity(item)));
    }
    default:
      return existing;
  }
};


export const useEmployeeListState = ({
  employees,
  onEmployeesChange,
  onOpenQuickAdd,
  focusEmployeeId,
}: EmployeeListContainerProps) => {


  const [filters, setFilters] = useState<EmployeeFilters>(createDefaultFilters());
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [tagCreationError, setTagCreationError] = useState<string | null>(null);
  const [tagCatalog, setTagCatalog] = useState<Record<string, string>>(() => loadStoredTagCatalog());
  const [tagAction, setTagAction] = useState<MatrixAction>('add');
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<string>(TAG_COLOR_PALETTE[0]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkEditMatrix, setBulkEditMatrix] = useState<BulkEditMatrixState>(createInitialBulkEditState());
  const [bulkEditError, setBulkEditError] = useState<string | null>(null);
  const [bulkEditSuccess, setBulkEditSuccess] = useState<string | null>(null);
  const [importContext, setImportContext] = useState<string>('Сотрудника');
  const [exportContext, setExportContext] = useState<string>('CSV (текущие колонки)');
  const [liveMessage, setLiveMessage] = useState('Выбор сотрудников очищен');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [selectionOverrideExpires, setSelectionOverrideExpires] = useState<number | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const importMenuAnchorRef = useRef<HTMLDivElement | null>(null);
  const exportMenuAnchorRef = useRef<HTMLDivElement | null>(null);
  const filterToggleRef = useRef<HTMLButtonElement | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const drawerReturnFocusRef = useRef<HTMLTableRowElement | null>(null);
  const drawerReturnFocusIdRef = useRef<string | null>(null);
  const lastFocusedControlRef = useRef<HTMLElement | null>(null);
  const toolbarButtonClass = (disabled = false) =>
    `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      disabled
        ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
    }`;
  const toolbarPrimaryButtonClass =
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-500 bg-blue-600 text-white text-sm font-medium transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const storeFocusedControl = () => {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      lastFocusedControlRef.current = activeElement;
    }
  };

  const restoreFocusedControl = () => {
    const element = lastFocusedControlRef.current;
    if (element && element.isConnected) {
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          element.focus();
        });
      } else {
        element.focus();
      }
    }
    lastFocusedControlRef.current = null;
  };

  const restoreRowFocus = () => {
    const focusId = drawerReturnFocusIdRef.current;
    let element = drawerReturnFocusRef.current;
    if ((!element || !element.isConnected) && focusId) {
      element = rowRefs.current[focusId] ?? null;
    }
    drawerReturnFocusRef.current = null;
    drawerReturnFocusIdRef.current = null;
    if (!element || !element.isConnected) {
      return;
    }
    const focusTarget = element.matches(FOCUSABLE_WITHIN_ROW)
      ? element
      : (element.querySelector<HTMLElement>(FOCUSABLE_WITHIN_ROW) ?? element);
    const applyFocus = () => focusTarget.focus({ preventScroll: true });
    if (typeof window !== 'undefined') {
      window.setTimeout(applyFocus, 0);
    } else {
      applyFocus();
    }
  };

  const openColumnSettings = () => {
    storeFocusedControl();
    setShowColumnSettings(true);
  };

  const closeColumnSettings = () => {
    setShowColumnSettings(false);
    restoreFocusedControl();
  };

  const openTagManager = () => {
    storeFocusedControl();
    setShowTagManager(true);
  };

  const closeTagManager = () => {
    setShowTagManager(false);
    restoreFocusedControl();
  };

  const openImportModal = () => {
    storeFocusedControl();
    setImportFeedback(null);
    setShowImportModal(true);
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    restoreFocusedControl();
  };

  const openExportModal = () => {
    storeFocusedControl();
    setExportFeedback(null);
    setShowExportModal(true);
  };

  const closeExportModal = () => {
    setShowExportModal(false);
    restoreFocusedControl();
  };

  const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKey, boolean>>({
    fio: true,
    position: true,
    orgUnit: true,
    team: true,
    scheme: true,
    hourNorm: true,
    status: true,
    hireDate: true,
  });

  // Load persisted column visibility
  useEffect(() => {
    const saved = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setColumnVisibility((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        console.warn('Failed to parse saved column visibility', err);
      }
    }
  }, []);

  // Persist column visibility
  useEffect(() => {
    localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  // Load persisted filters
  useEffect(() => {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFilters((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        console.warn('Failed to parse saved filters', err);
      }
    }
  }, []);

  // Persist filters
  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(TAG_CATALOG_STORAGE_KEY, JSON.stringify(tagCatalog));
  }, [tagCatalog]);

  useEffect(() => {
    if (employees.length === 0) {
      return;
    }
    const timeout = window.setTimeout(() => setIsInitialLoading(false), 250);
    return () => window.clearTimeout(timeout);
  }, [employees.length]);

  useEffect(() => {
    if (!showImportMenu && !showExportMenu) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        showImportMenu &&
        importMenuAnchorRef.current &&
        !importMenuAnchorRef.current.contains(event.target as Node)
      ) {
        setShowImportMenu(false);
      }
      if (
        showExportMenu &&
        exportMenuAnchorRef.current &&
        !exportMenuAnchorRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showImportMenu, showExportMenu]);

  // Sync selection state
  useEffect(() => {
    setShowBulkActions(isSelectionMode && selectedEmployees.size > 0);
  }, [selectedEmployees, isSelectionMode]);

  useEffect(() => {
    const now = Date.now();
    if (selectionOverrideExpires && selectionOverrideExpires > now) {
      return;
    }
    setLiveMessage(
      selectedEmployees.size > 0
        ? `Выбрано сотрудников: ${selectedEmployees.size}`
        : 'Выбор сотрудников очищен'
    );
  }, [selectedEmployees, selectionOverrideExpires]);

  useEffect(() => {
    if (!selectionOverrideExpires) {
      return undefined;
    }
    const now = Date.now();
    const delay = Math.max(selectionOverrideExpires - now, 0);
    const timeout = window.setTimeout(() => setSelectionOverrideExpires(null), delay);
    return () => window.clearTimeout(timeout);
  }, [selectionOverrideExpires]);

  useEffect(() => {
    if (!statusNotice) {
      return undefined;
    }
    const timeout = window.setTimeout(() => setStatusNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [statusNotice]);

  useEffect(() => {
    if (!showFilters) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFilters(false);
        window.requestAnimationFrame(() => {
          filterToggleRef.current?.focus();
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showFilters]);

  useEffect(() => {
    setSelectedEmployees((prev) => {
      const next = new Set<string>();
      employees.forEach((emp) => {
        if (prev.has(emp.id)) {
          next.add(emp.id);
        }
      });
      return next;
    });
  }, [employees]);

  const clearSelection = useCallback(
    (options?: { announce?: boolean }) => {
      setSelectedEmployees(new Set());
      setBulkEditError(null);
      let wasSelectionMode = false;
      setIsSelectionMode((prev) => {
        if (prev) {
          wasSelectionMode = true;
          setLiveMessage('Режим выбора отменён');
          setSelectionOverrideExpires(Date.now() + 4000);
        }
        return false;
      });
      if (options?.announce !== false && wasSelectionMode) {
        setStatusNotice('Режим массового редактирования отключён');
      }
    },
    [setLiveMessage, setSelectionOverrideExpires, setStatusNotice]
  );

  useEffect(() => {
    if (!isSelectionMode) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (isBulkEditOpen || showTagManager || showImportModal || showExportModal || showColumnSettings) {
        return;
      }

      event.preventDefault();
      clearSelection();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isSelectionMode,
    isBulkEditOpen,
    showTagManager,
    showImportModal,
    showExportModal,
    showColumnSettings,
    clearSelection,
  ]);

  useEffect(() => {
    if (!focusEmployeeId) {
      return;
    }
    const isPresent = employees.some((emp) => emp.id === focusEmployeeId);
    if (!isPresent) {
      return;
    }
    if (rowRefs.current[focusEmployeeId]) {
      drawerReturnFocusRef.current = rowRefs.current[focusEmployeeId];
    }
    drawerReturnFocusIdRef.current = focusEmployeeId;
    setActiveEmployeeId(focusEmployeeId);
    setIsDrawerLoading(true);
  }, [focusEmployeeId, employees]);

  useEffect(() => {
    if (!bulkEditSuccess) {
      return;
    }
    const timeout = window.setTimeout(() => setBulkEditSuccess(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [bulkEditSuccess]);

  useEffect(() => {
    if (!showTagManager) {
      setTagError(null);
      setTagCreationError(null);
      return;
    }

    const storedCatalog = loadStoredTagCatalog();
    const catalog: Record<string, string> = {};
    employees.forEach((emp) => {
      emp.tags.forEach((tag) => {
        if (!catalog[tag]) {
          catalog[tag] = getColorForTag(tag);
        }
      });
    });
    setTagCatalog((prev) => {
      const merged = { ...storedCatalog, ...prev };
      Object.entries(catalog).forEach(([tag, color]) => {
        if (!merged[tag]) {
          merged[tag] = color;
        }
      });
      return merged;
    });

    const selectedList = employees.filter((emp) => selectedEmployees.has(emp.id));
    if (selectedList.length > 0) {
      const [first, ...rest] = selectedList;
      const commonTags = first.tags.filter((tag) => rest.every((emp) => emp.tags.includes(tag)));
      setSelectedTagNames(commonTags.slice(0, 4));
    } else {
      setSelectedTagNames([]);
    }

    setTagAction('add');
    setNewTagName('');
    setNewTagColor(TAG_COLOR_PALETTE[0]);
    setTagCreationError(null);
    setTagError(null);
  }, [showTagManager, employees, selectedEmployees]);

  const handleFilterChange = <K extends keyof EmployeeFilters>(key: K, value: EmployeeFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(createDefaultFilters());
  };

  const searchDocuments = useMemo(() => buildEmployeeSearchDocuments(employees), [employees]);

  const searchIndex = useMemo(() => createEmployeeMiniSearch(searchDocuments), [searchDocuments]);

  const searchSummary = useMemo(() => searchEmployees(searchIndex, filters.search), [filters.search, searchIndex]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      if (!filters.showInactive && employee.status === 'terminated') {
        return false;
      }

      if (searchSummary && !searchSummary.ids.has(employee.id)) {
        return false;
      }

      if (filters.team && employee.workInfo.team.id !== filters.team) {
        return false;
      }

      if (filters.status && employee.status !== filters.status) {
        return false;
      }

      if (filters.position && employee.workInfo.position !== filters.position) {
        return false;
      }

      if (filters.orgUnit && employee.orgPlacement.orgUnit !== filters.orgUnit) {
        return false;
      }

      return true;
    });
  }, [employees, filters, searchSummary]);

  const sortedEmployees = useMemo(() => {
    const data = [...filteredEmployees];

    const baseCompare = (a: Employee, b: Employee) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (filters.sortBy) {
        case 'position':
          aValue = a.workInfo.position;
          bValue = b.workInfo.position;
          break;
        case 'team':
          aValue = a.workInfo.team.name;
          bValue = b.workInfo.team.name;
          break;
        case 'hireDate':
          aValue = a.workInfo.hireDate.getTime();
          bValue = b.workInfo.hireDate.getTime();
          break;
        case 'performance':
          aValue = a.performance.qualityScore;
          bValue = b.performance.qualityScore;
          break;
        case 'name':
        default:
          aValue = `${a.personalInfo.lastName} ${a.personalInfo.firstName}`.trim();
          bValue = `${b.personalInfo.lastName} ${b.personalInfo.firstName}`.trim();
          break;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return filters.sortOrder === 'asc'
        ? String(aValue).localeCompare(String(bValue), 'ru')
        : String(bValue).localeCompare(String(aValue), 'ru');
    };

    if (searchSummary && searchSummary.order.size > 0) {
      data.sort((a, b) => {
        const rankA = searchSummary.order.get(a.id);
        const rankB = searchSummary.order.get(b.id);

        if (rankA !== undefined || rankB !== undefined) {
          if (rankA === undefined) {
            return 1;
          }
          if (rankB === undefined) {
            return -1;
          }
          if (rankA !== rankB) {
            return rankA - rankB;
          }
        }

        return baseCompare(a, b);
      });
      return data;
    }

    data.sort(baseCompare);
    return data;
  }, [filteredEmployees, filters.sortBy, filters.sortOrder, searchSummary]);

  const teamOptions = useMemo(() => {
    const map = new Map<string, Team>();
    employees.forEach((emp) => {
      map.set(emp.workInfo.team.id, emp.workInfo.team);
    });
    return Array.from(map.values());
  }, [employees]);

  const teamLookup = useMemo(() => {
    const lookup = new Map<string, Team>();
    teamOptions.forEach((team) => lookup.set(team.id, team));
    return lookup;
  }, [teamOptions]);

  const schemeOptions = useMemo(() => {
    const map = new Map<string, WorkSchemeAssignment>();
    employees.forEach((emp) => {
      const scheme = emp.orgPlacement.workScheme;
      if (scheme) {
        map.set(scheme.id, scheme);
      }
      (emp.orgPlacement.workSchemeHistory ?? []).forEach((historyItem) => {
        map.set(historyItem.id, historyItem);
      });
    });
    return Array.from(map.values());
  }, [employees]);

  const schemeLookup = useMemo(() => {
    const lookup = new Map<string, WorkSchemeAssignment>();
    schemeOptions.forEach((scheme) => lookup.set(scheme.id, scheme));
    return lookup;
  }, [schemeOptions]);

  const primarySkillCatalog = useMemo(() => {
    const map = new Map<string, SkillAssignment>();
    employees.forEach((emp) => {
      emp.skills.forEach((skill) => {
        map.set(skill.id, skill);
      });
    });
    return map;
  }, [employees]);

  const reserveSkillCatalog = useMemo(() => {
    const map = new Map<string, SkillAssignment>();
    employees.forEach((emp) => {
      emp.reserveSkills.forEach((skill) => {
        map.set(skill.id, skill);
      });
    });
    return map;
  }, [employees]);

  const handleOpenEmployeeDrawer = useCallback(
    (employeeId: string, rowElement?: HTMLTableRowElement | null) => {
      drawerReturnFocusRef.current = rowElement ?? rowRefs.current[employeeId] ?? null;
      drawerReturnFocusIdRef.current = employeeId;
      setIsDrawerLoading(true);
      setActiveEmployeeId(employeeId);
    },
    [setActiveEmployeeId, setIsDrawerLoading]
  );

  const toggleEmployeeSelection = useCallback((id: string) => {
    setSelectedEmployees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const enableSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => {
      if (prev) {
        return prev;
      }
      setStatusNotice('Режим массового редактирования активирован — выберите сотрудников.');
      setLiveMessage('Выбор сотрудников для массового редактирования активирован');
      setSelectionOverrideExpires(Date.now() + 4000);
      return true;
    });
  }, [setLiveMessage, setSelectionOverrideExpires, setStatusNotice]);

  const selectedEmployeeList = useMemo(() => {
    if (selectedEmployees.size === 0) {
      return [] as Employee[];
    }
    return employees.filter((emp) => selectedEmployees.has(emp.id));
  }, [employees, selectedEmployees]);

  const totalCount = employees.length;
  const visibleCount = sortedEmployees.length;
  const handleSelectAll = useCallback(() => {
    if (selectedEmployees.size === visibleCount && visibleCount > 0) {
      setSelectedEmployees(new Set());
      return;
    }

    setSelectedEmployees(new Set(sortedEmployees.map((emp) => emp.id)));
  }, [selectedEmployees, sortedEmployees, visibleCount]);
  const rowHeight = 60;
  const tableHeight = useMemo(() => {
    const boundedRowCount = Math.min(Math.max(visibleCount, 8), 16);
    return (boundedRowCount + 1) * rowHeight;
  }, [rowHeight, visibleCount]);
  const tableColumns = useMemo<ColumnDef<Employee>[]>(() => {
    const columns: ColumnDef<Employee>[] = [];

    if (isSelectionMode) {
      columns.push({
        id: 'selection',
        enableSorting: false,
        enableHiding: false,
        header: () => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              data-testid="employee-table-select-all"
              className="rounded text-blue-600 focus:ring-blue-500"
              checked={visibleCount > 0 && selectedEmployees.size === visibleCount}
              onChange={handleSelectAll}
              aria-label="Выбрать всех сотрудников"
            />
          </div>
        ),
        cell: ({ row }) => {
          const employee = row.original;
          const isSelected = selectedEmployees.has(employee.id);
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                data-testid="employee-row-checkbox"
                className="rounded text-blue-600 focus:ring-blue-500"
                checked={isSelected}
                onChange={(event) => {
                  event.stopPropagation();
                  toggleEmployeeSelection(employee.id);
                }}
                aria-label={`Выбрать ${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`}
              />
            </div>
          );
        },
        meta: {
          headerClassName: 'px-4 py-2.5 flex items-center justify-center',
          cellClassName: 'px-4 py-2.5 flex items-center justify-center',
          headerStyle: { flex: '0 0 56px', minWidth: 56 },
          cellStyle: { flex: '0 0 56px', minWidth: 56 },
        },
      });
    }

    COLUMN_ORDER.forEach((column) => {
      if (!columnVisibility[column.key]) {
        return;
      }

      switch (column.key) {
        case 'fio':
          columns.push({
            id: 'fio',
            header: column.label,
            cell: ({ row }) => {
              const employee = row.original;
              return (
                <div className="flex items-center">
                  <img
                    src={employee.personalInfo.photo || 'https://i.pravatar.cc/40?img=1'}
                    alt={`${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3 space-y-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        const rowElement = event.currentTarget.closest('[data-row-id]') as HTMLTableRowElement | null;
                        handleOpenEmployeeDrawer(employee.id, rowElement);
                      }}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                      {employee.personalInfo.lastName} {employee.personalInfo.firstName}
                    </button>
                    <div className="text-xs text-gray-500">{employee.credentials.wfmLogin}</div>
                  </div>
                </div>
              );
            },
            meta: {
              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider',
              cellClassName: 'px-6 py-2.5 whitespace-nowrap',
              headerStyle: { flex: '1 1 280px', minWidth: 240 },
              cellStyle: { flex: '1 1 280px', minWidth: 240, alignItems: 'center' },
            },
          });
          break;
        case 'position':
          columns.push({
            id: 'position',
            header: column.label,
            cell: ({ row }) => (
              <span className="text-gray-700 truncate block max-w-full">
                {row.original.workInfo.position}
              </span>
            ),
            meta: {
              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider',
              cellClassName: 'px-6 py-2.5 text-gray-700 overflow-hidden',
              headerStyle: { flex: '0 0 200px', minWidth: 180, maxWidth: 200 },
              cellStyle: { flex: '0 0 200px', minWidth: 180, maxWidth: 200, alignItems: 'center' },
            },
          });
          break;
        case 'orgUnit':
          columns.push({
            id: 'orgUnit',
            header: column.label,
            cell: ({ row }) => (
              <span className="text-gray-700 truncate block max-w-full">
                {row.original.orgPlacement.orgUnit}
              </span>
            ),
            meta: {
              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider',
              cellClassName: 'px-6 py-2.5 text-gray-700 overflow-hidden',
              headerStyle: { flex: '0 0 240px', minWidth: 200, maxWidth: 240 },
              cellStyle: { flex: '0 0 240px', minWidth: 200, maxWidth: 240, alignItems: 'center' },
            },
          });
          break;
        case 'team':
          columns.push({
            id: 'team',
            header: column.label,
            cell: ({ row }) => {
              const employee = row.original;
              return (
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: employee.workInfo.team.color }}
                  />
                  <span className="text-gray-700 truncate">
                    {employee.workInfo.team.name}
                  </span>
                </div>
              );
            },
            meta: {
              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider',
              cellClassName: 'px-6 py-2.5 overflow-hidden',
              headerStyle: { flex: '0 0 220px', minWidth: 200, maxWidth: 220 },
              cellStyle: { flex: '0 0 220px', minWidth: 200, maxWidth: 220, alignItems: 'center' },
            },
          });
          break;
        case 'scheme':
          columns.push({
            id: 'scheme',
            header: column.label,
            cell: ({ row }) => (
              <span className="text-gray-700 truncate block max-w-full">
                {row.original.orgPlacement.workScheme?.name ?? '—'}
              </span>
            ),
            meta: {
              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider',
              cellClassName: 'px-6 py-2.5 text-gray-700 overflow-hidden',
              headerStyle: { flex: '0 0 220px', minWidth: 200, maxWidth: 220 },
              cellStyle: { flex: '0 0 220px', minWidth: 200, maxWidth: 220, alignItems: 'center' },
            },
          });
          break;
        case 'hourNorm':
          columns.push({
            id: 'hourNorm',
            header: column.label,
            cell: ({ row }) => (
              <span className="text-gray-700 text-center w-full">{row.original.orgPlacement.hourNorm}</span>
            ),
            meta: {
              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider text-center',
              cellClassName: 'px-6 py-2.5 whitespace-nowrap text-center text-gray-700',
              headerStyle: { flex: '0 0 140px', minWidth: 120, textAlign: 'center' },
              cellStyle: { flex: '0 0 140px', minWidth: 120, justifyContent: 'center', alignItems: 'center' },
            },
          });
          break;
        case 'status':
          columns.push({
            id: 'status',
            header: column.label,
            cell: ({ row }) => {
              const employee = row.original;
              return (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[employee.status]}`}
                >
                  {STATUS_LABELS[employee.status]}
                </span>
              );
            },
            meta: {
              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider text-center',
              cellClassName: 'px-6 py-2.5 whitespace-nowrap text-center',
              headerStyle: { flex: '0 0 160px', minWidth: 140, textAlign: 'center' },
              cellStyle: { flex: '0 0 160px', minWidth: 140, justifyContent: 'center', alignItems: 'center' },
            },
          });
          break;
        case 'hireDate':
          columns.push({
            id: 'hireDate',
            header: column.label,
            cell: ({ row }) => (
              <span className="text-gray-700 whitespace-nowrap">{row.original.workInfo.hireDate.toLocaleDateString('ru-RU')}</span>
            ),
            meta: {
              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider text-center',
              cellClassName: 'px-6 py-2.5 whitespace-nowrap text-center text-gray-700',
              headerStyle: { flex: '0 0 160px', minWidth: 140, textAlign: 'center' },
              cellStyle: { flex: '0 0 160px', minWidth: 140, justifyContent: 'center', alignItems: 'center' },
            },
          });
          break;
        default:
          break;
      }
    });

    return columns;
  }, [columnVisibility, handleOpenEmployeeDrawer, handleSelectAll, isSelectionMode, selectedEmployees, toggleEmployeeSelection, visibleCount]);
  const getTableRowProps = useCallback(
    ({ row }: { row: Row<Employee>; index: number }) => {
      const employee = row.original;
      const isSelected = selectedEmployees.has(employee.id);
      const isSearchHit = searchSummary?.ids.has(employee.id) ?? false;
      const searchRank = searchSummary?.order.get(employee.id);

      const baseClasses = 'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 border-l-4 border-transparent';
      const rowStateClass = isSelected
        ? 'bg-blue-50 border-l-4 border-blue-400'
        : isSearchHit
          ? 'bg-amber-50 border-l-4 border-amber-400'
          : 'hover:bg-gray-50';

      return {
        ref: (element: HTMLTableRowElement | null) => {
          if (element) {
            rowRefs.current[employee.id] = element;
          } else {
            delete rowRefs.current[employee.id];
          }
        },
        tabIndex: 0,
        'data-testid': 'employee-table-row',
        'data-row-id': employee.id,
        'data-search-hit': isSearchHit || undefined,
        'data-search-rank': searchRank !== undefined ? searchRank : undefined,
        className: `${baseClasses} ${rowStateClass}`,
        'aria-selected': isSelectionMode ? isSelected : undefined,
        onFocus: () => {
          drawerReturnFocusIdRef.current = employee.id;
        },
        onClick: (event) => {
          const target = event.target as HTMLElement;
          if (target.closest('input[type="checkbox"]') || target.closest('button')) {
            return;
          }
          if (event.metaKey || event.ctrlKey) {
            enableSelectionMode();
            toggleEmployeeSelection(employee.id);
            return;
          }
          if (isSelectionMode) {
            toggleEmployeeSelection(employee.id);
            return;
          }
          handleOpenEmployeeDrawer(employee.id, event.currentTarget as HTMLTableRowElement);
        },
        onKeyDown: (event) => {
          if (event.key === 'Escape' && isSelectionMode) {
            event.preventDefault();
            clearSelection();
            return;
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            if (isSelectionMode) {
              toggleEmployeeSelection(employee.id);
            } else {
              handleOpenEmployeeDrawer(employee.id, event.currentTarget as HTMLTableRowElement);
            }
            return;
          }
          if (event.key === ' ') {
            event.preventDefault();
            enableSelectionMode();
            toggleEmployeeSelection(employee.id);
          }
        },
      };
    },
    [
      clearSelection,
      enableSelectionMode,
      handleOpenEmployeeDrawer,
      isSelectionMode,
      searchSummary,
      selectedEmployees,
      toggleEmployeeSelection,
    ]
  );

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    employees.forEach((emp) => emp.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [employees]);

  const activeEmployee = useMemo(() => {
    return employees.find((emp) => emp.id === activeEmployeeId) ?? null;
  }, [employees, activeEmployeeId]);

  type MatrixFieldKey = keyof Omit<BulkEditMatrixState, 'comment'>;

  const handleFieldActionToggle = (field: MatrixFieldKey, action: MatrixAction) => {
    if (!FIELD_ACTION_CONFIG[field].includes(action)) {
      return;
    }
    setBulkEditMatrix((prev) => {
      const current = prev[field];
      const nextAction = current.action === action ? 'none' : action;
      return { ...prev, [field]: { ...current, action: nextAction } };
    });
  };

  const isValueEmpty = <T,>(value: T) => {
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    return value === '' || value === null || value === undefined;
  };

  const updateMatrixValue = <K extends MatrixFieldKey>(field: K, value: BulkEditMatrixState[K]['value']) => {
    setBulkEditMatrix((prev) => {
      const allowed = FIELD_ACTION_CONFIG[field];
      const nextAction =
        !isValueEmpty(value) && prev[field].action === 'none' && allowed.length === 1
          ? allowed[0]
          : isValueEmpty(value)
            ? 'none'
            : prev[field].action;
      return {
        ...prev,
        [field]: {
          action: nextAction,
          value,
        },
      };
    });
  };

  const updateMatrixComment = (value: string) => {
    setBulkEditMatrix((prev) => ({ ...prev, comment: value }));
  };

  const renderActionButtons = (field: MatrixFieldKey) => {
    const allowed = FIELD_ACTION_CONFIG[field];
    if (allowed.length === 0) {
      return null;
    }
    const currentAction = bulkEditMatrix[field].action;
    return (
      <div className="flex flex-wrap gap-2" role="group" aria-label={`Действие для поля ${field}`}>
        {allowed.map((action) => {
          const active = currentAction === action;
          return (
            <button
              key={`${field}-${action}`}
              type="button"
              onClick={() => handleFieldActionToggle(field, action)}
              data-testid={`matrix-action-${field}-${action}`}
              className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                active ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
              aria-pressed={active}
            >
              {MATRIX_ACTION_LABELS[action]}
            </button>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    if (!isDrawerLoading) {
      return undefined;
    }
    if (!activeEmployee) {
      setIsDrawerLoading(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setIsDrawerLoading(false), 200);
    return () => window.clearTimeout(timer);
  }, [activeEmployee, isDrawerLoading]);

  const resetBulkEditState = () => {
    setBulkEditMatrix(createInitialBulkEditState());
  };

  const handleOpenBulkEdit = () => {
    if (!isSelectionMode) {
      enableSelectionMode();
      return;
    }

    if (selectedEmployees.size === 0) {
      setBulkEditError('Выберите сотрудников, чтобы открыть массовое редактирование');
      setBulkEditSuccess(null);
      setStatusNotice('Выберите хотя бы одного сотрудника перед запуском массового редактирования.');
      setLiveMessage('Нет выбранных сотрудников для массового редактирования');
      setSelectionOverrideExpires(Date.now() + 4000);
      return;
    }

    storeFocusedControl();
    setBulkEditError(null);
    setBulkEditSuccess(null);
    const openDrawer = () => setIsBulkEditOpen(true);
    if (typeof window !== 'undefined') {
      window.setTimeout(openDrawer, 0);
    } else {
      openDrawer();
    }
  };

  const handleBulkEditClose = () => {
    setIsBulkEditOpen(false);
    setBulkEditError(null);
    resetBulkEditState();
    restoreFocusedControl();
  };

  const handleDismissEmployee = (employee: Employee) => {
    let dismissed: Employee | null = null;

    onEmployeesChange((prev) =>
      prev.map((emp) => {
        if (emp.id !== employee.id) {
          return emp;
        }

        const previousStatus = emp.status === 'terminated'
          ? emp.metadata.previousStatus ?? 'active'
          : emp.status;

        const updatedTasks = [
          ...(emp.tasks ?? []),
          createTaskEntry('Статус изменён на «Уволен»', 'system', { createdBy: 'agent' }),
        ];

        const updatedEmployee: Employee = {
          ...emp,
          status: 'terminated',
          tasks: updatedTasks,
          metadata: {
            ...emp.metadata,
            previousStatus,
            updatedAt: new Date(),
            lastModifiedBy: 'agent',
          },
        };

        dismissed = updatedEmployee;
        return updatedEmployee;
      })
    );

    setSelectedEmployees((prev) => {
      if (!prev.has(employee.id)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(employee.id);
      return next;
    });

    if (dismissed) {
      setStatusNotice(
        `${dismissed.personalInfo.lastName} ${dismissed.personalInfo.firstName} переведён в статус «Уволен»`
      );
      setLiveMessage(
        `Сотрудник ${dismissed.personalInfo.lastName} ${dismissed.personalInfo.firstName} уволен`
      );
      setSelectionOverrideExpires(Date.now() + 4000);
    }

    drawerReturnFocusIdRef.current = null;
    drawerReturnFocusRef.current = null;
    handleDrawerClose();
  };

  const handleRestoreEmployee = (employee: Employee) => {
    let restored: Employee | null = null;

    onEmployeesChange((prev) =>
      prev.map((emp) => {
        if (emp.id !== employee.id) {
          return emp;
        }

        const targetStatus = emp.metadata.previousStatus ?? 'active';
        const updatedTasks = [
          ...(emp.tasks ?? []),
          createTaskEntry('Сотрудник восстановлен из увольнения', 'system', { createdBy: 'agent' }),
        ];

        const updatedEmployee: Employee = {
          ...emp,
          status: targetStatus,
          tasks: updatedTasks,
          metadata: {
            ...emp.metadata,
            previousStatus: undefined,
            updatedAt: new Date(),
            lastModifiedBy: 'agent',
          },
        };

        restored = updatedEmployee;
        return updatedEmployee;
      })
    );

    if (restored) {
      setStatusNotice(
        `${restored.personalInfo.lastName} ${restored.personalInfo.firstName} восстановлен из увольнения`
      );
      setLiveMessage(
        `Сотрудник ${restored.personalInfo.lastName} ${restored.personalInfo.firstName} восстановлен`
      );
      setSelectionOverrideExpires(Date.now() + 4000);
    }

    handleDrawerClose();
  };

  const hasMatrixChanges = useMemo(() => {
    const fields: Array<keyof Omit<BulkEditMatrixState, 'comment'>> = [
      'status',
      'team',
      'hourNorm',
      'workScheme',
      'skills',
      'reserveSkills',
      'tags',
    ];

    return fields.some((field) => {
      const state = bulkEditMatrix[field];
      if (state.action === 'none') {
        return false;
      }
      if (Array.isArray(state.value)) {
        if (state.action === 'remove') {
          return state.value.length > 0;
        }
        return state.value.length > 0;
      }
      if (field === 'workScheme' && state.action === 'remove') {
        return true;
      }
      return Boolean(state.value);
    });
  }, [bulkEditMatrix]);

  const handleBulkEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedEmployees.size === 0) {
      setBulkEditError('Нет выбранных сотрудников.');
      return;
    }

    const comment = bulkEditMatrix.comment.trim();

    if (!hasMatrixChanges && !comment) {
      setBulkEditError('Отметьте действия в матрице или добавьте комментарий.');
      return;
    }

    if (bulkEditMatrix.status.action !== 'none' && !bulkEditMatrix.status.value) {
      setBulkEditError('Выберите новый статус для применения.');
      return;
    }

    let targetTeam: Team | undefined;
    if (bulkEditMatrix.team.action !== 'none') {
      if (!bulkEditMatrix.team.value) {
        setBulkEditError('Выберите команду для изменения.');
        return;
      }
      targetTeam = teamLookup.get(bulkEditMatrix.team.value);
      if (!targetTeam) {
        setBulkEditError('Не удалось найти выбранную команду.');
        return;
      }
    }

    let nextHourNorm: number | null = null;
    if (bulkEditMatrix.hourNorm.action !== 'none') {
      if (!bulkEditMatrix.hourNorm.value) {
        setBulkEditError('Укажите норму часов.');
        return;
      }
      const parsed = Number(bulkEditMatrix.hourNorm.value);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setBulkEditError('Норма часов должна быть положительным числом.');
        return;
      }
      nextHourNorm = parsed;
    }

    let targetScheme: WorkSchemeAssignment | null = null;
    if (bulkEditMatrix.workScheme.action === 'add' || bulkEditMatrix.workScheme.action === 'replace') {
      if (!bulkEditMatrix.workScheme.value) {
        setBulkEditError('Выберите схему работы для добавления.');
        return;
      }
      targetScheme = schemeLookup.get(bulkEditMatrix.workScheme.value) ?? null;
      if (!targetScheme) {
        setBulkEditError('Не удалось определить выбранную схему работы.');
        return;
      }
    }

    const resolveSkills = (entries: string[], catalog: Map<string, SkillAssignment>, fallbackCategory: SkillAssignment['category']) => {
      const normalized = entries
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      return normalized.map((label) => {
        const existing = Array.from(catalog.values()).find(
          (skill) => skill.name.toLowerCase() === label.toLowerCase()
        );
        if (existing) {
          return existing;
        }
        return {
          id: generateId(),
          name: label,
          category: fallbackCategory,
          level: 3,
          verified: false,
          lastAssessed: new Date(),
          assessor: 'agent',
          certificationRequired: false,
        } satisfies SkillAssignment;
      });
    };

    let primarySkillSelection: SkillAssignment[] = [];
    if (bulkEditMatrix.skills.action !== 'none') {
      if (bulkEditMatrix.skills.value.length === 0) {
        setBulkEditError('Укажите навыки для массового редактирования.');
        return;
      }
      primarySkillSelection = resolveSkills(bulkEditMatrix.skills.value, primarySkillCatalog, 'technical');
    }

    let reserveSkillSelection: SkillAssignment[] = [];
    if (bulkEditMatrix.reserveSkills.action !== 'none') {
      if (bulkEditMatrix.reserveSkills.value.length === 0) {
        setBulkEditError('Укажите резервные навыки для массового редактирования.');
        return;
      }
      reserveSkillSelection = resolveSkills(
        bulkEditMatrix.reserveSkills.value,
        reserveSkillCatalog,
        'product'
      );
    }

    let normalizedTagSelection: string[] = [];
    if (bulkEditMatrix.tags.action !== 'none') {
      normalizedTagSelection = bulkEditMatrix.tags.value.map((tag) => tag.trim()).filter(Boolean);

      if (bulkEditMatrix.tags.action === 'remove' && normalizedTagSelection.length === 0) {
        setBulkEditError('Выберите теги, которые нужно снять у сотрудников.');
        return;
      }

      if (bulkEditMatrix.tags.action !== 'remove' && normalizedTagSelection.length === 0) {
        setBulkEditError('Добавьте теги для массового редактирования.');
        return;
      }

      if (bulkEditMatrix.tags.action === 'replace' && normalizedTagSelection.length > MAX_TAGS_PER_EMPLOYEE) {
        setBulkEditError(`Можно назначить не более ${MAX_TAGS_PER_EMPLOYEE} тегов каждому сотруднику.`);
        return;
      }

      if (bulkEditMatrix.tags.action === 'add') {
        const exceedsLimit = selectedEmployeeList.some((emp) => {
          const merged = new Set([...emp.tags, ...normalizedTagSelection]);
          return merged.size > MAX_TAGS_PER_EMPLOYEE;
        });

        if (exceedsLimit) {
          setBulkEditError(`После добавления будет превышен лимит в ${MAX_TAGS_PER_EMPLOYEE} тегов у некоторых сотрудников.`);
          return;
        }
      }
    }

    onEmployeesChange((prev) =>
      prev.map((emp) => {
        if (!selectedEmployees.has(emp.id)) {
          return emp;
        }

        let updatedEmployee: Employee = { ...emp };

        if (bulkEditMatrix.status.action !== 'none') {
          updatedEmployee = { ...updatedEmployee, status: bulkEditMatrix.status.value || emp.status };
        }

        if (bulkEditMatrix.team.action !== 'none' && targetTeam) {
          updatedEmployee = {
            ...updatedEmployee,
            workInfo: {
              ...updatedEmployee.workInfo,
              team: targetTeam,
              department: targetTeam.name,
            },
          };
        }

        if (bulkEditMatrix.hourNorm.action !== 'none' && nextHourNorm !== null) {
          updatedEmployee = {
            ...updatedEmployee,
            orgPlacement: {
              ...updatedEmployee.orgPlacement,
              hourNorm: nextHourNorm,
            },
          };
        }

        if (bulkEditMatrix.workScheme.action !== 'none') {
          if (bulkEditMatrix.workScheme.action === 'remove') {
            updatedEmployee = {
              ...updatedEmployee,
              orgPlacement: { ...updatedEmployee.orgPlacement, workScheme: undefined },
            };
          } else if (targetScheme) {
            updatedEmployee = {
              ...updatedEmployee,
              orgPlacement: { ...updatedEmployee.orgPlacement, workScheme: targetScheme },
            };
          }
        }

        if (bulkEditMatrix.skills.action !== 'none') {
          updatedEmployee = {
            ...updatedEmployee,
            skills: applyCollectionOperation(
              updatedEmployee.skills,
              bulkEditMatrix.skills.action as MatrixAction,
              primarySkillSelection,
              (skill) => skill.name.toLowerCase()
            ),
          };
        }

        if (bulkEditMatrix.reserveSkills.action !== 'none') {
          updatedEmployee = {
            ...updatedEmployee,
            reserveSkills: applyCollectionOperation(
              updatedEmployee.reserveSkills,
              bulkEditMatrix.reserveSkills.action as MatrixAction,
              reserveSkillSelection,
              (skill) => skill.name.toLowerCase()
            ),
          };
        }

        if (bulkEditMatrix.tags.action !== 'none') {
          const currentTags = updatedEmployee.tags ?? [];
          let nextTags = currentTags;
          if (bulkEditMatrix.tags.action === 'add') {
            const merged = new Set([...currentTags, ...normalizedTagSelection]);
            nextTags = Array.from(merged).slice(0, MAX_TAGS_PER_EMPLOYEE);
          } else if (bulkEditMatrix.tags.action === 'replace') {
            nextTags = normalizedTagSelection.slice(0, MAX_TAGS_PER_EMPLOYEE);
          } else if (bulkEditMatrix.tags.action === 'remove') {
            const removal = new Set(normalizedTagSelection);
            nextTags = currentTags.filter((tag) => !removal.has(tag));
          }
          updatedEmployee = { ...updatedEmployee, tags: nextTags };
        }

        if (comment) {
          const existingTasks = updatedEmployee.tasks ?? [];
          updatedEmployee = {
            ...updatedEmployee,
            tasks: [...existingTasks, createTaskEntry(comment, 'bulk-edit')],
          };
        }

        updatedEmployee = {
          ...updatedEmployee,
          metadata: {
            ...updatedEmployee.metadata,
            updatedAt: new Date(),
            lastModifiedBy: 'agent',
          },
        };

        return updatedEmployee;
      })
    );

    setBulkEditSuccess('Изменения применены для выбранных сотрудников.');
    setBulkEditError(null);
    setLiveMessage('Изменения успешно применены для выбранных сотрудников');
    setSelectionOverrideExpires(Date.now() + 4000);
    handleBulkEditClose();
    clearSelection({ announce: false });
  };

  const handleDrawerClose = () => {
    setActiveEmployeeId(null);
    setIsDrawerLoading(false);
    restoreRowFocus();
  };

  const handleDrawerSave = (updatedEmployee: Employee) => {
    onEmployeesChange((prev) =>
      prev.map((emp) => (emp.id === updatedEmployee.id ? { ...updatedEmployee } : emp))
    );
    setActiveEmployeeId(updatedEmployee.id);
  };

  const toggleColumn = (key: ColumnKey) => {
    setColumnVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const normalizeTagSelection = (tags: string[], cap = MAX_TAGS_PER_EMPLOYEE) =>
    tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .slice(0, cap);

  const handleApplyTags = () => {
    if (selectedEmployees.size === 0) {
      setTagError('Выберите сотрудников, чтобы применить теги');
      return;
    }

    const normalizedSelection =
      tagAction === 'remove'
        ? normalizeTagSelection(selectedTagNames, Number.POSITIVE_INFINITY)
        : normalizeTagSelection(selectedTagNames);

    if (tagAction !== 'remove' && normalizedSelection.length === 0) {
      setTagError('Добавьте хотя бы один тег или переключитесь на удаление.');
      return;
    }

    if (tagAction === 'remove' && normalizedSelection.length === 0) {
      setTagError('Выберите теги, которые нужно снять у сотрудников.');
      return;
    }

    onEmployeesChange((prev) =>
      prev.map((emp) => {
        if (!selectedEmployees.has(emp.id)) {
          return emp;
        }

        const currentTags = [...emp.tags];
        let nextTags = currentTags;

        if (tagAction === 'add') {
          const merged: string[] = [];
          currentTags.forEach((tag) => {
            if (!merged.includes(tag)) {
              merged.push(tag);
            }
          });
          normalizedSelection.forEach((tag) => {
            if (!merged.includes(tag) && merged.length < MAX_TAGS_PER_EMPLOYEE) {
              merged.push(tag);
            }
          });
          nextTags = merged;
        } else if (tagAction === 'replace') {
          nextTags = normalizedSelection;
        } else if (tagAction === 'remove') {
          const removal = new Set(normalizedSelection);
          nextTags = currentTags.filter((tag) => !removal.has(tag));
        }

        return {
          ...emp,
          tags: nextTags,
          metadata: { ...emp.metadata, updatedAt: new Date(), lastModifiedBy: 'agent' },
        };
      })
    );

    setTagError(null);
    closeTagManager();
  };

  const handleCreateTag = () => {
    const trimmed = newTagName.trim();
    if (!trimmed) {
      setTagCreationError('Введите название тега');
      return;
    }
    if (tagCatalog[trimmed]) {
      setTagCreationError('Такой тег уже существует');
      return;
    }

    setTagCatalog((prev) => ({ ...prev, [trimmed]: newTagColor }));
    setNewTagName('');
    setTagCreationError(null);

    if (tagAction !== 'remove') {
      setSelectedTagNames((prev) => {
        if (prev.includes(trimmed)) {
          return prev;
        }
        if (prev.length >= MAX_TAGS_PER_EMPLOYEE) {
          setTagError(`Можно выбрать не более ${MAX_TAGS_PER_EMPLOYEE} тегов.`);
          return prev;
        }
        setTagError(null);
        return [...prev, trimmed];
      });
    }
  };

  const toggleTagSelection = (tag: string) => {
    setSelectedTagNames((prev) => {
      if (prev.includes(tag)) {
        const next = prev.filter((item) => item !== tag);
        if (tagError) {
          setTagError(null);
        }
        return next;
      }

      if (tagAction !== 'remove' && prev.length >= MAX_TAGS_PER_EMPLOYEE) {
        setTagError(`Можно выбрать не более ${MAX_TAGS_PER_EMPLOYEE} тегов.`);
        return prev;
      }

      if (tagError) {
        setTagError(null);
      }

      return [...prev, tag];
    });
  };

  const handleDeleteTagDefinition = (tag: string) => {
    setTagCatalog((prev) => {
      if (!prev[tag]) {
        return prev;
      }
      const { [tag]: _removed, ...rest } = prev;
      return rest;
    });
    setSelectedTagNames((prev) => prev.filter((item) => item !== tag));

    onEmployeesChange((prev) =>
      prev.map((emp) => {
        if (!emp.tags.includes(tag)) {
          return emp;
        }
        return {
          ...emp,
          tags: emp.tags.filter((existing) => existing !== tag),
          metadata: { ...emp.metadata, updatedAt: new Date(), lastModifiedBy: 'agent' },
        };
      })
    );
  };

  const handleImportOptionSelect = (label: string) => {
    const anchorButton = importMenuAnchorRef.current?.querySelector('button');
    if (anchorButton instanceof HTMLElement) {
      lastFocusedControlRef.current = anchorButton;
    } else {
      storeFocusedControl();
    }
    setImportContext(label);
    setShowImportMenu(false);
    setShowExportMenu(false);
    openImportModal();
  };

  const handleExportOptionSelect = (label: string) => {
    const anchorButton = exportMenuAnchorRef.current?.querySelector('button');
    if (anchorButton instanceof HTMLElement) {
      lastFocusedControlRef.current = anchorButton;
    } else {
      storeFocusedControl();
    }
    setExportContext(label);
    setShowExportMenu(false);
    openExportModal();
  };

  const handleImportClick = () => {
    setImportFeedback(null);
    importInputRef.current?.click();
  };

  const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const activeContext = importContext;
    const config = IMPORT_CONFIG[activeContext];
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

    const announceImportError = (message: string) => {
      setImportFeedback(message);
      setStatusNotice(message);
      setLiveMessage(`Импорт отклонён: ${activeContext}`);
      setSelectionOverrideExpires(Date.now() + 4000);
    };

    const announceImportSuccess = (message: string) => {
      setImportFeedback(message);
      setStatusNotice(message);
      setLiveMessage(`Файл принят для импорта: ${activeContext}`);
      setSelectionOverrideExpires(Date.now() + 4000);
    };

    const resetInput = () => {
      input.value = '';
    };

    const hasValidExtension = config ? config.extensions.includes(extension) : true;

    if (!hasValidExtension) {
      const errorMessage = `Импорт «${activeContext}» поддерживает форматы: ${config.extensions.join(', ')}. Выбранный файл «${file.name}» отклонён.`;
      announceImportError(errorMessage);
      resetInput();
      return;
    }

    if (file.size === 0) {
      announceImportError(`Файл «${file.name}» пустой. Добавьте данные и повторите импорт.`);
      resetInput();
      return;
    }

    const requiredHeaders = IMPORT_REQUIRED_HEADERS[activeContext];
    const successMessage = `Файл «${file.name}» принят для раздела «${activeContext}». Сверьте структуру с ${config?.appendix ?? 'соответствующим приложением'}.`;

    if (requiredHeaders && requiredHeaders.length > 0) {
      if (extension === 'csv') {
        const reader = new FileReader();
        reader.onload = () => {
          const text = String(reader.result ?? '');
          const { valid, missingHeaders, message } = validateCsvHeaders(text, requiredHeaders);
          if (!valid) {
            announceImportError(message ?? `Отсутствуют обязательные колонки: ${missingHeaders.join(', ')}.`);
            resetInput();
            return;
          }
          announceImportSuccess(successMessage);
          resetInput();
        };
        reader.onerror = () => {
          announceImportError(`Не удалось прочитать файл «${file.name}».`);
          resetInput();
        };
        reader.readAsText(file, 'utf-8');
        return;
      }

      parseWorkbookHeaders(file)
        .then((headers) => {
          const normalized = headers.map((header) => header.toLowerCase());
          const missing = requiredHeaders.filter((column) => !normalized.includes(column.toLowerCase()));
          if (missing.length > 0) {
            announceImportError(`Отсутствуют обязательные колонки: ${missing.join(', ')}.`);
            return;
          }
          announceImportSuccess(successMessage);
        })
        .catch(() => {
          announceImportError(`Не удалось обработать файл «${file.name}».`);
        })
        .finally(() => {
          resetInput();
        });
      return;
    }

    announceImportSuccess(successMessage);
    resetInput();
  };

  const handleExport = () => {
    const exportEmployees = selectedEmployees.size > 0
      ? employees.filter((emp) => selectedEmployees.has(emp.id))
      : sortedEmployees;

    const downloadCsv = (csv: string, context: string) => {
      const base = EXPORT_FILE_TITLES[context] ?? 'employees_export';
      const fileName = `${base}_${new Date().toISOString().slice(0, 10)}.csv`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      const successMessage = `Экспорт завершён. Раздел: ${context}. Файл «${fileName}» сохранён.`;
      setExportFeedback(successMessage);
      setStatusNotice(successMessage);
      setLiveMessage(`Экспорт выполнен: ${context}`);
      setSelectionOverrideExpires(Date.now() + 4000);
    };

    if (exportContext === 'Отпуска') {
      const csv = generateVacationCsv(exportEmployees, (status) => STATUS_LABELS[status]);

      if (!csv) {
        setExportFeedback('Нет сотрудников в отпуске для выгрузки.');
        setStatusNotice('Нет данных для экспорта «Отпуска».');
        setLiveMessage('Экспорт «Отпуска»: нет данных');
        setSelectionOverrideExpires(Date.now() + 4000);
        return;
      }
      downloadCsv(csv, exportContext);
      return;
    }

    if (exportContext === 'Теги') {
      const csv = generateTagCsv(exportEmployees);

      if (!csv) {
        setExportFeedback('У выбранных сотрудников отсутствуют теги для экспорта.');
        setStatusNotice('Нет данных для экспорта «Теги».');
        setLiveMessage('Экспорт «Теги»: нет данных');
        setSelectionOverrideExpires(Date.now() + 4000);
        return;
      }
      downloadCsv(csv, exportContext);
      return;
    }

    const columns = COLUMN_ORDER.filter((column) => columnVisibility[column.key]);
    const csv = generateEmployeeCsv(
      exportEmployees,
      columns.map(({ key, label }) => ({ key, label })),
    );
    downloadCsv(csv, exportContext);
  };

  const hasActiveFilters = useMemo(() => {
    const { search, team, status, position, orgUnit, showInactive } = filters;
    return (
      Boolean(search) ||
      Boolean(team) ||
      Boolean(status) ||
      Boolean(position) ||
      Boolean(orgUnit) ||
      showInactive
    );
  }, [filters]);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ label: string; onRemove: () => void }> = [];
    if (filters.team) {
      chips.push({
        label: `Команда: ${filters.team}`,
        onRemove: () => handleFilterChange('team', ''),
      });
    }
    if (filters.status) {
      chips.push({
        label: `Статус: ${STATUS_LABELS[filters.status as EmployeeStatus]}`,
        onRemove: () => handleFilterChange('status', ''),
      });
    }
    if (filters.position) {
      chips.push({ label: `Должность: ${filters.position}`, onRemove: () => handleFilterChange('position', '') });
    }
    if (filters.orgUnit) {
      chips.push({ label: `Точка: ${filters.orgUnit}`, onRemove: () => handleFilterChange('orgUnit', '') });
    }
    if (filters.showInactive) {
      chips.push({ label: 'Показывать уволенных', onRemove: () => handleFilterChange('showInactive', false) });
    }
    return chips;
  }, [filters]);

  const selectedTags = useMemo(() => {
    const tags = new Set<string>();
    employees.forEach((emp) => {
      if (selectedEmployees.has(emp.id)) {
        emp.tags.forEach((tag) => tags.add(tag));
    }
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [employees, selectedEmployees]);

  const joinValues = useCallback((values: string[]) => values.join(', '), []);

  const matrixSummary = useMemo(() => {
    const summary: string[] = [];
    const { status, team, hourNorm, workScheme, skills, reserveSkills, tags, comment } = bulkEditMatrix;

    if (status.action !== 'none' && status.value) {
      const statusLabel = STATUS_LABELS[status.value as EmployeeStatus] ?? status.value;
      summary.push(`Статус → ${statusLabel}`);
    }

    if (team.action !== 'none' && team.value) {
      const teamName = teamLookup.get(team.value)?.name ?? team.value;
      summary.push(`Команда → ${teamName}`);
    }

    if (hourNorm.action !== 'none' && hourNorm.value) {
      summary.push(`Норма часов → ${hourNorm.value}`);
    }

    if (workScheme.action === 'remove') {
      summary.push('Схема работы будет снята');
    } else if (workScheme.action !== 'none' && workScheme.value) {
      const schemeName = schemeLookup.get(workScheme.value)?.name ?? workScheme.value;
      summary.push(`Схема работы → ${schemeName}`);
    }

    if (skills.action !== 'none' && skills.value.length > 0) {
      summary.push(`Навыки — ${MATRIX_ACTION_LABELS[skills.action]} (${joinValues(skills.value)})`);
    }

    if (reserveSkills.action !== 'none' && reserveSkills.value.length > 0) {
      summary.push(`Резервные навыки — ${MATRIX_ACTION_LABELS[reserveSkills.action]} (${joinValues(reserveSkills.value)})`);
    }

    if (tags.action !== 'none' && tags.value.length > 0) {
      summary.push(`Теги — ${MATRIX_ACTION_LABELS[tags.action]} (${joinValues(tags.value)})`);
    }

    if (comment.trim()) {
      summary.push('Комментарий будет добавлен в таймлайн задач.');
    }

    return summary;
  }, [bulkEditMatrix, joinValues, schemeLookup, teamLookup]);

  const tagCatalogEntries = Object.entries(tagCatalog);
  const renderTagCatalogList = () => {
    if (tagCatalogEntries.length === 0) {
      return (
        <p className="text-sm text-gray-500">Пока нет тегов — создайте новый, чтобы назначить сотрудникам.</p>
      );
    }

    return tagCatalogEntries.map(([tag, color]) => {
      const checked = selectedTagNames.includes(tag);
      return (
        <div
          key={tag}
          className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
        >
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              className="rounded text-blue-600 focus:ring-blue-500"
              checked={checked}
              onChange={() => toggleTagSelection(tag)}
            />
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-sm border border-gray-300"
                style={{ backgroundColor: color }}
              />
              {tag}
            </span>
          </label>
          <button
            type="button"
            onClick={() => handleDeleteTagDefinition(tag)}
            className="text-gray-400 hover:text-red-600"
            aria-label={`Удалить тег ${tag}`}
          >
            🗑
          </button>
        </div>
      );
    });
  };

  const bulkEditButtonTitle = !isSelectionMode
    ? 'Включить режим выбора для массового редактирования'
    : selectedEmployees.size === 0
      ? 'Выберите сотрудников и нажмите снова, чтобы открыть массовое редактирование'
      : 'Открыть массовое редактирование';

  return {
    employees,
    onEmployeesChange,
    onOpenQuickAdd,
    focusEmployeeId,
    STATUS_LABELS,
    STATUS_BADGE_CLASSES,
    COLUMN_ORDER,
    createDefaultFilters,
    TAG_COLOR_PALETTE,
    IMPORT_OPTIONS,
    EXPORT_OPTIONS,
    IMPORT_CONFIG,
    EXPORT_FILE_TITLES,
    IMPORT_REQUIRED_HEADERS,
    MATRIX_ACTION_LABELS,
    MATRIX_ACTIONS,
    FIELD_ACTION_CONFIG,
    createInitialBulkEditState,
    filters,
    setFilters,
    searchSummary,
    selectedEmployees,
    setSelectedEmployees,
    activeEmployeeId,
    setActiveEmployeeId,
    isInitialLoading,
    setIsInitialLoading,
    isDrawerLoading,
    setIsDrawerLoading,
    showBulkActions,
    setShowBulkActions,
    showFilters,
    setShowFilters,
    showColumnSettings,
    setShowColumnSettings,
    showTagManager,
    setShowTagManager,
    tagError,
    setTagError,
    tagCreationError,
    setTagCreationError,
    tagCatalog,
    setTagCatalog,
    tagAction,
    setTagAction,
    selectedTagNames,
    setSelectedTagNames,
    newTagName,
    setNewTagName,
    newTagColor,
    setNewTagColor,
    showImportModal,
    setShowImportModal,
    showExportModal,
    setShowExportModal,
    importFeedback,
    setImportFeedback,
    exportFeedback,
    setExportFeedback,
    showImportMenu,
    setShowImportMenu,
    showExportMenu,
    setShowExportMenu,
    isBulkEditOpen,
    setIsBulkEditOpen,
    bulkEditMatrix,
    setBulkEditMatrix,
    bulkEditError,
    setBulkEditError,
    bulkEditSuccess,
    setBulkEditSuccess,
    importContext,
    setImportContext,
    exportContext,
    setExportContext,
    liveMessage,
    setLiveMessage,
    statusNotice,
    setStatusNotice,
    selectionOverrideExpires,
    setSelectionOverrideExpires,
    isSelectionMode,
    setIsSelectionMode,
    importInputRef,
    importMenuAnchorRef,
    exportMenuAnchorRef,
    filterToggleRef,
    rowRefs,
    drawerReturnFocusRef,
    drawerReturnFocusIdRef,
    lastFocusedControlRef,
    toolbarButtonClass,
    toolbarPrimaryButtonClass,
    storeFocusedControl,
    restoreFocusedControl,
    restoreRowFocus,
    openColumnSettings,
    closeColumnSettings,
    openTagManager,
    closeTagManager,
    openImportModal,
    closeImportModal,
    openExportModal,
    closeExportModal,
    columnVisibility,
    setColumnVisibility,
    clearSelection,
    handleFilterChange,
    handleResetFilters,
    filteredEmployees,
    sortedEmployees,
    teamOptions,
    teamLookup,
    schemeOptions,
    schemeLookup,
    primarySkillCatalog,
    reserveSkillCatalog,
    handleOpenEmployeeDrawer,
    toggleEmployeeSelection,
    enableSelectionMode,
    selectedEmployeeList,
    totalCount,
    visibleCount,
    handleSelectAll,
    rowHeight,
    tableHeight,
    tableColumns,
    getTableRowProps,
    allTags,
    activeEmployee,
    handleFieldActionToggle,
    isValueEmpty,
    updateMatrixValue,
    updateMatrixComment,
    renderActionButtons,
    resetBulkEditState,
    handleOpenBulkEdit,
    handleBulkEditClose,
    handleDismissEmployee,
    handleRestoreEmployee,
    hasMatrixChanges,
    handleBulkEditSubmit,
    handleDrawerClose,
    handleDrawerSave,
    toggleColumn,
    normalizeTagSelection,
    handleApplyTags,
    handleCreateTag,
    toggleTagSelection,
    handleDeleteTagDefinition,
    handleImportOptionSelect,
    handleExportOptionSelect,
    handleImportClick,
    handleImportChange,
    handleExport,
    hasActiveFilters,
    activeFilterChips,
    selectedTags,
    joinValues,
    matrixSummary,
    tagCatalogEntries,
    renderTagCatalogList,
    bulkEditButtonTitle,
  };

};



export type EmployeeListState = ReturnType<typeof useEmployeeListState>;
