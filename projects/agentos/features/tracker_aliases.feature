Feature: Tracker alias workflow
  Operators should be able to record snapshots with shorthand aliases.

  Background:
    Given a fresh tracker data directory

  Scenario: Record Codex start and end panes
    When I run the alias command "start codex" with fixture "codex/alt_reset_64_0.txt"
    And I run the alias command "end codex" with fixture "codex/wide_status_82_1.txt"
    Then tracker should have a "codex" "before" snapshot for window "W0-01"
    And tracker should have a "codex" "after" snapshot for window "W0-01"

  Scenario: Cross closes the current window and seeds the next
    When I run the alias command "start codex" with fixture "codex/alt_reset_64_0.txt"
    And I run the alias command "cross codex" with fixture "codex/wide_status_82_1.txt"
    Then tracker should have a "codex" "after" snapshot for window "W0-01"
    And tracker should have a "codex" "before" snapshot for window "W0-02"
    And the last alias stdout should contain "seeded before snapshot for W0-02"

  Scenario: Delete the latest Codex after snapshot
    When I run the alias command "start codex" with fixture "codex/alt_reset_64_0.txt"
    And I run the alias command "end codex" with fixture "codex/wide_status_82_1.txt"
    And I run the alias delete command "codex" with options:
      | option | value |
      | phase  | after |
      | index  | 1     |
    Then tracker should have no "codex" "after" snapshot for window "W0-01"
    And the last alias stdout should contain "removed codex after snapshot"

  Scenario: Delete the second-latest Codex after snapshot
    When I run the alias command "start codex" with fixture "codex/alt_reset_64_0.txt"
    And I run the alias command "end codex" with fixture "codex/wide_status_82_1.txt"
    And I run the alias command "start codex" with fixture "codex/alt_reset_64_0.txt"
    And I run the alias command "end codex" with fixture "codex/wide_status_82_1.txt"
    And I run the alias delete command "codex" with options:
      | option | value |
      | phase  | after |
      | index  | 2     |
    Then tracker should have no "codex" "after" snapshot for window "W0-01"
    And tracker should have a "codex" "after" snapshot for window "W0-02"

  Scenario: Delete the second-latest Codex before snapshot
    When I run the alias command "start codex" with fixture "codex/alt_reset_64_0.txt"
    And I run the alias command "cross codex" with fixture "codex/wide_status_82_1.txt"
    And I run the alias delete command "codex" with options:
      | option | value |
      | phase  | before |
      | index  | 2      |
    Then tracker should have no "codex" "before" snapshot for window "W0-01"
    And tracker should have a "codex" "before" snapshot for window "W0-02"

  Scenario: Undo erroneous Codex window recording
    When I run the alias command "start codex" with window "W0-19" using fixture "codex/live_cases/W0-19_before_correct.txt"
    And I run the alias command "end codex" with window "W0-19" using fixture "codex/live_cases/W0-19_after_12pct.txt"
    And I run the alias command "start codex" with window "W0-20" using fixture "codex/live_cases/W0-20_start_0pct.txt"
    And I run the alias delete command "codex" with options:
      | option | value  |
      | phase  | before |
      | window | W0-20  |
    Then the last alias stdout should contain "removed codex before snapshot"
    And I run the alias command "start codex" with window "W0-20" using fixture "codex/live_cases/W0-20_start_0pct.txt"
    Then tracker should have a "codex" "before" snapshot for window "W0-19"
    And tracker should have a "codex" "after" snapshot for window "W0-19"
    And tracker should have a "codex" "before" snapshot for window "W0-20"
    And tracker should have no "codex" "after" snapshot for window "W0-20"

  Scenario: Agent-specific alias state directories stay isolated
    When I set alias agent "main"
    And I run the alias command "start codex" with fixture "codex/alt_reset_64_0.txt"
    And I set alias agent "sub1"
    And I run the alias command "start codex" with fixture "codex/alt_reset_64_0.txt"
    Then alias state for agent "main" provider "codex" should have window "W0-01" and phase "before"
    And alias state for agent "sub1" provider "codex" should have window "W0-01" and phase "before"
    And tracker snapshot notes for "codex" "before" window "W0-01" should contain "AGENT_ID=main"
    And tracker snapshot notes for "codex" "before" window "W0-01" should contain "AGENT_ID=sub1"
    And the alias state directories should be unique per agent

  Scenario: GLM baseline and delta capture
    When I run the alias command "start glm" with inline json:
      """
      {
        "account": "glm",
        "generated_at": "2025-11-05T10:00:00Z",
        "blocks": [
          {"window_id": "W0-01", "provider": "glm-4.6", "prompts_used": 12}
        ]
      }
      """
    And I run the alias command "end glm" with inline json:
      """
      {
        "account": "glm",
        "generated_at": "2025-11-05T15:00:00Z",
        "blocks": [
          {"window_id": "W0-01", "provider": "glm-4.6", "prompts_used": 30}
        ]
      }
      """
    Then tracker should record glm prompts "18" for window "W0-01"
    And the last alias stdout should contain "stored glm delta"

  Scenario: Codex multi-pane status keeps the latest block
    When I run the alias command "start codex" with fixture "codex/alt_reset_64_0.txt"
    And I run the alias command "end codex" with fixture "codex/live_cases/W0-20_after_multi_status.txt"
    Then tracker should have a "codex" "after" snapshot for window "W0-01"
    And tracker should record codex metrics for window "W0-01" phase "after" with 5h "0" and weekly "10"
    And tracker should note codex errors for window "W0-01" phase "after" containing "multi-pane-trimmed"
