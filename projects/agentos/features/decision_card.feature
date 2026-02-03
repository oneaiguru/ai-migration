Feature: Decision card evaluation
  Operators can confirm GO/SOFT GO readiness using the decision card script.

  Background:
    Given a fresh tracker data directory
    And decision card tools are staged in sandbox
    And decision card ledgers are initialized
    And a dummy artifact "artifacts/test_runs/TR-GO/pytest.txt" exists with content "ok"

  Scenario: GO when window finalized with churn and evidence
    When a finalized window "W0-GO" exists with codex features "1" outcome "pass"
    And a churn ledger row exists for window "W0-GO" provider "codex"
    And I append acceptance evidence for window "W0-GO" capability "CAP-UAT-PYTEST" runner "pytest" result "pass" using artifact "artifacts/test_runs/TR-GO/pytest.txt"
    And I run decision card for window "W0-GO" in sandbox
    Then the last command stdout should contain "Status:   GO"
    And the last command stdout should contain "Anoms:    0"
