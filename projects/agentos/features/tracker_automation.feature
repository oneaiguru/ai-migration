Feature: Codex status automation workflow
  Automate Codex /status capture via shell script and tracker aliases.

  Background:
    Given a fresh tracker data directory

  @automation
  Scenario: Capture Codex before snapshot through automation script
    When I run codex status automation with fixture "automation/codex_status_before.txt" for window "W0-AUTO" phase "before"
    Then tracker should have a "codex" "before" snapshot for window "W0-AUTO"
    And tracker snapshot source for "codex" phase "before" window "W0-AUTO" should be "automation"
    And the last alias stdout should contain "5h limit"

  @automation
  Scenario: Capture Codex after snapshot through automation script
    When I run codex status automation with fixture "automation/codex_status_before.txt" for window "W0-AUTO" phase "before"
    And I run codex status automation with fixture "automation/codex_status_after.txt" for window "W0-AUTO" phase "after"
    Then tracker should have a "codex" "after" snapshot for window "W0-AUTO"
    And tracker snapshot source for "codex" phase "after" window "W0-AUTO" should be "automation"
    And tracker should record codex metrics for window "W0-AUTO" phase "after" with 5h "11" and weekly "9"

  @automation
  Scenario: Capture Claude monitor snapshot through automation script
    When I run claude monitor automation with fixture "claude_monitor/realtime_sample.txt" for window "W0-AUTO-C" notes "automation:claude-monitor"
    Then tracker claude monitor record for window "W0-AUTO-C" should have token usage "0.0"
    And tracker claude monitor token limit for window "W0-AUTO-C" should be "153378"
