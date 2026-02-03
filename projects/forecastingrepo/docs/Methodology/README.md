# Project Methodology (Source-of-Truth Pointers)

This folder anchors how we work on this project and points to the living SOPs and specs that govern delivery, testing, and reviews.

Read first
- docs/SOP/roles-and-ownership.md
- docs/SOP/task-files-workflow.md
- docs/SOP/review-process.md
- docs/System/Review_Pack.md

Contracts & evaluation
- docs/System/API_Endpoints.md
- docs/eval/METRICS.md
- docs/eval/EVALUATION_PLAN.md

Architecture & size/dep rules
- docs/System/Repo_Layout.md
- docs/System/Architecture_Forecast_Integration.md
- Large files: `scripts/ci/check_large_files.sh` (warn >500, block >600)
- Local import budget (advisory): `python scripts/ci/check_import_counts.py`

External methodology (reference)
- External repo (curated methodology): /Users/m/git/personal/codegendocs
  - Use as a library of patterns; this project references those patterns via the SOPs above.

Review bundles
- Backend zips: `~/reviews/*.zip` (see `~/reviews/README_REVIEW_BUNDLES.md`)
- UI bundle: `~/Downloads/ui_review_bundle_*.zip` (built in ui/forecast-ui/scripts)
- Trimmed pack: `~/Downloads/review_bundle_trimmed_*.zip`

Notes
- Internal docs are in English; do not edit client RU docs outside paid milestones.
- No raw data or XLSX in git; tests use small CSV fixtures.
- Determinism: `PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8 MPLBACKEND=Agg`.
