#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Enhanced CLI Testing Tool for iMessage Sender
This script provides a command-line interface for testing various aspects
of the iMessage sender system without using the GUI.
"""

import os
import sys
import argparse
import logging
import time
import random
import unittest
import tempfile
import shutil
from datetime import datetime
from unittest.mock import patch, MagicMock

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

class TestMode:
    """Test modes for the CLI tool"""
    MOCK = "mock"      # Use mock sender for testing without sending real messages
    REAL = "real"      # Use real sender for testing with actual iMessage
    DRY_RUN = "dry-run"  # Prepare everything but don't actually send

class MockiMessageSender:
    """Mock implementation of iMessageSender for testing"""
    
    def __init__(self, logger=None, success_rate=1.0, simulate_delays=True):
        """
        Initialize mock sender
        
        Args:
            logger: Logger object
            success_rate: Fraction of messages that succeed (0.0-1.0)
            simulate_delays: Whether to simulate sending delays
        """
        self.logger = logger
        self.sent_messages = []
        self.success_rate = success_rate
        self.simulate_delays = simulate_delays
        self.media_files = []
        # Mock script path
        self.script_path = "/tmp/mock_script.scpt"
    
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
            'timestamp': datetime.now(),
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
    
    def add_media(self, media_path):
        """Mock adding media to the message"""
        if not os.path.exists(media_path):
            if self.logger:
                self.logger.error(f"MOCK: Media file not found: {media_path}")
            return False
        
        self.media_files.append(media_path)
        if self.logger:
            self.logger.info(f"MOCK: Added media file: {media_path}")
        return True
    
    def clear_media(self):
        """Clear the media files list"""
        self.media_files = []
        return True
    
    def cleanup(self):
        """Cleanup resources"""
        self.clear_media()
        return True

class TestRunner:
    """Class for running tests on the iMessage sender system"""
    
    def __init__(self, mode=TestMode.MOCK, config_path=None, verbose=False):
        """
        Initialize the test runner
        
        Args:
            mode (str): Test mode (mock, real, dry-run)
            config_path (str, optional): Path to configuration file
            verbose (bool): Enable verbose output
        """
        self.mode = mode
        self.verbose = verbose
        
        # Configure logging
        log_level = logging.DEBUG if verbose else logging.INFO
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        self.console_logger = logging.getLogger("test_runner")
        
        # Mock pandas if needed
        try:
            import pandas as pd
        except ImportError:
            sys.modules['pandas'] = MagicMock()
        
        # Import required modules
        try:
            from config import Config
            from contact_manager import ContactManager
            from message_template import MessageTemplate
            from imessage_sender import iMessageSender
            from logger import Logger
            
            # Initialize components
            self.config = Config(config_path)
            
            # Initialize logger
            log_path = self.config.get('log_path', 'logs')
            os.makedirs(log_path, exist_ok=True)
            self.logger = Logger(
                log_path=os.path.join(log_path, f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"),
                log_level="debug" if verbose else "info",
                console=True
            )
            
            self.contact_manager = ContactManager(logger=self.logger)
            self.template_manager = MessageTemplate(logger=self.logger)
            self._apply_template_formats()
            
            # Initialize sender based on mode
            if mode == TestMode.MOCK:
                # Create a mock sender
                self.sender = MockiMessageSender(logger=self.logger)
                self.sent_messages = []
                
            elif mode == TestMode.DRY_RUN:
                # Create sender but override send method to just log
                self.sender = MockiMessageSender(logger=self.logger)
                self.sent_messages = []
                
            else:  # REAL mode
                self.sender = iMessageSender(logger=self.logger)
                self.sent_messages = []
                
        except ImportError as e:
                self.console_logger.error(f"Error importing required modules: {str(e)}")
                self.console_logger.error("Make sure all requirements are installed and the project path is correct")
                sys.exit(1)

    def _apply_template_formats(self):
        """Apply date/time formats from config to the template manager with validation."""
        default_date_format = self.template_manager.date_format
        default_time_format = self.template_manager.time_format

        raw_date_format = self.config.get('date_format', default_date_format)
        raw_time_format = self.config.get('time_format', default_time_format)

        def _set_format(attr_name, raw_value, fallback):
            value = fallback if raw_value is None else str(raw_value)
            try:
                datetime.now().strftime(value)
                setattr(self.template_manager, attr_name, value)
            except Exception:
                self.logger.warning(
                    f"Invalid {attr_name} '{value}' in config, falling back to default"
                )
                setattr(self.template_manager, attr_name, fallback)

        _set_format('date_format', raw_date_format, default_date_format)
        _set_format('time_format', raw_time_format, default_time_format)
    
    def load_contacts(self, file_path):
        """
        Load contacts from a file
        
        Args:
            file_path (str): Path to contact file
            
        Returns:
            bool: True if contacts were loaded successfully, False otherwise
        """
        if not os.path.exists(file_path):
            self.console_logger.error(f"Contact file not found: {file_path}")
            return False
        
        # Determine file type from extension
        _, ext = os.path.splitext(file_path)
        ext = ext.lower()
        
        try:
            if ext == '.csv':
                count = self.contact_manager.load_from_csv(file_path)
            elif ext in ['.xls', '.xlsx']:
                count = self.contact_manager.load_from_excel(file_path)
            elif ext == '.txt':
                count = self.contact_manager.load_from_txt(file_path)
            else:
                self.console_logger.error(f"Unsupported file type: {ext}")
                return False
            
            self.console_logger.info(f"Loaded {count} contacts from {file_path}")
            return count > 0
            
        except Exception as e:
            self.console_logger.error(f"Error loading contacts: {str(e)}")
            return False
    
    def load_template(self, file_path):
        """
        Load a message template from a file
        
        Args:
            file_path (str): Path to template file
            
        Returns:
            bool: True if template was loaded successfully, False otherwise
        """
        if not os.path.exists(file_path):
            self.console_logger.error(f"Template file not found: {file_path}")
            return False
        
        try:
            result = self.template_manager.load_from_file(file_path)
            if result:
                variables = self.template_manager.get_template_variables()
                self.console_logger.info(f"Loaded template with variables: {', '.join(variables)}")
            else:
                self.console_logger.error("Failed to load template")
            
            return result
            
        except Exception as e:
            self.console_logger.error(f"Error loading template: {str(e)}")
            return False
    
    def add_media(self, file_path):
        """
        Add a media file for sending
        
        Args:
            file_path (str): Path to media file
            
        Returns:
            bool: True if media was added successfully, False otherwise
        """
        if not os.path.exists(file_path):
            self.console_logger.error(f"Media file not found: {file_path}")
            return False
        
        try:
            result = self.sender.add_media(file_path)
            if result:
                self.console_logger.info(f"Added media file: {file_path}")
            else:
                self.console_logger.error(f"Failed to add media file: {file_path}")
            
            return result
            
        except Exception as e:
            self.console_logger.error(f"Error adding media: {str(e)}")
            return False
    
    def send_test_message(self, phone=None, context=None):
        """
        Send a test message to a single contact
        
        Args:
            phone (str, optional): Phone number to send to. If None, use first contact.
            context (dict, optional): Context data for template rendering.
            
        Returns:
            bool: True if message was sent successfully, False otherwise
        """
        # Get contact
        if phone is None:
            contacts = self.contact_manager.get_contacts()
            if not contacts:
                self.console_logger.error("No contacts loaded")
                return False
            
            contact = contacts[0]
            phone = contact.get('phone')
        else:
            # Find contact matching the phone number
            contact = None
            for c in self.contact_manager.get_contacts():
                if c.get('phone') == phone:
                    contact = c
                    break
            
            # If not found, create a basic contact
            if contact is None:
                contact = {'phone': phone}
        
        # Prepare context
        if context is None:
            context = {}
        
        # Use contact data to fill missing context values
        for key, value in contact.items():
            if key not in context:
                context[key] = value
        
        # Add default values for common variables
        if 'name' not in context:
            context['name'] = "Test User"
        if 'company' not in context:
            context['company'] = "Test Company"
        if 'event' not in context:
            context['event'] = "test event"
        
        # Render template
        message = self.template_manager.render(context)
        
        # Log message
        self.console_logger.info(f"Sending test message to {phone}:")
        self.console_logger.info("-" * 40)
        self.console_logger.info(message)
        self.console_logger.info("-" * 40)
        
        # Get user confirmation in real mode
        if self.mode == TestMode.REAL:
            confirm = input("Send this message? (y/n): ")
            if confirm.lower() != 'y':
                self.console_logger.info("Message sending cancelled")
                return False
        
        # Send message
        try:
            if self.mode == TestMode.REAL:
                self.console_logger.info(f"Sending message to {phone}...")
            
            result = self.sender.send(phone, message)
            
            if self.mode == TestMode.REAL:
                if result:
                    self.console_logger.info(f"Message sent successfully to {phone}")
                else:
                    self.console_logger.error(f"Failed to send message to {phone}")
            
            # Record message for all modes
            if result and hasattr(self, 'sent_messages'):
                self.sent_messages.append({
                    'phone': phone,
                    'message': message,
                    'timestamp': datetime.now()
                })
            
            return result
            
        except Exception as e:
            self.console_logger.error(f"Error sending message: {str(e)}")
            return False
    
    def send_bulk(self, limit=None, delay_min=None, delay_max=None):
        """
        Send bulk messages to all contacts
        
        Args:
            limit (int, optional): Maximum number of messages to send
            delay_min (float, optional): Minimum delay between messages (seconds)
            delay_max (float, optional): Maximum delay between messages (seconds)
            
        Returns:
            dict: Statistics about the sending process
        """
        # Get contacts
        contacts = self.contact_manager.get_contacts()
        if not contacts:
            self.console_logger.error("No contacts loaded")
            return {"total": 0, "sent": 0, "failed": 0}
        
        # Apply limit
        if limit is not None and limit > 0:
            contacts = contacts[:limit]
        
        # Get delays from config if not specified, with validation
        default_delay_min = self.config.get('delay_min', 3.0)
        default_delay_max = self.config.get('delay_max', 7.0)

        delay_min = default_delay_min if delay_min is None else delay_min
        delay_max = default_delay_max if delay_max is None else delay_max

        try:
            delay_min = float(delay_min)
            delay_max = float(delay_max)
        except (TypeError, ValueError):
            self.console_logger.warning(
                "Invalid delay values provided; falling back to defaults"
            )
            delay_min = float(default_delay_min)
            delay_max = float(default_delay_max)

        if delay_min < 0 or delay_max < 0:
            self.console_logger.warning("Delays cannot be negative; clamping to zero")
            delay_min = max(delay_min, 0.0)
            delay_max = max(delay_max, 0.0)

        if delay_min > delay_max:
            self.console_logger.warning(
                f"Minimum delay ({delay_min}) greater than maximum ({delay_max}); swapping values"
            )
            delay_min, delay_max = delay_max, delay_min
        
        # Initialize statistics
        stats = {
            "total": len(contacts),
            "sent": 0,
            "failed": 0,
            "start_time": datetime.now(),
            "end_time": None
        }
        
        # Confirm in real mode
        if self.mode == TestMode.REAL:
            self.console_logger.info(f"About to send messages to {len(contacts)} contacts")
            confirm = input(f"Continue with sending {len(contacts)} messages? (y/n): ")
            if confirm.lower() != 'y':
                self.console_logger.info("Bulk sending cancelled")
                return stats
        
        # Send messages
        self.console_logger.info(f"Starting bulk send to {len(contacts)} contacts...")
        
        for i, contact in enumerate(contacts, 1):
            phone = contact.get('phone')
            if not phone:
                self.console_logger.warning(f"Contact #{i} has no phone number, skipping")
                stats['failed'] += 1
                continue
            
            # Render template
            message = self.template_manager.render(contact)
            
            # Send message
            try:
                self.console_logger.info(f"[{i}/{len(contacts)}] Sending to {phone}...")
                
                result = self.sender.send(phone, message)
                
                if result:
                    self.console_logger.info(f"✓ Message sent to {phone}")
                    stats['sent'] += 1
                else:
                    self.console_logger.error(f"✗ Failed to send to {phone}")
                    stats['failed'] += 1
                
                # Record message for non-real modes
                if result and hasattr(self, 'sent_messages') and self.mode != TestMode.REAL:
                    self.sent_messages.append({
                        'phone': phone,
                        'message': message,
                        'timestamp': datetime.now()
                    })
                
                # Add delay between messages (except for the last one)
                if i < len(contacts):
                    delay = random.uniform(delay_min, delay_max)
                    if self.verbose:
                        self.console_logger.debug(f"Waiting {delay:.2f} seconds...")
                    time.sleep(delay)
                
            except Exception as e:
                self.console_logger.error(f"Error sending to {phone}: {str(e)}")
                stats['failed'] += 1
        
        # Update statistics
        stats['end_time'] = datetime.now()
        duration = (stats['end_time'] - stats['start_time']).total_seconds()
        
        # Print summary
        self.console_logger.info("=" * 40)
        self.console_logger.info("Bulk sending completed")
        self.console_logger.info(f"Total: {stats['total']}")
        self.console_logger.info(f"Sent: {stats['sent']}")
        self.console_logger.info(f"Failed: {stats['failed']}")
        self.console_logger.info(f"Duration: {duration:.2f} seconds")
        self.console_logger.info("=" * 40)
        
        return stats
    
    def generate_report(self):
        """
        Generate a report of sent messages
        
        Returns:
            str: Path to the generated report
        """
        if self.mode == TestMode.REAL and hasattr(self.logger, 'generate_report'):
            # Use logger's report generation in real mode
            return self.logger.generate_report(format_type='html')
        else:
            # Generate a custom report in mock/dry-run modes
            report_dir = self.config.get('reports_path', 'reports')
            os.makedirs(report_dir, exist_ok=True)
            
            report_path = os.path.join(
                report_dir, 
                f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            )
            
            # Create simple HTML report
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write("<!DOCTYPE html>\n")
                f.write("<html>\n<head>\n")
                f.write("<meta charset='utf-8'>\n")
                f.write("<title>Test Report</title>\n")
                f.write("<style>\n")
                f.write("body { font-family: Arial, sans-serif; margin: 20px; }\n")
                f.write("h1 { color: #333; }\n")
                f.write("table { border-collapse: collapse; width: 100%; }\n")
                f.write("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n")
                f.write("th { background-color: #f2f2f2; }\n")
                f.write("tr:nth-child(even) { background-color: #f9f9f9; }\n")
                f.write("</style>\n")
                f.write("</head>\n<body>\n")
                
                f.write(f"<h1>Test Report - {self.mode.upper()} Mode</h1>\n")
                f.write(f"<p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>\n")
                
                # Message statistics
                f.write("<h2>Message Statistics</h2>\n")
                f.write(f"<p>Total messages sent: {len(self.sent_messages)}</p>\n")
                
                # Message list
                if self.sent_messages:
                    f.write("<h2>Sent Messages</h2>\n")
                    f.write("<table>\n")
                    f.write("<tr><th>#</th><th>Time</th><th>Phone</th><th>Message</th></tr>\n")
                    
                    for i, msg in enumerate(self.sent_messages, 1):
                        time_str = msg['timestamp'].strftime('%H:%M:%S')
                        phone = msg['phone']
                        # Truncate message if too long
                        message = msg['message']
                        if len(message) > 100:
                            message = message[:97] + "..."
                        
                        f.write(f"<tr><td>{i}</td><td>{time_str}</td><td>{phone}</td><td>{message}</td></tr>\n")
                    
                    f.write("</table>\n")
                
                f.write("</body>\n</html>")
            
            self.console_logger.info(f"Report generated: {report_path}")
            return report_path


def create_test_csv():
    """Create a test CSV file for contacts"""
    # Create a directory for test files
    test_files_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_files')
    os.makedirs(test_files_dir, exist_ok=True)
    
    # Create the test CSV file
    csv_path = os.path.join(test_files_dir, 'test_contacts.csv')
    
    with open(csv_path, 'w', encoding='utf-8') as f:
        f.write("phone,name,company,event,date\n")
        f.write("+79161234567,John Doe,ACME Inc,product launch,2025-04-20\n")
        f.write("+79162345678,Jane Smith,XYZ Corp,webinar,2025-04-25\n")
        f.write("+79163456789,Bob Johnson,ABC Ltd,meeting,2025-05-01\n")
    
    print(f"✅ Test CSV file created: {csv_path}")
    return csv_path


def create_test_template():
    """Create a test template file for messages"""
    # Create a directory for test files
    test_files_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_files')
    os.makedirs(test_files_dir, exist_ok=True)
    
    # Create the test template file
    template_path = os.path.join(test_files_dir, 'test_template.txt')
    
    with open(template_path, 'w', encoding='utf-8') as f:
        f.write("""Hello, {{ name }}!

