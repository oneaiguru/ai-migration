Feature: Resolve Things database paths
  As a developer
  I want clear path resolution for the Things database
  So that the TUI can start reliably in different environments

  Scenario: Resolve default Things database path
    When I resolve the Things database path
    Then the resolved path is a string
    And the resolved path is not empty

  Scenario: Database path points to a real location
    When I resolve the Things database path
    Then I can check if the path exists

  Scenario: Environment variable can override the default
    Given I set an environment variable for the database path
    When I resolve the Things database path
    Then the resolved path uses the environment variable
