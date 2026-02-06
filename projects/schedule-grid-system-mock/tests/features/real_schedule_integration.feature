Feature: Real Schedule Grid Integration
  As a schedule manager
  I want the schedule grid to actually work with backend
  So that real schedule operations are performed

  Background:
    Given the API server is running on localhost:8000
    And the UI application is accessible on localhost:3000
    And I have a valid authentication token

  @real-integration @schedule-grid
  Scenario: Load current schedule with real backend
    Given I navigate to the schedule grid page
    When the component loads schedule data
    Then the operation should be sent to GET "/api/v1/schedules/current"
    And I should receive real schedule data from the backend
    And the employees should be displayed with actual data
    And the schedule grid should show real shifts

  @real-integration @schedule-grid
  Scenario: Move shift with real backend validation
    Given I navigate to the schedule grid page
    And the schedule grid is loaded with real data
    When I drag a shift from one employee to another
    Then the operation should validate move with POST "/api/v1/schedules/validate-move"
    And if valid, update schedule with PUT "/api/v1/schedules/{schedule_id}"
    And the shift should be moved to the new position
    And the change should be persisted in the backend

  @real-integration @error-handling
  Scenario: Handle API server unavailable for schedule
    Given the API server is not running
    When I attempt to load the schedule grid
    Then I should see an error message "Schedule API server is not available"
    And a retry button should be available
    And the operation should not be completed

  @real-integration @schedule-grid
  Scenario: Handle schedule move validation failure
    Given I navigate to the schedule grid page
    And the schedule grid is loaded with real data
    When I attempt to move a shift to an invalid position
    Then the validation should be sent to POST "/api/v1/schedules/validate-move"
    And I should receive validation errors from the backend
    And the move should be rejected with specific conflict messages
    And the shift should remain in its original position

  @real-integration @schedule-grid
  Scenario: Real-time schedule statistics
    Given I navigate to the schedule grid page
    When the schedule data is loaded from the backend
    Then the statistics should show real coverage percentage
    And the total employees count should match backend data
    And the total shifts count should reflect actual schedules
    And the refresh button should reload data from the API

  @real-integration @authentication
  Scenario: Handle authentication errors in schedule operations
    Given I navigate to the schedule grid page
    And my authentication token is invalid
    When I attempt to load schedule data
    Then I should receive an authentication error
    And I should be prompted to log in again
    And no schedule data should be displayed