# features/user/personal-dashboard.feature
Feature: Personal Dashboard Analytics
  As an employee
  I want to view personal KPI metrics
  So that I can track my performance and goals

  Background:
    Given I am logged into the workforce management system
    And I have employee privileges
    And I am viewing my personal dashboard

  @dashboard @analytics
  Scenario: View current month metrics
    When the dashboard loads for the current month
    Then I see worked hours, attendance rate and overtime hours
    And I see remaining vacation days

  @dashboard
  Scenario: Change dashboard period to quarter
    When I select period "Квартал"
    Then metrics recalculate for the selected quarter
    And charts update accordingly

  @dashboard
  Scenario: Toggle detailed view
    Given the dashboard shows a simplified layout
    When I click "Детальный вид"
    Then additional charts and goal progress are displayed

  @dashboard @mobile
  Scenario: Dashboard on mobile device
    Given I access the dashboard from a mobile phone
    Then widgets stack vertically
    And key metrics remain readable

  @dashboard @notification
  Scenario: Upcoming event requires action
    Given an upcoming training requires confirmation
    When the event is listed in my dashboard
    Then it shows a badge "Действие требуется"
    And I can navigate to confirm participation

  @dashboard @analytics
  Scenario: Export personal reports
    When I choose to export my dashboard data as PDF
    Then the system generates a personal report file
    And I receive a download notification

