@core
# Tier: @core
# Load-bearing for: Monetization
# Psychological intent: Upsell should not interrupt core loop; offer convenience and depth.
# MVP scope (preserve effect):
# - Max unlocks AI features (Roleplay, Speaking coach, Ask-AI deeper coaching).
# - Max expands convenience limits (offline packs, advanced modes).
# - No 'pay to keep learning' wall.
# Pitfalls / anti-patterns:
# - Avoid paywall on mistakes.
Feature: Max Subscription Upgrade (Non-Blocking)
  As a learner
  I want an optional Max plan
  So that I can access AI learning tools and extra practice modes
  Without losing access to core learning

  Background:
    Given the RU market expects generous free access
    And Max must not block core lessons, review, or streak completion

  Scenario: Max paywall triggers on Max value-add taps (not on core learning)
    Given a learner is doing a lesson
    When they tap "Roleplay" or "Speaking coach" or "Ask AI" deeper coaching
    Then they see the Max paywall
    And the lesson remains playable without paying
    And review remains available without a paywall
    And "Why?" explanations remain free

  Scenario: Max upsell is shown only after value is proven
    Given a learner has completed at least one lesson
    When they view the profile or settings
    Then they may see an optional upgrade card
    And it does not interrupt an active lesson

  Scenario: Max benefits are AI + convenience (not pay-to-continue)
    Given a learner views the Max page
    Then it lists benefits like:
      """
      - Ask-AI deeper coaching
      - Roleplay practice
      - Speaking coach feedback
      - Larger offline packs / auto-download packs
      - Advanced Practice Hub modes
      """
    And it does NOT promise "unlimited learning" as a paid-only benefit

  Scenario: Canceling checkout does not unlock or preview AI features
    Given a learner opens the Max paywall from an AI feature
    When they cancel the checkout
    Then they return to the prior screen
    And the AI feature remains locked (no preview)
    And they can retry upgrading immediately
    And the paywall cannot re-open more than once per 60 seconds

  Scenario: Restore purchases after a failed callback
    Given a learner returns from checkout without an entitlement update
    When they tap "Restore purchases / Sync entitlements"
    Then the app re-checks entitlements
    And unlocks Max once the payment is confirmed

  Scenario: Payment providers for Russia (MIR / SBP)
    Given payments are enabled
    When a learner chooses to upgrade
    Then a web checkout opens using supported RU rails (MIR, SBP)
    And the checkout works in PWA and RuStore Android
    And after successful payment, Max unlocks immediately
    And a receipt or confirmation is shown
    And SBP bank-app handoff + return works in TWA
