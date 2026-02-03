# Feature Scenarios

## compliance/242fz-data-localization.feature
Feature: RU Data Localization and User Rights (242-FZ)

- Scenario: Account creation explains data handling | Summary: a user is creating an account; they must actively consent (checkbox)
- Scenario: Personal data is stored on RU-hosted infrastructure (requirement) | Summary: a user in Russia provides personal data (e.g., email); the system stores required personal data on infrastructure located in Russia
- Scenario: User can request account deletion | Summary: a logged-in user opens Account Settings; they request deletion

## gamification/achievements.feature
Feature: Achievements and Badges

- Scenario: First lesson achievement | Summary: a new user completes their first lesson; the lesson completes
- Scenario: Unit completion achievements | Summary: a user completes Unit 1; the final lesson ends
- Scenario: Streak milestones | Summary: streak-based achievements; each is unlocked with celebration
- Scenario: Perfect lesson achievement | Summary: a user completes a lesson with 0 mistakes; all 12 exercises are answered correctly

## gamification/daily-challenges.feature
Feature: Daily Quests (Challenges)

- Scenario: Quests are visible in a dedicated tab | Summary: a learner opens the home screen; they tap "Quests"
- Scenario: Quests can be completed through normal learning | Summary: a quest is "Finish 1 lesson"; the learner finishes a lesson
- Scenario: Completing all quests grants a small reward | Summary: a learner completes all 3 quests today; they receive a reward (configurable)
- Scenario: Missing quests has no penalty | Summary: a learner completes 0 quests today; the next day begins

## gamification/leaderboard.feature
Feature: Leaderboard and Competitive Rankings

- Scenario: Weekly XP leaderboard view | Summary: the user opens the "Leaderboard" tab; they view the default leaderboard
- Scenario: User highlighted on leaderboard | Summary: the leaderboard is displayed; the user finds themselves
- Scenario: View different leaderboard timeframes | Summary: the leaderboard is open; the rankings update accordingly
- Scenario: League-based tiers (optional progression) | Summary: a user is in Bronze League
- Scenario: Friend leaderboard | Summary: the user has added friends in the app; they tap "Friend Leaderboard"
- Scenario: Real-time position updates | Summary: the user is viewing the leaderboard; another user completes a lesson and gains XP
- Scenario: Streak leaderboard | Summary: different leaderboard types exist; the user selects "Streak Leaderboard"
- Scenario: Leaderboard rewards (cosmetic or functional) | Summary: weekly leaderboard resets; the week ends
- Scenario: Blocked users cannot be viewed | Summary: a user has blocked another user; they view the leaderboard
- Scenario: Regional / Language leaderboard | Summary: some users may be in different regions; a "Regional Leaderboard" option exists
- Scenario: Motivational notifications from leaderboard | Summary: the user is on the leaderboard but not in top 3; a daily reminder is sent
- Scenario: Max users have leaderboard advantage (optional) | Summary: a "Max Leaderboard" feature; Max users complete more lessons (no hearts limit when hearts are enabled)
- Scenario: Leaderboard resets and history | Summary: a weekly leaderboard cycle; a new week starts

## gamification/streak-freeze.feature
Feature: Streak Freeze (Grace Day)

- Scenario: Learner can equip one streak freeze | Summary: a learner owns 1 streak freeze; they open Streak settings
- Scenario: Freeze is consumed automatically on a missed day | Summary: a learner has "🔥 12"; they have 1 streak freeze equipped
- Scenario: Freeze is not consumed when the learner practices | Summary: a learner has a streak freeze equipped; they complete a qualifying activity today
- Scenario: Freeze can be earned through a milestone | Summary: a learner reaches a 7-day streak milestone; the milestone celebration appears
- Scenario: Freeze can be earned through quests | Summary: daily quests are enabled; a learner completes all quests for the day
- Scenario: Learner can equip two freezes for longer streaks | Summary: a learner has 2 streak freezes; they equip both

## gamification/streak-tracking.feature
Feature: Streak Tracking

- Scenario: New learners start with a 0-day streak | Summary: a new learner opens the app for the first time; they see a streak counter: "🔥 0"
- Scenario: First completed activity starts the streak | Summary: a learner has "🔥 0"; they complete their first intro lesson today
- Scenario: Streak increments only once per day | Summary: a learner has already completed a streak day today; they complete another lesson today
- Scenario: Missing a day resets the streak | Summary: a learner has an active streak: "🔥 5"; they have no streak freeze equipped
- Scenario: Day 10 milestone has elevated celebration | Summary: a learner has an active streak of 9 days; they complete a qualifying activity today
- Scenario: Best streak is tracked separately from current streak | Summary: a learner once reached a 30-day streak; their current streak is 12 days
- Scenario: Streak is not broken by mistake-limit mechanics | Summary: a learner is having a hard lesson and makes many mistakes; the learner completes a review session instead of new content
- Scenario: Streak is not lost due to offline completion | Summary: the learner completed a lesson offline; the device comes back online and sync succeeds
- Scenario: Streak is protected during incidents | Summary: an incident is active affecting lesson completion; a learner has a 15-day streak
- Scenario: Optional countdown timer until streak day ends | Summary: a learner completed today's streak day; they view the home screen later that day

## gamification/xp-earning.feature
Feature: Experience Points (XP) Earning

- Scenario: XP awarded for correct answer | Summary: a user submits a correct answer; the answer is marked correct
- Scenario: No XP for incorrect answer | Summary: a user submits an incorrect answer; the answer is marked wrong
- Scenario: Bonus XP for perfection | Summary: a user answers multiple questions perfectly in a row; they reach 5 correct answers without mistakes
- Scenario: XP multiplier on streak | Summary: a user has an active 10-day streak; they complete a lesson with +100 base XP
- Scenario: Lesson completion XP | Summary: a user completes an entire lesson (12 exercises); the lesson completion screen appears
- Scenario: Daily practice bonus | Summary: a user does their first lesson of the day; they complete it
- Scenario: Max users have no XP cap | Summary: a Max subscriber with unlimited access; they complete 10 lessons (1200+ XP)
- Scenario: XP is displayed consistently | Summary: XP is earned throughout the lesson; the user views their profile
- Scenario: XP history and log | Summary: a user has earned XP over multiple sessions; they view "XP History" or "Stats"
- Scenario: XP for non-lesson activities | Summary: various app activities; each activity awards appropriate XP
- Scenario: XP not lost on app crash | Summary: a user earned 50 XP in a lesson; the app crashes mid-lesson
- Scenario: XP visible immediately | Summary: a user answers correctly; the "+10 XP" indicator appears

