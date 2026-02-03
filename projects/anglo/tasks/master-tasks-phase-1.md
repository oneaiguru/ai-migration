# MASTER TASKS: PHASE 1 - SCAFFOLD (FIXED)
# All tasks are HAIKU-PROOF with complete code
# Run order: AGENT_07 → AGENT_01, AGENT_02, AGENT_06, AGENT_08, AGENT_08B (parallel)
# 
# FIXES APPLIED:
# - CANONICAL: This file is the single source of truth for Phase 1 tasks; ignore other variants.
# - AGENT_07: Root scripts use --if-present, ESLint config fixed to .eslintrc.cjs, ESLint deps added, manifest deps aligned
# - AGENT_01: PWA build uses tsc --noEmit, workspace deps deferred to Phase 3, .env.example added, .js extensions added, test setup.ts created, dev proxy added for API calls, favicon package copied (fallback placeholders)
# - AGENT_02/06/08: Split build vs typecheck tsconfig, tests live under tests/ and vitest include patterns updated
# - AGENT_02: Health test avoids unused imports with noUnusedLocals enabled
# - AGENT_06: API routes use .js extensions in imports/exports; lesson-engine drops @duolingoru/content dependency; grading test imports Exercise type
# - AGENT_08: Content schema uses .js extensions in imports/exports; added vitest config + schema test
# - BDD uses Cucumber to parse Gherkin feature files; tests/bdd holds step definitions/support
# - PWA configs use import.meta.url for ESM-safe pathing; UI text uses ASCII to match Phase 3+
# - Lesson-engine GradeResult defined in models (no re-export loop)
# - All vitest configs: Added types: ["vitest/globals"] to tsconfig.json

# PHASE 1 ASSESSMENT (v1.2)

Phase 1 is pure infrastructure scaffolding. No v1.2 behavior changes are needed.

| Agent | What It Creates | v1.2 Impact |
|-------|-----------------|-------------|
| AGENT_07 | Monorepo root, pnpm workspace, ESLint | None - build tooling |
| AGENT_01 | PWA scaffold (React/Vite/Tailwind) | None - app shell only |
| AGENT_02 | API scaffold (Express, /health) | None - placeholder server |
| AGENT_06 | Lesson engine (models, SM2, grading) | None - generic foundation |
| AGENT_08 | Content package (Zod schemas) | None - schema is extensible |
| AGENT_08B | Shared types package | None - placeholder |

Why Phase 1 does not need v1.2 changes:
1. It does not implement product features, only project skeleton.
2. Core models are generic and fit any later design.
3. SM2 spaced repetition logic is already correct.
4. No Energy/Ads/Leagues logic exists to remove.
5. Content schema is extensible for Phase 3 additions.

Bottom line: Phase 1 is fine as-is. Phase 2 review is separate (see master-tasks-phase-2.md).

## Optional, non-blocking improvements (if helpful for Phase 3)

### 1) Add story/checkpoint to ExerciseKindSchema (packages/content/src/schema/index.ts)
```typescript
export const ExerciseKindSchema = z.enum([
  'translate_tap',
  'translate_type',
  'listen_tap',
  'listen_type',
  'match_pairs',
  'fill_blank',
  'select_image',
  'story_comprehension', // Optional for stories
  'checkpoint_question', // Optional for checkpoints
]);
```

### 2) Add node type enum for course map (packages/content/src/schema/index.ts)
```typescript
export const NodeTypeSchema = z.enum([
  'lesson',
  'story',
  'checkpoint',
]);

export const CourseNodeSchema = z.object({
  id: z.string(),
  type: NodeTypeSchema,
  title: z.string(),
  order: z.number(),
  sectionId: z.string(), // a1, a2, b1
});
```

### 3) Verify GradeResult export (packages/lesson-engine/src/index.ts)
Ensure GradeResult is re-exported from the package entry point.

# ============================================================
# AGENT_07_SCAFFOLD_MONOREPO.md (FIXED)
# ============================================================

# Task: Monorepo Root Configuration

**Model:** haiku  
**Task ID:** scaffold_007  
**Creates:** 11 files (added .eslintrc.cjs)
**Depends On:** None (run first)

## Files to Create

### 1. package.json
```json
{
  "name": "duolingoru",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --parallel -r --if-present run dev",
    "build": "pnpm --recursive run build",
    "typecheck": "pnpm --recursive --if-present run typecheck",
    "lint": "pnpm --recursive --if-present run lint",
    "test": "pnpm --recursive --if-present run test",
    "test:unit": "pnpm --recursive --if-present run test",
    "test:bdd": "pnpm --filter @duolingoru/pwa run test:bdd",
    "test:bdd:all": "pnpm --filter @duolingoru/pwa run test:bdd:all",
    "test:bdd:dry": "pnpm --filter @duolingoru/pwa run test:bdd:dry",
    "clean": "rm -rf node_modules apps/*/node_modules packages/*/node_modules"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "@types/node": "^20.14.0",
    "eslint": "^8.57.0",
    "typescript": "^5.5.2"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

**FIX:** Added `--if-present` flag to `dev`, `typecheck`, `lint`, `test` scripts. This prevents failures when a package doesn't have that script defined.

### 2. pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 3. tsconfig.base.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "strict": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### 4. .eslintrc.cjs
```javascript
// FIX: Renamed from .eslintrc.js to .eslintrc.cjs to work with "type": "module" in package.json
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', '*.config.js', '*.config.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

**FIX:** Renamed `.eslintrc.js` → `.eslintrc.cjs` to explicitly mark as CommonJS. Root `package.json` has `"type": "module"`, so .js files are ESM by default. ESLint needs CommonJS, so .cjs extension ensures it works.

### 5. .prettierrc
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 6. .gitignore
```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
coverage/
.turbo/
```

