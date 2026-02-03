Feature: Navigate Between Lists
  As a Things user
  I want to quickly switch between task lists
  So I can see different categories of tasks

  Background:
    Given Things TUI is running with real data

  Scenario: Navigate to Today with '1' key
    When I press '1'
    Then current list changes to "Today"
    And status bar shows "Today"
    And tasks from Today displayed

  Scenario: Navigate to Upcoming with '2' key
    When I press '2'
    Then current list changes to "Upcoming"
    And status bar shows "Upcoming"

  Scenario: Navigate to Anytime with '3' key
    When I press '3'
    Then current list changes to "Anytime"
    And status bar shows "Anytime"
    And loads 5,655 anytime tasks

  Scenario: Navigate to Someday with '4' key
    When I press '4'
    Then current list changes to "Someday"
    And status bar shows "Someday"
    And loads 278 someday tasks

  Scenario: Selection resets on list change
    Given I select task at position 5
    When I press '1' to switch lists
    Then selection resets to position 0
    And first task is highlighted

  Scenario: List shows correct task count
    When I press '1'
    Then status bar shows "X" slash 87
    When I press '3'
    Then status bar shows "X" slash 5655

  Scenario: Sidebar shows active list
    When I press '2'
    Then sidebar highlights "2 Upcoming"
    When I press '3'
    Then sidebar highlights "3 Anytime"

  Scenario: List displays immediately
    When I press any list key (1-4)
    Then list updates without delay
    And tasks render instantly
