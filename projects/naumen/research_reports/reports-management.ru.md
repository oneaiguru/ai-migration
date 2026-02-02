# features/admin/reports-management.feature
Функционал: Управление отчетами
  Как менеджер по персоналу
  Я хочу просматривать и создавать различные отчеты
  Чтобы анализировать эффективность и принимать взвешенные решения

  Background:
    Дано I am logged into the system
    И I am in the Reports section
    И I have access to contact center "Контакт-центр 1010"

  Сценарий: Просмотр списка основных отчетов
    Когда I navigate to the reports page
    Тогда I should see the reports navigation with:
      | Tab | Label |
      | Main | Основные |
      | Custom | Пользовательские |
    И "Основные" should be active by default
    И I should see a list of available main reports

  Сценарий: Доступ к отчету графика рабочего времени
    Дано I am viewing the main reports
    Когда I click on "График рабочего времени"
    Тогда I should be taken to the work time graph report
    И I should see employee work time visualizations
    И I should be able to view work schedules graphically

  Сценарий: Доступ к отчету рабочего времени за сутки
    Дано I am viewing the main reports
    Когда I click on "График рабочего времени (сутки)"
    Тогда I should be taken to the daily work time report
    И I should see 24-hour work time breakdowns
    И I should be able to analyze daily patterns

  Сценарий: Просмотр отчетов по пунктуальности
    Дано I am viewing the main reports
    Когда I click on "Пунктуальность за сутки"
    Тогда I should see daily punctuality analysis
    И I should be able to identify attendance issues
    Когда I click on "Общая пунктуальность"
    Тогда I should see overall punctuality metrics
    И I should be able to view punctuality trends over time

  Сценарий: Доступ к отчетам по отклонениям
    Дано I am viewing the main reports
    Когда I click on "Отклонения от нормы часов"
    Тогда I should see hour deviation analysis
    И I should be able to identify overtime and undertime
    И I should see variance from planned hours

  Сценарий: Просмотр отчетов по расписанию сотрудников
    Дано I am viewing the main reports
    Когда I click on "Рабочий график сотрудников"
    Тогда I should see employee schedule reports
    И I should be able to view individual employee schedules
    И I should see schedule assignments and patterns

  Сценарий: Доступ к отчетам расчета заработной платы
    Дано I am viewing the main reports
    Когда I click on "Расчет заработной платы"
    Тогда I should see payroll calculation reports
    И I should be able to view salary computations
    И I should see work hour summaries for payroll

  Сценарий: Просмотр табелей Т-13
    Дано I am viewing the main reports
    Когда I click on "Табель учета рабочего времени (Т-13)"
    Тогда I should see T-13 timesheet reports
    И I should be able to generate official timesheets
    И I should see standardized time tracking data

  Сценарий: Доступ к журналу построения расписания
    Дано I am viewing the main reports
    Когда I click on "Журнал построения расписания"
    Тогда I should see schedule building history
    И I should be able to track schedule changes
    И I should see when and who made schedule modifications

  Сценарий: Просмотр отчетов по лицензиям
    Дано I am viewing the main reports
    Когда I click on "Лицензии"
    Тогда I should see license usage reports
    И I should be able to monitor license allocation
    И I should see license compliance information

  Сценарий: Переключение на пользовательские отчеты
    Дано I am viewing main reports
    Когда I click on "Пользовательские" tab
    Тогда I should be taken to the custom reports section
    И I should see user-created custom reports
    И I should be able to create new custom reports

  Сценарий: Навигация между категориями отчетов
    Дано I am in the reports section
    Когда I switch between "Основные" and "Пользовательские" tabs
    Тогда the interface should update to show the appropriate report list
    И the active tab should be highlighted
    И I should see different report options in each category

  Сценарий: Фильтрация отчетов по типу
    Дано I am viewing the reports list
    Когда I apply filters to narrow down report types
    Тогда I should see only reports matching the filter criteria
    И I should be able to quickly find specific reports
    И the filter should persist during the session

  Сценарий: Экспорт данных отчета
    Дано I am viewing a specific report
    Когда I click the export option
    Тогда I should be able to download the report data
    И I should be able to choose export formats (PDF, Excel, CSV)
    И the exported data should maintain report formatting

  Сценарий: Настройка автоматической генерации отчетов
    Дано I am viewing a report I want to automate
    Когда I set up scheduled report generation
    Тогда I should be able to specify frequency (daily, weekly, monthly)
    И I should be able to set recipients for the automated reports
    И the system should generate and send reports automatically

  Сценарий: Настройка параметров отчета
    Дано I am accessing a configurable report
    Когда I modify report parameters
    Тогда I should be able to set date ranges
    И I should be able to select specific employees or groups
    И I should be able to choose metrics to include
    И the report should generate with my custom parameters

  @performance
  Сценарий: Эффективное создание больших отчетов
    Дано I am requesting a report with extensive data
    Когда the report generation begins
    Тогда the system should show progress indicators
    И large reports should be processed without timeout
    И I should receive notification when the report is ready

  @integration
  Сценарий: Использование отчетов для принятия решений
    Дано I have generated various performance reports
    Когда I analyze the report data
    Тогда I should be able to identify trends and patterns
    И I should be able to make informed staffing decisions
    И I should be able to track KPI improvements over time


  @export @customization
  Сценарий: Конструктор отчетов с интерфейсом dragCustom report builder with drag-drop interfacedrop
    Дано админ открывает "Конструктор отчетов"
    Когда перетаскивает поля "ФИО, Отдел, Часы работы" в область данных
    И добавляет группировку по "Отдел"
    И настраивает фильтр "Период: текущий месяц"
    Тогда система генерирует предварительный просмотр
    И позволяет сохранить как шаблон
    И экспортирует в выбранном формате

  Сценарий: Выбор динамических источников данных для пользовательского отчета
    Дано I am creating a new custom report
    Когда I choose data source "Прогнозы"
    Тогда available fields should update to forecast metrics

  Сценарий: Использование редактора формул вычислений
    Дано I am configuring report calculations
    Когда I enter formula "(Факт - План) / План"
    Тогда the preview should reflect the calculated values

  Сценарий: Управление библиотекой шаблонов отчетов
    Дано I open the template library
    Когда I save current settings as "Ежемесячный отчет"
    Тогда it should appear in the list of reusable templates

  Сценарий: Применение правил условного форматирования
    Дано a report table displays performance values
    Когда I set rule "значение < 90%" to highlight red
    Тогда cells below threshold should show red background

  Сценарий: Создание интерактивных диаграмм в отчете
    Дано I switch to chart builder mode
    Когда I choose "Круговая диаграмма" for visualization
    Тогда the preview should display an interactive pie chart

  Сценарий: Экспорт отчета в PDF с собственным шаблоном
    Дано I select export format "PDF"
    И choose template "Стандарт"
    Когда I export the report
    Тогда the PDF should use the selected styling

  Сценарий: Экспорт в Excel с формулами и форматированием
    Дано I export the report to Excel
    Тогда formulas for totals should be preserved
    И cell formatting should match the report view

  Сценарий: Экспорт в CSV с выбором кодировки UTF-8
    Дано I choose to export data as CSV
    Когда I select encoding "UTF-8"
    Тогда the resulting file should open correctly in Excel

  @export
  Сценарий: Массовый экспорт нескольких отчетов в ZIP
    Дано I select several generated reports
    Когда I choose "Экспорт ZIP"
    Тогда the system downloads a ZIP file containing each report

  Сценарий: Планирование автоматического экспорта отчетов
    Дано I configure a report for weekly delivery
    Когда the scheduled time is reached
    Тогда the system generates and emails the report automatically

  Сценарий: Отслеживание прогресса экспорта и уведомление
    Дано I export a large report
    Тогда a progress indicator should display completion percentage
    И I receive a notification when export finishes

  @analytics @calculation
  Сценарий: Расчет абсентеизма Naumen со сложными правилами
    Дано загружены данные посещаемости за "квартал"
    Когда запускается расчет абсентеизма "по методике Naumen"
    Тогда система применяет формулы учета "больничные, отпуска, прогулы"
    И рассчитывает коэффициенты по подразделениям
    И отображает детализацию по причинам отсутствия
    И генерирует рекомендации по улучшению

  Сценарий: Анализ пунктуальности с обнаружением шаблонов
    Дано I open the punctuality report
    Когда I analyze hourly arrival patterns
    Тогда the system highlights recurring lateness trends

  Сценарий: Оптимизация рабочего времени с интеграцией прогноза
    Дано I combine forecast data with actual work time
    Когда I run optimization calculations
    Тогда the report suggests schedule adjustments
    И performs statistical significance testing of results


  @performance @export
  Сценарий: Экспорт отчета на 10000 строк без тайм-аута
    Дано я формирую отчет с "10000 строками"
    Когда запускается экспорт в формат "Excel"
    Тогда система отображает индикатор прогресса
    И файл формируется менее чем за "60 секунд"
    И память сервера не превышает установленный лимит

  @performance @realtime
  Сценарий: Возобновление экспорта после потери соединения
    Дано во время экспорта произошел обрыв сети
    Когда соединение восстанавливается
    Тогда процесс экспорта продолжается с последнего шага
    И пользователь получает уведомление о возобновлении

  @performance
  Сценарий: Оптимизация отрисовки графиков при больших объемах
    Дано отчет содержит сложные графики на основе больших данных
    Когда я открываю вкладку с графиками
    Тогда рендеринг выполняется постепенно без блокировки UI
    И среднее время кадра не превышает "20ms"
