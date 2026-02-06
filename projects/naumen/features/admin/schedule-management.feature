# features/admin/schedule-management.feature

Feature: Schedule Grid Management
  As a WFM supervisor
  I want to manage employee schedules in a grid view
  So that I can efficiently assign shifts to 500+ employees

  Background:
    Given I am logged in as a supervisor
    And the "Контакт-центр 1010" contact center is selected
    And I navigate to the schedule management section

  Scenario: View monthly schedule grid
    Given I have 500+ employees in the system
    When I select date range "01.07.2024" to "31.07.2024"
    Then I see the virtualized grid with all employees listed vertically
    And I see dates displayed horizontally for July 2024
    And each cell shows current shift assignment or is empty
    And weekend days (Saturday/Sunday) are highlighted in bold
    And the current day "17.07" is highlighted with context color

  Scenario: Filter employees by skills
    Given I am viewing the schedule grid
    When I click on the skills filter dropdown
    And I select skill "Входящая линия_1"
    Then only employees with the selected skill are displayed
    And the skill filter shows colored indicator for "Входящая линия_1"
    And the total employee count updates accordingly

  Scenario: Search employees by name
    Given I am viewing the schedule grid
    When I enter "Абдуллаева" in the employee search field
    Then only employees matching "Абдуллаева" are shown
    And the search results are highlighted
    And I can click on the dropdown to see suggestions

  Scenario: Select all employees
    Given I am viewing the schedule grid
    When I click the "Все" (All) checkbox in the header
    Then all visible employees are selected
    And individual employee checkboxes are checked
    And bulk actions become available

  Scenario: Navigate between time periods
    Given I am viewing July 2024 schedule
    When I change the start date to "01.08.2024"
    And I change the end date to "31.08.2024"
    And I click the refresh button
    Then the grid updates to show August 2024
    And week numbers are updated accordingly (week 31, 32, etc.)

  Scenario: View forecast and plan charts
    Given I am viewing the schedule grid
    When I look at the chart panel above the grid
    Then I see "Прогноз + план" (Forecast + Plan) mode is active
    And the chart displays forecast data for the selected period
    And chart controls show options for "Отклонения" and "Уровень сервиса (SL)"

  Scenario: Calculate FTE values
    Given I have schedule data loaded
    When I click the "FTE" recalculation button
    Then the system recalculates Full Time Equivalent values
    And FTE data is updated in the grid
    And I can optionally view FTE sum information

  Scenario: Build schedule automatically
    Given I am viewing the schedule grid
    When I click the "Построить" (Build) button
    Then the system generates automatic schedule assignments
    And the grid updates with new shift assignments
    And I see success feedback for the operation

  Scenario: Publish schedule changes
    Given I have made changes to the schedule
    When the publish button shows "Есть неопубликованные изменения"
    And I click the publish button
    Then the schedule changes are published to employees
    And the publish status updates to current state
    And employees can see the new schedule

  Scenario: Import activities from Excel
    Given I am viewing the schedule grid
    When I click the import button
    And I select an Excel file with activity data
    Then the activities are imported into the system
    And the schedule grid updates with imported data

  @performance
  Scenario: Handle large employee datasets
    Given I have 500+ employees in the contact center
    When I open the schedule grid
    Then the virtualized table loads efficiently
    And scrolling through employees is smooth
    And the interface remains responsive during operations

  @realtime @collaboration
  Scenario: Concurrent schedule editing with conflict resolution
    Given пользователь "Админ1" редактирует расписание смены
    And пользователь "Админ2" одновременно открывает ту же смену
    When "Админ1" изменяет время смены на "09:00-17:00"
    And "Админ2" изменяет время той же смены на "10:00-18:00"
    Then система показывает предупреждение о конфликте
    And предлагает варианты разрешения конфликта

  @realtime
  Scenario: Live cursor tracking during drag and drop
    Given два администратора редактируют расписание одновременно
    When один администратор перетаскивает смену на новую ячейку
    Then второй администратор видит его курсор в реальном времени
    And ячейка подсвечивается пока действие не завершено

  @realtime
  Scenario: Editing indicator shown to other users
    Given администратор начал изменять ячейку расписания
    When другой пользователь открывает тот же график
    Then он видит значок о том, что ячейка редактируется

  @realtime
  Scenario: Auto-save detects manual save conflict
    Given пользователь сохраняет изменения автоматически
    And другой пользователь пытается сохранить ту же ячейку вручную
    Then система сообщает о несохранённых изменениях
    And предлагает перезагрузить данные

  @realtime
  Scenario: Reconnect after temporary network loss
    Given веб-сокет соединение оборвалось во время редактирования
    When связь восстанавливается
    Then система автоматически переподключается
    And непрерывность редактирования сохраняется

  @realtime
  Scenario: Finish editing session clears indicators
    Given пользователь завершает редактирование ячейки
    When он покидает страницу расписания
    Then индикаторы совместного редактирования исчезают для остальных

  @realtime
  Scenario: Real-time schedule update after drag and drop
    Given пользователь перемещает смену на другой день
    When операция подтверждена
    Then другие пользователи сразу видят новое расположение смены

  @realtime
  Scenario: Live forecast overlay update from WebSocket
    Given открыта панель "Прогноз + план"
    When сервер отправляет новые прогнозные данные
    Then график обновляется без перезагрузки страницы

  @realtime @collaboration
  Scenario: Collaborative pattern application across users
    Given два администратора выделили разные группы сотрудников
    When первый применяет шаблон смен к своей группе
    Then второй видит изменение мгновенно
    And покрытие обновляется у обоих пользователей

  @realtime @collaboration
  Scenario: Multi-user bulk operations coordination
    Given несколько администраторов выбрали набор смен
    When один из них выполняет массовое изменение
    Then остальные получают уведомление о завершении операции
    And их таблица обновляется автоматически

  @performance @virtualization @benchmark
  Scenario: Virtual scrolling maintains 60fps with 1000+ employees
    Given открыто расписание с "1000 сотрудниками"
    And каждый сотрудник имеет данные за "3 месяца"
    When выполняется быстрая прокрутка вертикально
    Then частота кадров остается выше "55 FPS"
    And время отклика интерфейса менее "16ms"
    And память не увеличивается более чем на "50MB"

  @performance @loading
  Scenario: Lazy load employee groups using intersection observer
    Given я нахожусь на расписании с 1000+ сотрудниками
    When прокручиваю список до конца видимой области
    Then следующая партия сотрудников загружается лениво
    And сетка остается отзывчивой без скачков прокрутки

  @performance
  Scenario: Schedule grid cleans up after unmount
    Given я открываю и закрываю страницу расписания
    When компонент расписания размонтируется
    Then все обработчики событий удаляются
    And использование памяти возвращается к начальному уровню

  @performance
  Scenario: Bundle size remains under 250KB after build
    Given разработчик собирает модуль расписания
    When выполняется анализ размера бандла
    Then итоговый размер JavaScript не превышает "250KB"
    And отчет по оптимизации сохраняется

  @realtime @performance
  Scenario: WebSocket throughput handles 200 updates per minute
    Given открыто расписание с активным веб-сокет соединением
    When система получает 200 обновлений за минуту
    Then пакетные обновления применяются без задержек
    And интерфейс не теряет плавность

  @realtime @performance
  Scenario: Long editing session does not leak memory
    Given администратор редактирует расписание более "2 часов"
    When веб-сокет соединение постоянно обновляет данные
    Then использование памяти стабильно
    And производительность интерфейса не ухудшается

  @performance @virtualization
  Scenario: Efficient memory usage with large datasets
    Given открыто расписание с "1000 сотрудниками"
    When система загружает данные за "месяц"
    Then используется виртуализация для отображения
    And память не превышает "300MB"
    And прокрутка остается плавной

  @virtualization
  Scenario: Lazy load employee rows during scroll
    Given я нахожусь в начале списка сотрудников
    When прокручиваю таблицу вниз
    Then новые строки подгружаются по мере прокрутки
    And индикатор загрузки отображается кратковременно

  @virtualization
  Scenario: Grid cell rendering optimization
    Given я открываю расписание с несколькими видами смен
    When я быстро перемещаюсь между днями
    Then ячейки перестраиваются без мерцаний
    And количество перерисовок минимально

  @mobile
  Scenario: Responsive schedule grid on mobile devices
    Given я использую мобильный браузер
    When открываю страницу расписания
    Then таблица адаптируется под ширину экрана
    And элементы управления остаются доступными