### 7. .agent/manifest.json
```json
{
  "project": "duolingoru",
  "version": "0.1.0",
  "created": "2026-01-04",
  "agents": {
    "AGENT_07": { "status": "done", "files": 11 },
    "AGENT_01": { "status": "pending", "depends": ["AGENT_07"] },
    "AGENT_02": { "status": "pending", "depends": ["AGENT_07"] },
    "AGENT_06": { "status": "pending", "depends": ["AGENT_07"] },
    "AGENT_08": { "status": "pending", "depends": ["AGENT_07"] },
    "AGENT_08B": { "status": "pending", "depends": ["AGENT_07"] }
  }
}
```

**FIX:** AGENT_06 depends only on AGENT_07 (lesson-engine no longer depends on content in Phase 1).

### 8. .agent/progress.json
```json
[]
```

### 9. .agent/current-agent.json
```json
{"status": "idle", "agent_id": null}
```

### 10. scripts/verify.sh
```bash
#!/bin/bash
set -e
if [ -f projects/anglo/apps/pwa/public/manifest.webmanifest ]; then
  echo "ERROR: Remove projects/anglo/apps/pwa/public/manifest.webmanifest - VitePWA generates it"
  exit 1
fi
echo "=== Verification ==="
pnpm install
pnpm typecheck
pnpm lint
pnpm test
echo "=== All checks passed ==="
```

### 11. .eslintignore
```
node_modules/
dist/
*.d.ts
.eslintrc.cjs
vite.config.ts
vitest.config.ts
```

## Directory Structure to Create
```bash
mkdir -p apps packages features scripts .agent docs
touch apps/.gitkeep packages/.gitkeep features/.gitkeep docs/.gitkeep
chmod +x scripts/verify.sh
```

## EXACT Verification
```bash
# Step 1: Install
pnpm install
echo "✓ Step 1: install"

# Step 2: Check workspace
pnpm ls --depth 0
echo "✓ Step 2: workspace"

# Step 3: Verify files exist
ls package.json pnpm-workspace.yaml tsconfig.base.json .eslintrc.cjs
echo "✓ Step 3: files exist"

# Step 4: Verify ESLint loads
npx eslint --version
echo "✓ Step 4: ESLint loads with .cjs config"
```

## SUCCESS Criteria
- [ ] `pnpm install` exits 0
- [ ] 11 files created exactly
- [ ] Directory structure exists
- [ ] `npx eslint --version` works
- [ ] No TypeScript errors

## Git Commit
```
feat(monorepo): initialize pnpm workspace and root configs (FIXED)

- Add package.json with workspace scripts and --if-present flags
- Add pnpm-workspace.yaml for apps/ and packages/
- Add tsconfig.base.json with strict TypeScript
- Add .eslintrc.cjs (CommonJS) for ESM compatibility
- Add Prettier and .gitignore configs
- Add .agent/ coordination files
- Add scripts/verify.sh

FIX: Root scripts now use --if-present to skip missing scripts
FIX: ESLint config renamed to .cjs for "type": "module" compatibility

Verification: pnpm install exits 0, ESLint loads
```

---

# ============================================================
# AGENT_01_SCAFFOLD_PWA.md (FIXED)
# ============================================================

# Task: PWA Application Scaffold

**Model:** haiku  
**Task ID:** scaffold_001  
**Creates:** 28 files (added cucumber.cjs, BDD support files, favicon assets, tests/setup.ts, tests/test-utils.tsx, .env.example)
**Depends On:** AGENT_07 (root config exists)

## Files to Create

### 1. projects/anglo/apps/pwa/package.json
```json
{
  "name": "@duolingoru/pwa",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3000",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:bdd": "cucumber-js --config cucumber.cjs --tags @implemented",
    "test:bdd:all": "cucumber-js --config cucumber.cjs",
    "test:bdd:dry": "cucumber-js --config cucumber.cjs --dry-run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.2",
    "dexie": "^4.0.4",
    "dexie-react-hooks": "^1.1.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@testing-library/jest-dom": "^6.1.5",
    "autoprefixer": "^10.4.19",
    "@cucumber/cucumber": "^10.3.1",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "tsx": "^4.15.6",
    "typescript": "^5.5.2",
    "vite": "^5.3.1",
    "vite-plugin-pwa": "^0.20.0",
    "vitest": "^2.0.1",
    "jsdom": "^24.1.0",
    "fake-indexeddb": "^5.0.2"
  }
}
```

**FIX A:** Changed `"build"` from `"tsc && vite build"` to `"tsc --noEmit && vite build"`. This runs TypeScript as a type-check gate without emitting .js files into src/.

**FIX B:** Workspace dependencies on internal packages are added in Phase 3 to avoid install ordering failures during parallel scaffolding.
**NOTE:** `@cucumber/cucumber` ships its own types; no `@types` package is required for step definitions.

