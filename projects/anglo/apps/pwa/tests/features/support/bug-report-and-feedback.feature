@retention
# Tier: @retention
# Load-bearing for: Iteration velocity
# Psychological intent: Users feel heard; reduces negative reviews.
# MVP scope (preserve effect):
# - In-app feedback form + screenshot
# - Auto-attach device/app version
Feature: Bug Reporting and User Feedback
  As a user
  I want to report issues and suggest features
  So that the app improves

  Background:
    Given a user encounters an issue or has an idea
    And feedback system is accessible

  @v2
  Scenario: Feedback button in settings
    Given a user goes to Settings
    When they view the Help section
    Then options appear:
      """
      - "Report a Bug"
      - "Suggest a Feature"
      - "Send Feedback"
      - "Contact Support"
      - "FAQ" (link to docs)
      """

  @retention @stub
  Scenario: Report bug flow
    Given user clicks "Report a Bug"
    When the form opens
    Then fields:
      """
      - Bug description (text area)
      - Steps to reproduce (optional)
      - Screenshot attachment (optional)
      - Device info auto-filled (model, OS version, app version)
      - Email auto-filled
      - Category dropdown: (Exercise issue, Offline problem, Payment, Other)
      - "Submit" button
      """

  @v2
  Scenario: Bug submission
    Given the bug form is filled out
    When user clicks "Submit"
    Then :
      """
      - Bug ticket created in support system
      - User receives confirmation: "Bug report submitted - #12345"
      - Copy of report emailed
      - Expected response time: "We'll investigate within 24 hours"
      """

  @v2
  Scenario: Feature suggestion flow
    Given user clicks "Suggest a Feature"
    When the form opens
    Then fields:
      """
      - Feature title
      - Description (what, why, how)
      - Use case (why do you need this?)
      - Priority (Nice to have, Important, Critical)
      - Device/platform (if relevant)
      - Email auto-filled
      - "Submit" button
      """

  @v2
  Scenario: Feature suggestion submission
    Given feature form is complete
    When submitted
    Then :
      """
      - Suggestion recorded
      - Confirmation: "Thanks for the suggestion!"
      - Message: "We review all feedback"
      - Can reference suggestion ID later
      """

  @retention @stub
  Scenario: General feedback
    Given user clicks "Send Feedback"
    When form opens
    Then simple form:
      """
      - Feedback text (what did you like/dislike?)
      - Satisfaction rating: 😞 😐 😊 😄 😍
      - Optional: how can we improve?
      - Email
      - "Send" button
      """

  @v2
  Scenario: Feedback rating
    Given user fills general feedback
    When they select a satisfaction emoji
    Then their rating is recorded
    And triggered actions (optional):
      """
      - If 😞 or 😐: offer to contact support
      - If 😍: encourage sharing app
      """

  @v2
  Scenario: Crash report (automatic)
    Given app crashes
    When user reopens app
    Then a prompt:
      """
      - "We noticed the app crashed"
      - "Would you like to send a crash report?"
      - Include message: crash logs auto-attached
      - Yes/No options
      """

  @v2
  Scenario: Crash report details
    Given user agreed to send crash report
    When submitted
    Then :
      """
      - Stack trace captured
      - Device info included
      - App version, OS version
      - Last action taken
      - Report sent to analytics
      """

  @v2
  Scenario: Support contact form
    Given user clicks "Contact Support"
    When form opens
    Then :
      """
      - Issue type dropdown: (Account, Payment, Technical, Other)
      - Email (auto-filled)
      - Subject
      - Detailed description
      - Account verification (for sensitive issues)
      - Priority (Urgent, High, Normal)
      - "Submit" button
      """

  @v2
  Scenario: Support ticket creation
    Given support form is submitted
    When processed
    Then :
      """
      - Support ticket created
      - User gets ticket ID: "SUPPORT-54321"
      - Email confirmation
      - Expected response: "Within 48 hours"
      - Can reference ticket ID for follow-up
      """

  @v2
  Scenario: Feedback history
    Given user has submitted feedback multiple times
    When they go to Settings → Feedback History
    Then they see:
      | Date | Type | Status | ID |
      | Today | Bug Report | Under Review | #12345 |
      | Yesterday | Feature | Considered | #12344 |
      | 3 days ago | Feedback | Reviewed | #12343 |
    And can view details of each

  @v2
  Scenario: In-app survey (optional)
    Given user completes lessons
    When they've learned for 3+ days
    Then optional survey popup (low frequency):
      """
      - "How is your experience?"
      - 3 quick questions
      - Takes <1 minute
      - Can skip
      - Data collected for product improvement
      """

  @v2
  Scenario: Feedback notification
    Given user submitted feedback
    When support reviews/responds
    Then optional notification:
      """
      - "We've reviewed your feedback"
      - Link to see response
      - Only for high-priority issues
      """

  @v2
  Scenario: Public roadmap (optional)
    Given features are suggested
    When user views Settings → Roadmap
    Then (if implemented):
      """
      - See planned features
      - Vote on upcoming features
      - See feature status: (Planned, In Progress, Completed)
      - Transparency about product direction
      """
