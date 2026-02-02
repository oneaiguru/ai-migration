## Metadata
- **Task**: Phase 7 – Component library stabilization (docs, Storybook, smoke tests, export validation, follow-up scheduling)
- **Discovery**: docs/Tasks/phase-7-component-library-discovery.md
- **Task Brief**: docs/Tasks/phase-7-component-library-task.md
- **Supporting ADR/PRD**: docs/ADR/0002-wrapper-layer-ownership.md, docs/Tasks/06_phase-6-migration-planning-prd.md
- **AI-Docs References**: ai-docs/llm-reference/AiDocsReference.md, ai-docs/wrappers-draft/ui/Dialog.tsx, ai-docs/wrappers-draft/form/FormField.tsx, ai-docs/wrappers-draft/data/DataTable.tsx, ai-docs/playground/src/examples/table-demo/TableDemo.tsx
- **Target Areas**: src/wrappers/ui/Dialog.tsx, src/components/common/Overlay.tsx, src/wrappers/ui/Button.tsx & button.css, src/wrappers/form/FormField.tsx, src/wrappers/form/EmployeeForm.tsx, src/wrappers/data/DataTable.tsx, src/wrappers indices, new wrapper READMEs, Storybook config & stories, wrapper unit tests, docs/System/* updates, ai-docs/llm-reference/AiDocsReference.md, follow-up task doc & plan stub

## Desired End State
- Wrapper APIs (`Dialog`, `Overlay`, `Button`, `FormField`, `EmployeeForm`, `DataTable`) carry inline documentation, stable exports, and README guidance matching production behaviour (title/description hiding, keyboard nav, aria wiring).
- Storybook (Vite-powered) ships with live examples for key wrappers, enabling parity demos without booting the main app.
- Wrapper smoke tests (Vitest + Testing Library) assert primary behaviours (aria contract, button variants, form submission, DataTable event payload), reaching ≥80% coverage for the new suite.
- Scripts (`npm run storybook`, `npm run storybook:build`, `npm run test:unit`, `npm run typecheck`) exist and succeed; existing Playwright slice and `npm run build` remain green.
- System docs (`project-structure`, `parity-roadmap`) and AI docs reference the new assets; follow-up work (EmployeeListContainer split, chart/search enhancements, NVDA defer) captured in a dedicated task doc and plan stub.

### Key Discoveries
- Dialog wrapper already exposes `titleHidden`/`descriptionHidden` and close guards but lacks documentation (`src/wrappers/ui/Dialog.tsx:21-276`).
- Overlay re-wraps Dialog with `titleHidden` props yet provides no usage guidance (`src/components/common/Overlay.tsx:1-87`).
- Button wrapper variants map to CSS tokens without docs or Storybook coverage (`src/wrappers/ui/Button.tsx:1-47`, `src/wrappers/ui/button.css:1-82`).
- FormField + EmployeeForm wire hint IDs but require docs/tests for aria contracts (`src/wrappers/form/FormField.tsx:1-99`, `src/wrappers/form/EmployeeForm.tsx:1-134`).
- DataTable handles virtualization, keyboard nav, and row context but needs README, stories, and unit tests ensuring `onRowClick` receives `{ row, index, event }` (`src/wrappers/data/DataTable.tsx:37-458`).
- EmployeeListContainer still hosts toolbar/table/bulk-edit monolith requiring future split (`src/components/EmployeeListContainer.tsx:863-1120`, `src/components/EmployeeListContainer.tsx:2209-2570`).
- Playwright suite depends on `data-testid` attributes the wrapper must preserve (`tests/employee-list.spec.ts:1-120`).
- Discovery + AI review call out missing Storybook/tests and request follow-up refactors (`docs/Tasks/phase-7-component-library-discovery.md:7-34`, `ai-docs/llm-reference/AiDocsReference.md:1-66`).

## What We're NOT Doing
- No redesign of wrapper visual styles beyond documentation/examples.
- No behavioural changes to EmployeeListContainer logic beyond documenting follow-up refactor tasks.
- No publication of a standalone npm package; wrappers remain local per ADR 0002.
- No NVDA/VoiceOver execution (deferred to later phase per discovery).

## Implementation Approach
Bootstrap documentation first so Storybook/tests have authoritative copy, then layer Storybook examples and Vitest smoke tests leveraging those docs. Update barrel exports/scripts alongside new tooling, refresh system/AI docs, and capture larger refactors as a follow-up plan for future agents. Maintain idempotent commands (`apply_patch`, `cat >`) and reuse existing token utilities for styles.

## Phase 1: Wrapper Documentation & AI-Docs Alignment

### Overview
Provide README coverage, inline TSDoc comments, and AI-doc updates so future users understand wrapper props and behaviours.

### Changes Required:

#### 1. Document UI wrappers
**File**: `src/wrappers/ui/README.md`
**Changes**: Replace placeholder content with detailed guidance covering Dialog/Overlay hidden titles, Button variants, testing notes, and Storybook link.

```bash
cat <<'EOF' > src/wrappers/ui/README.md
# UI Wrapper Library

Shared UI facades live here to unify Radix-based overlays and button styling. Keep this document in sync with Storybook so downstream teams reuse the same contract.

## Exports
- `Dialog`, `DialogTrigger`, `DialogClose`, `DialogTitle`, `DialogDescription`
- `Overlay` (high-level Dialog façade used across Employee Management)
- `Button`
- `Popover` (experimental; document separately when hardened)

## Dialog & Overlay
- `titleHidden` / `descriptionHidden` replace the visual heading/description with `VisuallyHidden` nodes but keep announcements intact (`src/wrappers/ui/Dialog.tsx`).
- `preventClose`, `closeOnOverlayClick`, and `closeOnEscape` coordinate to guard bulk-edit drawers from accidental dismissal.
- `testId` applies to both overlay (`${testId}-overlay`) and content (`testId`) for Playwright parity.
- Use `ariaLabelledBy` / `ariaDescribedBy` when the visible heading lives inside the body (e.g., bulk-edit sheets).

### Usage
```tsx
<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Редактирование сотрудника"
  description="Измените статус или тег"
  titleHidden
  descriptionHidden
  trigger={<Button>Открыть</Button>}
>
  <EmployeeForm onSubmit={handleSubmit} />
</Dialog>
```

## Button
- Variants: `primary`, `secondary`, `ghost`, `danger` (`src/wrappers/ui/button.css`).
- Sizes: `sm`, `md`, `icon`; combine with `fullWidth` for responsive layouts.
- Focus ring handled via CSS tokens; avoid overriding without updating tokens.

### Usage
```tsx
<Button variant="ghost" size="sm" onClick={handleReset}>
  Сбросить фильтры
</Button>
```

## Testing Notes
- `data-testid` support is opt-in via props (Dialog/Overlay) or barrel exports (Button).
- Playwright selectors expect `employee-table-row`, `employee-row-checkbox`, etc.; keep `testId` wiring intact when cloning examples.
- Wrapper smoke tests live under `src/wrappers/__tests__/` and should remain ≥80% coverage.

## Storybook
Use `npm run storybook` to open interactive examples. Keep README and stories aligned whenever props change.
EOF
```

#### 2. Add form wrapper README
**File**: `src/wrappers/form/README.md`
**Changes**: Create new README describing FormField, EmployeeForm, aria wiring, and validation pattern.

```bash
cat <<'EOF' > src/wrappers/form/README.md
# Form Wrapper Library

React Hook Form + Zod wrappers centralise validation and accessibility glue used across Employee Management.

## Exports
- `FormField`
- `formFieldAriaProps`
- `EmployeeForm`

## FormField
- Generates a stable `fieldId` with `useId` when none is supplied.
- Emits `hintId` / `errorId` so children can wire `aria-describedby` via `formFieldAriaProps`.
- `required` flag appends an asterisk but leaves screen-reader announcement to native validation text.

### Usage
```tsx
const field = formFieldAriaProps({
  controlId: 'employee-email',
  hasError: Boolean(errors.email),
  errorId: errors.email ? 'employee-email-error' : undefined,
});

<FormField label="Email" required fieldId={field.id} error={errors.email}>
  <input type="email" {...register('email')} {...field} />
</FormField>
```

## EmployeeForm
- Demonstrates RHF + Zod integration for login/email/status.
- Emits `onSubmit` callback with parsed schema values.
- Ships with baseline tokens for inputs so consumers inherit spacing/typography tokens.

## Testing
- Smoke tests (`EmployeeForm.test.tsx`) assert validation errors and submit behaviour.
- When composing new forms, reuse `formFieldAriaProps` to keep aria wiring consistent.
EOF
```

#### 3. Add data wrapper README
**File**: `src/wrappers/data/README.md`
**Changes**: New README covering DataTable props, virtualization expectations, keyboard navigation, and testing contract.

```bash
cat <<'EOF' > src/wrappers/data/README.md
# Data Wrapper Library – DataTable

TanStack Table + Virtual facade used for Employee Management list views.

## Props
- `data`, `columns` – forwarded to `useReactTable` (see TanStack docs).
- `rowHeight` (default 48) and `height` control the virtualizer viewport.
- `onRowClick`, `onRowKeyDown`, `onRowFocus` receive `{ row, index, event }` context.
- `getRowProps` lets consumers add selection classes/test IDs; remember to pass through `className`, `onClick`, and `style`.
- `enableKeyboardNavigation` toggles arrow/home/end shortcuts and Enter activation.

## Accessibility
- Rows expose `tabIndex` and `aria-rowindex`; `scheduleRowFocus` keeps focus stable as items mount/unmount.
- Header buttons announce sort order via `aria-sort` and inline icons (↑ / ↓).

## Testing
- Playwright relies on `data-testid="employee-table"` and `data-row-index` attributes.
- Unit tests (`DataTable.test.tsx`) assert `onRowClick` payloads and Enter key behaviour.

## Examples
See Storybook stories (`DataTable.stories.tsx`) for sortable/searchable table variants and virtualization tips (overscan, sticky headers).
EOF
```

#### 4. Annotate wrappers with TSDoc
**Files**: `src/wrappers/ui/Dialog.tsx`, `src/components/common/Overlay.tsx`, `src/wrappers/ui/Button.tsx`, `src/wrappers/form/FormField.tsx`, `src/wrappers/form/EmployeeForm.tsx`, `src/wrappers/data/DataTable.tsx`
**Changes**: Add concise JSDoc/TSDoc comments above exported components to surface props in IDE/Storybook docs.

```bash
apply_patch <<'EOF'
*** Begin Patch
*** Update File: src/wrappers/ui/Dialog.tsx
@@
-export function Dialog({
+/**
+ * Accessible modal/sheet wrapper around Radix Dialog with tokenised styling and
+ * optional hidden title/description support for overlay designs.
+ */
+export function Dialog({
*** End Patch
EOF
```

```bash
apply_patch <<'EOF'
*** Begin Patch
*** Update File: src/components/common/Overlay.tsx
@@
-export function Overlay({
+/**
+ * High-level Dialog façade used across Employee Management overlays. Handles
+ * sheet/modal variants and wires title/description visibility flags automatically.
+ */
+export function Overlay({
*** End Patch
EOF
```

```bash
apply_patch <<'EOF'
*** Begin Patch
*** Update File: src/wrappers/ui/Button.tsx
@@
-export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
+/**
+ * Token-aware button wrapper with variant/size presets matching the Employee Management UI kit.
+ */
+export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
*** End Patch
EOF
```

```bash
apply_patch <<'EOF'
*** Begin Patch
*** Update File: src/wrappers/form/FormField.tsx
@@
-export function FormField({
+/**
+ * Label + hint/error wrapper that wires aria attributes and spacing tokens for RHF forms.
+ */
+export function FormField({
*** End Patch
EOF
```

```bash
apply_patch <<'EOF'
*** Begin Patch
*** Update File: src/wrappers/form/EmployeeForm.tsx
@@
-export function EmployeeForm({ onSubmit, testId }: EmployeeFormProps) {
+/**
+ * Reference implementation of an employee credentials form using RHF + Zod and shared tokens.
+ */
+export function EmployeeForm({ onSubmit, testId }: EmployeeFormProps) {
*** End Patch
EOF
```

```bash
apply_patch <<'EOF'
*** Begin Patch
*** Update File: src/wrappers/data/DataTable.tsx
@@
-export function DataTable<TData>({
+/**
+ * Virtualised data grid built on TanStack Table + Virtual with keyboard navigation
+ * and row event hooks tailored for Employee Management list views.
+ */
+export function DataTable<TData>({
*** End Patch
EOF
```

#### 5. Export Button via UI barrel
**File**: `src/wrappers/ui/index.ts`
**Changes**: Re-export Button so consumers import from `@wrappers/ui` consistently.

```bash
apply_patch <<'EOF'
*** Begin Patch
*** Update File: src/wrappers/ui/index.ts
@@
-export * from './Dialog';
-export * from './Popover';
+export * from './Dialog';
+export * from './Button';
+export * from './Popover';
*** End Patch
EOF
```

#### 6. Sync AI-doc reference summary
**File**: `ai-docs/llm-reference/AiDocsReference.md`
**Changes**: Append Storybook/docs/test expectations so planners see the new requirements.

```bash
apply_patch <<'EOF'
*** Begin Patch
*** Update File: ai-docs/llm-reference/AiDocsReference.md
@@
 ## 5. Follow-up Suggestions
 - Update `ai-docs/wrappers-draft/data/DataTable.tsx` to reflect production prop shape (context object, keyboard navigation hooks, virtualization config).
 - Add explicit docs in `wrappers-draft/README.md` about `ColumnDef.meta` expectations and test id mappings for Playwright.
 - Extend playground with selection scenario to validate virtualization+checkbox interplay.
+- Storybook coverage and Vitest smoke tests are now mandatory before wrappers graduate from experimental; see `src/wrappers/__tests__` and `.storybook` config once synced back.
*** End Patch
EOF
```

## Phase 2: Storybook Setup & Wrapper Examples

### Overview
Install Storybook (React + Vite), add configuration, and author stories for Dialog, Button, EmployeeForm, and DataTable to mirror production patterns.

### Changes Required:

#### 1. Add Storybook dependencies & scripts
**File**: `package.json`
**Changes**: Add Storybook packages, unit-test tooling scripts, and helper commands.

```bash
apply_patch <<'EOF'
*** Begin Patch
*** Update File: package.json
@@
-    "dev": "vite",
-    "build": "vite build",
-    "preview": "vite preview",
-    "start": "npm run dev",
-    "test": "playwright test"
+    "dev": "vite",
+    "build": "vite build",
+    "preview": "vite preview",
+    "start": "npm run dev",
+    "test": "playwright test",
+    "test:unit": "vitest run",
+    "storybook": "storybook dev -p 6006",
+    "storybook:build": "storybook build",
+    "typecheck": "tsc --noEmit"
   },
@@
-  "devDependencies": {
-    "@playwright/test": "^1.55.1",
-    "@types/react": "^18.2.0",
-    "@types/react-dom": "^18.2.0",
-    "@vitejs/plugin-react": "^4.4.1",
-    "autoprefixer": "^10.4.14",
-    "postcss": "^8.4.21",
-    "tailwindcss": "^3.2.7",
-    "typescript": "~5.8.3",
-    "vite": "^6.3.5"
-  }
+  "devDependencies": {
+    "@playwright/test": "^1.55.1",
+    "@storybook/addon-a11y": "^8.1.0",
+    "@storybook/addon-essentials": "^8.1.0",
+    "@storybook/addon-links": "^8.1.0",
+    "@storybook/react": "^8.1.0",
+    "@storybook/react-vite": "^8.1.0",
+    "@storybook/test": "^8.1.0",
+    "@testing-library/jest-dom": "^6.4.2",
+    "@testing-library/react": "^14.2.1",
+    "@testing-library/user-event": "^14.5.1",
+    "@types/react": "^18.2.0",
+    "@types/react-dom": "^18.2.0",
+    "@vitejs/plugin-react": "^4.4.1",
+    "autoprefixer": "^10.4.14",
+    "jsdom": "^24.1.0",
+    "postcss": "^8.4.21",
+    "storybook": "^8.1.0",
+    "tailwindcss": "^3.2.7",
+    "typescript": "~5.8.3",
+    "vite": "^6.3.5",
+    "vitest": "^1.6.0"
+  }
 }
*** End Patch
EOF
```

#### 2. Add Storybook config
**Files**: `.storybook/main.ts`, `.storybook/preview.ts`
**Changes**: Create configuration for Storybook with essential addons and docs controls.

```bash
cat <<'EOF' > .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) => {
    config.define = { ...(config.define ?? {}), __STORYBOOK__: true };
    return config;
  },
};

export default config;
EOF
```

```bash
cat <<'EOF' > .storybook/preview.ts
import type { Preview } from "@storybook/react";
import "../src/wrappers/ui/button.css";
import "../src/styles/global.css"; // adjust/remove if the project uses a different global stylesheet

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    backgrounds: {
      default: "surface",
      values: [
        { name: "surface", value: "#ffffff" },
        { name: "muted", value: "#f1f5f9" }
      ],
    },
    a11y: {
      element: "#storybook-root",
      config: {},
      options: {},
      manual: false,
    },
  },
};

export default preview;
EOF
```

#### 3. Author Dialog stories
**File**: `src/wrappers/ui/Dialog.stories.tsx`
**Changes**: Create stories for modal/sheet variants highlighting hidden title logic.

```bash
cat <<'EOF' > src/wrappers/ui/Dialog.stories.tsx
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";

const meta: Meta<typeof Dialog> = {
  title: "Wrappers/UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Редактирование сотрудника",
    description: "Обновите данные и сохраните изменения",
    children: <div style={{ minWidth: 360 }}>Содержимое модального окна</div>,
    footer: (
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <Button variant="ghost">Отмена</Button>
        <Button variant="primary">Сохранить</Button>
      </div>
    ),
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["modal", "sheet"],
    },
    size: {
      control: { type: "radio" },
      options: ["sm", "md", "lg"],
    },
    titleHidden: { control: "boolean" },
    descriptionHidden: { control: "boolean" },
  },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <Dialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        trigger={<Button onClick={() => setOpen(true)}>Открыть</Button>}
      />
    );
  },
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Modal: Story = { args: { variant: "modal", titleHidden: false, descriptionHidden: false } };
export const SheetHiddenHeading: Story = {
  args: {
    variant: "sheet",
    titleHidden: true,
    descriptionHidden: true,
  },
};
EOF
```

#### 4. Author Button stories
**File**: `src/wrappers/ui/Button.stories.tsx`
**Changes**: Showcase variants/sizes with controls.

```bash
cat <<'EOF' > src/wrappers/ui/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Wrappers/UI/Button",
  component: Button,
  parameters: {
    controls: { expanded: true },
  },
  args: {
    children: "Кнопка",
    variant: "primary",
    size: "md",
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["primary", "secondary", "ghost", "danger"],
    },
    size: {
      control: { type: "radio" },
      options: ["sm", "md", "icon"],
    },
    fullWidth: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const Icon: Story = {
  args: {
    size: "icon",
    children: "🔍",
    "aria-label": "Поиск",
  },
};
EOF
```

#### 5. Author EmployeeForm story
**File**: `src/wrappers/form/EmployeeForm.stories.tsx`
**Changes**: Provide controlled submission example.

```bash
cat <<'EOF' > src/wrappers/form/EmployeeForm.stories.tsx
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { EmployeeForm, type EmployeeFormValues } from "./EmployeeForm";

const meta: Meta<typeof EmployeeForm> = {
  title: "Wrappers/Form/EmployeeForm",
  component: EmployeeForm,
};

export default meta;

type Story = StoryObj<typeof EmployeeForm>;

export const Default: Story = {
  render: (args) => {
    const [submitted, setSubmitted] = useState<EmployeeFormValues | null>(null);
    return (
      <div style={{ minWidth: 360, display: "grid", gap: 16 }}>
        <EmployeeForm
          {...args}
          onSubmit={(values) => {
            setSubmitted(values);
          }}
        />
        <pre style={{ background: "#f1f5f9", padding: 12, borderRadius: 8 }}>
          {submitted ? JSON.stringify(submitted, null, 2) : "Ожидается отправка"}
        </pre>
      </div>
    );
  },
};
EOF
```

#### 6. Author DataTable story
**File**: `src/wrappers/data/DataTable.stories.tsx`
**Changes**: Provide minimal dataset with selection hooks to demonstrate keyboard nav.

```bash
cat <<'EOF' > src/wrappers/data/DataTable.stories.tsx
import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";

interface DemoEmployee {
  id: string;
  name: string;
  team: string;
  status: string;
}

const demoData: DemoEmployee[] = Array.from({ length: 25 }).map((_, index) => ({
  id: `emp-${index + 1}`,
  name: `Сотрудник ${index + 1}`,
  team: index % 2 === 0 ? "Support" : "Sales",
  status: index % 3 === 0 ? "Активен" : "Испытательный",
}));

const meta: Meta<typeof DataTable<DemoEmployee>> = {
  title: "Wrappers/Data/DataTable",
  component: DataTable<DemoEmployee>,
  parameters: { layout: "fullscreen" },
  argTypes: {
    enableKeyboardNavigation: { control: "boolean" },
    rowHeight: { control: { type: "number", min: 32, max: 96, step: 4 } },
  },
};

export default meta;

type Story = StoryObj<typeof DataTable<DemoEmployee>>;

export const Default: Story = {
  render: (args) => {
    const columns = useMemo<ColumnDef<DemoEmployee>[]>(
      () => [
        {
          header: "ФИО",
          accessorKey: "name",
          meta: {
            headerStyle: { flex: "2 0 200px" },
            cellStyle: { flex: "2 0 200px" },
          },
        },
        {
          header: "Команда",
          accessorKey: "team",
        },
        {
          header: "Статус",
          accessorKey: "status",
        },
      ],
      []
    );
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
      <div style={{ height: 380 }}>
        <DataTable
          {...args}
          data={demoData}
          columns={columns}
          height={320}
          rowHeight={48}
          testId="storybook-table"
          onRowClick={({ row }) => setSelectedId(row.original.id)}
          getRowProps={({ row }) => ({
            className: row.original.id === selectedId ? "bg-blue-50" : undefined,
          })}
        />
      </div>
    );
  },
  args: {
    enableKeyboardNavigation: true,
  },
};
EOF
```

## Phase 3: Wrapper Smoke Tests (Vitest + Testing Library)

### Overview
Introduce Vitest configuration and component-level smoke tests validating wrapper contracts.

### Changes Required:

#### 1. Configure Vitest in Vite config
**File**: `vite.config.ts`
**Changes**: Import `configDefaults` and add `test` block with jsdom setup.

```bash
apply_patch <<'EOF'
*** Begin Patch
*** Update File: vite.config.ts
-import { defineConfig } from 'vite'
-import react from '@vitejs/plugin-react'
+import { defineConfig } from 'vite';
+import react from '@vitejs/plugin-react';
+import { configDefaults } from 'vitest/config';
 
-export default defineConfig({
-  plugins: [react()],
-  base: './',
-  build: {
-    outDir: 'dist',
-    assetsDir: 'assets'
-  },
-  server: {
-    port: 3004,
-    host: '0.0.0.0'
-  }
-})
+export default defineConfig({
+  plugins: [react()],
+  base: './',
+  build: {
+    outDir: 'dist',
+    assetsDir: 'assets'
+  },
+  server: {
+    port: 3004,
+    host: '0.0.0.0'
+  },
+  test: {
+    globals: true,
+    environment: 'jsdom',
+    setupFiles: './src/test/setup-tests.ts',
+    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
+    exclude: [...configDefaults.exclude, 'playwright.config.ts'],
+    coverage: {
+      reporter: ['text', 'lcov'],
+    },
+  },
+});
*** End Patch
EOF
```

#### 2. Add Vitest setup file
**File**: `src/test/setup-tests.ts`
**Changes**: Initialise Testing Library matchers.

```bash
mkdir -p src/test
cat <<'EOF' > src/test/setup-tests.ts
import '@testing-library/jest-dom/vitest';
EOF
```

#### 3. Add Dialog tests
**File**: `src/wrappers/__tests__/Dialog.test.tsx`
**Changes**: Verify hidden heading and onOpenChange behaviour.

```bash
mkdir -p src/wrappers/__tests__
cat <<'EOF' > src/wrappers/__tests__/Dialog.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

const dialogBody = <div>Содержимое</div>;

describe('Dialog wrapper', () => {
  it('announces hidden title via aria-labelledby', () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog
        open
        onOpenChange={onOpenChange}
        title="Редактирование сотрудника"
        description="Описание"
        titleHidden
        descriptionHidden
        footer={<Button>Сохранить</Button>}
      >
        {dialogBody}
      </Dialog>
    );

    const dialog = screen.getByRole('dialog', { name: 'Редактирование сотрудника' });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('prevents overlay close when preventClose is true', () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog
        open
        onOpenChange={onOpenChange}
        title="Редактирование"
        preventClose
      >
        {dialogBody}
      </Dialog>
    );

    const overlay = screen.getByTestId('undefined-overlay');
    fireEvent.pointerDown(overlay);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
EOF
```

#### 4. Add Button tests
**File**: `src/wrappers/__tests__/Button.test.tsx`
**Changes**: Ensure variant/size classes render.

```bash
cat <<'EOF' > src/wrappers/__tests__/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/Button';

describe('Button wrapper', () => {
  it('applies variant and size modifiers', () => {
    render(
      <Button variant="danger" size="sm">
        Удалить
      </Button>
    );
    const button = screen.getByRole('button', { name: 'Удалить' });
    expect(button.className).toContain('em-button--danger');
    expect(button.className).toContain('em-button--sm');
  });
});
EOF
```

#### 5. Add FormField tests
**File**: `src/wrappers/__tests__/FormField.test.tsx`
**Changes**: Assert hint and error IDs.

```bash
cat <<'EOF' > src/wrappers/__tests__/FormField.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField, formFieldAriaProps } from '../form/FormField';

describe('FormField wrapper', () => {
  it('links hint via aria-describedby', () => {
    const props = formFieldAriaProps({ controlId: 'login', hasError: false });
    render(
      <FormField label="Логин" hint="Минимум 4 символа" fieldId={props.id}>
        <input aria-describedby={props['aria-describedby']} />
      </FormField>
    );

    const hint = screen.getByText('Минимум 4 символа');
    expect(hint).toHaveAttribute('id', 'login-hint');
  });
});
EOF
```

#### 6. Add EmployeeForm tests
**File**: `src/wrappers/__tests__/EmployeeForm.test.tsx`
**Changes**: Verify submission and validation messaging.

```bash
cat <<'EOF' > src/wrappers/__tests__/EmployeeForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeForm } from '../form/EmployeeForm';

describe('EmployeeForm wrapper', () => {
  it('submits valid values', async () => {
    const handleSubmit = vi.fn();
    render(<EmployeeForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText('Логин'), 'user123');
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.selectOptions(screen.getByLabelText('Статус'), ['trial']);
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      login: 'user123',
      email: 'user@example.com',
      status: 'trial',
    });
  });

  it('shows validation errors', async () => {
    const handleSubmit = vi.fn();
    render(<EmployeeForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText('Логин'), '123');
    await userEvent.type(screen.getByLabelText('Email'), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(await screen.findByText('Минимум 4 символа')).toBeVisible();
    expect(await screen.findByText('Некорректный email')).toBeVisible();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
EOF
```

#### 7. Add DataTable tests
**File**: `src/wrappers/__tests__/DataTable.test.tsx`
**Changes**: Ensure row events fire with context and Enter key triggers onRowClick.

```bash
cat <<'EOF' > src/wrappers/__tests__/DataTable.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../data/DataTable';

interface DemoRow {
  id: string;
  name: string;
}

const makeColumns = (): ColumnDef<DemoRow>[] => [
  {
    header: 'Имя',
    accessorKey: 'name',
  },
];

const rows: DemoRow[] = [
  { id: 'row-1', name: 'Алексей' },
  { id: 'row-2', name: 'Мария' },
];

describe('DataTable wrapper', () => {
  it('calls onRowClick with context', () => {
    const handleRowClick = vi.fn();
    render(
      <DataTable<DemoRow>
        data={rows}
        columns={makeColumns()}
        height={160}
        rowHeight={48}
        onRowClick={handleRowClick}
        getRowId={(row) => row.id}
      />
    );

    const rowButton = screen.getAllByRole('row')[1];
    fireEvent.click(rowButton);

    expect(handleRowClick).toHaveBeenCalled();
    const call = handleRowClick.mock.calls[0][0];
    expect(call.row.original.id).toBe('row-1');
    expect(call.index).toBe(0);
  });

  it('fires onRowClick when Enter is pressed', () => {
    const handleRowClick = vi.fn();
    render(
      <DataTable<DemoRow>
        data={rows}
        columns={makeColumns()}
        height={160}
        rowHeight={48}
        onRowClick={handleRowClick}
        getRowId={(row) => row.id}
      />
    );

    const firstRow = screen.getAllByRole('row')[1];
    firstRow.focus();
    fireEvent.keyDown(firstRow, { key: 'Enter' });

    expect(handleRowClick).toHaveBeenCalledOnce();
  });
});
EOF
```

## Phase 4: Export Validation & Follow-Up Planning

### Overview
Wrap up tooling scripts, update system docs, and capture deferred refactors (EmployeeListContainer split, chart/search improvements) for future agents.

### Changes Required:

#### 1. Update project structure doc
**File**: `docs/System/project-structure.md`
**Changes**: Mention `.storybook`, wrapper READMEs, test suite.

```bash
apply_patch <<'EOF'
*** Begin Patch
*** Update File: docs/System/project-structure.md
@@
 ├── docs/
 │   ├── SOP/
 │   ├── System/
 │   ├── Tasks/
 │   ├── AGENT_PARITY_REPORT.md
 │   ├── EMPLOYEE_MANAGEMENT_PARITY_PLAN.md
 │   ├── SCREENSHOT_INDEX.md
 │   ├── SESSION_HANDOFF.md
 │   ├── SESSION_SUMMARY.md
 │   ├── TODO_AGENT.md
 │   └── ENVIRONMENT_FIX_TODO.md
+├── .storybook/               # Storybook (Vite) config for wrapper demos
 ├── playwright.config.ts
 ├── src/
 │   ├── App.tsx
 │   ├── components/
@@
 │   │   └── demo-only modules (PhotoGallery, Performance, etc.)
 │   ├── hooks/
 │   ├── types/
 │   │   └── employee.ts
-│   └── utils/
-│       └── task.ts
+│   ├── utils/
+│   │   └── task.ts
+│   ├── wrappers/
+│   │   ├── ui/ (Dialog, Button, Popover + README)
+│   │   ├── form/ (FormField, EmployeeForm + README)
+│   │   └── data/ (DataTable + README)
+│   └── test/ (Vitest setup)
 ├── tests/
 │   └── employee-list.spec.ts
+└── src/wrappers/__tests__/   # Wrapper Vitest smoke tests
*** End Patch
EOF
```

#### 2. Update parity roadmap with Storybook/test milestone
**File**: `docs/System/parity-roadmap.md`
**Changes**: Note wrapper documentation & Storybook deliverables under Phase 7.

```bash
apply_patch <<'EOF'
*** Begin Patch
*** Update File: docs/System/parity-roadmap.md
@@
 Phase 7  ── Wrapper & Component Library Hardening
   │       • Stabilise shared wrappers (Dialog/Overlay, Button, FormField, EmployeeForm)
-  │       • Document imports/usage, add smoke tests, mark experimental DataTable usage
+  │       • Document imports/usage via README + Storybook, add wrapper smoke tests, mark experimental DataTable usage
   │       • Task reference: `docs/Tasks/phase-7-component-library-task.md`
*** End Patch
EOF
```

#### 3. Append planner notes to discovery doc
**File**: `docs/Tasks/phase-7-component-library-discovery.md`
**Changes**: Add section noting upcoming execution plan and follow-up docs.

```bash
apply_patch <<'EOF'
*** Begin Patch
*** Update File: docs/Tasks/phase-7-component-library-discovery.md
@@
 ## Next Steps for Planner
 - Author `plans/YYYY-MM-DD_component-library-stabilization.plan.md` that covers documentation (READMEs + Storybook), wrapper smoke tests, and extraction-friendly refactors.
 - Coordinate with Phase 6 cleanup task for documentation refresh to avoid duplication.
 - Leave charts/search work for dedicated feature plans once wrappers are hardened.
+
+## 2025-10-10 – Planner Prep Notes
+- Storybook + Vitest suites will be introduced to exercise wrappers before wider adoption.
+- Follow-up refactors (EmployeeListContainer split, analytics charts, MiniSearch) will be captured in `docs/Tasks/phase-7-component-library-followups.md` and a dedicated plan stub for future agents.
*** End Patch
EOF
```

#### 4. Record follow-up task doc
**File**: `docs/Tasks/phase-7-component-library-followups.md`
**Changes**: New doc enumerating deferred refactors (table split, chart/search, NVDA deferral).

```bash
cat <<'EOF' > docs/Tasks/phase-7-component-library-followups.md
# Phase 7 Follow-Ups – Component Library Stabilisation

Use this checklist after executing `plans/2025-10-10_component-library-stabilization.plan.md` to schedule remaining work.

## Outstanding Refactors
1. **EmployeeListContainer decomposition** – extract toolbar, filters, overlays, and virtualised table into `src/components/employee-list/{Toolbar,Table,BulkActions}` plus a `useEmployeeListState` hook. Target plan: `plans/2025-10-12_employee-list-refactor.plan.md`.
2. **Charts integration** – align `PerformanceMetricsView` with Tremor/Recharts docs (ai-docs/reference/snippets/tremor/performance-card.tsx, ai-docs/reference/snippets/recharts/basic-area-chart.tsx) and document shared chart wrapper expectations.
3. **Search enhancements** – evaluate MiniSearch adoption for large datasets (ai-docs/reference/snippets/minisearch/basic-search.ts) and note accessibility constraints.

## Accessibility Deferrals
- NVDA/VoiceOver sweep remains parked for Phase 8. Record blockers in `docs/Tasks/phase-6-cleanup-task.md` before closing Stage 7.

## Documentation Targets
- Update `docs/System/project-structure.md` and `docs/System/parity-roadmap.md` once follow-up plans land.
- Mirror production changes back into AI docs (`ai-docs/wrappers-draft/`, `AiDocsReference.md`).

Log progress in `docs/SESSION_HANDOFF.md` whenever an item is addressed.
EOF
```

#### 5. Stub future refactor plan
**File**: `plans/2025-10-12_employee-list-refactor.plan.md`
**Changes**: Create placeholder plan file noting reserved status for the EmployeeListContainer decomposition.

```bash
cat <<'EOF' > plans/2025-10-12_employee-list-refactor.plan.md
## Metadata
- **Status**: Draft (do not execute yet)
- **Objective**: Decompose `src/components/EmployeeListContainer.tsx` into modular toolbar/table/hooks and align tests/docs.
- **Inputs**: docs/Tasks/phase-7-component-library-followups.md, ai-docs/reference snippets for tables/search.

## Notes
- Author full plan once `plans/2025-10-10_component-library-stabilization.plan.md` executes and Storybook/tests are stable.
- Expected deliverables: `useEmployeeListState` hook, `EmployeeListToolbar` component, updated tests, refreshed docs.
EOF
```

## Tests & Validation
Run after completing all phases:

```bash
npm install
npm run build
npm run typecheck
npm run test:unit
npm run test -- --project=chromium --workers=1 --grep "Employee list"
npm run storybook:build
```

All commands must pass locally before handoff. Storybook build ensures example stories compile with Vite.

## Rollback
- To revert file changes: `git reset --hard HEAD && git clean -fd .storybook src/wrappers/__tests__ docs/Tasks/phase-7-component-library-followups.md plans/2025-10-12_employee-list-refactor.plan.md`.
- Remove newly installed node modules/deps if needed: restore `package.json` / `package-lock.json` via `git checkout -- package.json package-lock.json` and re-run `npm install`.

## Handoff
- Update `PROGRESS.md` Active Plan section: mark this plan _In Progress_ (or _Completed_ once executed) and note Storybook/unit-test scripts.
- Append execution summary (docs updated, tests run, Storybook build status) to `docs/SESSION_HANDOFF.md` with command log.
- Archive plan under `docs/Archive/Plans/executed/` after successful execution; move follow-up plan to active queue when ready.
- Ensure `docs/Tasks/phase-7-component-library-followups.md` reflects remaining work and that AI docs mirror production changes.
