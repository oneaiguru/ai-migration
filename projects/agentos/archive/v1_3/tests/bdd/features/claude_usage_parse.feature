Feature: Parse Claude Code /usage into structured meters

  Background:
    Given the ANSI/box glyphs are stripped automatically

  Scenario: Wide pane with all sections visible
    Given I paste fixture "claude/usage_wide_90_1_0.txt"
    When I parse as claude usage
    Then session_pct should be 1
    And all_models_pct should be 90
    And opus_pct should be 0
    And all_models_resets should contain "Oct 20, 1:59am"
    And there should be no parser errors

  Scenario: Narrow pane with bullets and split lines
    Given I paste fixture "claude/usage_narrow_90_1_0.txt"
    When I parse as claude usage
    Then session_pct should be 1
    And all_models_pct should be 90
    And there should be no parser errors

  Scenario: Usage not loaded until a message is sent
    Given I paste fixture "claude/usage_failed_to_load.txt"
    When I parse as claude usage
    Then parser errors should include "usage-not-loaded"

  Scenario: Status dialog dismissed spam
    Given I paste fixture "claude/usage_status_dismissed.txt"
    When I parse as claude usage
    Then parser errors should include "usage-not-loaded"
