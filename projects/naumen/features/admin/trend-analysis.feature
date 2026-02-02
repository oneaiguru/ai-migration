# features/admin/trend-analysis.feature
Feature: Trend Analysis
  As a workforce manager
  I want to analyze call volume trends and patterns
  So that I can make data-driven forecasting and staffing decisions

  Background:
    Given I am logged into the system
    And I am in the Forecasts section
    And I am on the "Анализ трендов" (Trend Analysis) page
    And I have access to contact center "Контакт-центр 1010"

  Scenario: Navigate between analysis levels
    When I am on the trend analysis page
    Then I should see three analysis level options:
      | Level | Label |
      | Strategic | Стратегический |
      | Tactical | Тактический |
      | Operational | Оперативный |
    And "Оперативный" should be highlighted as active by default

  Scenario: Switch to strategic analysis
    Given I am viewing operational analysis
    When I click on "Стратегический" (Strategic)
    Then I should be taken to the strategic analysis view
    And the strategic tab should be highlighted as active
    And I should see long-term trend data and charts

  Scenario: Switch to tactical analysis
    Given I am viewing operational analysis
    When I click on "Тактический" (Tactical)
    Then I should be taken to the tactical analysis view
    And the tactical tab should be highlighted as active
    And I should see medium-term trend analysis

  Scenario: View operational analysis charts
    Given I am on the operational analysis page
    Then I should see multiple trend charts including:
      | Chart Type | Description |
      | Прогноз / факт звонков (шт.) | Forecast vs actual calls |
      | Сезонность. Факт (%) | Seasonality actual percentage |
      | Сумма по дню | Daily summary |
    And each chart should be interactive and display real data

  Scenario: Search for specific queues
    Given I am viewing trend analysis
    When I enter a queue name in the search field "Поиск"
    Then I should see filtered results for that queue
    And the charts should update to show data for the selected queue

  Scenario: Maximize chart for detailed view
    Given I am viewing trend charts
    When I click the maximize button on "Прогноз / факт звонков" chart
    Then the chart should expand to a larger view
    And I should see more detailed chart data and controls
    And I should be able to interact with the expanded chart

  Scenario: View forecast vs actual calls data
    Given I am viewing the operational analysis
    When I look at the "Прогноз / факт звонков (шт.)" chart
    Then I should see forecast data plotted against actual call volumes
    And I should be able to identify variances between forecast and actual
    And the chart should show trends over the selected time period

  Scenario: Analyze seasonality patterns
    Given I am viewing the seasonality chart
    When I examine the "Сезонность. Факт (%)" data
    Then I should see seasonal patterns as percentages
    And I should be able to identify recurring patterns
    And I should see how actual performance varies seasonally

  Scenario: View daily summary trends
    Given I am viewing the daily summary chart
    When I look at "Сумма по дню" data
    Then I should see daily totals and trends
    And I should be able to identify day-of-week patterns
    And I should see performance variations across days

  Scenario: Examine detailed interval data
    Given I am viewing the trend analysis data grid
    Then I should see time intervals in 15-minute increments:
      | Time Intervals |
      | 00:00, 00:15, 00:30, 00:45 |
      | 01:00, 01:15, 01:30, 01:45 |
      | ... continuing through 23:45 |
    And each interval should contain relevant metric data
    And the grid should be virtualized for performance

  Scenario: Add new time period for analysis
    Given I am viewing trend analysis
    When I click the "Период" (Period) add button
    Then I should be able to define a new time period
    And I should be able to configure the period parameters
    And the new period should be available for trend comparison

  Scenario: Filter analysis by time period
    Given I have multiple time periods configured
    When I select a specific time period from the filter
    Then the charts should update to show data for that period only
    And all trend analysis should focus on the selected timeframe

  Scenario: Export trend analysis data
    Given I am viewing trend analysis results
    When I click the save/export button
    Then I should be able to export the trend data
    And the export should include chart data and analysis results
    And I should be able to choose export format options

  Scenario: Analyze queue-specific trends
    Given I have selected a specific queue from the search
    When I view the trend analysis
    Then all charts should show data specific to that queue
    And I should see queue-specific seasonality patterns
    And I should be able to compare queue performance over time

  Scenario: View hourly distribution patterns
    Given I am examining the detailed interval grid
    When I look at hourly patterns across the day
    Then I should see call volume distribution throughout 24 hours
    And I should be able to identify peak and low periods
    And I should see patterns that inform staffing decisions

  @performance
  Scenario: Handle large datasets in trend analysis
    Given I have extensive historical data for analysis
    When I load trend analysis charts
    Then the charts should render efficiently using Chart.js
    And the virtualized data grid should handle large datasets smoothly
    And interactive features should remain responsive

  @integration
  Scenario: Use trend analysis for forecasting
    Given I have identified trends and patterns
    When I want to apply insights to forecast building
    Then the trend analysis should provide input for forecast models
    And I should be able to use patterns to improve forecast accuracy
    And seasonal adjustments should be available for forecasting

  @analytics @patterns
  Scenario: Seasonal pattern detection in trend data
    Given загружены данные за последний год
    When система выполняет анализ сезонности
    Then обнаруживаются недельные и месячные циклы
    And пользователю показывается сила сезонных паттернов

  @analytics @patterns
  Scenario: Trend detection for long-term forecasting
    Given имеется история звонков за "24 месяца"
    When система анализирует общий тренд данных
    Then определяется направление роста или снижения
    And выводится процент изменения по месяцам

  @analytics @patterns
  Scenario: Cyclical pattern identification
    Given данные имеют повторяющиеся пики и провалы
    When запускается модуль распознавания циклов
    Then система фиксирует периодичность колебаний
    And отображает уровень доверия к найденному циклу

  @analytics @anomaly
  Scenario: Anomaly detection with statistical thresholds
    Given построены графики трендов
    When включен режим обнаружения аномалий
    Then система выделяет точки со значительным отклонением
    And каждая аномалия сопровождается уровнем серьезности

  @analytics @integration
  Scenario: Pattern-based forecast adjustments
    Given выявлены устойчивые паттерны спроса
    When я применяю паттерны для корректировки прогноза
    Then новая версия прогноза учитывает обнаруженные циклы
    And точность прогнозирования возрастает

  @analytics @patterns
  Scenario: Automated pattern classification
    Given загружены разнотипные временные ряды
    When система выполняет классификацию паттернов
    Then каждому ряду присваивается тип "seasonal, cyclical или trending"
    And результаты доступны для дальнейшего анализа

  @analytics @ui
  Scenario: Chart export from trend analysis
    Given открыт график сезонности
    When пользователь нажимает кнопку экспорта
    Then изображение сохраняется как PNG файл

  @analytics @ui
  Scenario: Responsive trend charts
    Given я просматриваю анализ трендов на планшете
    Then все графики адаптируются под размер экрана
    And элементы управления остаются читаемыми

  @analytics @ui
  Scenario: Real-time trend updates
    Given включено автоматическое обновление данных
    When поступают новые значения нагрузки
    Then графики обновляются без перезагрузки страницы

  @analytics @ui
  Scenario: Interactive zoom and pan in trend charts
    Given открыт детальный график тренда
    When пользователь масштабирует график
    Then можно прокручивать временной диапазон без задержек
