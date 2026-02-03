@v2
# Tier: @v2
# Load-bearing for: Monetization
# Psychological intent: One-time purchase option
Feature: Lifetime Purchase (Founder Offer)
  As an early adopter
  I want to buy lifetime Max access
  So that I never have to pay a subscription again

  Background:
    Given the app is in launch window (first 30-60 days)
    And lifetime purchase offer is active

  @v2
  Scenario: Lifetime offer visibility during launch
    Given the user is viewing Max upgrade
    When Max pricing is shown
    Then a special offer appears:
      | Plan | Price | Period |
      | Monthly | 500 RUB | 1 month |
      | Annual | 5,500 RUB | 1 year |
      | **Lifetime** | **1,500 RUB** | **Forever** |
    And "Launch Special" badge on lifetime option
    And "Limited time only" warning below

  @v2
  Scenario: Lifetime offer expires
    Given the launch window (30-60 days)
    When the launch period ends
    Then :
      """
      - Lifetime option disappears
      - Annual/Monthly remain
      - Message: "Founder offer has ended"
      - Users who purchased lifetime keep it forever
      """

  @v2
  Scenario: User purchases lifetime
    Given the lifetime option is visible
    When the user clicks "Buy Lifetime"
    Then :
      """
      - One-time payment of 1,500 RUB
      - Confirmation: "Max for life?"
      - Payment method selected (Mir/SBP/Card)
      - Single charge (no recurring)
      """

  @v2
  Scenario: Lifetime activation
    Given a lifetime purchase completes
    When payment succeeds
    Then :
      """
      - Max status: "Max Lifetime ⭐"
      - No expiration shown
      - All Max features unlocked
      - Email: "Congratulations on lifetime access!"
      """

  @v2
  Scenario: Lifetime never expires
    Given a user purchased lifetime
    When years pass (1 year, 5 years, etc.)
    Then :
      """
      - Max access continues indefinitely
      - No renewal payments
      - No expiration notifications
      - Status always shows "Lifetime"
      """

  @v2
  Scenario: Lifetime cannot be downgraded
    Given a lifetime user
    When they view subscription settings
    Then :
      """
      - No cancel/downgrade option
      - Text: "Lifetime Max - Forever"
      - Only account deletion would end it
      """

  @v2
  Scenario: Lifetime transferability
    Given a user with lifetime access
    When they delete their account
    Then :
      """
      - Lifetime access is lost
      - Not transferable to another account
      - Warning: "Deleting account loses lifetime access"
      """

  @v2
  Scenario: Marketing of lifetime offer
    Given the lifetime option exists
    When the launch marketing happens
    Then positioning:
      """
      - "Founder Lifetime Access"
      - "Pay once, learn forever"
      - "Limited to launch period only"
      - Creates urgency
      """

  @v2
  Scenario: Lifetime holders early recognition
    Given users who purchased lifetime
    When their profile is viewed
    Then they have:
      """
      - Special badge: "Lifetime Founder" 👑
      - Appears on profile and leaderboard
      - Community recognition
      """

  @v2
  Scenario: Lifetime value comparison
    Given monthly subscription 500 RUB
    And annual subscription 5,500 RUB
    When lifetime is compared
    Then :
      """
      - Monthly total after 3 years: 18,000 RUB
      - Lifetime savings clear
      - "Lifetime pays for itself in 3 months" messaging
      """
