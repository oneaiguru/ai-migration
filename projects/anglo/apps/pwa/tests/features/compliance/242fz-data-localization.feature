@core
# Tier: @core
# Load-bearing for: Legal/compliance for Russia
# Psychological intent: Trust: users feel safe when data handling is explicit and respectful.
# MVP scope (preserve effect):
# - Store RU personal data on RU-hosted infrastructure (as required).
# - Show clear consent + privacy policy links at account creation.
# - Support account deletion request.
# Pitfalls / anti-patterns:
# - This is not legal advice; confirm requirements with counsel.
Feature: RU Data Localization and User Rights (242-FZ)
  As a product operating in Russia
  I want user personal data handled lawfully and transparently
  So that the product can operate and users can trust it

  Background:
    Given some categories of personal data may be subject to RU data-localization requirements
    And this feature file captures product requirements (not legal advice)

  Scenario: Account creation explains data handling
    Given a user is creating an account
    Then they see links to:
      """
      - Privacy Policy
      - Terms of Service
      """
    And they must actively consent (checkbox)
    And the consent text is clear and not hidden

  Scenario: Personal data is stored on RU-hosted infrastructure (requirement)
    Given a user in Russia provides personal data (e.g., email)
    Then the system stores required personal data on infrastructure located in Russia
    And access is logged

  Scenario: User can request account deletion
    Given a logged-in user opens Account Settings
    When they request deletion
    Then the app explains what will be deleted
    And the request is processed within a defined timeframe (policy)
