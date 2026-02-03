Feature: Searching and navigating with Quick Find
  As a user
  I want to quickly jump to to dos, projects and tags
  So that Quick Find in the TUI behaves like Quick Find in Things

  Background:
    Given Things TUI is running with real data

  Scenario: Invoke Quick Find search interface
    When I press the key forward slash to open Quick Find
    Then a search input box appears
    And the cursor is in the search field
    And a list of recent or suggested items is shown below

  Scenario: Search by to do title
    When I press the key forward slash to open Quick Find
    And I type "test" in the search field
    Then search results appear showing matching tasks
    And each result displays the task title

  Scenario: Navigate search results
    When I have an active Quick Find search
    And I press Down arrow to move through results
    Then the selection moves to the next result
    And the status bar shows the current selection

  Scenario: Confirm a Quick Find result
    When I have Quick Find open with results
    And I press Enter on a result
    Then the TUI navigates to that task
    And the detail view shows the selected task

  Scenario: Close Quick Find with Escape
    When I have Quick Find open
    And I press Escape
    Then the search interface closes
    And the TUI returns to the previous view

  Scenario: Quick Find search by project name
    When I press the key forward slash to open Quick Find
    And I type a project name
    Then matching projects appear in the results
    And I can confirm to navigate to that project
