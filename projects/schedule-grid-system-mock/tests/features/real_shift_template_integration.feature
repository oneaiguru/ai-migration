Feature: Real Shift Template Integration
  As a schedule administrator
  I want shift template management to actually work with backend
  So that real template operations are performed

  Background:
    Given the API server is running on localhost:8000
    And the UI application is accessible on localhost:3000
    And I have a valid authentication token

  @real-integration @shift-templates
  Scenario: Load shift templates with real backend
    Given I navigate to the shift template management page
    When the component loads template data
    Then the operation should be sent to GET "/api/v1/templates/shifts"
    And I should receive real template data from the backend
    And the templates should be displayed with actual data
    And the statistics should show real counts

  @real-integration @shift-templates
  Scenario: Create new shift template with real backend
    Given I navigate to the shift template management page
    And the templates are loaded with real data
    When I click the create template button
    And I fill in the template form with valid data
    And I submit the form
    Then the template should be validated with POST "/api/v1/templates/shifts/validate"
    And if valid, created with POST "/api/v1/templates/shifts"
    And the new template should appear in the list
    And the template count should be updated

  @real-integration @shift-templates
  Scenario: Update existing shift template with real backend
    Given I navigate to the shift template management page
    And the templates are loaded with real data
    When I click edit on an existing template
    And I modify the template data
    And I submit the changes
    Then the template should be validated with POST "/api/v1/templates/shifts/validate"
    And if valid, updated with PUT "/api/v1/templates/shifts/{template_id}"
    And the template should be updated in the list
    And the changes should be persisted in the backend

  @real-integration @shift-templates
  Scenario: Delete shift template with real backend validation
    Given I navigate to the shift template management page
    And the templates are loaded with real data
    When I click delete on a template
    Then the usage should be checked with GET "/api/v1/templates/shifts/{template_id}/usage"
    And if deletable, I should see a confirmation dialog
    When I confirm the deletion
    Then the template should be deleted with DELETE "/api/v1/templates/shifts/{template_id}"
    And the template should be removed from the list
    And the template count should be updated

  @real-integration @shift-templates
  Scenario: Toggle template status with real backend
    Given I navigate to the shift template management page
    And the templates are loaded with real data
    When I click the status toggle on a template
    Then the status should be updated with PATCH "/api/v1/templates/shifts/{template_id}/status"
    And the template status should change in the UI
    And the active count should be updated

  @real-integration @error-handling
  Scenario: Handle API server unavailable for templates
    Given the API server is not running
    When I attempt to load the shift template page
    Then I should see an error message "Shift Template API server is not available"
    And a retry button should be available
    And no templates should be displayed

  @real-integration @validation
  Scenario: Handle template validation errors
    Given I navigate to the shift template management page
    And the templates are loaded with real data
    When I create a template with invalid data
    And I submit the form
    Then the validation should be sent to POST "/api/v1/templates/shifts/validate"
    And I should receive validation errors from the backend
    And the errors should be displayed in the form
    And the template should not be created

  @real-integration @shift-templates
  Scenario: Handle template deletion conflicts
    Given I navigate to the shift template management page
    And the templates are loaded with real data
    When I try to delete a template that is in use
    Then the usage should be checked with GET "/api/v1/templates/shifts/{template_id}/usage"
    And I should see an error about the template being in use
    And the template should not be deleted
    And specific usage information should be displayed

  @real-integration @authentication
  Scenario: Handle authentication errors in template operations
    Given I navigate to the shift template management page
    And my authentication token is invalid
    When I attempt to create a template
    Then I should receive an authentication error
    And I should be prompted to log in again
    And the template should not be created