Feature: CCC adapter privacy tiers
  The AgentOS CCC client must respect privacy tiers, validate schemas, and compute
  metrics consistently with the pytest integration tests.

  Background:
    Given a temporary working directory for CCC fixtures

  Scenario: Local-only tier keeps all telemetry offline
    Given a CCC client configured for "local" privacy tier
    When I record a sample session
    Then no network uploads should be recorded
    And the metrics summary should show features per capacity of 2.0

  Scenario: Minimized tier uploads aggregated metrics only
    Given a CCC client configured for "minimized" privacy tier
    When I record a sample session
    Then exactly one metrics upload should be recorded
    And the minimized payload should contain only safe keys

  Scenario: Full tier uploads redacted events and metrics
    Given a CCC client configured for "full" privacy tier
    When I record a sample session
    Then the client should upload redacted turn events
    And the metrics summary should show features per capacity of 1.3333
