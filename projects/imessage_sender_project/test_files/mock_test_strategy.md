# Mock Testing Strategy for iMessage Sender

## Why Use Mocks

Testing the `iMessageSender` class without sending actual messages is crucial for:
1. Automated CI/CD pipelines
2. Avoiding rate limits or account blocks during testing
3. Testing error scenarios that might be hard to reproduce

## Implementation Steps

### 1. Create a Mock Version of iMessageSender

```python
class MockiMessageSender(iMessageSender):
    """Mock implementation of iMessageSender for testing"""
    
    def __init__(self, logger=None, success_rate=1.0, simulate_delays=True):
        """
        Initialize mock sender
        
        Args:
            logger: Logger object
            success_rate: Fraction of messages that succeed (0.0-1.0)
            simulate_delays: Whether to simulate sending delays
        """
        super().__init__(logger=logger, use_applescript=False)
        self.sent_messages = []
        self.success_rate = success_rate
        self.simulate_delays = simulate_delays
    
    def send(self, phone, message):
        """Mock sending a message"""
        import random
        import time
        
        # Log the attempt
        if self.logger:
            self.logger.info(f"MOCK: Attempting to send message to {phone}")
        
        # Store the message
        self.sent_messages.append({
            'phone': phone,
            'message': message,
            'timestamp': time.time(),
            'media_files': self.media_files.copy() if self.media_files else []
        })
        
        # Simulate delay
        if self.simulate_delays:
            time.sleep(random.uniform(0.1, 0.5))
        
        # Determine success based on success rate
        success = random.random() < self.success_rate
        
        if success:
            if self.logger:
                self.logger.info(f"MOCK: Message successfully sent to {phone}")
            return True
        else:
            if self.logger:
                self.logger.error(f"MOCK: Failed to send message to {phone}")
            return False
    
    def get_sent_messages(self):
        """Get all sent messages"""
        return self.sent_messages
    
    def clear_sent_messages(self):
        """Clear the sent messages list"""
        self.sent_messages = []
```

### 2. Update Existing Tests to Use the Mock

In your test files, replace the actual `iMessageSender` with the mock version:

```python
def test_sending_message():
    """Test sending a message"""
    # Create a mock sender
    mock_sender = MockiMessageSender(success_rate=1.0)
    
    # Send a test message
    result = mock_sender.send("+79161234567", "Test message")
    
    # Check the result
    assert result == True
    assert len(mock_sender.sent_messages) == 1
    assert mock_sender.sent_messages[0]['phone'] == "+79161234567"
    assert mock_sender.sent_messages[0]['message'] == "Test message"
```

### 3. Add Specific Test Cases

Add tests for various error conditions and edge cases:

```python
def test_sending_failure():
    """Test sending failure"""
    # Create a mock sender with 0% success rate
    mock_sender = MockiMessageSender(success_rate=0.0)
    
    # Send a test message
    result = mock_sender.send("+79161234567", "Test message")
    
    # Check the result
    assert result == False
    assert len(mock_sender.sent_messages) == 1  # Message still recorded

def test_media_attachment():
    """Test sending with media attachment"""
    mock_sender = MockiMessageSender()
    
    # Add a mock media file
    mock_sender.add_media("test_files/test_image.jpg")
    
    # Send a test message
    result = mock_sender.send("+79161234567", "Test message with media")
    
    # Check the result
    assert result == True
    assert len(mock_sender.sent_messages) == 1
    assert len(mock_sender.sent_messages[0]['media_files']) == 1
```

## Integration with Main Code

To switch between real and mock implementations, you can use a configuration option:

```python
# In config.py, add:
'use_mock_sender': False,  # Set to True for testing

# In your main code:
if config.get('use_mock_sender', False):
    sender = MockiMessageSender(logger=logger)
else:
    sender = iMessageSender(logger=logger)
```

## Manual Testing Phases

1. **Unit Tests with Mocks**: Run all tests with mocks to ensure core functionality works
2. **Limited Real Tests**: Test with 1-2 real numbers (ideally your own) to verify actual sending
3. **Final Validation**: Complete end-to-end testing with real user flows

This approach allows thorough testing without risking account blocks or sending unwanted messages during development.