We would like to remind you about the {{ event }} scheduled for {{ date }}.

Best regards,
{{ company }}
""")
    
    print(f"✅ Test template file created: {template_path}")
    return template_path


def create_gui_test_checklist():
    """Create a checklist for GUI testing"""
    # Create a directory for test files
    test_files_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_files')
    os.makedirs(test_files_dir, exist_ok=True)
    
    # Create the checklist file
    checklist_path = os.path.join(test_files_dir, 'gui_test_checklist.md')
    
    # Read from the new file if it exists
    new_checklist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'new', 'gui-test-checklist.md')
    
    if os.path.exists(new_checklist_path):
        # Copy the new checklist
        with open(new_checklist_path, 'r', encoding='utf-8') as src:
            content = src.read()
            
        with open(checklist_path, 'w', encoding='utf-8') as dest:
            dest.write(content)
    else:
        # Use the original checklist
        with open(checklist_path, 'w', encoding='utf-8') as f:
            f.write("""# GUI Testing Checklist for iMessage Sender

## General UI
- [ ] Application launches correctly
- [ ] All tabs/sections are accessible
- [ ] Icons and graphics display correctly
- [ ] Responsive layout works at different window sizes
- [ ] All buttons and controls are properly labeled
- [ ] Tooltips work correctly where applicable

