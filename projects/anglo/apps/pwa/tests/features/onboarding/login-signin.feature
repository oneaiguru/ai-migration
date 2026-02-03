@core
# Tier: @core
# Load-bearing for: Credibility (real product) + Retention (restore progress)
# Psychological intent: Reduces fear of loss and enables switching devices.
# MVP scope (preserve effect):
# - Email/password login.
# - Basic SSO (optional v2).
# - Graceful error messages.
# Pitfalls / anti-patterns:
# - Don't bury login; user must recover progress easily.
# Success signals:
# - Login success rate
# - Time-to-resume learning after login
Feature: Login and Sign In
  As a returning user
  I want to log into my account
  So that I can access my progress and learning history

  Background:
    Given a user has an account already
    And they are on the login screen

  @core @stub
  Scenario: Login screen displays
    Given the user is not logged in
    When they tap "Log In" from welcome screen
    Then the login form appears:
      | Field | Type |
      | Email | Text input |
      | Password | Password input |
      | Log In | Button |
    And a "Create Account" link is present
    And a "Forgot Password?" link is present

  @core @stub
  Scenario: Successful login
    Given the user enters valid credentials
    When they enter:
      """
      - Email: "user@example.com"
      - Password: "SecurePass123"
      """
    And they click "Log In"
    Then :
      """
      - Credentials validated on server
      - JWT token issued
      - User logged in
      - Redirect to home screen
      - Message: "Welcome back, Alex!"
      """

  @core @stub
  Scenario: Login validation - empty fields
    Given the login form
    When the user clicks "Log In" with empty fields
    Then :
      """
      - Error: "Email is required"
      - Error: "Password is required"
      - Form not submitted
      """

  @core @stub
  Scenario: Login validation - invalid email
    Given the login form
    When the user enters "notanemail" as email
    And clicks "Log In"
    Then :
      """
      - Error: "Please enter a valid email"
      - Form not submitted
      """

  @core @stub
  Scenario: Invalid credentials
    Given correct form but wrong password
    When the user submits wrong credentials
    Then :
      """
      - Error: "Email or password is incorrect"
      - No indication which is wrong (security)
      - User can retry
      """

  @v2
  Scenario: Account locked after failed attempts
    Given a user has failed login 5+ times
    When they attempt another login
    Then :
      """
      - Account temporarily locked
      - Message: "Too many login attempts. Try again in 15 minutes."
      - Email sent: "Someone tried to log in to your account"
      """

  @v2
  Scenario: Remember me checkbox
    Given the user logs in with "Remember me" checked
    When they close and reopen the app
    Then :
      """
      - User automatically logged in
      - No login screen shown
      - Home screen appears directly
      """
    And if they logout, remember me resets

  @core @stub
  Scenario: Session persistence
    Given a user is logged in
    When they close the app
    And reopen it
    Then :
      """
      - Session token is valid
      - User remains logged in
      - Progress loads automatically
      """

  @v2
  Scenario: Session timeout
    Given a user is logged in
    When they are inactive for 24+ hours
    Then :
      """
      - Session expires
      - Next action shows: "Session expired - please log in again"
      - Redirect to login screen
      - Local data preserved
      """

  @retention @stub
  Scenario: Logout
    Given a logged-in user
    When they go to Settings → Log Out
    Then :
      """
      - Confirmation: "Are you sure?"
      - Yes/No options
      - If yes:
        - Session terminated
        - JWT token deleted
        - Redirect to login screen
      """

  @v2
  Scenario: Social login with VK
    Given VK OAuth is configured
    When the user taps "Log in with VK"
    Then :
      """
      - VK OAuth flow starts
      - User approves permissions
      - VK account linked (if first time)
      - User logged in
      - Redirect to home screen
      """

  @v2
  Scenario: Social login with Yandex
    Given Yandex OAuth is configured
    When the user taps "Log in with Yandex"
    Then :
      """
      - Yandex OAuth flow starts
      - User signs in via Yandex
      - Account created or linked
      - User logged in
      """

  @v2
  Scenario: Multi-device login
    Given a user logged in on Phone A
    When they log in on Phone B with same account
    Then :
      """
      - Both devices are logged in
      - Both receive notification (optional): "Your account was signed in on a new device"
      - Can sign out all devices from Settings
      """
