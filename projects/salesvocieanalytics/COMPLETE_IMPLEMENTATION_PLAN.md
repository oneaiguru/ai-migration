# DIALEXT UI - Complete Implementation Plan for Vercel Deployment

**Project Type:** Static Next.js 14 Application
**Deployment Target:** Vercel
**Purpose:** Mock UI demo of Dialext sales call analytics platform with Russian interface
**Development Approach:** 100% deterministic, zero-guesswork implementation

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Design System Tokens](#4-design-system-tokens)
5. [Data Architecture](#5-data-architecture)
6. [Page Implementations](#6-page-implementations)
7. [Component Specifications](#7-component-specifications)
8. [Scoring & Business Logic](#8-scoring--business-logic)
9. [Deployment Instructions](#9-deployment-instructions)
10. [Implementation Checklist](#10-implementation-checklist)

---

## 1. PROJECT OVERVIEW

### 1.1 Purpose
Build a static site that replicates the Dialext admin + reports UI for screenshots and stakeholder review. All data from local JSON files, no backend required.

### 1.2 Success Criteria
- ✅ All 22 screens reachable via navigation
- ✅ Content/labels match source material in Russian
- ✅ Charts rendered with inline SVG
- ✅ Tables and badges mirror colors and columns
- ✅ Deployed to Vercel from single repo
- ✅ No server functions (pure static export)

### 1.3 Non-Goals
- ❌ Authentication
- ❌ Real APIs
- ❌ Filtering logic (forms are placeholders)
- ❌ CSV export
- ❌ Full accessibility audits

---

## 2. TECHNOLOGY STACK

### 2.1 Core Framework
```json
{
  "framework": "Next.js 14.2.10",
  "routing": "App Router",
  "export": "Static (output: 'export')",
  "react": "18.3.1"
}
```

### 2.2 Styling
```json
{
  "css": "Tailwind CSS 3.4.10",
  "components": "shadcn/ui (selective)",
  "charts": "Inline SVG (no libraries)"
}
```

### 2.3 Required shadcn/ui Components
Install only these components:
- Button
- Input
- Select
- Checkbox
- Textarea
- Tabs
- Card
- Table
- Badge
- Slider
- Switch
- Label
- Tooltip

### 2.4 DevDependencies
```json
{
  "playwright": "^1.47.0",
  "postcss": "^8.4.47",
  "autoprefixer": "^10.4.20",
  "serve": "^14.2.0"
}
```

---

## 3. PROJECT STRUCTURE

### 3.1 Complete Directory Tree
```
dialext-ui/
├── app/
│   ├── layout.tsx                          # Root layout with header
│   ├── page.tsx                            # Index with links to all screens
│   ├── globals.css                         # Tailwind + custom CSS
│   │
│   ├── stats/
│   │   ├── time/page.tsx                   # p.2: Hourly call distribution
│   │   └── days/page.tsx                   # p.3: Daily stats table
│   │
│   ├── admin/
│   │   ├── email-notify/page.tsx           # p.4: Email notifications
│   │   ├── privacy/page.tsx                # p.5: Privacy settings
│   │   ├── crm-pull/page.tsx               # p.6: CRM object config
│   │   ├── crm-tasks/page.tsx              # p.7: Task creation settings
│   │   ├── filters/
│   │   │   ├── page.tsx                    # p.8: Filters overview
│   │   │   ├── managers/page.tsx           # p.9: Manager filter
│   │   │   └── sources/page.tsx            # p.10: Source filter
│   │
│   ├── company/page.tsx                    # p.12: Company settings
│   ├── rules/page.tsx                      # p.13: Evaluation rules
│   ├── llm-tags/page.tsx                   # p.14: LLM tags
│   ├── groups/page.tsx                     # p.15: Groups/checklists
│   │
│   ├── reports/
│   │   ├── managers/page.tsx               # p.17: Manager performance
│   │   ├── calls/
│   │   │   ├── filter/page.tsx             # p.18: Call filters
│   │   │   └── list/page.tsx               # p.19: Calls table
│   │   ├── call/[id]/page.tsx              # pp.20-21: Call detail
│   │   ├── lagging/page.tsx                # p.22: Lagging indicators
│   │   └── trends/page.tsx                 # p.23: Trends over time
│   │
│   └── bitrix/
│       ├── transcript/page.tsx             # p.25: Bitrix transcript view
│       └── score/page.tsx                  # p.26: Bitrix score view
│
├── components/
│   ├── ui/                                 # shadcn components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── textarea.tsx
│   │   ├── tabs.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── label.tsx
│   │   └── tooltip.tsx
│   │
│   ├── layout/
│   │   ├── shell.tsx                       # Page container with nav
│   │   └── header.tsx                      # Top navigation bar
│   │
│   ├── data-display/
│   │   ├── data-table.tsx                  # Generic table component
│   │   ├── score-badge.tsx                 # Traffic-light score badges
│   │   └── status-badge.tsx                # ЛИД/СДЕЛКА/ЗВОНОК badges
│   │
│   └── charts/
│       ├── line-chart.tsx                  # Hourly/trends line charts
│       ├── bar-chart.tsx                   # Lagging indicators bars
│       ├── stacked-bar-chart.tsx           # Manager performance stacks
│       └── multi-line-chart.tsx            # Multi-series trends
│
├── data/                                   # Static JSON data
│   ├── stats-time.json                     # Hourly distribution
│   ├── stats-days.json                     # Daily table data
│   ├── workspaces.json                     # Workspace list
│   ├── pipelines.json                      # CRM pipelines
│   ├── managers.json                       # Manager list
│   ├── sources.json                        # Deal sources
│   ├── filters.json                        # Filter configs
│   ├── company.json                        # Company settings
│   ├── rules.json                          # Evaluation rules
│   ├── llm-tags.json                       # LLM tag definitions
│   ├── groups.json                         # Group/checklist data
│   ├── calls.json                          # Calls table data
│   ├── call-{id}.json                      # Individual call details
│   ├── managers-performance.json           # Manager stats
│   ├── lagging-indicators.json             # Lagging KPIs
│   └── trends.json                         # Trends over time
│
├── lib/
│   ├── utils.ts                            # Tailwind cn() helper
│   ├── scoring.ts                          # Score calculation logic
│   └── formatting.ts                       # Date/number formatters
│
├── scripts/
│   └── screenshot.mjs                      # Playwright batch screenshot
│
├── next.config.mjs                         # Static export config
├── tailwind.config.ts                      # Design tokens
├── postcss.config.js                       # PostCSS config
├── package.json                            # Dependencies
└── README.md                               # Setup instructions
```

---

## 4. DESIGN SYSTEM TOKENS

### 4.1 Typography
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
      fontSize: {
        'page-title': ['20px', { lineHeight: '1.2', fontWeight: '700' }],
        'section-header': ['16px', { lineHeight: '1.3', fontWeight: '600' }],
        'label': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        'button': ['14px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '0.5px' }],
      },
    },
  },
};
```

### 4.2 Color Palette
```typescript
// tailwind.config.ts - colors section
colors: {
  // Status Badges
  badge: {
    lead: '#0066CC',        // ЛИД (Lead) - blue
    deal: '#00AA33',        // СДЕЛКА (Deal) - green
    call: '#9933CC',        // ЗВОНОК (Call) - purple
  },

  // Score Colors (Traffic Light)
  score: {
    good: '#00DD44',        // ≥72% - green
    acceptable: '#FFBB00',  // 40-71% - yellow
    poor: '#FF5577',        // <40% - pink
  },

  // Semantic Colors
  primary: {
    DEFAULT: '#0066CC',     // ПРИМЕНИТЬ button
    hover: '#0052A3',
  },
  secondary: {
    DEFAULT: '#666666',     // Сохранить button
    hover: '#4D4D4D',
  },
  danger: '#FF5577',
  success: '#00DD44',
  info: '#666666',

  // Backgrounds & Borders
  bg: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    disabled: '#E6E6E6',
  },
  border: {
    DEFAULT: '#CCCCCC',
    focus: '#0066CC',
    disabled: '#999999',
  },
}
```

### 4.3 Spacing Scale
```typescript
// tailwind.config.ts - spacing section
spacing: {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
}
```

### 4.4 Border Radius
```typescript
borderRadius: {
  none: '0px',
  sm: '2px',
  DEFAULT: '4px',
  md: '6px',
  lg: '8px',
}
```

### 4.5 Shadows
```typescript
boxShadow: {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
}
```

---

## 5. DATA ARCHITECTURE

### 5.1 Common Data Structures

#### Workspace
```json
{
  "id": "ws_001",
  "name": "Любой",
  "isDefault": true
}
```

#### Manager
```json
{
  "id": "mgr_1",
  "name": "Рената",
  "selected": true,
  "interests": "DIALEXT"
}
```

#### Score Badge
```typescript
type ScoreColor = 'good' | 'acceptable' | 'poor';

function getScoreColor(percent: number): ScoreColor {
  if (percent >= 72) return 'good';
  if (percent >= 40) return 'acceptable';
  return 'poor';
}
```

### 5.2 Critical Data Files

#### `/data/stats-time.json` (Hourly Distribution - p.2)
```json
{
  "period": {
    "dateFrom": "2025-01-20",
    "dateTo": "2025-01-31",
    "workspace": "Любой"
  },
  "hourly": [
    { "hour": 1, "count": 5000 },
    { "hour": 2, "count": 3000 },
    { "hour": 3, "count": 2000 },
    { "hour": 4, "count": 1500 },
    { "hour": 5, "count": 1200 },
    { "hour": 6, "count": 2000 },
    { "hour": 7, "count": 5000 },
    { "hour": 8, "count": 12000 },
    { "hour": 9, "count": 10000 },
    { "hour": 10, "count": 15000 },
    { "hour": 11, "count": 20000 },
    { "hour": 12, "count": 25000 },
    { "hour": 13, "count": 30000 },
    { "hour": 14, "count": 35000 },
    { "hour": 15, "count": 40000 },
    { "hour": 16, "count": 50000 },
    { "hour": 17, "count": 60000 },
    { "hour": 18, "count": 70000 },
    { "hour": 19, "count": 80000 },
    { "hour": 20, "count": 75000 },
    { "hour": 21, "count": 65000 },
    { "hour": 22, "count": 50000 },
    { "hour": 23, "count": 35000 }
  ],
  "peak": {
    "hour": 19,
    "count": 80000,
    "label": "Пиковое время: 19-20 часов (80k звонков)"
  },
  "minimum": {
    "hour": 9,
    "count": 10000,
    "label": "Минимум: 9-10 часов (10k звонков)"
  }
}
```

#### `/data/stats-days.json` (Daily Stats - p.3)
```json
{
  "period": {
    "dateFrom": "2025-01-20",
    "dateTo": "2025-01-31",
    "workspace": "Любой"
  },
  "days": [
    {
      "date": "2025-01-30",
      "processed": 147,
      "received": 157,
      "errors": -1,
      "callsProcessed": 305,
      "callsProcessedErrors": -5,
      "minutesTotal": 747
    },
    {
      "date": "2025-01-29",
      "processed": 170,
      "received": 184,
      "errors": -14,
      "callsProcessed": 14,
      "callsProcessedErrors": -2,
      "minutesTotal": 77
    },
    {
      "date": "2025-01-28",
      "processed": 141,
      "received": 145,
      "errors": -4,
      "callsProcessed": 26,
      "callsProcessedErrors": 0,
      "minutesTotal": 51
    },
    {
      "date": "2025-01-27",
      "processed": 0,
      "received": 0,
      "errors": 0,
      "callsProcessed": 275,
      "callsProcessedErrors": -9,
      "minutesTotal": 539
    },
    {
      "date": "2025-01-26",
      "processed": 0,
      "received": 0,
      "errors": 0,
      "callsProcessed": 31,
      "callsProcessedErrors": 0,
      "minutesTotal": 47
    },
    {
      "date": "2025-01-25",
      "processed": 102,
      "received": 103,
      "errors": -1,
      "callsProcessed": 26,
      "callsProcessedErrors": -1,
      "minutesTotal": 30
    },
    {
      "date": "2025-01-24",
      "processed": 121,
      "received": 127,
      "errors": -6,
      "callsProcessed": 6,
      "callsProcessedErrors": -1,
      "minutesTotal": 15
    },
    {
      "date": "2025-01-23",
      "processed": 176,
      "received": 181,
      "errors": -5,
      "callsProcessed": 176,
      "callsProcessedErrors": -5,
      "minutesTotal": 279
    },
    {
      "date": "2025-01-22",
      "processed": 136,
      "received": 140,
      "errors": -4,
      "callsProcessed": 135,
      "callsProcessedErrors": -4,
      "minutesTotal": 343
    },
    {
      "date": "2025-01-21",
      "processed": 154,
      "received": 158,
      "errors": -4,
      "callsProcessed": 153,
      "callsProcessedErrors": -3,
      "minutesTotal": 334
    }
  ]
}
```

#### `/data/managers.json` (Manager List - p.9, p.17)
```json
{
  "managers": [
    { "id": "mgr_1", "name": "Рената", "selected": true, "callsCount": 1, "averageScore": 100 },
    { "id": "mgr_2", "name": "Владимир", "selected": true, "callsCount": 2, "averageScore": 76 },
    { "id": "mgr_3", "name": "Виктор", "selected": true, "callsCount": 1, "averageScore": 69 },
    { "id": "mgr_4", "name": "Тамара", "selected": false, "callsCount": 8, "averageScore": 60 },
    { "id": "mgr_5", "name": "Светлана", "selected": false, "callsCount": 1, "averageScore": 57 },
    { "id": "mgr_6", "name": "Сергей", "selected": true, "callsCount": 6, "averageScore": 57 },
    { "id": "mgr_7", "name": "Юлия Грищенко", "selected": true, "callsCount": 9, "averageScore": 53 }
  ]
}
```

#### `/data/calls.json` (Calls Table - p.19)
```json
{
  "pagination": {
    "page": 1,
    "limit": 16,
    "total": 16
  },
  "calls": [
    {
      "id": "call_001",
      "dateTime": "2025-01-27 12:32",
      "badgeType": "ЛИД",
      "badgeColor": "lead",
      "badgeSecondary": "ЗВОНОК",
      "badgeSecondaryColor": "call",
      "number": 13,
      "manager": "Менеджер 1",
      "duration": "00:03:13",
      "group": 1,
      "tags": "lead, cold",
      "callRecording": "[размыто]",
      "scorePercent": 72,
      "criteria": {
        "secretaryBypass": 3,
        "greeting": 3,
        "appointment": 2
      }
    }
  ]
}
```

#### `/data/lagging-indicators.json` (p.22)
```json
{
  "checklist": "ТМЦ [16]",
  "period": "24/01/2025 — 31/01/2025",
  "metrics": [
    { "label": "Обход секретаря", "percentage": 98 },
    { "label": "Приветствие и установка контакта", "percentage": 95 },
    { "label": "Назначение времени демонстрации", "percentage": 48 },
    { "label": "Актуализация контактов, email или телефон", "percentage": 45 },
    { "label": "Должность и функционал", "percentage": 40 },
    { "label": "Выявление потребностей", "percentage": 28 },
    { "label": "Обработка возражений клиента", "percentage": 18 }
  ]
}
```

#### `/data/trends.json` (p.23)
```json
{
  "months": [
    "May 2024", "Jun 2024", "Jul 2024", "Aug 2024",
    "Sep 2024", "Oct 2024", "Nov 2024", "Dec 2024", "Jan 2025"
  ],
  "series": [
    {
      "label": "Приветствие и установка контакта",
      "color": "#FF6B9D",
      "data": [60, 65, 58, 62, 68, 72, 70, 75, 78]
    },
    {
      "label": "Назначение времени демонстрации",
      "color": "#0066CC",
      "data": [45, 48, 50, 55, 60, 65, 70, 75, 80]
    },
    {
      "label": "Актуализация контактов",
      "color": "#00CCFF",
      "data": [40, 42, 45, 48, 50, 52, 55, 58, 60]
    },
    {
      "label": "Должность и функционал",
      "color": "#FF9933",
      "data": [35, 38, 40, 42, 45, 48, 50, 52, 55]
    },
    {
      "label": "Выявление потребностей",
      "color": "#00DD44",
      "data": [25, 28, 30, 32, 35, 38, 40, 42, 45]
    },
    {
      "label": "Обработка возражений",
      "color": "#FFBB00",
      "data": [15, 18, 20, 22, 25, 28, 30, 32, 35]
    }
  ]
}
```

#### `/data/llm-tags.json` (p.14)
```json
{
  "tags": [
    {
      "priority": 1,
      "name": "pushing",
      "nameRu": "дожим клиента",
      "description": "Повторный разговор с клиентом, менеджер дожимает клиента",
      "active": true,
      "showInStats": true
    },
    {
      "priority": 2,
      "name": "warm",
      "nameRu": "Теплые звонки",
      "description": "Теплые звонки (клиент оставил заявку)",
      "active": true,
      "showInStats": true
    },
    {
      "priority": 3,
      "name": "demo",
      "nameRu": "Проведение демонстрации",
      "description": "Суть звонка: проведение демонстрации продукта",
      "active": true,
      "showInStats": true
    },
    {
      "priority": 4,
      "name": "skip",
      "nameRu": "Пропущенные",
      "description": "Звонки, не являющиеся продажами",
      "active": true,
      "showInStats": true
    },
    {
      "priority": 5,
      "name": "cold",
      "nameRu": "Холодные звонки",
      "description": "холодные звонки (первичный контакт)",
      "active": true,
      "showInStats": true
    }
  ]
}
```

---

## 6. PAGE IMPLEMENTATIONS

### 6.1 Layout Pattern (All Pages)
```tsx
// app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Dialext — UI Demo',
  description: 'Dialext sales call analytics platform demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-white text-slate-900">
        <header className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <h1 className="text-xl font-semibold">Dialext — UI Demo</h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
```

### 6.2 Index Page (Landing)
```tsx
// app/page.tsx
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  const sections = [
    {
      title: 'Статистика',
      links: [
        { href: '/stats/time', label: 'По времени' },
        { href: '/stats/days', label: 'По дням' },
      ],
    },
    {
      title: 'Администрирование',
      links: [
        { href: '/admin/email-notify', label: 'Email уведомления' },
        { href: '/admin/privacy', label: 'Настройки доступа' },
        { href: '/admin/crm-pull', label: 'Получение из CRM' },
        { href: '/admin/crm-tasks', label: 'Создание задач' },
        { href: '/admin/filters', label: 'Фильтры' },
        { href: '/admin/filters/managers', label: 'Фильтр менеджеров' },
        { href: '/admin/filters/sources', label: 'Фильтр источников' },
      ],
    },
    {
      title: 'Настройки компании',
      links: [
        { href: '/company', label: 'Компания' },
        { href: '/rules', label: 'Правила оценки' },
        { href: '/llm-tags', label: 'LLM теги' },
        { href: '/groups', label: 'Группы' },
      ],
    },
    {
      title: 'Отчеты',
      links: [
        { href: '/reports/managers', label: 'Менеджеры' },
        { href: '/reports/calls/filter', label: 'Фильтр звонков' },
        { href: '/reports/calls/list', label: 'Список звонков' },
        { href: '/reports/call/1', label: 'Детали звонка' },
        { href: '/reports/lagging', label: 'Западающие показатели' },
        { href: '/reports/trends', label: 'Динамика' },
      ],
    },
    {
      title: 'Bitrix 24',
      links: [
        { href: '/bitrix/transcript', label: 'Расшифровка' },
        { href: '/bitrix/score', label: 'Оценка' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title mb-2">Dialext — Демо интерфейса</h1>
        <p className="text-body text-info">
          Статический прототип интерфейса платформы анализа звонков
        </p>
      </div>

      {sections.map((section) => (
        <Card key={section.title} className="p-6">
          <h2 className="text-section-header mb-4">{section.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="p-3 border border-border rounded hover:bg-bg-secondary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### 6.3 Stats/Time Page (p.2 - Hourly Distribution)
```tsx
// app/stats/time/page.tsx
import { LineChart } from '@/components/charts/line-chart';
import statsTimeData from '@/data/stats-time.json';

export default function StatsTimePage() {
  const { period, hourly, peak, minimum } = statsTimeData;

  return (
    <div className="space-y-6">
      <h1 className="text-page-title">
        Статистика по распределению обработки звонков по времени
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-label text-info">Воркспейс:</label>
          <div className="border border-border px-3 py-2 rounded bg-white">
            {period.workspace} ▼
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label text-info">Дата от:</label>
          <div className="border border-border px-3 py-2 rounded bg-white">
            дд.мм.гггг
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label text-info">Дата до:</label>
          <div className="border border-border px-3 py-2 rounded bg-white">
            дд.мм.гггг
          </div>
        </div>

        <button className="bg-primary text-white px-6 py-2 rounded font-button hover:bg-primary-hover">
          ПРИМЕНИТЬ
        </button>
      </div>

      {/* Chart */}
      <div className="border border-border rounded-md p-6 bg-white">
        <h2 className="text-section-header text-center mb-4">
          Количество звонков по времени
        </h2>
        <LineChart data={hourly} height={300} />
        <div className="mt-4 text-small text-info space-y-1">
          <p>{peak.label}</p>
          <p>{minimum.label}</p>
        </div>
      </div>
    </div>
  );
}
```

### 6.4 Stats/Days Page (p.3 - Daily Table)
```tsx
// app/stats/days/page.tsx
import { DataTable } from '@/components/data-display/data-table';
import statsDaysData from '@/data/stats-days.json';

export default function StatsDaysPage() {
  const { period, days } = statsDaysData;

  const columns = [
    {
      key: 'date',
      label: 'Дата',
      align: 'left' as const,
    },
    {
      key: 'processed',
      label: 'Звонков обработано / принято [ошибок]',
      align: 'center' as const,
      render: (row: any) =>
        `${row.processed} / ${row.received} [${row.errors}]`,
    },
    {
      key: 'callsProcessed',
      label: 'Кол-во звонков обработанных за день [ошибок]',
      align: 'center' as const,
      render: (row: any) =>
        row.callsProcessedErrors !== 0
          ? `${row.callsProcessed} [${row.callsProcessedErrors}]`
          : `${row.callsProcessed}`,
    },
    {
      key: 'minutesTotal',
      label: 'Кол-во минут, обработанных за день',
      align: 'center' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-page-title">
        Статистика по распределению обработки звонков по дням
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-label text-info">Дата звонка с:</label>
          <div className="border border-border px-3 py-2 rounded bg-white">
            20.01.2025
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label text-info">Дата звонка по:</label>
          <div className="border border-border px-3 py-2 rounded bg-white">
            31.01.2025
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label text-info">Воркспейс:</label>
          <div className="border border-border px-3 py-2 rounded bg-white w-64">
            {period.workspace}
          </div>
        </div>

        <button className="bg-primary text-white px-6 py-2 rounded font-button hover:bg-primary-hover">
          ПРИМЕНИТЬ
        </button>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={days} />
    </div>
  );
}
```

### 6.5 Reports/Managers Page (p.17 - Manager Performance)
```tsx
// app/reports/managers/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/data-display/data-table';
import { StackedBarChart } from '@/components/charts/stacked-bar-chart';
import { ScoreBadge } from '@/components/data-display/score-badge';
import managersData from '@/data/managers.json';

export default function ReportsManagersPage() {
  const { managers } = managersData;

  const totalCalls = managers.reduce((sum, m) => sum + m.callsCount, 0);
  const avgScore = Math.round(
    managers.reduce((sum, m) => sum + m.averageScore, 0) / managers.length
  );

  const columns = [
    { key: 'name', label: 'Менеджер', align: 'left' as const },
    { key: 'callsCount', label: 'Звонков', align: 'center' as const },
    {
      key: 'averageScore',
      label: 'Ср. оценка',
      align: 'center' as const,
      render: (row: any) => (
        <ScoreBadge percent={row.averageScore}>
          {row.averageScore}%
        </ScoreBadge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="checklists" className="w-full">
        <TabsList>
          <TabsTrigger value="checklists">Оценка по чек-листам</TabsTrigger>
          <TabsTrigger value="dynamics">Динамика развития менеджеров</TabsTrigger>
        </TabsList>

        <TabsContent value="checklists" className="space-y-6 mt-6">
          {/* Period Selector */}
          <div className="flex items-center gap-4">
            <label className="text-label">Период:</label>
            <div className="border border-border px-4 py-2 rounded bg-white">
              24/01/2025 — 31/01/2025
            </div>
          </div>

          {/* Description */}
          <div className="bg-bg-secondary p-4 rounded border border-border">
            <p className="text-body mb-3">
              Отчет предоставляет обзор по эффективности менеджеров за выбранный
              период времени.
            </p>
            <p className="text-body mb-2">Из отчета можно понять:</p>
            <ol className="list-decimal list-inside text-body space-y-1 ml-2">
              <li>Количество звонков каждого менеджера и их эффективность</li>
              <li>
                Доля звонков с положительными/хорошими звонками по каждому
                менеджеру
              </li>
              <li>
                Уровень соответствия отдельным критериям качества в каждом
                звонке
              </li>
            </ol>
          </div>

          {/* Table */}
          <div>
            <DataTable columns={columns} data={managers} />
            <div className="mt-2 flex justify-between text-body font-semibold px-4">
              <span>SUM</span>
              <span>{totalCalls}</span>
              <span>AVERAGE {avgScore}%</span>
            </div>
          </div>

          {/* Stacked Chart */}
          <div className="border border-border rounded p-6 bg-white">
            <h3 className="text-section-header mb-4 text-center">
              Оценка звонков по менеджерам
            </h3>
            <StackedBarChart managers={managers} />
            <div className="flex gap-6 justify-center mt-4 text-small">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-score-good rounded-sm" />
                <span>Хорошо</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-score-acceptable rounded-sm" />
                <span>Удовлетворительно</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-score-poor rounded-sm" />
                <span>Неудовлетворительно</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dynamics">
          <p className="text-body text-info">Динамика развития менеджеров...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 6.6 Reports/Lagging Page (p.22 - Lagging Indicators)
```tsx
// app/reports/lagging/page.tsx
import { BarChart } from '@/components/charts/bar-chart';
import { DataTable } from '@/components/data-display/data-table';
import { ScoreBadge } from '@/components/data-display/score-badge';
import laggingData from '@/data/lagging-indicators.json';
import managersData from '@/data/managers.json';

export default function ReportsLaggingPage() {
  const { checklist, period, metrics } = laggingData;
  const { managers } = managersData;

  const managerColumns = [
    { key: 'name', label: 'Менеджер', align: 'left' as const },
    { key: 'callsCount', label: 'Звон...', align: 'center' as const },
    {
      key: 'averageScore',
      label: 'Средняя оценка',
      align: 'center' as const,
      render: (row: any) => (
        <ScoreBadge percent={row.averageScore}>
          {row.averageScore}%
        </ScoreBadge>
      ),
    },
  ];

  const totalCalls = managers.reduce((sum, m) => sum + m.callsCount, 0);
  const avgScore = (
    managers.reduce((sum, m) => sum + m.averageScore, 0) / managers.length
  ).toFixed(3);

  return (
    <div className="space-y-6">
      <h1 className="text-page-title">Западающие показатели</h1>

      {/* Managers Table */}
      <div>
        <DataTable columns={managerColumns} data={managers} />
        <div className="mt-2 flex justify-between text-body font-semibold px-4">
          <span>SUM</span>
          <span>{totalCalls}</span>
          <span>AVERAGE {avgScore}%</span>
        </div>
      </div>

      {/* Checklist Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-label">Чек-лист:</label>
        <div className="border border-border px-4 py-2 rounded bg-white w-64">
          {checklist} ▼
        </div>
      </div>

      {/* Bar Chart */}
      <div className="border border-border rounded p-6 bg-white">
        <h3 className="text-section-header mb-6">
          Показатели за весь выбранный период
        </h3>
        <BarChart metrics={metrics} />
      </div>
    </div>
  );
}
```

### 6.7 Reports/Trends Page (p.23 - Trends Over Time)
```tsx
// app/reports/trends/page.tsx
import { MultiLineChart } from '@/components/charts/multi-line-chart';
import trendsData from '@/data/trends.json';

export default function ReportsTrendsPage() {
  const { months, series } = trendsData;

  return (
    <div className="space-y-6">
      <h1 className="text-page-title">Динамика показателей</h1>

      {/* Chart */}
      <div className="border border-border rounded p-6 bg-white">
        <h3 className="text-section-header mb-6 text-center">
          Динамика показателей по месяцам
        </h3>
        <MultiLineChart months={months} series={series} height={400} />

        {/* Legend */}
        <div className="mt-6 space-y-2">
          <p className="text-small font-semibold mb-3">Легенда:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {series.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <div
                  className="w-6 h-0.5"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-small">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 7. COMPONENT SPECIFICATIONS

### 7.1 Score Badge Component
```tsx
// components/data-display/score-badge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  percent: number;
  children: React.ReactNode;
  className?: string;
}

export function ScoreBadge({ percent, children, className }: ScoreBadgeProps) {
  const variant =
    percent >= 72 ? 'good' : percent >= 40 ? 'acceptable' : 'poor';

  return (
    <Badge
      className={cn(
        'font-semibold',
        variant === 'good' && 'bg-score-good text-white',
        variant === 'acceptable' && 'bg-score-acceptable text-slate-900',
        variant === 'poor' && 'bg-score-poor text-white',
        className
      )}
    >
      {children}
    </Badge>
  );
}
```

### 7.2 Status Badge Component
```tsx
// components/data-display/status-badge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type BadgeType = 'ЛИД' | 'СДЕЛКА' | 'ЗВОНОК';

interface StatusBadgeProps {
  type: BadgeType;
  className?: string;
}

export function StatusBadge({ type, className }: StatusBadgeProps) {
  const colors: Record<BadgeType, string> = {
    ЛИД: 'bg-badge-lead text-white',
    СДЕЛКА: 'bg-badge-deal text-white',
    ЗВОНОК: 'bg-badge-call text-white',
  };

  return (
    <Badge className={cn('font-semibold text-xs', colors[type], className)}>
      {type}
    </Badge>
  );
}
```

### 7.3 Data Table Component
```tsx
// components/data-display/data-table.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <div className="border border-border rounded overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={`text-${col.align || 'left'}`}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={`text-${col.align || 'left'}`}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### 7.4 Line Chart Component
```tsx
// components/charts/line-chart.tsx
interface LineChartProps {
  data: Array<{ hour: number; count: number }>;
  height?: number;
}

export function LineChart({ data, height = 300 }: LineChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count));
  const width = 1200;
  const padding = 40;

  // Calculate points
  const points = data
    .map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - ((d.count / maxCount) * (height - 2 * padding));
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {/* Grid lines */}
      {[0, 20000, 40000, 60000, 80000].map((val, i) => {
        const y = height - padding - ((val / maxCount) * (height - 2 * padding));
        return (
          <g key={val}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={y + 5}
              textAnchor="end"
              className="text-xs fill-slate-500"
            >
              {val / 1000}k
            </text>
          </g>
        );
      })}

      {/* X-axis labels (hours) */}
      {data.map((d, i) => {
        if (i % 2 === 0) {
          const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
          return (
            <text
              key={d.hour}
              x={x}
              y={height - padding + 20}
              textAnchor="middle"
              className="text-xs fill-slate-500"
            >
              {d.hour}
            </text>
          );
        }
        return null;
      })}

      {/* Line */}
      <polyline
        fill="none"
        stroke="#0066CC"
        strokeWidth="3"
        points={points}
      />

      {/* Points */}
      {data.map((d, i) => {
        const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
        const y = height - padding - ((d.count / maxCount) * (height - 2 * padding));
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="4"
            fill="#0066CC"
            stroke="white"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}
```

### 7.5 Bar Chart Component (Lagging Indicators)
```tsx
// components/charts/bar-chart.tsx
interface Metric {
  label: string;
  percentage: number;
}

interface BarChartProps {
  metrics: Metric[];
}

export function BarChart({ metrics }: BarChartProps) {
  return (
    <div className="space-y-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="space-y-1">
          <div className="flex justify-between text-small">
            <span>{metric.label}</span>
            <span className="font-semibold">{metric.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-primary h-6 rounded-full transition-all"
              style={{ width: `${metric.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 7.6 Multi-Line Chart Component (Trends)
```tsx
// components/charts/multi-line-chart.tsx
interface Series {
  label: string;
  color: string;
  data: number[];
}

interface MultiLineChartProps {
  months: string[];
  series: Series[];
  height?: number;
}

export function MultiLineChart({
  months,
  series,
  height = 400,
}: MultiLineChartProps) {
  const width = 1200;
  const padding = 60;
  const maxValue = Math.max(...series.flatMap((s) => s.data));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {/* Y-axis grid */}
      {[0, 20, 40, 60, 80, 100].map((val) => {
        const y = height - padding - ((val / 100) * (height - 2 * padding));
        return (
          <g key={val}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={y + 5}
              textAnchor="end"
              className="text-xs fill-slate-500"
            >
              {val}
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {months.map((month, i) => {
        const x = padding + (i * (width - 2 * padding)) / (months.length - 1);
        return (
          <text
            key={month}
            x={x}
            y={height - padding + 20}
            textAnchor="middle"
            className="text-xs fill-slate-500"
            transform={`rotate(-45, ${x}, ${height - padding + 20})`}
          >
            {month}
          </text>
        );
      })}

      {/* Lines */}
      {series.map((s) => {
        const points = s.data
          .map((val, i) => {
            const x = padding + (i * (width - 2 * padding)) / (s.data.length - 1);
            const y = height - padding - ((val / 100) * (height - 2 * padding));
            return `${x},${y}`;
          })
          .join(' ');

        return (
          <polyline
            key={s.label}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            points={points}
          />
        );
      })}
    </svg>
  );
}
```

---

## 8. SCORING & BUSINESS LOGIC

### 8.1 Scoring Criteria (Canonical List)
```typescript
// lib/scoring.ts

export const CRITERIA = [
  {
    id: 'secretaryBypass',
    name: 'Обход секретаря',
    description: 'Менеджер успешно связался с ЛПР',
    maxScore: 3,
  },
  {
    id: 'greeting',
    name: 'Приветствие и установка контакта',
    description: 'Менеджер представился и назвал компанию',
    maxScore: 3,
  },
  {
    id: 'appointment',
    name: 'Назначение времени демонстрации',
    description: 'Менеджер предложил конкретное время для демо',
    maxScore: 3,
  },
  {
    id: 'contactUpdate',
    name: 'Актуализация контактов: email или телефон',
    description: 'Менеджер уточнил контактные данные',
    maxScore: 3,
  },
  {
    id: 'jobTitle',
    name: 'Должность и функционал',
    description: 'Менеджер выяснил роль и полномочия собеседника',
    maxScore: 3,
  },
  {
    id: 'needsDiscovery',
    name: 'Выявление потребностей',
    description: 'Менеджер задал вопросы о потребностях клиента',
    maxScore: 3,
  },
  {
    id: 'objectionHandling',
    name: 'Обработка возражений клиента',
    description: 'Менеджер адресовал возражения клиента',
    maxScore: 3,
  },
  {
    id: 'presentation',
    name: 'Презентация продукта',
    description: 'Менеджер представил продукт с учетом выявленных потребностей',
    maxScore: 3,
  },
] as const;

export function calculateScore(criteria: Record<string, number>): number {
  const total = Object.values(criteria).reduce((sum, score) => sum + score, 0);
  const max = Object.keys(criteria).length * 3;
  return Math.round((total / max) * 100);
}

export function getScoreColor(percent: number): 'good' | 'acceptable' | 'poor' {
  if (percent >= 72) return 'good';
  if (percent >= 40) return 'acceptable';
  return 'poor';
}
```

### 8.2 Date & Number Formatting
```typescript
// lib/formatting.ts

export function formatDate(dateStr: string): string {
  // Input: "2025-01-27" → Output: "27.01.2025"
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

export function formatDateTime(dateTimeStr: string): string {
  // Input: "2025-01-27 12:32" → Output: "27/01/2025 12:32"
  const [date, time] = dateTimeStr.split(' ');
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} ${time}`;
}

export function formatDuration(seconds: number): string {
  // Input: 193 → Output: "00:03:13"
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
```

---

## 9. DEPLOYMENT INSTRUCTIONS

### 9.1 Next.js Configuration
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
```

### 9.2 Package.json Scripts
```json
{
  "name": "dialext-ui",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "serve out",
    "screenshot": "node scripts/screenshot.mjs"
  },
  "dependencies": {
    "next": "14.2.10",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-checkbox": "^1.0.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.20",
    "playwright": "^1.47.0",
    "postcss": "^8.4.47",
    "serve": "^14.2.0",
    "tailwindcss": "^3.4.10",
    "typescript": "^5"
  }
}
```

### 9.3 Vercel Deployment Steps

#### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Build locally
npm run build

# Deploy
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard
1. Push code to GitHub/GitLab/Bitbucket
2. Go to https://vercel.com/new
3. Import repository
4. Framework preset: **Next.js** (auto-detected)
5. Build command: `next build`
6. Output directory: `out`
7. Click **Deploy**

### 9.4 Screenshot Generation Script
```javascript
// scripts/screenshot.mjs
import { chromium } from 'playwright';

const routes = [
  '/',
  '/stats/time',
  '/stats/days',
  '/admin/email-notify',
  '/admin/privacy',
  '/admin/crm-pull',
  '/admin/crm-tasks',
  '/admin/filters',
  '/admin/filters/managers',
  '/admin/filters/sources',
  '/company',
  '/rules',
  '/llm-tags',
  '/groups',
  '/reports/managers',
  '/reports/calls/filter',
  '/reports/calls/list',
  '/reports/call/1',
  '/reports/lagging',
  '/reports/trends',
  '/bitrix/transcript',
  '/bitrix/score',
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  for (const route of routes) {
    const url = `http://localhost:3000${route}`;
    console.log(`Capturing: ${route}`);
    await page.goto(url);
    await page.waitForTimeout(1000); // Wait for charts to render
    const filename = `screenshots${route.replace(/\//g, '_')}.png`;
    await page.screenshot({ path: filename, fullPage: true });
  }

  await browser.close();
  console.log('✅ All screenshots captured');
})();
```

**Usage:**
```bash
# Start dev server
npm run dev

# In another terminal
npm run screenshot
```

---

## 10. IMPLEMENTATION CHECKLIST

### Phase 1: Project Setup (1 hour)
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Install dependencies (Tailwind, shadcn/ui, Playwright)
- [ ] Configure `next.config.mjs` for static export
- [ ] Set up `tailwind.config.ts` with design tokens
- [ ] Create directory structure (`app/`, `components/`, `data/`, `lib/`)

### Phase 2: Design System & Core Components (2 hours)
- [ ] Implement design tokens (colors, typography, spacing)
- [ ] Install shadcn/ui components (Button, Input, Table, etc.)
- [ ] Create `ScoreBadge` component
- [ ] Create `StatusBadge` component
- [ ] Create `DataTable` component
- [ ] Create utility functions (scoring, formatting)

### Phase 3: Data Layer (1.5 hours)
- [ ] Create `/data/stats-time.json`
- [ ] Create `/data/stats-days.json`
- [ ] Create `/data/managers.json`
- [ ] Create `/data/calls.json`
- [ ] Create `/data/lagging-indicators.json`
- [ ] Create `/data/trends.json`
- [ ] Create `/data/llm-tags.json`
- [ ] Create `/data/workspaces.json`, `/data/pipelines.json`, etc.

### Phase 4: Chart Components (3 hours)
- [ ] Implement `LineChart` (hourly distribution)
- [ ] Implement `BarChart` (lagging indicators)
- [ ] Implement `StackedBarChart` (manager performance)
- [ ] Implement `MultiLineChart` (trends over time)
- [ ] Test all charts with real data

### Phase 5: Page Implementations (6 hours)

#### Stats Pages
- [ ] Implement `app/page.tsx` (index with navigation)
- [ ] Implement `app/stats/time/page.tsx`
- [ ] Implement `app/stats/days/page.tsx`

#### Admin Pages
- [ ] Implement `app/admin/email-notify/page.tsx`
- [ ] Implement `app/admin/privacy/page.tsx`
- [ ] Implement `app/admin/crm-pull/page.tsx`
- [ ] Implement `app/admin/crm-tasks/page.tsx`
- [ ] Implement `app/admin/filters/page.tsx`
- [ ] Implement `app/admin/filters/managers/page.tsx`
- [ ] Implement `app/admin/filters/sources/page.tsx`

#### Company Pages
- [ ] Implement `app/company/page.tsx`
- [ ] Implement `app/rules/page.tsx`
- [ ] Implement `app/llm-tags/page.tsx`
- [ ] Implement `app/groups/page.tsx`

#### Reports Pages
- [ ] Implement `app/reports/managers/page.tsx`
- [ ] Implement `app/reports/calls/filter/page.tsx`
- [ ] Implement `app/reports/calls/list/page.tsx`
- [ ] Implement `app/reports/call/[id]/page.tsx`
- [ ] Implement `app/reports/lagging/page.tsx`
- [ ] Implement `app/reports/trends/page.tsx`

#### Bitrix Pages
- [ ] Implement `app/bitrix/transcript/page.tsx`
- [ ] Implement `app/bitrix/score/page.tsx`

### Phase 6: Polish & Testing (2 hours)
- [ ] Test all 22 routes in browser
- [ ] Verify Russian labels are correct
- [ ] Check responsive layout (desktop only)
- [ ] Verify all charts render correctly
- [ ] Test static export (`npm run build`)
- [ ] Run screenshot script
- [ ] Review screenshots for accuracy

### Phase 7: Deployment (30 minutes)
- [ ] Push code to Git repository
- [ ] Connect repository to Vercel
- [ ] Configure build settings
- [ ] Deploy to production
- [ ] Verify all routes work on Vercel
- [ ] Share production URL

---

## TOTAL ESTIMATED TIME: 16 hours

### Breakdown:
- **Setup:** 1 hour
- **Components:** 2 hours
- **Data:** 1.5 hours
- **Charts:** 3 hours
- **Pages:** 6 hours
- **Polish:** 2 hours
- **Deploy:** 0.5 hours

---

## FINAL NOTES FOR IMPLEMENTATION

### Critical Success Factors:
1. **Use exact colors from section 4.2** - No approximations
2. **Use Russian labels exactly as specified** - No translations or typos
3. **All data from JSON files** - No hardcoded values in components
4. **Static export must work** - Test `npm run build` early
5. **Charts must be inline SVG** - No external chart libraries

### Common Pitfalls to Avoid:
- ❌ Don't use `fetch()` - Import JSON directly with `import data from '@/data/file.json'`
- ❌ Don't add backend routes - This is 100% static
- ❌ Don't use `<Image>` component - Use `<img>` with `unoptimized: true`
- ❌ Don't add auth - All pages publicly accessible
- ❌ Don't make forms functional - They are display-only

### When to Ask for Clarification:
- If a data structure is ambiguous
- If a color value is unclear
- If a Russian label seems incorrect
- If chart calculations don't match examples

### Quick Start Command:
```bash
npx create-next-app@14.2.10 dialext-ui --typescript --tailwind --app
cd dialext-ui
npx shadcn-ui@latest init
# Follow prompts, then start implementing from Phase 1
```

---

**END OF IMPLEMENTATION PLAN**