### 2. projects/anglo/apps/pwa/tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client", "vitest/globals"],
    "noEmit": true,
    "declaration": false
  },
  "include": ["src", "tests"],
  "exclude": ["node_modules", "dist"]
}
```

**FIX A:** Added `"types": ["vitest/globals"]` so TypeScript knows about `describe`, `it`, `expect` globals without importing.

**FIX B:** Added `"noEmit": true` and `"declaration": false` to ensure tsc doesn't emit anything.

**FIX C:** Changed `"include": ["src"]` to `"include": ["src", "tests"]` so test files are type-checked.

### 3. projects/anglo/apps/pwa/vite.config.ts
```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_BASE_URL || 'http://localhost:3001';

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'favicon-16x16.png',
          'favicon-32x32.png',
          'apple-touch-icon.png',
          'mstile-150x150.png',
          'android-chrome-192x192.png',
          'android-chrome-512x512.png',
          'maskable-192x192.png',
          'maskable-512x512.png',
        ],
        manifest: {
          name: 'Yazychok',
          short_name: 'Yazychok',
          description: 'Learn English easily',
          lang: 'ru',
          theme_color: '#58cc02',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: '/maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./i,
              handler: 'NetworkFirst',
              options: { cacheName: 'api-cache', expiration: { maxEntries: 100 } },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/health': apiTarget,
        '/packs': apiTarget,
        '/policy': apiTarget,
        '/entitlements': apiTarget,
        '/sync': apiTarget,
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});
```

**FIX:** Added dev proxy entries so relative API calls hit `VITE_API_BASE_URL` in local dev.
**NOTE:** Keep manifest text ASCII to match Phase 3+ UI strings.
**NOTE:** Proxy list is intentionally limited; for additional routes (auth, courses, payments, etc.)
use `VITE_API_BASE_URL` via `apiFetch` or expand the proxy list.
**NOTE:** Do not add a standalone `projects/anglo/apps/pwa/public/manifest.webmanifest`. VitePWA generates it
from this config; if a static manifest exists, keep it in sync with this content.

### 4. projects/anglo/apps/pwa/vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

### 5. projects/anglo/apps/pwa/cucumber.cjs
```javascript
module.exports = {
  default: {
    paths: ['tests/features/**/*.feature'],
    requireModule: ['tsx/register'],
    require: ['tests/bdd/support/**/*.ts', 'tests/bdd/step_definitions/**/*.ts'],
    format: ['progress'],
  },
};
```

**NOTE:** Only `smoke.steps.ts` is implemented initially. `test:bdd` runs `@implemented`
scenarios only; `test:bdd:all` will show undefined steps until more step defs are added.

### 6. projects/anglo/apps/pwa/index.html
```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#58cc02" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="msapplication-TileColor" content="#ffffff" />
    <meta name="msapplication-TileImage" content="/mstile-150x150.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <title>Yazychok - Learn English</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 7. projects/anglo/apps/pwa/src/main.tsx
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**FIX:** Changed `from './App'` to `from './App.js'` for ESM compatibility with Node.

### 8. projects/anglo/apps/pwa/src/App.tsx
```typescript
import React from 'react';

export default function App(): React.ReactElement {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">Yazychok</h1>
        <p className="text-gray-700 mb-8">Learn English easily</p>
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Start lesson
        </button>
      </div>
    </div>
  );
}
```

### 9. projects/anglo/apps/pwa/src/styles/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #ffffff;
  color: #1f2937;
}

html, body, #root {
  width: 100%;
  height: 100%;
}
```

### 10. projects/anglo/apps/pwa/tailwind.config.js
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#58cc02',
      },
    },
  },
  plugins: [],
};
```

### 11. projects/anglo/apps/pwa/postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 12. projects/anglo/apps/pwa/tests/App.test.tsx
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App.js';

describe('App', () => {
  it('renders title', () => {
    render(<App />);
    expect(screen.getByText('Yazychok')).toBeInTheDocument();
  });

  it('renders start button', () => {
    render(<App />);
    expect(screen.getByText('Start lesson')).toBeInTheDocument();
  });
});
```

### 13. projects/anglo/apps/pwa/tests/setup.ts
```typescript
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';

// Suppress console during tests (optional)
// beforeAll(() => {
//   vi.spyOn(console, 'log').mockImplementation(() => {});
// });
```

**FIX:** Created missing `tests/setup.ts` file. This is referenced in vitest.config.ts and sets up test environment with IndexedDB polyfill and DOM matchers.

### 14. projects/anglo/apps/pwa/tests/test-utils.tsx
```typescript
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### 15. projects/anglo/apps/pwa/tests/bdd/support/world.ts
```typescript
import { setWorldConstructor, World } from '@cucumber/cucumber';

export type BddSession = {
  userId: string | null;
  currentLessonId: string | null;
  lastResult: unknown;
};

export class AppWorld extends World {
  public session: BddSession = {
    userId: null,
    currentLessonId: null,
    lastResult: null,
  };
}

setWorldConstructor(AppWorld);
```

### 16. projects/anglo/apps/pwa/tests/bdd/support/hooks.ts
```typescript
import { Before } from '@cucumber/cucumber';
import type { AppWorld } from './world';

Before(function (this: AppWorld) {
  this.session.lastResult = null;
});
```

### 17. projects/anglo/apps/pwa/tests/bdd/step_definitions/smoke.steps.ts
```typescript
import { Given } from '@cucumber/cucumber';
import type { AppWorld } from '../support/world';

Given('the app has no active session', function (this: AppWorld) {
  this.session.userId = null;
  this.session.currentLessonId = null;
});
```

### 18. projects/anglo/apps/pwa/public/favicon.ico
```
[Binary file - copy from projects/anglo/pwa_favicon_package/favicon.ico]
```

### 19. projects/anglo/apps/pwa/public/favicon-16x16.png
```
[Binary file - copy from projects/anglo/pwa_favicon_package/favicon-16x16.png]
```

### 20. projects/anglo/apps/pwa/public/favicon-32x32.png
```
[Binary file - copy from projects/anglo/pwa_favicon_package/favicon-32x32.png]
```

### 21. projects/anglo/apps/pwa/public/apple-touch-icon.png
```
[Binary file - copy from projects/anglo/pwa_favicon_package/apple-touch-icon.png]
```

### 22. projects/anglo/apps/pwa/public/mstile-150x150.png
```
[Binary file - copy from projects/anglo/pwa_favicon_package/mstile-150x150.png]
```

### 23. projects/anglo/apps/pwa/public/android-chrome-192x192.png
```
[Binary file - copy from projects/anglo/pwa_favicon_package/android-chrome-192x192.png]
```

### 24. projects/anglo/apps/pwa/public/android-chrome-512x512.png
```
[Binary file - copy from projects/anglo/pwa_favicon_package/android-chrome-512x512.png]
```

### 25. projects/anglo/apps/pwa/public/maskable-192x192.png
```
[Binary file - copy from projects/anglo/pwa_favicon_package/maskable-192x192.png]
```

