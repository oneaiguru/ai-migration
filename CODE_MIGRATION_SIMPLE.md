# Code Migration Overview — Simple Folder Map

All code from `/Users/m/git/clients/rtneo/` → `/Users/m/ai/projects/`

---

## Folder-by-Folder Mapping

| Original Location (rtneo) | New Location (ai/projects) | Type |
|---|---|---|
| `forecastingrepo/` | `forecastingrepo/` | Python engine |
| `forecastingrepo/src/` | `forecastingrepo/src/` | Python source |
| `forecastingrepo/scripts/` | `forecastingrepo/scripts/` | Python scripts |
| `forecastingrepo/tests/` | `forecastingrepo/tests/` | Test suite |
| `forecastingrepo/docs/` | `forecastingrepo/docs/` | System docs |
| `forecastingrepo/ai-docs/` | `forecastingrepo/ai-docs/` | Agent docs |
| `forecastingrepo/specs/` | `forecastingrepo/specs/` | Specs & architecture |
| `forecastingrepo/scenarios/` | `forecastingrepo/scenarios/` | Config files |
| `forecastingrepo/reports/` | `forecastingrepo/reports/` | Artifacts & reports |
| `ui/forecast-ui/` | `forecast-ui/` | React UI (main) |
| `ui/forecast-ui/src/` | `forecast-ui/src/` | React components |
| `ui/forecast-ui/docs/` | `forecast-ui/docs/` | UI docs |
| `ui/mytko-forecast-demo/` | `mytko-forecast-demo/` | Demo UI |
| `ui/mytko-forecast-demo/src/` | `mytko-forecast-demo/src/` | Demo components |
| `ui/docs/` | `rtneo-ui-docs/` | UI documentation |
| `docs/` | `rtneo-docs/` | Public docs |
| `docs/System/` | `rtneo-docs/System/` | System docs |
| `docs/Tasks/` | `rtneo-docs/Tasks/` | Task docs |
| `docs/adr/` | `rtneo-docs/adr/` | Architecture decisions |
| `docs/data/` | `rtneo-docs/data/` | Data contracts |
| `docs-internal/` | `rtneo-docs/` | Internal docs (merged) |
| `scripts/` | `rtneo-scripts/` | Utility scripts |
| `mock/` | `rtneo-mock/` | Mock data |
| `reports/` | `rtneo-reports/` | Backtest reports |

---

## Quick Count

- **3 Main Projects**: forecastingrepo, forecast-ui, mytko-forecast-demo
- **5 Support Projects**: rtneo-docs, rtneo-ui-docs, rtneo-scripts, rtneo-mock, rtneo-reports
- **Total Folders**: 24+
- **Total Files**: 300+

---

## What's Where Now

| What | Where |
|---|---|
| Python forecasting engine | `/projects/forecastingrepo/` |
| React UI | `/projects/forecast-ui/` |
| Demo UI (MobX) | `/projects/mytko-forecast-demo/` |
| All docs | `/projects/rtneo-docs/` + `/projects/forecastingrepo/docs/` |
| UI docs | `/projects/rtneo-ui-docs/` |
| Scripts | `/projects/rtneo-scripts/` |
| Mock/test data | `/projects/rtneo-mock/` |
| Reports/artifacts | `/projects/rtneo-reports/` |

---

**Status**: ✅ All code migrated
