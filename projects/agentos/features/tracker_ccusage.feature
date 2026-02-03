Feature: ccusage Codex coverage
  Validate ccusage daily, weekly, and session ingestion workflows for Codex usage tracking.

  Background:
    Given a fresh tracker data directory

  @session
  Scenario: Ingest Codex ccusage session summary
    When I ingest tracker codex ccusage scope "session" for window "W0-CC-SESSION" using fixture "ccusage/codex_sessions_sample.json"
    Then tracker codex ccusage record for window "W0-CC-SESSION" should have scope "session"
    And tracker codex ccusage total tokens for window "W0-CC-SESSION" should be "7372723263"
    And tracker codex ccusage latest session id for window "W0-CC-SESSION" should be "2025/10/19/rollout-2025-10-19T01-57-49-0199f878-7b4c-7423-9b83-c2bd6e6749d6"

  @daily
  Scenario: Ingest Codex ccusage daily summary
    When I ingest tracker codex ccusage scope "daily" for window "W0-CC-DAILY" using fixture "ccusage/codex_daily_sample.json"
    Then tracker codex ccusage record for window "W0-CC-DAILY" should have scope "daily"
    And tracker codex ccusage daily total tokens for window "W0-CC-DAILY" date "2025-10-19" should be "123456"
    And tracker codex ccusage daily percent used for window "W0-CC-DAILY" date "2025-10-19" should be "12.5"
    And tracker codex ccusage reset at for window "W0-CC-DAILY" should be "2025-10-20T21:11:00Z"

  @weekly
  Scenario: Ingest Codex ccusage weekly summary
    When I ingest tracker codex ccusage scope "weekly" for window "W0-CC-WEEKLY" using fixture "ccusage/codex_weekly_sample.json"
    Then tracker codex ccusage record for window "W0-CC-WEEKLY" should have scope "weekly"
    And tracker codex ccusage weekly percent used for window "W0-CC-WEEKLY" should be "9.2"
    And tracker codex ccusage weekly total tokens for window "W0-CC-WEEKLY" should be "987654321"

  @errors
  Scenario: Handle invalid ccusage payload
    When I ingest tracker codex ccusage scope "session" for window "W0-CC-ERROR" using fixture "ccusage/codex_invalid_sample.json"
    Then tracker codex ccusage record for window "W0-CC-ERROR" should list error "invalid-json"
