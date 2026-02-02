# features/admin/time-tracking.feature
Feature: Time Entry and Tracking
  As an employee or manager
  I want to track work time accurately
  So that attendance and hours are properly recorded

  Background:
    Given I am logged into the workforce management system
    And I have time tracking access

  Scenario: Clock in for work shift
    Given I am scheduled to work today
    And my shift starts at 09:00
    When I clock in at 09:00
    Then my clock-in time should be recorded
    And my status should show as "На смене" (On Shift)
    And I should see my current shift information

  Scenario: Clock out for lunch break
    Given I am currently clocked in
    And it is my scheduled lunch time
    When I clock out for lunch break
    Then my break start time should be recorded
    And my status should show as "На перерыве" (On Break)
    And the system should track my break duration

  Scenario: Clock in from lunch break
    Given I am currently on lunch break
    When I clock in from my break
    Then my break end time should be recorded
    And my status should return to "На смене" (On Shift)
    And my total break time should be calculated

  Scenario: Clock out at end of shift
    Given I am currently clocked in
    And my shift is scheduled to end at 17:00
    When I clock out at 17:05
    Then my clock-out time should be recorded
    And my status should show as "Не на смене" (Off Shift)
    And my total work hours for the day should be calculated
    And any overtime should be flagged if applicable

  Scenario: Handle early arrival
    Given my shift is scheduled to start at 09:00
    When I clock in at 08:45
    Then my early arrival should be recorded
    And I should be notified about early clock-in
    And the system should ask if I want to start work early

  Scenario: Handle late arrival
    Given my shift is scheduled to start at 09:00
    When I clock in at 09:15
    Then my late arrival should be recorded
    And the delay should be calculated as 15 minutes
    And my punctuality record should be updated

  Scenario: Track multiple activities during shift
    Given I am clocked in for my shift
    When I transition between different activities:
      | Activity | Duration |
      | В работе (Working) | 2 hours |
      | Перерыв (Break) | 30 minutes |
      | В работе (Working) | 3 hours |
      | Обучение (Training) | 1 hour |
    Then each activity should be tracked separately
    And total time should be calculated correctly
    And activity distribution should be available for reporting