## Contact Management
- [ ] Contact import works with CSV files
- [ ] Contact import works with Excel files (if applicable)
- [ ] Contact import works with TXT files
- [ ] Contact list displays correctly with all expected columns
- [ ] Contact search/filter functionality works
- [ ] Contact export functionality works
- [ ] Duplicate contact detection works as expected
- [ ] Phone number validation works correctly

## Template Management
- [ ] Template editor loads and displays correctly
- [ ] Template variables are properly highlighted/indicated
- [ ] Template preview shows correctly with sample data
- [ ] Template save functionality works
- [ ] Template load functionality works
- [ ] Special variables (date, time, etc.) render correctly

## Message Sending
- [ ] Sending single message works correctly
- [ ] Bulk message sending works correctly
- [ ] Delay settings affect sending speed as expected
- [ ] Progress indicator updates correctly during sending
- [ ] Error handling for failed messages works correctly
- [ ] Attachments/media can be added to messages (if supported)

## Configuration
- [ ] Configuration settings can be changed
- [ ] Configuration settings persist between sessions
- [ ] Logging level settings take effect

## Logging and Reporting
- [ ] Log viewer displays logs correctly
- [ ] Log filtering works as expected
- [ ] Log export functionality works
- [ ] Reports can be generated
- [ ] Reports contain expected information

