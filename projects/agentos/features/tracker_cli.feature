Feature: Tracker CLI coverage
  Core tracker commands should follow the BDD workflow and remain covered end-to-end.

  Background:
    Given a fresh tracker data directory

  Scenario: Ingest snapshots and preview window summary
    When I ingest tracker snapshot for "codex" phase "before" window "W0-CLI" using fixture "codex/alt_reset_64_0.txt"
    And I ingest tracker snapshot for "codex" phase "after" window "W0-CLI" using fixture "codex/wide_status_82_1.txt"
    And I ingest tracker snapshot for "claude" phase "before" window "W0-CLI" using fixture "claude/usage_wide_90_1_0.txt"
    And I ingest tracker snapshot for "claude" phase "after" window "W0-CLI" using fixture "claude/usage_narrow_90_1_0.txt"
    And I run tracker complete for window "W0-CLI" with codex "3" claude "3" quality "1.0" outcome "pass" notes "bdd"
    And I run tracker preview for window "W0-CLI"
    Then the last tracker stdout should contain "Windows: W0-CLI"
    And the last tracker stdout should contain "codex: features=3"
    And the last tracker stdout should contain "claude: features=3"
    And the last tracker stdout should contain "power=n/a"
    And the last tracker stdout should contain "Outcome: quality=1.0, outcome=pass"
    And tracker should record window "W0-CLI" codex delta weekly "18" fiveh "1"

  Scenario: Compute churn and surface preview summary
    When I ingest tracker snapshot for "codex" phase "before" window "W0-CHN" using fixture "codex/alt_reset_64_0.txt"
    And I ingest tracker snapshot for "codex" phase "after" window "W0-CHN" using fixture "codex/wide_status_82_1.txt"
    And I run tracker complete with commits for window "W0-CHN" codex "2" claude "0" quality "1.0" outcome "pass" notes "churn-bdd" commit-start "HEAD" commit-end "HEAD"
    And I run tracker churn for window "W0-CHN" with provider "codex"
    And I run tracker preview for window "W0-CHN"
    Then the last tracker stdout should contain "Churn:"
    And the last tracker stdout should contain "window=W0-CHN"
    And the last tracker stdout should contain "+0/-0 (net=0)"
    And the last tracker stdout should contain "per-feature=0.00"

  Scenario: Override codex snapshot via CLI
    When I run tracker override for "codex" phase "after" window "W0-OVR" with weekly "82" fiveh "1" notes "manual"
    Then tracker should have a "codex" "after" snapshot for window "W0-OVR"
    And tracker snapshot source for "codex" phase "after" window "W0-OVR" should be "override"
    And tracker snapshot errors for "codex" phase "after" window "W0-OVR" should contain "manual-override"

  Scenario: Ingest GLM counts via CLI
    When I ingest tracker glm counts for window "W0-GLM" using fixture "glm/ccusage_sample.json"
    Then tracker should record glm prompts "118" for window "W0-GLM"
    And tracker glm entry for window "W0-GLM" should include provider "glm-4.6"

  Scenario: Ingest Codex ccusage JSON via CLI
    When I ingest tracker codex ccusage for window "W0-CCD" using fixture "ccusage/codex_sessions_sample.json"
    Then tracker codex ccusage record for window "W0-CCD" should have session count "51"
    And tracker codex ccusage total tokens for window "W0-CCD" should be "7372723263"

  Scenario: Ingest Claude monitor snapshot via CLI
    When I ingest tracker claude monitor for window "W0-CM" using fixture "claude_monitor/realtime_sample.txt"
    Then tracker claude monitor record for window "W0-CM" should have token usage "0.0"
    And tracker claude monitor token limit for window "W0-CM" should be "153378"
