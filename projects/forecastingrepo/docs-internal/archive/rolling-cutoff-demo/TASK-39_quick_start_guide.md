# TASK-39: Quick Start Guide

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 15min

## Goal
Step-by-step guide to start the system and run first forecast.

## Output: docs/QUICK_START.md

Create markdown with sections:

1. **Prerequisites**
   - Python 3.11.3+
   - Node.js 18+
   - 2GB free disk space
   - Git

2. **Backend Setup**
```bash
# Clone and enter project
git clone <repo>
cd projects/forecastingrepo

# Install dependencies
pip install -r requirements-dev.txt

# Check data files exist
ls data/sites_service.csv data/sites_registry.csv

# Start API server
python -m uvicorn scripts.api_app:app --reload
# Server runs at http://localhost:8000
```

3. **Frontend Setup**
```bash
cd ../../projects/mytko-forecast-demo

# Install dependencies
npm install

# Start React dev server
npm run dev
# UI available at http://localhost:5173
```

4. **First Forecast**
   - Open UI in browser
   - Click "Обновить прогноз" (Generate Forecast)
   - Select cutoff date (e.g., 2025-03-15)
   - Select horizon (e.g., 7 days)
   - Wait 30 seconds for computation
   - View results in "Все площадки" table

5. **Generate Bundle**
```bash
python scripts/generate_forecast_bundle.py --cutoff 2025-05-31 --horizon 30
# Creates: output/bundles/forecast_2025-05-31_30d/
```

6. **Troubleshooting**
   - "Data file not found" → Check data/ directory paths
   - "Import error" → Run `pip install -r requirements-dev.txt`
   - "Port 8000 in use" → `python -m uvicorn ... --port 8001`

---

## Acceptance Criteria
- [ ] File created at docs/QUICK_START.md
- [ ] All setup steps clear
- [ ] Commands copy-pasteable
- [ ] Troubleshooting included

---

## On Completion

1. Follow guide start to finish
2. Verify forecast generates successfully
3. Update `/Users/m/ai/progress.md`: Change TASK-39 from 🔴 TODO to 🟢 DONE
4. Commit: "Implement TASK-39: Quick Start Guide"
