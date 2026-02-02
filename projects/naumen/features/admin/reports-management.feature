# features/admin/reports-management.feature
Feature: Reports Management
  As a workforce manager
  I want to access and generate various reports
  So that I can analyze performance and make informed decisions

  Background:
    Given I am logged into the system
    And I am in the Reports section
    And I have access to contact center "Контакт-центр 1010"

  Scenario: View main reports listing
    When I navigate to the reports page
    Then I should see the reports navigation with:
      | Tab | Label |
      | Main | Основные |
      | Custom | Пользовательские |
    And "Основные" should be active by default
    And I should see a list of available main reports

  Scenario: Access work time graph report
    Given I am viewing the main reports
    When I click on "График рабочего времени"
    Then I should be taken to the work time graph report
    And I should see employee work time visualizations
    And I should be able to view work schedules graphically

  Scenario: Access daily work time report
    Given I am viewing the main reports
    When I click on "График рабочего времени (сутки)"
    Then I should be taken to the daily work time report
    And I should see 24-hour work time breakdowns
    And I should be able to analyze daily patterns

  Scenario: View punctuality reports
    Given I am viewing the main reports
    When I click on "Пунктуальность за сутки"
    Then I should see daily punctuality analysis
    And I should be able to identify attendance issues
    When I click on "Общая пунктуальность"
    Then I should see overall punctuality metrics
    And I should be able to view punctuality trends over time

  Scenario: Access deviation reports
    Given I am viewing the main reports
    When I click on "Отклонения от нормы часов"
    Then I should see hour deviation analysis
    And I should be able to identify overtime and undertime
    And I should see variance from planned hours

  Scenario: View employee schedule reports
    Given I am viewing the main reports
    When I click on "Рабочий график сотрудников"
    Then I should see employee schedule reports
    And I should be able to view individual employee schedules
    And I should see schedule assignments and patterns

  Scenario: Access payroll calculation reports
    Given I am viewing the main reports
    When I click on "Расчет заработной платы"
    Then I should see payroll calculation reports
    And I should be able to view salary computations
    And I should see work hour summaries for payroll

  Scenario: View T-13 timesheet reports
    Given I am viewing the main reports
    When I click on "Табель учета рабочего времени (Т-13)"
    Then I should see T-13 timesheet reports
    And I should be able to generate official timesheets
    And I should see standardized time tracking data

  Scenario: Access schedule building log
    Given I am viewing the main reports
    When I click on "Журнал построения расписания"
    Then I should see schedule building history
    And I should be able to track schedule changes
    And I should see when and who made schedule modifications

  Scenario: View license reports
    Given I am viewing the main reports
    When I click on "Лицензии"
    Then I should see license usage reports
    And I should be able to monitor license allocation
    And I should see license compliance information

  Scenario: Switch to custom reports
    Given I am viewing main reports
    When I click on "Пользовательские" tab
    Then I should be taken to the custom reports section
    And I should see user-created custom reports
    And I should be able to create new custom reports

  Scenario: Navigate between report categories
    Given I am in the reports section
    When I switch between "Основные" and "Пользовательские" tabs
    Then the interface should update to show the appropriate report list
    And the active tab should be highlighted
    And I should see different report options in each category

  Scenario: Filter reports by type
    Given I am viewing the reports list
    When I apply filters to narrow down report types
    Then I should see only reports matching the filter criteria
    And I should be able to quickly find specific reports
    And the filter should persist during the session

  Scenario: Export report data
    Given I am viewing a specific report
    When I click the export option
    Then I should be able to download the report data
    And I should be able to choose export formats (PDF, Excel, CSV)
    And the exported data should maintain report formatting

  Scenario: Schedule automatic report generation
    Given I am viewing a report I want to automate
    When I set up scheduled report generation
    Then I should be able to specify frequency (daily, weekly, monthly)
    And I should be able to set recipients for the automated reports
    And the system should generate and send reports automatically

  Scenario: Customize report parameters
    Given I am accessing a configurable report
    When I modify report parameters
    Then I should be able to set date ranges
    And I should be able to select specific employees or groups
    And I should be able to choose metrics to include
    And the report should generate with my custom parameters

  @performance
  Scenario: Generate large reports efficiently
    Given I am requesting a report with extensive data
    When the report generation begins
    Then the system should show progress indicators
    And large reports should be processed without timeout
    And I should receive notification when the report is ready

  @integration
  Scenario: Use reports for decision making
    Given I have generated various performance reports
    When I analyze the report data
    Then I should be able to identify trends and patterns
    And I should be able to make informed staffing decisions
    And I should be able to track KPI improvements over time


  @export @customization
  Scenario: Custom report builder with drag-drop interface
    Given админ открывает "Конструктор отчетов"
    When перетаскивает поля "ФИО, Отдел, Часы работы" в область данных
    And добавляет группировку по "Отдел"
    And настраивает фильтр "Период: текущий месяц"
    Then система генерирует предварительный просмотр
    And позволяет сохранить как шаблон
    And экспортирует в выбранном формате

  Scenario: Select dynamic data sources for custom report
    Given I am creating a new custom report
    When I choose data source "Прогнозы"
    Then available fields should update to forecast metrics

  Scenario: Use custom calculation formula editor
    Given I am configuring report calculations
    When I enter formula "(Факт - План) / План"
    Then the preview should reflect the calculated values

  Scenario: Manage report template library
    Given I open the template library
    When I save current settings as "Ежемесячный отчет"
    Then it should appear in the list of reusable templates

  Scenario: Apply conditional formatting rules
    Given a report table displays performance values
    When I set rule "значение < 90%" to highlight red
    Then cells below threshold should show red background

  Scenario: Build interactive charts in the report
    Given I switch to chart builder mode
    When I choose "Круговая диаграмма" for visualization
    Then the preview should display an interactive pie chart

  Scenario: Export report to PDF with custom template
    Given I select export format "PDF"
    And choose template "Стандарт"
    When I export the report
    Then the PDF should use the selected styling

  Scenario: Excel export with formulas and formatting
    Given I export the report to Excel
    Then formulas for totals should be preserved
    And cell formatting should match the report view

  Scenario: CSV export with UTF-8 encoding option
    Given I choose to export data as CSV
    When I select encoding "UTF-8"
    Then the resulting file should open correctly in Excel

  @export
  Scenario: Bulk export multiple reports as ZIP archive
    Given I select several generated reports
    When I choose "Экспорт ZIP"
    Then the system downloads a ZIP file containing each report

  Scenario: Schedule automated report exports
    Given I configure a report for weekly delivery
    When the scheduled time is reached
    Then the system generates and emails the report automatically

  Scenario: Track export progress and receive notification
    Given I export a large report
    Then a progress indicator should display completion percentage
    And I receive a notification when export finishes

  @analytics @calculation
  Scenario: Naumen absenteeism calculation with complex rules
    Given загружены данные посещаемости за "квартал"
    When запускается расчет абсентеизма "по методике Naumen"
    Then система применяет формулы учета "больничные, отпуска, прогулы"
    And рассчитывает коэффициенты по подразделениям
    And отображает детализацию по причинам отсутствия
    And генерирует рекомендации по улучшению

  Scenario: Punctuality analysis with pattern detection
    Given I open the punctuality report
    When I analyze hourly arrival patterns
    Then the system highlights recurring lateness trends

  Scenario: Work time optimization with forecasting integration
    Given I combine forecast data with actual work time
    When I run optimization calculations
    Then the report suggests schedule adjustments
    And performs statistical significance testing of results


  @performance @export
  Scenario: Export 10000-row report without timeout
    Given я формирую отчет с "10000 строками"
    When запускается экспорт в формат "Excel"
    Then система отображает индикатор прогресса
    And файл формируется менее чем за "60 секунд"
    And память сервера не превышает установленный лимит

  @performance @realtime
  Scenario: Resume export after connection loss
    Given во время экспорта произошел обрыв сети
    When соединение восстанавливается
    Then процесс экспорта продолжается с последнего шага
    And пользователь получает уведомление о возобновлении

  @performance
  Scenario: Optimize chart rendering for heavy metrics
    Given отчет содержит сложные графики на основе больших данных
    When я открываю вкладку с графиками
    Then рендеринг выполняется постепенно без блокировки UI
    And среднее время кадра не превышает "20ms"
