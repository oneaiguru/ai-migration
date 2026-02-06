# MyTKO Forecast Demo (Port 5174)

Small Vite + React + MobX application that consumes `/api/mytko/forecast` and renders a lightweight Ant Design dashboard.

## Usage

```bash
cd projects/mytko-forecast-demo
npm install
npm run dev -- --port 5174
```

Environment variables:

- `VITE_API_BASE` — override API origin (defaults to `http://127.0.0.1:8000`).

## Notes

- Forecast schema follows `ForecastDataFormat` from `_incoming/telegram_20251105_184724/extracted/src/_widgets/route/forecast/types.ts`.
- UI imitates MyTKO stack (Ant Design + MobX) but keeps the implementation minimal for demo purposes.
- Screenshots for Opus live under `~/downloads/mytko-forecast-essential/screenshots/` per task brief.
