@retention
# Tier: @retention
# Load-bearing for: Organic growth
# Psychological intent: Social proof; reinforces identity when shared.
# MVP scope (preserve effect):
# - Share card for streak milestones and checkpoints.
Feature: Share Progress on Social Media
  As a learner
  I want to share my achievements
  So that I can celebrate with others and inspire them

  Background:
    Given a user has achieved something notable
    And social sharing is configured

  @v2
  Scenario: Share button on achievements
    Given a user unlocks an achievement
    When the achievement screen appears
    Then a "Share" button (or icon):
      """
      - Tap to open share menu
      - Shows available platforms
      - Share text pre-written
      """

  @v2
  Scenario: Share to Telegram
    Given achievement or milestone reached
    When the user taps "Share" → "Telegram"
    Then :
      """
      - Telegram link generated
      - Message pre-filled: "I just unlocked Week Warrior badge! 🌟 Learning English with english.dance - join me! [link]"
      - Telegram app opens or link copied
      """

  @v2
  Scenario: Share to VK (VKontakte)
    Given social achievement
    When the user selects "VK"
    Then :
      """
      - VK share dialog opens
      - Pre-filled message with achievement
      - Image/badge preview attached
      - User can customize before posting
      - Posted to wall or story
      """

  @v2
  Scenario: Share streak milestone
    Given a user reaches 30-day streak
    When they view the streak
    Then a "Share" button:
      """
      - "I've maintained a 30-day learning streak with english.dance! 🔥"
      - Includes app link/promo
      - Shareable on Telegram, VK, or copy link
      """

  @v2
  Scenario: Share certificate or level completion
    Given a user completes A1 level
    When completion screen appears
    Then sharing option:
      """
      - Certificate displayed
      - "Share Certificate" button
      - Message: "I've completed A1 (Beginner) English with english.dance! 📜"
      - Certificate can be downloaded as image
      """

  @v2
  Scenario: Copy share link
    Given a share menu is open
    When the user taps "Copy Link"
    Then :
      """
      - Shareable link is copied to clipboard
      - "Copied! 📋" notification
      - Link can be pasted anywhere (WhatsApp, email, etc.)
      - Link shows user's profile/achievement
      """

  @v2
  Scenario: Share referral link
    Given social sharing
    When a user wants to invite friends
    And they tap Share → "Invite Friends"
    Then :
      """
      - Referral link generated (unique per user)
      - "Share your referral link to earn bonuses!"
      - Friends who sign up are linked to referrer
      - Bonus: "Refer a friend, get 1 week Max free"
      """

  @v2
  Scenario: Privacy in sharing
    Given data privacy
    When a user shares achievement
    Then their shared info:
      """
      - Username: shown
      - Level/streak/XP: shown (as selected)
      - Real name: NOT shared
      - Email: NOT shared
      - Learning history: NOT shared (only achievement)
      """

  @v2
  Scenario: Share with screenshot
    Given achievements screen
    When a user takes screenshot or uses "Share Screenshot"
    Then :
      """
      - Screenshot formatted nicely
      - Clean image of achievement with badge
      - Shareable via any method
      - No personal data in screenshot
      """

  @v2
  Scenario: Disable social sharing
    Given privacy preferences
    When a user goes to Settings → Privacy
    And disables "Allow sharing"
    Then :
      """
      - Share buttons disappear
      - Achievements not shareable
      - "Sharing is disabled in your privacy settings"
      """

  @v2
  Scenario: Shared achievement preview
    Given a user shared a link on VK
    When another user clicks the link
    Then they see:
      """
      - Preview: "[User] completed A1 English!"
      - App name: "english.dance"
      - CTA: "Download app" or "Try free"
      - Promo offers if applicable
      """

  @v2
  Scenario: Social proof gamification
    Given shared achievements
    When achievements are shared publicly
    Then leaderboard can show:
      """
      - "Most shared achievements" leaderboard (optional)
      - Users with most visible progress
      - Social proof effect drives engagement
      """
