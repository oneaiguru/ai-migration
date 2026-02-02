# features/user/attendance-calendar.feature
Feature: Attendance Calendar View
  As an employee
  I want to review my attendance calendar
  So that I can monitor absences and overtime

  Background:
    Given I am logged into the workforce management system
    And I have employee privileges
    And I am viewing my personal dashboard

  Scenario: View monthly attendance calendar
    When I open the attendance calendar for the current month
    Then each day shows a color-coded status
    And weekends are shaded differently

  Scenario: Add time-off request from calendar
    Given I click on a future date
    When I choose "Запросить отгул"
    Then the request form opens with the selected date

  Scenario: Switch to weekly view
    When I toggle the calendar to weekly mode
    Then only seven days are displayed
    And navigation buttons allow moving to next week

  Scenario: Holiday display in calendar
    When a public holiday occurs this month
    Then it is marked with the label "Праздник"

  @mobile
  Scenario: Calendar responsiveness on mobile
    Given I open the calendar on a mobile device
    Then the day cells adapt to the small screen
    And touch interaction is optimized


  @accessibility @keyboard @a11y
  Scenario: Navigate schedule calendar using only keyboard
    Given открыт календарь расписания
    When пользователь использует только клавиатуру
    Then Tab перемещает фокус между днями календаря
    And Space/Enter активирует выбранный день
    And Arrow keys перемещаются по дням
    And Escape закрывает открытые детали
    And фокус всегда виден визуально

  @interaction @visual @feedback
  Scenario: Drag-and-drop with rich visual feedback
    Given пользователь перетаскивает смену в календаре
    When начинается операция drag
    Then отображается полупрозрачный preview элемента
    And возможные drop зоны подсвечиваются
    And недопустимые зоны визуально блокируются
    And курсор изменяется в зависимости от зоны

  @visual @loading @skeleton
  Scenario: Skeleton screens during calendar loading
    Given календарь загружается
    When данные месяца еще не получены
    Then отображаются skeleton placeholders
    And анимация пульсации показывает процесс загрузки
    And layout не сдвигается при появлении данных

  @accessibility @voice @a11y
  Scenario: Navigate to next month using voice command
    Given активирован голосовой ввод
    When сотрудник говорит "Следующий месяц"
    Then отображается календарь следующего месяца
    And фокус ставится на первое число
