# Next UI Agent — Read Before Coding

Purpose: ensure you load the exact review and follow-up context before making any UI changes. Read end-to-end.

## Core Reading (shared)
- reviews/20251105/original/MASTER_CODE_REVIEW.md
- reviews/20251105/original/NEXT_AGENT_REVIEW_FIXES.md
- reviews/20251105/postreview/SUMMARY.md
- reviews/20251105/postreview/shared/IMPLEMENTATION_GUIDE.md
- reviews/20251105/postreview/shared/site_wape_fix.py
- reviews/20251105/postreview/shared/FINAL_VERIFICATION.md
- reviews/20251105/postreview/shared/FINAL_STATUS_AND_APPROVAL.md
- reviews/20251105/postreview/shared/SUPPLEMENTARY_REVIEW.md

## Core Pipeline Bundle (context)
- reviews/20251105/core_pipeline/0_submission/Core_Pipeline_Review.zip
- reviews/20251105/core_pipeline/1_feedback/Core_Pipeline_Code_Review/PIPELINE_CODE_REVIEW.md
- reviews/20251105/core_pipeline/1_feedback/Core_Pipeline_Code_Review/EXECUTIVE_SUMMARY.md
- reviews/20251105/core_pipeline/1_feedback/Core_Pipeline_Code_Review/CODE_PATCHES.md
- reviews/20251105/core_pipeline/1_feedback/Core_Pipeline_Code_Review/PRE_DEMO_CHECKLIST.md
- reviews/20251105/core_pipeline/1_feedback/Core_Pipeline_Code_Review/test_pipeline_fixes.py
- reviews/20251105/core_pipeline/2_followup/backend_sites.md

## Backtesting & Evaluation (context)
- reviews/20251105/backtesting_eval/0_submission/Backtesting_and_Metrics_Review.zip
- reviews/20251105/backtesting_eval/1_feedback/Backtesting_and_Evaluation_Review/EVAL_BUNDLE_REVIEW.md
- reviews/20251105/backtesting_eval/1_feedback/Backtesting_and_Evaluation_Review/EXECUTIVE_SUMMARY.md
- reviews/20251105/backtesting_eval/1_feedback/Backtesting_and_Evaluation_Review/README_DELIVERABLES.md
- reviews/20251105/backtesting_eval/1_feedback/Backtesting_and_Evaluation_Review/site_wape_fix.py
- reviews/20251105/backtesting_eval/2_followup/backend_site_backtest.md

## Docs & Scenario (context)
- reviews/20251105/docs_and_schema/0_submission/Config_and_Schema_Review.zip
- reviews/20251105/docs_and_schema/2_followup/docs_scenarios_data.md

## Backend API (context)
- reviews/20251105/backend_api/0_submission/API_Layer_Review.zip
- reviews/20251105/backend_api/1_feedback/API_Security_and_Contract_Review_Report.md
- reviews/20251105/backend_api/2_followup/backend_api.md

## UI Bundles (directly relevant)
- reviews/20251105/ui_components/0_submission/ui_components_bundle.zip
- reviews/20251105/ui_components/1_feedback/UI_Components_Code_Review_Report.md
- reviews/20251105/ui_components/1_feedback/README_bundle.md
- reviews/20251105/ui_components/2_followup/ui_components.md
- reviews/20251105/ui_config/0_submission/ui_config_bundle/INDEX.md
- reviews/20251105/ui_config/0_submission/ui_config_bundle/src/App.tsx
- reviews/20251105/ui_config/0_submission/ui_config_bundle/src/index.css
- reviews/20251105/ui_config/0_submission/ui_config_bundle/tailwind.config.js
- reviews/20251105/ui_config/0_submission/ui_config_bundle/vite.config.ts
- reviews/20251105/ui_config/1_feedback/UI_Config_and_Demo_Review/README.md
- reviews/20251105/ui_config/1_feedback/UI_Config_and_Demo_Review/ui_config_review.md
- reviews/20251105/ui_config/1_feedback/UI_Config_and_Demo_Review/executive_summary.md
- reviews/20251105/ui_config/1_feedback/UI_Config_and_Demo_Review/implementation_guide.md
- reviews/20251105/ui_config/1_feedback/UI_Config_and_Demo_Review/pre_demo_checklist.md
- reviews/20251105/ui_config/1_feedback/UI_Config_and_Demo_Review/index.enhanced.css
- reviews/20251105/ui_config/1_feedback/UI_Config_and_Demo_Review/tailwind.config.enhanced.js
- reviews/20251105/ui_config/1_feedback/UI_Config_and_Demo_Review/vite.config.optimized.ts
- reviews/20251105/ui_config/2_followup/ui_config_support.md
- reviews/20251105/original/ui_supporting_bundle/README.md
- reviews/20251105/original/ui_supporting_bundle/INDEX.md
- reviews/20251105/original/ui_supporting_bundle/ui_supporting_bundle/src/**/*

## Who Does What (demo scope)
- UI
  - Keep Sidebar/Layout/Routes behaviour as fixed; do not change API contracts.
  - Maintain PR smokes (serial, 30s per test; routes cap 45s) and nightly (60s, downloads ON).
  - Refresh UI bundle with dist + HTML report + TIMINGS + screenshots; drop ZIPs into:
    - /Users/m/Downloads/review_flat_20251105_134628/UI_{Reviewer,Components_Reviewer,Config_Reviewer,Supporting_Reviewer}
- BE
  - Core fixes (demo-safe): simulator reset (flag OFF), baseline fillna, reconcile unmapped warnings.
  - Eval-only backtest: add site aggregate WAPE summary in scripts/backtest_sites.py.
  - Scenario/docs cleanup; verify CORS lock, /api/metrics demo_default_date, and /api/routes non‑empty for 2024‑08‑03.

## Validation Commands (UI)
- Unit: `cd forecast-ui && npm test -s`
- PR E2E: `PW_TIMEOUT_MS=30000 E2E_BASE_URL=https://mytko-forecast-ui.vercel.app npx playwright test --workers=1 --reporter=line`
- Nightly: `npm run test:e2e:nightly`
- Size-gate (advisory): `bash scripts/ci/check_large_files_ui.sh`
- Bundle: `npm run bundle:review`

## Splits (only if needed)
- If any file >300–400 LoC, split with no behavior change:
  - `components/routes/RoutesContainer.tsx`
  - `components/routes/RoutesTableView.tsx`
  - Mirror for Sites when/if it grows.