## Error Handling
- [ ] Application handles network errors gracefully
- [ ] Application handles file access errors correctly
- [ ] Error messages are clear and helpful
- [ ] Application doesn't crash on unexpected input

## Performance
- [ ] Application is responsive during operation
- [ ] Large contact lists don't cause performance issues
- [ ] Sending many messages doesn't cause freezing/crashing

## Notes
- Document any bugs or unexpected behavior here
- Note any performance issues or usability concerns
- Record suggestions for improvements
""")
    
    print(f"✅ GUI test checklist created: {checklist_path}")
    return checklist_path


def create_mock_test_strategy():
    """Create a mock test strategy document"""
    # Create a directory for test files
    test_files_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_files')
    os.makedirs(test_files_dir, exist_ok=True)
    
    # Create the mock test strategy file
    mock_path = os.path.join(test_files_dir, 'mock_test_strategy.md')
    
    # Read from the new file if it exists
    new_mock_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'new', 'mock-test-strategy.md')
    
    if os.path.exists(new_mock_path):
        # Copy the new mock test strategy
        with open(new_mock_path, 'r', encoding='utf-8') as src:
            content = src.read()
            
        with open(mock_path, 'w', encoding='utf-8') as dest:
            dest.write(content)
    else:
        # Create a basic mock test strategy
        with open(mock_path, 'w', encoding='utf-8') as f:
            f.write("""# Mock Testing Strategy for iMessage Sender

