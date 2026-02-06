#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Test configuration and helper functions for iMessage sender tests
"""

import os
import sys
import unittest
from unittest.mock import patch, MagicMock
import tempfile
import shutil

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import project modules
from config import Config
from contact_manager import ContactManager
from logger import Logger
from message_template import MessageTemplate
from imessage_sender import iMessageSender

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
        # Override the script creation to avoid file access issues in tests
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
            'timestamp': time.time(),
            'media_files': self.media_files.copy() if self.media_files else []
        })
        
        # Simulate delay
        if self.simulate_delays:
            time.sleep(0.1)  # Small delay for tests
        
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
    
    def _create_send_script(self):
        """Override to avoid file creation"""
        return self.script_path
    
    def _execute_applescript(self, script_args):
        """Override to avoid subprocess calls"""
        return True, "Mock output"

# Create a test environment with temporary files
def create_test_environment():
    """Create a test environment with all necessary files"""
    temp_dir = tempfile.mkdtemp()
    
    # Create CSV test file
    csv_path = os.path.join(temp_dir, 'contacts.csv')
    with open(csv_path, 'w', encoding='utf-8') as f:
        f.write("phone,name,company\n")
        f.write("+79161234567,Иван,ООО Тест\n")
        f.write("+79162345678,Мария,ИП Петров\n")
        f.write("+79163456789,Петр,ЗАО Инновации\n")
    
    # Create template test file
    template_path = os.path.join(temp_dir, 'template.txt')
    with open(template_path, 'w', encoding='utf-8') as f:
        f.write("Привет, {{ name }}! Информация от {{ company }} о {{ event }}.")
    
    # Create config test file
    config_path = os.path.join(temp_dir, 'config.json')
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write('{"log_path": "' + os.path.join(temp_dir, 'logs') + '", ')
        f.write('"templates_path": "' + os.path.join(temp_dir, 'templates') + '", ')
        f.write('"reports_path": "' + os.path.join(temp_dir, 'reports') + '", ')
        f.write('"delay_min": 0.1, "delay_max": 0.2, "use_mock_sender": true}')
    
    # Create media test file
    media_dir = os.path.join(temp_dir, 'media')
    os.makedirs(media_dir, exist_ok=True)
    media_path = os.path.join(media_dir, 'test_image.jpg')
    with open(media_path, 'wb') as f:
        f.write(b'FAKE JPG CONTENT')
    
    # Create directories
    os.makedirs(os.path.join(temp_dir, 'logs'), exist_ok=True)
    os.makedirs(os.path.join(temp_dir, 'templates'), exist_ok=True)
    os.makedirs(os.path.join(temp_dir, 'reports'), exist_ok=True)
    
    return {
        'temp_dir': temp_dir,
        'csv_path': csv_path,
        'template_path': template_path,
        'config_path': config_path,
        'media_path': media_path
    }

# Clean up test environment
def cleanup_test_environment(env):
    """Clean up the test environment"""
    shutil.rmtree(env['temp_dir'])

# TestCase class with common setup
class iMessageTestCase(unittest.TestCase):
    """Base TestCase class for iMessage sender tests"""
    
    def setUp(self):
        """Set up test environment"""
        self.env = create_test_environment()
        self.logger = Logger(log_path=os.path.join(self.env['temp_dir'], 'test.log'), console=False)
        
        # Create mocks for external dependencies
        self.message_template = MessageTemplate(logger=self.logger)
        self.message_template.load_from_file(self.env['template_path'])
        
        self.contact_manager = ContactManager(logger=self.logger)
        self.contact_manager.load_from_csv(self.env['csv_path'])
        
        self.config = Config(self.env['config_path'])
        
        # Create mock sender
        self.sender = MockiMessageSender(logger=self.logger)
    
    def tearDown(self):
        """Clean up test environment"""
        cleanup_test_environment(self.env)

# Example test case using the base class
class TestMessageSending(iMessageTestCase):
    """Test message sending functionality"""
    
    def test_send_single_message(self):
        """Test sending a single message"""
        phone = "+79161234567"
        message = "Test message"
        
        # Send message
        result = self.sender.send(phone, message)
        
        # Check result
        self.assertTrue(result)
        self.assertEqual(len(self.sender.get_sent_messages()), 1)
        self.assertEqual(self.sender.get_sent_messages()[0]['phone'], phone)
        self.assertEqual(self.sender.get_sent_messages()[0]['message'], message)
    
    def test_send_with_media(self):
        """Test sending a message with media attachment"""
        phone = "+79161234567"
        message = "Test message with media"
        
        # Add media
        self.sender.add_media(self.env['media_path'])
        
        # Send message
        result = self.sender.send(phone, message)
        
        # Check result
        self.assertTrue(result)
        self.assertEqual(len(self.sender.get_sent_messages()), 1)
        self.assertEqual(len(self.sender.get_sent_messages()[0]['media_files']), 1)

# Run tests if executed directly
if __name__ == '__main__':
    unittest.main()
