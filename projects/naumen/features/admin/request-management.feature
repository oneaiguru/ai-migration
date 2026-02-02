# features/admin/request-management.feature
Feature: Schedule Request Management
  As a workforce manager
  I want to manage schedule change requests
  So that I can approve or reject employee schedule modifications

  Background:
    Given I am logged into the system
    And I am on the schedule requests page

  Scenario: View current requests by default
    When the page loads
    Then I should see the "Актуальные заявки" filter selected by default
    And I should see a list of current schedule requests
    And requests should show employee names, dates, and status

  Scenario: Filter requests by date period
    Given I am viewing the requests page
    When I select "Заявки за период" filter option
    Then I should see date range picker fields become enabled
    And I should be able to select start and end dates
    When I select a date range
    Then I should see only requests within that period

  Scenario: Filter requests by status
    Given I am viewing the requests page
    When I check the "на рассмотрении" status filter
    Then I should see only requests with "under review" status
    When I check the "одобренные" status filter
    Then I should see only approved requests
    When I check the "отклонённые" status filter
    Then I should see only rejected requests

  Scenario: View request details
    Given I have schedule requests displayed
    When I click on a request row
    Then I should see detailed request information including:
      | Field | Content |
      | Employee Name | Full name of requesting employee |
      | Activity Request | Type of schedule change requested |
      | Submission Date | When the request was submitted |
      | Start Time | Requested start time |
      | End Time | Requested end time |
      | Comments | Employee's comment on the request |
      | Manager Comments | Manager's feedback if any |

  Scenario: Select multiple requests
    When I click the checkbox in the header row
    Then all visible requests should be selected
    And the bulk action buttons should become enabled

  Scenario: Bulk approve requests
    Given I have selected multiple requests
    And the selected requests are in "under review" status
    When I click the "Одобрить выбранные" button
    Then I should see a confirmation dialog
    When I confirm the bulk approval
    Then all selected requests should be marked as approved
    And I should see a success notification
    And the requests should be updated in the list

  Scenario: Bulk reject requests
    Given I have selected multiple requests
    And the selected requests are in "under review" status
    When I click the "Отклонить выбранные" button
    Then I should see a confirmation dialog
    When I confirm the bulk rejection
    Then all selected requests should be marked as rejected
    And I should see a success notification
    And the requests should be updated in the list

  Scenario: Export request report
    Given there are requests displayed in the list
    When I click the "Выгрузить отчет по заявкам" button
    Then a report file should be generated
    And the file should download to my device
    And the report should contain all visible request data

  Scenario: View request in review status
    Given there is a request with "under review" status
    When I view the request in the list
    Then I should see a gray process icon
    And the status should display as "на рассмотрении"

  Scenario: View approved request
    Given there is a request with "approved" status
    When I view the request in the list
    Then I should see a green check icon
    And the status should display as "одобрена"

  Scenario: View rejected request
    Given there is a request with "rejected" status
    When I view the request in the list
    Then I should see a red denied icon
    And the status should display as "отклонено"
  @bulk @workflow
  Scenario: Bulk approval of requests with conditional modifications
    Given админ выбрал "25 заявок на изменение графика"
    And заявки имеют статус "ожидает утверждения"
    When админ нажимает "Массовое утверждение"
    And указывает условие "только заявки до 3 дней"
    Then система фильтрует подходящие заявки
    And отображает предварительный результат "18 заявок"
    And выполняется массовое утверждение с уведомлениями

  @bulk
  Scenario: Bulk rejection with mandatory reason
    Given I have selected multiple requests
    When I click "Массовое отклонение"
    And I enter rejection reason "недостаточно смен"
    Then all selected requests should be marked as rejected
    And employees should receive notification

  Scenario: Multi-stage approval workflow
    Given a request is submitted for schedule change
    When the supervisor approves the request
    And the HR manager confirms the approval
    Then the request status should change to "одобрена"
    And audit trail should record both approvals

  Scenario: Request priority escalation system
    Given a request is nearing its start date
    When the system detects less than 2 days remaining
    Then the priority should escalate to "Высокий"
    And managers should be alerted to review immediately

  Scenario: Conditional approval requiring schedule adjustment
    Given I review a schedule change request
    When I approve with condition "сдвинуть начало на час позже"
    Then the employee should be prompted to accept the modification
    And the request status remains pending until confirmed

  Scenario: Delegate request to another manager
    Given I am viewing a pending request
    When I choose to delegate it to "Старший менеджер"
    Then that manager should receive the request in their queue
    And the delegation should be logged in history

  @analytics
  Scenario: Analyze request trends over time
    Given I open the request analytics dashboard
    When I view statistics by month
    Then I should see graphs of submission counts and approval rates
    And I should identify peak periods of activity

  Scenario: Multi-column sorting of requests
    Given I have a list of requests
    When I sort by "Статус" then by "Приоритет"
    Then the table should order requests accordingly

  Scenario: Advanced filtering with operators
    Given I open расширенные фильтры
    When I set condition "Приоритет >= Средний" and "Статус != отклонено"
    Then only matching requests should remain in the list

  Scenario: Column visibility and reordering
    Given I customize the request table columns
    When I hide the "Описание" column
    And move "Приоритет" before "Дата подачи"
    Then the table layout should update to my preference

  Scenario: Cell-level editing with validation
    Given I edit a request note inline
    When I enter text over 500 символов
    Then the system should display a validation error
    And the change should not be saved

  Scenario: Row grouping and aggregation by department
    Given I group requests by "Отдел"
    Then the table should show aggregated counts per group
    And I should be able to collapse or expand each department

  @performance
  Scenario: Virtual scrolling with 500+ requests
    Given the system contains over 500 pending requests
    When I scroll through the list
    Then rows should render smoothly without lag

  Scenario: Request details modal with attachments and history
    Given I open a request in the modal dialog
    Then I should see tabs "Детали", "История", "Файлы"
    And I can upload документы for preview
    And comment threads should track manager notes
    And related requests should be linked for reference

  @export
  Scenario: Bulk export selected requests as ZIP archive
    Given I have selected multiple requests
    When I choose "Экспорт ZIP"
    Then the system generates a ZIP file with request reports
    And the download should start automatically

  @realtime
  Scenario: Notify about approved request
    Given запрос сотрудника был одобрен менеджером
    When статус изменяется на "одобрена"
    Then пользователи получают уведомление о принятии заявки

  @realtime
  Scenario: Notify about rejected request
    Given запрос сотрудника был отклонён менеджером
    When статус изменяется на "отклонено"
    Then пользователи получают уведомление об отказе

  @realtime @integration
  Scenario: Bulk request update sends WebSocket message
    Given я выбрал несколько заявок для массового утверждения
    When подтверждаю операцию
    Then сервер отправляет сообщение "requests:updated" для всех клиентов
    And списки заявок обновляются без перезагрузки
