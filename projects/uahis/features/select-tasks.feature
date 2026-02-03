Feature: Select and Navigate Tasks
  As a Things user
  I want to navigate through task lists with keyboard
  So I can quickly scan and interact with tasks

  Background:
    Given Things TUI is running
    And task list has multiple items

  Scenario: Navigate down with arrow key
    When I press Down arrow
    Then selection moves to next task
    And previous task no longer highlighted

  Scenario: Navigate down with 'j' key
    When I press 'j'
    Then selection moves to next task
    And uses vim keybindings

  Scenario: Navigate up with arrow key
    When I press Up arrow
    Then selection moves to previous task

  Scenario: Navigate up with 'k' key
    When I press 'k'
    Then selection moves to previous task

  Scenario: Selection cannot go above first task
    Given selection is on first task
    When I press Up arrow
    Then selection stays on first task

  Scenario: Selection cannot go below last task
    Given selection is on last task
    When I press Down arrow
    Then selection stays on last task

  Scenario: Status bar shows selection position
    When I select task at position 5
    Then status bar shows "5"

  Scenario: Visual highlighting shows selection
    When I select a task
    Then selected task shows inverse video
    And other tasks show normal video

  Scenario: Rapid navigation is smooth
    When I press Down 10 times
    Then all selections register smoothly
    And no lag or missed keys
