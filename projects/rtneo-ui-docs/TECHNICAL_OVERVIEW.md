# Technical Architecture Overview

## Component Hierarchy

```
App (root)
└── Layout
    ├── Sidebar (navigation)
    └── Content Area
        ├── Tab Navigation (top)
        └── Active Tab Component:
            ├── Overview (default)
            ├── Districts
            ├── Sites
            └── Routes
```

## Data Flow

```
metricsData (metrics.ts)
    ↓
Components (via import)
    ↓
Recharts (visualization)
    ↓
DOM (render)
```

No state management library needed — useState in App.tsx is sufficient.

## Key Technologies

### React 18 Features Used
- Functional components only
- React Hooks: `useState` for state
- TypeScript for type safety
- No class components

### Tailwind CSS Pattern
- Utility-first approach
- Custom colors in `tailwind.config.js`
- Custom component classes in `index.css` (@layer components)
- Responsive breakpoints: `sm:`, `md:`, `lg:`

### Recharts Components
- `BarChart` — Overview metrics
- `PieChart` — Districts distribution
- `ResponsiveContainer` — auto-sizing
- `Tooltip` — hover info
- `CartesianGrid` — grid lines

## File Sizes (approx)

```
dist/ (production build)
├── index.html         ~2KB
├── assets/
│   ├── index.js      ~350KB (React + Recharts)
│   └── index.css     ~20KB (Tailwind purged)
└── Total: ~370KB gzipped: ~120KB
```

## Performance Optimizations

✅ Vite code splitting (automatic)  
✅ Tailwind CSS purge (removes unused classes)  
✅ React.StrictMode enabled  
✅ No unnecessary re-renders (memo not needed yet)  
✅ Lazy loading images (native loading="lazy")  

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile: iOS 14+, Android Chrome 90+

## Build Output Structure

```
dist/
├── index.html          # Entry point
├── assets/
│   ├── index-[hash].js    # Main bundle
│   ├── index-[hash].css   # Styles
│   └── vendor-[hash].js   # (optional) vendor chunk
└── vercel.json         # SPA routing config
```

## Environment Variables (when needed)

Create `.env` file:
```
VITE_API_URL=https://api.mytko.ru
VITE_API_KEY=your_key_here
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Testing Strategy (future)

### Unit Tests (Jest + React Testing Library)
```typescript
// Example: Sites.test.tsx
test('filters sites by risk level', () => {
  render(<Sites />);
  // ... assertions
});
```

### E2E Tests (Playwright)
```typescript
// Example: forecast.spec.ts
test('navigates between tabs', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Районы');
  // ... assertions
});
```

## Code Style

- TypeScript strict mode ON
- ESLint rules: default + React Hooks
- Prettier: 2 spaces, single quotes
- File naming: PascalCase for components, camelCase for utilities

## Deployment Pipeline (Vercel)

```
Git Push → GitHub
    ↓
Vercel Webhook
    ↓
Build: npm install && npm run build
    ↓
Deploy to CDN
    ↓
Live URL
```

Auto-deployments on every push to `main`.  
Preview deployments for PRs.

## Security Considerations

- No API keys in client code (use server/proxy)
- HTTPS only (enforced by Vercel)
- CORS: configure on backend
- CSP headers: add in `vercel.json` if needed

## Monitoring (Vercel built-in)

- Real-time logs
- Build analytics
- Runtime analytics
- Core Web Vitals

## Scaling Considerations

Current setup handles:
- 10K+ concurrent users (Vercel CDN)
- 100K+ requests/month (free tier)

For higher scale:
- Add Redis caching
- Implement service workers (PWA)
- Use React.lazy() for route-based code splitting
- Consider Next.js for SSR/SSG

## API Integration Points (future)

```typescript
// src/api/forecast.ts
export async function getForecastMetrics(
  params: ForecastParams
): Promise<MetricsSummary> {
  const response = await fetch(
    `${API_URL}/forecast/metrics?${new URLSearchParams(params)}`
  );
  return response.json();
}
```

Usage in component:
```typescript
const { data, loading, error } = useForecastMetrics();
```

## Common Issues & Solutions

### Issue: Recharts not rendering
**Solution**: Wrap in `<ResponsiveContainer>` with explicit height

### Issue: Tailwind classes not working
**Solution**: Check `tailwind.config.js` content paths

### Issue: TypeScript errors on build
**Solution**: Run `tsc --noEmit` to check types

### Issue: Vercel 404 on refresh
**Solution**: Ensure `vercel.json` has rewrite rules

## Next Steps After Deployment

1. Connect to real API
2. Add authentication
3. Implement role-based access
4. Add tests
5. Setup CI/CD
6. Monitor performance
7. Collect user feedback
8. Iterate based on data
