@v2
# Tier: @v2
# Load-bearing for: Quality polish
# Psychological intent: Comfort and inclusivity; not required for loop.
# MVP scope (preserve effect):
# - Light/dark theme
# - Basic accessibility toggles
Feature: Theme Selection and Accessibility Settings
  As a user with preferences
  I want to customize appearance and accessibility
  So that the app is comfortable for me to use

  Background:
    Given a user is in Settings
    And UI preferences are available

  @v2
  Scenario: Theme selection
    Given a user goes to Settings → Theme
    When they view theme options
    Then options appear:
      """
      - "Light Mode" (default)
      - "Dark Mode"
      - "Auto" (follows system setting)
      """
    And user can select preferred theme

  @v2
  Scenario: Light theme
    Given light theme is selected
    When the app displays
    Then :
      """
      - Background: white
      - Text: dark color
      - Buttons: normal contrast
      - Images: not inverted
      - Battery efficient (white pixels on OLED use power)
      """

  @v2
  Scenario: Dark theme
    Given dark theme is selected
    When the app displays
    Then :
      """
      - Background: dark gray/black
      - Text: light gray/white
      - Buttons: subtle light colors
      - Images: slightly desaturated if needed
      - Easier on eyes in low light
      - Battery efficient on OLED devices
      """

  @v2
  Scenario: Auto theme switching
    Given auto theme selected
    When system-wide theme changes (day/night)
    Then :
      """
      - App automatically switches
      - Light during day
      - Dark during night
      - Smooth transition
      """

  @v2
  Scenario: Font size adjustment
    Given accessibility considerations
    When user goes to Settings → Font Size
    Then options:
      """
      - "Small" (-20%)
      - "Normal" (default)
      - "Large" (+20%)
      - "Extra Large" (+40%)
      """
    And user selects preference

  @v2
  Scenario: Text scaling applied
    Given large font size selected
    When the app displays
    Then :
      """
      - All text scaled proportionally
      - Layout adjusted to fit
      - No text cut off
      - Buttons appropriately sized
      """

  @v2
  Scenario: Bold text option
    Given accessibility settings
    When user enables "Bold Text"
    Then :
      """
      - All text becomes bolder
      - Better readability
      - Especially helpful for low vision
      """

  @v2
  Scenario: High contrast mode
    Given accessibility setting
    When user enables "High Contrast"
    Then :
      """
      - Text: darkest/lightest possible
      - Backgrounds: maximum contrast
      - Borders: more pronounced
      - Colors adjusted for visibility
      """

  @v2
  Scenario: Reduce motion option
    Given animation preferences
    When user goes to Settings → Animations
    And enables "Reduce Motion"
    Then :
      """
      - Animations disabled/minimized
      - Page transitions instant
      - No parallax effects
      - Helpful for motion-sensitive users
      """

  @v2
  Scenario: Screen reader compatibility
    Given accessibility features
    When screen reader is enabled
    Then :
      """
      - All buttons/text are labeled
      - Images have alt text
      - Forms are properly marked
      - Navigation is logical
      - Screen reader can read app content
      """

  @v2
  Scenario: Color blindness support
    Given color as only differentiator
    When user enables "Color Blind Mode"
    Then :
      """
      - Success/error indication not only green/red
      - Icons and text labels added
      - High contrast colors
      - Support for Deuteranopia, Protanopia, Tritanopia
      """

  @v2
  Scenario: Dyslexia-friendly font
    Given reading difficulties
    When user enables "Dyslexia-Friendly Font"
    Then :
      """
      - Font changes to OpenDyslexic or similar
      - Increased letter spacing
      - Larger baseline height
      - More distinctive letter shapes
      """

  @v2
  Scenario: Caption settings
    Given videos/audio content
    When user goes to Settings → Captions
    Then options:
      """
      - "Off"
      - "English" (exercise English transcription)
      - "Russian" (translation)
      - "Both"
      """
    And user selects preference

  @v2
  Scenario: Haptic feedback control
    Given vibration feedback on actions
    When user goes to Settings → Haptics
    Then options:
      """
      - "Off"
      - "Light"
      - "Medium" (default)
      - "Strong"
      """
    And feedback adjusts per setting

  @v2
  Scenario: Audio cues option
    Given audio feedback on completion
    When user enables/disables "Audio Cues"
    Then :
      """
      - Completion sounds play/don't play
      - Error sounds play/don't play
      - Can customize per event
      """

  @v2
  Scenario: Profile with preferences saved
    Given accessibility settings configured
    When user logs in on new device
    Then :
      """
      - All preferences sync
      - Theme, font size, etc. applied
      - Consistent experience across devices
      """

  @v2
  Scenario: Default accessibility standards
    Given the app in development
    When built
    Then :
      """
      - WCAG 2.1 AA compliance target
      - Color contrast ratios met
      - Touch targets at least 44x44px
      - Keyboard navigation supported
      - Focus indicators visible
      """
