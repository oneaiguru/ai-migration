Feature: Filter Tasks by Tags
  As a Things user
  I want to filter tasks by tags
  So I can focus on specific categories

  Background:
    Given Things TUI is running with real data
    And tasks have tags assigned

  Scenario: Tag filter opens with 't' key
    When I press 't'
    Then tag filter interface opens
    And all available tags listed

  Scenario: Select single tag
    When I press 't'
    And I select tag "shopping"
    And I press Enter
    Then list filtered to show only "shopping" tasks
    And status bar shows "1 tag(s) selected"

  Scenario: Select multiple tags
    When I press 't'
    And I select tag "work"
    And I select tag "urgent"
    And I press Enter
    Then list shows tasks with either "work" OR "urgent"
    And status bar shows "2 tag(s) selected"

  Scenario: Visual feedback for selected tags
    When I press 't'
    And I navigate to tag "shopping"
    And I press Space
    Then tag shows checkmark
    And tag is highlighted

  Scenario: Clear all filters with 'c'
    Given filters are active
    When I press 'c'
    Then all filters removed
    And full list restored
    And status bar updated

  Scenario: No tasks match filter
    When I press 't'
    And I select rarely-used tag
    And I press Enter
    Then "No tasks" message appears
    And list shows as empty

  Scenario: Filter persists during navigation
    Given filter is active with "shopping"
    When I press 'r' to refresh
    Then filter still active
    And "shopping" tasks still displayed
