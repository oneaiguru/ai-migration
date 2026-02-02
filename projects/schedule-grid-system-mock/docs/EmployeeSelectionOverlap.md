Employee Selection Overlap Analysis

Scheduling has:

- Component: AdvancedUIManager
- Location: src/modules/advanced-ui-ux/components/AdvancedUIManager.tsx:7
- Behavior: Checkbox list to select multiple affected employees in exception form.

Employee Mgmt has:

- Component: EmployeeList selection column (useEmployeeListState)
- Location: src/components/EmployeeList/useEmployeeListState.tsx:890
- Behavior: Selection mode adds select-all header and per-row checkboxes for bulk selection.

Overlap: Similar
Recommendation: Extract shared
Notes: 
- Scheduling is minimal (no select-all, standalone form); Employee Mgmt covers bulk actions with ARIA and select-all.
- A shared EmployeeChecklist could replace Scheduling’s inline list and align a11y/behavior.