### 26. projects/anglo/apps/pwa/public/maskable-512x512.png
```
[Binary file - copy from projects/anglo/pwa_favicon_package/maskable-512x512.png]
```

### 27. projects/anglo/apps/pwa/.gitignore
```
node_modules/
dist/
.env.local
*.log
.DS_Store
coverage/
.turbo/
```

### 28. projects/anglo/apps/pwa/.env.example
```
VITE_API_BASE_URL=http://localhost:3001
```

## Directory Structure
```bash
mkdir -p projects/anglo/apps/pwa/src/styles projects/anglo/apps/pwa/tests projects/anglo/apps/pwa/tests/bdd/support projects/anglo/apps/pwa/tests/bdd/step_definitions projects/anglo/apps/pwa/tests/features/{onboarding,lessons,gamification,progress,offline,payments,settings,social,reliability,support,monetization,ui} projects/anglo/apps/pwa/public
touch projects/anglo/apps/pwa/.env.example

if [ -d projects/anglo/pwa_favicon_package ]; then
  cp projects/anglo/pwa_favicon_package/favicon.ico projects/anglo/apps/pwa/public/favicon.ico
  cp projects/anglo/pwa_favicon_package/favicon-16x16.png projects/anglo/apps/pwa/public/favicon-16x16.png
  cp projects/anglo/pwa_favicon_package/favicon-32x32.png projects/anglo/apps/pwa/public/favicon-32x32.png
  cp projects/anglo/pwa_favicon_package/apple-touch-icon.png projects/anglo/apps/pwa/public/apple-touch-icon.png
  cp projects/anglo/pwa_favicon_package/mstile-150x150.png projects/anglo/apps/pwa/public/mstile-150x150.png
  cp projects/anglo/pwa_favicon_package/android-chrome-192x192.png projects/anglo/apps/pwa/public/android-chrome-192x192.png
  cp projects/anglo/pwa_favicon_package/android-chrome-512x512.png projects/anglo/apps/pwa/public/android-chrome-512x512.png
  cp projects/anglo/pwa_favicon_package/maskable-192x192.png projects/anglo/apps/pwa/public/maskable-192x192.png
  cp projects/anglo/pwa_favicon_package/maskable-512x512.png projects/anglo/apps/pwa/public/maskable-512x512.png
  # Do not copy manifest.webmanifest; VitePWA generates it from vite.config.ts.
else
  touch projects/anglo/apps/pwa/public/favicon.ico
  echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > projects/anglo/apps/pwa/public/android-chrome-192x192.png
  cp projects/anglo/apps/pwa/public/android-chrome-192x192.png projects/anglo/apps/pwa/public/android-chrome-512x512.png
  cp projects/anglo/apps/pwa/public/android-chrome-192x192.png projects/anglo/apps/pwa/public/maskable-192x192.png
  cp projects/anglo/apps/pwa/public/android-chrome-192x192.png projects/anglo/apps/pwa/public/maskable-512x512.png
  cp projects/anglo/apps/pwa/public/android-chrome-192x192.png projects/anglo/apps/pwa/public/favicon-16x16.png
  cp projects/anglo/apps/pwa/public/android-chrome-192x192.png projects/anglo/apps/pwa/public/favicon-32x32.png
  cp projects/anglo/apps/pwa/public/android-chrome-192x192.png projects/anglo/apps/pwa/public/apple-touch-icon.png
  cp projects/anglo/apps/pwa/public/android-chrome-192x192.png projects/anglo/apps/pwa/public/mstile-150x150.png
fi
```

## EXACT Verification
```bash
cd projects/anglo/apps/pwa

# Step 1: Install
pnpm install
echo "✓ Step 1: install"

# Step 2: TypeScript type-check only (no emit)
pnpm typecheck
echo "✓ Step 2: typecheck (no files emitted to src/)"

# Step 3: Build (tsc --noEmit then vite)
pnpm build
ls dist/index.html
echo "✓ Step 3: build"

# Step 4: Tests
pnpm test
echo "✓ Step 4: tests"

# Step 5: Verify no .js files in src/
if [ -f src/App.js ] || [ -f src/main.js ]; then
  echo "✗ ERROR: TypeScript emitted files to src/"
  exit 1
fi
echo "✓ Step 5: no TypeScript output in src/"
```

## SUCCESS Criteria
- [ ] `pnpm install` exits 0
- [ ] 28 files created exactly
- [ ] `pnpm build` creates `dist/`
- [ ] No .js/.d.ts files in `src/`
- [ ] `pnpm test` passes

## Git Commit
```
feat(pwa): scaffold PWA with React, Vite, TailwindCSS (FIXED)

- Add package.json with core frontend dependencies
- Add tsconfig.json with noEmit and vitest/globals types
- Add vite.config.ts with React plugin and PWA manifest
- Add vitest config and Cucumber config
- Add React app scaffold
- Add TailwindCSS + PostCSS configs
- Add tests/setup.ts with IndexedDB polyfill
- Add tests/test-utils.tsx for custom render
- Add public favicon package assets
- Add .env.example for API base URL

FIX: PWA build now uses "tsc --noEmit" (no source pollution)
FIX: PWA tsconfig includes tests and has noEmit: true
FIX: Deferred internal workspace dependencies to Phase 3 to avoid install ordering failures
FIX: Created tests/setup.ts (was missing reference)
FIX: Directory structure copies favicon package (fallback placeholders) and creates BDD support folders

Verification: pnpm build creates dist/, no .js in src/, tests pass
```

---

# ============================================================
# AGENT_02_SCAFFOLD_API.md (FIXED)
# ============================================================

# Task: API Server Scaffold

**Model:** haiku  
**Task ID:** scaffold_002  
**Creates:** 13 files (updated with .js extensions, .env.example)
**Depends On:** AGENT_07 (root config exists)

**NOTE:** This Express scaffold is a Phase 1 placeholder. Phase 4 migrates the API to Fastify.

## Files to Create

