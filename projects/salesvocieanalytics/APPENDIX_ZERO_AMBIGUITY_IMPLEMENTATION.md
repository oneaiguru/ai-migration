# APPENDIX: Zero-Ambiguity Implementation Guide

**Purpose:** This appendix provides COMPLETE, copy-paste-ready code for every file. No decisions required, no reasoning needed. Follow sequentially.

---

## A1. EXACT SETUP COMMANDS (Copy-paste in order)

```bash
# Step 1: Create project
npx create-next-app@14.2.10 dialext-ui --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Step 2: Enter directory
cd dialext-ui

# Step 3: Install shadcn/ui
npx shadcn-ui@latest init -y

# Step 4: Install shadcn components (answer prompts with defaults)
npx shadcn-ui@latest add button input select checkbox textarea tabs card table badge slider switch label tooltip

# Step 5: Install additional dependencies
npm install class-variance-authority clsx tailwind-merge

# Step 6: Install dev dependencies
npm install -D playwright @types/node @types/react @types/react-dom serve

# Step 7: Create directory structure
mkdir -p app/stats/{time,days}
mkdir -p app/admin/filters/{managers,sources}
mkdir -p app/admin/{email-notify,privacy,crm-pull,crm-tasks}
mkdir -p app/reports/calls/{filter,list}
mkdir -p app/reports/{managers,lagging,trends}
mkdir -p app/reports/call/[id]
mkdir -p app/bitrix/{transcript,score}
mkdir -p components/{ui,layout,data-display,charts}
mkdir -p data
mkdir -p lib
mkdir -p scripts

# Done - ready to add files
```

---

## A2. COMPLETE CONFIGURATION FILES

