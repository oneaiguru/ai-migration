# ADR‑007: Multiple seasonality (later)

**Status:** Proposed / not implemented in Phase‑1
**Context:** Daily series may exhibit multiple periods (weekly, monthly effects).
**Options:**
- **TBATS** (trigonometric, Box‑Cox, ARMA errors, Trend, Seasonal): handles multiple seasonalities.
- **MSTL** (Multiple Seasonal‑Trend decomposition using Loess): robust decomposition then simple forecasting.
**Decision (now):** keep simple weekday means / 3‑month means. Revisit in Phase‑2 if backtests show persistent multi‑seasonal residues.
**Risks:** model complexity, runtime, overfit.
**Next:** prototype MSTL→ETS and TBATS on backtest harness; compare MASE/RMSSE.

---