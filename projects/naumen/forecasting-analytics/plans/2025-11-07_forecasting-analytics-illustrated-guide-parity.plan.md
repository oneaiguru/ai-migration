# Forecasting & Analytics — Illustrated Guide Parity Closure Plan (2025-11-07)

## Metadata
- **Task**: Close illustrated-guide parity gaps for notifications & exports
- **Discovery dossier**: `docs/Tasks/forecasting-analytics_parity-illustrated-guide-gap-2025-11-07.task.md`
- **UAT evidence**: `docs/Tasks/uat/2025-11-07_forecasting-illustrated-guide-review.md`, `docs/Tasks/uat/2025-11-07_forecasting-real-vs-demo-validation.md`
- **Navigation script**: `uat-agent-tasks/2025-11-06_forecasting-real-vs-demo.md`
- **Active repo**: `${FORECASTING_ANALYTICS_REPO}` (`/Users/m/git/client/naumen/forecasting-analytics`)
- **Supersedes**: keep v4 in place; this plan targets the remaining illustrated-guide checklist items

## Desired End State
- Trend CSV exports raise inline success/error banners and log bell notifications with download links that include timezone metadata.
- Accuracy exports display a visible confirmation banner, resolve bell dropdown focus/accessibility issues, and keep existing notification entries.
- Absenteeism calculator and template export push bell notifications in addition to inline banners.
- Tests cover notification hooks for trend, accuracy, and absenteeism flows.
- Documentation (parity index, MVP checklist, Code Map, UAT packs, screenshot index) reflects the new notification behaviour, demo-only real-system gaps, and latest evidence.

### Key Discoveries
- `src/components/forecasting/trends/TrendAnalysisDashboard.tsx:207-340` — export handler lacks status banner + notification hook (discovery §1).
- `src/components/forecasting/common/NotificationCenter.tsx:1-200` — reusable helpers already exist for pushing success/error entries (discovery §1).
- `src/components/forecasting/AccuracyDashboard.tsx:240-267` — pushes bell entries but no inline toast, dropdown focus unreliable (discovery §2).
- `src/components/forecasting/common/NotificationBell.tsx:1-160` — needs focus/keyboard handling to keep dropdown usable (discovery §2).
- `src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:210-295` — calculator + exports show banners only (no notifications) (discovery §3).
- Tests/docs listed in discovery §4 require updates so parity evidence stays aligned.

## What We're NOT Doing
- No backend integration changes; still using simulated payloads.
- No removal of demo-only modules; we only document their status.
- No Playwright additions beyond existing smoke routes.
- No modifications to manual adjustments workflow (already covered in prior plan).

## Implementation Approach
Augment existing export/calculation handlers to leverage the notification center, add inline status banners where missing, harden bell accessibility, and update supporting tests/docs. Keep changes scoped to notification flow to match illustrated guide checkmarks while preserving prior deploy behaviour.

## Phase 1: Trend Export Feedback & Notifications

### Overview
Ensure CSV export from the trends dashboard surfaces inline feedback and bell notifications with timezone-aware URIs.

### Changes Required:

