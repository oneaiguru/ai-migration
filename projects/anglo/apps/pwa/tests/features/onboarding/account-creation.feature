@core
# Tier: @core
# Load-bearing for: Credibility + Retention
# Psychological intent: Low-friction identity step once user cares about progress; supports trust via clear consent + privacy.
# MVP scope (preserve effect):
# - Email + password signup with explicit consent checkbox.
# - Optional: continue without verification (verify later).
# - Immediate sync enablement.
# Pitfalls / anti-patterns:
# - Don't block learning on verification.
# Success signals:
# - Signup completion rate
# - Support tickets re: accounts
Feature: Account Creation
  As a user
  I want to create an account with email and password
  So that my progress is saved and I can access Max features

  Background:
    Given a user is on the app's onboarding flow

  @core @stub
  Scenario: User sees account creation form
    Given the user clicks "Create Account"
    When the account creation screen appears
    Then I should see:
      | Field | Type |
      | Email | Text input |
      | Password | Password input |
      | Confirm Password | Password input |
    And a "Create Account" button is present
    And a "Log In Instead" link is present

  @core @stub
  Scenario: Successful account creation
    Given the user is on the account creation form
    When they enter:
      | Email | user@example.com |
      | Password | SecurePass123 |
      | Confirm Password | SecurePass123 |
    And they click "Create Account"
    Then the account is created successfully

  @core @stub
  Scenario: Email validation on account creation
    Given the user is on the account creation form
    When they enter an invalid email like "notanemail"
    And they click "Create Account"
    Then an error appears: "Please enter a valid email"
    And the form is not submitted

  @v2
  Scenario: Password strength validation
    Given the user is on the account creation form
    When they enter a weak password like "123"
    And the field loses focus
    Then a warning appears: "Password must be at least 8 characters"
    And the "Create Account" button is disabled

  @core @stub
  Scenario: Passwords must match
    Given the user enters mismatched passwords
      | Password | SecurePass123 |
      | Confirm | DifferentPass456 |
    When they click "Create Account"
    Then an error appears: "Passwords do not match"

  @core @stub
  Scenario: Email already registered
    Given an account with "user@example.com" already exists
    When a new user tries to create an account with the same email
    And they click "Create Account"
    Then an error appears: "This email is already registered"
    And a "Log In" link is provided

  @core
  Scenario: User must accept terms
    Given the user fills in email and password correctly
    When they do NOT check the terms checkbox
    And they click "Create Account"
    Then an error appears: "You must accept the Terms and Privacy Policy"
    And the button remains disabled

  @v2
  Scenario: Email verification
    Given an account has been created
    And a verification email was sent
    When the user clicks the link in the email
    Then the email is marked as verified
    And a success message appears: "Email verified!"
    And they are redirected to the app main screen
    And their account is fully activated
