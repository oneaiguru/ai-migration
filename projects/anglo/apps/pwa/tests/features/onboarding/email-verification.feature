@v2
# Tier: @v2
# Load-bearing for: Security
# Psychological intent: Reduces fraud and improves recovery—nice, not required for loop.
# MVP scope (preserve effect):
# - Send verification email
# - Allow resend
# Pitfalls / anti-patterns:
# - Don't block learning on verification in RU market
# Success signals:
# - Verification rate
Feature: Email Verification
  As a new user
  I want to verify my email
  So that my account is secure and I can recover it

  Background:
    Given a user just created an account
    And signup was successful

  @v2
  Scenario: Verification required screen
    Given account creation completed
    When the user is redirected
    Then they see:
      """
      - "Verify your email"
      - "We sent a link to: user@example.com"
      - "Check your inbox and click the link"
      - "Resend email" button
      - Can still use app (optional) or must verify
      """

  @v2
  Scenario: Verification email sent
    Given user created account with "user@example.com"
    When confirmation email is queued
    Then email delivered with:
      """
      - Subject: "Verify your email for english.dance"
      - Body: "Click the link below to verify"
      - Link: https://app.com/verify?token=xyz (valid for 24 hours)
      - Warning: "If you didn't create this account, ignore"
      - Plain text + HTML versions
      """

  @v2
  Scenario: User clicks verification link
    Given verification email was sent
    When user clicks the link
    Then :
      """
      - Link validated on server
      - If valid (token exists, not expired): mark as verified
      - If invalid (expired): show "Link expired - resend email"
      - If token wrong: show generic error
      """

  @v2
  Scenario: Verification success
    Given user clicked valid verification link
    When verification completes
    Then :
      """
      - Page shows: "✓ Email verified!"
      - Confirmation message
      - Redirect to app or login
      - Badge on profile: "Email verified ✓"
      """

  @v2
  Scenario: Resend verification email
    Given verification email was sent but not clicked
    When user clicks "Resend email"
    Then :
      """
      - New email sent with new token
      - Message: "Verification email sent again"
      - User can resend after 5 minutes (rate limiting)
      """

  @v2
  Scenario: Auto-verify after login with unverified email
    Given user created account but didn't verify
    And they logged in
    When they access the app
    Then a banner:
      """
      - "Email not verified - check your inbox"
      - Or optional: allow app use but remind
      """

  @v2
  Scenario: Benefits of verified email
    Given email is verified
    When user has verified email
    Then they gain:
      """
      - Ability to reset password
      - Account recovery options
      - Backup email on file
      - Eligible for support help
      """

  @v2
  Scenario: Max purchase requires verified email
    Given user tries to upgrade
    When email is not verified
    Then a prompt:
      """
      - "Verify your email before purchasing"
      - "This helps us secure your payment"
      - "Resend verification?" button
      """

  @v2
  Scenario: Email change requires verification
    Given user wants to change email
    When they initiate email change
    Then :
      """
      - Old email gets: "Confirm email change" link
      - New email gets: "Verify new email" link
      - Both must be confirmed
      - User clicks link from new email
      - Change is finalized
      """

  @v2
  Scenario: Old email verification timeout
    Given email change initiated
    When user doesn't click link from old email for 1 hour
    Then :
      """
      - Email change cancelled
      - User must initiate again
      - Prevents hijacking attempts
      """