## Why Use Mocks

Testing the iMessage sender without sending actual messages is important for:
1. Automated testing
2. Preventing accidental spam
3. Testing error conditions
4. Testing without requiring Apple ID credentials

## Mock Implementation

The `MockiMessageSender` class provided in this package implements the same interface
as the real `iMessageSender` but doesn't actually send any messages.

## Usage

```python
# Create a mock sender
sender = MockiMessageSender(logger=logger)

# Use it just like the real sender
sender.send("+79161234567", "Test message")

# Check the sent messages
sent_messages = sender.get_sent_messages()
print(f"Sent {len(sent_messages)} messages")
```

## Test Modes

This package supports three testing modes:
- `MOCK`: Uses a mock sender that simulates sending without actually sending
- `DRY_RUN`: Similar to mock but better for checking what would be sent before a real run
- `REAL`: Uses the actual iMessageSender for real sending (use with caution)

## Best Practices

1. Always start with mock or dry-run mode
2. Only use real mode with your own phone numbers
3. Keep test volumes very low (1-5 messages)
4. Space out test sessions to avoid triggering spam detection
""")
    
    print(f"✅ Mock test strategy created: {mock_path}")
    return mock_path


def create_deployment_package():
    """Create a deployment package script"""
    # Create a directory for test files
    test_files_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_files')
    os.makedirs(test_files_dir, exist_ok=True)
    
    # Check if the new deployment script exists
    new_deploy_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'new', 'prepare-deployment.py')
    
    if os.path.exists(new_deploy_path):
        # Copy the new deployment script
        deploy_path = os.path.join(test_files_dir, 'prepare_deployment.py')
        with open(new_deploy_path, 'r', encoding='utf-8') as src:
            content = src.read()
            
        with open(deploy_path, 'w', encoding='utf-8') as dest:
            dest.write(content)
            
        # Make executable
        os.chmod(deploy_path, 0o755)
    else:
        # Use the original deployment script
        deploy_path = os.path.join(test_files_dir, 'prepare_deployment.py')
        
        with open(deploy_path, 'w', encoding='utf-8') as f:
            f.write("""#!/usr/bin/env python3