## lessons/complete-lesson.feature
Feature: Complete Lesson

- Scenario: Lesson completion shows a satisfying summary | Summary: the learner completes the last exercise; the success screen appears
- Scenario: Completion screen offers the next best action | Summary: the learner finished a lesson; the completion screen appears
- Scenario: Completing a review also counts as a completed activity | Summary: a learner completes a review session; the completion screen still shows progress updates
- Scenario: Lesson completion persists across sessions | Summary: a lesson is completed; the app is closed and reopened

## lessons/exercise-fill-blank.feature
Feature: Fill in the Blank Exercise

- Scenario: Fill blank exercise structure | Summary: the exercise loads
- Scenario: Sentence with single blank | Summary: a simple sentence: "She _____ to the park"; the user taps the blank
- Scenario: User types correct answer | Summary: the blank is "_____ are you from?"; the correct answer is "Where"
- Scenario: User types incorrect answer | Summary: the blank is "_____ are you from?"; the user types "When" (wrong)
- Scenario: Case-insensitive matching | Summary: the correct answer is "Where"; the user types "where" (lowercase)
- Scenario: Synonym acceptance | Summary: the correct answer is "large"; synonyms include: ["big", "huge"]
- Scenario: Multiple blanks in one sentence | Summary: a sentence: "_____ _____ is your name?"; blanks are for "What" and "is"
- Scenario: Phrase fill instead of single word | Summary: sentence: "I'm _______ to the store"; correct answer is "going" (or could accept "about to go")
- Scenario: Help/Hint on fill blank | Summary: a difficult fill blank; the user clicks "Hint"
- Scenario: Free user heart penalty | Summary: hearts are enabled; a free user with 2 hearts

## lessons/exercise-listen.feature
Feature: Listen Exercise

- Scenario: Listen and tap exercise | Summary: the exercise loads; the audio has not played yet
- Scenario: Audio plays on user request | Summary: the exercise shows the play button; the user taps the play/audio button
- Scenario: User selects correct option after listening | Summary: the audio was: "Hello, how are you?"; the user taps the first option (the one they heard)
- Scenario: User selects wrong option | Summary: they heard "Hello, how are you?"; the user taps "Goodbye, how are you?"
- Scenario: Listen and type exercise | Summary: a "listen_type" exercise; the audio button is tapped
- Scenario: Audio plays automatically on some exercises | Summary: some exercises have auto-play enabled; the exercise loads
- Scenario: Pronunciation hints | Summary: a listen exercise with tricky English sounds; the user clicks "Pronunciation Tips"
- Scenario: User can play audio multiple times | Summary: a listen exercise is active; the user taps the play button 3 times
- Scenario: Audio quality and clarity | Summary: the audio recording; it should be clear, native speaker pronunciation
- Scenario: Hearing impairment accommodation | Summary: a listen exercise; the user has enabled "Captions" in settings
- Scenario: Free user hearts on listen exercise | Summary: hearts are enabled; a free user with 2 hearts

## lessons/exercise-match-pairs.feature
Feature: Match Pairs Exercise

- Scenario: Match pairs exercise layout | Summary: the exercise loads; all items are presented as cards/buttons
- Scenario: User matches pairs correctly | Summary: the left side has: ["кошка", "собака", "дом", "дерево", "рыба"]; the right side has (scrambled): ["fish", "tree", "house", "cat", "dog"]
- Scenario: User completes all pairs | Summary: the user has matched 4 out of 5 pairs; they tap "рыба" then "fish"
- Scenario: User can see connection lines (optional) | Summary: pairs are being matched; a pair is tapped
- Scenario: User can undo a match | Summary: the user has matched "кошка" with "cat"; they click an "Undo" button or tap the pair again
- Scenario: Wrong match detection (if strict mode) | Summary: the user tries to match "кошка" with "dog" (incorrect); they confirm this match
- Scenario: Hints available for match pairs | Summary: a user is struggling with matches; they click the "Hint" button
- Scenario: Match pairs with sentences | Summary: a more advanced exercise with full sentences; the left side has: ["Привет, как дела?", "Мне нравится кофе"]
- Scenario: Free user's wrong match penalty | Summary: hearts are enabled; a free user with 2 hearts
- Scenario: Match pairs timer (optional) | Summary: some match exercises have a timer; the exercise starts
- Scenario: Audio pronunciation on match pairs | Summary: a vocabulary-heavy match exercise; the user taps a word/phrase

## lessons/exercise-select-image.feature
Feature: Select Image Exercise

- Scenario: Select image exercise layout | Summary: the exercise loads
- Scenario: Simple word-to-image matching | Summary: the prompt: "dog"; images: [dog, cat, bird, fish]
- Scenario: User selects correct image | Summary: the prompt is "apple"; images include apple, orange, banana, grape
- Scenario: User selects wrong image | Summary: the prompt is "apple"; the user taps orange (wrong)
- Scenario: Sentence-to-image matching | Summary: the prompt: "A girl is reading a book"; images: [woman writing, girl reading, boy sleeping, man eating]
- Scenario: Image deselection | Summary: the user selected an image; they tap it again or tap another
- Scenario: Ambiguous/similar images | Summary: images that are very similar; the user selects one
- Scenario: Free user heart system | Summary: hearts are enabled; a free user with 2 hearts
- Scenario: Hint reveals correct image | Summary: a difficult image selection; the user clicks "Hint"
- Scenario: Image quality and clarity | Summary: the images used; the exercise displays

## lessons/exercise-speak.feature
Feature: Speaking/Pronunciation Exercise

- Scenario: Speaking exercise structure | Summary: the exercise loads
- Scenario: User grants microphone permission | Summary: a speaking exercise; the user first attempts to record
- Scenario: User records speech | Summary: the record button is tapped; the user starts speaking
- Scenario: User stops recording | Summary: recording is active; the user taps stop (or auto-stops after phrase)
- Scenario: User reviews recording | Summary: a recording was just made; the user taps playback
- Scenario: Reference audio comparison | Summary: the exercise has reference audio; the user taps "Listen to example"
- Scenario: Pronunciation scoring | Summary: recording is complete; the user clicks "Check"
- Scenario: Perfect pronunciation | Summary: user's speech matches well; evaluation completes
- Scenario: Needs improvement | Summary: user's pronunciation is off; evaluated
- Scenario: Silent or no sound detection | Summary: the user taps record but doesn't speak; they submit
- Scenario: Poor audio quality | Summary: high background noise; the user records
- Scenario: Free vs Max speaking coach feedback | Summary: speaking exercises; a free user completes them
- Scenario: Speaking tips/pronunciation guide | Summary: a difficult sound (e.g., "th"); the user accesses tips
- Scenario: Accessibility: Audio transcription option | Summary: hearing-impaired users; speech exercise is displayed
- Scenario: Recording timeout | Summary: a very long speaking exercise; user is still speaking after 60 seconds