#### 1. Extend trend export handler
**File**: `src/components/forecasting/trends/TrendAnalysisDashboard.tsx`
**Changes**: import timezone + notification hooks, track `statusMessage`, push success/error notifications, and show inline banner.

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/forecasting/trends/TrendAnalysisDashboard.tsx
@@
-import React, { useMemo, useEffect, useState } from 'react';
+import React, { useMemo, useEffect, useState } from 'react';
+import { useNotificationCenter } from '../common/NotificationCenter';
+import { useTimezone } from '../common/TimezoneContext';
@@
-  const [exporting, setExporting] = useState(false);
+  const [exporting, setExporting] = useState(false);
+  const [statusMessage, setStatusMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
+  const { pushNotification, pushError } = useNotificationCenter();
+  const { timezone } = useTimezone();
@@
-    setExporting(true);
+    setExporting(true);
+    setStatusMessage(null);
     try {
       const payload = createTrendExport({
         organizationId: organizationId ?? 'demo-org',
         queueIds: selectedQueueId ? [selectedQueueId] : queueIds ?? [trendSeedDefaults.queueId],
         period: {
           start: selectedRange.start.toISOString(),
           end: selectedRange.end.toISOString(),
         },
         mode: activeTab,
         timezoneId: timezone.id,
       });
@@
       anchor.href = url;
       anchor.download = payload.filename;
       anchor.click();
       URL.revokeObjectURL(url);
+      const href = `data:${payload.mimeType};charset=utf-8,${encodeURIComponent(payload.content)}`;
+      pushNotification({
+        title: 'CSV готов',
+        message: `Тренд для ${currentQueue?.label ?? 'очередей'} сформирован`,
+        kind: 'success',
+        downloadHref: href,
+        downloadLabel: payload.filename,
+      });
+      setStatusMessage({ kind: 'success', text: 'Экспорт трендов готов. Файл доступен в колокольчике.' });
     } finally {
       setExporting(false);
     }
   };
*** End Patch
PATCH
```

#### 2. Render status banner & handle errors
**File**: `src/components/forecasting/trends/TrendAnalysisDashboard.tsx`
**Changes**: add error handling branch and banner markup.

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/forecasting/trends/TrendAnalysisDashboard.tsx
@@
-      const blob = new Blob([payload.content], { type: payload.mimeType });
+      const blob = new Blob([payload.content], { type: payload.mimeType });
@@
-    } finally {
-      setExporting(false);
-    }
+    } catch (error) {
+      console.error('Не удалось экспортировать тренды', error);
+      pushError('Ошибка экспорта трендов', 'Попробуйте выбрать другой период или повторите позже.');
+      setStatusMessage({ kind: 'error', text: 'Не удалось выгрузить тренды. Повторите попытку позже.' });
+    } finally {
+      setExporting(false);
+    }
   };
@@
-      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
+      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
         <div className="flex flex-wrap items-center justify-between gap-4">
@@
       </header>
+
+      {statusMessage && (
+        <div
+          className={`rounded-xl border p-4 text-sm shadow-sm ${
+            statusMessage.kind === 'success'
+              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
+              : 'border-rose-200 bg-rose-50 text-rose-700'
+          }`}
+        >
+          {statusMessage.text}
+        </div>
+      )}
*** End Patch
PATCH
```

