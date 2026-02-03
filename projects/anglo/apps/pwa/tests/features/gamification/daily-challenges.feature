@retention
# Tier: @retention
# Load-bearing for: Retention nudges
# Psychological intent: Gives daily targets beyond the path; adds variety and 'to-do list' motivation.
# MVP scope (preserve effect):
# - 3 daily quests in a Quests tab.
# - Small non-paywalled rewards (cosmetic/badges).
# - No penalty for missing.
# Pitfalls / anti-patterns:
# - Don't overload new users in first session.
Feature: Daily Quests (Challenges)
  As a learner
  I want small daily quests
  So that I have a simple checklist that nudges me to practice

  Background:
    Given the app offers 3 daily quests
    And quests reset at local midnight
    And quests have small, non-paywalled rewards (badge, streak freeze chance)

  Scenario: Quests are visible in a dedicated tab
    Given a learner opens the home screen
    When they tap "Quests"
    Then they see 3 quests for today
    And each quest shows progress (e.g., 0/1, 3/10)

  Scenario: Quests can be completed through normal learning
    Given a quest is "Finish 1 lesson"
    When the learner finishes a lesson
    Then the quest progress completes
    And a small celebration appears

  Scenario: Completing all quests grants a small reward
    Given a learner completes all 3 quests today
    Then they receive a reward (configurable)
    And the reward is not required to keep learning

  Scenario: Missing quests has no penalty
    Given a learner completes 0 quests today
    When the next day begins
    Then quests reset
    And no progress is lost
