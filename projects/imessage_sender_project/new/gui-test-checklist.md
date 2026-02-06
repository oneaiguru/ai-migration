# GUI Testing Checklist for iMessage Sender

## Setup

- [ ] Create a dedicated testing directory with:
  - [ ] Test contacts file (3-5 contacts, preferably your own numbers)
  - [ ] Sample templates with various variables
  - [ ] Test media files (image, document)
  - [ ] Custom configuration file

## Basic Interface Testing

### Application Startup
- [ ] Application launches without errors
- [ ] All tabs are visible: Contacts, Templates, Sending, Logs, Settings
- [ ] Toolbar buttons are functional
- [ ] Status bar shows "Ready" on startup

### Contacts Tab
- [ ] Load contacts from CSV file
- [ ] Load contacts from TXT file
- [ ] Contacts display correctly in the table
- [ ] Search/filter functionality works
- [ ] Export contacts to CSV works
- [ ] Clear contacts list works

### Templates Tab
- [ ] Create new template
- [ ] Save template to file
- [ ] Load template from file
- [ ] Template variables are detected and displayed
- [ ] Preview with test data works
- [ ] Switching between templates works

### Sending Tab
- [ ] Contacts and templates can be selected
- [ ] Media files can be added and cleared
- [ ] Interval settings can be adjusted
- [ ] Test sending button works
- [ ] Start/stop sending buttons work
- [ ] Progress bar updates during sending
- [ ] Log display updates with send events

### Logs and Reports Tab
- [ ] Log entries display correctly
- [ ] Log filtering by level works
- [ ] Log searching works
- [ ] Report generation works
- [ ] Reports can be opened and viewed
- [ ] Report deletion works

### Settings Tab
- [ ] All settings can be viewed and modified
- [ ] Settings are saved when closing
- [ ] Directory paths can be selected
- [ ] Settings export/import works
- [ ] Reset to defaults works

## Error Handling

- [ ] Invalid file selection shows appropriate error message
- [ ] Missing template shows appropriate error message
- [ ] Missing contacts shows appropriate error message
- [ ] Network/connection errors are handled gracefully
- [ ] Invalid settings are rejected with feedback

## Integration Testing

- [ ] Complete workflow test:
  1. Load contacts
  2. Create template
  3. Send test message
  4. View logs
  5. Generate report

## Performance Testing

- [ ] UI remains responsive during sending operations
- [ ] Large contact lists (50+ contacts) load and display correctly
- [ ] Large log files display without significant delay

## Edge Cases

- [ ] Unicode/special characters in messages are handled correctly
- [ ] Extremely long messages don't cause issues
- [ ] Multi-paragraph messages format correctly
- [ ] Templates with missing variables show appropriate warnings
- [ ] Application handles abrupt closure during sending

## Final Checklist

- [ ] All user-facing text is free of typos and grammatical errors
- [ ] UI elements are consistently sized and aligned
- [ ] Error messages are clear and actionable
- [ ] Help/documentation is accessible (if implemented)

## Testing Matrix (Operating Systems)

| Test Case | macOS 12 | macOS 13 | macOS 14 |
|-----------|----------|----------|----------|
| Basic UI  |          |          |          |
| Sending   |          |          |          |
| Reports   |          |          |          |

## Known Limitations (Document These)

- [ ] List limitations of the current implementation
- [ ] Document potential API rate limits
- [ ] Note compatible media formats
- [ ] Document maximum recommended sending volumes

## Test With Real Numbers (Limited)

Before delivering to the client, test with a small set of real numbers (your own or team members') to verify end-to-end functionality:

- [ ] Test single message sending
- [ ] Test message with media sending
- [ ] Test bulk sending with 3-5 recipients
