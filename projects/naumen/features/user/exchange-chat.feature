# features/user/exchange-chat.feature
Feature: Real-Time Shift Exchange Chat
  As an employee
  I want to chat with colleagues during shift exchanges
  So that we can negotiate details quickly

  Background:
    Given I am logged into the workforce management system
    And I have employee privileges
    And I have initiated a shift exchange with a colleague

  @chat @realtime
  Scenario: Open chat from exchange request
    When I open the chat for the requested shift
    Then a real-time chat window appears
    And previous messages are loaded

  @chat @realtime
  Scenario: Send text message in chat
    Given the exchange chat is open
    When I type a message and press send
    Then my message is delivered instantly
    And the colleague receives a notification

  @chat
  Scenario: Share proposed shift details
    Given I want to formalize the exchange
    When I send a shift proposal in chat
    Then the proposal card shows date, time and location
    And the colleague can accept or decline it

  @chat @realtime
  Scenario: Typing indicator
    When the colleague is typing a reply
    Then I see a typing indicator in the chat window

  @chat @notification
  Scenario: Chat history available after closing
    Given I exchanged messages with a colleague
    When I reopen the exchange chat later
    Then previous conversation history is displayed
    And unread messages are marked accordingly


  @interaction @ux
  Scenario: Send predefined quick message
    Given чат обмена открыт
    When я выбираю шаблон сообщения "Согласен на обмен"
    Then текст автоматически вставляется в поле ввода
    And после нажатия Enter сообщение отправляется
    And собеседник видит его мгновенно

  @interaction @ux
  Scenario: Auto-scroll to newest message
    Given чат содержит много сообщений
    When приходит новое сообщение от коллеги
    Then список прокручивается к последнему сообщению автоматически

  @interaction @ux
  Scenario: Focus returns to message input after sending
    Given я ввожу текст сообщения
    When нажимаю Enter для отправки
    Then сообщение отправляется
    And курсор остается в поле ввода

  @interaction @ux @mobile
  Scenario: Swipe gesture closes chat on mobile
    Given чат обмена открыт на мобильном устройстве
    When я делаю жест свайпа вниз
    Then окно чата закрывается
    And список предложений снова виден

  @interaction @context
  Scenario: Quote multiple messages using context menu
    Given я выделяю несколько сообщений в чате
    When вызываю контекстное меню и выбираю "Цитировать"
    Then выбранные сообщения добавляются в поле ввода с цитатами