## lessons/exercise-translate-tap.feature
Feature: Translate Tap Exercise

- Scenario: Translate tap exercise presents correctly | Summary: the exercise loads; one word appears pre-highlighted (optional first word)
- Scenario: User taps words in order | Summary: the word bank shows: [Hello] [how] [are] [you]; the words appear in the text field: "Hello how are you"
- Scenario: User can tap words out of order | Summary: the word bank shows: [Hello] [how] [are] [you]; the user taps: [are] [you] [Hello] [how]
- Scenario: User can undo taps | Summary: the user has tapped: [Hello] [how] [are]; they click the "Undo" or "←" button
- Scenario: User submits correct answer | Summary: the correct translation is: "Hello how are you"; the user taps words to form: "Hello how are you"
- Scenario: User submits incorrect answer | Summary: the correct translation is: "Hello how are you"; the user taps: "Hello you are how"
- Scenario: User uses hint on translate tap | Summary: an exercise is displayed; the user clicks the "Hint" button (💡)
- Scenario: Special characters and punctuation | Summary: an exercise where correct answer is: "Hello, how are you?"; the word bank includes: [Hello,] [how] [are] [you?]
- Scenario: Free user loses heart on wrong answer | Summary: hearts are enabled; a free user with 2 hearts remaining
- Scenario: If a learner runs out of hearts, they can recover via review | Summary: hearts are enabled; a learner has 1 heart remaining

## lessons/exercise-translate-type.feature
Feature: Translate Type Exercise

- Scenario: Translate type exercise structure | Summary: the exercise loads
- Scenario: User types correct answer | Summary: the prompt is "Привет!"; the correct answer is "Hello"
- Scenario: Fuzzy matching tolerates typos | Summary: the correct answer is "Hello"; the user types "Helo" (missing 'l')
- Scenario: Case insensitivity | Summary: the correct answer is "Hello"; the user types "hello"
- Scenario: Extra spaces are trimmed | Summary: the correct answer is "Hello how are you"; the user types "  Hello  how  are  you  " (with extra spaces)
- Scenario: Synonym acceptance | Summary: the correct answer is "Hello"; acceptable synonyms include: ["Hi", "Hey"]
- Scenario: Incorrect answer feedback | Summary: the correct answer is "Hello"; the user types "Goodbye"
- Scenario: Capitalization handling | Summary: the correct answer is "Hello, how are you?"; the user types "hello, how are you?"
- Scenario: Free user's wrong answer limit | Summary: hearts are enabled; a free user with 2 hearts
- Scenario: User can clear and retype | Summary: the user has typed "Hello"; they click the clear/X button
- Scenario: Keyboard input support | Summary: the text field is focused; the user types on keyboard (desktop or mobile)

## lessons/lesson-grading.feature
Feature: Lesson Grading and Feedback

- Scenario: Immediate feedback on correct answer | Summary: the user submits a correct answer; the check button is pressed
- Scenario: Immediate feedback on incorrect answer | Summary: the user submits an incorrect answer; the check button is pressed
- Scenario: Explanation of grammar mistake | Summary: the user made a grammar error: "He go" instead of "He goes"; the correction screen appears
- Scenario: Vocabulary hint on wrong answer | Summary: the user translated a word incorrectly; the correction screen appears
- Scenario: Pronunciation feedback on listening exercise | Summary: a user struggled with a listening exercise; they get it wrong
- Scenario: Consistency across exercise types | Summary: exercises of different types (tap, type, listen, match); any answer is submitted
- Scenario: Per-answer feedback loop with progress indicator | Summary: a lesson has 10 exercises; the learner answers an exercise correctly
- Scenario: Streak notification on correct answer | Summary: the user is building a streak (5+ correct in a row); they answer correctly again
- Scenario: Encouragement after struggle | Summary: the user has gotten 2+ wrong answers in a row; they finally answer correctly
- Scenario: Free user feedback on heart loss | Summary: hearts are enabled; a free user has 1 heart remaining
- Scenario: Learning path feedback (spaced repetition) | Summary: a user learns a new word; they complete the lesson
- Scenario: Detailed answer analysis (optional) | Summary: an advanced user completes a lesson; they visit the lesson stats/review
- Scenario: No frustration on learning exercises | Summary: an exercise allows retry; a user retries after a wrong answer

## lessons/start-lesson.feature
Feature: Start Lesson

- Scenario: Continue button starts the next path lesson | Summary: the home screen shows a "Continue" button; the learner taps "Continue"
- Scenario: Intro lesson is intentionally short | Summary: the learner is starting Lesson 1 for the first time; the lesson loads
- Scenario: Learner can resume a lesson after interruption | Summary: a learner is halfway through a lesson; the app is closed or the network drops

## lessons/story-dialogue.feature
Feature: Story / Dialogue Nodes

- Scenario: Story node appears on the path | Summary: a learner reaches a story milestone (e.g., every 3–5 units); they view the path
- Scenario: Story provides audio + text | Summary: a learner opens a story; the story shows the dialogue text
- Scenario: Story ends with comprehension questions | Summary: a learner finishes reading/listening to the story; the questions begin
- Scenario: Completing a story counts toward streak and goal | Summary: the learner has not completed today's streak day yet; they complete a story node

## max/ask-ai-coach.feature
Feature: Ask-AI Deeper Coaching (Max)

- Scenario: "Why?" remains free | Summary: a free learner answers incorrectly; they tap "Why?"
- Scenario: Ask-AI deeper coaching is gated for Free | Summary: a free learner wants more detail; they tap "Ask AI"
- Scenario: Max unlock enables Ask-AI coaching | Summary: a learner has Max active; they tap "Ask AI"
- Scenario: Ask-AI works without VPN | Summary: a learner is on a RU network without VPN; Max is active

## max/roleplay.feature
Feature: Roleplay (Max)

- Scenario: Roleplay entry point is visible but gated for Free | Summary: a free learner opens the Roleplay surface; they see a preview or description
- Scenario: Roleplay does not block core learning | Summary: a free learner dismisses the paywall; they can continue lessons or review without restriction
- Scenario: Max unlock enables Roleplay | Summary: a learner has Max active; they start a Roleplay session
- Scenario: Roleplay works without VPN | Summary: a learner is on a RU network without VPN; they start Roleplay with Max active

## max/speaking-coach.feature
Feature: Speaking Coach (Max)

