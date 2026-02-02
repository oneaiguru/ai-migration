# features/admin/forecast-building.feature
Feature: Forecast Building
  As a workforce manager
  I want to build various types of forecasts
  So that I can predict staffing needs

  Background:
    Given I am logged into the workforce management system
    And I have access to contact center data

  Scenario: Building a new forecast
    Given I am on the "Построить прогноз" page
    When I configure forecast parameters
    And I select the forecast period
    And I choose the appropriate skills/queues
    And I click "Построить прогноз"
    Then the system should generate a new forecast
    And I should see the forecast results

  Scenario: Setting forecast exceptions
    Given I am on the "Задать исключения" page
    When I configure exception rules
    And I save the exception settings
    Then the exceptions should be applied to future forecasts

  Scenario: Analyzing forecast trends
    Given I am on the "Анализ трендов" page
    When I select a time period for analysis
    And I choose the metrics to analyze
    Then I should see trend analysis results
    And I should be able to identify patterns and anomalies

  Scenario: Forecast sub-navigation
    Given I am in the "Прогнозы" module
    Then I should see the following sub-navigation options:
      | Построить прогноз |
      | Задать исключения |
      | Анализ трендов |
      | Расчёт абсентеизма |
    And the current active page should be highlighted

  @analytics @accuracy
  Scenario: MAPE calculation for forecast accuracy validation
    Given загружены исторические данные за "12 месяцев"
    And выполнен прогноз с алгоритмом "ARIMA"
    When система рассчитывает MAPE метрику
    Then MAPE должен быть менее "15%"
    And отображается доверительный интервал "95%"
    And показываются детали расчета метрики

  @analytics @accuracy
  Scenario: MAE validation of forecast results
    Given выполнен прогноз с алгоритмом "Линейная регрессия"
    When система рассчитывает MAE показатель
    Then MAE должен быть менее "20"
    And система отображает рекомендации по улучшению точности

  @analytics @accuracy
  Scenario: RMSE computation for forecast evaluation
    Given есть фактические данные за последний месяц
    When выполняется вычисление RMSE
    Then значение RMSE отображается на панели точности
    And пользователь видит границы ошибки

  @analytics @accuracy
  Scenario: R-squared correlation analysis
    Given выбраны предсказанные и фактические значения
    When система вычисляет R-squared коэффициент
    Then коэффициент детерминации должен быть выше "0.8"
    And выводятся сведения о силе корреляции

  @analytics @accuracy
  Scenario: Forecast bias detection and correction
    Given загружены данные прогноза и факта
    When система анализирует смещение прогноза
    Then отображается показатель Bias
    And предлагается автоматическая корректировка смещения

  @analytics @comparison
  Scenario: Multi-algorithm performance comparison
    Given загружены данные с сезонными паттернами
    When выполняется сравнение алгоритмов "ARIMA, Linear Regression, Ensemble"
    Then система показывает метрики точности для каждого алгоритма
    And рекомендует наиболее подходящий алгоритм
    And отображает статистическую значимость различий

  @analytics @validation
  Scenario: Model validation with cross-validation
    Given выполнен прогноз текущими настройками
    When запускается процедура кросс-валидации на "5" фолдах
    Then система отображает метрики для каждой итерации
    And пользователь видит среднее значение MAPE

  @analytics @statistics
  Scenario: Statistical significance testing of algorithms
    Given имеются результаты нескольких алгоритмов
    When выполняется t-тест для сравнения MAPE
    Then выводится значение p-value
    And принимается решение о значимости различий

  @analytics
  Scenario: Algorithm parameter optimization
    Given выбран алгоритм "ARIMA модель"
    When пользователь изменяет параметры модели
    And запускает оптимизацию
    Then система находит параметры с минимальным MAPE
    And сохраняет оптимизированную конфигурацию

  @analytics
  Scenario: Ensemble model creation
    Given доступны результаты нескольких алгоритмов
    When пользователь создает ансамбль моделей
    Then система комбинирует прогнозы в единый результат
    And отображает суммарную метрику точности

  @analytics
  Scenario: Interactive forecast modification
    Given открыт модуль "Корректировки прогноза"
    When аналитик изменяет значения отдельных интервалов
    Then изменения сразу отображаются в таблице прогнозов
    And рассчитываются обновленные показатели нагрузки

  @analytics
  Scenario: Bulk adjustment operations
    Given выбрано несколько интервалов прогноза
    When выполняется массовая корректировка на "10%"
    Then все выбранные интервалы изменяются с учетом операции
    And система проверяет соблюдение допустимых границ

  @analytics
  Scenario: Adjustment history tracking
    Given выполнены изменения прогноза
    When пользователь открывает историю корректировок
    Then отображается список недавних операций
    And можно просмотреть детали каждой корректировки

  @analytics
  Scenario: Undo and redo forecast adjustments
    Given пользователь совершил несколько изменений
    When он нажимает "Отменить"
    Then последняя корректировка удаляется
    And при нажатии "Повторить" изменение возвращается

  @analytics
  Scenario: Constraint validation for adjustments
    Given введена корректировка превышающая допустимое значение
    When система проверяет ограничения
    Then выводится сообщение об ошибке
    And корректировка не применяется

  @analytics
  Scenario: Expert knowledge integration
    Given аналитик добавляет комментарий к прогнозу
    When комментарий сохраняется
    Then система учитывает экспертные замечания при дальнейших расчетах

  @analytics @ui
  Scenario: Time series chart rendering
    Given построен прогноз по выбранному периоду
    When открывается график временного ряда
    Then отображаются линии "Факт" и "Прогноз"
    And показывается доверительный интервал

  @analytics @ui
  Scenario: Multiple dataset overlay on chart
    Given доступны данные требуемых агентов
    When пользователь включает слой "Требуется агентов"
    Then на графике отображаются все серии данных одновременно

  @analytics @ui
  Scenario: Interactive chart controls
    Given открыт график прогноза
    When пользователь масштабирует область колесом мыши
    Then график увеличивается без потери качества
    And можно перемещать отображаемый диапазон

  @analytics @ui
  Scenario: Chart export functionality
    Given на экране отображается график прогноза
    When пользователь нажимает кнопку "Экспорт"
    Then изображение графика сохраняется в файл

  @analytics @ui
  Scenario: Responsive chart behavior
    Given я открываю прогноз на мобильном устройстве
    Then график подстраивается под размер экрана
    And элементы управления остаются доступными

  @analytics @ui
  Scenario: Real-time chart updates
    Given включено автоматическое обновление
    When проходит заданный интервал времени
    Then график обновляется новыми данными без перезагрузки страницы
