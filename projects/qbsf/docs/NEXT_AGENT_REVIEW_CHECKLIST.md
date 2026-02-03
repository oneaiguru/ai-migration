# NEXT AGENT REVIEW CHECKLIST — Option A (Pre-Deploy)

## 1) Status Summary
- Ready for immediate deploy.
- Roman will test today and pay today (Dec 29, 2025).
- Deploy first; payment after successful test.

## 2) Pre-Deploy Review (Checklist)
- [ ] Verify `deploy_temp/` package is complete (classes, objects, triggers, remoteSiteSettings).
- [ ] Confirm `scripts/option_a_after_payment_deploy.sh` is executable.
- [ ] Check Salesforce dry-run status (Deploy ID `0AfSo0000037t65KAA`).
- [ ] Verify middleware package exists at `deployment/sf-qb-integration-final/`.

## 3) Deployment Sequence (Reference)
- Run: `scripts/option_a_after_payment_deploy.sh`
- Or follow manual steps in `docs/SESSION_2025-12-29_COVERAGE_FIX_HANDOFF.md`

## 4) Success Criteria
- Salesforce deploy completes (42 tests pass).
- Middleware starts and responds to health check.
- Roman tests 20 accounts → all pass.
- Payment received (20k RUB).

## 5) Rollback Plan
- SF: No rollback (failed deploy doesn't affect org).
- Middleware: backup exists at `/opt/qb-integration.backup.YYYYMMDD`.