#### 3. Include timezone metadata in trend export
**File**: `src/services/forecastingApi.ts`
**Changes**: extend `createTrendExport` to accept `timezoneId`, prepend `# timezone=` meta, and adjust filename suffix.

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/services/forecastingApi.ts
@@
-export const createTrendExport = (request: TrendExportRequest): ExportPayload => {
+export const createTrendExport = (request: TrendExportRequest): ExportPayload => {
   const header = 'timestamp,queue_id,mode,forecast,fact,abs_delta,rel_delta';
   const rows: string[] = [];
@@
-  return {
-    filename: `trend_${request.mode}_${new Date().toISOString().split('T')[0]}.csv`,
-    mimeType: 'text/csv;charset=utf-8',
-    content: `${header}\n${rows.join('\n')}`,
-  };
+  const timezoneLabel = request.timezoneId ? describeTimezone(request.timezoneId) : undefined;
+  const safeLabel = timezoneLabel ? timezoneLabel.replace(/[^A-Za-z0-9+]+/g, '-') : undefined;
+  const timezoneMeta = timezoneLabel ? `# timezone=${timezoneLabel}\n` : '';
+  return {
+    filename: `trend_${request.mode}_${new Date().toISOString().split('T')[0]}${safeLabel ? `_${safeLabel}` : ''}.csv`,
+    mimeType: 'text/csv;charset=utf-8',
+    content: `${timezoneMeta}${header}\n${rows.join('\n')}`,
+  };
 };
*** End Patch
PATCH
```

#### 4. Update trend export request type
**File**: `src/types/forecasting.ts`
**Changes**: add optional `timezoneId` so service/component stay typed.

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/types/forecasting.ts
@@
 export interface TrendExportRequest {
   organizationId: string;
   queueIds: string[];
   period: ForecastPeriod;
   mode: 'strategic' | 'tactical' | 'operational';
   timezoneId?: string;
 }
*** End Patch
PATCH
```

## Phase 2: Accuracy Export Feedback & Bell Focus

### Overview
Add inline banner for accuracy exports and improve bell accessibility/focus management.

### Changes Required:

#### 1. Accuracy export banner & focus hook
**File**: `src/components/forecasting/AccuracyDashboard.tsx`
**Changes**: track export status message, push notification already present, add banner element, catch errors.

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/forecasting/AccuracyDashboard.tsx
@@
-  const { pushNotification, pushError } = useNotificationCenter();
+  const { pushNotification, pushError } = useNotificationCenter();
+  const [exportStatus, setExportStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
@@
-    setIsExporting(true);
+    setIsExporting(true);
+    setExportStatus(null);
@@
       pushNotification({
         title: 'Экспорт точности готов',
         message: `Файл ${payload.filename} выгружен`,
         kind: 'success',
         downloadHref: `data:${payload.mimeType};charset=utf-8,${encodeURIComponent(payload.content)}`,
         downloadLabel: payload.filename,
       });
+      setExportStatus({ kind: 'success', text: 'Отчёт по точности выгружен. Файл доступен в колокольчике.' });
     } catch (error) {
       console.error('Не удалось выполнить экспорт точности', error);
       pushError('Ошибка экспорта точности', 'Не удалось сформировать CSV. Повторите попытку позже.');
+      setExportStatus({ kind: 'error', text: 'Экспорт не выполнен. Попробуйте ещё раз.' });
     } finally {
       setIsExporting(false);
     }
   };
*** End Patch
PATCH
```

#### 2. Render status banner in accuracy dashboard
**File**: `src/components/forecasting/AccuracyDashboard.tsx`
**Changes**: insert banner near header.

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/forecasting/AccuracyDashboard.tsx
@@
   return (
     <section className="space-y-6">
       <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
@@
       </header>
+
+      {exportStatus && (
+        <div
+          className={`rounded-xl border p-4 text-sm shadow-sm ${
+            exportStatus.kind === 'success'
+              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
+              : 'border-rose-200 bg-rose-50 text-rose-700'
+          }`}
+        >
+          {exportStatus.text}
+        </div>
+      )}
*** End Patch
PATCH
```

#### 3. Improve bell focus/keyboard
**File**: `src/components/forecasting/common/NotificationBell.tsx`
**Changes**: manage refs, close on outside click & Escape, focus first link when opened, restore button focus when closed.

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/forecasting/common/NotificationBell.tsx
@@
-import React, { useEffect, useMemo, useState } from 'react';
+import React, { useEffect, useMemo, useRef, useState } from 'react';
@@
-  const [open, setOpen] = useState(false);
+  const [open, setOpen] = useState(false);
+  const buttonRef = useRef<HTMLButtonElement | null>(null);
+  const panelRef = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
     if (open && unreadCount > 0) {
       markAllAsRead();
     }
   }, [open, unreadCount, markAllAsRead]);
+
+  useEffect(() => {
+    if (!open) {
+      return;
+    }
+    const handleKey = (event: KeyboardEvent) => {
+      if (event.key === 'Escape') {
+        event.preventDefault();
+        setOpen(false);
+        buttonRef.current?.focus();
+      }
+    };
+    const handleClick = (event: MouseEvent) => {
+      if (panelRef.current && !panelRef.current.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) {
+        setOpen(false);
+      }
+    };
+    document.addEventListener('keydown', handleKey);
+    document.addEventListener('click', handleClick);
+    const firstDownloadLink = panelRef.current?.querySelector<HTMLAnchorElement>('a[href]');
+    firstDownloadLink?.focus();
+    return () => {
+      document.removeEventListener('keydown', handleKey);
+      document.removeEventListener('click', handleClick);
+    };
+  }, [open]);
@@
-      <button
+      <button
         type="button"
         className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:text-purple-600"
         aria-haspopup="true"
         aria-expanded={open}
