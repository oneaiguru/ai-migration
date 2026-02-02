Feature: Real Schedule Optimization Integration
  As a schedule manager
  I want AI-powered optimization to actually work with backend
  So that real optimization operations are performed

  Background:
    Given the API server is running on localhost:8000
    And the UI application is accessible on localhost:3000
    And I have a valid authentication token

  @real-integration @optimization
  Scenario: Load optimization data with real backend
    Given I navigate to the schedule optimization page
    When the component loads optimization data
    Then the operation should be sent to GET "/api/v1/schedules/optimize/constraints"
    And the operation should be sent to GET "/api/v1/schedules/optimize/scenarios"
    And the operation should be sent to GET "/api/v1/schedules/conflicts"
    And the operation should be sent to GET "/api/v1/schedules/optimize/algorithms"
    And I should receive real optimization data from the backend
    And the constraints should be displayed with actual data
    And the scenarios should show real configurations

  @real-integration @optimization
  Scenario: Run schedule optimization with real AI
    Given I navigate to the schedule optimization page
    And the optimization data is loaded with real data
    When I select a scenario and click optimize
    Then the optimization should be sent to POST "/api/v1/schedules/optimize"
    And I should see real optimization progress
    And I should receive real optimization results from the backend
    And the results should include actual cost, coverage, and conflict data
    And the conflicts should be updated with real data

  @real-integration @optimization
  Scenario: Create new optimization scenario
    Given I navigate to the schedule optimization page
    And the optimization data is loaded with real data
    When I click create new scenario
    And I configure the scenario parameters
    Then the scenario should be saved with POST "/api/v1/schedules/optimize/scenarios"
    And the new scenario should appear in the list
    And I should be able to select it for optimization

  @real-integration @optimization
  Scenario: Resolve schedule conflicts with real backend
    Given I navigate to the schedule optimization page
    And there are conflicts detected by the system
    When I click resolve on a conflict
    Then the resolution should be sent to POST "/api/v1/schedules/conflicts/{conflict_id}/resolve"
    And the conflict should be resolved in the backend
    And the conflict should be removed from the list
    And any new conflicts should be displayed

  @real-integration @error-handling
  Scenario: Handle API server unavailable for optimization
    Given the API server is not running
    When I attempt to load the schedule optimization page
    Then I should see an error message "Optimization API server is not available"
    And a retry button should be available
    And no optimization data should be displayed

  @real-integration @optimization
  Scenario: Handle optimization algorithm selection
    Given I navigate to the schedule optimization page
    And the optimization data is loaded with real data
    When I view the algorithm settings
    Then I should see available algorithms from the backend
    And I should see real algorithm parameters
    And I should be able to adjust optimization settings
    And the settings should be used in the real optimization call

  @real-integration @optimization
  Scenario: Monitor long-running optimization
    Given I navigate to the schedule optimization page
    And I start a complex optimization
    When the optimization takes longer than expected
    Then the status should be checked with GET "/api/v1/schedules/optimize/{optimization_id}/status"
    And I should see real progress updates
    And I should be able to cancel the optimization if needed
    And cancellation should be sent to POST "/api/v1/schedules/optimize/{optimization_id}/cancel"

  @real-integration @optimization
  Scenario: Apply optimization recommendations
    Given I navigate to the schedule optimization page
    And an optimization has completed with recommendations
    When I choose to apply specific recommendations
    Then the application should be sent to POST "/api/v1/schedules/optimize/{optimization_id}/apply"
    And the changes should be applied to the real schedule
    And the results should be confirmed by the backend
    And the schedule should reflect the optimization changes

  @real-integration @authentication
  Scenario: Handle authentication errors in optimization operations
    Given I navigate to the schedule optimization page
    And my authentication token is invalid
    When I attempt to run an optimization
    Then I should receive an authentication error
    And I should be prompted to log in again
    And the optimization should not be started