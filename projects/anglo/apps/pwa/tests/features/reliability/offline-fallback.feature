@core
# Tier: @core
# Load-bearing for: Reliability (credibility)
# Psychological intent: Prevents frustration; keeps user in flow even with network hiccups.
# MVP scope (preserve effect):
# - Detect offline/slow network.
# - Graceful fallback to cached content.
# - Queue writes for retry.
Feature: Offline Fallback and Graceful Degradation
  As a learner
  I want the app to keep working during bad internet
  So that I can keep my habit and not lose progress

  Background:
    Given the app caches the next lessons and review items opportunistically
    And progress writes are queued locally when offline

  Scenario: Offline state is detected and shown unobtrusively
    Given the app is running
    When connectivity is lost
    Then a subtle indicator appears:
      """
      - "Offline mode" (small)
      """
    And the learner can still access cached lessons/review

  Scenario: Lesson can continue when network drops mid-session
    Given a learner is in a lesson
    When the network suddenly drops
    Then the lesson continues locally
    And answers are stored locally for later sync
    And the app does not crash

  @core
  Scenario: Offline completion can still protect streak
    Given a learner completes a lesson offline today
    Then the app marks today's streak day as complete locally
    And when syncing succeeds later, the streak remains valid

  @core
  Scenario: Incident banner shows and offers streak repair
    Given an incident occurred yesterday affecting the learner's timezone
    And the learner had an active streak before the incident
    And the learner attempted to use the app during the incident (app_open logged)
    When they open the app today
    Then an incident banner is visible
    And the banner says "Вчера произошёл сбой на сервере. Восстановить серию?"
    And a "Восстановить" button is available
    When they tap "Восстановить"
    Then their streak is restored to pre-incident value
    And the repair is logged for audit

  @v2
  Scenario: Slow connection detection (optional)
    Given the user has weak connectivity
    When the app detects slow speeds
    Then it can show:
      """
      - "Slow connection" warning
      - Suggest switching to offline packs
      """
