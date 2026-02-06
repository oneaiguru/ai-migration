Feature: Mark Task Complete
  As a Things user
  I want to toggle task completion status
  So I can track completed work

  Background:
    Given Things TUI is running with real data
    And at least one task exists in current list

  @leaf_3_2 @write @mark_complete
  Scenario: Mark task complete with 'c' key
    Given I select task at position 1
    When I press 'c'
    Then task at position 1 marked as complete
    And task shows completed indicator

  @leaf_3_2 @write @mark_complete
  Scenario: Unmark completed task with 'c' key
    Given I select a completed task
    When I press 'c'
    Then task marked as incomplete
    And completed indicator removed

  @leaf_3_2 @write @mark_complete
  Scenario: Selection moves to next task after marking complete
    Given I select task at position 1
    When I press 'c'
    Then task at position 1 marked as complete
    And selection moves down to next task

  @leaf_3_2 @write @mark_complete
  Scenario: Completed tasks show visual distinction
    Given I select task at position 1
    When I press 'c'
    Then completed task shows strikethrough
    And completed task grayed out

  @leaf_3_2 @write @mark_complete
  Scenario: Task count updates after marking complete
    When I select task at position 1
    And I press 'c'
    Then status bar updates completion count

  @leaf_3_2 @write @mark_complete
  Scenario: Mark multiple tasks complete in sequence
    When I select task at position 1
    And I press 'c'
    And I select task at position 3
    And I press 'c'
    Then tasks at positions 1 and 3 marked complete
    And all other tasks remain incomplete

  @leaf_3_2 @write @mark_complete
  Scenario: Toggling task completion on and off
    Given I select task at position 1
    When I press 'c'
    And I select task at position 1
    And I press 'c'
    Then task at position 1 marked as incomplete
