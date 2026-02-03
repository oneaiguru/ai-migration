# EDIT PLAN: Dialext UI Documentation
## Complete Specification for Frontend Developer

**Goal:** Transform current Markdown into a developer-ready specification that allows 100% UI replication without guesswork.

**Current Status:** ~60% complete (visual layouts, navigation) → **Target:** 100% (tokens, data, logic, defaults)

---

## PRIORITY 1: Add Design System (Global UI Tokens)

### Location: Add NEW section at START (after title)

```markdown
# Part 0: Design System & UI Tokens

## 0.1 Typography

| Element | Font Family | Size (px) | Weight | Line Height | Letter-spacing |
|---------|-------------|-----------|--------|-------------|----------------|
| Page Title (h1) | ? | ? | bold | 1.2 | normal |
| Section Header (h2) | ? | 16-18 | 600 | 1.3 | normal |
| Label (form) | ? | 14 | 500 | 1.4 | normal |
| Body Text | ? | 14 | 400 | 1.5 | normal |
| Small/Helper | ? | 12 | 400 | 1.4 | normal |
| Monospace (data) | Courier/Monaco | 13 | 400 | 1.5 | normal |
| Button Text | ? | 14 | 600 | 1.2 | +0.5px |

**ACTION:** Extract from PDF/screenshots
- [ ] Font name from page header area
- [ ] Verify sizes from form labels & table headers
- [ ] Check weight from "ПРИМЕНИТЬ", "Сохранить" buttons

---

## 0.2 Spacing Scale (Recommended)

**Base unit:** 4px or 8px?

| Token | px | Used for |
|-------|----|----|
| xs | 4 | icon-to-text gaps |
| sm | 8 | label-to-input margins |
| md | 12 | section padding |
| lg | 16 | container margins |
| xl | 24 | section gaps |
| 2xl | 32 | page margins |

**ACTION:** Measure padding in forms (email notifications, filters) & gaps between sections

---

## 0.3 Border Radius

| Component | Radius (px) |
|-----------|-------------|
| Input fields | ? (rounded or sharp) |
| Buttons | ? |
| Cards/Panels | ? |
| Dropdowns | ? |

**ACTION:** Check form inputs & buttons in PDF (p.2-7)

---

## 0.4 Shadows

| Elevation | Shadow CSS | Used For |
|-----------|-----------|----------|
| None | none | flat UI |
| Shallow | ? | hover state? |
| Modal | ? | overlay panels |

**ACTION:** Check if dropdowns have shadows; check Bitrix 24 panels (p.25-26)

---

## 0.5 Container Widths

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Desktop | ? (1200 / 1400 / full?) | main app |
| Sidebar | ? | left nav in Bitrix |
| Modal | ? | e.g., edit rules |
| Form column | ? | max-width for inputs |

**ACTION:** Measure from full-page screenshots

---

## 0.6 Color Palette (HEX & RGB)

### Status & Type Badges

| Badge | HEX | RGB | Context | Font Color |
|-------|-----|-----|---------|-----------|
| **ЛИД** (Lead) | #0066CC | rgb(0,102,204) | Call list, any cell linking to lead | white |
| **СДЕЛКА** (Deal) | #00AA33 | rgb(0,170,51) | Call list, linked deals | white |
| **ЗВОНОК** (Call) | #9933CC | rgb(153,51,204) | Call list, raw recording | white |

### Quality Score / Rating (Traffic Light)

| Range | HEX | RGB | When |
|-------|-----|-----|------|
| **Good** (≥72%) | #00DD44 | rgb(0,221,68) | call score ≥72% |
| **Acceptable** (40–71%) | #FFBB00 | rgb(255,187,0) | call score 40–71% |
| **Poor** (<40%) | #FF5577 | rgb(255,85,119) | call score <40% |

### Semantic Colors

| Purpose | HEX | RGB | Example |
|---------|-----|-----|---------|
| **Primary Action** | ? | ? | "ПРИМЕНИТЬ" button |
| **Secondary** | ? | ? | "Сохранить" button |
| **Danger/Delete** | ? | ? | delete row in table |
| **Success** | #00DD44 | | checkmark ✓ |
| **Info/Neutral** | #666666 | | helper text |
| **Background** | #F5F5F5 | rgb(245,245,245) | form bg, table rows (alt) |
| **Border** | #CCCCCC | rgb(204,204,204) | table lines, form borders |
| **Disabled** | #999999 | rgb(153,153,153) | disabled checkboxes |

### Specific UI States

| Element | State | Color (HEX) | Example |
|---------|-------|-----------|---------|
| Selected Tab | Active | ? | "Правила оценки" on p.12 |
| Unselected Tab | Inactive | ? grey | "Квалификация" on p.12 |
| Checked Checkbox | | #0066CC or ✓ | p.6, p.9 |
| Unchecked | | white + #CCCCCC border | p.6, p.8 |
| Dropdown Focus | | #0066CC border | forms p.4, p.5 |

**ACTION:** 
- [ ] Screenshot each badge/status color in isolation
- [ ] Check p.2 for primary button color
- [ ] Check p.17 graph legend colors

---

## 0.7 Icons & Icon Set

### Where Icons Are Used

| Location | Icon Name | Count |
|----------|-----------|-------|
| Bitrix 24 sidebar (p.25) | Various (nav items) | 20+ |
| Reports tabs (p.17, 18) | `calendar`?, `chart-bar`? | ? |
| Form labels (p.6) | `help`?, `alert`? | ? |
| Buttons (all pages) | `plus`, `download`, `refresh`, `delete`? | ? |
| Call status (p.19) | badges for ЛИД/СДЕЛКА/ЗВОНОК | 3 |
| Sidebar nav (p.25) | 30+ icons for menu items | 30+ |

**Assumed Icon Library:** Lucide React, Material Icons, or custom SVG set

**ACTION:**
- [ ] List exact icon names used in each location
- [ ] Define size (16px, 20px, 24px?) per context
- [ ] Check if monochrome or colored

---

## 0.8 Date & Number Formats

### Date/Time Display

| Field | Format | Example | Timezone |
|-------|--------|---------|----------|
| Call timestamp | DD.MM.YYYY HH:MM | 27.01.2025 12:32 | UTC? Local? |
| Report date picker | DD.MM.YYYY | 20.01.2025 | - |
| Duration short | MM:SS | 00:03:13 | - |
| Duration long | descriptive | "больше 2 минут" | - |
| Month labels (chart) | Mon YYYY | May 2024, Jan 2025 | - |

### Number Formatting

| Type | Format | Example |
|------|--------|---------|
| Percentage score | 0–100 with % | 72%, 45%, 100% |
| Call count | integer | 147, 1 |
| Duration seconds | HH:MM:SS | 00:03:13 |
| Minutes total | integer + label | 747 минут |
| Phone number | formatted? | 7 987 441-37-38 |
| Thousands separator | space or comma? | 80k (chart), or 80 000? |

### Localization

- Language: **Russian (Русский)**
- Decimal: comma (`,`) or period (`.`)?
- Thousands: space (` `) or period (`.`)?

**ACTION:**
- [ ] Confirm date format from form placeholders
- [ ] Check if locale is en-RU or ru-RU
- [ ] Verify thousands in chart ("80k" vs "80 000")

---

## 0.9 Responsive Behavior

| Screen | Breakpoint | Sidebar | Table Scroll | Modal |
|--------|-----------|---------|-------------|-------|
| Desktop | ≥1024px | visible | horizontal scroll | centered overlay |
| Tablet | 768–1024px | ? collapsible | ? | ? |
| Mobile | <768px | ? | ? | ? |

**ACTION:** Check if PDF shows responsive design or desktop-only

---

END OF SECTION 0

---
```

