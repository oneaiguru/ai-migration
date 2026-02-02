# Changelog

All notable changes to this repository are documented here. Follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions and use ISO dates.

## 2025-10-20
### Added
- Initial mirror of `employee-management-parity` targeting trimmed production build hosted at `granin/employee-management-production`.

### Removed
- Demo navigation tabs and components (`EmployeePhotoGallery`, `PerformanceMetricsView`, `EmployeeStatusManager`, `CertificationTracker`, `EmployeeComparisonTool`) to ship an Employees-only experience.

### Deployment
- Built and validated with `npm run typecheck`, `npm run build`, and Playwright suite (`npm run test -- --project=chromium --workers=1 --grep "Employee list"`).
- Deployed to Vercel production: `https://employee-management-production-crvewjvky-granins-projects.vercel.app`.
