# Visual Comparison Guide: Current vs Target

## 🎯 Quick Reference: What Needs to Change

This document shows side-by-side comparisons of your current implementation vs the target design from the PDF specification.

---

## Comparison 1: Main Forecast Chart

### ❌ CURRENT STATE (Screenshot_2025-11-20_at_19_55_20.png)
**Issues:**
- No chart visualization - just table data
- Missing the bar chart with blue/green bars
- No collection event dots
- No visual timeline
- Stats are separate cards, not integrated with chart

### ✅ TARGET STATE (PDF Page 2 - Chart Dialog)
**Requirements:**
- Chart container with light gray background (#fafafa)
- Blue bars for historical data (#1890ff)
- Green bars for forecast data (#52c41a)
- Red circular dots for collection events (#ff4d4f)
- Toggle buttons: "За сутки" / "Неделю" / "Месяц"
- Date range picker at top
- Legend in top-right corner
- Summary stats at bottom (two cards)

**Key Differences:**
```
Current: Table-based layout, no visualization
Target:  Chart-first layout with bars and dots

Current: Stats scattered in separate cards
Target:  Stats in footer below chart

Current: No time-series visualization
Target:  Clear timeline with past (blue) and future (green)
```

---

## Comparison 2: Site Selection & Gallery

### ✅ CURRENT STATE - Already Good!
Your site gallery cards at the top (Screenshot_2025-11-20) are actually well-designed:
- Shows Site ID
- Shows location info
- Shows fill percentage bar
- Shows WAPE accuracy
- Shows date range

**Keep this!** Just add a button or link to open the forecast dialog.

### 📝 TARGET ENHANCEMENT
Add to each gallery card:
```tsx
<Button 
  type="link" 
  onClick={() => openForecastDialog(siteId)}
>
  История и прогноз →
</Button>
```

---

## Comparison 3: Collection Event Indicators

### ❌ CURRENT STATE
In your table, collection events are shown as:
- Blue badge with text "Есть накопление"
- No visual timeline context

### ✅ TARGET STATE (PDF Mockup)
Collection events should be:
- Red circular dots (12px diameter) positioned ABOVE the accumulation bar
- Tooltip on hover showing:
  ```
  Вывоз ВТ 23 АПР. 2024
  Рейсов: 2
  Объем: 163.70 м³
  Вес: 10.04 т
  Пробег: 152.60 км
  ```

**Visual Example:**
```
    ● ← Red dot (collection event)
    |
  | █ | ← Blue bar (accumulation before pickup)
  +---+
```

---

## Comparison 4: View Mode Toggle

### ❌ CURRENT STATE
Not visible in current screenshot - likely doesn't exist yet

### ✅ TARGET STATE
```tsx
<Radio.Group buttonStyle="solid">
  <Radio.Button value="daily">За сутки</Radio.Button>
  <Radio.Button value="weekly">Неделю</Radio.Button>
  <Radio.Button value="monthly">Месяц</Radio.Button>
</Radio.Group>
```

**Behavior:**
- Daily: Show every single day as a bar
- Weekly: Aggregate 7 days into one bar
- Monthly: Aggregate ~30 days into one bar

---

## Comparison 5: Data Representation

### ❌ CURRENT APPROACH (Table)
| Код КП   | Дата       | Объём | Вес    | Пустой вывоз | Заполнение | Риск       | Посл. вывоз |
|----------|------------|-------|--------|--------------|------------|------------|-------------|
| 38127141 | 05.07.2024 | 20.28 | 20283  | Есть накопл. | 10%        | Низкий 0%  | 24.08.2024  |

### ✅ TARGET APPROACH (Chart)
```
Visual Timeline:
[Blue bars: Historical accumulation]
[Red dots: Collection events]
[Green bars: Forecast accumulation]

Time flows left → right
Past ← Present → Future
```

**Why the change?**
- Charts reveal patterns (seasonality, trends)
- Easier to spot anomalies
- Forecasts are more intuitive visually
- Collection timing becomes obvious

---

## Comparison 6: Color Usage

### ❌ CURRENT COLORS
- Blue badges
- Green status indicators
- No consistent color language

### ✅ TARGET COLORS (PDF Specification)
Must use EXACT hex values:

| Color | Hex Code | Usage | Visual |
|-------|----------|-------|--------|
| Blue | `#1890ff` | Historical accumulation | █████ |
| Green | `#52c41a` | Forecast accumulation | █████ |
| Red | `#ff4d4f` | Collection events (dots) | ● |
| Light Blue (hover) | `#40a9ff` | Hovered historical bar | █████ |
| Light Green (hover) | `#73d13d` | Hovered forecast bar | █████ |
| Gray Background | `#fafafa` | Chart container | ░░░░░ |

**Critical:** Do not deviate from these colors. They establish visual consistency across the app.

---

## Comparison 7: Summary Statistics

### CURRENT LAYOUT (Top Cards)
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Суммарный объём │  │ Суммарный вес   │  │ Дней с накоплен │  │ Точность (WAPE) │
│    467.22 м³    │  │   467,223.2 кг  │  │       11        │  │     27.8%       │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

### TARGET LAYOUT (Bottom Cards in Dialog)
```
Dialog Footer:
┌────────────────────────────────────┐  ┌────────────────────────────────────┐
│ Объем факт с 01.11.2024 до 07.11   │  │ Объем прогноз с 08.11 до 14.11     │
│            16.4 м³                  │  │          19.4 м³                   │
│                                     │  │         (green text)               │
└────────────────────────────────────┘  └────────────────────────────────────┘
```

**Key Difference:**
- Current: Four separate metrics
- Target: Two metrics (actual vs forecast) directly related to chart timeframe

---

## Comparison 8: Tooltips

### ❌ CURRENT STATE
Basic tooltips or none at all

### ✅ TARGET TOOLTIPS

**For Historical Bars:**
```
┌─────────────────────┐
│ 05.11.2024          │
│ Факт: 2.3 м³        │
└─────────────────────┘
```

**For Forecast Bars:**
```
┌─────────────────────┐
│ 12.11.2024          │
│ Прогноз: 3.2 м³     │
└─────────────────────┘
```

**For Collection Dots:**
```
┌──────────────────────────┐
│ Вывоз ВТ 23 АПР. 2024    │
│ Рейсов: 2                │
│ Объем: 163.70 м³         │
│ Вес: 10.04 т             │
│ Пробег: 152.60 км        │
└──────────────────────────┘
```

---

## Comparison 9: Dialog vs Full Page

### CURRENT: Full Page Layout
Entire screen is dedicated to forecast interface

### TARGET: Modal Dialog
- Dialog overlays existing page
- Width: 800px
- Can close and return to previous view
- Follows "История КП" menu pattern shown in PDF

**Why Modal?**
- Consistent with existing UI patterns (see PDF screenshots of other dialogs)
- Allows quick check without navigation
- Can be opened from multiple places (gallery, registry, routes)

---

## Comparison 10: Responsive Chart Layout

### CURRENT
Table rows stack naturally

### TARGET REQUIREMENTS
Chart must adjust for different view modes:

**Daily View:**
- Bar width: 24px
- Gap: 8px
- Shows ~14-30 days depending on date range

**Weekly View:**
- Bar width: 48px
- Gap: 8px
- Shows ~8-16 weeks

**Monthly View:**
- Bar width: 72px
- Gap: 8px
- Shows ~3-4 months

**Calculation:**
```typescript
const maxChartWidth = 800 - (2 × 24); // Container minus padding
const totalBars = historical.length + forecast.length;
const barWidth = viewMode === 'daily' ? 24 : viewMode === 'weekly' ? 48 : 72;
const totalWidth = totalBars × (barWidth + 8);

// If overflow, add horizontal scroll or adjust scale
```

---

## Implementation Priority

### Phase 1 (MVP - Must Have) ⭐⭐⭐
1. ✅ Create modal dialog with correct size/title
2. ✅ Add view toggle (daily/weekly/monthly)
3. ✅ Render blue bars for historical data
4. ✅ Render green bars for forecast data
5. ✅ Add tooltips to bars
6. ✅ Add summary stats footer
7. ✅ Use correct colors (#1890ff, #52c41a)

### Phase 2 (Enhanced - Should Have) ⭐⭐
8. ✅ Add red collection dots
9. ✅ Add detailed tooltips for dots
10. ✅ Add legend in top-right
11. ✅ Add date range picker
12. ✅ Implement weekly/monthly aggregation
13. ✅ Add hover state color changes

### Phase 3 (Polish - Nice to Have) ⭐
14. ✅ Smooth transitions/animations
15. ✅ Loading skeleton states
16. ✅ Error handling UI
17. ✅ Empty state handling
18. ✅ Export to CSV button
19. ✅ Print-friendly view

---

## Quick Win vs Full Implementation

### Quick Win (2-3 days) 🚀
Focus on Phase 1 only:
- Basic modal with chart
- Blue/green bars
- Simple tooltips
- Summary stats

**Result:** 70% visual match to PDF

### Full Implementation (1 week) 🎯
All three phases:
- Complete feature parity
- All interactions
- Polish and edge cases

**Result:** 100% match to PDF specification

---

## Testing Screenshots You'll Need

After implementation, take these screenshots to verify:

1. **Daily view with historical + forecast data**
2. **Weekly view showing aggregated bars**
3. **Monthly view showing 3-4 months**
4. **Tooltip on historical bar**
5. **Tooltip on forecast bar**
6. **Tooltip on collection dot**
7. **Legend visibility**
8. **Summary stats at bottom**
9. **Modal opened from site gallery**
10. **Modal with loading state**

Compare each against the PDF mockups for pixel-perfect accuracy.

---

## Common Pitfalls to Avoid ⚠️

### 1. Wrong Colors
```typescript
// ❌ WRONG
const historicalColor = '#1976d2'; // Material UI blue
const forecastColor = '#4caf50';   // Material UI green

// ✅ CORRECT
const historicalColor = '#1890ff'; // Ant Design blue-6
const forecastColor = '#52c41a';   // Ant Design green-6
```

### 2. Wrong Bar Sizing
```typescript
// ❌ WRONG - Fixed height
height: 100px

// ✅ CORRECT - Scaled to data
height: `${dataPoint.accumulation × scaleFactor}px`
```

### 3. Wrong Date Format
```typescript
// ❌ WRONG
"2024-11-05" // ISO format in display

// ✅ CORRECT
"05.11" // DD.MM format for labels
"05.11.2024" // DD.MM.YYYY for tooltips
```

### 4. Missing Collection Dots
```typescript
// ❌ WRONG - Only showing bars
{data.map(point => <Bar {...point} />)}

// ✅ CORRECT - Check for collections
{data.map(point => (
  <>
    {point.collection && <CollectionDot />}
    <Bar {...point} />
  </>
))}
```

### 5. Legend Not Positioned
```css
/* ❌ WRONG */
.legend {
  position: relative;
}

/* ✅ CORRECT */
.legend {
  position: absolute;
  top: 16px;
  right: 16px;
}
```

---

## Final Checklist ✅

Before sending to review:

- [ ] Dialog matches PDF width (800px)
- [ ] Chart background is #fafafa
- [ ] Historical bars are #1890ff
- [ ] Forecast bars are #52c41a
- [ ] Collection dots are #ff4d4f (12px circles)
- [ ] Tooltips show on bar hover
- [ ] Tooltips show on dot hover
- [ ] View toggle works (daily/weekly/monthly)
- [ ] Date picker updates data
- [ ] Legend shows in top-right
- [ ] Summary stats in footer (2 cards)
- [ ] Bar widths correct (24/48/72px)
- [ ] Gap between bars is 8px
- [ ] Dates formatted as DD.MM
- [ ] Opens from site gallery
- [ ] No console errors
- [ ] Responsive on smaller screens
- [ ] Loading state works
- [ ] Error state handled

---

## Contact

If implementation questions arise:
1. Reference the PDF specification first
2. Check this comparison guide
3. Review the PRD document
4. Look at existing similar components in codebase
5. Ask specific questions with screenshots

**Goal:** Pixel-perfect match to PDF mockups!
