Feature: Viewing a large Anytime list (3000+ tasks)
  As a user with a real Things account
  I want the Anytime list to remain readable and responsive
  Even when I have thousands of tasks

  Background:
    Given Things TUI is running with real data
    And my Things database has at least 3000 tasks in the "Anytime" list

  @stability @large-anytime
  Scenario: Opening Anytime with thousands of tasks shows a stable screen
    When I press '3'
    Then the Anytime list should open
    And the UI should not show corrupted or overlapping output
    And only a single screenful of tasks should be visible
    And the status bar should be visible and readable
    And the status bar should show the total count of Anytime tasks

  @stability @large-anytime
  Scenario: Only the visible window of tasks is rendered
    Given I am viewing the "Anytime" list
    Then the number of visible tasks on screen should be at most 40
    And the status bar should indicate which tasks are visible
    And the status bar should show the total number of Anytime tasks

  @stability @large-anytime
  Scenario: Scrolling down through a large Anytime list stays responsive
    Given I am viewing the "Anytime" list
    When I press Down arrow 10 times
    Then the selected task should have moved down
    And the list should scroll smoothly without flickering
    And the status bar should remain visible and readable
    And each keypress should respond in less than 500ms

  @stability @large-anytime
  Scenario: Scrolling up through a large Anytime list works
    Given I am viewing the "Anytime" list
    And I have scrolled down to task 100
    When I press Up arrow 10 times
    Then the selected task should have moved up
    And the list should scroll smoothly
    And the status bar should show updated position

  @stability @large-anytime
  Scenario: Selection stays within the visible window
    Given I am viewing the "Anytime" list
    When I navigate to task 500
    Then the selected task should be visible on screen
    And the window should have scrolled to keep it in view
    And no off-screen tasks should be rendered

  @stability @large-anytime
  Scenario: Status bar clearly shows list size when truncated
    Given I am viewing the "Anytime" list
    And there are more tasks than the render limit
    Then the status bar should indicate "showing first N of M"
    And M should equal the total number of Anytime tasks
    And N should be the maximum visible limit
