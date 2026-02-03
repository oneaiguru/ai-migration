@retention
# Tier: @retention
# Load-bearing for: Convenience
# Psychological intent: Keeps habit going in poor connectivity; supports RU constraints.
# MVP scope (preserve effect):
# - Offline indicator.
# - Finish lesson offline and queue for sync.
Feature: Offline Lesson Completion
  As a user in an area with unreliable connectivity
  I want to complete lessons offline
  So that I can keep learning without internet

  Background:
    Given the PWA has service worker configured
    And lesson content is cached locally
    And the user has downloaded course packs (Max or small free packs)

  @retention @stub
  Scenario: Offline indicator on app
    Given the app is running
    When internet connectivity is lost
    Then an indicator appears:
      """
      - Status bar: "Offline mode 📡❌"
      - In red/warning color
      - Clear and non-intrusive
      """

  @v2
  Scenario: Offline mode allows lesson completion
    Given a user is offline
    When they start a cached lesson
    Then :
      """
      - Lesson loads from local cache
      - No API calls attempted
      - User can complete full lesson
      - Exercises work as normal
      """

  @v2
  Scenario: Offline lesson is saved locally
    Given a user completes a lesson offline
    When the lesson finishes
    Then :
      """
      - Progress is saved locally (IndexedDB)
      - XP, streak updated locally
      - Message: "Progress saved locally - will sync when online"
      - No error or popup
      """

  @v2
  Scenario: Multiple exercises offline
    Given a user has 3+ lessons cached
    When they are offline
    Then they can:
      """
      - Start multiple lessons
      - Switch between them
      - View progress for all
      - All work smoothly
      """

  @v2
  Scenario: Offline exercises show full functionality
    Given an offline lesson is active
    When the user does exercises
    Then all exercise types work:
      """
      - Translate tap: word buttons work
      - Translate type: keyboard input works
      - Listen: audio plays from cache
      - Match pairs: drag/tap works
      """
    And no features are missing

  @v2
  Scenario: Offline does not lose hearts/data
    Given hearts are enabled
    And a free user going offline with 2 hearts
    When they complete lesson offline and lose heart
    Then :
      """
      - Hearts updated locally
      - Data persists
      - When back online, sync is consistent
      """

  @retention @stub
  Scenario: App detects when back online
    Given the user was offline and now has connectivity
    When the connection is restored
    Then :
      """
      - Status indicator updates: "Sync in progress..."
      - App attempts to sync cached data to server
      - Progress is reconciled
      """

  @retention @stub
  Scenario: Clear offline/online indicator
    Given offline mode is active
    When the user goes online
    Then :
      """
      - Indicator updates: "Online ✓"
      - Turns green
      - Continues syncing in background
      """

  @retention @stub
  Scenario: Download course packs for offline
    Given a Max user wants offline access
    When they view Unit 1
    And tap "Download for Offline"
    Then :
      """
      - Download starts
      - Progress bar: "Downloading... 45%"
      - Size: "~120 MB for Unit 1"
      - Estimate time: "2-3 minutes on WiFi"
      """

  @v2
  Scenario: Offline packs storage management
    Given downloaded offline packs take storage
    When a user views "Offline Content"
    Then they see:
      """
      - Downloaded units and sizes
      - "Unit 1: ✓ 120 MB"
      - "Unit 2: ✓ 115 MB"
      - "Total offline: 235 MB / 500 MB available"
      """
    And can delete packs to free space

  @v2
  Scenario: Partial offline functionality
    Given the app supports graceful degradation
    When a feature is not available offline
    Then a clear message:
      """
      - "Leaderboard requires internet"
      - "Coming back online will update"
      - Not a blocker for learning
      """

  @v2
  Scenario: Offline notifications disabled
    Given offline mode
    When notifications are configured
    Then :
      """
      - Push notifications won't work offline
      - Message: "Notifications unavailable offline"
      - Will resume when back online
      """

  @v2
  Scenario: Network interruption during lesson
    Given a user is doing a lesson
    When the network suddenly drops
    Then :
      """
      - "Connection lost" indicator appears
      - Lesson continues locally
      - Answer is saved locally
      - Next "Check" doesn't crash
      """
