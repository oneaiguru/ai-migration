@core
# Tier: @core
# Load-bearing for: Retention (save streak/progress) + Credibility (multi-device)
# Psychological intent: Transforms invested anonymous user into registered user by framing signup as protecting earned value (loss aversion).
# MVP scope (preserve effect):
# - Trigger prompt after Unit 1 completion OR 3–5 day streak.
# - One-tap 'Save progress' flow (email/password).
# - Merge local progress → server without losing streak.
# Pitfalls / anti-patterns:
# - Don't threaten user with 'you will lose everything' too early.
# - Don't require email verification before saving progress.
# Success signals:
# - Anonymous→registered conversion
# - Churn after signup prompt
Feature: Account Upgrade (Anonymous to Registered)
  As an anonymous user
  I want to link my local progress to a new account
  So that I don't lose my learning streak and achievements when I sign up

  Background:
    Given an anonymous user has been learning for several days
    And they have completed 12 lessons and have a 4-day streak
    And all this data is stored locally

  @core
  Scenario: User is prompted to upgrade account
    Given the anonymous user has completed Unit 1
    And they visit the profile screen
    When the streak milestone is visible (4 days)
    Then a banner appears: "Save your progress - Create an account"
    And clicking the banner opens the upgrade flow

  @core
  Scenario: User creates account while upgrading
    Given the upgrade flow is open
    When the user clicks "Create New Account"
    Then they see the account creation form (email/password)
    And a note says: "Your local progress will be merged with this account"

  @core
  Scenario: Progress is merged on account creation
    Given the user creates account "newuser@example.com"
    When the account is created (verification deferred)
    Then the local data is migrated to the server:
      | Data | Value |
      | Lessons Completed | 12 |
      | Streak | 4 days |
      | XP Earned | 360 |
      | Last Lesson Position | Unit 1, Lesson 12 |
    And a success message shows: "Your progress has been saved!"

  @core
  Scenario: User logs in with existing account
    Given the anonymous user has already created an account before
    When they choose "Log In to Existing Account"
    And they enter their credentials
    Then they are logged in
    And their existing data is loaded (not merged, as they're returning)
    And the local anonymous data is cleared
    And they continue their lessons from their saved position

  @core
  Scenario: Device ID is linked to account
    Given an account upgrade happens
    When the merge is complete
    Then the device ID is linked to the user account
    And in the future, the same device will auto-sync
    And if they install on another device, they can log in and sync

  @core
  Scenario: Streak is preserved during upgrade
    Given an anonymous user has a 7-day active streak
    When they upgrade to an account
    Then the streak counter is preserved
    And the next day, they can continue the streak
    And the streak shows "8 days" if they do a lesson
