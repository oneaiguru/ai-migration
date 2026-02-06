# UAT Comparison — Forecasting Demo vs Naumen (2025-10-29)

| Area | Naumen Reference | Demo (2025-10-30) | Status |
| --- | --- | --- | --- |
| Build Forecast | Queue tree, history slider, absenteeism chips | Demo missing queue tree, dual horizons, import actions. | ❌ |
| Exceptions | Holiday presets, conflict badges | Demo lacks day/interval toggle + custom range editor. | ❌ |
| Trend Analysis | Confidence band, anomaly list, secondary axis | Demo chart blank unless queue/period seeded (UAT blocked). | ⚠️ |
| Absenteeism | Template gallery with coverage/value | Demo needs calculator workflow (horizon/interval, summary). | ❌ |
| Accuracy | RU-formatted KPIs, error toggles | RU formatting applied; toggles + validation history | ✅ |
| Manual Adjustments | API-backed validation/persist | UI wired; backend mocked pending API | ⚠️ Follow-up |

Notes: Manual adjustment persistence still depends on live API. Build/exceptions/absenteeism/trend gaps must be remediated before parity sign-off.
