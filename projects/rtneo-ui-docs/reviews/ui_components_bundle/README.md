UI Components Bundle

Includes key UI components and the API client for focused review:
- src/components/*.tsx (Layout, Overview, Districts, Sites, Routes, RoutesTable, PlanAssignments, RegistryView, RoutesPrototype, InfoTooltip)
- src/api/client.ts

Focus areas:
- Data fetching and error handling
- Risk badge and fill bar rendering (thresholds/labels)
- Routes fallback logic from /api/sites when /api/routes is empty
