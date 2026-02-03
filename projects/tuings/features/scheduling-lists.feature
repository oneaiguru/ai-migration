Feature: Scheduling to dos into Today, Upcoming, Anytime and Someday
  As a user of Things TUI
  I want my scheduled to dos to appear in the correct lists
  So that the Today, Upcoming, Anytime and Someday views match the official Things behaviour

  Background:
    Given Things TUI is running with real data

  Scenario: To do scheduled for today appears in Today list
    When I navigate to the "Today" list
    Then all visible tasks in "Today" should have a due date of today or be unscheduled
    And the status bar shows "Today" as the current list

  Scenario: To do scheduled in the future appears in Upcoming
    When I navigate to the "Upcoming" list
    Then the status bar shows "Upcoming" as the current list
    And I see a list of tasks or the list is empty

  Scenario: To do scheduled as Anytime appears in Anytime
    When I navigate to the "Anytime" list
    Then the status bar shows "Anytime" as the current list
    And if tasks are present, they have no specific due date

  Scenario: To do scheduled as Someday appears in Someday
    When I navigate to the "Someday" list
    Then the status bar shows "Someday" as the current list
    And the list displays tasks tagged as someday or deferred

  Scenario: Switching between lists shows correct content
    When I navigate to the "Today" list
    And I note the number of tasks shown
    And I navigate to the "Upcoming" list
    Then the content changes to reflect the Upcoming list
    And the status bar updates to show "Upcoming"
