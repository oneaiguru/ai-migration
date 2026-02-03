# UI Config Bundle

Build, test, and CI configuration for reviewers.

Files
- files/package.json — scripts (build, tests, bundle)
- files/playwright.config.ts — E2E config (timeouts, baseURL)
- files/scripts/run_e2e_serial.mjs — serial smoke runner
- files/scripts/make_ui_review_bundle.sh — bundle script
- files/.github/workflows/ui-ci.yml — PR CI (unit + smokes)
- files/.github/workflows/ui-e2e-nightly.yml — nightly E2E
- files/docs/SOP/TEST_RUN_SOP.md — SOP for running tests
