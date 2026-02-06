@v2
# Tier: @v2
# Load-bearing for: Operations
# Psychological intent: Refund handling
Feature: Payment Refunds and Chargebacks
  As a customer
  I want to be able to refund my purchase
  So that I can get my money back if needed

  Background:
    Given a user made a recent payment
    And refund policy is in place (7-14 day window)

  @v2
  Scenario: Refund request within grace period
    Given a user purchased Max 2 days ago
    When they view Settings → Subscription → "Refund"
    Then a form appears:
      """
      - "Request Refund"
      - Reason dropdown: (changed mind, prefer free tier, too expensive, etc.)
      - Optional notes field
      - "Request Refund" button
      """

  @v2
  Scenario: Refund grace period explained
    Given the refund form is displayed
    When the user reads the policy
    Then it states:
      """
      - "7-day refund window from purchase"
      - "Refunds processed within 5-7 business days"
      - "Subscription will be cancelled"
      - All Max features will be revoked
      """

  @v2
  Scenario: Refund processing
    Given a refund request is submitted
    When the request is approved (automatic or manual)
    Then :
      """
      - Email confirmation sent
      - "Refund approved for 500 RUB"
      - Refund amount returned to original payment method
      - Max access ends immediately
      """

  @v2
  Scenario: Refund after grace period
    Given a user purchased 10 days ago (outside 7-day window)
    When they request refund
    Then :
      """
      - Message: "Refund window closed"
      - "Refunds only available within 7 days of purchase"
      - Option: "Cancel subscription" (no refund)
      """

  @v2
  Scenario: Annual plan refund
    Given a user purchased annual plan (5,500 RUB)
    When they request refund within grace period
    Then :
      """
      - Refund approved: 5,500 RUB
      - Returned to payment method
      - Max revoked immediately
      - Email sent
      """

  @v2
  Scenario: Lifetime plan no refund
    Given a user purchased lifetime access
    When they request refund
    Then :
      """
      - Message: "Lifetime purchases are final"
      - "No refunds available"
      - Only option: contact support for special case
      """

  @v2
  Scenario: Chargeback handling
    Given a user disputes a charge with their bank
    When a chargeback is initiated
    Then :
      """
      - App is notified by payment processor
      - User account is flagged
      - Max access suspended
      - Email: "Chargeback dispute received"
      """

  @v2
  Scenario: Chargeback reversal
    Given a chargeback is in dispute
    When the user wins the dispute (proves fraud or legitimate reason)
    Then :
      """
      - Chargeback reversed
      - Max access restored
      - User notified
      """
    And if user loses:
      """
      - Chargeback upheld
      - Refund final
      - Account may be locked
      """

  @v2
  Scenario: Chargeback fraud protection
    Given repeated chargebacks from one user
    When multiple chargebacks detected
    Then :
      """
      - Account may be blocked
      - Email warning sent
      - Further payments rejected
      - Support intervention required
      """

  @v2
  Scenario: Failed payment retry
    Given a recurring payment failed (card expired, etc.)
    When the payment processor retries
    Then :
      """
      - Retry scheduled: 1 day, 3 days, 7 days
      - User emailed: "Payment failed - update method"
      - Link to update payment provided
      """
    And if all retries fail:
      """
      - Max cancelled
      - Downgraded to free tier
      """

  @v2
  Scenario: Refund transparency
    Given a user reviews their receipt
    When they view Settings → "Billing History"
    Then they see:
      | Date | Transaction | Amount | Status |
      | Mar 10 | Max Monthly | 500 RUB | Completed |
      | Mar 17 | Refund | -500 RUB | Completed |
    And all transactions are visible and auditable

  @v2
  Scenario: Tax refund documentation
    Given a refund is processed
    When the user requests documentation
    Then they receive:
      """
      - Invoice showing original charge
      - Refund confirmation
      - For Russian tax purposes if needed
      - Email with PDF attachments
      """
