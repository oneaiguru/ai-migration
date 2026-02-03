@v2
# Tier: @v2
# Load-bearing for: Optional retention
# Psychological intent: Competition among friends; can be added later.
# MVP scope (preserve effect):
# - Friend leaderboard weekly.
Feature: Friend Leaderboard
  As a competitive learner
  I want to see how I rank against my friends
  So that I'm motivated to practice more

  Background:
    Given a user has multiple friends
    And friend XP and streaks are tracked

  @retention @stub
  Scenario: Friend leaderboard access
    Given a user goes to Leaderboard tab
    When they view leaderboard options
    Then tabs appear:
      """
      - "Global" (all users)
      - "Friends" (only friends)
      - "League" (if league system exists)
      """
    And they tap "Friends"

  @retention @stub
  Scenario: Friend leaderboard display
    Given the friends leaderboard
    When it loads
    Then they see:
      | Rank | Friend | XP | Streak | Status |
      | 1 | Ivan | 5,230 | 25 | 🥇 |
      | 2 | Maria | 4,980 | 18 | 🥈 |
      | 3 | (Me) Alex | 4,340 | 7 | 🥉 |
      | 4 | Anna | 3,900 | 14 | |
      | 5 | Boris | 3,200 | 5 | |
    And "(Me)" highlighted in current position

  @v2
  Scenario: Friend rank motivation
    Given a user seeing they're ranked 3rd among friends
    When they view the leaderboard
    Then messages displayed:
      """
      - "You're 150 XP behind Ivan!"
      - "Complete 2 more lessons to beat Maria"
      - Motivational tone
      """

  @v2
  Scenario: Friend activity on leaderboard
    Given real-time leaderboard updates
    When a friend completes a lesson
    Then :
      """
      - Rankings potentially change
      - Notification: "Anna just overtook you! 🚀"
      - Friend's name moves up/down with animation
      """

  @v2
  Scenario: Filter friend leaderboard
    Given a leaderboard view
    When filter options are available
    Then users can sort by:
      """
      - "XP This Week" (default)
      - "XP All Time"
      - "Current Streak"
      - "Best Streak"
      """
    And leaderboard updates with filter

  @v2
  Scenario: Friend leaderboard is more motivating
    Given competitive psychology
    When a user compares global vs friend leaderboard
    Then :
      """
      - Friend leaderboard often more engaging
      - Smaller, more relatable competition
      - People feel they can catch up
      - Drives more lessons completed
      """

  @v2
  Scenario: Challenge a friend directly
    Given a user viewing a friend's profile
    When they tap "Challenge Friend"
    Then (if challenge feature exists):
      """
      - "Challenge [Friend] to [type of challenge]?"
      - Types: "Most XP this week", "Longest streak", etc.
      - Friend receives challenge notification
      - Leaderboard highlights the challenge
      """

  @v2
  Scenario: Hide from friend leaderboard
    Given privacy concerns
    When a user goes to Settings → Privacy
    And sets "Appear on friend leaderboards": Off
    Then :
      """
      - User not visible on friends' leaderboards
      - Friends can't see their XP/streak
      - Friends don't know they're hiding
      """

  @v2
  Scenario: Friend leaderboard seasonality
    Given friend leaderboards reset weekly
    When a new week starts
    Then :
      """
      - Old leaderboard archived
      - New leaderboard starts fresh
      - Previous week's rankings accessible
      - "Last week you were #2 among friends"
      """

  @v2
  Scenario: Many friends on leaderboard
    Given a user with 100+ friends
    When they view friend leaderboard
    Then pagination or infinite scroll:
      """
      - Shows top 20 friends by default
      - "Load more" or scroll to see more
      - Friends section search to find specific friend
      """
