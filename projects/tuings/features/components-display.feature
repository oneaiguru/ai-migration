Feature: Display and interaction of core TUI components
  As a Things user in the terminal
  I want the main view to show tasks, selection, and a status bar
  So that I can navigate and inspect tasks confidently

  Background:
    Given Things TUI is running with real data
    And at least one task exists in current list

  Scenario: Initial layout shows tasks, selection, and status bar
    Then I see at least one visible task
    And I see a selected task
    And I see a status bar
    And the detail view is not visible

<<<<<<< HEAD
=======
  @components @skip
>>>>>>> 361dc27 (feat: add components-display and path-utils feature placeholders)
  Scenario: Moving the selection updates the selected task
    Given I note the currently selected task
    When I press Down arrow
    Then the selected task is different from the noted task
    And the status bar still shows the current list name

  Scenario: Moving selection backwards works as well
    Given I note the currently selected task
    When I press Up arrow
    Then the selected task is different from the noted task

  Scenario: Opening the detail view for the selected task
    Given the detail view is not visible
    When I press Enter
    Then the detail view is visible

  Scenario: Closing the detail view
    Given the detail view is visible
    When I press Escape
    Then the detail view is not visible

  Scenario: Status bar shows list name and task count
    Then the status bar contains the current list name
    And the status bar shows task count
