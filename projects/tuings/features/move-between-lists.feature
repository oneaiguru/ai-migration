Feature: Move Task Between Lists
  As a Things user
  I want to reschedule tasks between lists
  So I can organize my tasks across different timeframes

  Background:
    Given Things TUI is running with real data
    And at least one task exists in current list

  @leaf_3_3 @write @move_task
  Scenario: Move task from Today to Upcoming
    Given I select task at position 1
    When I press 'm'
    And I select "Upcoming" from move menu
    Then task no longer in Today list
    And task appears in Upcoming list

  @leaf_3_3 @write @move_task
  Scenario: Move task from Upcoming to Anytime
    Given I select task at position 1
    When I press 'm'
    And I select "Anytime" from move menu
    Then task no longer in Upcoming list
    And task appears in Anytime list

  @leaf_3_3 @write @move_task
  Scenario: Move task from Anytime to Someday
    Given I select task at position 1
    When I press 'm'
    And I select "Someday" from move menu
    Then task no longer in Anytime list
    And task appears in Someday list

  @leaf_3_3 @write @move_task
  Scenario: Move menu shows available lists
    Given I select task at position 1
    When I press 'm'
    Then move menu appears
    And move menu shows all list options

  @leaf_3_3 @write @move_task
  Scenario: Cancel move with Escape
    Given I select task at position 1
    When I press 'm'
    And I press 'escape'
    Then move menu closes
    And task remains in original list

  @leaf_3_3 @write @move_task
  Scenario: Move task from Someday back to Today
    Given a task exists in Someday list
    When I select the Someday task
    And I press 'm'
    And I select "Today" from move menu
    Then task appears in Today list
    And task no longer in Someday list

  @leaf_3_3 @write @move_task
  Scenario: Selection stays on moved task
    Given I select task at position 1
    When I press 'm'
    And I select "Upcoming" from move menu
    Then selection highlights the newly moved task
    And selection index adjusted to task position

  @leaf_3_3 @write @move_task
  Scenario: Move multiple tasks in sequence
    When I select task at position 1
    And I press 'm'
    And I select "Upcoming" from move menu
    And I select task at position 2
    And I press 'm'
    And I select "Upcoming" from move menu
    Then both tasks appear in Upcoming list
    And original list shows fewer tasks
