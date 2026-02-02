# features/admin/shift-management.feature
Feature: Shift Management
  As a workforce manager
  I want to create and manage shift templates
  So that I can efficiently assign standardized work schedules

  Background:
    Given I am logged into the system
    And I am in the Schedule section
    And I am on the "Смены" (Shifts) page
    And I have access to contact center "Контакт-центр 1010"

  Scenario: View existing shift templates
    When I load the shifts page
    Then I should see a list of existing shift templates including:
      | Shift Name | Time Range |
      | Смена 1 | 05/11 |
      | Смена 10 | 10/17 |
      | Смена 15 | 11:30/20:30 |
      | Смена 23 | 15/00 |
    And each shift should be displayed in a virtualized list
    And shifts should show their time patterns

  Scenario: Search for specific shifts
    Given I have multiple shift templates in the system
    When I enter "Смена 10" in the search field "Поиск по сменам"
    Then I should see only shifts matching "Смена 10"
    And the search results should be filtered in real-time

  Scenario: Create a new shift template
    When I click the "+" (add) button
    Then I should see a new shift form
    And I should be able to enter a shift name
    And I should see the visual schedule editor
    And I should see time configuration options

  Scenario: Configure shift time settings
    Given I am creating or editing a shift
    When I set the start time interval from "00:00" to "08:00"
    And I set the time step to "60" minutes
    And I select the period as "24 часа"
    Then the visual timeline should update to show these settings
    And the hourly grid should display from 01:00 to 23:00

  Scenario: Add work activities to shift
    Given I am editing a shift template
    When I drag to create an activity on the timeline from 10:00 to 11:00
    Then I should see a "В работе" (At work) activity block
    And the activity should be color-coded (green for work)
    When I add a break from 11:00 to 11:20
    Then I should see a "Перерыв" (Break) activity block
    And the break should be color-coded differently (brown)

  Scenario: Edit shift name
    Given I have selected shift "Смена 10 (10/17)"
    When I change the shift name in the text field
    And I click the save button (disk icon)
    Then the shift should be updated with the new name
    And I should see a confirmation that the shift was saved

  Scenario: Save shift template
    Given I have configured a shift with activities
    When I click the save button
    Then the shift template should be saved to the system
    And it should appear in the shifts list
    And I should be able to use it for scheduling

  Scenario: Delete shift template
    Given I have selected a shift template
    When I click the delete button (trash icon)
    Then I should see a confirmation dialog "Вы уверены в удалении?"
    When I click "Подтвердить" 
    Then the shift should be removed from the system
    When I click "Отмена"
    Then the shift should remain unchanged

  Scenario: Copy shift template
    Given I have selected an existing shift template
    When I click the copy button (document icon)
    Then a duplicate shift should be created
    And I should be able to modify the copy independently
    And the original shift should remain unchanged

  Scenario: Move shift to another group
    Given I have selected a shift template
    When I click the move button (list icon)
    Then I should be able to transfer the shift to another organizational unit
    And the shift should be available in the target group

  Scenario: Filter shifts by organizational unit
    Given I am on the shift management page
    When I open the "Точка оргструктуры" dropdown
    And I select "Контакт-центр 1010"
    Then the shift list should only show templates for "Контакт-центр 1010"
    And I should be able to change to another unit if needed

  Scenario: Visual timeline editor interaction
    Given I am editing a shift with the visual editor
    When I click and drag on the timeline
    Then I should be able to create new activity blocks
    When I drag an existing activity block
    Then I should be able to resize or move the activity
    When I right-click on an activity
    Then I should see context menu options for that activity

  Scenario: Work with 48-hour period shifts
    Given I am creating a shift template
    When I select "48 часов" period option
    Then the timeline should extend to show 48 hours
    And I should be able to create activities spanning multiple days
    And the hourly grid should accommodate the extended period

  Scenario: Generate shift variants
    Given I have configured basic shift parameters
    When I click the "Сгенерировать варианты" (Generate variants) button
    Then the system should create multiple shift options
    And I should see different work schedule combinations
    And I should be able to select the most suitable variant

  @performance
  Scenario: Handle large number of shifts
    Given I have 40+ shift templates in the system
    When I scroll through the shift list
    Then the virtualized list should load smoothly
    And shift selection should be responsive
    And the interface should remain stable during interactions