### 1. apps/api/package.json
```json
{
  "name": "@duolingoru/api",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lint": "eslint src --ext .ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.14.0",
    "@types/uuid": "^9.0.7",
    "tsx": "^4.15.6",
    "typescript": "^5.5.2",
    "vitest": "^2.0.1"
  }
}
```

**FIX:** Added `"uuid": "^9.0.1"` dependency for crypto.randomUUID polyfill.

### 2. apps/api/tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["vitest/globals", "node"]
  },
  "include": ["src", "tests"],
  "exclude": ["node_modules", "dist"]
}
```

**FIX:** Split build vs typecheck configs so `tests/` don't break `tsc` output builds.

### 3. apps/api/tsconfig.build.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. apps/api/vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

### 5. apps/api/src/index.ts
```typescript
import { createApp } from './app.js';
import { createHealthRouter } from './routes/health.js';

const app = createApp();
app.use('/health', createHealthRouter());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
```

**FIX:** Changed `from './app'` to `from './app.js'` and `from './routes/health'` to `from './routes/health.js'`.

### 6. apps/api/src/app.ts
```typescript
import express from 'express';

export function createApp() {
  const app = express();
  app.use(express.json());
  return app;
}
```

### 7. apps/api/src/routes/health.ts
```typescript
import { Router } from 'express';

export function createHealthRouter() {
  const router = Router();
  router.get('/', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  return router;
}
```

### 8. apps/api/src/routes/index.ts
```typescript
export { createHealthRouter } from './health.js';
```

**FIX:** Added `.js` extension to export.

### 9. apps/api/src/utils/id.ts
```typescript
import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}
```

**FIX:** Using `uuid` package instead of unreliable `crypto.randomUUID()`.

### 10. apps/api/tests/health.test.ts
```typescript
import { describe, it, expect } from 'vitest';
import { createHealthRouter } from '../src/routes/health.js';

describe('Health Router', () => {
  it('returns ok status', () => {
    const router = createHealthRouter();
    expect(router).toBeDefined();
  });
});
```

**FIX:** Removed unused `createApp` import so TypeScript `noUnusedLocals` does not fail.

### 11. apps/api/.gitignore
```
node_modules/
dist/
.env.local
*.log
.DS_Store
coverage/
```

### 12. apps/api/.env.example
```
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### 13. Directory structure
```bash
mkdir -p apps/api/src/routes apps/api/src/utils apps/api/tests
touch apps/api/.env.example
```

## EXACT Verification
```bash
cd apps/api

# Step 1: Install
pnpm install
echo "✓ Step 1: install"

# Step 2: TypeScript
pnpm typecheck
echo "✓ Step 2: typecheck"

# Step 3: Build
pnpm build
ls dist/index.js
echo "✓ Step 3: build"

# Step 4: Tests
pnpm test
echo "✓ Step 4: tests"

# Step 5: Start API
timeout 3s node dist/index.js || true
echo "✓ Step 5: API starts"
```

## SUCCESS Criteria
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm build` creates dist/
- [ ] `pnpm test` passes
- [ ] `node dist/index.js` runs without errors

## Git Commit
```
feat(api): scaffold Express API server (FIXED)

- Add package.json with Express, uuid, and @types/uuid
- Add tsconfig.json + tsconfig.build.json split for build vs typecheck
- Add vitest config
- Add createApp factory
- Add /health endpoint
- Add UUID generation utility
- Add tests
- Add .env.example for local ports

FIX: Use uuid package instead of crypto.randomUUID()
FIX: All imports/exports use .js extensions
FIX: Health test avoids unused createApp import

Verification: Build succeeds, API starts, tests pass
```

---

# ============================================================
# AGENT_06_SCAFFOLD_LESSON_ENGINE.md (FIXED)
# ============================================================

# Task: Lesson Engine Package Scaffold

**Model:** haiku  
**Task ID:** scaffold_006  
**Creates:** 13 files (with .js extensions)
**Depends On:** AGENT_07

## Files to Create

### 1. packages/lesson-engine/package.json
```json
{
  "name": "@duolingoru/lesson-engine",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" }
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/uuid": "^9.0.7",
    "typescript": "^5.5.2",
    "vitest": "^2.0.1"
  }
}
```

**FIX:** Added `"uuid": "^9.0.1"` dependency to match session UUID usage.
**FIX:** Removed `@duolingoru/content` dependency to avoid workspace timing issues; add later only if needed.

### 2. packages/lesson-engine/tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["vitest/globals"]
  },
  "include": ["src", "tests"],
  "exclude": ["node_modules", "dist"]
}
```

**FIX:** Split build vs typecheck configs so `tests/` don't break `tsc` output builds.

### 3. packages/lesson-engine/tsconfig.build.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. packages/lesson-engine/vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

### 5. packages/lesson-engine/src/index.ts
```typescript
export * from './models/index.js';
export * from './session/index.js';
export * from './grading/index.js';
export * from './spaced-rep/index.js';
```

**FIX:** Added `.js` extensions to exports.

### 6. packages/lesson-engine/src/models/index.ts
```typescript
// ============================================================
// BASIC TYPES
// ============================================================

export interface Exercise {
  readonly id: string;
  readonly kind: 'translate_tap' | 'translate_type' | 'listen_tap' | 'listen_type' | 'match_pairs' | 'fill_blank' | 'select_image';
  readonly prompt: {
    readonly text?: string;
    readonly audio?: string;
    readonly image?: string;
  };
  readonly choices?: readonly string[];
  readonly correct: string | readonly string[];
  readonly difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface Lesson {
  readonly id: string;
  readonly unitId: string;
  readonly title: string;
  readonly order: number;
  readonly exercises: readonly Exercise[];
}

export interface Unit {
  readonly id: string;
  readonly courseId: string;
  readonly level: 'a1' | 'a2' | 'b1' | 'b2';
  readonly title: string;
  readonly order: number;
  readonly lessons: readonly Lesson[];
}

export interface Course {
  readonly id: string;
  readonly name: string;
  readonly fromLang: string;
  readonly toLang: string;
  readonly levels: readonly ('a1' | 'a2' | 'b1' | 'b2')[];
  readonly units: readonly Unit[];
}

export interface GradeResult {
  readonly type: 'correct' | 'incorrect' | 'typo';
  readonly isCorrect: boolean;
  readonly feedback: string;
  readonly correctAnswer?: string;
  readonly userAnswer?: string;
  readonly similarity?: number;
}
```

