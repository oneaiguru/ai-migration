@retention
# Tier: @retention
# Load-bearing for: Compliance + Trust
# Psychological intent: Gives users control; reduces anxiety about data and identity.
# MVP scope (preserve effect):
# - Edit display name/avatar (optional).
# - Sign out.
# - Request account deletion (compliance).
# Pitfalls / anti-patterns:
# - Don't hide deletion or privacy controls.
# Success signals:
# - Support tickets on account control
Feature: Account Settings (Control and Trust)
  As a learner
  I want basic account controls
  So that I can manage my identity and data safely

  Background:
    Given the learner may be logged in
    And account settings are available from Profile → Settings

  Scenario: Learner can change display name
    Given a logged-in learner opens Account Settings
    When they update their display name
    Then the new name is saved
    And it appears on their profile

  Scenario: Learner can sign out
    Given a logged-in learner opens Account Settings
    When they tap "Sign out"
    Then the session ends
    And the learner returns to the welcome screen
    And local progress remains on-device (until cleared)

  @core
  Scenario: Learner can request account deletion (compliance)
    Given a logged-in learner opens Account Settings
    When they tap "Delete account"
    Then the app explains the impact in plain language
    And asks for confirmation
    And the deletion request is submitted

  @v2
  Scenario: Change email (optional)
    Given a learner is logged in
    When they change their email
    Then they must verify the new email
