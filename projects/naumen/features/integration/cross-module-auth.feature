# features/integration/cross-module-auth.feature
Feature: Cross-Module Authentication
  As an authenticated user
  I want single sign-on across all WFM modules
  So that I do not need to log in multiple times

  Background:
    Given the user is authenticated in the integration portal
    And valid auth token is stored in local storage

  @integration @authentication
  Scenario: Propagate token to embedded iframe
    When модуль "Прогнозы" загружается в iframe
    Then auth token передается в параметры запроса
    And модуль открывается без дополнительного входа

  @integration @roles
  Scenario: Restrict access to unauthorized module
    Given пользователь имеет роль "manager"
    When он пытается открыть модуль "Прогнозирование нагрузки"
    Then доступ запрещен
    And отображается уведомление о недостаточных правах

  @integration
  Scenario: Share session timeout across modules
    Given сессия пользователя истекает через 5 минут
    When таймер обновления запускается в главном приложении
    Then таймер в iframe модуля синхронизируется
    And оба модуля выходят из системы одновременно

  @integration @error-handling
  Scenario: Handle authentication failure in embedded module
    Given токен пользователя просрочен
    When iframe модуля сообщает об ошибке 401
    Then пользователь перенаправляется на страницу входа
    And все модули закрываются

  @integration
  Scenario: Login from embedded module reuses global session
    Given пользователь не авторизован в главном приложении
    When он открывает iframe модуля и проходит форму входа
    Then главная оболочка получает событие успешной аутентификации
    And пользователь считается вошедшим во всех модулях

  @integration
  Scenario: Synchronize logout across modules
    Given пользователь открыт в нескольких модулях
    When он выходит из системы в одном из модулей
    Then остальные модули закрывают сессию автоматически
