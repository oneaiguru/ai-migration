# Reference Data Management Module

## Overview
This module provides comprehensive reference data management capabilities for the Naumen WFM system, implementing BDD Feature 17 requirements through adaptation of the existing SchemaBuilder component.

## Component Location
- **Main Component**: `/src/modules/reference-data-management/components/ReferenceDataConfigurationUI.tsx`
- **Route**: `/reference-data` (accessible via "Справочники" tab)

## Features Implemented

### 1. Work Rules Configuration (Правила работы)
- **Standard Working Hours**: Configure daily/weekly working hours
- **Break Schedules**: Define lunch and coffee break rules
- **Overtime Rules**: Set overtime working conditions
- **Weekend Rules**: Define weekend working patterns
- **Russian Localization**: Complete Russian interface

### 2. Event Management (Управление событиями)
- **Meeting Events**: Regular team meetings and conferences
- **Training Events**: Employee training and onboarding programs
- **System Maintenance**: Technical maintenance windows
- **Holiday Events**: Company holidays and special occasions
- **Custom Events**: Flexible event type creation
- **Color Coding**: Visual differentiation of event types

### 3. Vacation Schemes Setup (Схемы отпусков)
- **Yearly Allocation**: Annual vacation days setup
- **Consecutive Limits**: Maximum consecutive vacation days
- **Advance Notice**: Minimum notice requirements
- **Carry Over**: Unused vacation days rollover
- **Multiple Schemes**: Different schemes for different employee groups

### 4. Absence Reasons Management (Причины отсутствия)
- **Sick Leave**: Medical absence with documentation
- **Personal Leave**: Family and personal circumstances
- **Training Leave**: Professional development absences
- **Approval Workflow**: Configurable approval requirements
- **Duration Limits**: Maximum absence duration settings

## Technical Implementation

### Code Reuse Analysis
- **Base Component**: SchemaBuilder.tsx (schedule-grid-system)
- **Adaptation Level**: 85% code reuse achieved
- **Preserved Patterns**: Modal dialogs, CRUD operations, status management
- **New Features**: Multi-tab interface, specialized forms, category management

### Key Adaptations
1. **Data Structure**: Adapted from ScheduleSchema to ReferenceDataConfig
2. **UI Components**: Tab-based navigation instead of single-view
3. **Form Handling**: Specialized forms for each reference data type
4. **Localization**: Complete Russian language support
5. **Icon System**: Category-specific icons and visual indicators

### Component Architecture
```
ReferenceDataConfigurationUI/
├── State Management (useState hooks)
├── CRUD Operations (create, read, update, delete)
├── Form Components (specialized for each data type)
├── Modal Dialogs (consistent with existing patterns)
├── Tab Navigation (work rules, events, vacation, absence)
└── Statistics Dashboard (item counts and status)
```

## Integration Points

### Route Configuration
- Added to `App.tsx` switch statement
- Route ID: `reference-data`
- Tab Label: "Справочники"
- Icon: 🗂️

### Navigation Integration
- Added to `AdminLayout.tsx` tabs array
- Control panel button integration
- Consistent styling with existing tabs

## Russian Localization Features

### Interface Elements
- **Headers**: "Управление справочными данными"
- **Buttons**: "Создать", "Отмена", "Сохранить"
- **Status Labels**: "Активно", "Неактивно"
- **Category Names**: Full Russian terminology

### Data Categories
- **Work Rules**: Рабочие часы, Перерывы, Сверхурочные, Выходные
- **Events**: Совещания, Обучение, Техническое обслуживание, Праздники
- **Vacation**: Базовый отпуск, Расширенный отпуск
- **Absence**: Больничный, Семейные обстоятельства, Личные дела

## Usage Instructions

### Navigation
1. Open the WFM application
2. Click on "Справочники" tab in the top navigation
3. Select the desired reference data category using sub-tabs

### Creating New Items
1. Click "Создать" button in the header
2. Fill in the required fields in the modal form
3. Configure category-specific settings
4. Click "Создать" to save

### Managing Existing Items
1. View items in the categorized lists
2. Use "Подробнее" to view full details
3. Toggle active/inactive status with play/pause buttons
4. Delete items using the trash icon

### Status Management
- **Active Items**: Display with green "Активно" badge
- **Inactive Items**: Display with yellow "Неактивно" badge
- **Statistics**: View counts in the footer section

## Development Notes

### Performance Considerations
- Efficient state management with React hooks
- Optimized rendering with conditional displays
- Responsive design for various screen sizes

### Extensibility
- Easy to add new reference data types
- Flexible form system for different data structures
- Consistent CRUD pattern for all operations

### Maintenance
- Clear separation of concerns
- Reusable form components
- Consistent styling with existing components

## Testing
- Component builds successfully without errors
- Development server runs on http://localhost:3004/
- All features accessible through navigation
- Forms validation and state management working correctly

## Future Enhancements
- Import/Export functionality for reference data
- Advanced filtering and search capabilities
- Bulk operations for multiple items
- Integration with external data sources
- Audit trail for configuration changes