- Scenario: Speaking coach entry point is gated for Free | Summary: a free learner completes a speaking exercise; they tap "Speaking coach"
- Scenario: Max unlock enables speaking coach feedback | Summary: a learner has Max active; they tap "Speaking coach"
- Scenario: Speaking coach works without VPN | Summary: a learner is on a RU network without VPN; Max is active

## monetization/hearts-vs-energy.feature
Feature: Mistake Buffer (Hearts) — No Daily Energy Cap

- Scenario: Hearts decrease on mistakes (optional mode) | Summary: hearts are enabled; a learner starts a lesson with 5 hearts
- Scenario: When hearts reach 0, the learner can recover via review | Summary: hearts are enabled; the learner reaches 0 hearts
- Scenario: Review restores hearts gradually | Summary: hearts are enabled and a learner has 0 hearts; they complete a review session
- Scenario: Review is always accessible regardless of hearts | Summary: hearts are enabled; a learner opens the home screen
- Scenario: RU default disables hearts (hearts_enabled = false) | Summary: an admin/config toggle "hearts_enabled" exists; hearts_enabled = false (RU default)

## monetization/promo-codes.feature
Feature: Promo Codes and Referral Bonuses

- Scenario: Promo code entry in Max upgrade | Summary: user goes to upgrade screen; they view pricing
- Scenario: Valid promo code redemption | Summary: user enters promo code "WELCOME2026"; they click "Apply"
- Scenario: Invalid promo code | Summary: user enters invalid code "INVALID123"; they click "Apply"
- Scenario: Expired promo code | Summary: code "OLDCODE" is expired (end date passed); user tries to redeem
- Scenario: One-time use code | Summary: code "UNIQUE123" is single-use; user redeems it
- Scenario: Limited quantity code | Summary: code "LIMITED" has limit of 100 uses; 100 users redeem it
- Scenario: Referral code generation | Summary: user goes to Settings → Referral; they view referral options
- Scenario: Referral bonus for referrer | Summary: user shared code "ALEX2026"; a new user signs up with code
- Scenario: Referral bonus for referee | Summary: new user signs up with referral code; they create account
- Scenario: Referral limit | Summary: user has generated referrals; they check referral stats
- Scenario: Campaign-specific codes | Summary: marketing campaign (e.g., "Spring promo"); codes are created: "SPRING50", "SPRING30"
- Scenario: Promo code analytics | Summary: codes deployed; viewed in admin dashboard
- Scenario: Birthday promo code | Summary: user has birthday on file (optional); their birthday arrives
- Scenario: Influencer code | Summary: influencer/partner program; an influencer is given code "INFLUENCER_ALEX"

## offline/content-download.feature
Feature: Content Download for Offline Use

- Scenario: Learner can download a unit pack | Summary: the learner is online; they tap "Download Unit"
- Scenario: Free learners have a reasonable offline allowance | Summary: the learner is on the free plan; they try to download content
- Scenario: Max expands offline downloads | Summary: the learner is a Max subscriber; their offline download limit is higher (or unlimited)
- Scenario: Learner can delete downloaded content | Summary: the learner has downloaded 2 units; they open Offline Downloads settings
- Scenario: Downloads degrade gracefully if audio is missing | Summary: a unit has audio; audio fails to download

## offline/offline-lesson.feature
Feature: Offline Lesson Completion

- Scenario: Offline indicator on app | Summary: the app is running; internet connectivity is lost
- Scenario: Offline mode allows lesson completion | Summary: a user is offline; they start a cached lesson
- Scenario: Offline lesson is saved locally | Summary: a user completes a lesson offline; the lesson finishes
- Scenario: Multiple exercises offline | Summary: a user has 3+ lessons cached; they are offline
- Scenario: Offline exercises show full functionality | Summary: an offline lesson is active; the user does exercises
- Scenario: Offline does not lose hearts/data | Summary: hearts are enabled; a free user going offline with 2 hearts
- Scenario: App detects when back online | Summary: the user was offline and now has connectivity; the connection is restored
- Scenario: Clear offline/online indicator | Summary: offline mode is active; the user goes online
- Scenario: Download course packs for offline | Summary: a Max user wants offline access; they view Unit 1
- Scenario: Offline packs storage management | Summary: downloaded offline packs take storage; a user views "Offline Content"
- Scenario: Partial offline functionality | Summary: the app supports graceful degradation; a feature is not available offline
- Scenario: Offline notifications disabled | Summary: offline mode; notifications are configured
- Scenario: Network interruption during lesson | Summary: a user is doing a lesson; the network suddenly drops

## offline/progress-sync.feature
Feature: Progress Synchronization (Offline ↔ Online)

- Scenario: Sync runs automatically on reconnect | Summary: a learner completed lessons offline; connectivity returns
- Scenario: Offline completions count for streak after sync | Summary: the learner completed a qualifying activity offline yesterday; sync succeeds today
- Scenario: Learner can see last sync status | Summary: a learner opens their profile

## onboarding/account-creation.feature
Feature: Account Creation

- Scenario: User sees account creation form | Summary: the user clicks "Create Account"; the account creation screen appears
- Scenario: Successful account creation | Summary: the user is on the account creation form; they click "Create Account"
- Scenario: Email validation on account creation | Summary: the user is on the account creation form; they enter an invalid email like "notanemail"
- Scenario: Password strength validation | Summary: the user is on the account creation form; they enter a weak password like "123"
- Scenario: Passwords must match | Summary: the user enters mismatched passwords; they click "Create Account"
- Scenario: Email already registered | Summary: an account with "user@example.com" already exists; a new user tries to create an account with the same email
- Scenario: User must accept terms | Summary: the user fills in email and password correctly; they do NOT check the terms checkbox
- Scenario: Email verification | Summary: an account has been created; a verification email was sent

## onboarding/account-upgrade.feature
Feature: Account Upgrade (Anonymous to Registered)

- Scenario: User is prompted to upgrade account | Summary: the anonymous user has completed Unit 1; they visit the profile screen
- Scenario: User creates account while upgrading | Summary: the upgrade flow is open; the user clicks "Create New Account"
- Scenario: Progress is merged on account creation | Summary: the user creates account "newuser@example.com"; the account is created (verification deferred)
- Scenario: User logs in with existing account | Summary: the anonymous user has already created an account before; they choose "Log In to Existing Account"
- Scenario: Device ID is linked to account | Summary: an account upgrade happens; the merge is complete
- Scenario: Streak is preserved during upgrade | Summary: an anonymous user has a 7-day active streak; they upgrade to an account

## onboarding/anonymous-start.feature
Feature: Anonymous Start (No-Signup Onboarding)

