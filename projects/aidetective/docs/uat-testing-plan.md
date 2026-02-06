# Sherlock AI Detective Bot - UAT Testing Plan with Telegram CLI

This document provides detailed User Acceptance Testing (UAT) procedures for the Sherlock AI Detective Bot using Telegram CLI. This approach allows automated testing of all key features to ensure they work as expected before presenting the solution to the client.

## 1. Setup for Telegram CLI Testing

### 1.1 Install Telegram CLI

```bash
# Ubuntu/Debian
sudo apt-get install -y build-essential libreadline-dev libconfig-dev libssl-dev lua5.2 liblua5.2-dev libevent-dev libjansson-dev

# Clone repository
git clone --recursive https://github.com/vysheng/tg.git
cd tg

# Configure and build
./configure
make

# Initial run and authentication
./bin/telegram-cli -k tg-server.pub
```

Follow the authentication process to link your Telegram account to the CLI.

### 1.2 Basic Telegram CLI Commands

- `contact_list` - Show all contacts
- `dialog_list` - Show all dialogs
- `msg <username> <text>` - Send message to user
- `history <username> [limit]` - Show message history
- `safe_quit` - Exit the program

## 2. Automated Testing Scripts

We'll create several script files to test different aspects of the bot. These scripts can be run using the `exec` command in Telegram CLI.

### 2.1 Basic Commands Test

Create a file `1_basic_commands_test.txt`:

```
# Basic Commands Test
msg @bot_username /start
sleep 2
msg @bot_username /help
sleep 2
msg @bot_username /cases
sleep 3
```

Replace `@bot_username` with your bot's actual username.

### 2.2 Story Navigation Test

Create a file `2_story_navigation_test.txt`:

```
# Story Navigation Test
# First select the story (assuming only one story in the list)
# This simulates clicking on the first inline button
# Note: The actual command might differ based on your version of Telegram CLI
# For newer versions, it might be something like:
# chat_with_peer @bot_username
# select_inline_button 0
msg @bot_username /cases
sleep 2
# We'll use a workaround since direct button selection isn't always possible in scripts
# We'll respond with the title of the story
msg @bot_username Тайна Теневой Библиотеки
sleep 3

# Navigate to the crime scene
msg @bot_username Осмотреть место преступления
sleep 3

# Examine something specific
msg @bot_username Осмотреть пятна на полу
sleep 3

# Return to the main investigation
msg @bot_username Вернуться к расследованию
sleep 2
```

### 2.3 Character Interaction Test

Create a file `3_character_interaction_test.txt`:

```
# Character Interaction Test
msg @bot_username /continue
sleep 2

# Talk to the director
msg @bot_username Поговорить с директором библиотеки
sleep 3

# Ask a specific question
msg @bot_username Когда вы последний раз видели библиотекаря?
sleep 3

# Ask another question
msg @bot_username Спросить о том, над чем работал библиотекарь
sleep 3

# Return to the investigation
msg @bot_username Вернуться к расследованию
sleep 2

# Talk to the student
msg @bot_username Поговорить со студентом-историком
sleep 3

# Ask a specific question
msg @bot_username Спросить о закладке с его именем
sleep 3

# Return to the investigation
msg @bot_username Вернуться к расследованию
sleep 2
```

### 2.4 Evidence Collection Test

Create a file `4_evidence_collection_test.txt`:

```
# Evidence Collection Test
msg @bot_username /continue
sleep 2

# Check inventory
msg @bot_username /inventory
sleep 3

# Go to a location to find evidence
msg @bot_username Осмотреть место преступления
sleep 3

# Examine different pieces of evidence
msg @bot_username Изучить книгу на столе
sleep 3

# Check updated inventory
msg @bot_username /inventory
sleep 3
```

### 2.5 Case Solution Test

Create a file `5_case_solution_test.txt`:

