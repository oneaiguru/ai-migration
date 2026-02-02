I'll analyze the migration planning PRD and the current codebase structure to provide comprehensive feedback on your proposed migration plan.

<thinking> Let me carefully examine the Phase 6 Migration Planning PRD and the current codebase to understand:

1. **Current State Analysis:**
   - The PRD shows a well-structured migration plan with 5 stages (0-5)
   - Current code uses bespoke overlays, hand-rolled modals, tables, and forms
   - Key files to migrate:
     - `EmployeeEditDrawer.tsx` - Uses custom focus trap, needs Radix Dialog
     - `EmployeeListContainer.tsx` - Hand-rolled table, needs TanStack Table + Virtual
     - `QuickAddEmployee.tsx` - Uses focus trap, needs form migration
     - Various other components with overlays and forms
2. **Migration Assets Available:**
   - `ai-docs/` workspace with:
     - `wrappers-draft/` containing prototype wrappers
     - `playground/` for testing
     - Documentation and checklists
     - Scripts for fetching docs
3. **Technology Stack to Adopt:**
   - Radix primitives for overlays (Dialog, Popover)
   - TanStack Table + Virtual for data tables
   - React Hook Form + Zod for forms/validation
   - dnd-kit for drag-drop (future)
   - Tremor for charts
   - MiniSearch for search
   - shadcn/ui (post Tailwind v4)
4. **Current Code Quality:** Looking at the provided files:
   - `EmployeeEditDrawer.tsx`: 700+ lines, uses `useFocusTrap`, manual state management, validation
   - `EmployeeListContainer.tsx`: 1000+ lines, complex state, manual table rendering, bulk operations
   - `QuickAddEmployee.tsx`: Simpler, but still uses focus trap
   - Forms use manual validation and state management
5. **Migration Concerns:**
   - **Accessibility**: Current code has focus traps, but needs NVDA/VoiceOver validation
   - **Bundle Size**: Need to monitor with targets (≤250KB initial, ≤40KB delta)
   - **Performance**: 10k row virtualization testing required
   - **Testing**: Playwright coverage needs updating with new data-testid attributes
   - **Rollback**: Rollback handled via branch-based deployments; no runtime flags planned
6. **Token System:**
   - Need `tokens/tokens.json` (DTCG format)
   - CSS variables with `--em-*` prefix
   - Theme helpers in `src/theme/`
   - Current structure shows some theme setup already exists
7. **Proposed Stage 0 Tasks:**
   - Review draft wrappers in `ai-docs/wrappers-draft/`
   - Align props with PRD requirements
   - Replace hard-coded values with theme vars
   - Complete accessibility checklist
   - Add Playwright smoke tests for playground
   - Ensure token sync
8. **Risk Assessment:**
   - **High Risk**: Table migration (most complex, 10k rows performance)
   - **Medium Risk**: Form migration (validation rules must be preserved exactly)
   - **Lower Risk**: Overlay migration (relatively straightforward with Radix)
   - **Critical**: Maintaining test coverage throughout
9. **Dependencies:**
   - Phase 5 must complete first (persistence, validation, NVDA sweep)
   - Design token contract must be finalized
   - All wrapper APIs must be agreed upon
   - Accessibility checklist must be complete before each stage
10. **Validation Strategy:**
    - Automated: build, lint, Playwright tests
    - Accessibility: NVDA + VoiceOver sweeps per stage
    - Visual: Screenshot comparison
    - Performance: Bundle size and virtualization metrics

The agent's proposed approach is sound. Stage 0 is the right starting point. However, I should provide detailed analysis of:

1. What needs to be reviewed in each wrapper
2. Specific accessibility checkpoints
3. How to structure the token system
4. What Playwright tests are needed
5. Potential issues in each migration stage </thinking>

# Migration Plan Analysis & Recommendations

Your proposed migration plan is **well-structured and follows the PRD closely**. Starting with Stage 0 is the correct approach. Let me provide detailed analysis and recommendations for each stage.

## ✅ Stage 0 Assessment: Wrapper Hardening & Tokens

### Current Wrapper Draft Review Needed

Based on the PRD and codebase, here's what needs checking in `ai-docs/wrappers-draft/`:

**1. Dialog/Popover Wrapper (`ui/Popover.tsx`)**

- Must handle focus trap replacement (retire `src/hooks/useFocusTrap.ts`)
- Props should match EmployeeEditDrawer usage patterns:
  - `isOpen`, `onClose`, `title`, `description`
  - Support for sheet/drawer layout variants
  - Escape key handling
  - Focus return tracking
- Need `data-testid` hooks for Playwright