- Scenario: Start learning without account creation | Summary: a new learner opens the app; they tap "Start learning"
- Scenario: Anonymous progress is saved locally | Summary: an anonymous learner completes a lesson; they close and reopen the app
- Scenario: Prompt to save progress appears after early investment | Summary: an anonymous learner completed Unit 1 OR reached a 3–5 day streak; they open the home screen
- Scenario: Anonymous learner can choose "Remind me later" | Summary: the save-progress banner is shown; the learner taps "Remind me later"

## onboarding/email-verification.feature
Feature: Email Verification

- Scenario: Verification required screen | Summary: account creation completed; the user is redirected
- Scenario: Verification email sent | Summary: user created account with "user@example.com"; confirmation email is queued
- Scenario: User clicks verification link | Summary: verification email was sent; user clicks the link
- Scenario: Verification success | Summary: user clicked valid verification link; verification completes
- Scenario: Resend verification email | Summary: verification email was sent but not clicked; user clicks "Resend email"
- Scenario: Auto-verify after login with unverified email | Summary: user created account but didn't verify; they logged in
- Scenario: Benefits of verified email | Summary: email is verified; user has verified email
- Scenario: Max purchase requires verified email | Summary: user tries to upgrade; email is not verified
- Scenario: Email change requires verification | Summary: user wants to change email; they initiate email change
- Scenario: Old email verification timeout | Summary: email change initiated; user doesn't click link from old email for 1 hour

## onboarding/login-signin.feature
Feature: Login and Sign In

- Scenario: Login screen displays | Summary: the user is not logged in; they tap "Log In" from welcome screen
- Scenario: Successful login | Summary: the user enters valid credentials; they click "Log In"
- Scenario: Login validation - empty fields | Summary: the login form; the user clicks "Log In" with empty fields
- Scenario: Login validation - invalid email | Summary: the login form; the user enters "notanemail" as email
- Scenario: Invalid credentials | Summary: correct form but wrong password; the user submits wrong credentials
- Scenario: Account locked after failed attempts | Summary: a user has failed login 5+ times; they attempt another login
- Scenario: Remember me checkbox | Summary: the user logs in with "Remember me" checked; they close and reopen the app
- Scenario: Session persistence | Summary: a user is logged in; they close the app
- Scenario: Session timeout | Summary: a user is logged in; they are inactive for 24+ hours
- Scenario: Logout | Summary: a logged-in user; they go to Settings → Log Out
- Scenario: Social login with VK | Summary: VK OAuth is configured; the user taps "Log in with VK"
- Scenario: Social login with Yandex | Summary: Yandex OAuth is configured; the user taps "Log in with Yandex"
- Scenario: Multi-device login | Summary: a user logged in on Phone A; they log in on Phone B with same account

## onboarding/password-reset.feature
Feature: Password Reset and Recovery

- Scenario: Forgot password link | Summary: the login screen; the user clicks "Forgot Password?"
- Scenario: Request password reset | Summary: the password reset form; the user enters their email
- Scenario: Password reset email | Summary: a reset link was sent; the user checks their email
- Scenario: Reset link expiration | Summary: a password reset link; the user tries to use an old link (>1 hour)
- Scenario: Reset password form | Summary: the user clicked reset link; the reset form appears
- Scenario: Password reset validation | Summary: the reset form; the user enters weak password
- Scenario: Reset password success | Summary: valid password reset form; the user enters strong password twice
- Scenario: Logout all devices on password change | Summary: a user changed their password; the password reset completes

## onboarding/placement-test.feature
Feature: Placement Test / Level Assessment

- Scenario: Placement test option is offered | Summary: a user indicates they have previous English knowledge; they select "I already know some English"
- Scenario: User completes placement test | Summary: the user chose "Start Test"; they are presented with 10 assessment questions
- Scenario: User can skip placement test | Summary: the placement test is offered; the user clicks "Start from Basics"
- Scenario: User can retake placement test | Summary: a user has already taken the placement test; they access Settings → "Assessment"
- Scenario: Skip-ahead based on placement | Summary: a user achieved "B1 level" on placement test; they begin lessons

## onboarding/tutorial-first-launch.feature
Feature: First Launch Tutorial and Commitment Ladder

- Scenario: Goal selection is quick and non-blocking | Summary: a new learner launches the app; they are asked about a daily goal
- Scenario: First lesson delivers a micro-win fast | Summary: the learner finished goal selection; the first lesson starts
- Scenario: First two exercises are recognition-based and nearly impossible to fail | Summary: a new learner starts the micro-win lesson; exercise 1 loads
- Scenario: Micro-win follows the exact 6-item sequence | Summary: a new learner starts the micro-win lesson; there is no typing in the micro-win lesson
- Scenario: Streak starts immediately after the win | Summary: the learner completes the micro-win lesson today; the completion screen appears
- Scenario: Reminder is offered after value is shown | Summary: the learner just got "🔥 1"; the app offers reminders
- Scenario: Notification permission is requested AFTER micro-win only | Summary: a new learner launches the app; they have NOT yet completed the micro-win lesson
- Scenario: Notification permission is not requested after a micro-win interruption | Summary: a new learner launches the app; they start the micro-win lesson
- Scenario: Show the journey so the course feels real | Summary: the learner finishes their first lesson; they land on the home/path screen

## payments/lifetime-purchase.feature
Feature: Lifetime Purchase (Founder Offer)

- Scenario: Lifetime offer visibility during launch | Summary: the user is viewing Max upgrade; Max pricing is shown
- Scenario: Lifetime offer expires | Summary: the launch window (30-60 days); the launch period ends
- Scenario: User purchases lifetime | Summary: the lifetime option is visible; the user clicks "Buy Lifetime"
- Scenario: Lifetime activation | Summary: a lifetime purchase completes; payment succeeds
- Scenario: Lifetime never expires | Summary: a user purchased lifetime; years pass (1 year, 5 years, etc.)
- Scenario: Lifetime cannot be downgraded | Summary: a lifetime user; they view subscription settings
- Scenario: Lifetime transferability | Summary: a user with lifetime access; they delete their account
- Scenario: Marketing of lifetime offer | Summary: the lifetime option exists; the launch marketing happens
- Scenario: Lifetime holders early recognition | Summary: users who purchased lifetime; their profile is viewed
- Scenario: Lifetime value comparison | Summary: monthly subscription 500 RUB; annual subscription 5,500 RUB

## payments/max-upgrade.feature
Feature: Max Subscription Upgrade (Non-Blocking)