---

## PRIORITY 2: Add Data Specifications (API/Mock Data)

### Location: Add NEW section after Design System

```markdown
# Part 1: Data Specifications & API Endpoints

## 1.1 Workspace & Company Data

### GET /api/workspaces

Returns list of workspaces for dropdown (p.2, 3)

```json
{
  "workspaces": [
    {
      "id": "ws_001",
      "name": "Любой",
      "isDefault": true
    },
    {
      "id": "ws_002", 
      "name": "ПСМ3",
      "isDefault": false
    },
    {
      "id": "ws_003",
      "name": "Водители 2",
      "isDefault": false
    }
  ]
}
```

**Default on load:** "Любой"

**ACTION:**
- [ ] Ask: How many workspaces in production?
- [ ] Define selection → which report parameters change?

---

### GET /api/company/config

Used on p.12 (company settings form)

```json
{
  "company": {
    "id": 1,
    "name": "dialext",
    "workspaceDomain": "my.dialext.com",
    "description": "Сервис, повышающий конверсию на 20%...",
    "language": "ru",
    "model": "Процентная",
    "engineVersion": "4.2",
    "products": [],
    "callQualification": [
      "1. холодные звонки (первичный контакт) после КЦ",
      "2. теплые звонки (первичный контакт)",
      "3. дожим клиента",
      "0. Разговор на другие темы"
    ],
    "additionalInstructions": ""
  }
}
```

**ACTION:** Confirm exact structure

---

## 1.2 Call Statistics Data

### GET /api/stats/time (p.2)

Hourly call distribution for 24-hour period

```json
{
  "period": {
    "dateFrom": "2025-01-20",
    "dateTo": "2025-01-31",
    "workspace": "Любой"
  },
  "hourly": [
    { "hour": 1, "count": 0 },
    { "hour": 2, "count": 60000 },
    { "hour": 3, "count": 45000 },
    { "hour": 4, "count": 35000 },
    { "hour": 5, "count": 25000 },
    { "hour": 6, "count": 20000 },
    { "hour": 7, "count": 18000 },
    { "hour": 8, "count": 15000 },
    { "hour": 9, "count": 12000 },
    { "hour": 10, "count": 11000 },
    { "hour": 11, "count": 12000 },
    { "hour": 12, "count": 13000 },
    { "hour": 13, "count": 15000 },
    { "hour": 14, "count": 18000 },
    { "hour": 15, "count": 22000 },
    { "hour": 16, "count": 35000 },
    { "hour": 17, "count": 50000 },
    { "hour": 18, "count": 65000 },
    { "hour": 19, "count": 78000 },
    { "hour": 20, "count": 76000 },
    { "hour": 21, "count": 70000 },
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

**ACTION:**
- [ ] Verify peak is 19-20, min is 9-10 from PDF p.2
- [ ] Extract exact hourly values from graph

---

### GET /api/stats/daily (p.3)

Daily distribution for selected date range

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
    // ... 8 more rows from PDF p.3
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

**ACTION:**
- [ ] Transcribe all 10 rows from PDF p.3 table exactly

---

## 1.3 Manager Performance Data (p.17, 22)

### GET /api/reports/managers

```json
{
  "period": {
    "dateFrom": "2025-01-24",
    "dateTo": "2025-01-31",
    "checklist": "ТМЦ [16]"
  },
  "managers": [
    {
      "id": "mgr_1",
      "name": "Ренaта",
      "callsCount": 1,
      "averageScore": 100,
      "scoreColor": "green"
    },
    {
      "id": "mgr_2",
      "name": "Владимир",
      "callsCount": 2,
      "averageScore": 76,
      "scoreColor": "yellow"
    },
    {
      "id": "mgr_3",
      "name": "Виктор",
      "callsCount": 1,
      "averageScore": 69,
      "scoreColor": "yellow"
    },
    {
      "id": "mgr_4",
      "name": "Тамара",
      "callsCount": 8,
      "averageScore": 60,
      "scoreColor": "yellow"
    },
    {
      "id": "mgr_5",
      "name": "Светла",
      "callsCount": 1,
      "averageScore": 57,
      "scoreColor": "yellow"
    },
    {
      "id": "mgr_6",
      "name": "Сергей",
      "callsCount": 6,
      "averageScore": 57,
      "scoreColor": "yellow"
    },
    {
      "id": "mgr_7",
      "name": "Юлия Г",
      "callsCount": 9,
      "averageScore": 53,
      "scoreColor": "yellow"
    }
  ],
  "summary": {
    "totalCalls": 28,
    "averageScore": 67.429
  },
  "stackedChart": {
    "// p.17": "Stacked bar showing good/ok/bad counts per manager",
    "legend": [
      { "color": "#00DD44", "label": "Хорошо" },
      { "color": "#FFBB00", "label": "Удовлетворительно" },
      { "color": "#FF5577", "label": "Неудовлетворительно" }
    ]
  }
}
```

**ACTION:**
- [ ] Confirm manager list & counts from PDF p.17

---

## 1.4 Lagging Indicators (p.22)

### GET /api/reports/lagging

```json
{
  "period": "...",
  "checklist": "ТМЦ [16]",
  "metrics": [
    {
      "label": "Обход секретаря",
      "percentage": 98,
      "color": "pink"
    },
    {
      "label": "Приветствие и установка контакта",
      "percentage": 95,
      "color": "pink"
    },
    {
      "label": "Назначение времени демонстрации",
      "percentage": 48,
      "color": "orange"
    },
    {
      "label": "Актуализация контактов, email или телефон",
      "percentage": 45,
      "color": "orange"
    },
    {
      "label": "Должность и функционал",
      "percentage": 40,
      "color": "red"
    },
    {
      "label": "Выявление потребностей",
      "percentage": 28,
      "color": "red"
    },
    {
      "label": "Обработка возражений клиента",
      "percentage": 18,
      "color": "red"
    }
  ]
}
```

**ACTION:**
- [ ] Extract percentages from PDF p.22 bar chart

---

## 1.5 Trends Over Time (p.23)

### GET /api/reports/trends

```json
{
  "months": ["May 2024", "Jun 2024", "Jul 2024", "Aug 2024", "Sep 2024", "Oct 2024", "Nov 2024", "Dec 2024", "Jan 2025"],
  "series": [
    {
      "label": "Приветствие и установка контакта",
      "color": "#FF6B9D",
      "data": [60, 58, 50, 48, 55, 40, 55, 78, 75]
    },
    {
      "label": "Назначение времени демонстрации",
      "color": "#0066CC",
      "data": [68, 72, 54, 70, 65, 62, 60, 78, 88]
    },
    {
      "label": "Актуализация контактов, email или телефон",
      "color": "#00CCFF",
      "data": [40, 32, 60, 55, 50, 48, 55, 58, 58]
    },
    {
      "label": "Должность и функционал",
      "color": "#FF9933",
      "data": [32, 40, 42, 42, 38, 35, 40, 38, 38]
    },
    {
      "label": "Выявление потребностей",
      "color": "#00DD44",
      "data": [24, 20, 30, 35, 25, 20, 15, 20, 25]
    },
    {
      "label": "Обработка возражений клиента",
      "color": "#FFBB00",
      "data": [0, 2, 8, 12, 22, 28, 18, 22, 15]
    },
    {
      "label": "Пропущенные",
      "color": "#FF5577",
      "data": [2, 5, 10, 12, 8, 18, 16, 12, 8]
    }
  ]
}
```

**ACTION:**
- [ ] Extract monthly values from PDF p.23 line chart for each series

---

## 1.6 Call Records (p.19)

### GET /api/calls?page=1&limit=16

```json
{
  "pagination": {
    "page": 1,
    "limit": 16,
    "total": 16,
    "label": "16 results"
  },
  "calls": [
    {
      "id": "call_001",
      "dateTime": "2025-01-27 12:32",
      "badgeType": "ЛИД",
      "badgeColor": "blue",
      "badgeSecondary": "ЗВОНОК",
      "badgeSecondaryColor": "purple",
      "number": 13,
      "manager": "[размыто]",
      "duration": "00:03:13",
      "group": 1,
      "tags": "lead...",
      "callRecording": "[размыто]",
      "scorePercent": 72,
      "scoreColor": "green",
      "secretaryBypass": 3,
      "greeting": 3,
      "appointment": 3,
      "appointers": 2
    },
    // ... 15 more rows from PDF p.19
  ]
}
```

**ACTION:**
- [ ] Transcribe all 10 visible rows from PDF p.19 exactly

---

## 1.7 Call Detail (pp.20-21)

### GET /api/calls/{callId}

```json
{
  "call": {
    "id": "call_001",
    "phone": "7 987 441-37-38",
    "dateTime": "2025-01-27 10:00",
    "manager": "Юлия",
    "duration": "00:04:26",
    "summary": "Клиент интересуется наличием специалистов по информационной безопасности и технической документации...",
    "transcription": "Алю. Да. Егор, что-то переволосл. Да, смотрите, загрузка возможна...",
    "clientObjections": [
      "Мне не хочется, во-первых, засорять, во-вторых, делать напрасную работу.",
      "Это вы можете сказать, это у вас не тайны?"
    ],
    "reverseFeedback": "Юлия, вы хорошо справились с тем, что предоставили клиенту общую почту...",
    "scoring": {
      "secretaryBypass": {
        "score": 3,
        "label": "Обход секретаря",
        "explanation": "Оценка: 3 балла. Обоснование: Менеджер, Юлия, не пытались обойти секретаря..."
      },
      "greeting": {
        "score": 3,
        "label": "Приветствие и установка контакта",
        "explanation": "Оценка: 3 балла. Обоснование: Юлия приветствовала клиента..."
      },
      // ... 6 more criteria
      "overallPercent": 45,
      "overallColor": "yellow"
    }
  }
}
```

**ACTION:**
- [ ] Extract exact scoring breakdown from PDF pp.20-21

---

## 1.8 Filtering & Configuration Data

### GET /api/crm/pipelines (p.4 dropdowns)

```json
{
  "pipelines": [
    {
      "id": "psm3",
      "name": "ПСМ3",
      "notificationState": "Закрыто и не реализовано"
    },
    {
      "id": "drivers2",
      "name": "Водители 2",
      "notificationState": "Закрыто и не реализовано"
    },
    {
      "id": "creo_test",
      "name": "Для тестирования Крео",
      "notificationState": "Закрыто и не реализовано"
    },
    {
      "id": "salebot_tech",
      "name": "Техническая Salebot",
      "notificationState": "Закрыто и не реализовано"
    }
  ]
}
```

**ACTION:**
- [ ] Confirm exact pipeline names from PDF p.4
- [ ] Check if there are more than 4

---

### GET /api/filters (p.8)

List of available filters with default state

```json
{
  "filters": [
    {
      "id": "first_calls",
      "name": "Фильтр первых звонков",
      "description": "Ограничение на получение и обработку только первых звонков от клиента.",
      "enabled": true
    },
    {
      "id": "matching_managers",
      "name": "Фильтр совпадающих ответственных лиц",
      "description": "Фильтрация по совпадению ответственных за звонок и связанные сущности.",
      "enabled": true
    },
    {
      "id": "call_duration",
      "name": "Фильтр длительности звонков",
      "description": "Ограничение на длительность получаемых звонков.",
      "enabled": true
    },
    {
      "id": "call_type",
      "name": "Фильтр по типу звонка",
      "description": "Ограничение на получение и обработку по типу звонка.",
      "enabled": true
    },
    {
      "id": "manager",
      "name": "Фильтр менеджеров",
      "description": "Список менеджеров чьи звонки будут обрабатываться.",
      "enabled": true
    },
    {
      "id": "data_source",
      "name": "Фильтр по источнику данных",
      "description": "Ограничение на получение и обработку звонков из определённых источников.",
      "enabled": true
    },
    {
      "id": "deal_stage",
      "name": "Фильтр по стадиям сделки",
      "description": "Фильтрация звонков по стадиям связанной с ним сделки.",
      "enabled": true
    },
    {
      "id": "lead_status",
      "name": "Фильтр по статусу лида",
      "description": "Получаем только звонки у лидов которых проставлен соответствующий статус.",
      "enabled": true
    }
  ]
}
```

**ACTION:**
- [ ] Confirm all 8 filters listed exactly as on PDF p.8

---

### GET /api/managers (pp.9, 17)

```json
{
  "managers": [
    {
      "id": "mgr_1",
      "name": "Ренaта",
      "selected": true,
      "interests": "DIALEXT"
    },
    {
      "id": "mgr_2",
      "name": "Владимир",
      "selected": true,
      "interests": null
    },
    {
      "id": "mgr_3",
      "name": "Виктор",
      "selected": true,
      "interests": null
    },
    // ... more managers
    {
      "id": "mgr_9",
      "name": "Юлия Грищенко",
      "selected": false,
      "interests": null
    }
  ]
}
```

**ACTION:**
- [ ] Extract full manager names from PDF p.9 (currently blurred)
- [ ] Define which are selected by default

---

### GET /api/deal-sources (p.10)

```json
{
  "sources": [
    {
      "id": "source_1",
      "name": "[Source 1 name]",
      "selected": true
    },
    // ... 9 more
  ]
}
```

**ACTION:**
- [ ] Extract all source names from PDF p.10

---

### GET /api/crm/objects (p.6)

```json
{
  "objectTypes": [
    {
      "id": "deal",
      "name": "Сделка",
      "checked": false
    },
    {
      "id": "lead",
      "name": "Лид",
      "checked": false
    },
    {
      "id": "contact",
      "name": "Контакт",
      "checked": false
    }
  ]
}
```

**ACTION:**
- [ ] Confirm initial state (all unchecked?)

---

## 1.9 Rules & Evaluation (p.13)

### GET /api/rules

Full list of evaluation rules, grouped and paginated

```json
{
  "groups": [
    {
      "id": 1,
      "active": true,
      "scale": 13,
      "totalRules": 13
    },
    {
      "id": 2,
      "active": true,
      "scale": 6,
      "totalRules": 6
    },
    {
      "id": 3,
      "active": true,
      "scale": 5,
      "totalRules": 5,
      "rules": [
        {
          "id": "RATE1",
          "name": "Приветствие...",
          "description": "Менеджер должен корректно и д...",
          "scale": 1,
          "active": true,
          "score": 1
        },
        {
          "id": "RATE2",
          "name": "Выявление...",
          "description": "Менеджер должен задать прави...",
          "scale": 1,
          "active": true,
          "score": 1
        },
        // ... 3 more
      ]
    },
    {
      "id": 11,
      "active": true,
      "scale": 8,
      "totalRules": 8
    },
    {
      "id": 22,
      "active": true,
      "scale": 7,
      "totalRules": 7
    }
  ],
  "pagination": {
    "total": 47,
    "label": "47 results"
  }
}
```

**ACTION:**
- [ ] Extract exact rule keys, names, scales from PDF p.13 (currently abbreviated)
- [ ] Confirm group structure

---

### GET /api/llm-tags

```json
{
  "tags": [
    {
      "priority": 1,
      "name": "pushing",
      "nameRu": "дожим клиента",
      "description": "Повторный разговор с клиентом, менеджер должимает клиента",
      "active": true,
      "showInStats": true,
      "color": "#FF6B9D"
    },
    {
      "priority": 2,
      "name": "warm",
      "nameRu": "Теплые звонки (не...",
      "description": "Теплые звонки (клиент оставил...",
      "active": true,
      "showInStats": true,
      "color": "#FF9999"
    },
    // ... 9 more tags from PDF p.14
  ],
  "pagination": {
    "total": 11,
    "label": "11 results"
  }
}
```

**ACTION:**
- [ ] Extract all tag names & colors from PDF p.14
- [ ] Fix typo: "должимает" → correct form?

---

### GET /api/groups (p.15)

```json
{
  "groups": [
    {
      "id": 0,
      "order": 0,
      "tags": ["payment"],
      "name": "Платежи",
      "description": "Не оценивается",
      "active": true
    },
    {
      "id": 1,
      "order": 1,
      "tags": ["cold"],
      "name": "Холодные лиды",
      "description": "Холодные звонки...",
      "active": true
    },
    {
      "id": 2,
      "order": 2,
      "tags": ["warm"],
      "name": "Теплые лиды",
      "description": "Теплые лиды (с сайта, CRM, от партнеров)",
      "active": true
    },
    {
      "id": 3,
      "order": 3,
      "tags": ["pushing"],
      "name": "Дожим",
      "description": "...",
      "active": true
    },
    // ... more groups
  ]
}
```

**ACTION:**
- [ ] Extract exact group-to-tags mapping from PDF p.15

---

END OF SECTION 1

---
```

---

## PRIORITY 3: Table & Form Specifications

### Location: Add NEW section

```markdown
# Part 2: Tables, Forms & Components

## 2.1 Daily Statistics Table (p.3)

### Column Specification

| Column | Align | Min Width | Data Type | Example |
|--------|-------|-----------|-----------|---------|
| Дата | left | 100px | date (DD-MM-YYYY) | 30-01-2025 |
| Звонков обработано / принято [ошибок] | center | 150px | `int / int [int]` | 147 / 157 [-1] |
| Кол-во звонков обработанных за день [ошибок] | center | 150px | `int [int]` | 305 [-5] |
| Кол-во минут, обработанных за день | center | 120px | int | 747 |

### Row Count
- Display: 10 rows (fixed)
- Source: Last 10 days in date range

### Sorting
- Default: Date descending (newest first)
- Clickable headers? (Y/N)

### Filters
- Date range: [From] [To] (DD.MM.YYYY format)
- Workspace dropdown

### Actions per Row
- Click row → show detail? (Y/N)

---

## 2.2 Call List Table (p.19)

### Column Specification

| Column | Align | Min Width | Sortable | Data Type | Color/Example |
|--------|-------|-----------|----------|-----------|---------|
| Дата и время з... | left | 140px | yes | datetime | 27/01/2025 12:32 |
| ID | left | 80px | no | string (blurred) | [размыто] |
| Ссылки | left | 120px | no | 2 badges | ЛИД (blue), ЗВОНОК (purple) |
| № | center | 50px | yes | int | 13 |
| Менеджер | left | 100px | yes | name (blurred) | [размыто] |
| Длит. зв... | center | 80px | yes | duration MM:SS | 00:03:13 |
| № гру... | center | 50px | yes | int | 1 |
| Теги | left | 100px | no | tag list | lead... |
| Звонок | left | 100px | no | string (blurred) | [размыто] |
| Оценка (%) | center | 90px | yes | int + color badge | 72% (green) |
| Обход секрет... | center | 80px | no | int | 3 |
| Приветства... | center | 80px | no | int | 3 |
| Назначен... | center | 80px | no | int | 2 |

### Row Count
- Display: 10 visible rows
- Total: 16 results (shown at bottom)
- Pagination: next/prev buttons? (Y/N)

### Row Height
- Compact: ~40px
- Hover effect: highlight background

### Responsive
- Horizontal scroll when <1400px? (Y/N)

---

## 2.3 Manager Performance Table (p.17)

### Column Specification

| Column | Align | Width | Data Type |
|--------|-------|-------|-----------|
| Менеджер | left | 120px | name |
| Звонков | center | 80px | int |
| Сp. оценка | center | 80px | int + % symbol |

### Summary Row

| Column | Value |
|--------|-------|
| SUM | 28 |
| AVERAGE | 67% |

### Chart Below Table

Stacked horizontal bar per manager showing:
- Good (≥72%) = green
- OK (40–71%) = yellow
- Bad (<40%) = pink

---

## 2.4 Email Notifications Form (p.4)

### Fields

```
[Workspace dropdown] "Любой" (default)
  Options: Любой, ПСМ3, Водители 2, ...

[Pipeline dropdown 1] "ПСМ3"
  Label: "ПСМ3"
  Options: (from API /crm/pipelines)
  Default: "Закрыто и не реализовано"

[Pipeline dropdown 2] "Водители 2"
  Default: "Закрыто и не реализовано"

[Pipeline dropdown 3] "Для тестирования Крео"
  Default: "Закрыто и не реализовано"

[Pipeline dropdown 4] "Техническая Salebot"
  Default: "Закрыто и не реализовано"

[Textarea] "Список адресов отправки"
  Placeholder: (empty)
  Height: 120px
  Monospace font: yes

[Textarea] "Список адресов, разделенных новой строкой"
  Placeholder: (empty)
  Height: 80px

[Checkbox] "Отправка уведомления при изменении воронки звонка"
  Label: "After call pipeline changed"
  Checked: false (default)

[Button] "ПРИМЕНИТЬ"
  Primary color
  Size: medium
```

### Validation
- Email list: valid email format per line? (Y/N)
- Phone list: format? (Y/N)

---

## 2.5 Privacy Settings Form (p.5)

### Fields

```
[Dropdown] Type
  Options: Private, Public, Domain-only (?)
  Default: Private

[Textarea] Email list
  Label: "Email list"
  Help: "List of approved emails separated by a new line"
  Height: 150px

[Textarea] Email domains list
  Label: "Email domains list"
  Help: "List of approved domains separated by a new line"
  Height: 150px
```

**ACTION:**
- [ ] Confirm all Privacy type options from p.5

---

## 2.6 CRM Objects Form (p.6)

### Fields

```
[Checkbox] Сделка
  Checked: false (default)

[Checkbox] Лид
  Checked: false (default)

[Checkbox] Контакт
  Checked: false (default)

[Expandable section] "ЗАГРУЗКА ДАННЫХ ИЗ ВЫБРАННЫХ ПОЛЕЙ В INTERNAL DATA"

  [Link button] "ПОЛЯ ЛИДОВ"
  [Link button] "ПОЛЯ СДЕЛОК"
  [Link button] "ПОЛЯ КОНТАКТОВ"
  [Link button] "ПОЛЯ КОМПАНИЙ"

[Button] "Обновить список полей"
  Size: medium

[Button] "Сохранить"
  Size: medium
```

---

## 2.7 Task Creation Form (p.7)

### Fields

```
[Checkbox] "Включить создание задач для данного воркспейса"
  Checked: false (default)
  Help text: "Статус аналитики: Отключена"

[Input number] "Минимальное пороговое значение (в %) для создания задачи ответственному лицу"
  Default: 0
  Min: 0, Max: 100

[Input number] "Максимальное пороговое значение (в %) для создания задачи ответственному лицу"
  Default: 40
  Min: 0, Max: 100

[Input number] "Отложить создание задач в период С (часов) UTC"
  Default: 0
  Min: 0, Max: 23

[Input number] "Отложить создание задач в период ДО (часов) UTC"
  Default: 0
  Min: 0, Max: 23

[Button] "Сохранить"
```

---

## 2.8 Report Filter: Calls (p.18)

### Fields

```
[Dropdown] "Чек-лист"
  Default: (empty)
  Options: (from LLM tags)
  Help: "Чтобы увидеть в таблице оценки по критериям, выберите только один чек-лист"

[Checkbox] "Звонки без оценки"
  Checked: false (default)

[Input text] "Поиск по ID"
  Placeholder: (empty)

[Input text] "Поиск по ID акта"
  Placeholder: (empty)

[Input number] "Поиск по ID лида/сделки"
  Default: 0
  Spinner: [▲] [▼]

[Input text] "Поиск по данным CRM"
  Placeholder: (empty)

--- CALL DURATION ---

[Radio] "Больше 2 минут"
  Selected: true (default)
  Slider: [███████████████ 40-3.403] ↻

[Radio] "Больше 10 минут"
  Selected: false

[Radio] "Больше 20 минут"
  Selected: false

--- SEARCH BY TOPICS (Grid, multiselect checkboxes) ---

[Checkbox] ">15 мин"
[Checkbox] "Источник: Сделка"
[Checkbox] "Новости"
...
(All 30+ from PDF p.18, in 3 columns)

--- RATING ---

[Radio] "Все"
  Selected: true (default)

[Radio] "Хорошо (≥ 70%)"

[Radio] "Удовлетворительно (< 7...)"

[Radio] "Плохо (≤ 40%)"

[Button] "Группировать по ме..."
```

---

## 2.9 Manager Filter (p.9)

### Fields

```
[Radio] "Лиды/Сделки/Клиенты (фильтруются полученные данные)"
  Selected: true (default)

[Radio] "Звонки (для Битрикс, вставляется в запрос)"

--- Manager Multiselect ---

[Radio] "Всех"
[Radio] "Текст 'DIALEXT' в поле UF_INTERESTS у менеджера в CRM"
[Radio] "Выбранных"
  Selected: true (default)

[Checkbox] [Manager 1] [размыто]
  Checked: true

[Checkbox] [Manager 2] [размыто]
  Checked: true

[Checkbox] [Manager 3] [размыто]
  Checked: true

[Checkbox] [Manager 4] [размыто]
  Checked: false

...
(Total: 8-10 managers shown)
```

---

## 2.10 Source Filter (p.10)

### Fields

```
[Button] "Загрузить список источников"

[Radio] "Всех"
[Radio] "Выбранных"
  Selected: true (default)

[Checkbox] [Source 1] [размыто и размыто]
  Checked: true

[Checkbox] [Source 2]
  Checked: false

...
(Total: 10+ sources)
```

---

## 2.11 Tabs (Used on multiple pages)

### Tab Styling

| Property | Value |
|----------|-------|
| Height | ~40px |
| Font size | 14px |
| Font weight | 500 (inactive) / 600 (active) |
| Border bottom | 2px solid color when active |
| Active color | ? (primary) |
| Inactive color | #999999 |
| Padding | 12px 16px |
| Gap between tabs | 0px (merged) |

### Tab Examples

**p.12 (Company Settings):**
- Правила оценки (active)
- Квалификация
- Тегирование

**p.14 (Rules):**
- Правила оценки
- Квалификация
- Тегирование (active)

**p.17 (Report Tabs):**
- Оценка по чек-листам (active)
- Динамика развития менеджеров
- [?] (with info icon)

---

## 2.12 Dropdowns / Selects

### Standard Dropdown

```
┌──────────────────────────────────┐
│ Selected Value                 ▼ │
└──────────────────────────────────┘
```

- Height: 36–40px
- Border: 1px #CCCCCC (default), 2px #0066CC (focus)
- Padding: 8px 12px
- Font: 14px
- Arrow icon: right side, 16px gray

### Multiselect (Manager Filter, p.9)

```
☑ Item 1
☐ Item 2
☑ Item 3
```

- Checkbox: 18x18px, colored when checked
- Gap: 8px between checkbox and label

---

## 2.13 Date Picker (p.2-3, 17)

### Format

```
[📅 DD.MM.YYYY] — [📅 DD.MM.YYYY]
```

- Calendar icon: Lucide `calendar` (16px)
- Format: DD.MM.YYYY
- Placeholder: grey text
- When click: native date picker or custom calendar?

---

## 2.14 Buttons

### Primary Button

```
[ПРИМЕНИТЬ]
```

- Background: #0066CC (or ?)
- Text: white, bold, 14px
- Padding: 10px 20px
- Border radius: ? (2px, 4px, 6px?)
- Hover: darker blue
- Active: even darker
- Disabled: #CCCCCC, cursor: not-allowed

### Secondary Button

```
[Сохранить]
```

- Background: white or light grey
- Border: 1px #CCCCCC
- Text: dark grey, 14px bold
- Padding: 10px 20px

### Link Button (e.g., "ПОЛЯ ЛИДОВ")

```
ПОЛЯ ЛИДОВ (blue text, underline on hover)
```

- Color: #0066CC
- No background
- Cursor: pointer
- Text decoration: none (default), underline (hover)

### Icon Button (Refresh, etc.)

```
  ↻  or  +  or  ×
```

- Size: 24x24px or 20x20px?
- Background: transparent
- Hover: light grey background

---

END OF SECTION 2

---
```

---

## PRIORITY 4: Scoring Criteria (Critical for Consistency)

### Location: Add NEW section

```markdown
# Part 3: Scoring Rules & Evaluation Criteria

## 3.1 Canonical Scoring Criteria (p.13, 20-21)

**⚠️ CONSISTENCY ISSUE:** PDF shows "Должность и функционал" listed twice (items 5 & 8).
**DECISION:** Keep single definition + all references.

### Scoring Scale

All criteria scored 0–3 points:
- **3 points** = Excellent / Full compliance
- **2 points** = Acceptable / Partial compliance
- **1 point** = Minimal / Poor performance
- **0 points** = Not attempted

### All Criteria (Canonical Order for all UI)

1. **Обход секретаря** (Secretary Bypass)
   - Definition: Manager successfully reached decision-maker, not blocked
   - Score 3: Direct contact, no gate-keeping
   - Score 2: Some friction but got through
   - Score 1: Barely talked to target
   - Score 0: Hung up on / blocked

2. **Приветствие и установка контакта** (Greeting & Contact Establishment)
   - Definition: Manager introduces self, company, establishes rapport
   - Score 3: Polite, friendly, says name + company name
   - Score 2: Greets but forgets name OR company
   - Score 1: Just starts talking, no formal hello
   - Score 0: (N/A)

3. **Назначение времени демонстрации** (Appointment Setting)
   - Definition: Manager suggests specific demo time
   - Score 3: Concrete date + time offered
   - Score 2: Demo mentioned but no date
   - Score 1: Vague mention, no commitment
   - Score 0: No mention

4. **Актуализация контактов: email или телефон** (Contact Update)
   - Definition: Verify / capture current contact info
   - Score 3: Got email OR phone from client
   - Score 2: Client gave one, missing other
   - Score 1: Attempted but incomplete
   - Score 0: Didn't ask

5. **Должность и функционал** (Job Title & Responsibility)
   - Definition: Clarify client's role, what they're responsible for
   - Score 3: Clear understanding of role & authority
   - Score 2: Some clarity, minor gaps
   - Score 1: Vague idea only
   - Score 0: Didn't ask

6. **Выявление потребностей** (Need Discovery)
   - Definition: Ask open questions to understand client pain points
   - Score 3: Multiple needs identified, summarized
   - Score 2: Some needs mentioned
   - Score 1: Surface-level question asked
   - Score 0: No questions

7. **Обработка возражений клиента** (Objection Handling)
   - Definition: Address client concerns, provide solutions
   - Score 3: Anticipate & resolve objection
   - Score 2: Acknowledge but weak response
   - Score 1: Deflect or ignore
   - Score 0: Agree with objection

8. **Долженость и функционал** (Duty & Functionality)
   - **DUPLICATE:** Use item #5 (Должность и функционал)
   - **ACTION:** Remove from all UI lists; standardize on single criterion

9. **Презентация продукта с учетом выявленных потребностей** (Product Presentation)
   - Definition: Pitch solution matching discovered needs
   - Score 3: Tailored to client's situation
   - Score 2: Generic pitch, somewhat relevant
   - Score 1: Off-topic or weak
   - Score 0: No mention of product

### Scaling Factor (Масштаб)

Each criterion can have a **multiplier** (from PDF p.13 "Масштаб" column).

- Example: Criterion with "Масштаб = 2" counts double in final score
- Default: 1 (no multiplier)
- Used in: Rule groups

### Group Structure (p.13)

Groups organize rules by category:

| Group ID | Count | Example Rules | Use Case |
|----------|-------|---------------|----------|
| 1 | 13 | [criteria 1–3 variants] | Main evaluation |
| 2 | 6 | [criteria 4–5 variants] | Follow-up calls |
| 3 | 5 | [selected criteria] | High-priority calls |
| 11 | 8 | [subset] | Demo calls |
| 22 | 7 | [subset] | Objection scenarios |

**ACTION:**
- [ ] Extract exact rule names & keys from p.13 for each group

---

## 3.2 LLM Tag Definitions (p.14)

### Tag List (with corrected typos)

| Priority | Tag Name (EN) | Tag Name (RU) | Description | Color | Active | Show in Stats |
|----------|---------------|---------------|-------------|-------|--------|---------------|
| 1 | pushing | дожим клиента | Повторный разговор с клиентом, менеджер persuades | #FF6B9D | ✓ | ✓ |
| 2 | warm | Теплые звонки | Теплые звонки (клиент оставил контакт) | #FF9999 | ✓ | ✓ |
| 3 | demo | Проведение демо | Суть звонка: проведение демонстрации | #FFB366 | ✓ | ✓ |
| 4 | skip | Пропущенные | Звонки, не являющиеся продажами | #CCCCCC | ✓ | ✓ |
| 5 | cold | Холодные звонки | холодные звонки (первичный контакт) | #99CCFF | ✓ | ✓ |
| 6 | incoming_llm | Входящий по ЛЛМ | звонок, который можно квалифицировать по ЛЛМ | #FFFF99 | ✓ | ☐ |
| 7 | new_warm_le... | Новый теплый лид | Менеджер совершает звонок р... | #99FF99 | ✓ | ✓ |
| 8 | skip | Неудобно разговор... | собеседник почти сразу прерывает разговор | #FFCCCC | ✓ | ☐ |
| ... | ... | ... | ... | ... | ... | ... |

**ACTION:**
- [ ] Confirm all 11 tags from PDF p.14
- [ ] Verify colors (currently guessed)
- [ ] Fix: is tag 8 also "skip" or different name?
- [ ] Typo check: "должимает" → "дожимает"?

---

## 3.3 Group-to-Tag Mapping (p.15)

### Groups & Associated Tags

| Group ID | Group Name | Order | Tags Included | Description |
|----------|-----------|-------|---------------|-------------|
| 0 | payment | 0 | payment | Не оценивается |
| 1 | cold | 1 | cold | Холодные звонки |
| 2 | warm | 2 | warm, new_warm_lead | Теплые лиды (с сайта, CRM, от партнеров) |
| 3 | pushing | 3 | pushing | Дожим |
| 11 | [?] | ? | [?] | [?] |
| ... | ... | ... | ... | ... |

**ACTION:**
- [ ] Extract all groups from PDF p.15
- [ ] Map tags to each group exactly

---

## 3.4 Overall Score Calculation

### Final Call Score (%)

```
Overall % = SUM(score_per_criterion × multiplier) / MAX_POSSIBLE * 100
```

Example:
- Criterion 1: 3 points × multiplier 1 = 3
- Criterion 2: 2 points × multiplier 1 = 2
- Criterion 3: 1 point × multiplier 2 = 2
- Sum: 3 + 2 + 2 = 7
- Max possible: 3×1 + 3×1 + 3×2 = 9
- Score: 7/9 × 100 = 77.8% → rounded to 78% or 77%?

**ACTION:**
- [ ] Confirm rounding rule (nearest int, floor, ceil?)

---

END OF SECTION 3

---
```

---

## PRIORITY 5: Consistency & Cleanup Pass

### Location: Add NEW section

```markdown
# Part 4: Consistency Fixes & Canonical Labels

## 4.1 Duplicate / Conflicting Criteria

### Issue #1: "Должность и функционал" appears twice

**Currently:**
- p.13 rule list shows item as criterion #5
- p.21 breakdown also calls it item #8 with slightly different description

**Fix:**
```
BEFORE (p.21):
  5. Должность и функционал
  ...
  8. Долженость и функционал (typo + duplicate)

AFTER (canonical):
  1. Обход секретаря
  2. Приветствие и установка контакта
  3. Назначение времени демонстрации
  4. Актуализация контактов: email или телефон
  5. Должность и функционал [← only occurrence]
  6. Выявление потребностей
  7. Обработка возражений клиента
  8. Презентация продукта с учетом выявленных потребностей [← new item, from p.21]
```

**Action:** 
- [ ] Use this 8-item list everywhere (p.13, 17, 20, 21, 22)
- [ ] Remove all references to item #8 "Долженость и функционал"

---

## 4.2 Typo Fixes

| Current (PDF) | Corrected | Locations |
|---------------|-----------|-----------|
| должимает | дожимает | p.14 tag description |
| Долженость | Должность | p.21 |
| Ренaта | Рената | p.17, 22 (Cyrillic 'a' vs Latin 'a') |
| Викторе... | Виктор | throughout |
| Tамара | Тамара | (if Cyrillic 'T' issue) |

---

## 4.3 Standardized Button Labels

### Across All Pages

| Action | Label | Style |
|--------|-------|-------|
| Apply filters / confirm | ПРИМЕНИТЬ | primary, caps |
| Save settings | Сохранить | secondary, title case |
| Update list | Обновить список полей | secondary |
| Add item | + добавить | link + icon |
| Delete row | Delete / X | icon |
| Expand section | [►] / [▼] | toggle icon |
| More options | Еще [▼] | dropdown |

**ACTION:**
- [ ] Verify case (CAPS vs Title) for each button
- [ ] Standardize across all forms (p.2, 4, 6, 7, 12, etc.)

---

## 4.4 Label Capitalization

### Form Labels

| Current Style | Rule |
|---------------|------|
| "Дата от" | lowercase after article |
| "Воркспейс:" | title case with colon |
| "ПРИМЕНИТЬ" | CAPS for primary action |
| "Сохранить" | Title case for secondary action |
| "Чеклист" | Capitalize properly |
| "Обход секретаря" | Title case for criteria |

**ACTION:**
- [ ] Audit all labels for consistency
- [ ] Choose rule (all title case? mixed?)
- [ ] Update throughout

---

## 4.5 Placeholder Text Consistency

### Form Fields

| Field Type | Placeholder | Required |
|------------|-------------|----------|
| Email list (p.4) | (empty) or "one per line"? | yes/no |
| ID search (p.18) | (empty) | no |
| Domain list (p.5) | (empty) or help text? | no |
| Report date (p.2) | DD.MM.YYYY | yes |
| Textarea (p.6) | (empty) | no |

**ACTION:**
- [ ] Define placeholder strategy
- [ ] Audit all inputs for consistency

---

## 4.6 Success/Error Messages

### Dialog / Toast Styles

**Currently:** No visible success/error messaging in PDF

**Needed for:**
- Form submission (e.g., "Настройки сохранены" → Save settings)
- Validation error (e.g., "Неверный email в строке 3" → Invalid email line 3)
- Delete confirmation (e.g., "Удалить правило RATE1?" → Delete rule RATE1?)

**ACTION:**
- [ ] Define message templates for:
  - [ ] Save success
  - [ ] Form validation errors
  - [ ] Delete confirmation
  - [ ] Load error
  - [ ] Network timeout

---

## 4.7 Empty States

### When Data Is Missing

| Component | Empty Message | Action |
|-----------|---------------|--------|
| Call list (p.19) | "Нет звонков, соответствующих критериям" | Show filters |
| Manager list (p.17) | "Нет менеджеров на выбранный период" | Expand date range |
| Report graph (p.22) | "Недостаточно данных" | message or empty grid? |

**ACTION:**
- [ ] Define empty state UI for each major table/list

---

## 4.8 Loading States

### Skeleton / Spinner

**Where needed:**
- [ ] Report charts while loading (p.17, 22, 23)
- [ ] Call list while fetching (p.19)
- [ ] Dropdowns while loading options (p.4)

**Style:**
- Animation: pulsing or spinning?
- Duration: ?

---

END OF SECTION 4

---
```

---

## SUMMARY: Edit Checklist by Priority

### MUST-HAVE (Before dev starts)

- [ ] **0.1–0.9:** Design system (fonts, colors, spacing, icons, formats)
- [ ] **1.1–1.9:** Complete API specs (all data endpoints with example JSON)
- [ ] **2.1–2.5:** All form fields with defaults & validation rules
- [ ] **3.1–3.4:** Canonical scoring criteria (fix dupes, typos)
- [ ] **4.1–4.4:** Consistency fixes (button labels, capitalization, remove typos)

### NICE-TO-HAVE (Polish)

- [ ] **2.6–2.14:** Detailed component specs (tabs, dropdowns, buttons, date picker)
- [ ] **4.5–4.8:** Messages, empty states, loading states

### ESTIMATED EFFORT

| Section | Additions | Source Work | Est. Hours |
|---------|-----------|-------------|-----------|
| Design System (0) | 9 subsections | Screenshots + guessing | 3–4h |
| API Data (1) | 9 endpoints | PDF tables + graphs | 4–5h |
| Forms & Tables (2) | 14 specs | PDF layouts + logic | 3–4h |
| Scoring (3) | 4 specs | PDF rules + clarification | 2–3h |
| Consistency (4) | 8 fixes | Audit + decisions | 1–2h |
| **TOTAL** | **~44 additions** | **Dev-ready spec** | **13–18h** |

---

## Next Steps

1. **Review this plan** → Which sections are most urgent?
2. **Extract missing data** → Screenshots, zoom into text, transcribe tables
3. **Fill gaps** → Convert "ACTION" items into completed data
4. **Code generation** → Pass final spec to dev/AI with confidence of 95%+ coverage

---

*End of Edit Plan*
