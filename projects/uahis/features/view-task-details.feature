Feature: View Task Details
  As a Things user
  I want to see full task information in a detail view
  So I can read notes and task metadata

  Background:
    Given Things TUI is running with real data
    And at least one task exists in current list

  Scenario: Detail view opens with Enter
    When I select a task
    And I press Enter
    Then detail view opens
    And shows task title

  Scenario: Detail view shows complete information
    When I select task "Buy milk"
    And I press Enter
    Then detail view displays:
      | title  | Buy milk        |
      | status | Active          |
      | list   | Today           |

  Scenario: Detail view shows notes if present
    Given task has notes "Remember to get organic"
    When I select it
    And I press Enter
    Then detail view shows notes section
    And notes text is visible

  Scenario: Detail view shows tags
    Given task has tags "shopping, urgent"
    When I select it
    And I press Enter
    Then detail view shows tags
    And all tags displayed with # prefix

  Scenario: Detail view shows due date
    Given task has due date "Today"
    When I select it
    And I press Enter
    Then detail view shows due date
    And displays formatted date

  Scenario: Close detail view with any key
    When I press Enter on selected task
    And detail view is open
    And I press 'q'
    Then detail view closes
    And I'm back at task list
    And selection preserved

  Scenario: Detail view handles long notes
    Given task has very long notes
    When I press Enter
    Then detail view scrolls
    And all notes visible