- Scenario: Max paywall triggers on Max value-add taps (not on core learning) | Summary: a learner is doing a lesson; they tap "Roleplay" or "Speaking coach" or "Ask AI" deeper coaching
- Scenario: Max upsell is shown only after value is proven | Summary: a learner has completed at least one lesson; they view the profile or settings
- Scenario: Max benefits are AI + convenience (not pay-to-continue) | Summary: a learner views the Max page; it does NOT promise "unlimited learning" as a paid-only benefit
- Scenario: Canceling checkout does not unlock or preview AI features | Summary: a learner opens the Max paywall from an AI feature; they cancel the checkout
- Scenario: Restore purchases after a failed callback | Summary: a learner returns from checkout without an entitlement update; they tap "Restore purchases / Sync entitlements"
- Scenario: Payment providers for Russia (MIR / SBP) | Summary: payments are enabled; a learner chooses to upgrade

## payments/mir-payment.feature
Feature: Mir Card Payment Integration

- Scenario: Mir payment option is visible | Summary: the payment methods are displayed; the user views payment options
- Scenario: User enters Mir card details in web checkout | Summary: the user selects Mir payment; the provider-hosted checkout page opens
- Scenario: Mir card validation | Summary: the user enters card details; they click "Pay"
- Scenario: 3D Secure verification | Summary: a valid Mir card is entered; the payment is submitted
- Scenario: Mir payment success | Summary: 3D Secure verification passed; the transaction completes
- Scenario: Mir payment declined | Summary: insufficient funds or card issue; the transaction is declined
- Scenario: Mir currency and fees | Summary: pricing in Russian Rubles; a user pays with Mir
- Scenario: Mir payment statement | Summary: a user made a Mir payment; they check their bank statement

## payments/payment-refunds.feature
Feature: Payment Refunds and Chargebacks

- Scenario: Refund request within grace period | Summary: a user purchased Max 2 days ago; they view Settings → Subscription → "Refund"
- Scenario: Refund grace period explained | Summary: the refund form is displayed; the user reads the policy
- Scenario: Refund processing | Summary: a refund request is submitted; the request is approved (automatic or manual)
- Scenario: Refund after grace period | Summary: a user purchased 10 days ago (outside 7-day window); they request refund
- Scenario: Annual plan refund | Summary: a user purchased annual plan (5,500 RUB); they request refund within grace period
- Scenario: Lifetime plan no refund | Summary: a user purchased lifetime access; they request refund
- Scenario: Chargeback handling | Summary: a user disputes a charge with their bank; a chargeback is initiated
- Scenario: Chargeback reversal | Summary: a chargeback is in dispute; the user wins the dispute (proves fraud or legitimate reason)
- Scenario: Chargeback fraud protection | Summary: repeated chargebacks from one user; multiple chargebacks detected
- Scenario: Failed payment retry | Summary: a recurring payment failed (card expired, etc.); the payment processor retries
- Scenario: Refund transparency | Summary: a user reviews their receipt; they view Settings → "Billing History"
- Scenario: Tax refund documentation | Summary: a refund is processed; the user requests documentation

## payments/sbp-payment.feature
Feature: SBP (Faster Payments System) Integration

- Scenario: SBP payment option visible | Summary: the payment methods are displayed; the user views payment options
- Scenario: User selects SBP payment | Summary: the user clicks SBP option; the payment screen updates
- Scenario: User scans QR code | Summary: the SBP QR code is displayed; the user opens their bank app (Sber, Yandex, etc.)
- Scenario: Bank app payment confirmation | Summary: the payment details are shown in bank app; the user confirms payment (via PIN or biometric)
- Scenario: SBP bank-app handoff + return (TWA) | Summary: the user is in the TWA checkout; they tap "Open in your bank app"
- Scenario: Instant confirmation with SBP | Summary: an SBP payment is submitted; the bank confirms
- Scenario: Alternative: Direct account entry | Summary: SBP is selected; the user doesn't want to scan
- Scenario: SBP no saved payment method | Summary: SBP payment philosophy; a payment completes
- Scenario: SBP limits and daily caps | Summary: some banks have SBP daily limits; a user attempts payment exceeding limit
- Scenario: SBP timeout handling | Summary: a user initiated SBP payment; the bank doesn't respond within 5 minutes
- Scenario: SBP support multiple banks | Summary: users have accounts at various banks; SBP payment is used
- Scenario: SBP transaction confirmation | Summary: a payment completed via SBP; the user checks their bank

## progress/checkpoint-tests.feature
Feature: Checkpoint Tests (Section Mastery Gates)

- Scenario: Checkpoint node appears at the end of a section | Summary: a learner reaches the last unit of A1; they view the path
- Scenario: Passing the checkpoint unlocks the next section | Summary: a learner starts the A1 checkpoint test; they achieve a passing score
- Scenario: Failing the checkpoint suggests a review plan | Summary: a learner takes the checkpoint test; they do not pass
- Scenario: Share a milestone card (optional) | Summary: a learner passes a checkpoint; they tap "Share"

## progress/course-progress.feature
Feature: Course Progress and "Real Course" Signals

- Scenario: Course map shows CEFR-ish sections | Summary: a learner opens the course map; each section shows how many units it contains
- Scenario: Unit count is visible to signal depth | Summary: the learner is in the course map; the learner can scroll to preview later units
- Scenario: Checkpoint tests appear at section boundaries | Summary: a learner reaches the end of A1 section; a checkpoint test node appears
- Scenario: Stories/Dialogues appear as special nodes | Summary: story content exists in the curriculum; the path includes story nodes every N units (configurable)
- Scenario: Progress screen shows streak, goal, and course position together | Summary: a learner opens their profile or progress screen
- Scenario: Incident banner offers streak repair after outage | Summary: an outage impacted yesterday; the learner missed yesterday with a prior streak
- Scenario: Pace projection (optional) | Summary: a learner has studied for 14 days; viewing progress insights

## progress/spaced-repetition.feature
Feature: Spaced Repetition Review Engine

- Scenario: Item strength increases on correct answers | Summary: an item "hello" has strength 1/5; the learner answers it correctly in a lesson
- Scenario: Item strength decreases on incorrect answers | Summary: an item "goodbye" has strength 3/5; the learner answers it incorrectly
- Scenario: App generates a daily review queue | Summary: a learner has studied at least 20 items; they open the app today
- Scenario: Review session uses due + weak items first | Summary: the learner starts a review session; avoids repeating the same item too many times in a row
- Scenario: Completing a review counts for streak and daily goal | Summary: a learner has not completed today's streak day yet; they complete a review session
- Scenario: Review is always available even if new content is limited | Summary: the learner cannot or does not want to do a new lesson; they open the home screen
- Scenario: Targeted review of mistakes is available | Summary: the learner made mistakes in the last 3 lessons; they choose "Review mistakes"
- Scenario: Review exercises are auto-interleaved into lessons | Summary: a learner has more than 20 overdue review items; they have not completed a review session in 3 days
- Scenario: Path shows auto-generated practice nodes | Summary: a learner has completed 5 lessons; they view the course map

