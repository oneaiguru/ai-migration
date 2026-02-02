# features/integration/module-federation.feature
Feature: Module Federation Architecture
  As a system administrator
  I want modules to integrate seamlessly
  So that users have unified WFM experience

  Background:
    Given all WFM modules are running on their respective ports
    And I am logged into the integration portal as administrator

  @integration @modules
  Scenario: Load schedule module in iframe container
    Given пользователь авторизован в главном приложении
    When переходит в модуль "Расписание" на порту "3004"
    Then модуль загружается в iframe без ошибок
    And отображается индикатор загрузки
    And навигация синхронизируется с главным приложением

  @integration @error-handling
  Scenario: Handle module loading failure
    Given модуль "Отчеты" на порту "3010" недоступен
    When пользователь пытается открыть модуль
    Then отображается сообщение об ошибке загрузки
    And предлагается повторить попытку
    And пользователь остается в главном приложении

  @integration
  Scenario: Detect port conflict on startup
    Given порт "3002" уже занят другим процессом
    When система запускает модуль "Прогнозы"
    Then отображается предупреждение о конфликте порта
    And модуль не запускается до устранения проблемы

  @integration
  Scenario: Persist navigation state across modules
    Given пользователь находится в разделе "Планирование смен"
    When он открывает модуль "Управление персоналом" в новом iframe
    Then состояние бокового меню сохраняется
    And текущая вкладка выделена в обоих модулях

  @integration
  Scenario: Monitor module health status
    Given модули работают на портах 3002, 3004, 3010 и 3018
    When выполняется проверка состояния модулей
    Then система отображает статус каждого модуля как "online" или "offline"
    And при ошибке предлагается перезапустить модуль

  @integration
  Scenario: Exchange messages between host and module
    Given модуль "Управление персоналом" открыт в iframe
    When хост отправляет сообщение "refresh-data" через postMessage
    Then модуль получает команду и перезагружает данные
    And модуль отвечает сообщением "refresh-complete"

  @integration
  Scenario: Open multiple modules simultaneously
    Given пользователь открыл модули "Расписание" и "Прогнозы" в отдельных вкладках
    When он переключается между вкладками
    Then каждый модуль сохраняет свою внутреннюю навигацию
    And глобальный статус соединения отображается для каждого модуля
