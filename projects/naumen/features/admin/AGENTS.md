# Admin Features - Agent Instructions

## Module Overview
Administrative interface BDD specifications for WFM system covering 9 core modules with 162+ comprehensive scenarios.

## Current Status: ✅ COMPLETE
All admin HTML files have been analyzed and converted to BDD specifications.

## Feature Files Status

### Core Schedule Management
| File | Scenarios | Source HTML | Key Features |
|------|-----------|-------------|--------------|
| `schedule-management.feature` | 31 | График - Контакт-центр 1010-1.html | 500+ employee grid, virtualized, FTE calculation |
| `shift-management.feature` | 16 | Смены - Контакт-центр 1010.html | 40+ templates, visual editor, 24/48h periods |
| `schema-management.feature` | 15 | Схемы - Контакт-центр 1010.html | Rotation patterns, day types, template integration |
| `request-management.feature` | 12 | Заявки - Контакт-центр 1010.html | Bulk operations, status tracking, workflow |

### Analytics & Forecasting
| File | Scenarios | Source HTML | Key Features |
|------|-----------|-------------|--------------|
| `trend-analysis.feature` | 18 | Анализ трендов - Контакт-центр 1010 3.html | 3-level analysis, Chart.js, 15-min intervals |
| `forecast-building.feature` | 8 | Построить прогноз - ИНВ-2.html | Multi-algorithm, exception management |
| `absenteeism-calculation.feature` | 11 | Расчёт абсентеизма - Контакт-центр 1010.html | Profile management, periodic exceptions |

### Employee & Reports
| File | Scenarios | Source HTML | Key Features |
|------|-----------|-------------|--------------|
| `employee-management.feature` | 12 | Сотрудники - Контакт-центр 1010.html | Photos, profiles, skills, virtualized grid |
| `employee-workload.feature` | 5 | - | Overtime tracking, performance metrics |
| `reports-management.feature` | 17 | Отчеты - Контакт-центр 1010.html | 10+ report types, T-13 timesheets, export |
| `time-tracking.feature` | 7 | - | Clock in/out, activity tracking, breaks |

## Technical Capabilities Covered

### Performance Features
- **Virtualized Tables**: ReactVirtualized for 500+ employees
- **Chart Integration**: Chart.js for trend analysis
- **Real-time Search**: Instant filtering across modules
- **Lazy Loading**: Photos and large datasets

### Business Logic
- **Schedule Conflicts**: Prevention and resolution
- **Bulk Operations**: Mass approve/reject workflows
- **Role-based Access**: Manager vs employee permissions
- **Multi-level Analysis**: Strategic/Tactical/Operational

### Integration Points
- **Schema-to-Schedule**: Template application to grid
- **Forecast-to-Staffing**: Trend analysis driving decisions
- **Request-to-Schedule**: Approval workflow integration
- **Employee-to-Workload**: Performance tracking

## Russian UI Elements Preserved
Key terms maintained in scenarios:
- Прогнозы (Forecasts)
- Расписание (Schedule)
- Сотрудники (Employees)
- Отчеты (Reports)
- Смены (Shifts)
- Схемы (Schemas)
- График (Schedule Grid)
- Заявки (Requests)

## Code Style for New Admin Features
When creating new admin feature files:

1. **Background Section**: Always include system login and manager privileges
2. **Context Setup**: Reference "Контакт-центр 1010" contact center
3. **Performance Tags**: Use @performance for scenarios with 500+ employees
4. **Integration Tags**: Use @integration for cross-module workflows
5. **Realistic Data**: Use actual Russian names and values from HTML
6. **Error Handling**: Include validation and error scenarios

## Implementation Ready
All admin features include:
- ✅ Proper Gherkin Given-When-Then format
- ✅ Business-focused scenarios (not technical)
- ✅ Performance tags (@performance)
- ✅ Integration tags (@integration)
- ✅ Realistic test data from actual UI
- ✅ Edge cases and error conditions

## Future Maintenance
This module is complete. Any new admin HTML files should follow the established patterns and quality standards demonstrated in the existing feature files.

---