## progress/unit-unlock.feature
Feature: Unit Unlock and Gating (Course Path)

- Scenario: Unit 1 is unlocked by default | Summary: a new learner starts the course; Unit 1 is unlocked
- Scenario: Completing Unit 1 unlocks Unit 2 | Summary: Unit 1 is unlocked; the learner completes all required lessons in Unit 1
- Scenario: Placement test can unlock multiple units | Summary: a learner chooses a placement test; they score into A2
- Scenario: Learner can always go back to earlier units | Summary: a learner is currently in Unit 5; they tap Unit 2
- Scenario: Optional soft preview of locked content | Summary: a unit is locked; the learner taps it

## reliability/data-recovery.feature
Feature: Data Recovery and Progress Integrity

- Scenario: Lesson progress is not lost after a crash | Summary: a learner completes a lesson; the app crashes immediately after completion
- Scenario: Reinstall restores progress after login | Summary: a learner is logged in on Device A; their progress is synced to the server
- Scenario: User data export for portability (optional) | Summary: a learner requests a data export; the system can generate a machine-readable export (JSON/CSV)

## reliability/offline-fallback.feature
Feature: Offline Fallback and Graceful Degradation

- Scenario: Offline state is detected and shown unobtrusively | Summary: the app is running; connectivity is lost
- Scenario: Lesson can continue when network drops mid-session | Summary: a learner is in a lesson; the network suddenly drops
- Scenario: Offline completion can still protect streak | Summary: a learner completes a lesson offline today; the app marks today's streak day as complete locally
- Scenario: Incident banner shows and offers streak repair | Summary: an incident occurred yesterday affecting the learner's timezone; the learner had an active streak before the incident
- Scenario: Slow connection detection (optional) | Summary: the user has weak connectivity; the app detects slow speeds

## settings/account-settings.feature
Feature: Account Settings (Control and Trust)

- Scenario: Learner can change display name | Summary: a logged-in learner opens Account Settings; they update their display name
- Scenario: Learner can sign out | Summary: a logged-in learner opens Account Settings; they tap "Sign out"
- Scenario: Learner can request account deletion (compliance) | Summary: a logged-in learner opens Account Settings; they tap "Delete account"
- Scenario: Change email (optional) | Summary: a learner is logged in; they change their email

## settings/daily-goal.feature
Feature: Daily Learning Goal

- Scenario: Lightweight goal selection during onboarding | Summary: a new learner launches the app; they reach the goal selection step
- Scenario: Goal progress is visible on the home screen | Summary: a learner has a daily goal set; they complete exercises today
- Scenario: Completing the goal triggers a small celebration | Summary: a learner is at 9/10 minutes of their goal; they complete another short activity
- Scenario: Learner can change goal from settings | Summary: a learner opens Settings → Daily Goal; they select a different goal

## settings/language-preferences.feature
Feature: Language and Localization Preferences

- Scenario: App interface language | Summary: the user goes to Settings → Language; they view language options
- Scenario: Russian interface is default | Summary: a new user from Russia; they first open the app
- Scenario: English interface option | Summary: advanced learners; they select "English" language
- Scenario: Audio pronunciation preference | Summary: listening exercises with audio; the user goes to Settings → Audio
- Scenario: Subtitle/Caption preference | Summary: listening exercises; the user goes to Settings → Captions
- Scenario: Phonetic assistance | Summary: learners struggling with pronunciation; they go to Settings → Phonetics
- Scenario: Transliteration example | Summary: a Russian speaker learning "hello"; transliteration is enabled
- Scenario: Grammar explanations language | Summary: grammar tips appear; a user is learning
- Scenario: Currency in pricing | Summary: payment pricing; a user in Russia views Max
- Scenario: Date/time formatting | Summary: calendar and timestamps; a user completes a lesson
- Scenario: Regional content considerations | Summary: exercise example sentences; sentences include cultural references
- Scenario: Romanization toggle | Summary: some users familiar with Latin characters; they enable "Romanized Russian" (optional)
- Scenario: Right-to-left support | Summary: potential future languages; language preferences are built
- Scenario: Language pack management | Summary: languages can be added in future; a user views "Language Packs"

## settings/notifications.feature
Feature: Notification Settings and Practice Reminders

- Scenario: Ask for notification permission after the first win | Summary: a new learner just completed their first lesson; the celebration screen appears
- Scenario: Daily reminder time can be chosen | Summary: a learner enables reminders; they choose a reminder time window (e.g., 18:00–20:00)
- Scenario: Streak-at-risk reminder | Summary: a learner has an active streak; they have not completed today's streak day yet
- Scenario: Notification categories can be toggled | Summary: a learner opens Settings → Notifications
- Scenario: Smart reminder timing | Summary: a learner has a consistent practice time; the system learns their habit (e.g., 7 days)

## social/add-friends.feature
Feature: Adding Friends

- Scenario: Friends menu is accessible | Summary: the user is in the app; they tap the "Friends" or "Social" tab
- Scenario: Add friend by username | Summary: the user clicks "Add Friends"; a search screen appears
- Scenario: Send friend request | Summary: the user found "MariaLearns"; they click "Add"
- Scenario: Receive and accept friend request | Summary: MariaLearns received a friend request from AlexEnglish; a notification appears (if enabled)
- Scenario: Decline friend request | Summary: a friend request notification; the user clicks "Decline"
- Scenario: Cancel pending friend request | Summary: the user sent a request that's pending; they go to Friends → Pending
- Scenario: View friend's profile | Summary: a user is friends with AlexEnglish; they tap on their name
- Scenario: Block user | Summary: a user's profile is viewed; they tap "..." (more options)
- Scenario: Friend activity feed | Summary: a user is viewing Friends section; they look at the activity feed
- Scenario: Limit on friends | Summary: some apps limit friend count; a user has 500 friends (if limit exists)
- Scenario: Remove friend | Summary: a user is viewing their friends list; they long-press or tap a friend's name
- Scenario: Friend request notifications | Summary: friend requests are received; a friend request comes in

## social/friend-leaderboard.feature
Feature: Friend Leaderboard

