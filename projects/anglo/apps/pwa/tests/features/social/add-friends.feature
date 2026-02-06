@retention
# Tier: @retention
# Load-bearing for: Retention (social accountability)
# Psychological intent: Friends add light accountability; increases return probability.
# MVP scope (preserve effect):
# - Search/add by username or link.
# - Remove/block.
# Pitfalls / anti-patterns:
# - Don't require friends to start learning.
Feature: Adding Friends
  As a social learner
  I want to add friends in the app
  So that I can see their progress and compete with them

  Background:
    Given a user is logged in
    And social features are enabled

  @retention @stub
  Scenario: Friends menu is accessible
    Given the user is in the app
    When they tap the "Friends" or "Social" tab
    Then they see:
      """
      - Friends list (empty if new)
      - "Add Friends" button
      - Friend requests (if any)
      - Friend activity feed
      """

  @v2
  Scenario: Add friend by username
    Given the user clicks "Add Friends"
    When a search screen appears
    Then :
      """
      - Search field: "Enter username"
      - "Search" button or auto-search
      - Results show matching users (name, level, streak)
      - "Add" button per user
      """

  @v2
  Scenario: Send friend request
    Given the user found "MariaLearns"
    When they click "Add"
    Then :
      """
      - Friend request sent
      - Status changes to "Request sent"
      - User is notified (optional)
      """

  @v2
  Scenario: Receive and accept friend request
    Given MariaLearns received a friend request from AlexEnglish
    When a notification appears (if enabled)
    And they go to Friends → Requests
    Then they see:
      """
      - "AlexEnglish wants to be your friend"
      - "Accept" / "Decline" buttons
      """
    And tapping Accept:
      """
      - Friendship confirmed
      - Both users can now see each other's profiles
      """

  @v2
  Scenario: Decline friend request
    Given a friend request notification
    When the user clicks "Decline"
    Then :
      """
      - Request is rejected
      - Requester is not notified (to reduce awkwardness)
      - User will not see request again
      """

  @v2
  Scenario: Cancel pending friend request
    Given the user sent a request that's pending
    When they go to Friends → Pending
    Then they see pending requests
    And can tap "Cancel" to withdraw request
    And the other user will see status change

  @v2
  Scenario: View friend's profile
    Given a user is friends with AlexEnglish
    When they tap on their name
    Then a profile appears showing:
      """
      - Username and avatar
      - Current XP and level
      - Current streak (days)
      - Total lessons completed
      - Achievements/badges
      - "Message" button (if messaging available)
      """

  @v2
  Scenario: Block user
    Given a user's profile is viewed
    When they tap "..." (more options)
    Then a menu:
      """
      - "Block user" option
      - "Report user" option (for abuse)
      """
    And selecting "Block":
      """
      - User blocked
      - No longer appears in search
      - User won't see you on leaderboards
      """

  @v2
  Scenario: Friend activity feed
    Given a user is viewing Friends section
    When they look at the activity feed
    Then they see recent friend actions:
      """
      - "Anna completed Unit 3! 🎉"
      - "Boris reached a 10-day streak 🔥"
      - "Maria unlocked Achievement: Speed Runner"
      - Timestamps on each activity
      """

  @v2
  Scenario: Limit on friends
    Given some apps limit friend count
    When a user has 500 friends (if limit exists)
    Then a message:
      """
      - "Friend limit reached"
      - Or no limit, allowing unlimited friends
      """

  @v2
  Scenario: Remove friend
    Given a user is viewing their friends list
    When they long-press or tap a friend's name
    Then options:
      """
      - "Remove friend"
      - Confirmation: "Remove [name] from friends?"
      - Yes/No
      """
    And if yes, friendship ends

  @v2
  Scenario: Friend request notifications
    Given friend requests are received
    When a friend request comes in
    Then optional notification:
      """
      - "Anna sent you a friend request"
      - Tap to view request
      - Can be toggled in settings
      """
