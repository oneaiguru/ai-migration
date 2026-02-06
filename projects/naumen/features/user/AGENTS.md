# User Portal Features - Agent Instructions

## Module Overview
End-user interface BDD specifications for employee self-service features in the WFM system.

## Current Status: 🔄 PENDING ANALYSIS
User portal HTML files await analysis and conversion to BDD specifications.

## HTML Files to Process

### Priority Files for Analysis
| HTML File | Expected Feature | Priority | Estimated Scenarios |
|-----------|------------------|----------|-------------------|
| `График.html` | user-schedule-viewing.feature | High | 15-20 |
| `Заявки.html` | user-requests.feature | High | 12-18 |
| `Профиль.html` | user-profile.feature | Medium | 8-12 |
| `Рабочие смены - месяц.html` | monthly-schedule-view.feature | Medium | 10-15 |
| `Рабочие смены - неделя.html` | weekly-schedule-view.feature | Medium | 8-12 |
| `Отчеты.html` | user-reports.feature | Low | 6-10 |

### Excluded Files
- `Обмен сменами.html` - Shift exchange (excluded per project requirements)
- `Копия` files - Backup copies (skip duplicates)

## Expected Features to Extract

### User Schedule Viewing
**Source**: `График.html`
**Feature**: `user-schedule-viewing.feature`

Expected scenarios:
- View personal schedule for current week/month
- Navigate between different time periods
- View shift details and assigned activities
- Mobile-responsive schedule display
- Export personal schedule to calendar

### User Requests Management
**Source**: `Заявки.html`
**Feature**: `user-requests.feature`

Expected scenarios:
- Submit time-off requests
- View request status and history
- Cancel pending requests
- Receive request notifications
- Bulk request operations

### User Profile Management
**Source**: `Профиль.html`
**Feature**: `user-profile.feature`

Expected scenarios:
- View personal information
- Update contact details
- Manage skills and certifications
- View work history and metrics
- Upload profile photo

### Schedule View Variants
**Sources**: `Рабочие смены - месяц.html`, `Рабочие смены - неделя.html`
**Features**: `monthly-schedule-view.feature`, `weekly-schedule-view.feature`

Expected scenarios:
- Toggle between monthly and weekly views
- Highlight today's schedule
- View teammate schedules (if permitted)
- Print schedule views
- Responsive design for mobile devices

### User Reports
**Source**: `Отчеты.html`
**Feature**: `user-reports.feature`

Expected scenarios:
- Generate personal timesheet reports
- View attendance statistics
- Export personal performance metrics
- Access allowed organizational reports

## User Interface Patterns

### Navigation Differences from Admin
- Simplified navigation menu
- Employee-focused functionality only
- Self-service emphasis
- Mobile-first design considerations

### Permission Model
- **Employee Role**: Read-only access to personal data
- **Limited Scope**: Cannot access other employees' information
- **Self-Service**: Submit requests, view own schedules/reports
- **Approval Workflow**: Requests require manager approval

## Code Style for User Features

### Background Template
```gherkin
Background:
  Given I am logged into the workforce management system
  And I have employee privileges
  And I am viewing my personal dashboard
```

### Scenario Templates
```gherkin
Scenario: View personal schedule
  Given I am on my schedule page
  When I select the current week view
  Then I should see my assigned shifts for this week
  And I should see shift times and activities
  And I should not see other employees' schedules

@mobile
Scenario: Mobile schedule viewing
  Given I am accessing the system from a mobile device
  When I view my schedule
  Then the interface should be touch-friendly
  And important information should be clearly visible
```

### Tag Standards for User Features
- `@employee` - Employee-specific functionality
- `@mobile` - Mobile-responsive features
- `@self-service` - Self-service capabilities
- `@approval` - Features requiring manager approval
- `@notification` - Features with notification systems

## Russian UI Elements Expected
User interface will likely include:
- Мой график (My Schedule)
- Мои заявки (My Requests)
- Профиль (Profile)
- Отчеты (Reports)
- Рабочие смены (Work Shifts)
- Уведомления (Notifications)

## Quality Standards for User Features

### Focus Areas
1. **Self-Service Capabilities**: Emphasize employee autonomy
2. **Mobile Experience**: Touch-friendly, responsive design
3. **Simplified Workflows**: Streamlined compared to admin features
4. **Permission Boundaries**: Clear separation of employee vs admin access
5. **Approval Processes**: Request submission and tracking

### Business Rules to Extract
- What personal information can employees view/edit?
- What types of requests can employees submit?
- How are schedule changes communicated?
- What reports are available to employees?
- How does mobile access differ from desktop?

## Processing Instructions

When processing user HTML files:

1. **Identify Self-Service Features**: Focus on employee-initiated actions
2. **Note Permission Restrictions**: What employees cannot access
3. **Extract Mobile Patterns**: Responsive design considerations
4. **Document Approval Workflows**: Request submission and tracking
5. **Preserve Russian UI**: Maintain original interface language

## Task Format
For user HTML processing, provide filename:
```
График.html
```

Expected output:
- Complete .feature file with employee-focused scenarios
- Mobile and responsive design considerations
- Self-service workflow documentation
- Status report: DONE/DOUBT/FAIL

## Success Criteria
Each user feature file should include:
- ✅ Employee permission model (not admin)
- ✅ Self-service workflow scenarios
- ✅ Mobile-responsive considerations
- ✅ Approval workflow integration
- ✅ Russian UI preservation
- ✅ 8-20 comprehensive scenarios per feature

---