**2. FormField Wrapper (`form/FormField.tsx`, `form/EmployeeForm.tsx`)**

- Integration with React Hook Form + Zod
- Error display matching current validation messages
- Support for all input types used in EmployeeEditDrawer:
  - Text, email, phone, date, number, select, textarea
- Semantic validation (email pattern, phone pattern, hour norm)

**3. DataTable Wrapper (`data/DataTable.tsx`)**

- TanStack Table + Virtual integration
- Must support:
  - Selection mode (bulk operations)
  - Sticky headers
  - Virtualized rows (10k+ performance target)
  - Column visibility toggles
  - CSV export hooks
  - Nested interactive elements (buttons in cells)

### Accessibility Checklist Priority Items

From `ai-docs/ACCESSIBILITY_CHECKLIST.md`, focus on:

```
✅ CRITICAL for Stage 1 (Overlays):
- Tab order enters/exits dialog correctly
- Escape key closes and returns focus
- First focusable element receives focus on open
- aria-modal, aria-labelledby, aria-describedby present
- Focus trap prevents background interaction
- VoiceOver announces dialog open/close
- NVDA announces role and title

✅ CRITICAL for Stage 3 (Table):
- Row selection announced correctly
- Keyboard navigation (arrow keys, home/end)
- Screen reader announces row count, selected count
- Column headers properly associated
- aria-sort on sortable columns
```

### Token System Setup

Create this structure before wrapper adoption:

```typescript
// tokens/tokens.json (DTCG format)
{
  "color": {
    "primary": { "$value": "#2563eb" },
    "surface": { "$value": "#ffffff" },
    // ... all design tokens
  },
  "spacing": {
    "xs": { "$value": "0.25rem" },
    "sm": { "$value": "0.5rem" },
    // ... spacing scale
  }
}

// src/styles/tokens.css (generated)
:root {
  --em-color-primary: #2563eb;
  --em-spacing-xs: 0.25rem;
  /* ... */
}

// src/theme/index.ts (JS access)
export const theme = {
  colors: {
    primary: 'var(--em-color-primary)',
  },
  // ...
}
```

### Playground Smoke Tests

Add to `ai-docs/playground/`:

```typescript
// Basic smoke test structure needed
test('Dialog wrapper opens and closes', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="open-dialog"]');
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});

test('FormField shows validation errors', async ({ page }) => {
  // Test Zod schema validation display
});

test('DataTable virtualizes 10k rows', async ({ page }) => {
  // Performance test with large dataset
});
```

## 🎯 Stage-by-Stage Analysis

### **Stage 1: Overlay Adoption** (Lowest Risk)

**Files to Migrate:**

1. `EmployeeEditDrawer.tsx` (700 lines) → Radix Dialog wrapper
2. `QuickAddEmployee.tsx` (200 lines) → Radix Dialog wrapper
3. Bulk edit modal in `EmployeeListContainer.tsx`
4. Tag manager modal
5. Import/export modals

**Key Considerations:**

- ✅ **Low Risk**: Radix handles focus management automatically
- ⚠️ **Watch**: Focus return logic is custom (lines using `drawerReturnFocusRef`)
- ⚠️ **Watch**: Sheet/drawer responsive layout (EmployeeEditDrawer uses full-height side drawer)
- ✅ **Rollback**: branch-based revert or deployment rollback (see ADR 0003)

**Recommended Approach:**

```typescript
// Example migration for EmployeeEditDrawer
import { Dialog } from '@/components/ui/Dialog'; // Radix wrapper

// Replace custom focus trap with Radix Dialog
<Dialog 
  isOpen={isOpen}
  onClose={onClose}
  title="Employee Details"
  variant="drawer" // For sheet layout
  data-testid="employee-edit-drawer"
>
  {/* existing form content */}
</Dialog>
```

### **Stage 2: Forms & Validation** (Medium Risk)

**Critical Migration:**

- EmployeeEditDrawer form (30+ fields, complex validation)
- QuickAddEmployee form (3 fields, simpler)

**Validation Rules to Preserve:**

```typescript
// Current manual validation in EmployeeEditDrawer (lines 275-310)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(\+?[0-9()\s-]{7,})$/;
// Hour norm must be positive number

// Must create equivalent Zod schemas:
const employeeSchema = z.object({
  personalInfo: z.object({
    email: z.string().email('Неверный формат email'),
    phone: z.string().regex(PHONE_PATTERN, 'Неверный формат телефона'),
    // ...
  }),
  orgPlacement: z.object({
    hourNorm: z.number().positive('Укажите положительное число'),
  }),
});
```

**Risk Mitigation:**

