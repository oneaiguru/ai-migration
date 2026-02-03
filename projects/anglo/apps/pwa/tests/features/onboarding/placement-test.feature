@core
# Tier: @core
# Load-bearing for: Credibility signal (real course) + Personalization
# Psychological intent: Avoids boredom for experienced learners; creates 'this is serious' assessment moment.
# MVP scope (preserve effect):
# - Optional placement test from welcome/onboarding.
# - Outputs CEFR-ish band (A1/A2/B1) + starting unit.
# - Allows review of earlier units.
# Pitfalls / anti-patterns:
# - Don't lock users out of basics after placement.
# - Don't overpromise accuracy; show 'estimate'.
# Success signals:
# - Completion rate of placement test
# - Retention of placed users vs forced Unit 1
Feature: Placement Test / Level Assessment
  As a user with prior English knowledge
  I want to take a placement test
  So that I can start at the appropriate level instead of Unit 1 Basics

  Background:
    Given the app is launched for the first time
    And the user is on the welcome screen

  @core @stub
  Scenario: Placement test option is offered
    Given a user indicates they have previous English knowledge
    When they select "I already know some English"
    Then a dialog appears: "Take a quick placement test?"
    And options are "Start Test" and "Start from Basics"

  @core @stub
  Scenario: User completes placement test
    Given the user chose "Start Test"
    When they are presented with 10 assessment questions
    And the questions progress from A1 (basic) to B1 (intermediate)
    And they answer 7 questions correctly
    Then the system calculates their approximate level
    And shows result: "You're at approximately A2 level"
    And offers to start at Unit 3 (where A2 content begins)

  @core @stub
  Scenario: User can skip placement test
    Given the placement test is offered
    When the user clicks "Start from Basics"
    Then the test is skipped
    And they begin Unit 1 Lesson 1

  @core @stub
  Scenario: User can retake placement test
    Given a user has already taken the placement test
    When they access Settings → "Assessment"
    Then I should see "Retake Placement Test" option
    And clicking it allows them to re-assess
    And their level can be updated

  @core @stub
  Scenario: Skip-ahead based on placement
    Given a user achieved "B1 level" on placement test
    When they begin lessons
    Then Units 1 and 2 are marked "Completed" (grayed out)
    And Unit 3 is unlocked and ready to start
    And they can still review earlier units if desired
