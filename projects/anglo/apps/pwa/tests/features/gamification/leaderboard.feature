@v2
# Tier: @v2
# Load-bearing for: Optional growth lever
# Psychological intent: Competition can boost engagement but can also distort learning; ship later with guardrails.
# MVP scope (preserve effect):
# - Friend-only leaderboard first (optional).
# Pitfalls / anti-patterns:
# - Avoid early exposure; avoid XP farming incentives.
Feature: Leaderboard and Competitive Rankings
  As a learner
  I want to see how I compare to others
  So that I'm motivated to practice more and compete

  Background:
    Given the app has a leaderboard system
    And multiple users have earned XP and streaks

  @retention @stub
  Scenario: Weekly XP leaderboard view
    Given the user opens the "Leaderboard" tab
    When they view the default leaderboard
    Then they see:
      | Rank | Username | XP | Streak |
      | 1 | IvanStudies | 5,230 | 25 days |
      | 2 | MariaLearns | 4,980 | 18 days |
      | 3 | (Me) AlexEnglish | 4,340 | 7 days |
      | 4 | KateLinguist | 4,100 | 12 days |
      | 5 | DmitryPolyglot | 3,950 | 5 days |
    And "This Week" is the default filter

  @retention @stub
  Scenario: User highlighted on leaderboard
    Given the leaderboard is displayed
    When the user finds themselves
    Then their row is highlighted:
      """
      - "🟢 (Me) AlexEnglish" with different background color
      - Their position is prominent (centered if not in top 10)
      """

  @retention @stub
  Scenario: View different leaderboard timeframes
    Given the leaderboard is open
    When the user taps filter buttons:
      """
      - "This Week"
      - "This Month"
      - "All Time"
      """
    Then the rankings update accordingly
    And top performers change per timeframe

  @v2
  Scenario: League-based tiers (optional progression)
    Given competitive leagues exist:
      """
      - Bronze League (0-2,000 XP)
      - Silver League (2,000-5,000 XP)
      - Gold League (5,000-10,000 XP)
      - Platinum League (10,000+ XP)
      """
    When a user is in Bronze League
    Then their leaderboard shows:
      """
      - Only Bronze League members (or option to view all)
      - Leaderboard resets weekly with promotion/demotion
      """

  @v2
  Scenario: Friend leaderboard
    Given the user has added friends in the app
    When they tap "Friend Leaderboard"
    Then they see a separate ranking:
      | Rank | Friend | XP | Streak |
      | 1 | Anna | 5,100 | 20 days |
      | 2 | (Me) | 4,340 | 7 days |
      | 3 | Peter | 4,200 | 9 days |
    And it's often more motivating than global leaderboard

  @v2
  Scenario: Real-time position updates
    Given the user is viewing the leaderboard
    When another user completes a lesson and gains XP
    Then the leaderboard updates:
      """
      - Position of that user may change
      - Animations show movement
      - User's own position may adjust
      """

  @v2
  Scenario: Streak leaderboard
    Given different leaderboard types exist
    When the user selects "Streak Leaderboard"
    Then the ranking is by current streak length:
      | Rank | User | Current Streak | Best Streak |
      | 1 | IvanStudies | 25 days | 35 days |
      | 2 | KateLinguist | 18 days | 22 days |
      | 3 | (Me) AlexEnglish | 7 days | 12 days |

  @v2
  Scenario: Leaderboard rewards (cosmetic or functional)
    Given weekly leaderboard resets
    When the week ends
    And top 3 users are finalized
    Then rewards are given:
      """
      - 1st place: "🥇 Champion Badge" + 100 bonus XP
      - 2nd place: "🥈 Runner-Up Badge" + 50 bonus XP
      - 3rd place: "🥉 Bronze Badge" + 25 bonus XP
      """
    And badges appear on user profile

  @v2
  Scenario: Blocked users cannot be viewed
    Given a user has blocked another user
    When they view the leaderboard
    Then the blocked user is hidden or appears grayed out
    And they don't see their ranking relative to blocked user

  @v2
  Scenario: Regional / Language leaderboard
    Given some users may be in different regions
    When a "Regional Leaderboard" option exists
    Then users can filter:
      """
      - Global
      - Russia
      - Moscow
      - etc.
      """
    And rankings adjust per region

  @v2
  Scenario: Motivational notifications from leaderboard
    Given the user is on the leaderboard but not in top 3
    When a daily reminder is sent
    Then it may reference their position:
      """
      - "You're 45 XP away from 2nd place! Keep it up! 🚀"
      - "Anna just beat you by 20 XP. Catch up today!"
      """

  @v2
  Scenario: Max users have leaderboard advantage (optional)
    Given a "Max Leaderboard" feature
    When Max users complete more lessons (no hearts limit when hearts are enabled)
    Then they naturally rank higher
    And a note clarifies: "Top players have no daily limits"

  @v2
  Scenario: Leaderboard resets and history
    Given a weekly leaderboard cycle
    When a new week starts
    Then the old leaderboard is archived:
      """
      - "Last Week's Results" or "Season 1"
      - Users can view historical rankings
      - Best weekly scores are stored
      """
    And a fresh leaderboard begins
