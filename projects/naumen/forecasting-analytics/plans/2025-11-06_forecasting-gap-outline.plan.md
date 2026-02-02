# Forecasting & Analytics — Gap Outline (2025-11-06)

Purpose: catalogue remaining remediation tasks from the 2025-11-05/11-06 UAT notes so we can queue focused fixes without re-reviewing the entire codebase.

## Build Forecast
- **Files**: `src/components/forecasting/build/BuildForecastWorkspace.tsx:259-420`, `src/services/forecastingApi.ts:198-312`.
- **Gap**: Demo sometimes skips success banner/toast after `handleBuild` and CSV exports quietly download without bell notifications. Real portal expects visible summary + job log entry.
- **Action**: Ensure `runForecastBuild` populates `result.message` and feed summary to both status banner and build-history list; surface header notification via shared report queue. Add Vitest coverage for successful build + export feedback.

## Exceptions Upload UX
- **Files**: `src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:120-370`, `src/services/forecastingApi.ts:314-388`.
- **Gap**: Styling of Day/Interval toggle and import/export click targets still diverges from production captures; upload results rely on inline banners.
- **Action**: Align toggle component with `SegmentedControl` styles (icons + uppercase labels) and add toast/notification parity for CSV uploads. Document TODO to swap mock API.

## Trend Service-Level Overlay
- **Files**: `src/components/forecasting/trends/TrendAnalysisDashboard.tsx:300-392`, `src/adapters/forecasting/trends.ts:140-240`.
- **Gap**: Σ overlay renders but SL target indicator missing; production screenshot shows SL line + legend note.
- **Action**: Add SL target series to adapter output and expose toggle/legend entry in the dashboard. Update tests in `tests/forecasting/trends.test.ts` to assert presence of target data.

## Absenteeism History Export
- **Files**: `src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:280-460`, `src/services/forecastingApi.ts:390-470`.
- **Gap**: Calculator returns banner/table but export/download lacks confirmation; real system shows job history w/ status badges.
- **Action**: Introduce toast + job queue entry when `calculateAbsenteeism` completes and ensure history rows include download actions. Cover via `tests/forecasting/absenteeism.test.ts`.

## Accuracy CSV Export
- **Files**: `src/components/forecasting/AccuracyDashboard.tsx:150-340`, `src/services/forecastingApi.ts:472-540`.
- **Gap**: Export builder surfaces options but CSV download does not start; need parity with prod (multi-format + RU filename).
- **Action**: Implement download helper similar to build workspace and wire to status banner + notifications; add dedicated Vitest verifying `exportAccuracyReport` builds localized filenames.

## Reports Bell Integration
- **Files**: `src/components/forecasting/ForecastingLayout.tsx:60-118`, `src/services/forecastingApi.ts:542-610`.
- **Gap**: Forecasting shell does not yet pipe export actions into the shared notification bell.
- **Action**: Reuse analytics report queue utilities to push notifications when any forecast export completes; ensure bell view renders localized timestamps.

## Documentation & Follow-up
- Update `docs/Tasks/uat/2025-11-05_forecasting-stage6.md` once fixes land (Pass vs Partial).
- Refresh illustrated guide quick sheet to reflect improved feedback flows.
- Coordinate with backend team for live upload/export endpoints before trimming demo functionality.
