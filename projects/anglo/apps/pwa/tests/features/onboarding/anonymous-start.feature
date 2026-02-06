@core
# Tier: @core
# Load-bearing for: Growth (reduce friction) + Credibility (progress saved later)
# Psychological intent: Removes signup friction; gets user into a 30–90s micro-win before asking commitment.
# MVP scope (preserve effect):
# - Welcome screen with one primary CTA: Start learning (anonymous).
# - Anonymous profile with local progress + local streak + local XP.
# - Timed account-save prompt after Unit 1 OR Day-3 streak (whichever first).
# Pitfalls / anti-patterns:
# - Don't force account creation before first lesson.
# - Don't show 'Max' upsell on first session.
# Success signals:
# - Time-to-first-exercise < 30s
# - D1 retention uplift vs forced signup
Feature: Anonymous Start (No-Signup Onboarding)
  As a new learner
  I want to start learning without creating an account
  So that I can try the app immediately and feel progress first

  Background:
    Given the app can store progress locally for anonymous learners
    And anonymous learners can later create an account to sync progress

  Scenario: Start learning without account creation
    Given a new learner opens the app
    When they tap "Start learning"
    Then they are taken directly into the first onboarding lesson
    And no signup form is shown yet

  Scenario: Anonymous progress is saved locally
    Given an anonymous learner completes a lesson
    When they close and reopen the app
    Then their progress is still there
    And their streak and XP are still visible

  Scenario: Prompt to save progress appears after early investment
    Given an anonymous learner completed Unit 1 OR reached a 3–5 day streak
    When they open the home screen
    Then a gentle banner appears: "Save your progress (free)"
    And the banner explains: "Create an account so you don't lose your streak if you change phones"
    And the learner can dismiss it and keep learning

  @retention
  Scenario: Anonymous learner can choose "Remind me later"
    Given the save-progress banner is shown
    When the learner taps "Remind me later"
    Then the banner disappears
    And it can reappear after another milestone (configurable)
