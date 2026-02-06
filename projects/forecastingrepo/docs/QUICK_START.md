# Quick Start Guide

Get the Rolling-Cutoff Forecast system running in 15 minutes.

## Prerequisites

Before you begin, ensure you have:

- **Python 3.11.3+** - [Install Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Install Node.js](https://nodejs.org/)
- **2GB free disk space** - For data files and dependencies
- **Git** - [Install Git](https://git-scm.com/downloads)

## Backend Setup

Start the forecast API server:

```bash
# Clone and enter project
git clone <repo>
cd projects/forecastingrepo

# Install dependencies
pip install -r requirements-dev.txt

# Check data files exist (not committed to git)
ls data/sites_service.csv data/sites_registry.csv
# or (alternate layout)
ls data/sites/sites_service.csv data/sites/sites_registry.csv
#
# If your files live elsewhere, set env vars:
# export SITES_SERVICE_PATH=/path/to/sites_service.csv
# export SITES_REGISTRY_PATH=/path/to/sites_registry.csv

# Start API server
python -m uvicorn scripts.api_app:app --reload
# Server runs at http://localhost:8000
```

The API server will start and display:
```
INFO:     Application startup complete [Press ENTER to quit]
```

## Frontend Setup

In a new terminal window, start the React UI:

```bash
cd ../../projects/mytko-forecast-demo

# Install dependencies
npm install

# Start React dev server
npm run dev
# UI available at http://localhost:5173
```

The dev server will display:
```
  ➜  Local:   http://localhost:5173/
```

## First Forecast

Once both servers are running:

1. **Open the UI** - Navigate to http://localhost:5173 in your browser
2. **Click "Обновить прогноз"** - (Generate Forecast button)
3. **Select cutoff date** - Choose a date, e.g., 2025-03-15 (must be ≤ 2025-05-31)
4. **Select horizon** - Choose forecast length, e.g., 7 days
5. **Wait for computation** - The system will compute forecasts (~30 seconds)
6. **View results** - Check the "Все площадки" (All Sites) table for forecast data

## Generate Bundle

To create a demo bundle with pre-computed forecasts:

```bash
python scripts/generate_forecast_bundle.py --cutoff 2025-05-31 --horizon 30
# Creates: output/bundles/forecast_2025-05-31_30d/
```

This generates:
- `forecast_data.parquet` - Fact vs forecast comparisons
- `metadata.json` - Bundle configuration and statistics
- `README.md` - Bundle documentation

## Troubleshooting

### "Data file not found"
**Solution:** Verify data files exist in the project or set env overrides:
```bash
ls -la data/sites_service.csv data/sites_registry.csv
ls -la data/sites/sites_service.csv data/sites/sites_registry.csv
# OR point to your local copies
export SITES_SERVICE_PATH=/path/to/sites_service.csv
export SITES_REGISTRY_PATH=/path/to/sites_registry.csv
```
The site-level CSVs are not committed to git. Restore them locally or set the env vars to your data location.

### "Import error" or "ModuleNotFoundError"
**Solution:** Reinstall dependencies:
```bash
pip install -r requirements-dev.txt
```

### "Port 8000 in use"
**Solution:** Use a different port:
```bash
python -m uvicorn scripts.api_app:app --reload --port 8001
```
Then access API at http://localhost:8001

### "Port 5173 in use"
**Solution:** Use a different port:
```bash
npm run dev -- --port 5174
```
Then access UI at http://localhost:5174

### API request fails with 500 error
**Solution:** Check the API server logs for the error. Common causes:
- Data file path issues
- Missing dependencies
- Cutoff date beyond available data (max 2025-05-31)

### Forecast takes longer than 30 seconds
**Solution:** This is normal for large horizons or first-time computations. System caches results, so subsequent forecasts are faster.

## Next Steps

- **Explore the system** - Try different cutoff dates and horizons
- **Review API docs** - Visit http://localhost:8000/docs for interactive API documentation
- **Check logs** - Monitor backend output for performance metrics
- **Export data** - Use the UI export features to download results as CSV/Excel

## System Architecture

The system consists of:

- **Backend API** (FastAPI) - Runs forecasting algorithms
- **Frontend UI** (React) - Provides user interface for forecast selection and viewing
- **Data Files** - Service history and site registry
- **Cache System** - Speeds up repeated computations

For detailed architecture, see [docs/architecture/](./architecture/)

## Getting Help

For common issues and detailed documentation:
- Check [API documentation](http://localhost:8000/docs)
- Review task specifications in `tasks/rolling-cutoff-demo/`
- Check logs in the terminal where servers are running
