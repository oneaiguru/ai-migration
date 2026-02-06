Feature: Tagging and prioritizing to dos
  As a user
  I want to use tags and the Today list for prioritization
  So that my workflow matches the Things documentation

  Background:
    Given Things TUI is running with real data

  Scenario: Filter by tag using keyboard
    When I press the key t to open the tag filter
    Then a tag selection interface appears
    And I can navigate through available tags

  Scenario: Filter Today list displays correct tasks
    When I navigate to the "Today" list
    Then I see at least one visible task or the list is empty
    And all tasks shown are due today

  Scenario: Tag filter updates the visible tasks
    When I open the tag filter
    And I select a tag from the list
    Then the main list updates to show only tasks with that tag
    And the status bar indicates the active filter

  Scenario: Clear tag filter returns to full list
    When I have an active tag filter
    And I open the tag filter again
    And I deselect all tags
    Then the main list shows all tasks again
    And the status bar no longer shows a filter indicator

  Scenario: Multiple tags can be applied
    When I open the tag filter
    And I select multiple tags
    Then the main list shows tasks matching any of the selected tags
    And the status bar shows the number of active filters

  Scenario: Waiting to do tag support
    When I navigate to the "Today" list
    And I note any tasks with waiting status
    Then they are properly displayed in the current view
