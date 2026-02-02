# Features Directory - BDD Specifications

## Purpose
This directory contains all BDD feature specifications extracted from WFM system HTML files, organized by functional modules.

## Directory Structure
```
features/
├── admin/ (Administrative interface features)
├── shared/ (Common system components)
└── user/ (End-user interface features)
```

## Module Organization

### Admin Module (✅ COMPLETE)
**Location**: `features/admin/`
**Status**: 11 feature files, 162+ scenarios
**Coverage**: Schedule management, employee management, reporting, forecasting

Key Features:
- schedule-management.feature (31 scenarios) - 500+ employee grid
- employee-management.feature (12 scenarios) - Profile management
- shift-management.feature (16 scenarios) - 40+ shift templates
- reports-management.feature (17 scenarios) - 10+ report types

### Shared Module (✅ COMPLETE)
**Location**: `features/shared/`
**Status**: 3 feature files, common components
**Coverage**: Authentication, navigation, data grids

Key Features:
- authentication.feature (3 scenarios) - Login/logout, security
- navigation.feature (8 scenarios) - Multi-level navigation
- data-grid.feature (6 scenarios) - Virtualized tables

### User Module (🔄 PENDING)
**Location**: `features/user/`
**Status**: Awaiting HTML analysis
**Coverage**: Employee self-service features

Planned Features:
- schedule-viewing.feature - Employee schedule access
- user-requests.feature - Self-service requests
- user-profile.feature - Profile management

## BDD Standards

### File Naming
- Use kebab-case: `schedule-management.feature`
- Be descriptive: `employee-management.feature` not `employees.feature`
- Match functional area: align with HTML source purpose

### Scenario Structure
```gherkin
Feature: [Module Name]
  As a [user type]
  I want to [capability]
  So that [business value]

  Background:
    Given I am logged into the workforce management system
    And I have [appropriate] privileges

  Scenario: [Specific functionality]
    Given [initial state]
    When [user action]
    Then [expected result]
    And [additional verification]
```

### Tag Usage
- `@performance` - For scenarios involving large datasets (500+ employees)
- `@integration` - For cross-module functionality
- `@ui` - For user interface specific tests
- `@api` - For backend integration scenarios

## HTML Source Mapping
Each feature file maps to specific HTML sources:

| Feature File | HTML Source | Status |
|-------------|-------------|---------|
| schedule-management.feature | График - Контакт-центр 1010-1.html | ✅ Complete |
| employee-management.feature | Сотрудники - Контакт-центр 1010.html | ✅ Complete |
| shift-management.feature | Смены - Контакт-центр 1010.html | ✅ Complete |
| user-schedule-viewing.feature | График.html | 🔄 Pending |

## Quality Checklist
For each new feature file:
- [ ] Proper Gherkin format
- [ ] Business-focused scenarios (not technical)
- [ ] Russian UI text preserved where relevant
- [ ] Performance tags for large datasets
- [ ] Integration tags for cross-module features
- [ ] Realistic test data from actual UI
- [ ] Edge cases and error conditions
- [ ] Background section with common setup

---