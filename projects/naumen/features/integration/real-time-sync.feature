# features/integration/real-time-sync.feature
Feature: Real-Time Synchronization
  As a collaboration user
  I want modules to stay in sync through WebSocket
  So that updates appear instantly across the system

  Background:
    Given пользователь вошел в систему и WebSocket соединение установлено

  @realtime @integration
  Scenario: Broadcast schedule update to other modules
    Given администратор изменяет расписание сотрудника
    When событие "schedule:updated" отправляется сервером
    Then модуль "Прогнозы" получает обновленные данные
    And отображает уведомление об изменении

  @realtime
  Scenario: Recover connection after network failure
    Given соединение WebSocket прервано
    When клиент выполняет 5 попыток переподключения
    Then после успешного подключения состояние восстанавливается
    And недоставленные события обрабатываются

  @realtime
  Scenario: Deliver cross-module notification
    Given модуль "Отчеты" отправляет уведомление о готовности отчета
    When сообщение типа "notification:new" поступает через WebSocket
    Then пользователь видит уведомление в интеграционном портале
    And iframe модуля получает ту же информацию

  @realtime
  Scenario: Synchronize editing indicators
    Given два администратора редактируют один график
    When модуль отправляет событие "schedule:edit:start"
    Then другие пользователи видят индикатор совместного редактирования
    And при событии "schedule:edit:end" индикатор исчезает

  @realtime
  Scenario: Show connection status indicator
    Given пользователь находится на панели управления
    When WebSocket соединение переходит в состояние "connecting"
    Then в верхней панели отображается жёлтый индикатор
    And при успешном подключении он становится зелёным

  @realtime
  Scenario: Initial handshake on login
    Given пользователь вошел в систему
    When устанавливается WebSocket соединение
    Then клиент отправляет событие "handshake" с идентификатором пользователя
    And сервер подтверждает подключение
