@core
# Tier: @core
# Load-bearing for: Payments rail
# Psychological intent: RU card payments
Feature: Mir Card Payment Integration
  As a Russian user with a Mir card
  I want to pay with Mir
  So that I can subscribe to Max using my local payment method

  Background:
    Given a user is on the payment screen
    And Mir card payment option is available

  @core
  Scenario: Mir payment option is visible
    Given the payment methods are displayed
    When the user views payment options
    Then they see:
      | Payment Method | Logo | Option |
      | Mir Card | 🔷 Mir | Select |
      | SBP | 💳 SBP | Select |

  @core
  Scenario: User enters Mir card details in web checkout
    Given the user selects Mir payment
    When the provider-hosted checkout page opens
    Then fields are shown:
      """
      - Card Number (16 digits)
      - Expiry (MM/YY)
      - CVV (3 digits)
      - Cardholder Name
      """
    And instructions in Russian: "Введите данные карты"

  @core
  Scenario: Mir card validation
    Given the user enters card details
    When they click "Pay"
    Then validation occurs:
      """
      - Card number: must be 16 digits, Mir BIN check
      - Expiry: must be future date
      - CVV: must be 3 digits
      """
    And errors shown for invalid fields

  @core
  Scenario: 3D Secure verification
    Given a valid Mir card is entered
    When the payment is submitted
    Then the bank's 3D Secure page appears:
      """
      - "Confirm payment"
      - "Amount: 500 RUB"
      - User enters SMS or app confirmation
      """
    And after verification, payment completes

  @core
  Scenario: Mir payment success
    Given 3D Secure verification passed
    When the transaction completes
    Then
      """
      - Success page: "Платеж выполнен успешно!"
      - Confirmation number shown
      - Receipt email sent
      - Max activated within 10 seconds
      """

  @core
  Scenario: Mir payment declined
    Given insufficient funds or card issue
    When the transaction is declined
    Then error screen:
      """
      - "Платеж отклонен" (Payment declined)
      - Reason: "Insufficient funds" or generic
      - "Try another method" option
      - "Back" to retry
      """

  @core
  Scenario: Mir currency and fees
    Given pricing in Russian Rubles
    When a user pays with Mir
    Then
      """
      - Price shown: "500 RUB"
      - No foreign transaction fees
      - No currency conversion
      - Clear local pricing
      """

  @core
  Scenario: Mir payment statement
    Given a user made a Mir payment
    When they check their bank statement
      Then they see:
      """
      - Merchant: "english.dance"
      - Amount: "500.00 RUB"
      - Date: transaction date
      - Status: "Completed"
      """
