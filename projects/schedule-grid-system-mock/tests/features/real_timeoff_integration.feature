Feature: Real Time Off Calendar Integration
  As an employee and manager
  I want time off management to actually work with backend
  So that real time off operations are performed

  Background:
    Given the API server is running on localhost:8000
    And the UI application is accessible on localhost:3000
    And I have a valid authentication token

  @real-integration @timeoff
  Scenario: Load time off calendar with real backend
    Given I navigate to the time off calendar page
    When the component loads time off data
    Then the operation should be sent to GET "/api/v1/schedules/timeoff"
    And I should receive real time off requests from the backend
    And the requests should be displayed with actual data
    And the statistics should show real counts
    And the balance information should show real data

  @real-integration @timeoff
  Scenario: Submit new time off request with real backend
    Given I navigate to the time off calendar page
    And the time off data is loaded with real data
    When I click submit request button
    And I fill in the request form with valid data
    And I submit the form
    Then the request should be validated with POST "/api/v1/schedules/timeoff/validate"
    And if valid, submitted with POST "/api/v1/schedules/timeoff/requests"
    And the new request should appear in the calendar
    And the statistics should be updated

  @real-integration @timeoff
  Scenario: Update existing time off request
    Given I navigate to the time off calendar page
    And the time off data is loaded with real data
    When I click on an existing pending request
    And I modify the request data
    And I submit the changes
    Then the request should be updated with PUT "/api/v1/schedules/timeoff/requests/{request_id}"
    And the changes should be reflected in the calendar
    And the changes should be persisted in the backend

  @real-integration @timeoff
  Scenario: Cancel time off request with real backend
    Given I navigate to the time off calendar page
    And the time off data is loaded with real data
    When I cancel a pending request
    Then the cancellation should be sent to POST "/api/v1/schedules/timeoff/requests/{request_id}/cancel"
    And the request status should be updated to cancelled
    And the calendar should reflect the change

  @real-integration @timeoff
  Scenario: Approve time off request as manager
    Given I navigate to the time off calendar page as a manager
    And there are pending requests from my team
    When I approve a time off request
    Then the approval should be sent to POST "/api/v1/schedules/timeoff/requests/{request_id}/approve"
    And the request status should be updated to approved
    And the employee should see the approved status
    And the balance should be updated accordingly

  @real-integration @error-handling
  Scenario: Handle API server unavailable for time off
    Given the API server is not running
    When I attempt to load the time off calendar page
    Then I should see an error message "Time Off API server is not available"
    And a retry button should be available
    And no time off data should be displayed

  @real-integration @timeoff
  Scenario: Handle time off request validation errors
    Given I navigate to the time off calendar page
    And the time off data is loaded with real data
    When I submit a request that violates policies
    Then the validation should be sent to POST "/api/v1/schedules/timeoff/validate"
    And I should receive validation errors from the backend
    And the errors should be displayed in the form
    And the request should not be submitted

  @real-integration @timeoff
  Scenario: Display real time off balance
    Given I navigate to the time off calendar page
    When the component loads balance data
    Then the balance should be fetched with GET "/api/v1/schedules/timeoff/balance/{employee_id}"
    And I should see my actual vacation days available
    And I should see my actual sick leave balance
    And I should see my actual personal days balance
    And the balance should reflect pending requests

  @real-integration @authentication
  Scenario: Handle authentication errors in time off operations
    Given I navigate to the time off calendar page
    And my authentication token is invalid
    When I attempt to submit a time off request
    Then I should receive an authentication error
    And I should be prompted to log in again
    And the request should not be submitted