# ADR Decisions Index (Demo Freeze)

| ADR | Summary | Status | Date |
| --- | --- | --- | --- |
| [ADR-0001](ADR-0001-accept-P0-P1-now.md) | Accept all reviewer P0/P1 items for the demo release | Accepted | 2025-11-05 |
| [ADR-0002](ADR-0002-module-size-and-waiver-policy.md) | Enforce module line-count guardrails with waivers | Accepted | 2025-11-05 |
| [ADR-0003](ADR-0003-test-pyramid-BDD-and-E2E.md) | Test pyramid with Behave smokes and Playwright E2E | Accepted | 2025-11-05 |
| [ADR-0004](ADR-0004-surface-site-accuracy-and-forecast-per-site.md) | Surface site-level accuracy and per-site forecasts | Accepted | 2025-11-05 |
| [ADR-0005](ADR-0005-api-contracts-openapi-v1.md) | Typed API contracts with exported OpenAPI v1 | Accepted | 2025-11-05 |
| [ADR-0006](ADR-0006-repo-ownership-and-monorepo.md) | Keep two repos through demo; plan org/monorepo post-demo | Accepted | 2025-11-05 |
| [ADR-0009](ADR-0009-asr-job-persistence-and-artifacts.md) | Persist jobs in PostgreSQL and store artifacts in MinIO | Proposed | 2025-11-12 |
| [ADR-0010](ADR-0010-api-key-auth-and-quotas.md) | Enforce API-key auth plus per-client minute quotas | Proposed | 2025-11-12 |
| [ADR-0011](ADR-0011-vad-chunking-and-stereo-splitting.md) | Use VAD chunking and stereo channel splitting before transcription | Proposed | 2025-11-12 |
| [ADR-0012](ADR-0012-engine-abstraction.md) | Abstract transcription engines (Python, CLI, fallback STT) | Proposed | 2025-11-12 |
| [ADR-0013](ADR-0013-batch-first-ingestion.md) | Adopt batch-first ingestion (uploads + watcher) for MVP | Proposed | 2025-11-12 |
| [ADR-0014](ADR-0014-observability-contract.md) | Capture queue/GPU metrics and expose Prometheus endpoints | Proposed | 2025-11-12 |
| [ADR-0015](ADR-0015-artifact-naming-and-retention.md) | Standardize artifact naming + retention in MinIO/S3 | Proposed | 2025-11-12 |
| [ADR-0016](ADR-0016-language-auto-detect.md) | Default uploads to language auto-detect and persist detection | Proposed | 2025-11-12 |
| [ADR-0017](ADR-0017-security-posture.md) | Apply rate limits, size caps, and RU data residency controls | Proposed | 2025-11-12 |

For earlier ADRs (scenarios, metrics, exogenous features, etc.) see the remaining files under `docs/adr/ADR-00*.md`.