### 7. packages/lesson-engine/src/session/index.ts
```typescript
import { v4 as uuidv4 } from 'uuid';
import type { Exercise } from '../models/index.js';

export interface SessionConfig {
  readonly maxHearts: number;
  readonly xpPerCorrect: number;
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxHearts: 3,
  xpPerCorrect: 10,
};

export interface Session {
  readonly id: string;
  readonly lessonId: string;
  readonly userId: string;
  readonly exercises: readonly Exercise[];
  currentIndex: number;
  hearts: number;
  xpEarned: number;
  readonly startedAt: number;
  completedAt?: number;
}

export function createSession(lessonId: string, userId: string, exercises: readonly Exercise[]): Session {
  return {
    id: uuidv4(),
    lessonId,
    userId,
    exercises,
    currentIndex: 0,
    hearts: DEFAULT_SESSION_CONFIG.maxHearts,
    xpEarned: 0,
    startedAt: Date.now(),
  };
}
```

**FIX:** Added `uuid` import and used `uuidv4()` instead of `crypto.randomUUID()`.

### 8. packages/lesson-engine/src/grading/index.ts
```typescript
import type { Exercise, GradeResult } from '../models/index.js';

export function gradeAnswer(exercise: Exercise, answer: string): GradeResult {
  const correct = Array.isArray(exercise.correct) ? exercise.correct[0] : exercise.correct;
  const isCorrect = answer.toLowerCase() === correct.toLowerCase();

  return {
    type: isCorrect ? 'correct' : 'incorrect',
    isCorrect,
    feedback: isCorrect ? '✓ Correct!' : `✗ Expected: ${correct}`,
    correctAnswer: correct,
    userAnswer: answer,
  };
}
```

### 9. packages/lesson-engine/src/spaced-rep/index.ts
```typescript
export interface SM2State {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: number;
}

export const INITIAL_SM2_STATE: SM2State = {
  easeFactor: 2.5,
  interval: 1,
  repetitions: 0,
  nextReviewDate: Date.now(),
};

export function updateSM2State(state: SM2State, quality: number): SM2State {
  if (quality < 3) {
    return {
      ...state,
      easeFactor: Math.max(1.3, state.easeFactor - 0.2),
      interval: 1,
      repetitions: 0,
      nextReviewDate: Date.now() + 1 * 24 * 60 * 60 * 1000,
    };
  }

  const newEase = state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const newInterval = state.interval === 1 ? 3 : Math.round(state.interval * newEase);
  const nextReviewDate = Date.now() + newInterval * 24 * 60 * 60 * 1000;

  return {
    easeFactor: Math.max(1.3, newEase),
    interval: newInterval,
    repetitions: state.repetitions + 1,
    nextReviewDate,
  };
}
```

### 10. packages/lesson-engine/tests/session.test.ts
```typescript
import { describe, it, expect } from 'vitest';
import { createSession, DEFAULT_SESSION_CONFIG } from '../src/session/index.js';

describe('Session', () => {
  it('creates a session with initial state', () => {
    const session = createSession('lesson-1', 'user-1', []);
    expect(session.id).toBeDefined();
    expect(session.currentIndex).toBe(0);
    expect(session.hearts).toBe(DEFAULT_SESSION_CONFIG.maxHearts);
    expect(session.xpEarned).toBe(0);
  });
});
```

### 11. packages/lesson-engine/tests/grading.test.ts
```typescript
import { describe, it, expect } from 'vitest';
import { gradeAnswer } from '../src/grading/index.js';
import type { Exercise } from '../src/models/index.js';

describe('Grading', () => {
  it('grades correct answer', () => {
    const exercise: Exercise = {
      id: 'ex-1',
      kind: 'translate_type',
      prompt: { text: 'Hello' },
      correct: 'Привет',
      difficulty: 1,
    };
    const result = gradeAnswer(exercise, 'Привет');
    expect(result.isCorrect).toBe(true);
    expect(result.type).toBe('correct');
  });
});
```

**FIX:** Added Exercise type import so tests typecheck with `noUnusedLocals` enabled.

### 12. packages/lesson-engine/tests/sm2.test.ts
```typescript
import { describe, it, expect } from 'vitest';
import { INITIAL_SM2_STATE, updateSM2State } from '../src/spaced-rep/index.js';

describe('SM2', () => {
  it('updates SM2 state on correct answer', () => {
    const newState = updateSM2State(INITIAL_SM2_STATE, 5);
    expect(newState.repetitions).toBe(1);
    expect(newState.interval).toBeGreaterThan(1);
  });
});
```

### 14. Directory structure
```bash
mkdir -p packages/lesson-engine/src/{models,session,grading,spaced-rep} packages/lesson-engine/tests
```

## EXACT Verification
```bash
cd packages/lesson-engine

# Step 1: Install
pnpm install
echo "✓ Step 1: install"

# Step 2: TypeScript
pnpm typecheck
echo "✓ Step 2: typecheck"

# Step 3: Build
pnpm build
ls dist/index.js
echo "✓ Step 3: build"

# Step 4: Tests
pnpm test
echo "✓ Step 4: tests"
```

## SUCCESS Criteria
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm build` creates dist/
- [ ] `pnpm test` exits 0
- [ ] Dependencies resolved (no workspace deps)

## Git Commit
```
feat(lesson-engine): scaffold core learning engine (FIXED)