- Create schemas in `src/schemas/employee.ts`
- Unit test ALL validation rules before migration
- Keep error messages identical (Russian text matters!)
- Test persistence logic (localStorage serialization)

### **Stage 3: Data Table** (Highest Risk)

**Complexity Factors:**

- EmployeeListContainer.tsx is 1000+ lines
- Complex state management (selection, filters, bulk operations)
- Performance critical (must handle 10k+ rows)
- Many interactive nested elements

**Performance Requirements:**

```
- Initial load: ≤250KB JS bundle
- Per-stage delta: ≤40KB
- 10k rows: 60fps scrolling
- Selection operations: <100ms
```

**Recommended Approach:**

1. **Spike First**: Prototype in playground with 10k mock rows
2. **Measure Baseline**: Current table performance metrics
3. **Incremental Migration**:
   - Keep filter state logic separate
   - Migrate table rendering only
   - Keep selection logic separate initially
   - Integrate TanStack Virtual last

**Feature Flag Structure:**

```typescript
// Allow parallel implementations during validation
// canonical build ships the TanStack table by default; previous flag removed

return (
  <>
    {useNewTable ? (
      <DataTableWrapper {...tableProps} />
    ) : (
      <table>{/* legacy implementation */}</table>
    )}
  </>
);
```

### **Stage 4: Bulk Actions** (Medium Risk)

**Components to Migrate:**

- Bulk edit matrix (complex state machine)
- Tag manager (catalog management)
- Import/export flows

**Watch For:**

- aria-live regions for status updates (lines 1240-1245 in EmployeeListContainer)
- Keyboard shortcuts still work
- Selection state synchronization

### **Stage 5: Rollout** (Validation Focus)

**Evidence Required:**

- ✅ All Playwright tests passing
- ✅ NVDA + VoiceOver sweep notes in `docs/SESSION_HANDOFF.md`
- ✅ Bundle size within budget
- ✅ Screenshots updated in `docs/SCREENSHOT_INDEX.md`
- ✅ 10k row performance metrics documented

## 🚨 Critical Issues in Current Code

After reviewing the provided files, I found:

1. **EmployeeListContainer.tsx**:
   - 1000+ lines is too large (Stage 3 will naturally break this up)
   - Multiple state management concerns mixed together
   - Good candidate for custom hooks extraction
2. **Validation Inconsistency**:
   - Some validation in EmployeeEditDrawer
   - Some in EmployeeListContainer (bulk edit)
   - Need centralized Zod schemas
3. **Accessibility Gaps**:
   - Good: Uses semantic HTML, aria labels
   - Missing: Some announcements for dynamic content
   - Need: Live region testing with actual screen readers
4. **localStorage Usage**:
   - Currently used for persistence
   - Consider: Is this the right long-term solution?
   - Watch: serialization/deserialization of Date objects

## ✅ Recommended Next Steps

**Your proposed Stage 0 approach is correct. Execute in this order:**

1. **Day 1-2: Wrapper Audit**
   - Review each wrapper in `wrappers-draft/`
   - Test in playground with real data
   - Document props API in wrapper READMEs
   - Add TypeScript generics where needed
2. **Day 3: Token System**
   - Create `tokens/tokens.json`
   - Generate `src/styles/tokens.css`
   - Update `src/theme/` helpers
   - Replace hard-coded colors in wrappers
3. **Day 4: Accessibility Checklist**
   - Complete EVERY checkbox for Dialog, Popover, Form
   - Test with NVDA/VoiceOver yourself
   - Document keyboard shortcuts
   - Add aria descriptions
4. **Day 5: Playground Tests**
   - Add Playwright config to playground
   - Create smoke tests for each wrapper
   - Add bundle size monitoring
   - Document test execution

**Then report back with:**

- ✅ Wrapper API documentation
- ✅ Accessibility evidence (screen recording?)
- ✅ Test coverage report
- ✅ Bundle size baseline
- 🚦 Go/No-Go decision for Stage 1

## 📋 Questions to Answer Before Starting

From `ai-docs/QUESTIONS.md`, these need answers:

1. **Token Ownership**: Who maintains `tokens/tokens.json` long-term?
2. **Feature Flags**: Runtime vs build-time toggles?
3. **Wrapper Package**: Shared package or internal-only?

**My Recommendations:**

1. Keep tokens in repo for now, revisit after Stage 5
2. Use build-time flags (simpler, no runtime overhead)
3. Keep wrappers internal until adoption proves stable

------

**Your plan is sound. Stage 0 → Report → Stage 1 is the right loop.** The tight feedback cycle will catch issues early. Proceed with Stage 0 and provide evidence before moving forward! 🚀