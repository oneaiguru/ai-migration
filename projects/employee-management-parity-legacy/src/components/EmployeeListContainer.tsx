// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/EmployeeListContainer.tsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EmployeeEditDrawer from './EmployeeEditDrawer';
import {
  Employee,
  EmployeeStatus,
  EmployeeFilters,
  SkillAssignment,
  Team,
  WorkSchemeAssignment,
} from '../types/employee';
import { createTaskEntry } from '../utils/task';
import useFocusTrap from '../hooks/useFocusTrap';

interface EmployeeListContainerProps {
  employees: Employee[];
  onEmployeesChange: (updater: (prev: Employee[]) => Employee[]) => void;
  onOpenQuickAdd: () => void;
  focusEmployeeId: string | null;
}

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Активен',
  vacation: 'В отпуске',
  probation: 'Испытательный',
  inactive: 'Неактивен',
  terminated: 'Уволен',
};

const STATUS_BADGE_CLASSES: Record<EmployeeStatus, string> = {
  active: 'bg-green-100 text-green-800',
  vacation: 'bg-yellow-100 text-yellow-800',
  probation: 'bg-blue-100 text-blue-800',
  inactive: 'bg-gray-100 text-gray-800',
  terminated: 'bg-red-100 text-red-800',
};

const COLUMN_ORDER = [
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
const TAG_CATALOG_STORAGE_KEY = 'employee-list:tag-catalog';

const createDefaultFilters = (): EmployeeFilters => ({
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

const TAG_COLOR_PALETTE = ['#2563eb', '#1d4ed8', '#0ea5e9', '#0f766e', '#16a34a', '#d97706', '#db2777', '#7c3aed'];

const getColorForTag = (tag: string) => {
  let hash = 0;
  for (let index = 0; index < tag.length; index += 1) {
    hash = (hash << 5) - hash + tag.charCodeAt(index);
    hash |= 0;
  }
  const paletteIndex = Math.abs(hash) % TAG_COLOR_PALETTE.length;
  return TAG_COLOR_PALETTE[paletteIndex];
};

const IMPORT_OPTIONS = [
  { id: 'employees', label: 'Сотрудника' },
  { id: 'skills', label: 'Навыки' },
  { id: 'vacations', label: 'Отпуска' },
  { id: 'preferences', label: 'Смены предпочтений' },
  { id: 'schemes', label: 'Схемы' },
  { id: 'tags', label: 'Теги' },
];

const EXPORT_OPTIONS = [
  { id: 'csv', label: 'CSV (текущие колонки)' },
  { id: 'vacations', label: 'Отпуска' },
  { id: 'tags', label: 'Теги' },
];

const FOCUSABLE_WITHIN_ROW =
  'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const IMPORT_CONFIG: Record<string, { extensions: string[]; appendix: string }> = {
  Сотрудника: { extensions: ['csv', 'xlsx', 'xls'], appendix: 'Appendix 1' },
  Навыки: { extensions: ['csv', 'xlsx'], appendix: 'Appendix 3' },
  Отпуска: { extensions: ['csv'], appendix: 'Appendix 5' },
  'Смены предпочтений': { extensions: ['csv'], appendix: 'Appendix 4' },
  Схемы: { extensions: ['csv'], appendix: 'Appendix 8' },
  Теги: { extensions: ['csv'], appendix: 'Appendix 6' },
};

const IMPORT_HEADINGS: Record<string, string> = {
  Сотрудника: 'Импорт сотрудников',
  Навыки: 'Импорт навыков',
  Отпуска: 'Импорт отпусков',
  'Смены предпочтений': 'Импорт смен предпочтений',
  Схемы: 'Импорт схем',
  Теги: 'Импорт тегов',
};

const EXPORT_META: Record<string, { heading: string; description: string; filePrefix: string }> = {
  'CSV (текущие колонки)': {
    heading: 'Экспорт сотрудников',
    description: 'Файл учитывает выбранные колонки и активные фильтры.',
    filePrefix: 'employees_export',
  },
  Отпуска: {
    heading: 'Экспорт отпусков',
    description: 'Выгрузка сотрудников со статусом «В отпуске».',
    filePrefix: 'employees_vacations',
  },
  Теги: {
    heading: 'Экспорт тегов',
    description: 'Список логинов и назначенных тегов.',
    filePrefix: 'employees_tags',
  },
};

const IMPORT_REQUIRED_HEADERS: Record<string, string[]> = {
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

type MatrixAction = 'add' | 'replace' | 'remove';
type FieldAction = MatrixAction | 'none';

interface BulkEditFieldState<T> {
  action: FieldAction;
  value: T;
}

interface BulkEditMatrixState {
  status: BulkEditFieldState<EmployeeStatus | ''>;
  team: BulkEditFieldState<string>;
  hourNorm: BulkEditFieldState<string>;
  workScheme: BulkEditFieldState<string>;
  skills: BulkEditFieldState<string[]>;
  reserveSkills: BulkEditFieldState<string[]>;
  tags: BulkEditFieldState<string[]>;
  comment: string;
}

const createInitialBulkEditState = (): BulkEditMatrixState => ({
  status: { action: 'none', value: '' },
  team: { action: 'none', value: '' },
  hourNorm: { action: 'none', value: '' },
  workScheme: { action: 'none', value: '' },
  skills: { action: 'none', value: [] },
  reserveSkills: { action: 'none', value: [] },
  tags: { action: 'none', value: [] },
  comment: '',
});

const MATRIX_ACTION_LABELS: Record<MatrixAction, string> = {
  add: 'Добавить всем',
  replace: 'Заменить всем',
  remove: 'Удалить у всех',
};

const MATRIX_ACTIONS: MatrixAction[] = ['add', 'replace', 'remove'];

const FIELD_ACTION_CONFIG: Record<keyof Omit<BulkEditMatrixState, 'comment'>, MatrixAction[]> = {
  status: ['replace'],
  team: ['replace'],
  hourNorm: ['replace'],
  workScheme: ['add', 'replace', 'remove'],
  skills: ['add', 'replace', 'remove'],
  reserveSkills: ['add', 'replace', 'remove'],
  tags: ['add', 'replace', 'remove'],
};

const MAX_TAGS_PER_EMPLOYEE = 4;

const loadStoredTagCatalog = (): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(TAG_CATALOG_STORAGE_KEY);
    if (!stored) {
      return {};
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

  return {};
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

const EmployeeListContainer: React.FC<EmployeeListContainerProps> = ({
  employees,
  onEmployeesChange,
  onOpenQuickAdd,
  focusEmployeeId,
}) => {
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
  const bulkEditContainerRef = useRef<HTMLDivElement | null>(null);
  const columnSettingsRef = useRef<HTMLDivElement | null>(null);
  const tagManagerRef = useRef<HTMLDivElement | null>(null);
  const importModalRef = useRef<HTMLDivElement | null>(null);
  const exportModalRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    setTagCatalog((prev) => {
      const next = { ...prev };
      let changed = false;
      employees.forEach((emp) => {
        emp.tags.forEach((tag) => {
          if (!next[tag]) {
            next[tag] = getColorForTag(tag);
            changed = true;
          }
        });
      });
      return changed ? next : prev;
    });
  }, [employees]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(TAG_CATALOG_STORAGE_KEY, JSON.stringify(tagCatalog));
    } catch (error) {
      console.error('Не удалось сохранить каталог тегов', error);
    }
  }, [tagCatalog]);

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

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      if (!filters.showInactive && employee.status === 'terminated') {
        return false;
      }

      const search = filters.search.trim().toLowerCase();
      if (search) {
        const target = [
          employee.personalInfo.lastName,
          employee.personalInfo.firstName,
          employee.personalInfo.middleName ?? '',
          employee.credentials.wfmLogin,
          employee.workInfo.position,
        ]
          .join(' ')
          .toLowerCase();
        if (!target.includes(search)) {
          return false;
        }
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
  }, [employees, filters]);

  const sortedEmployees = useMemo(() => {
    const data = [...filteredEmployees];
    data.sort((a, b) => {
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
    });

    return data;
  }, [filteredEmployees, filters.sortBy, filters.sortOrder]);

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

  const selectedEmployeeList = useMemo(() => {
    if (selectedEmployees.size === 0) {
      return [] as Employee[];
    }
    return employees.filter((emp) => selectedEmployees.has(emp.id));
  }, [employees, selectedEmployees]);

  const totalCount = employees.length;
  const visibleCount = sortedEmployees.length;

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

  const toggleEmployeeSelection = (id: string) => {
    setSelectedEmployees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const resetBulkEditState = () => {
    setBulkEditMatrix(createInitialBulkEditState());
  };

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

  const handleSelectAll = () => {
    if (selectedEmployees.size === visibleCount && visibleCount > 0) {
      setSelectedEmployees(new Set());
      return;
    }

    setSelectedEmployees(new Set(sortedEmployees.map((emp) => emp.id)));
  };

  const handleDrawerClose = () => {
    setActiveEmployeeId(null);
    setIsDrawerLoading(false);
    restoreRowFocus();
  };

  const handleDrawerSave = async (updatedEmployee: Employee) => {
    onEmployeesChange((prev) =>
      prev.map((emp) => (emp.id === updatedEmployee.id ? { ...updatedEmployee } : emp))
    );

    const fullName = `${updatedEmployee.personalInfo.lastName} ${updatedEmployee.personalInfo.firstName}`.trim();
    const displayName = fullName || updatedEmployee.credentials.wfmLogin;
    const successMessage = `Данные сотрудника ${displayName} сохранены.`;
    setStatusNotice(successMessage);
    setLiveMessage(`Изменения сохранены для ${displayName}`);
    setSelectionOverrideExpires(Date.now() + 4000);
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

    const requiredHeaders = extension === 'csv' ? IMPORT_REQUIRED_HEADERS[activeContext] : undefined;
    const successMessage = `Файл «${file.name}» принят для раздела «${activeContext}». Сверьте структуру с ${config?.appendix ?? 'соответствующим приложением'}.`;

    if (requiredHeaders) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result ?? '');
          const lines = text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

          if (lines.length === 0) {
            announceImportError(`Файл «${file.name}» не содержит строк данных.`);
            resetInput();
            return;
          }

          const headerLine = lines[0];
          const parsedHeaders = headerLine
            .split(',')
            .map((column) => column.replace(/"/g, '').trim());

          const normalizedHeaders = parsedHeaders.map((column) => column.toLowerCase());
          const missing = requiredHeaders.filter((column) => !normalizedHeaders.includes(column.toLowerCase()));

          if (missing.length > 0) {
            announceImportError(`Отсутствуют обязательные колонки: ${missing.join(', ')}.`);
            resetInput();
            return;
          }

          announceImportSuccess(successMessage);
        } catch (error) {
          announceImportError(`Не удалось обработать файл «${file.name}».`);
        } finally {
          resetInput();
        }
      };

      reader.onerror = () => {
        announceImportError(`Не удалось прочитать файл «${file.name}».`);
        resetInput();
      };

      reader.readAsText(file, 'utf-8');
      return;
    }

    announceImportSuccess(successMessage);
    resetInput();
  };

  const handleExport = () => {
    const exportEmployees = selectedEmployees.size > 0
      ? employees.filter((emp) => selectedEmployees.has(emp.id))
      : sortedEmployees;

    const exportMeta = EXPORT_META[exportContext] ?? {
      heading: `Экспорт «${exportContext}»`,
      description: '',
      filePrefix: 'employees_export',
    };

    const downloadCsv = (csv: string) => {
      const fileName = `${exportMeta.filePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      const successMessage = `${exportMeta.heading} завершён. Файл «${fileName}» сохранён.`;
      setExportFeedback(successMessage);
      setStatusNotice(successMessage);
      setLiveMessage(`Экспорт выполнен: ${exportMeta.heading}`);
      setSelectionOverrideExpires(Date.now() + 4000);
    };

    const quoted = (value: string) => `"${value.replace(/"/g, '""')}"`;

    if (exportContext === 'Отпуска') {
      const header = ['login', 'ФИО', 'Статус', 'Команда', 'Комментарий'];
      const rows = exportEmployees
        .filter((employee) => employee.status === 'vacation')
        .map((employee) => (
          [
            employee.credentials.wfmLogin,
            `${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim(),
            STATUS_LABELS[employee.status],
            employee.workInfo.team.name,
            'Отпуск по графику',
          ].map(quoted).join(',')
        ));

      if (rows.length === 0) {
        const message = `${exportMeta.heading}: нет данных для выгрузки.`;
        setExportFeedback(message);
        setStatusNotice(message);
        setLiveMessage(`${exportMeta.heading}: нет данных`);
        setSelectionOverrideExpires(Date.now() + 4000);
        return;
      }

      const csv = [header.join(','), ...rows].join('\n');
      downloadCsv(csv);
      return;
    }

    if (exportContext === 'Теги') {
      const header = ['login', 'ФИО', 'Тег'];
      const rows = exportEmployees.flatMap((employee) =>
        (employee.tags.length === 0
          ? [[employee.credentials.wfmLogin, `${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim(), '']]
          : employee.tags.map((tag) => [
              employee.credentials.wfmLogin,
              `${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim(),
              tag,
            ])
        ).map((values) => values.map(quoted).join(','))
      );

      if (rows.length === 0) {
        const message = `${exportMeta.heading}: нет данных для выгрузки.`;
        setExportFeedback(message);
        setStatusNotice(message);
        setLiveMessage(`${exportMeta.heading}: нет данных`);
        setSelectionOverrideExpires(Date.now() + 4000);
        return;
      }

      const csv = [header.join(','), ...rows].join('\n');
      downloadCsv(csv);
      return;
    }

    const columns = COLUMN_ORDER.filter((column) => columnVisibility[column.key]);
    const header = columns.map((column) => column.label).join(',');
    const rows = exportEmployees.map((employee) =>
      columns
        .map((column) => {
          switch (column.key) {
            case 'fio':
              return quoted(`${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim());
            case 'position':
              return quoted(employee.workInfo.position);
            case 'orgUnit':
              return quoted(employee.orgPlacement.orgUnit);
            case 'team':
              return quoted(employee.workInfo.team.name);
            case 'scheme':
              return quoted(employee.orgPlacement.workScheme?.name ?? '');
            case 'hourNorm':
              return String(employee.orgPlacement.hourNorm);
            case 'status':
              return STATUS_LABELS[employee.status];
            case 'hireDate':
              return employee.workInfo.hireDate.toLocaleDateString('ru-RU');
            default:
              return '';
          }
        })
        .join(',')
    );

    const csv = [header, ...rows].join('\n');
    downloadCsv(csv);
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

  const joinValues = useCallback((values: string[]) => {
    if (values.length === 0) {
      return '';
    }
    if (values.length <= 3) {
      return values.join(', ');
    }
    return `${values.slice(0, 3).join(', ')} и ещё ${values.length - 3}`;
  }, []);

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

  const bulkEditButtonTitle = !isSelectionMode
    ? 'Включить режим выбора для массового редактирования'
    : selectedEmployees.size === 0
      ? 'Выберите сотрудников и нажмите снова, чтобы открыть массовое редактирование'
      : 'Открыть массовое редактирование';

  useFocusTrap(bulkEditContainerRef, {
    enabled: isBulkEditOpen,
    onEscape: handleBulkEditClose,
  });

  useFocusTrap(columnSettingsRef, {
    enabled: showColumnSettings,
    onEscape: closeColumnSettings,
  });

  useFocusTrap(tagManagerRef, {
    enabled: showTagManager,
    onEscape: closeTagManager,
  });

  useFocusTrap(importModalRef, {
    enabled: showImportModal,
    onEscape: closeImportModal,
  });

  useFocusTrap(exportModalRef, {
    enabled: showExportModal,
    onEscape: closeExportModal,
  });

  const importMeta = IMPORT_CONFIG[importContext];
  const importHeading = IMPORT_HEADINGS[importContext] ?? `Импорт «${importContext}»`;
  const importGuidance = [
    importMeta?.appendix
      ? `Скачайте и заполните шаблон ${importMeta.appendix} для раздела «${importContext}».`
      : `Подготовьте файл для раздела «${importContext}».`,
    'Проверьте форматы дат и соответствие справочникам системы.',
    'Загрузите файл: предварительная проверка выполнится на фронте, итоговая загрузка — после подключения бэкенда.',
  ];

  const exportMetaForView = EXPORT_META[exportContext] ?? {
    heading: `Экспорт «${exportContext}»`,
    description: '',
    filePrefix: 'employees_export',
  };

  return (
    <>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        ref={importInputRef}
        className="sr-only"
        onChange={handleImportChange}
      />

      <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="sr-only" aria-live="polite">{liveMessage}</div>
        <div className="border-b border-gray-200 p-6 space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Сотрудники</h1>
              <p className="text-gray-600">
                Актуальный список персонала с ключевыми полями карточки и статусами
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <button
                type="button"
                ref={filterToggleRef}
                onClick={() => setShowFilters((prev) => !prev)}
                className={toolbarButtonClass()}
                aria-label={showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                title={showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
              >
                <span aria-hidden>{showFilters ? '📑' : '🔍'}</span>
                <span>{showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}</span>
              </button>
              <button
                type="button"
                onClick={handleOpenBulkEdit}
                disabled={isBulkEditOpen}
                className={toolbarButtonClass(isBulkEditOpen)}
                aria-label={bulkEditButtonTitle}
                title={bulkEditButtonTitle}
                aria-pressed={isSelectionMode}
                data-testid="toolbar-bulk-edit"
              >
                <span aria-hidden>🛠️</span>
                <span>Массовое редактирование</span>
              </button>
              <button
                type="button"
                onClick={openTagManager}
                className={toolbarButtonClass()}
                aria-label="Управление тегами"
                title="Управление тегами"
              >
                <span aria-hidden>🏷️</span>
                <span>Теги</span>
              </button>
              <div className="relative" ref={importMenuAnchorRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportMenu((prev) => !prev);
                    setShowExportMenu(false);
                  }}
                  className={toolbarButtonClass()}
                  aria-haspopup="true"
                  aria-expanded={showImportMenu}
                  title="Импортировать"
                >
                  <span aria-hidden>⬇️</span>
                  <span>Импорт</span>
                </button>
                {showImportMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {IMPORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleImportOptionSelect(option.label)}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" ref={exportMenuAnchorRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowExportMenu((prev) => !prev);
                    setShowImportMenu(false);
                  }}
                  className={toolbarButtonClass()}
                  aria-haspopup="true"
                  aria-expanded={showExportMenu}
                  title="Экспортировать"
                >
                  <span aria-hidden>⬆️</span>
                  <span>Экспорт</span>
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {EXPORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleExportOptionSelect(option.label)}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={openColumnSettings}
                className={toolbarButtonClass()}
                aria-label="Настроить отображение колонок"
                title="Настроить отображение колонок"
              >
                <span aria-hidden>🗂️</span>
                <span>Колонки</span>
              </button>
              <button
                type="button"
                onClick={onOpenQuickAdd}
                className={toolbarPrimaryButtonClass}
                aria-label="Добавить нового сотрудника"
                title="Добавить нового сотрудника"
                data-testid="toolbar-new-employee"
              >
                <span aria-hidden>➕</span>
                <span>Новый сотрудник</span>
              </button>
            </div>
        </div>

        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-blue-900">
              <span>Выбрано сотрудников: {selectedEmployees.size}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openExportModal}
                  className="px-3 py-1 bg-white border border-blue-200 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  Экспорт
                </button>
                <button
                  type="button"
                  onClick={openTagManager}
                  className="px-3 py-1 bg-white border border-blue-200 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  Назначить теги
                </button>
                <button
                  type="button"
                  onClick={() => clearSelection()}
                  className="text-xs font-medium text-blue-800 hover:underline"
                >
                  Очистить
                </button>
              </div>
          </div>
        )}

      {bulkEditSuccess && (
        <div className="mx-6 mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
          {bulkEditSuccess}
        </div>
      )}
      {statusNotice && (
        <div className="mx-6 mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800" role="status">
          {statusNotice}
        </div>
      )}
        {bulkEditError && !isBulkEditOpen && (
          <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {bulkEditError}
          </div>
        )}

        <div className="flex flex-col gap-3">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500"
                    checked={filters.showInactive}
                    onChange={(event) => handleFilterChange('showInactive', event.target.checked)}
                  />
                  <span>Показывать уволенных</span>
                </label>
                <span>{visibleCount}/{totalCount}</span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  disabled={!hasActiveFilters}
                  className={`text-sm font-medium ${hasActiveFilters ? 'text-blue-600 hover:underline' : 'text-gray-400 cursor-default'}`}
                >
                  Снять все фильтры
                </button>
              </div>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilterChips.map((chip) => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {chip.label}
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label={`Удалить фильтр ${chip.label}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {showFilters && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Поиск</label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(event) => handleFilterChange('search', event.target.value)}
                      placeholder="ФИО, логин, должность"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Команда</label>
                    <select
                      value={filters.team}
                      onChange={(event) => handleFilterChange('team', event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Все команды</option>
                      {Array.from(new Map(employees.map((emp) => [emp.workInfo.team.id, emp.workInfo.team])).values()).map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Статус</label>
                    <select
                      value={filters.status}
                      onChange={(event) => handleFilterChange('status', event.target.value as EmployeeStatus | '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Все статусы</option>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Должность</label>
                    <input
                      type="text"
                      value={filters.position}
                      onChange={(event) => handleFilterChange('position', event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Точка оргструктуры</label>
                    <input
                      type="text"
                      value={filters.orgUnit}
                      onChange={(event) => handleFilterChange('orgUnit', event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Сортировка</label>
                    <select
                      value={filters.sortBy}
                      onChange={(event) => handleFilterChange('sortBy', event.target.value as EmployeeFilters['sortBy'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="name">ФИО</option>
                      <option value="position">Должность</option>
                      <option value="team">Команда</option>
                      <option value="hireDate">Дата найма</option>
                      <option value="performance">Качество обслуживания</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Порядок</label>
                    <select
                      value={filters.sortOrder}
                      onChange={(event) => handleFilterChange('sortOrder', event.target.value as EmployeeFilters['sortOrder'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="asc">Возрастание</option>
                      <option value="desc">Убывание</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {visibleCount === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Сотрудники не найдены</h3>
            <p className="text-sm">Измените фильтры или снимите ограничения, чтобы увидеть сотрудников</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {isSelectionMode && (
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={visibleCount > 0 && selectedEmployees.size === visibleCount}
                        onChange={handleSelectAll}
                        aria-label="Выбрать всех сотрудников"
                      />
                    </th>
                  )}
                  {COLUMN_ORDER.filter((column) => columnVisibility[column.key]).map((column) => (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                        column.key === 'hourNorm' || column.key === 'status' || column.key === 'hireDate'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedEmployees.map((employee) => {
                  const isSelected = selectedEmployees.has(employee.id);

                  const openEmployeeDrawer = (rowElement?: HTMLTableRowElement | null) => {
                    drawerReturnFocusRef.current = rowElement ?? rowRefs.current[employee.id] ?? null;
                    drawerReturnFocusIdRef.current = employee.id;
                    setIsDrawerLoading(true);
                    setActiveEmployeeId(employee.id);
                  };

                  const handleRowSelectionToggle = () => {
                    toggleEmployeeSelection(employee.id);
                  };

                  return (
                    <tr
                      key={employee.id}
                      ref={(element) => {
                        rowRefs.current[employee.id] = element;
                      }}
                      tabIndex={0}
                      onClick={(event) => {
                        const target = event.target as HTMLElement;
                        if (target.closest('input[type="checkbox"]') || target.closest('button')) {
                          return;
                        }

                        if (event.metaKey || event.ctrlKey) {
                          enableSelectionMode();
                          handleRowSelectionToggle();
                          return;
                        }

                        if (isSelectionMode) {
                          handleRowSelectionToggle();
                          return;
                        }

                        openEmployeeDrawer(event.currentTarget as HTMLTableRowElement);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Escape' && isSelectionMode) {
                          event.preventDefault();
                          clearSelection();
                          return;
                        }

                        if (event.key === 'Enter') {
                          event.preventDefault();
                          if (isSelectionMode) {
                            handleRowSelectionToggle();
                          } else {
                            openEmployeeDrawer(event.currentTarget as HTMLTableRowElement);
                          }
                          return;
                        }

                        if (event.key === ' ') {
                          event.preventDefault();
                          enableSelectionMode();
                          handleRowSelectionToggle();
                        }
                      }}
                      className={`transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-400' : 'hover:bg-gray-50'
                      }`}
                    >
                      {isSelectionMode && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="rounded text-blue-600 focus:ring-blue-500"
                            checked={isSelected}
                            onChange={(event) => {
                              event.stopPropagation();
                              toggleEmployeeSelection(employee.id);
                            }}
                            aria-label={`Выбрать ${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`}
                          />
                        </td>
                      )}

                      {columnVisibility.fio && (
                        <td className="px-6 py-3 whitespace-nowrap">
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
                                  const rowElement = (event.currentTarget.closest('tr') as HTMLTableRowElement) ??
                                    null;
                                  openEmployeeDrawer(rowElement);
                                }}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                              >
                                {employee.personalInfo.lastName} {employee.personalInfo.firstName}
                              </button>
                              <div className="text-xs text-gray-500">{employee.credentials.wfmLogin}</div>
                            </div>
                          </div>
                        </td>
                      )}

                      {columnVisibility.position && (
                        <td className="px-6 py-3 whitespace-nowrap text-gray-700">{employee.workInfo.position}</td>
                      )}

                      {columnVisibility.orgUnit && (
                        <td className="px-6 py-3 whitespace-nowrap text-gray-700">{employee.orgPlacement.orgUnit}</td>
                      )}

                      {columnVisibility.team && (
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: employee.workInfo.team.color }}
                            />
                            <span className="text-gray-700">{employee.workInfo.team.name}</span>
                          </div>
                        </td>
                      )}

                      {columnVisibility.scheme && (
                        <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                          {employee.orgPlacement.workScheme?.name ?? '—'}
                        </td>
                      )}

                      {columnVisibility.hourNorm && (
                        <td className="px-6 py-3 whitespace-nowrap text-center text-gray-700">
                          {employee.orgPlacement.hourNorm}
                        </td>
                      )}

                      {columnVisibility.status && (
                        <td className="px-6 py-3 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[employee.status]}`}>
                            {STATUS_LABELS[employee.status]}
                          </span>
                        </td>
                      )}

                      {columnVisibility.hireDate && (
                        <td className="px-6 py-3 whitespace-nowrap text-center text-gray-700">
                          {employee.workInfo.hireDate.toLocaleDateString('ru-RU')}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {isInitialLoading && (
          <div className="absolute inset-0 z-20 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-transparent rounded-full animate-spin" />
            <div className="w-full max-w-4xl space-y-3 px-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`loader-row-${index}`}
                  className="h-11 rounded-lg bg-gray-200/80 animate-pulse"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {isBulkEditOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 flex" onClick={handleBulkEditClose}>
          <div
            ref={bulkEditContainerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-edit-heading"
            aria-describedby="bulk-edit-summary"
            className="ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <form className="flex flex-col h-full" onSubmit={handleBulkEditSubmit}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 id="bulk-edit-heading" className="text-lg font-semibold text-gray-900">Редактирование данных сотрудников</h3>
                  <p className="text-sm text-gray-500">
                    Выбрано: {selectedEmployees.size}{' '}
                    {selectedEmployees.size === 1 ? 'сотрудник' : 'сотрудников'}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBulkEditClose}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Закрыть массовое редактирование"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {bulkEditError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                    {bulkEditError}
                  </div>
                )}

                <div
                  id="bulk-edit-summary"
                  className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-900"
                >
                  Отметьте действие «Добавить / Заменить / Удалить» для нужных полей. Значения будут применены ко всем выбранным сотрудникам.
                </div>

                <div className="space-y-6">
                  <section className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Статус</p>
                        <p className="text-xs text-gray-500">Массовая замена статуса сотрудников.</p>
                      </div>
                      {renderActionButtons('status')}
                    </div>
                    <select
                      id="bulk-edit-status"
                      value={bulkEditMatrix.status.value}
                      onChange={(event) => updateMatrixValue('status', event.target.value as EmployeeStatus | '')}
                      disabled={bulkEditMatrix.status.action === 'none'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">Выберите статус</option>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
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
                      {renderActionButtons('team')}
                    </div>
                    <select
                      id="bulk-edit-team"
                      value={bulkEditMatrix.team.value}
                      onChange={(event) => updateMatrixValue('team', event.target.value)}
                      disabled={bulkEditMatrix.team.action === 'none'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">Выберите команду</option>
                      {teamOptions.map((team) => (
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
                      {renderActionButtons('hourNorm')}
                    </div>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={bulkEditMatrix.hourNorm.value}
                      onChange={(event) => updateMatrixValue('hourNorm', event.target.value)}
                      disabled={bulkEditMatrix.hourNorm.action === 'none'}
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
                      {renderActionButtons('workScheme')}
                    </div>
                    <select
                      value={bulkEditMatrix.workScheme.value}
                      onChange={(event) => updateMatrixValue('workScheme', event.target.value)}
                      disabled={
                        bulkEditMatrix.workScheme.action === 'none' ||
                        bulkEditMatrix.workScheme.action === 'remove'
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">Выберите схему</option>
                      {schemeOptions.map((scheme) => (
                        <option key={scheme.id} value={scheme.id}>
                          {scheme.name}
                        </option>
                      ))}
                    </select>
                    {bulkEditMatrix.workScheme.action === 'remove' && (
                      <p className="text-xs text-gray-500">Схема будет снята у всех выбранных сотрудников.</p>
                    )}
                  </section>

                  <section className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Навыки</p>
                        <p className="text-xs text-gray-500">Каждый навык с новой строки или через запятую.</p>
                      </div>
                      {renderActionButtons('skills')}
                    </div>
                    <textarea
                      value={bulkEditMatrix.skills.value.join('\n')}
                      onChange={(event) => {
                        const tokens = event.target.value
                          .split(/[\n,;]+/)
                          .map((token) => token.trim())
                          .filter(Boolean);
                        const unique = Array.from(new Set(tokens));
                        setBulkEditMatrix((prev) => ({
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
                      disabled={bulkEditMatrix.skills.action === 'none'}
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
                      {renderActionButtons('reserveSkills')}
                    </div>
                    <textarea
                      value={bulkEditMatrix.reserveSkills.value.join('\n')}
                      onChange={(event) => {
                        const tokens = event.target.value
                          .split(/[\n,;]+/)
                          .map((token) => token.trim())
                          .filter(Boolean);
                        const unique = Array.from(new Set(tokens));
                        setBulkEditMatrix((prev) => ({
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
                      disabled={bulkEditMatrix.reserveSkills.action === 'none'}
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
                      {renderActionButtons('tags')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => {
                        const active = bulkEditMatrix.tags.value.includes(tag);
                        return (
                          <button
                            key={`bulk-tag-${tag}`}
                            type="button"
                            onClick={() => {
                              setBulkEditMatrix((prev) => {
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
                      value={bulkEditMatrix.tags.value.join('\n')}
                      onChange={(event) => {
                        const tokens = event.target.value
                          .split(/[\n,;]+/)
                          .map((token) => token.trim())
                          .filter(Boolean);
                        const unique = Array.from(new Set(tokens));
                        setBulkEditMatrix((prev) => ({
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
                      disabled={bulkEditMatrix.tags.action === 'none'}
                      className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                      placeholder="VIP, Новичок"
                    />
                  </section>

                  <section className="space-y-3">
                    <p className="text-sm font-semibold text-gray-900">Комментарий / задача</p>
                    <textarea
                      id="bulk-edit-comment"
                      value={bulkEditMatrix.comment}
                      onChange={(event) => updateMatrixComment(event.target.value)}
                      className="w-full min-h-[92px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Заметка появится в таймлайне задач"
                    />
                    <p className="text-xs text-gray-400">Комментарий добавится в блок задач каждого сотрудника.</p>
                  </section>
                </div>

                {selectedEmployeeList.length > 0 && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">Выбранные сотрудники</p>
                      <span className="text-xs text-gray-500">Всего: {selectedEmployeeList.length}</span>
                    </div>
                    <ul className="space-y-1 max-h-40 overflow-y-auto">
                      {selectedEmployeeList.map((emp) => (
                        <li key={emp.id} className="flex items-center justify-between gap-3">
                          <span>{emp.personalInfo.lastName} {emp.personalInfo.firstName}</span>
                          <span className="text-xs text-gray-500">{emp.workInfo.team.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {matrixSummary.length > 0 && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 space-y-2">
                    <p className="font-medium">Предстоящие изменения</p>
                    <ul className="list-disc list-inside space-y-1">
                      {matrixSummary.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleBulkEditClose}
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
          </div>
        </div>
      )}

      {/* Column settings drawer */}
      {showColumnSettings && (
        <div className="fixed inset-0 z-40 bg-black/40 flex" onClick={closeColumnSettings}>
          <div
            ref={columnSettingsRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="column-settings-heading"
            aria-describedby="column-settings-description"
            className="ml-auto h-full w-full max-w-sm bg-white shadow-xl flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeColumnSettings}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Вернуться к списку сотрудников"
                >
                  ←
                </button>
                <h3 id="column-settings-heading" className="text-base font-semibold text-gray-900">Настройка отображения</h3>
              </div>
              <button
                type="button"
                onClick={closeColumnSettings}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть настройки отображения"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-3 border-b border-gray-100">
              <p id="column-settings-description" className="text-sm text-gray-500">
                Выберите поля для отображения в таблице сотрудников.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {COLUMN_ORDER.map((column) => (
                <label key={column.key} className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500"
                    checked={columnVisibility[column.key]}
                    onChange={() => toggleColumn(column.key)}
                  />
                  <span>{column.label}</span>
                </label>
              ))}
              <button
                type="button"
                onClick={() =>
                  setColumnVisibility({
                    fio: true,
                    position: true,
                    orgUnit: true,
                    team: true,
                    scheme: true,
                    hourNorm: true,
                    status: true,
                    hireDate: true,
                  })
                }
                className="text-sm text-blue-600 hover:underline"
              >
                Восстановить по умолчанию
              </button>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={closeColumnSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag manager */}
      {showTagManager && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={closeTagManager}>
          <div
            ref={tagManagerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tag-manager-heading"
            aria-describedby="tag-manager-description"
            className="bg-white rounded-xl max-w-lg w-full shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 id="tag-manager-heading" className="text-lg font-semibold text-gray-900">Управление тегами</h3>
                <p id="tag-manager-description" className="text-sm text-gray-500">См. Appendix 6 — Tag Import Template</p>
              </div>
              <button
                type="button"
                onClick={closeTagManager}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть управление тегами"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Сотрудников выделено: <span className="font-medium">{selectedEmployees.size}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {MATRIX_ACTIONS.map((action) => (
                    <button
                      key={`tag-action-${action}`}
                      type="button"
                      onClick={() => {
                        setTagAction(action);
                        setTagError(null);
                        if (action !== 'remove') {
                          setSelectedTagNames((prev) => prev.slice(0, MAX_TAGS_PER_EMPLOYEE));
                        }
                      }}
                      className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        tagAction === action ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                      aria-pressed={tagAction === action}
                    >
                      {MATRIX_ACTION_LABELS[action]}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500" aria-live="polite">
                {tagAction === 'add' && `Добавление новых тегов не превысит лимит в ${MAX_TAGS_PER_EMPLOYEE} на сотрудника.`}
                {tagAction === 'replace' && 'Новый набор заменит текущие теги выбранных сотрудников.'}
                {tagAction === 'remove' && 'Отметьте теги, которые нужно снять у сотрудников.'}
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название тега</label>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(event) => {
                      setNewTagName(event.target.value);
                      if (tagCreationError) {
                        setTagCreationError(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Например: VIP"
                  />
                </div>
                <div>
                  <span className="block text-xs uppercase font-semibold text-gray-500 mb-2">Цвет</span>
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLOR_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTagColor(color)}
                        className={`w-7 h-7 rounded-full border transition-shadow ${
                          newTagColor === color ? 'border-blue-600 ring-2 ring-blue-300' : 'border-transparent hover:ring-2 hover:ring-blue-200'
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
                    onClick={handleCreateTag}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Создать тег
                  </button>
                  {tagCreationError && (
                    <span className="text-xs text-red-600" role="alert">
                      {tagCreationError}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Доступные теги</p>
                <div className="max-h-64 overflow-auto space-y-2">
                  {Object.entries(tagCatalog).length === 0 ? (
                    <p className="text-sm text-gray-500">Пока нет тегов — создайте новый, чтобы назначить сотрудникам.</p>
                  ) : (
                    Object.entries(tagCatalog).map(([tag, color]) => {
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
                    })
                  )}
                </div>
              </div>

              {selectedTags.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 space-y-2">
                  <p className="font-semibold text-gray-700">У выбранных сотрудников уже есть</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => {
                      const swatch = tagCatalog[tag] ?? getColorForTag(tag);
                      return (
                        <span
                          key={`selected-${tag}`}
                          className="px-2 py-1 rounded-full border border-gray-200 text-xs font-medium"
                          style={{ backgroundColor: `${swatch}20`, color: '#1f2937' }}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {tagError && (
                <p className="text-xs text-red-600" role="alert">
                  {tagError}
                </p>
              )}

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-700">Подсказка</p>
                <p>• Указывайте краткие теги (направление, уровень навыков, график).</p>
                <p>• Для массового назначения выберите действие и отметьте до четырёх тегов.</p>
                <p>• Созданные теги доступны всем сотрудникам и могут быть импортированы.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeTagManager}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleApplyTags}
                disabled={selectedEmployees.size === 0}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedEmployees.size === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Применить изменения
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={closeImportModal}>
          <div
            ref={importModalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-modal-heading"
            aria-describedby="import-modal-description"
            className="bg-white rounded-xl max-w-xl w-full shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 id="import-modal-heading" className="text-lg font-semibold text-gray-900">{importHeading}</h3>
                <p id="import-modal-description" className="text-sm text-gray-500">
                  {importMeta?.appendix ? `Шаблон: ${importMeta.appendix}` : 'Подготовьте файл перед загрузкой'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeImportModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть импорт"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm text-gray-700">
              <p className="text-gray-500">Выбран раздел: <span className="font-medium text-gray-700">{importContext}</span></p>
              <ol className="list-decimal list-inside space-y-1">
                {importGuidance.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
              <button
                type="button"
                onClick={handleImportClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Выбрать файл
              </button>
              {importFeedback && (
                <p className="text-sm text-blue-700" role="status" aria-live="polite">
                  {importFeedback}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={closeExportModal}>
          <div
            ref={exportModalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-modal-heading"
            aria-describedby="export-modal-description"
            className="bg-white rounded-xl max-w-xl w-full shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 id="export-modal-heading" className="text-lg font-semibold text-gray-900">{exportMetaForView.heading}</h3>
                <p id="export-modal-description" className="text-sm text-gray-500">
                  {exportMetaForView.description || 'Скачать данные в формате CSV'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeExportModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть экспорт"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm text-gray-700">
              <p className="text-gray-500">Формат: <span className="font-medium text-gray-700">{exportContext}</span></p>
              <p>
                Экспорт формирует CSV-файл в соответствии с выбранными колонками и активными фильтрами.
                Формат соответствует Appendix 1, чтобы можно было исправить данные и загрузить обратно.
              </p>
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Скачать CSV
              </button>
              {exportFeedback && (
                <p className="text-sm text-blue-700" role="status" aria-live="polite">
                  {exportFeedback}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <EmployeeEditDrawer
        employee={activeEmployee}
        isOpen={Boolean(activeEmployee)}
        mode="edit"
        isLoading={isDrawerLoading}
        onClose={handleDrawerClose}
        onSave={handleDrawerSave}
        onDismiss={handleDismissEmployee}
        onRestore={handleRestoreEmployee}
      />
    </>
  );
};

export default EmployeeListContainer;