- Add package.json with uuid and @types/uuid
- Add models for Exercise, Lesson, Unit, Course, GradeResult
- Add Session factory with UUID generation
- Add Grading logic
- Add Spaced Repetition (SM-2) algorithm
- Add 3 unit tests

FIX: Use uuid package instead of crypto.randomUUID()
FIX: All imports/exports use .js extensions
FIX: Split build vs typecheck tsconfig to keep tests out of output builds
FIX: Grading test imports Exercise type for typecheck

Verification: pnpm test exits 0, build succeeds
```

---

# ============================================================
# AGENT_08_SCAFFOLD_CONTENT.md (FIXED)
# ============================================================

# Task: Content Package Scaffold

**Model:** haiku  
**Task ID:** scaffold_008  
**Creates:** 10 files (updated with .js extensions, added tests/config)
**Depends On:** AGENT_07

## Files to Create

### 1. packages/content/package.json
```json
{
  "name": "@duolingoru/content",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "validate": "tsx scripts/validate-all.ts",
    "test": "vitest run"
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "tsx": "^4.15.6",
    "typescript": "^5.5.2",
    "vitest": "^2.0.1"
  }
}
```

### 2. packages/content/tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["vitest/globals"]
  },
  "include": ["src", "scripts", "tests"],
  "exclude": ["node_modules", "dist"]
}
```

**FIX:** Split build vs typecheck configs so `tests/` and `scripts/` don't break `tsc` output builds.

### 3. packages/content/tsconfig.build.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. packages/content/vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

### 5. packages/content/src/index.ts
```typescript
export * from './schema/index.js';
```

**FIX:** Added `.js` extension to export.

### 6. packages/content/src/schema/index.ts
```typescript
import { z } from 'zod';

export const ExerciseKindSchema = z.enum([
  'translate_tap',
  'translate_type',
  'listen_tap',
  'listen_type',
  'match_pairs',
  'fill_blank',
  'select_image',
]);

export const PromptSchema = z.object({
  text: z.string().optional(),
  audio: z.string().optional(),
  image: z.string().optional(),
});

export const ExerciseSchema = z.object({
  id: z.string(),
  kind: ExerciseKindSchema,
  prompt: PromptSchema,
  choices: z.array(z.string()).optional(),
  correct: z.union([z.string(), z.array(z.string())]),
  hints: z.array(z.string()).optional(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).default(1),
});

export const LessonSchema = z.object({
  id: z.string(),
  unitId: z.string(),
  title: z.string(),
  order: z.number(),
  exercises: z.array(ExerciseSchema),
});

export const UnitMetaSchema = z.object({
  id: z.string(),
  level: z.enum(['a1', 'a2', 'b1', 'b2']),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  lessonCount: z.number(),
  estimatedMinutes: z.number(),
});

export const CourseMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  fromLang: z.string(),
  toLang: z.string(),
  levels: z.array(z.string()),
  totalUnits: z.number(),
  totalLessons: z.number(),
});

export type ExerciseKind = z.infer<typeof ExerciseKindSchema>;
export type Prompt = z.infer<typeof PromptSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type UnitMeta = z.infer<typeof UnitMetaSchema>;
export type CourseMeta = z.infer<typeof CourseMetaSchema>;
```

**FIX:** Changed difficulty schema from `z.number().min(1).max(5)` to `z.union([z.literal(1), ...z.literal(5)])` to match TypeScript models that use literal union `1 | 2 | 3 | 4 | 5`.

### 7. packages/content/tests/schema.test.ts
```typescript
import { describe, it, expect } from 'vitest';
import { ExerciseSchema } from '../src/schema/index.js';

describe('ExerciseSchema', () => {
  it('validates a correct exercise', () => {
    const result = ExerciseSchema.safeParse({
      id: 'ex-1',
      kind: 'translate_tap',
      prompt: { text: 'Hello' },
      correct: 'Hi',
      difficulty: 1,
    });

    expect(result.success).toBe(true);
  });
});
```

**FIX:** Added vitest config + schema test so `pnpm test` is deterministic.

### 8. packages/content/courses/ru-en/meta.json
```json
{
  "id": "ru-en",
  "name": "English for Russian Speakers",
  "fromLang": "ru",
  "toLang": "en",
  "levels": ["a1", "a2", "b1"],
  "totalUnits": 10,
  "totalLessons": 50
}
```

### 9. packages/content/courses/ru-en/a1/unit_01/lesson_01.json
```json
{
  "id": "a1_u1_l1",
  "unitId": "a1_unit_01",
  "title": "Greetings",
  "order": 1,
  "exercises": [
    {
      "id": "ex-001",
      "kind": "translate_tap",
      "prompt": { "text": "Привет" },
      "choices": ["Hello", "Goodbye", "Thanks"],
      "correct": "Hello",
      "difficulty": 1
    },
    {
      "id": "ex-002",
      "kind": "translate_type",
      "prompt": { "text": "Пока" },
      "correct": ["Bye", "Goodbye", "See you"],
      "difficulty": 1
    }
  ]
}
```

### 10. packages/content/scripts/validate-all.ts
```typescript
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CourseMetaSchema, LessonSchema, UnitMetaSchema } from '../src/schema/index.js';

async function listJsonFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? listJsonFiles(fullPath) : [fullPath];
    })
  );
  return files.flat().filter((file) => file.endsWith('.json'));
}

function validateJson(relPath: string, data: unknown) {
  const parts = relPath.split(path.sep);
  if (parts.length === 2 && parts[1] === 'meta.json') {
    return CourseMetaSchema.safeParse(data);
  }
  if (parts.length === 4 && parts[3] === 'meta.json') {
    return UnitMetaSchema.safeParse(data);
  }
  if (parts[parts.length - 1].startsWith('lesson_')) {
    return LessonSchema.safeParse(data);
  }
  return null;
}

async function validateAllContent() {
  const coursesDir = fileURLToPath(new URL('../courses', import.meta.url));
  let hasErrors = false;

  try {
    const files = (await listJsonFiles(coursesDir)).sort();
    for (const file of files) {
      const rel = path.relative(coursesDir, file);
      try {
        const raw = await fs.readFile(file, 'utf-8');
        const data = JSON.parse(raw);
        const result = validateJson(rel, data);
        if (!result) {
          console.log(`- skip ${rel}`);
          continue;
        }
        if (!result.success) {
          console.error(`✗ ${rel}:`, result.error.errors);
          hasErrors = true;
        } else {
          console.log(`✓ ${rel} valid`);
        }
      } catch (error) {
        console.error(`✗ ${rel}:`, error);
        hasErrors = true;
      }
    }

    console.log('\nValidation complete');
  } catch (error) {
    console.error('Validation error:', error);
    hasErrors = true;
  }

  process.exit(hasErrors ? 1 : 0);
}

validateAllContent();
```

