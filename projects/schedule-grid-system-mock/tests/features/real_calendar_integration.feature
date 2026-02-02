Feature: Real Calendar Manager Integration
  As a schedule coordinator
  I want calendar management to actually work with backend
  So that real calendar operations are performed

  Background:
    Given the API server is running on localhost:8000
    And the UI application is accessible on localhost:3000
    And I have a valid authentication token

  @real-integration @calendar
  Scenario: Load calendar events with real backend
    Given I navigate to the calendar manager page
    When the component loads calendar data
    Then the operation should be sent to GET "/api/v1/schedules/calendar"
    And I should receive real calendar events from the backend
    And the events should be displayed with actual data
    And the calendar statistics should show real counts

  @real-integration @calendar
  Scenario: Create new calendar event with real backend
    Given I navigate to the calendar manager page
    And the calendar is loaded with real data
    When I click create event button
    And I fill in the event form with valid data
    And I submit the form
    Then the event should be validated with POST "/api/v1/schedules/calendar/check-conflicts"
    And if valid, created with POST "/api/v1/schedules/calendar/events"
    And the new event should appear in the calendar
    And the statistics should be updated

  @real-integration @calendar
  Scenario: Update existing calendar event
    Given I navigate to the calendar manager page
    And the calendar is loaded with real data
    When I click on an existing event
    And I modify the event data
    And I submit the changes
    Then the event should be updated with PUT "/api/v1/schedules/calendar/events/{event_id}"
    And the changes should be reflected in the calendar
    And the changes should be persisted in the backend

  @real-integration @calendar
  Scenario: Delete calendar event with real backend
    Given I navigate to the calendar manager page
    And the calendar is loaded with real data
    When I delete an event
    Then the event should be deleted with DELETE "/api/v1/schedules/calendar/events/{event_id}"
    And the event should be removed from the calendar
    And the statistics should be updated

  @real-integration @error-handling
  Scenario: Handle API server unavailable for calendar
    Given the API server is not running
    When I attempt to load the calendar manager page
    Then I should see an error message "Calendar API server is not available"
    And a retry button should be available
    And no calendar data should be displayed

  @real-integration @calendar
  Scenario: Handle event conflict detection
    Given I navigate to the calendar manager page
    And the calendar is loaded with real data
    When I create an event that conflicts with existing events
    Then the conflicts should be checked with POST "/api/v1/schedules/calendar/check-conflicts"
    And I should see conflict warnings from the backend
    And I should be able to confirm or cancel the creation
    And the decision should be reflected in the final API call