# features/user/shift-marketplace.feature
Feature: Shift Marketplace
  As an employee
  I want to exchange shifts with colleagues
  So that we can manage personal schedules flexibly

  Background:
    Given I am logged into the workforce management system
    And I have employee privileges
    And I am viewing my personal dashboard
    And colleagues have posted shift offers in the marketplace

  @marketplace @realtime
  Scenario: Browse available shifts with default view
    When I open the "Обмен сменами" page
    Then I should see a list of active shift offers
    And each offer displays date, time and employee name
    And urgent offers are highlighted

  @marketplace
  Scenario: Filter shifts by date and team
    Given the shift marketplace shows multiple offers
    When I apply filters for "завтра" and team "Поддержка клиентов"
    Then only matching shift offers should be displayed
    And the filter summary should show my selections

  @marketplace
  Scenario: Sort shifts by popularity
    Given I am viewing available shift offers
    When I sort offers by "Популярные"
    Then offers with the most interested colleagues appear first

  @marketplace @self-service
  Scenario: Request a shift from marketplace
    Given I see a suitable shift offer
    When I click "Запросить смену"
    Then my interest is sent to the shift owner
    And the interest count for that offer increases

  @marketplace @chat
  Scenario: Message shift owner from offer card
    Given I want more details about a shift
    When I open the chat with the offer owner
    Then a chat window opens for real-time messaging
    And I can ask clarifying questions

  @marketplace @realtime
  Scenario: Receive new offers in real time
    Given the marketplace is open
    When another employee posts a new offer
    Then it should appear automatically without page refresh

  @marketplace @approval
  Scenario: Owner approves exchange request
    Given I have requested a shift from a colleague
    When the colleague approves my request
    Then I receive a notification of the approved exchange
    And the offer status changes to "completed"


  @visual @loading @skeleton
  Scenario: Show skeletons while marketplace loads
    Given я открываю раздел обмена сменами
    When данные предложений еще загружаются
    Then отображаются скелетоны карточек
    And кнопки недоступны до завершения загрузки

  @visual @feedback
  Scenario: Hover preview of shift details
    Given список предложений открыт
    When я навожу курсор на карточку смены
    Then появляется всплывающая подсказка с деталями смены
    And кнопка запроса становится заметнее

  @interaction @ux
  Scenario: Drag offer card to personal calendar
    Given я вижу подходящую смену в списке
    When я перетаскиваю карточку на свой календарь
    Then календарь подсвечивает допустимые даты
    And после отпускания создается запрос на обмен

  @visual @animation
  Scenario: Smooth animation on offer status change
    Given моя заявка на обмен одобрена
    When статус предложения меняется на "completed"
    Then карточка плавно исчезает из списка
    And отображается всплывающее уведомление об успешном обмене
