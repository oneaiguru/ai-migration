@retention
# Tier: @retention
# Load-bearing for: Convenience + credibility
# Psychological intent: Downloadable packs feel 'real' like a course; helps travel/commute use.
# MVP scope (preserve effect):
# - Download Unit pack (audio + text).
# - Manage storage.
# - Free limited downloads (Max expands later).
# Pitfalls / anti-patterns:
# - Don't make offline strictly Max in RU MVP.
Feature: Content Download for Offline Use
  As a learner
  I want to download some content
  So that I can study during poor connectivity (metro, travel)

  Background:
    Given offline downloads are optional
    And the product may offer different limits for free vs Max
    And downloaded content includes text and (optionally) audio

  Scenario: Learner can download a unit pack
    Given the learner is online
    When they tap "Download Unit"
    Then the unit pack downloads to the device
    And the UI shows download progress
    And the unit becomes available offline

  Scenario: Free learners have a reasonable offline allowance
    Given the learner is on the free plan
    When they try to download content
    Then they can download up to a small limit (e.g., 1–2 units) without paying
    And the app clearly shows remaining offline storage allowance

  @v2
  Scenario: Max expands offline downloads
    Given the learner is a Max subscriber
    Then their offline download limit is higher (or unlimited)

  Scenario: Learner can delete downloaded content
    Given the learner has downloaded 2 units
    When they open Offline Downloads settings
    Then they can delete a unit pack
    And storage is freed

  @retention
  Scenario: Downloads degrade gracefully if audio is missing
    Given a unit has audio
    When audio fails to download
    Then the unit can still be downloaded with text-only
    And the UI indicates "Audio will download later"