-        onClick={() => setOpen((value) => !value)}
+        ref={buttonRef}
+        onClick={() => setOpen((value) => !value)}
       >
@@
-      {open && (
-        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl">
+      {open && (
+        <div ref={panelRef} className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl" tabIndex={-1}>
*** End Patch
PATCH
```

## Phase 3: Absenteeism Notifications

### Overview
Push notification entries for calculator completion and CSV exports.

### Changes Required:

#### 1. Hook template export + calculator to notification center
**File**: `src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx`
**Changes**: import notification hook, push success/error entries, reuse timezone metadata helper, add download href.

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx
@@
-import React, { useEffect, useMemo, useState } from 'react';
+import React, { useEffect, useMemo, useState } from 'react';
+import { useNotificationCenter } from '../common/NotificationCenter';
@@
-  const handleTemplateExport = (templateId: string) => {
+  const { pushNotification, pushError } = useNotificationCenter();
+
+  const handleTemplateExport = (templateId: string) => {
     try {
       const payload = exportAbsenteeismCsv({ templateIds: [templateId] });
@@
       anchor.href = url;
       anchor.download = payload.filename;
       anchor.click();
       URL.revokeObjectURL(url);
       setStatus('CSV экспортирован.');
+      const href = `data:${payload.mimeType};charset=utf-8,${encodeURIComponent(payload.content)}`;
+      pushNotification({
+        title: 'Экспорт шаблона выполнен',
+        message: `Файл ${payload.filename} доступен для скачивания`,
+        kind: 'success',
+        downloadHref: href,
+        downloadLabel: payload.filename,
+      });
     } catch (exportError) {
       console.error(exportError);
       setError('Не удалось сформировать CSV.');
+      pushError('Ошибка экспорта шаблона', 'Повторите попытку позже.');
     }
   };
@@
-      const result = await calculateAbsenteeism(payload);
+      const result = await calculateAbsenteeism(payload);
       setCalculatorResult(result);
       setStatus('Расчёт абсентеизма выполнен.');
+      pushNotification({
+        title: 'Расчёт абсентеизма готов',
+        message: `Шаблон ${preset.name} обработан, итоги доступны в таблице ниже.`,
+        kind: 'success',
+      });
     } catch (calcError) {
       console.error(calcError);
       setError('Не удалось выполнить расчёт абсентеизма.');
+      pushError('Ошибка расчёта абсентеизма', 'Не удалось получить результат. Освежите страницу и повторите.');
     } finally {
       setCalculatorLoading(false);
     }
   };
*** End Patch
PATCH
```

## Phase 4: Unit Tests

### Overview
Extend existing Vitest suites to guard the new timezone metadata and ensure exports remain consumable after notification changes.

### Changes Required:

#### 1. Trend export metadata
**File**: `tests/forecasting/trends.test.ts`
**Changes**: add an `it` block that calls `createTrendExport({ ..., timezoneId: 'Europe/Moscow' })` and asserts the payload filename includes the timezone suffix and `content` begins with `# timezone=`.

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: tests/forecasting/trends.test.ts
@@
   it('exports queue-specific rows within period', () => {
     const queue = trendSeriesByQueue[0];
     const payload = createTrendExport({
       organizationId: 'demo',
       queueIds: [queue.queueId],
       period: trendSeedDefaults.period,
       mode: 'strategic',
     });
     expect(payload.content).toContain(queue.queueId);
     expect(payload.content.split('\n').length).toBeGreaterThan(2);
   });
+
+  it('includes timezone metadata when provided', () => {
+    const queue = trendSeriesByQueue[0];
+    const payload = createTrendExport({
+      organizationId: 'demo',
+      queueIds: [queue.queueId],
+      period: trendSeedDefaults.period,
+      mode: 'strategic',
+      timezoneId: 'Europe/Moscow',
+    });
+    expect(payload.content.startsWith('# timezone=UTC+03')).toBe(true);
+    expect(payload.filename).toContain('UTC+03');
+  });
 });
*** End Patch
PATCH
```

#### 2. Accuracy export regression
**File**: `tests/forecasting/accuracy.test.ts`
**Changes**: add a test ensuring `createAccuracyExport()` still returns CSV content with header + rows (guards banner refactor).

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: tests/forecasting/accuracy.test.ts
@@
 describe('createAccuracyExport', () => {
   it('returns CSV with expected header columns', async () => {
     const payload = await createAccuracyExport();
     expect(payload.content.split('\n')[0]).toBe('timestamp,forecast,actual,absenteeism_percent,lost_calls,aht_seconds,service_level');
   });
+
+  it('produces non-empty dataset for bell notifications to consume', async () => {
+    const payload = await createAccuracyExport();
+    expect(payload.content.split('\n').length).toBeGreaterThan(2);
+    expect(payload.filename).toMatch(/accuracy_\d{4}-\d{2}-\d{2}\.csv/);
+  });
 });
*** End Patch
PATCH
```

#### 3. Absenteeism calculator regression
**File**: `tests/forecasting/absenteeism.test.ts`
**Changes**: add expectation that `calculateAbsenteeism` still returns recommended values after notification wiring.

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: tests/forecasting/absenteeism.test.ts
@@
   it('returns recommended percent and series for preset input', async () => {
     const preset = absenteeismCalculatorPresets[0];
     const result = await calculateAbsenteeism({
       queueId: firstLeaf,
       templateId: 'template-weekday',
       historyDays: preset.historyDays,
       forecastDays: preset.forecastDays,
       intervalMinutes: preset.intervalMinutes,
     });
     expect(result.series).toHaveLength(preset.forecastDays);
     expect(result.recommendedPercent).toBeGreaterThanOrEqual(result.baselinePercent);
     expect(result.queueId).toBe(firstLeaf);
   });
+
+  it('keeps baseline percent available for notifications display', async () => {
+    const preset = absenteeismCalculatorPresets[1];
+    const result = await calculateAbsenteeism({
+      queueId: firstLeaf,
+      templateId: 'template-weekday',
+      historyDays: preset.historyDays,
+      forecastDays: preset.forecastDays,
+      intervalMinutes: preset.intervalMinutes,
+    });
+    expect(result.baselinePercent).toBeGreaterThan(0);
+  });
 });
