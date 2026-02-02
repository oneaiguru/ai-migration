# features/admin/employee-workload.feature
Feature: Employee Workload Display
  As a workforce manager
  I want to view employee workload information
  So that I can make informed scheduling decisions

  Background:
    Given I am logged into the system
    And I am viewing employee information

  Scenario: View employee current workload
    Given I am looking at an employee's information
    When I view their workload data
    Then I should see their planned hours vs actual hours
    And I should see overtime information if applicable
    Example:
      | Planned Hours | Actual Hours | Overtime |
      | 168 | 191 | 22 ч. 30 мин. |

  Scenario: Identify overworked employees
    Given an employee has exceeded their planned hours
    When I view their workload information
    Then the overtime should be clearly highlighted
    And I should see the exact overtime amount
    And the information should be color-coded for quick identification

  Scenario: View workload across time periods
    Given I am analyzing employee workload
    When I select different time periods (daily, weekly, monthly)
    Then I should see workload data for the selected period
    And I should be able to identify trends and patterns

  Scenario: Export workload reports
    Given I am viewing employee workload data
    When I click the export button
    Then I should be able to download workload reports
    And the reports should include planned vs actual hours
    And overtime calculations should be included