- Scenario: Friend leaderboard access | Summary: a user goes to Leaderboard tab; they view leaderboard options
- Scenario: Friend leaderboard display | Summary: the friends leaderboard; it loads
- Scenario: Friend rank motivation | Summary: a user seeing they're ranked 3rd among friends; they view the leaderboard
- Scenario: Friend activity on leaderboard | Summary: real-time leaderboard updates; a friend completes a lesson
- Scenario: Filter friend leaderboard | Summary: a leaderboard view; filter options are available
- Scenario: Friend leaderboard is more motivating | Summary: competitive psychology; a user compares global vs friend leaderboard
- Scenario: Challenge a friend directly | Summary: a user viewing a friend's profile; they tap "Challenge Friend"
- Scenario: Hide from friend leaderboard | Summary: privacy concerns; a user goes to Settings → Privacy
- Scenario: Friend leaderboard seasonality | Summary: friend leaderboards reset weekly; a new week starts
- Scenario: Many friends on leaderboard | Summary: a user with 100+ friends; they view friend leaderboard

## social/share-progress.feature
Feature: Share Progress on Social Media

- Scenario: Share button on achievements | Summary: a user unlocks an achievement; the achievement screen appears
- Scenario: Share to Telegram | Summary: achievement or milestone reached; the user taps "Share" → "Telegram"
- Scenario: Share to VK (VKontakte) | Summary: social achievement; the user selects "VK"
- Scenario: Share streak milestone | Summary: a user reaches 30-day streak; they view the streak
- Scenario: Share certificate or level completion | Summary: a user completes A1 level; completion screen appears
- Scenario: Copy share link | Summary: a share menu is open; the user taps "Copy Link"
- Scenario: Share referral link | Summary: social sharing; a user wants to invite friends
- Scenario: Privacy in sharing | Summary: data privacy; a user shares achievement
- Scenario: Share with screenshot | Summary: achievements screen; a user takes screenshot or uses "Share Screenshot"
- Scenario: Disable social sharing | Summary: privacy preferences; a user goes to Settings → Privacy
- Scenario: Shared achievement preview | Summary: a user shared a link on VK; another user clicks the link
- Scenario: Social proof gamification | Summary: shared achievements; achievements are shared publicly

## support/answer-acceptance-and-appeals.feature
Feature: Answer Acceptance and Appeals

- Scenario: Common alternative answers are accepted | Summary: an exercise prompt that allows multiple correct answers; the learner submits an alternative that is listed as accepted
- Scenario: When marked wrong, guidance is shown | Summary: a learner submits an answer that is not accepted; it is marked incorrect
- Scenario: Learner can report "should be accepted" | Summary: an answer was marked wrong; the learner taps "Report"

## support/bug-report-and-feedback.feature
Feature: Bug Reporting and User Feedback

- Scenario: Feedback button in settings | Summary: a user goes to Settings; they view the Help section
- Scenario: Report bug flow | Summary: user clicks "Report a Bug"; the form opens
- Scenario: Bug submission | Summary: the bug form is filled out; user clicks "Submit"
- Scenario: Feature suggestion flow | Summary: user clicks "Suggest a Feature"; the form opens
- Scenario: Feature suggestion submission | Summary: feature form is complete; submitted
- Scenario: General feedback | Summary: user clicks "Send Feedback"; form opens
- Scenario: Feedback rating | Summary: user fills general feedback; they select a satisfaction emoji
- Scenario: Crash report (automatic) | Summary: app crashes; user reopens app
- Scenario: Crash report details | Summary: user agreed to send crash report; submitted
- Scenario: Support contact form | Summary: user clicks "Contact Support"; form opens
- Scenario: Support ticket creation | Summary: support form is submitted; processed
- Scenario: Feedback history | Summary: user has submitted feedback multiple times; they go to Settings → Feedback History
- Scenario: In-app survey (optional) | Summary: user completes lessons; they've learned for 3+ days
- Scenario: Feedback notification | Summary: user submitted feedback; support reviews/responds
- Scenario: Public roadmap (optional) | Summary: features are suggested; user views Settings → Roadmap

## ui/error-handling-and-edge-cases.feature
Feature: Error Handling and Edge Cases

- Scenario: Friendly network error with retry | Summary: a network request fails; the app cannot load fresh content
- Scenario: Form validation is clear | Summary: a user is creating an account; they enter an invalid email
- Scenario: Server outage does not destroy trust | Summary: the server is temporarily unavailable; the learner opens the app
- Scenario: Rate limit handling (optional) | Summary: a user triggers too many requests; the system applies backoff automatically

## ui/theme-and-accessibility.feature
Feature: Theme Selection and Accessibility Settings

- Scenario: Theme selection | Summary: a user goes to Settings → Theme; they view theme options
- Scenario: Light theme | Summary: light theme is selected; the app displays
- Scenario: Dark theme | Summary: dark theme is selected; the app displays
- Scenario: Auto theme switching | Summary: auto theme selected; system-wide theme changes (day/night)
- Scenario: Font size adjustment | Summary: accessibility considerations; user goes to Settings → Font Size
- Scenario: Text scaling applied | Summary: large font size selected; the app displays
- Scenario: Bold text option | Summary: accessibility settings; user enables "Bold Text"
- Scenario: High contrast mode | Summary: accessibility setting; user enables "High Contrast"
- Scenario: Reduce motion option | Summary: animation preferences; user goes to Settings → Animations
- Scenario: Screen reader compatibility | Summary: accessibility features; screen reader is enabled
- Scenario: Color blindness support | Summary: color as only differentiator; user enables "Color Blind Mode"
- Scenario: Dyslexia-friendly font | Summary: reading difficulties; user enables "Dyslexia-Friendly Font"
- Scenario: Caption settings | Summary: videos/audio content; user goes to Settings → Captions
- Scenario: Haptic feedback control | Summary: vibration feedback on actions; user goes to Settings → Haptics
- Scenario: Audio cues option | Summary: audio feedback on completion; user enables/disables "Audio Cues"
- Scenario: Profile with preferences saved | Summary: accessibility settings configured; user logs in on new device
- Scenario: Default accessibility standards | Summary: the app in development; built

## ui/tips-and-explanations.feature
Feature: Tips, Guidebooks, and "Почему?" Explanations

- Scenario: Guidebook is visible before starting a unit | Summary: a learner is viewing a unit in the path; they tap "Guidebook"
- Scenario: Inline "Почему?" is available after mistakes | Summary: a learner answers an exercise incorrectly; the feedback card appears
- Scenario: Accepted alternative answers can be shown (credibility, optional) | Summary: an exercise supports multiple correct answers; a learner's answer is marked correct
- Scenario: "Report an issue" is available from explanations | Summary: a learner is viewing a Guidebook or a "Почему?" explanation; they tap "Report an issue"
- Scenario: Offline tips caching | Summary: a learner viewed a Guidebook before; the learner is offline
