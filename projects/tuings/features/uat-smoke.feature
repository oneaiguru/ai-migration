@uat @smoke
Feature: UAT smoke tests for Things TUI
  As a human-like UAT agent
  I want to exercise the main flows end-to-end
  So that I can quickly see if the TUI is usable

  Background:
    Given Things TUI is running

  Scenario: UAT01 – launch screen shows tasks and status bar
    Then I see a list of tasks in the main panel
    And one task is selected
    And the status bar shows list name

  Scenario: UAT02 – basic navigation with j/k keys
    When I press "j"
    Then the selection moves down one task
    When I press "j"
    Then the selection moves down one task
    When I press "k"
    Then the selection moves up one task

  Scenario: UAT03 – open task and see details
    When I open the selected task
    Then the detail view is visible
    And the detail view shows the selected task

  Scenario: UAT04 – quit the app cleanly
    When I quit the TUI
    Then the TUI exits cleanly