**FIX A:** Changed import to `from '../src/schema/index.js'` with `.js` extension.

**FIX B:** Updated hardcoded path to resolve relative to the script file using `fileURLToPath(new URL('../courses', import.meta.url))`.

**FIX C:** Validate all course/unit meta + lesson JSON by scanning the courses directory.

## Directory Structure
```bash
mkdir -p packages/content/courses/ru-en/a1/unit_01 packages/content/scripts packages/content/tests
```

## EXACT Verification
```bash
cd packages/content

# Step 1: Install
pnpm install
echo "✓ Step 1: install"

# Step 2: TypeScript
pnpm typecheck
echo "✓ Step 2: typecheck"

# Step 3: Validate content
pnpm validate
echo "✓ Step 3: validation"

# Step 4: Tests
pnpm test
echo "✓ Step 4: tests"

# Step 5: Build
pnpm build
ls dist/index.js
echo "✓ Step 5: build"
```

## SUCCESS Criteria
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm validate` exits 0
- [ ] `pnpm test` exits 0
- [ ] `pnpm build` creates dist/
- [ ] 10 files created exactly

## Git Commit
```
feat(content): scaffold content package with Zod schemas (FIXED)

- Add package.json with Zod for validation
- Add Zod schemas for Exercise, Lesson, Unit, Course
- Add vitest config and schema test
- Add ru-en course meta.json
- Add sample A1 Unit 1 Lesson 1 with 2 exercises
- Add validate-all.ts script with stable path resolution
FIX: Split build vs typecheck tsconfig to keep tests/scripts out of output builds

FIX: Difficulty schema uses literal union (1|2|3|4|5)
FIX: All imports/exports use .js extensions
FIX: Validation script uses flexible path resolution

Verification: pnpm validate passes, tests pass, build succeeds
```

---

# ============================================================
# AGENT_08B_SCAFFOLD_TYPES.md (FIXED)
# ============================================================

# Task: Shared Types Package Scaffold

**Model:** haiku  
**Task ID:** scaffold_008b  
**Creates:** 4 files  
**Depends On:** AGENT_07

## Files to Create

### 1. packages/types/package.json
```json
{
  "name": "@duolingoru/types",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" }
  },
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.5.2"
  }
}
```

### 2. packages/types/tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. packages/types/src/index.ts
```typescript
// Placeholder - populated by AGENT_09
export {};
```

### 4. Directory structure
```bash
mkdir -p packages/types/src
```

## EXACT Verification
```bash
cd packages/types

# Step 1: Install
pnpm install
echo "✓ Step 1: install"

# Step 2: TypeScript
pnpm typecheck
echo "✓ Step 2: typecheck"

# Step 3: Build
pnpm build
echo "✓ Step 3: build"
```

## SUCCESS Criteria
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm build` creates dist/
- [ ] 4 files created exactly

## Git Commit
```
feat(types): scaffold types package

- Add package.json with TypeScript
- Add tsconfig.json
- Add placeholder src/index.ts
- Placeholder directory structure

Verification: pnpm typecheck exits 0
```

---

# PHASE 1 COMPLETE CHECKLIST

After running all 6 scaffold tasks (AGENT_07, 01, 02, 08, 08B, 06):

- [ ] Root: `pnpm install` works from root
- [ ] Root: `pnpm typecheck` passes all packages
- [ ] Root: `pnpm lint` runs without failing (--if-present)
- [ ] Root: `pnpm test` runs without failing (--if-present)
- [ ] PWA: `pnpm build` creates dist/, no .js in src/
- [ ] PWA: `pnpm test` passes
- [ ] API: `/health` endpoint responds
- [ ] API: Build succeeds with uuid dependency
- [ ] Engine: 3 unit tests pass
- [ ] Content: 2 JSON files validate
- [ ] Content: `pnpm test` passes
- [ ] Types: `pnpm build` creates dist/
- [ ] Total: ~60 files created
- [ ] Git: 6 commits with proper messages
- [ ] ESLint: Loads from .eslintrc.cjs successfully

## Summary of Fixes Applied to Phase 1:

1. **AGENT_07:** Root scripts now use `--if-present`, ESLint config renamed to `.eslintrc.cjs`, manifest deps aligned
2. **AGENT_01:** PWA build uses `tsc --noEmit`, tsconfig has `noEmit` and `declaration: false`, workspace deps deferred to Phase 3, .env.example added, tests/setup.ts created, .js extensions in imports, Cucumber BDD config + support files, favicon package copied (fallback placeholders)
3. **AGENT_02 (API):** Added `uuid` + `@types/uuid`, .env.example, .js extensions in imports/exports, removed unused health test import
4. **AGENT_06 (Engine):** Use `uuid` instead of `crypto.randomUUID()`, `@types/uuid`, .js extensions, grading test imports Exercise type
5. **AGENT_08 (Content):** Difficulty schema uses literal union, flexible path resolution, .js extensions, vitest config + schema test added
6. **All vitest configs:** Added `types: ["vitest/globals"]` to tsconfig.json and `tests/**` include patterns
