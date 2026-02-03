@retention
# Tier: @retention
# Load-bearing for: Supportability + Retention
# Psychological intent: Prevents account-loss churn.
# MVP scope (preserve effect):
# - Forgot password flow via email
# - Invalidate sessions after reset
# Pitfalls / anti-patterns:
# - Don't require support ticket for basic reset
# Success signals:
# - Password reset completion rate
Feature: Password Reset and Recovery
  As a user who forgot my password
  I want to reset it
  So that I can regain access to my account

  Background:
    Given a user is on the login screen
    And password reset is configured

  @retention @stub
  Scenario: Forgot password link
    Given the login screen
    When the user clicks "Forgot Password?"
    Then a password reset screen appears:
      """
      - "Reset your password"
      - Email input field
      - "Send Reset Link" button
      - "Back to login" link
      """

  @retention @stub
  Scenario: Request password reset
    Given the password reset form
    When the user enters their email
    And clicks "Send Reset Link"
    Then :
      """
      - Email validated
      - If account exists: reset email sent (silent success)
      - If account doesn't exist: still shows "Check your email" (security - don't reveal if account exists)
      - Message: "Check your email for a password reset link"
      """

  @retention @stub
  Scenario: Password reset email
    Given a reset link was sent
    When the user checks their email
    Then they receive:
      """
      - Subject: "Reset your password"
      - Body: "Click the link below to reset your password"
      - Link: https://app.com/reset?token=xyz (valid for 1 hour)
      - Warning: "If you didn't request this, ignore this email"
      """

  @retention @stub
  Scenario: Reset link expiration
    Given a password reset link
    When the user tries to use an old link (>1 hour)
    Then :
      """
      - Error: "Reset link has expired"
      - "Request a new reset link" button
      - User must restart process
      """

  @retention @stub
  Scenario: Reset password form
    Given the user clicked reset link
    When the reset form appears
    Then :
      """
      - Password input field
      - Confirm password field
      - "Reset Password" button
      - Password strength indicator
      """

  @retention @stub
  Scenario: Password reset validation
    Given the reset form
    When the user enters weak password
    And clicks "Reset Password"
    Then :
      """
      - Error: "Password must be at least 8 characters"
      - Error: "Password must include uppercase, lowercase, number"
      - Form not submitted
      """

  @retention @stub
  Scenario: Reset password success
    Given valid password reset form
    When the user enters strong password twice
    And clicks "Reset Password"
    Then :
      """
      - Password updated on server
      - All active sessions logged out (security)
      - Success: "Password reset successfully"
      - Redirect to login screen
      - Confirmation email sent
      """

  @retention @stub
  Scenario: Logout all devices on password change
    Given a user changed their password
    When the password reset completes
    Then :
      """
      - All JWT tokens invalidated
      - All devices logged out (security measure)
      - All must log in with new password
      - Email sent: "Your password was changed"
      """
