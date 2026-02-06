# features/user/request-workflows.feature
Feature: Advanced Request Workflows
  As an employee
  I want to manage complex requests
  So that I can adjust my schedule when needed

  Background:
    Given I am logged into the workforce management system
    And I have employee privileges
    And I am on the requests page

  @self-service
  Scenario: Submit multi-step time off request
    When I create a new vacation request
    And I complete all steps of the wizard
    Then the request is submitted for approval
    And I see a confirmation message

  @self-service
  Scenario: Save request as draft
    When I fill in part of a shift change request
    And I choose "Сохранить как черновик"
    Then the request appears in my draft list

  @approval @notification
  Scenario: Track request status updates
    Given I have submitted a time off request
    When my manager approves it
    Then I receive a notification of approval
    And the request status shows "Одобрено"

  @self-service
  Scenario: Modify pending request
    Given my overtime request is awaiting approval
    When I edit the request details
    Then the updated information is saved
    And the approval workflow restarts

  @self-service
  Scenario: Cancel multiple requests
    Given I select several pending requests
    When I choose "Отменить заявки"
    Then all selected requests move to cancelled status

  @analytics
  Scenario: View request history analytics
    When I open my request history report
    Then I see statistics of approvals and rejections
    And charts show monthly request volume


  @error @recovery @offline
  Scenario: Graceful handling of connection loss during request
    Given пользователь заполняет заявку на отпуск
    When пропадает интернет соединение
    Then система сохраняет введенные данные локально
    And отображается индикатор офлайн режима
    And при восстановлении связи предлагает отправить заявку
    And данные не теряются при перезагрузке страницы

  @error @recovery
  Scenario: Auto-retry failed request submission
    Given я отправляю заявку на смену
    And сервер временно недоступен
    Then система показывает уведомление о повторной попытке
    And автоматически повторяет отправку через минуту
    And при успехе отображает сообщение об отправке

  @visual @feedback
  Scenario: Toast notification with action after submission
    Given я успешно отправил заявку
    Then появляется всплывающее уведомление с кнопкой "Открыть"
    When я нажимаю кнопку уведомления
    Then открывается детальный статус моей заявки

  @error @offline
  Scenario: Offline mode for request list
    Given отсутствует подключение к сети
    When я открываю раздел "Мои заявки"
    Then отображаются сохраненные локальные данные
    And показывается индикатор офлайн режима
