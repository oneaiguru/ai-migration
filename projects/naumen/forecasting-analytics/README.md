# Forecasting & Analytics Module

A comprehensive forecasting and analytics interface for WFM systems with predictive modeling, interactive charts, and manual adjustment capabilities.

## Features

- **Algorithm Selection**: Basic extrapolation, ARIMA, Linear regression, Seasonal naive
- **Interactive Charts**: Real-time Chart.js visualization with zoom, pan, export
- **Manual Adjustments**: Interval-based editing with validation
- **Accuracy Analytics**: Performance metrics and model comparison
- **Trend Analysis**: Pattern recognition and anomaly detection

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   └── forecasting/
│       ├── forecasting_layout.tsx      # Main container
│       ├── algorithm_selector.tsx      # Algorithm dropdown
│       ├── parameter_panel.tsx         # Dynamic parameters
│       ├── date_range_picker.tsx       # Date selection
│       ├── channel_selector.tsx        # Channel selection
│       ├── time_series_chart.tsx       # Main chart
│       ├── chart_controls.tsx          # Chart controls
│       ├── chart_legend.tsx            # Interactive legend
│       ├── chart_tooltip.tsx           # Custom tooltips
│       ├── accuracy_dashboard.tsx      # Performance metrics
│       ├── adjustment_grid.tsx         # Manual adjustments
│       └── trend_analysis_dashboard.tsx # Trend analysis
├── App.tsx                             # Main app component
├── main.tsx                            # Entry point
└── index.css                           # Global styles
```

## Technology Stack

- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Chart.js for data visualization
- Recharts for additional charts
- Lucide React for icons

## API Integration

The system expects these endpoints (currently mocked):

- `POST /api/v1/math/forecast/generate` - Generate forecasts
- `POST /api/v1/math/accuracy/evaluate` - Evaluate accuracy
- `GET /api/v1/math/trends/analyze` - Analyze trends

## Merging with Employee Portal

To run both forecasting and employee portal in one application:

1. Copy this project's components to the employee portal's `src/components/` directory
2. Add forecasting routes to the employee portal's router
3. Install additional dependencies (chart.js, react-chartjs-2)
4. Update navigation to include forecasting module
