Feature: Parse Codex /status into structured meters

  Background:
    Given the ANSI/box glyphs are stripped automatically

  Scenario: Wide terminal with both bars and reset times
    Given I paste fixture "codex/wide_status_82_1.txt"
    When I parse as codex status
    Then fiveh_pct should be 1
    And fiveh_resets should equal "13:01"
    And weekly_pct should be 82
    And weekly_resets should equal "21:29 on 19 Oct"
    And there should be no parser errors

  Scenario: Narrow terminal with wrapped lines
    Given I paste fixture "codex/narrow_wrapped_status_82_1.txt"
    When I parse as codex status
    Then fiveh_pct should be 1
    And weekly_pct should be 82
    And there should be no parser errors

  Scenario: Alternative reset phrasing with “on 8 Oct”
    Given I paste fixture "codex/alt_reset_64_0.txt"
    When I parse as codex status
    Then fiveh_pct should be 0
    And weekly_pct should be 64
    And weekly_resets should equal "13:04 on 8 Oct"
    And there should be no parser errors

  Scenario: Too narrow to be useful
    Given I paste fixture "codex/too_narrow_missing_numbers.txt"
    When I parse as codex status
    Then parser errors should include "insufficient-data"