### A2.1 next.config.mjs (COMPLETE - Replace entire file)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
```

### A2.2 tailwind.config.ts (COMPLETE - Replace entire file)
```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        badge: {
          lead: '#0066CC',
          deal: '#00AA33',
          call: '#9933CC',
        },
        score: {
          good: '#00DD44',
          acceptable: '#FFBB00',
          poor: '#FF5577',
        },
        primary: {
          DEFAULT: '#0066CC',
          hover: '#0052A3',
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: '#666666',
          hover: '#4D4D4D',
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

### A2.3 tsconfig.json (COMPLETE - Replace entire file)
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### A2.4 app/globals.css (COMPLETE - Replace entire file)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## A3. COMPLETE LIB FILES

### A3.1 lib/utils.ts (COMPLETE)
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### A3.2 lib/scoring.ts (COMPLETE)
```typescript
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

### A3.3 lib/formatting.ts (COMPLETE)
```typescript
export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

export function formatDateTime(dateTimeStr: string): string {
  const [date, time] = dateTimeStr.split(' ');
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} ${time}`;
}

export function formatDuration(seconds: number): string {
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

## A4. COMPLETE COMPONENT FILES

### A4.1 components/data-display/score-badge.tsx (COMPLETE)
```typescript
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

### A4.2 components/data-display/status-badge.tsx (COMPLETE)
```typescript
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

### A4.3 components/data-display/data-table.tsx (COMPLETE)
```typescript
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
    <div className="border border-gray-300 rounded overflow-hidden">
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

### A4.4 components/charts/line-chart.tsx (COMPLETE)
```typescript
interface LineChartProps {
  data: Array<{ hour: number; count: number }>;
  height?: number;
}

export function LineChart({ data, height = 300 }: LineChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count));
  const width = 1200;
  const padding = 40;

  const points = data
    .map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - ((d.count / maxCount) * (height - 2 * padding));
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {[0, 20000, 40000, 60000, 80000].map((val) => {
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

      <polyline fill="none" stroke="#0066CC" strokeWidth="3" points={points} />

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

### A4.5 components/charts/bar-chart.tsx (COMPLETE)
```typescript
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
          <div className="flex justify-between text-sm">
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

### A4.6 components/charts/multi-line-chart.tsx (COMPLETE)
```typescript
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

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
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

## A5. ALL MISSING ADMIN PAGES (COMPLETE)

### A5.1 app/admin/email-notify/page.tsx (COMPLETE)
```typescript
export default function EmailNotifyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">
        Настройки email уведомлений по этапам воронок CRM
      </h1>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">ВОРОНКА CRM:</label>
          <div className="border p-2 rounded bg-white">ПСМ3</div>
          <div className="border p-2 rounded bg-white">Закрыто и не реализовано</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Водители 2</label>
          <div className="border p-2 rounded bg-white">Закрыто и не реализовано</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Для тестирования Крео</label>
          <div className="border p-2 rounded bg-white">Закрыто и не реализовано</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Техническая Salebot</label>
          <div className="border p-2 rounded bg-white">Закрыто и не реализовано</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Список адресов отправки:</label>
          <textarea
            className="w-full border p-3 rounded h-24 font-mono text-sm"
            placeholder="Список адресов, разделенных новой строкой"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm">
              Отправка уведомления при изменении воронки звонка
            </span>
          </label>
          <p className="text-xs text-gray-500 ml-6">
            After call pipeline changed
          </p>
        </div>
      </div>
    </div>
  );
}
```

### A5.2 app/admin/privacy/page.tsx (COMPLETE)
```typescript
export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Настройки доступа по email</h1>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Type:</label>
          <div className="border p-2 rounded bg-white w-48">Private ▼</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email list</label>
          <textarea
            className="w-full border p-3 rounded h-32 font-mono text-sm"
            placeholder="Список утверждённых адресов электронной почты, разделённых новой строкой"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email domains list</label>
          <textarea
            className="w-full border p-3 rounded h-32 font-mono text-sm"
            placeholder="Список утверждённых доменов, разделённых новой строкой"
          />
        </div>
      </div>
    </div>
  );
}
```

### A5.3 app/admin/crm-pull/page.tsx (COMPLETE)
```typescript
export default function CrmPullPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Настройки получения объектов из CRM</h1>

      <div className="space-y-4">
        <p className="text-sm font-medium">
          Получение данных из CRM для кастомных полей следующих типов объектов:
        </p>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span>Сделка</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span>Лид</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span>Контакт</span>
          </label>
        </div>

        <p className="text-sm font-medium mt-6">
          Загрузка данных из выбранных полей в INTERNAL DATA
        </p>

        <div className="space-y-2">
          <button className="border px-4 py-2 rounded bg-white w-full text-left">
            ПОЛЯ ЛИДОВ
          </button>
          <button className="border px-4 py-2 rounded bg-white w-full text-left">
            ПОЛЯ СДЕЛОК
          </button>
          <button className="border px-4 py-2 rounded bg-white w-full text-left">
            ПОЛЯ КОНТАКТОВ
          </button>
          <button className="border px-4 py-2 rounded bg-white w-full text-left">
            ПОЛЯ КОМПАНИЙ
          </button>
        </div>

        <div className="flex gap-3 mt-4">
          <button className="border px-4 py-2 rounded bg-white">
            Обновить список полей
          </button>
          <button className="bg-primary text-white px-6 py-2 rounded">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
