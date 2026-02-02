# features/admin/employee-management.feature
Feature: Employee Management
  As a workforce manager
  I want to manage employee information and profiles
  So that I can maintain accurate workforce data with photos and detailed information

  Background:
    Given I am logged into the workforce management system
    And I have manager privileges
    And I am on the employees page
    And I have access to contact center "Контакт-центр 1010"

  Scenario: View employee list with photos
    Given there are employees in the system
    When I access the employees section
    Then I should see a grid of all employees with profile photos
    And each employee should display basic information
    And I should see employee photos loaded from the file system
    And the employee list should be virtualized for performance

  Scenario: Add new employee with profile
    Given I am on the employees page
    When I click the "Add Employee" button
    And I fill in the employee details form:
      | Field | Value |
      | First Name | Иван |
      | Last Name | Иванов |
      | Employee ID | EMP001 |
      | Department | Контакт-центр 1010 |
      | Position | Оператор |
      | Start Date | 2024-01-15 |
      | Skills | Входящая линия_1 |
    And I upload a profile photo
    And I click "Save"
    Then the new employee should be added to the system
    And I should see a success confirmation message
    And the employee photo should be stored and displayed

  Scenario: Edit employee information
    Given there is an employee "Иван Иванов" in the system
    When I click on the employee "Иван Иванов"
    And I click the "Edit" button
    And I update the employee's position to "Старший оператор"
    And I modify their skills to include additional queues
    And I click "Save"
    Then the employee's information should be updated
    And I should see a success confirmation message

  Scenario: View employee profile with photo gallery
    Given there is an employee with multiple photos in the system
    When I click on the employee profile
    Then I should see their detailed profile information
    And I should see their main profile photo
    And I should be able to view additional photos in a gallery
    And I should see employee work history and assignments

  Scenario: Search employees by various criteria
    Given there are multiple employees in the system
    When I use the employee search functionality
    And I search by name "Иванов"
    Then I should see only employees matching "Иванов"
    When I search by skills "Входящая линия_1"
    Then I should see only employees with that skill
    When I search by department
    Then I should see department-filtered results

  Scenario: Manage employee skills and qualifications
    Given I am viewing an employee profile
    When I access the skills management section
    And I add new skills like "Техническая поддержка"
    And I set skill proficiency levels
    And I add certifications and training records
    Then the employee's skill profile should be updated
    And the skills should be available for schedule assignment

  Scenario: Track employee work metrics
    Given I am viewing an employee's profile
    When I access their performance metrics
    Then I should see their work statistics including:
      | Metric | Description |
      | Attendance Rate | Percentage of scheduled shifts attended |
      | Punctuality Score | On-time arrival performance |
      | Overtime Hours | Extra hours worked |
      | Schedule Adherence | Compliance with assigned schedule |

  Scenario: Manage employee organizational hierarchy
    Given I have employees with different roles
    When I set up reporting relationships
    And I assign supervisors to agents
    And I define team structures
    Then the organizational hierarchy should be reflected in the system
    And supervisors should have access to their team member's information

  Scenario: Handle employee photos and media
    Given I am managing employee profiles
    When I upload employee photos
    Then the photos should be stored securely
    And photos should be resized appropriately for display
    And I should be able to update or remove photos
    And photo file names should follow the UUID format pattern

  Scenario: Export employee data
    Given I have employees displayed in the list
    When I select employees for export
    And I choose export format (Excel, CSV, PDF)
    Then I should be able to download employee data
    And the export should include all relevant employee information
    And photos should be optionally included in the export

  Scenario: Bulk employee operations
    Given I have multiple employees selected
    When I perform bulk operations like:
      | Operation | Description |
      | Skills Assignment | Add skills to multiple employees |
      | Department Transfer | Move employees between departments |
      | Status Update | Change employment status |
      | Schedule Template | Apply schedule templates |
    Then the bulk operation should be applied to all selected employees
    And I should see confirmation of successful operations

  @performance
  Scenario: Handle large employee database with photos
    Given I have 500+ employees with profile photos
    When I load the employee management page
    Then the employee grid should load efficiently using virtualization
    And photos should be lazy-loaded as needed
    And search and filtering should remain responsive
    And the interface should handle the large dataset smoothly

  @performance @loading
  Scenario: Progressive employee photo loading prevents blocking
    Given список сотрудников содержит более "1000 фотографий"
    When я быстро прокручиваю страницу вниз
    Then фотографии догружаются по мере появления в области видимости
    And скорость прокрутки не замедляется

  @performance @virtualization
  Scenario: Virtual list recycling releases photo memory
    Given открыта страница сотрудников со списком 1000 элементов
    When я возвращаюсь к верхней части списка
    Then ранее отрисованные фотографии освобождают память
    And общий расход памяти не превышает "120MB"

  @performance
  Scenario: Cached images accelerate second visit
    Given фотографии сотрудников были загружены ранее
    When я повторно открываю страницу сотрудников
    Then изображения отображаются из кеша без задержки
    And сетевые запросы к фотографиям отсутствуют

  Scenario: Change employee status from active to vacation
    Given employee "EMP001" is currently active
    When I initiate status change to "В отпуске" with reason "Ежегодный отпуск"
    Then the employee status becomes "vacation"
    And the change is recorded with effective date

  Scenario: Reactivate inactive employee with approval
    Given employee "EMP045" has status "inactive"
    When I change status to "active" and specify reason "Возврат из длительного отсутствия"
    And менеджер подтверждает изменение
    Then статус сотрудника обновляется на "active"
    And система фиксирует одобренное изменение

  Scenario: Perform bulk status update with reason tracking
    Given I select employees EMP010, EMP011 and EMP012
    When I set their status to "inactive" with reason "Сезонная приостановка"
    Then каждый выбранный сотрудник получает новый статус
    And в журнал изменений отображается указанная причина

  @notification
  Scenario: Notify employee about status change
    Given статус сотрудника "EMP100" изменён на "vacation"
    When изменение сохраняется
    Then система отправляет уведомление данному сотруднику
    And запись появляется в истории уведомлений

  Scenario: View historical status audit trail
    Given я нахожусь в профиле сотрудника "EMP050"
    When открываю раздел "История статусов"
    Then вижу все изменения статуса с указанием дат и причин
    And могу экспортировать историю в PDF
