# features/integration/api-client.feature
Feature: Centralized API Client Patterns
  As a developer
  I want consistent API request handling
  So that all modules communicate reliably with the backend

  Background:
    Given API base URL is configured in environment settings
    And axios client is initialized with interceptors

  @api @integration
  Scenario: Attach auth token to each request
    Given пользователь вошел в систему и имеет токен "demo-token"
    When отправляется GET запрос к "/employees"
    Then заголовок Authorization содержит значение "Bearer demo-token"

  @api
  Scenario: Transform response data globally
    Given сервер возвращает поле "data" в ответе
    When клиент получает ответ
    Then данные извлекаются из обертки и передаются вызывающему модулю

  @api @error-handling
  Scenario: Retry request after network error
    Given сеть временно недоступна при выполнении запроса
    When клиент получает сообщение об ошибке сети
    Then выполняется повторная попытка через 3 секунды
    And при успехе данные возвращаются модулю

  @api
  Scenario: Track file upload progress
    Given пользователь загружает файл размером 10MB
    When выполняется POST запрос с multipart/form-data
    Then клиент показывает процент выполнения до 100%
    And по завершении отображается сообщение об успешной загрузке

  @api
  Scenario: Manage API version via prefix
    Given текущая версия API "v1"
    When отправляется запрос на эндпоинт "/v1/reports"
    Then сервер обрабатывает запрос согласно версии

  @api @error-handling
  Scenario: Global handling of unauthorized response
    Given токен пользователя недействителен
    When сервер возвращает статус 401
    Then клиент выполняет выход пользователя
    And происходит перенаправление на страницу входа

  @api
  Scenario: Notify about rate limiting
    Given сервер отвечает кодом 429 и заголовком "retry-after"
    When клиент получает такой ответ
    Then пользователь видит предупреждение об ограничении
    And запрос повторяется после указанного времени
