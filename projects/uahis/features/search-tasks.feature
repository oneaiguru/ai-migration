Feature: Search Tasks
  As a Things user
  I want to search for tasks by title and notes
  So I can quickly find specific tasks

  Background:
    Given Things TUI is running with real data

  Scenario: Search opens with slash key
    When I press '/'
    Then search dialog appears
    And input field is focused

  Scenario: Search finds tasks by title
    When I press '/'
    And I type "python"
    Then search results show tasks containing "python"

  Scenario: Search finds tasks by notes
    When I press '/'
    And I type "meeting"
    Then search results show tasks with notes containing "meeting"

  Scenario: Search is case-insensitive
    When I press '/'
    And I type "PYTHON"
    Then results match "python" (case-insensitive)

  Scenario: Cancel search with Escape
    When I press '/'
    And I press Escape
    Then search dialog closes
    And I'm back at previous list

  Scenario: Search results in dedicated list
    When I press '/'
    And I type "python"
    And I press Enter
    Then current list changes to "Search Results"
    And status bar shows search query

  Scenario: Empty search returns no results
    When I press '/'
    And I type "nonexistent_xyz_123"
    Then "No tasks" message appears
