# Shared Components - Agent Instructions

## Module Overview
Common system components used across all WFM modules - authentication, navigation, and data grid functionality.

## Current Status: ✅ COMPLETE
All shared component specifications are complete with 3 feature files covering foundational system capabilities.

## Feature Files (3 files)

### Authentication System
**File**: `authentication.feature` (3 scenarios)
- User login/logout with validation
- Role-based access control (Admin vs Employee)
- Session management and security
- Error handling for invalid credentials

### Navigation System
**File**: `navigation.feature` (8 scenarios)
- Main menu navigation (Прогнозы, Расписание, Сотрудники, Отчеты)
- Sub-menu navigation (Смены, Схемы, График, Заявки)
- Active state highlighting
- Breadcrumb management
- Multi-level hierarchy support

### Data Grid Components
**File**: `data-grid.feature` (6 scenarios)
- Virtualized table performance (500+ rows)
- Sort/filter functionality
- Column resize and reorder
- Select all/bulk operations
- Real-time data refresh
- Memory optimization for large datasets

## Technical Foundation

### Performance Requirements
- **Virtualized Rendering**: Handle 500+ employees efficiently
- **Memory Management**: Stable during large dataset operations
- **Responsive UI**: Smooth scrolling and interactions
- **Real-time Updates**: Immediate data refresh

### UI Components Standards
- **Material-UI Integration**: Consistent styling across modules
- **Russian Localization**: Full Russian UI support preserved
- **Mobile Responsive**: Touch-friendly interactions
- **Accessibility**: ARIA compliance for screen readers

### Security Features
- **Role-based Access**: Admin vs Employee permission levels
- **Session Validation**: Automatic logout on inactivity
- **Route Protection**: Secure navigation between modules
- **Input Validation**: Sanitization of user inputs

## Integration Points
These shared components are utilized by:

- **Schedule Grid**: Employee list virtualization (500+ employees)
- **Shift Management**: Template list navigation and filtering
- **Reports**: Data export and filtering capabilities
- **Employee Management**: Profile photo grids and search
- **All Modules**: Authentication and navigation infrastructure

## Code Style for Shared Components

### Authentication Scenarios
```gherkin
Background:
  Given I am on the WFM system login page

Scenario: Successful login with valid credentials
  When I enter valid credentials
  Then I should be redirected to the dashboard
  And I should see my role-appropriate navigation menu
```

### Navigation Scenarios
```gherkin
Background:
  Given I am logged into the workforce management system
  And I am on the main dashboard

Scenario: Navigate to schedule management
  When I click on "Расписание" in the main navigation
  Then I should see the schedule submenu options
  And I should be able to access "График" (Schedule Grid)
```

### Data Grid Scenarios
```gherkin
@performance
Scenario: Handle large employee dataset
  Given I have 500+ employees in the system
  When I load the employee management page
  Then the employee grid should load efficiently using virtualization
  And scrolling should remain smooth and responsive
```

## Quality Standards

### Tag Usage
- `@authentication` - For login/logout scenarios
- `@navigation` - For menu and routing scenarios
- `@performance` - For large dataset handling
- `@ui` - For user interface interactions
- `@accessibility` - For screen reader and keyboard navigation

### Russian UI Preservation
Maintain original Russian navigation terms:
- Главная (Home)
- Расписание (Schedule)
- Сотрудники (Employees)
- Отчеты (Reports)
- Прогнозы (Forecasts)
- Настройки (Settings)

## Implementation Notes
- Components are module-agnostic and reusable across admin/user interfaces
- Performance optimizations are critical for scale (500+ employees)
- Russian UI text must be preserved exactly as shown in HTML sources
- Error handling should be consistent across all modules
- Security validations should be comprehensive

## Testing Priorities
1. **Performance**: Virtualized rendering with large datasets
2. **Security**: Role-based access control validation
3. **Usability**: Navigation flow and user experience
4. **Accessibility**: Screen reader and keyboard support
5. **Localization**: Russian text rendering and character support

## Future Maintenance
This module is complete and stable. Any changes should maintain backward compatibility with existing admin and user features that depend on these shared components.

---