```
# Case Solution Test
msg @bot_username /continue
sleep 2

# We need to navigate to the solution state
# This depends on the story's current state
# For testing purposes, we'll try direct navigation

# First, try to reach solve state
msg @bot_username Решить дело
sleep 3

# If the above doesn't work, try examining more evidence and talking to characters
# Then try to solve again

# Try to solve by accusing the director
msg @bot_username Обвинить директора библиотеки
sleep 3

# Verify the result
# The bot should confirm a successful accusation or give feedback

# Start a new investigation
msg @bot_username /start
sleep 2
```

### 2.6 State Persistence Test

Create a file `6_state_persistence_test.txt`:

```
# State Persistence Test
# Start a new investigation
msg @bot_username /cases
sleep 2
msg @bot_username Тайна Теневой Библиотеки
sleep 3

# Make some progress
msg @bot_username Осмотреть место преступления
sleep 3
msg @bot_username Изучить книгу на столе
sleep 3

# Simulate closing and reopening the chat
# In the CLI, we can just wait a moment
sleep 5

# Try to continue
msg @bot_username /continue
sleep 3

# Verify that the bot remembers our progress
# It should mention the current stage of the investigation
# or provide appropriate options
```

## 3. Running the Tests

In Telegram CLI, run each test script sequentially:

```
exec 1_basic_commands_test.txt
# Check output and verify
exec 2_story_navigation_test.txt
# Check output and verify
# ... and so on for all test scripts
```

## 4. Manual Verification Points

For each test script, manually verify these points:

### 4.1 Basic Commands Test
- ✓ Bot sends welcome message after /start
- ✓ Help information is clear and complete
- ✓ Available cases are displayed correctly

### 4.2 Story Navigation Test
- ✓ Story introduction is displayed correctly
- ✓ Navigation options are presented as expected
- ✓ Scene descriptions are appropriate
- ✓ Back navigation works correctly

### 4.3 Character Interaction Test
- ✓ Character descriptions match expected content
- ✓ Character responses are contextually appropriate
- ✓ Conversation flow is natural
- ✓ Character status indicators (witness/suspect/criminal) display correctly

### 4.4 Evidence Collection Test
- ✓ Evidence is correctly added to inventory
- ✓ Evidence descriptions are displayed
- ✓ Evidence status updates correctly when analyzed

### 4.5 Case Solution Test
- ✓ Case solution options are presented clearly
- ✓ Accusation outcomes match expected story logic
- ✓ Feedback for both correct and incorrect accusations is appropriate
- ✓ Option to restart is provided

### 4.6 State Persistence Test
- ✓ Bot correctly remembers investigation progress
- ✓ State is properly restored after using /continue
- ✓ All collected evidence remains in inventory

## 5. Handling Common Testing Issues

### 5.1 Button Selection Issues

If the CLI cannot properly select inline buttons, use these workarounds:

1. Use text that matches button labels instead of button selection
2. Use direct commands that trigger the same functionality
3. Test those specific parts manually in the Telegram app

### 5.2 Timing Issues

If responses take longer than expected:

1. Increase the sleep times in the test scripts
2. Add more sleep steps after complex operations
3. Consider using a dynamic wait approach if available in your version of Telegram CLI

### 5.3 State Recovery

If a test disrupts the bot's state:

1. Use `/start` to reset
2. Restart the bot process on the server
3. If using SQLite, restore from a backup database file

## 6. Final Testing Checklist

Before concluding testing, verify:

- [ ] All commands respond correctly
- [ ] All text is displayed in the correct language (Russian for production)
- [ ] Images and media are displayed correctly
- [ ] Error messages are user-friendly
- [ ] Conversation flow is natural and intuitive
- [ ] All features from the testing guide are functional
- [ ] Bot performance is acceptable (response time < 3 seconds)
- [ ] State persistence works across sessions

## 7. Test Reporting

After completing the tests, prepare a report including:

1. Tests that passed successfully
2. Tests that failed or had issues
3. Screenshots of key interactions
4. Any unexpected behaviors or edge cases
5. Performance observations
6. Recommendations for improvements

This report will be valuable for future development phases and client communications.

---

By following this UAT testing plan, you can systematically verify all key functionality of the Sherlock AI Detective Bot before presenting it to the client as the Phase 1 MVP.