# -*- coding: utf-8 -*-

\"\"\"
Script to prepare the iMessage Sender for deployment
\"\"\"

import os
import sys
import shutil
import argparse
import subprocess
from datetime import datetime

# Get the project root directory
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def run_tests():
    \"\"\"Run all unit tests\"\"\"
    print("Running tests...")
    test_script = os.path.join(project_root, 'test_cli.py')
    
    try:
        result = subprocess.run(
            [sys.executable, test_script],
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        print("✅ Tests completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print("❌ Tests failed:")
        print(e.stdout)
        print(e.stderr)
        return False


def create_deployment_package(output_dir, version):
    \"\"\"Create a deployment package\"\"\"
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Create the package directory name
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    package_name = f"imessage_sender_v{version}_{timestamp}"
    package_dir = os.path.join(output_dir, package_name)
    
    # Create the package directory
    os.makedirs(package_dir)
    
    # Files to include in the package
    include_files = [
        'contact_manager.py',
        'message_template.py',
        'imessage_sender.py',
        'logger.py',
        'config.py',
        'setup.py',
        'requirements.txt',
        'readme (1).md',
        'user-manual.md'
    ]
    
    # Create directories
    os.makedirs(os.path.join(package_dir, 'templates'), exist_ok=True)
    os.makedirs(os.path.join(package_dir, 'docs'), exist_ok=True)
    
    # Copy files
    for file in include_files:
        source_path = os.path.join(project_root, file)
        if os.path.exists(source_path):
            if file == 'readme (1).md':
                # Rename readme file
                dest_path = os.path.join(package_dir, 'README.md')
            elif file == 'user-manual.md':
                # Move user manual to docs directory
                dest_path = os.path.join(package_dir, 'docs', 'user-manual.md')
            else:
                dest_path = os.path.join(package_dir, file)
            
            # Copy the file
            shutil.copy2(source_path, dest_path)
            print(f"Copied {file} to {dest_path}")
    
    # Create sample template files
    template_dir = os.path.join(package_dir, 'templates')
    create_sample_templates(template_dir)
    
    # Create a zip archive
    archive_path = os.path.join(output_dir, f"{package_name}.zip")
    shutil.make_archive(
        os.path.splitext(archive_path)[0],  # Base name (without extension)
        'zip',                              # Format
        package_dir                         # Root directory to archive
    )
    
    print(f"\\n✅ Deployment package created: {archive_path}")
    return archive_path


def create_sample_templates(template_dir):
    \"\"\"Create sample template files\"\"\"
    # Sample template 1 - Basic
    basic_template_path = os.path.join(template_dir, 'basic_template.txt')
    with open(basic_template_path, 'w', encoding='utf-8') as f:
        f.write(\"\"\"Hello, {{ name }}!

We would like to inform you about {{ event }}.

Best regards,
{{ company }}
\"\"\")
    
    # Sample template 2 - Reminder
    reminder_template_path = os.path.join(template_dir, 'reminder_template.txt')
    with open(reminder_template_path, 'w', encoding='utf-8') as f:
        f.write(\"\"\"Dear {{ name }},

This is a friendly reminder about {{ event }} scheduled for {{ date }}.

Please confirm your attendance.

Best regards,
{{ company }}
{{ phone }}
\"\"\")
    
    # Sample template 3 - Marketing
    marketing_template_path = os.path.join(template_dir, 'marketing_template.txt')
    with open(marketing_template_path, 'w', encoding='utf-8') as f:
        f.write(\"\"\"Hello {{ name }}!

We're excited to announce {{ product }} is now available with a special {{ discount }} discount.

Use promocode: {{ promocode }}

Valid until: {{ date }}

Best regards,
{{ company }}
\"\"\")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Prepare iMessage Sender for deployment')
    parser.add_argument('--output', '-o', default='dist', help='Output directory for the deployment package')
    parser.add_argument('--version', '-v', default='1.0.0', help='Version number')
    parser.add_argument('--skip-tests', action='store_true', help='Skip running tests')
    
    args = parser.parse_args()
    
    # Make output path absolute if it's relative
    output_dir = args.output
    if not os.path.isabs(output_dir):
        output_dir = os.path.join(project_root, output_dir)
    
    # Run tests if not skipped
    if not args.skip_tests:
        if not run_tests():
            print("\\n⚠️ Tests failed. Continue with deployment? (y/n): ", end='')
            if input().lower() != 'y':
                print("Deployment cancelled.")
                sys.exit(1)
    
    # Create deployment package
    create_deployment_package(output_dir, args.version)
""")
        
        # Make executable
        os.chmod(deploy_path, 0o755)
    
    print(f"✅ Deployment package script created: {deploy_path}")
    return deploy_path


def create_cli_test_script():
    """Create a CLI test script for sending messages"""
    # Create a directory for test files
    test_files_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_files')
    os.makedirs(test_files_dir, exist_ok=True)
    
    # Create the CLI test script
    script_path = os.path.join(test_files_dir, 'send_test_message.py')
    
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write("""#!/usr/bin/env python3
# -*- coding: utf-8 -*-

\"\"\"
CLI script for testing iMessage sending
\"\"\"

import os
import sys
import argparse
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import required modules
try:
    from logger import Logger
    from message_template import MessageTemplate
    from imessage_sender import iMessageSender
except ImportError:
    print("Error: Required modules not found. Make sure you are running this from the correct directory.")
    print("This script should be run from the test_files directory of the iMessage Sender project.")
    sys.exit(1)


def send_test_message(phone_number, template_file=None, name="Test User", company="Test Company", event="test event"):
    \"\"\"Send a test message using the iMessage sender\"\"\"
    # Create logger
    logger = Logger(console=True, log_level='debug')
    
    # Create message template
    template = MessageTemplate(logger=logger)
    
    # Set template text
    if template_file and os.path.exists(template_file):
        template.load_from_file(template_file)
    else:
        template_text = \"\"\"Hello, {{ name }}!

This is a test message from the iMessage Sender.
Event: {{ event }}
Date: {{ date }}

Best regards,
{{ company }}
\"\"\"
        template.set_template(template_text)
    
    # Create context data
    context = {
        'name': name,
        'company': company,
        'event': event,
        'date': datetime.now().strftime('%Y-%m-%d')
    }
    
    # Render the message
    message = template.render(context)
    
    # Create iMessage sender
    sender = iMessageSender(logger=logger)
    
    # Send the message
    print(f"\\nSending message to {phone_number}:\\n{message}\\n")
    
    # Ask for confirmation
    confirmation = input("Send this message? (y/n): ")
    if confirmation.lower() != 'y':
        print("Message sending cancelled.")
        return False
    
    # Send the message
    result = sender.send(phone_number, message)
    
    if result:
        print("✅ Message sent successfully!")
    else:
        print("❌ Failed to send message")
    
    # Clean up
    sender.cleanup()
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Send a test iMessage')
    parser.add_argument('phone', help='Phone number to send the message to')
    parser.add_argument('--template', '-t', help='Path to a template file (optional)')
    parser.add_argument('--name', '-n', default='Test User', help='Recipient name')
    parser.add_argument('--company', '-c', default='Test Company', help='Company name')
    parser.add_argument('--event', '-e', default='test event', help='Event description')
    parser.add_argument('--mock', action='store_true', help='Use mock sender (no actual message sent)')
    
    args = parser.parse_args()
    
    # If mock mode is enabled, replace iMessageSender with a mock version
    if args.mock:
        from unittest.mock import MagicMock
        
        # Save the original class
        original_iMessageSender = iMessageSender
        
        # Create a mock class
        class MockiMessageSender:
            def __init__(self, logger=None, **kwargs):
                self.logger = logger
                if logger:
                    logger.info("Created mock iMessage sender")
            
            def send(self, phone, message):
                if self.logger:
                    self.logger.info(f"MOCK: Would send message to {phone}")
                print(f"MOCK MODE: Message would be sent to {phone}")
                return True
            
            def add_media(self, media_path):
                if self.logger:
                    self.logger.info(f"MOCK: Would add media: {media_path}")
                return True
            
            def cleanup(self):
                if self.logger:
                    self.logger.info("MOCK: Cleanup called")
                return True
        
        # Replace the real sender with the mock
        iMessageSender = MockiMessageSender
    
    send_test_message(args.phone, args.template, args.name, args.company, args.event)
    
    # Restore the original class if it was mocked
    if args.mock and 'original_iMessageSender' in locals():
        iMessageSender = original_iMessageSender
""")
    
    # Make the script executable
    os.chmod(script_path, 0o755)
    
    print(f"✅ CLI test script created: {script_path}")
    return script_path


def run_tests(test_module=None):
    """Run unit tests"""
    # Set up the test environment
    # Mock pandas for testing without dependency
    sys.modules['pandas'] = MagicMock()
    
    # Add the current directory to sys.path
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    if test_module:
        # Run specific test module
        if not test_module.startswith('tests.'):
            test_module = f'tests.{test_module}'
        suite = unittest.defaultTestLoader.loadTestsFromName(test_module)
    else:
        # Run all tests in the tests directory
        test_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tests')
        suite = unittest.defaultTestLoader.discover(test_dir)
    
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    return result.wasSuccessful()


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='iMessage Sender testing tool')
    parser.add_argument('--run-all', action='store_true', help='Run all tests')
    parser.add_argument('--test-module', help='Run a specific test module')
    parser.add_argument('--mode', choices=[TestMode.MOCK, TestMode.REAL, TestMode.DRY_RUN], 
                        default=TestMode.MOCK, help='Test mode (default: mock)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose output')
    
    # Input files
    parser.add_argument('--contacts', help='Path to contacts file')
    parser.add_argument('--template', help='Path to template file')
    parser.add_argument('--media', help='Path to media file')
    
    # Test options
    parser.add_argument('--test-send', action='store_true', help='Send a test message')
    parser.add_argument('--phone', help='Phone number for test message')
    parser.add_argument('--bulk-send', action='store_true', help='Send bulk messages')
    parser.add_argument('--limit', type=int, help='Limit number of messages to send')
    parser.add_argument('--delay-min', type=float, help='Minimum delay between messages (seconds)')
    parser.add_argument('--delay-max', type=float, help='Maximum delay between messages (seconds)')
    parser.add_argument('--report', action='store_true', help='Generate a report after sending')
    
    # Resource creation commands
    parser.add_argument('--create-test-csv', action='store_true', help='Create a test CSV file for contacts')
    parser.add_argument('--create-test-template', action='store_true', help='Create a test template file for messages')
    parser.add_argument('--create-cli-script', action='store_true', help='Create a CLI test script for manual testing')
    parser.add_argument('--create-gui-checklist', action='store_true', help='Create a checklist for GUI testing')
    parser.add_argument('--create-deployment', action='store_true', help='Create deployment package script')
    parser.add_argument('--create-mock-strategy', action='store_true', help='Create mock test strategy document')
    
    args = parser.parse_args()
    
    if len(sys.argv) == 1:
        parser.print_help()
        return True
    
    # Handle resource creation commands
    if args.create_test_csv:
        create_test_csv()
        return True
    
    if args.create_test_template:
        create_test_template()
        return True
    
    if args.create_cli_script:
        create_cli_test_script()
        return True
    
    if args.create_gui_checklist:
        create_gui_test_checklist()
        return True
    
    if args.create_deployment:
        create_deployment_package()
        return True
    
    if args.create_mock_strategy:
        create_mock_test_strategy()
        return True
    
    # Handle testing commands
    if args.run_all:
        success = run_tests()
        return success
    
    if args.test_module:
        success = run_tests(args.test_module)
        return success
    
    # Interactive testing with TestRunner
    if args.test_send or args.bulk_send or args.report:
        # Create test runner
        runner = TestRunner(mode=args.mode, verbose=args.verbose)
        
        # Load inputs
        if args.contacts:
            if not runner.load_contacts(args.contacts):
                sys.exit(1)
        
        if args.template:
            if not runner.load_template(args.template):
                sys.exit(1)
        
        if args.media:
            if not runner.add_media(args.media):
                sys.exit(1)
        
        # Run tests
        if args.test_send:
            if not runner.send_test_message(phone=args.phone):
                sys.exit(1)
        
        # Bulk sending
        if args.bulk_send:
            stats = runner.send_bulk(
                limit=args.limit,
                delay_min=args.delay_min,
                delay_max=args.delay_max
            )
            
            if stats['sent'] == 0 and stats['total'] > 0:
                sys.exit(1)
        
        # Generate report
        if args.report:
            runner.generate_report()
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
