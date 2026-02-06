# ADR 0001 – Component Stack For Migration Wrappers

**Status:** Accepted  
**Date:** 2025-10-07  
**Related Docs:** `docs/Tasks/phase-6-migration-planning-prd.md`, `ai-docs/MANIFEST.md`

## Context
- Phase 6 introduces a migration from bespoke UI primitives to a shared wrapper layer.
- The ai-docs workspace already aggregates documentation, code snippets, and playground demos for several libraries (Radix, shadcn/ui, TanStack Table + Virtual, React Hook Form + Zod, dnd-kit, Tremor, MiniSearch). Legacy Vaul resources remain archived for reference but are not part of the stack.
- We need a canonical component stack so future agents do not re-evaluate library choices or mix incompatible primitives while replacing the existing code.

## Decision
Adopt the following libraries as the foundation for shared wrappers:
- **Overlays / primitives:** Radix UI primitives (Dialog, Popover, DropdownMenu). Adopt shadcn/ui surface components only after the repo upgrades to Tailwind v4.
- **Data grids & virtualization:** TanStack Table v8 with TanStack Virtual for row virtualization.
- **Forms & validation:** React Hook Form with Zod schemas (via `@hookform/resolvers/zod`).
- **Drag & drop extensions (future):** dnd-kit presets for sortable lists.
- **Charts / metrics (future parity modules):** Tremor + Recharts for performance dashboards.
- **Search helpers:** MiniSearch for client-side index/search needs.
- **Sheet/drawer interactions:** Compose sheet/drawer patterns with Radix `Dialog` + responsive styles. Revisit additional kits after Tailwind v4 migration.

Wrappers drafted under `ai-docs/wrappers-draft/` will be promoted to production once hardened (Stage 0 of Phase 6 PRD). All new shared components must expose stable props/tests before replacing existing code in `src/`.

## Consequences
- **Pros:**
  - Reduces custom accessibility plumbing by leaning on Radix focus management.
  - Aligns data table behaviour with future Schedule/Reporting parity work.
  - Consolidates validation to a single schema layer (Zod) shared by forms and bulk-edit flows.
- **Cons:**
  - Increases bundle size; requires monitoring during migration.
  - Introduces TypeScript generics/peer dependency management (RHF, TanStack) that agents must understand.
  - Demands upfront wrapper hardening to avoid leaking raw library APIs.

## Follow-up Actions
1. Finish wrapper API documentation and tests in the playground before shipping to `src/`.
2. Track bundle impact in Phase 6 Stage 5 and plan tree-shaking/code-splitting if necessary.
3. Update SOPs once wrappers become the recommended approach for new modules.

## Status History
- **2025-10-07:** Accepted – forms the basis for Phase 6 migration plan.
