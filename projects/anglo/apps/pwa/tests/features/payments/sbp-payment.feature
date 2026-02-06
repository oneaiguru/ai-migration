@core
# Tier: @core
# Load-bearing for: Payments rail
# Psychological intent: SBP payments
Feature: SBP (Faster Payments System) Integration
  As a Russian user
  I want to pay with SBP
  So that I can instantly pay from my bank account

  Background:
    Given a user is on the payment screen
    And SBP payment option is available

  @core
  Scenario: SBP payment option visible
    Given the payment methods are displayed
    When the user views payment options
    Then SBP shows:
      """
      - Logo: 💳 "Система быстрых платежей (СБП)"
      - Description: "Instant transfer from your bank"
      - "Select" button
      """

  @core
  Scenario: User selects SBP payment
    Given the user clicks SBP option
    When the payment screen updates
    Then :
      """
      - Amount shown: "500 RUB"
      - QR code displayed for scanning
      - Or: "Open in your bank app" button
      - Instructions: "Scan with your bank's app"
      """

  @core
  Scenario: User scans QR code
    Given the SBP QR code is displayed
    When the user opens their bank app (Sber, Yandex, etc.)
    And scans the QR code
    Then the bank app opens payment screen:
      """
      - Payee: "english.dance"
      - Amount: "500 RUB"
      - Reference: order number
      - User confirms in bank app
      """

  @core
  Scenario: Bank app payment confirmation
    Given the payment details are shown in bank app
    When the user confirms payment (via PIN or biometric)
    Then :
      """
      - Bank processes immediately
      - SBP system confirms
      - App receives confirmation
      - Success screen appears: "Платеж выполнен!"
      """

  @core
  Scenario: SBP bank-app handoff + return (TWA)
    Given the user is in the TWA checkout
    When they tap "Open in your bank app"
    Then the bank app opens for confirmation
    And the user can return to the TWA after payment
    And the app resumes on the confirmation screen

  @core
  Scenario: Instant confirmation with SBP
    Given an SBP payment is submitted
    When the bank confirms
    Then :
      """
      - Max activated within 10 seconds (p95)
      - No waiting for settlement
      - Email receipt sent instantly
      - "You're now Max!" message
      """

  @core
  Scenario: Alternative: Direct account entry
    Given SBP is selected
    When the user doesn't want to scan
    And they tap "Enter account details manually"
    Then form appears:
      """
      - Phone number linked to bank account
      - Bank selection dropdown
      - "Send payment code" button
      """
    And they receive SMS code to confirm

  @core
  Scenario: SBP no saved payment method
    Given SBP payment philosophy
    When a payment completes
    Then :
      """
      - No card/account stored
      - Each payment requires fresh authentication
      - User confirms in bank app each time
      - Maximum security, no stored payment data
      """

  @core
  Scenario: SBP limits and daily caps
    Given some banks have SBP daily limits
    When a user attempts payment exceeding limit
    Then error:
      """
      - "Payment exceeds your daily SBP limit"
      - "Limit: 500,000 RUB/day"
      - Suggestion: "Try tomorrow or use another method"
      """

  @core
  Scenario: SBP timeout handling
    Given a user initiated SBP payment
    When the bank doesn't respond within 5 minutes
    Then :
      """
      - "Payment pending - checking status"
      - App checks backend every 10 seconds
      - If confirmed, success shows
      - If timeout, "Retry" option appears
      """

  @core
  Scenario: SBP support multiple banks
    Given users have accounts at various banks
    When SBP payment is used
    Then it works with:
      """
      - Sberbank
      - Yandex.Kassa
      - Raiffeisenbank
      - Other Russian banks with SBP support
      """
    And user selects their bank

  @core
  Scenario: SBP transaction confirmation
    Given a payment completed via SBP
    When the user checks their bank
    Then they see:
      """
      - Transaction: "english.dance"
      - Amount: "500.00 RUB"
      - Type: "СБП платеж" (SBP transfer)
      - Status: "Завершен" (Complete)
      """
