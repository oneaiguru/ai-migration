## Metadata
- **Plan ID**: 2025-10-10_phase-7-minisearch
- **Status**: Ready for execution once `plans/2025-10-13_component-library-polish.plan.md` is archived
- **Owner Role**: Executor
- **Related Docs**: `docs/Tasks/phase-7-component-library-followups.md`, `docs/Tasks/phase-7-component-library-discovery.md`, `docs/System/parity-roadmap.md`, `docs/Tasks/phase-7-charts-discovery.md`, `ai-docs/llm-reference/AiDocsReference.md`, `ai-docs/reference/snippets/minisearch/basic-search.ts`

## Desired End State
- Employee list search uses a MiniSearch index for fuzzy and prefix matching without regressing existing filters or sorting.
- Search hits receive consistent highlighting metadata; Storybook demos showcase the behaviour and the hook exposes the search summary for future consumers.
- Unit and Playwright tests cover the new search utilities and UI flow, and documentation (follow-ups, discovery notes, parity roadmap, AI-doc references) reflects the shipped feature.

### Key Discoveries
- `docs/Tasks/phase-7-component-library-followups.md:20-33` – Search upgrade remains listed as a Phase 7 feature gap; documentation currently (incorrectly) shows it as complete.
- `docs/Tasks/phase-7-charts-discovery.md:55-85` – Scout notes describe current `Array.filter` limitations and reference the MiniSearch snippet requirements.
- `src/components/EmployeeList/useEmployeeListState.tsx:665-747` – Existing search uses simple substring filtering and sorts oblivious to relevance.
- `src/components/EmployeeList/Filters.tsx:60-88` – Search input forwards directly to `handleFilterChange` with no data attributes for testing.
- `tests/employee-list.spec.ts:200-260` – Playwright suite lacks coverage for search flows.
- `ai-docs/reference/snippets/minisearch/basic-search.ts:1-29` – Reference MiniSearch configuration to adapt for production.

## What We're NOT Doing
- Implementing dashboard charts (deferred to Phase 9) or altering performance metrics code.
- Touching rich-text editor, CSV/Excel helpers, or virtualization benchmarks delivered in the component-library polish plan.
- Changing backend APIs or the employee data schema.
- Refactoring selection/bulk-edit flows beyond exposing search metadata.

## Implementation Approach
Re-use Scout findings to introduce a dedicated MiniSearch helper, wire it into the employee list hook for filtering and ranking, and surface testable metadata. Extend Storybook and automated tests to cover the new behaviour, then align documentation/AI references. All commands below follow the sed-friendly template (mix of `apply_patch` and `cat`) and are idempotent.

## Phase 1: MiniSearch Infrastructure

### Overview
Add the MiniSearch dependency and provide reusable helpers plus unit coverage so future modules can share the search layer.

### Changes Required:

#### 1. Register MiniSearch dependency
**File**: `package.json`
**Changes**: Add `minisearch` to runtime dependencies (keep alphabetical ordering with other libraries).

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: package.json
@@
-    "lucide-react": "^0.263.1",
+    "lucide-react": "^0.263.1",
+    "minisearch": "^6.1.0",
     "papaparse": "^5.4.1",
*** End Patch
PATCH
```

```bash
npm install minisearch@^6.1.0
```

#### 2. Author MiniSearch helper module
**File**: `src/utils/search.ts`
**Changes**: New module normalising employee data, creating a MiniSearch index, and returning ranked summaries.

```bash
cat <<'EOF' > src/utils/search.ts
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
