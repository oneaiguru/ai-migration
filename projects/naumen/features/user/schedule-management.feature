# features/user/schedule-management.feature
Feature: Personal Schedule Management
  As an employee
  I want to interact with my schedule on mobile and desktop
  So that I can manage shifts conveniently

  Background:
    Given I am logged into the workforce management system
    And I have employee privileges
    And I am on my schedule page

  @mobile @responsive
  Scenario: Touch gestures work properly on tablet schedule grid
    Given открыто расписание на планшете
    When пользователь касается смены и перетаскивает её
    Then поддерживается multi-touch жесты
    And drag-preview адаптирован для touch экрана
    And haptic feedback срабатывает при успешном drop

  @mobile @responsive
  Scenario: Responsive grid adapts to phone screen
    Given я открываю расписание на смартфоне
    Then количество колонок уменьшается в мобильном режиме
    And кнопки увеличиваются для удобного касания

  @mobile
  Scenario: Orientation change preserves context
    Given расписание открыто в портретной ориентации
    When я поворачиваю устройство в альбомный режим
    Then отображается та же дата и выбранная смена
    And элементы интерфейса перераспределяются без перезагрузки

  @mobile
  Scenario: Mobile navigation menu collapses automatically
    Given я нахожусь на странице расписания
    When открываю боковое меню
    Then при выборе раздела меню закрывается
    And основное содержимое снова занимает весь экран

  @performance @realtime
  Scenario: Schedule updates batch on slow connection
    Given у меня слабое интернет соединение
    When приходит серия из "50" обновлений смен
    Then интерфейс применяет их пакетно
    And пользовательский ввод остается плавным

  @performance @loading
  Scenario: Progressive schedule loading with pagination
    Given мое расписание содержит записи за "12 месяцев"
    When я пролистываю к предыдущим месяцам
    Then данные подгружаются страницами по "30 дней"
    And индикатор загрузки показывает прогресс