*** End Patch
PATCH
```

## Phase 5: Documentation & UAT Updates

### Overview
Sync parity documentation with new behaviours and capture UAT instructions.

### Changes Required:

#### 1. Update parity index row
**File**: `docs/System/DEMO_PARITY_INDEX.md`
**Changes**: mark notification parity complete, note demo-only modules.

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/System/DEMO_PARITY_INDEX.md
@@
-| Forecasting & Analytics | ${FORECASTING_ANALYTICS_REPO} | Vite + React 18 + shared Chart.js wrappers (`src/components/charts/*`) | Yes (App.tsx tabs RU copy; charts via locale helpers) | CH4 Forecast KPIs/trends; CH5 manual adjustments | Wrappers + adapters migrated; confidence band + dual-axis support live locally | Prod: https://forecasting-analytics-etef3m532-granins-projects.vercel.app | Run `parity_static` + `chart_visual_spec` on new deploy; wire manual adjustments to live API validation |
+| Forecasting & Analytics | ${FORECASTING_ANALYTICS_REPO} | Vite + React 18 + shared Chart.js wrappers (`src/components/charts/*`) | Yes (App.tsx tabs RU copy; charts via locale helpers) | CH4 Forecast KPIs/trends; CH5 manual adjustments | Notification centre покрывает build/trend/accuracy/absenteeism; trends/accuracy/manual adjustments остаются демо-only в practice | Prod: https://forecasting-analytics-etef3m532-granins-projects.vercel.app | Рerun `parity_static` + `chart_visual_spec`; зафиксировать bell evidence и отметить отсутствующие модули в real portal |
*** End Patch
PATCH
```

#### 2. Checklist additions
**File**: `docs/System/PARITY_MVP_CHECKLISTS.md`
**Changes**: add items for trend/accuracy/absenteeism notification parity.

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/System/PARITY_MVP_CHECKLISTS.md
@@
 - ✅ Shell уведомляет о выгрузках/расчётах (inline + колокольчик) — `NotificationCenterProvider` + `NotificationBell`.
+- ✅ Trend CSV экспорт отдаёт баннер и запись в колокольчике с timezone-хедером.
+- ✅ Accuracy экспорт показывает баннер, доступ к колокольчику стабилен с клавиатуры.
+- ✅ Абсентеизм калькулятор/экспорт пушат уведомления.
*** End Patch
PATCH
```

#### 3. Update Code Map modules
**File**: `docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md`
**Changes**: add notification coverage for trend/accuracy/absenteeism, refresh deploy date, point to bell evidence.

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md
@@
 | Trend analysis | `src/components/forecasting/trends/TrendAnalysisDashboard.tsx`, `src/adapters/forecasting/trends.ts`, `tests/forecasting/trends.test.ts` | CSV экспорт → inline баннер + колокольчик (`useNotificationCenter`). |
 | Accuracy dashboard | `src/components/forecasting/AccuracyDashboard.tsx`, `src/adapters/forecasting/accuracy.ts`, `tests/forecasting/accuracy.test.ts` | CSV экспорт → баннер, bell-focus fix, notification entries. |
 | Absenteeism workspace | `src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx`, `tests/forecasting/absenteeism.test.ts` | Калькулятор/экспорт отправляют уведомления; баннеры синхронизированы. |
*** End Patch
PATCH
```

#### 4. UAT pack & screenshot updates
- `docs/Tasks/uat/2025-10-26_forecasting-uat.md`: append 2025-11-07 entry noting new deploy, bell screenshots (`forecasting-notification-bell.png`, etc.).
- `docs/SCREENSHOT_INDEX.md`: register new evidence aliases for bell banners.
- `docs/Tasks/uat/2025-11-07_forecasting-real-vs-demo-validation.md`: add summary noting which demo features remain unmatched in real portal.

Provide executor with explicit apply_patch blocks for each markdown insert when evidence captured.

#### 5. Handoff references
- Update `PROGRESS.md` (forecasting repo) to list this plan as active.
- Append planner entry in `docs/SESSION_HANDOFF.md` summarising phases + validation commands.

## Tests & Validation
Run from `${FORECASTING_ANALYTICS_REPO}` after applying changes:

```bash
npm install
npm run test:run
npm run build
npm run smoke:routes
vercel deploy --prod --yes
SMOKE_BASE_URL=https://forecasting-analytics-<new-id>.vercel.app npm run smoke:routes
```

After deploy, rerun UAT packs (`docs/Tasks/uat-packs/parity_static.md`, `docs/Tasks/uat-packs/chart_visual_spec.md`) against the new URL, capturing bell/banner evidence with aliases recorded in `docs/SCREENSHOT_INDEX.md`.

## Rollback
If issues arise, revert touched files and remove new banner state:

```bash
set -euo pipefail
cd "${FORECASTING_ANALYTICS_REPO}"
git restore src/components/forecasting/trends/TrendAnalysisDashboard.tsx \
            src/components/forecasting/AccuracyDashboard.tsx \
            src/components/forecasting/common/NotificationBell.tsx \
            src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx \
            tests/forecasting/trends.test.ts \
            tests/forecasting/accuracy.test.ts \
            tests/forecasting/absenteeism.test.ts \
            docs/System/DEMO_PARITY_INDEX.md \
            docs/System/PARITY_MVP_CHECKLISTS.md \
            docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md
```

## Handoff
- Update `PROGRESS.md` with this plan as the current execution target.
- Add planner entry to `docs/SESSION_HANDOFF.md` noting plan filename, high-level phases, validation commands, and UAT expectations.
- Brief executor to follow CE prompts, capture new screenshots, and update UAT packs + docs per Phase 5.