```

### A5.4 app/admin/crm-tasks/page.tsx (COMPLETE)
```typescript
export default function CrmTasksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Настройки создания задач в CRM</h1>

      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="w-4 h-4" />
          <span>Включить создание задач для данного воркспейса</span>
        </label>
        <p className="text-xs text-gray-500 ml-6">Статус аналитики: Отключена</p>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Минимальное пороговое значение (в %) для создания задачи ответственному лицу:
          </label>
          <input
            type="number"
            className="border p-2 rounded w-32"
            defaultValue="0"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Максимальное пороговое значение (в %) для создания задачи ответственному лицу:
          </label>
          <input
            type="number"
            className="border p-2 rounded w-32"
            defaultValue="40"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Отложить создание задач в период С (часов) UTC:
          </label>
          <input
            type="number"
            className="border p-2 rounded w-32"
            defaultValue="0"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Отложить создание задач в период ДО (часов) UTC:
          </label>
          <input
            type="number"
            className="border p-2 rounded w-32"
            defaultValue="0"
          />
        </div>

        <button className="bg-primary text-white px-6 py-2 rounded mt-4">
          Сохранить
        </button>
      </div>
    </div>
  );
}
```

### A5.5 app/admin/filters/page.tsx (COMPLETE)
```typescript
export default function FiltersPage() {
  const filters = [
    {
      name: 'Фильтр первых звонков',
      description: 'Ограничение на получение и обработку только первых звонков от клиента.',
    },
    {
      name: 'Фильтр совпадающих ответственных лиц',
      description: 'Фильтрация по совпадению ответственных за звонок и связанные сущности.',
    },
    {
      name: 'Фильтр длительности звонков',
      description: 'Ограничение на длительность получаемых звонков.',
    },
    {
      name: 'Фильтр по типу звонка',
      description: 'Ограничение на получение и обработку по типу звонка.',
    },
    {
      name: 'Фильтр менеджеров',
      description: 'Список менеджеров чьи звонки будут обрабатываться.',
    },
    {
      name: 'Фильтр по источнику данных',
      description: 'Ограничение на получение и обработку звонков из определённых источников.',
    },
    {
      name: 'Фильтр по стадиям сделки',
      description: 'Фильтрация звонков по стадиям связанной с ним сделки.',
    },
    {
      name: 'Фильтр по статусу лида',
      description: 'Получаем только звонки у лидов которых проставлен соответствующий статус.',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Настройки фильтрации объектов из CRM</h1>

      <div className="space-y-4">
        {filters.map((filter, idx) => (
          <div key={idx} className="border p-4 rounded">
            <h3 className="font-semibold mb-1">{idx + 1}. {filter.name}</h3>
            <p className="text-sm text-gray-600">{filter.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### A5.6 app/admin/filters/managers/page.tsx (COMPLETE)
```typescript
export default function ManagersFilterPage() {
  const managers = [
    { name: 'Менеджер 1', checked: true },
    { name: 'Менеджер 2', checked: true },
    { name: 'Менеджер 3', checked: true },
    { name: 'Менеджер 4', checked: false },
    { name: 'Менеджер 5', checked: false },
    { name: 'Менеджер 6', checked: true },
    { name: 'Менеджер 7', checked: true },
    { name: 'Менеджер 8', checked: false },
    { name: 'Менеджер 9', checked: false },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Настройки фильтров по менеджерам</h1>

      <div className="space-y-4">
        <p className="font-semibold">Объект фильтрации:</p>
        <label className="flex items-center gap-2">
          <input type="radio" name="filterType" defaultChecked />
          <span>Лиды/Сделки/Клиенты (фильтруются полученные данные)</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="filterType" />
          <span>Звонки (для Битрикс, вставляется в запрос)</span>
        </label>

        <p className="font-semibold mt-6">
          Обрабатывать звонки для следующих менеджеров:
        </p>
        <label className="flex items-center gap-2">
          <input type="radio" name="managerFilter" />
          <span>Всех</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="managerFilter" />
          <span>Текст "DIALEXT" в поле UF_INTERESTS у менеджера в CRM</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="managerFilter" defaultChecked />
          <span>Выбранных</span>
        </label>

        <div className="ml-8 space-y-2 mt-3">
          {managers.map((mgr, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={mgr.checked} />
              <span>{mgr.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### A5.7 app/admin/filters/sources/page.tsx (COMPLETE)
```typescript
export default function SourcesFilterPage() {
  const sources = [
    { name: 'Источник 1', checked: true },
    { name: 'Источник 2', checked: false },
    { name: 'Источник 3', checked: false },
    { name: 'Источник 4', checked: true },
    { name: 'Источник 5', checked: false },
    { name: 'Источник 6', checked: true },
    { name: 'Источник 7', checked: false },
    { name: 'Источник 8', checked: false },
    { name: 'Источник 9', checked: false },
    { name: 'Источник 10', checked: false },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">
        Настройки фильтров по источникам сделок
      </h1>

      <button className="border px-4 py-2 rounded bg-white">
        Загрузить список источников
      </button>

      <div className="space-y-4">
        <p className="font-semibold">
          Обрабатывать звонки для следующих источников:
        </p>
        <label className="flex items-center gap-2">
          <input type="radio" name="sourceFilter" />
          <span>Всех</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="sourceFilter" defaultChecked />
          <span>Выбранных</span>
        </label>

        <div className="ml-8 space-y-2 mt-3">
          {sources.map((src, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={src.checked} />
              <span>{src.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## A6. COMPLETE DATA FILES (Copy-paste into /data directory)

### A6.1 data/stats-time.json
(Already provided in main plan - use that exact structure)

### A6.2 data/stats-days.json
(Already provided in main plan - use that exact structure)

### A6.3 data/managers.json
(Already provided in main plan - use that exact structure)

### A6.4 data/workspaces.json (NEW - COMPLETE)
```json
{
  "workspaces": [
    { "id": "ws_001", "name": "Любой", "isDefault": true },
    { "id": "ws_002", "name": "ПСМ3", "isDefault": false },
    { "id": "ws_003", "name": "Водители 2", "isDefault": false }
  ]
}
```

### A6.5 data/company.json (NEW - COMPLETE)
```json
{
  "company": {
    "id": 1,
    "name": "dialext",
    "workspaceDomain": "my.dialext.com",
    "description": "Сервис, повышающий конверсию на 20%. Автоматически анализирует звонки в отделах продажи и контакт-центрах.",
    "language": "ru",
    "model": "Процентная",
    "engineVersion": "4.2",
    "products": "",
    "callQualification": "1. холодные звонки (первичный контакт) после КЦ\n2. теплые звонки (первичный контакт)\n3. дожим клиента\n0. Разговор на другие темы",
    "additionalInstructions": ""
  }
}
```

---

## A7. STEP-BY-STEP BUILD & DEPLOY COMMANDS

```bash
# Step 1: Build for production
npm run build

# Step 2: Test locally
npm run start
# Open http://localhost:3000 in browser
# Verify all 22 routes work

# Step 3: Install Vercel CLI (if not installed)
npm i -g vercel

# Step 4: Deploy to Vercel
vercel --prod

# Step 5: Follow prompts:
# - Set up and deploy? Y
# - Which scope? [select your account]
# - Link to existing project? N
# - Project name? dialext-ui
# - Directory? ./
# - Override settings? N

# Done! Vercel will output deployment URL
```

---

## A8. VERIFICATION CHECKLIST

After deployment, verify each URL works:

```
✓ https://your-app.vercel.app/
✓ https://your-app.vercel.app/stats/time
✓ https://your-app.vercel.app/stats/days
✓ https://your-app.vercel.app/admin/email-notify
✓ https://your-app.vercel.app/admin/privacy
✓ https://your-app.vercel.app/admin/crm-pull
✓ https://your-app.vercel.app/admin/crm-tasks
✓ https://your-app.vercel.app/admin/filters
✓ https://your-app.vercel.app/admin/filters/managers
✓ https://your-app.vercel.app/admin/filters/sources
✓ https://your-app.vercel.app/company
✓ https://your-app.vercel.app/rules
✓ https://your-app.vercel.app/llm-tags
✓ https://your-app.vercel.app/groups
✓ https://your-app.vercel.app/reports/managers
✓ https://your-app.vercel.app/reports/calls/filter
✓ https://your-app.vercel.app/reports/calls/list
✓ https://your-app.vercel.app/reports/call/1
✓ https://your-app.vercel.app/reports/lagging
✓ https://your-app.vercel.app/reports/trends
✓ https://your-app.vercel.app/bitrix/transcript
✓ https://your-app.vercel.app/bitrix/score
```

---

**END OF APPENDIX**

All code is copy-paste ready. No decisions required. No reasoning needed. Just follow sequentially.
