@core
# Tier: @core
# Load-bearing for: Micro-reward
# Psychological intent: Tiny points + animations create immediate gratification and 'progress' sensation.
# MVP scope (preserve effect):
# - Base XP per correct answer / lesson.
# - Immediate on-screen feedback.
# - XP contributes to daily goal and simple profile stats.
# Pitfalls / anti-patterns:
# - Don't let XP become a gamed metric that replaces learning.
Feature: Experience Points (XP) Earning
  As a learner
  I want to earn XP for my learning activities
  So that I feel rewarded and can track my progress over time

  @core @stub
  Scenario: XP awarded for correct answer
    Given a user submits a correct answer
    When the answer is marked correct
    Then the user earns:
      """
      - Base XP: +10 points
      - Visual indicator: "+10 XP" appears on screen
      - Total XP updated in profile
      """

  @core @stub
  Scenario: No XP for incorrect answer
    Given a user submits an incorrect answer
    When the answer is marked wrong
    Then the user earns:
      """
      - XP: +0 (no XP awarded)
      - Message: "Incorrect - no XP this time"
      """

  @retention @stub
  Scenario: Bonus XP for perfection
    Given a user answers multiple questions perfectly in a row
    When they reach 5 correct answers without mistakes
    Then a bonus is awarded:
      """
      - "5 in a row! 🔥"
      - Bonus XP: +25 extra XP
      - Total for 5 Q's: 50 + 25 = 75 XP
      """

  @v2
  Scenario: XP multiplier on streak
    Given a user has an active 10-day streak
    When they complete a lesson with +100 base XP
    Then a streak multiplier is applied:
      """
      - Multiplier: 1.2x (20% bonus for 10-day streak)
      - Adjusted XP: 100 × 1.2 = 120 XP
      - Message: "Streak Bonus! +20 XP"
      """

  @core @stub
  Scenario: Lesson completion XP
    Given a user completes an entire lesson (12 exercises)
    When the lesson completion screen appears
    Then total XP is calculated:
      """
      - Sum of all correct answers: 100 XP
      - Lesson bonus: +20 XP
      - Total shown: "+120 XP"
      - Daily goal / streak progress updated
      """

  @retention @stub
  Scenario: Daily practice bonus
    Given a user does their first lesson of the day
    When they complete it
    Then a bonus is awarded:
      """
      - "Daily Practice Bonus! +50 XP"
      - Total XP for first lesson: 120 + 50 = 170 XP
      """

  @v2
  Scenario: Max users have no XP cap
    Given a Max subscriber with unlimited access
    When they complete 10 lessons (1200+ XP)
    Then :
      """
      - All XP is awarded
      - No cap message appears
      - Full 1200 XP is added to total
      """

  @core @stub
  Scenario: XP is displayed consistently
    Given XP is earned throughout the lesson
    When the user views their profile
    Then the total XP is shown:
      """
      - In profile header: "Total XP: 2,450"
      - In weekly summary: "This week: 2,450 XP"
      - In course overview: "Progress: 2,450 / 5000 (Next level)"
      """

  @v2
  Scenario: XP history and log
    Given a user has earned XP over multiple sessions
    When they view "XP History" or "Stats"
    Then a log appears showing:
      | Date | Activity | XP | Total |
      | Today | Lesson 5 complete | +120 | 2,450 |
      | Yesterday | Lesson 4 complete | +100 | 2,330 |
      | 3 days ago | Lesson 3 complete | +110 | 2,230 |

  @v2
  Scenario: XP for non-lesson activities
    Given various app activities
    When the user:
      """
      - Completes a unit: +200 XP
      - Maintains a 7-day streak: +50 XP
      - Achieves a new badge: +25 XP
      - Participates in weekly challenge: +150 XP
      """
    Then each activity awards appropriate XP

  @v2
  Scenario: XP not lost on app crash
    Given a user earned 50 XP in a lesson
    When the app crashes mid-lesson
    And the user reopens the app
    Then the session resumes
    And all XP earned so far is preserved
    And is finalized when lesson completes

  @core @stub
  Scenario: XP visible immediately
    Given a user answers correctly
    When the "+10 XP" indicator appears
    Then it animates on screen
    And profile XP counter updates instantly (or within 1 second)
    And the XP counter updates on next refresh