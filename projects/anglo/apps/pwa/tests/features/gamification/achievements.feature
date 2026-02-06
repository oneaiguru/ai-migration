@retention
# Tier: @retention
# Load-bearing for: Celebration + long-term goals
# Psychological intent: Creates additional milestones; supports identity and pride.
# MVP scope (preserve effect):
# - First lesson badge.
# - Streak milestones (7/10/30).
# - Perfect lesson badge.
Feature: Achievements and Badges
  As a learner
  I want to earn badges and achievements
  So that I have additional goals and celebrate milestones

  Background:
    Given the app tracks various user accomplishments
    And badges are displayed on user profile

  @retention @stub
  Scenario: First lesson achievement
    Given a new user completes their first lesson
    When the lesson completes
    Then an achievement pops:
      """
      - Icon: 📚 "The Beginning"
      - Message: "You've started your English journey!"
      - Added to profile
      """

  @v2
  Scenario: Unit completion achievements
    Given a user completes Unit 1
    When the final lesson ends
    Then achievements unlock:
      """
      - "Unit 1 Master" (A1 Basics)
      - "Getting Warmed Up" (Complete Unit 1)
      """
    And each shows a unique icon/badge

  @v2
  Scenario: Streak milestones
    Given streak-based achievements
    When a user reaches milestone days:
      """
      - 1-day streak: "First Flame" 🔥
      - 7-day streak: "Week Warrior" 🌟
      - 30-day streak: "Monthly Legend" 👑
      - 100-day streak: "Legendary Streaker" 🚀
      """
    Then each is unlocked with celebration

  @retention @stub
  Scenario: Perfect lesson achievement
    Given a user completes a lesson with 0 mistakes
    When all 12 exercises are answered correctly
    Then :
      """
      - Achievement: "Flawless" (Perfect lesson)
      - Badge appears with golden star
      """
