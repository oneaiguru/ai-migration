@v2 @future
# Tier: @v2
# Load-bearing for: Marketing ops
# Psychological intent: Discounts/referrals.
Feature: Promo Codes and Referral Bonuses
  As a user
  I want to redeem promo codes
  So that I can get discounts or free Max time
  Note: Promo codes are post-launch (v2+ scope).

  Background:
    Given promo code system is implemented
    And codes can be generated for marketing

  @v2
  Scenario: Promo code entry in Max upgrade
    Given user goes to upgrade screen
    When they view pricing
    Then a "Have a code?" link or field:
      """
      - Tap to enter promo code
      - Text input field appears
      - Example: "WELCOME2026"
      """

  @v2
  Scenario: Valid promo code redemption
    Given user enters promo code "WELCOME2026"
    When they click "Apply"
    Then :
      """
      - Code validated on server
      - If valid: discount applied
      - Price updates: "500 RUB → 250 RUB (50% off)"
      - "Promo code applied ✓"
      - Can proceed to checkout
      """

  @v2
  Scenario: Invalid promo code
    Given user enters invalid code "INVALID123"
    When they click "Apply"
    Then error:
      """
      - "Promo code not found or expired"
      - "Check the code and try again"
      - Can retry with different code
      """

  @v2
  Scenario: Expired promo code
    Given code "OLDCODE" is expired (end date passed)
    When user tries to redeem
    Then error:
      """
      - "This promo code has expired"
      - "Date: was valid until March 10, 2026"
      """

  @v2
  Scenario: One-time use code
    Given code "UNIQUE123" is single-use
    When user redeems it
    Then :
      """
      - Code applied successfully
      - Discount awarded
      - Code marked as used
      - If another user tries: "Code already used"
      """

  @v2
  Scenario: Limited quantity code
    Given code "LIMITED" has limit of 100 uses
    When 100 users redeem it
    Then 101st user gets:
      """
      - "Promo code limit reached"
      """

  @v2
  Scenario: Referral code generation
    Given user goes to Settings → Referral
    When they view referral options
    Then :
      """
      - Unique referral code: "ALEX2026"
      - Message: "Share this code to earn bonuses"
      - Copy button
      - Share to Telegram/VK buttons
      """

  @v2
  Scenario: Referral bonus for referrer
    Given user shared code "ALEX2026"
    When a new user signs up with code
    Then original user gets:
      """
      - "+1 week Max free" (or XP bonus)
      - Notification: "Friend signed up with your code!"
      - Bonus added to account
      - Can see referral stats: "Referred: 3, Bonuses earned: 3 weeks Max"
      """

  @v2
  Scenario: Referral bonus for referee
    Given new user signs up with referral code
    When they create account
    Then new user gets:
      """
      - "+3 days Max free"
      - Notification: "Welcome bonus: 3 days Max!"
      - Can start immediately
      """

  @v2
  Scenario: Referral limit
    Given user has generated referrals
    When they check referral stats
    Then :
      """
      - Total referrals: unlimited
      - Bonuses earned: capped at "X bonuses per month" (e.g., 5)
      - "You've earned 5 bonuses this month - limit reached"
      """

  @v2
  Scenario: Campaign-specific codes
    Given marketing campaign (e.g., "Spring promo")
    When codes are created: "SPRING50", "SPRING30"
    Then each code:
      """
      - Has specific discount (50%, 30%)
      - Valid date range
      - Usage limit
      - Can be tracked in analytics
      """

  @v2
  Scenario: Promo code analytics
    Given codes deployed
    When viewed in admin dashboard
    Then metrics shown:
      """
      - Code: "WELCOME2026"
      - Created: 2026-01-04
      - Discount: 50%
      - Redemptions: 234 / 500 limit
      - Revenue impact: tracked
      - Most popular codes highlighted
      """

  @v2
  Scenario: Birthday promo code
    Given user has birthday on file (optional)
    When their birthday arrives
    Then auto-generated code:
      """
      - "HAPPY_BDAY_[YEAR]"
      - 20% off Max
      - Valid for 7 days
      - Sent via email/in-app notification
      """

  @v2
  Scenario: Influencer code
    Given influencer/partner program
    When an influencer is given code "INFLUENCER_ALEX"
    Then :
      """
      - Code generates high discount (30-50%)
      - Influencer can share with followers
      - Both get bonuses on redemption
      - Tracked separately for influencer rewards
      """
