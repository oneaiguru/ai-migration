#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
CLI script for testing iMessage sending
"""

import os
import sys
import argparse
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import required modules
from logger import Logger
from message_template import MessageTemplate
from imessage_sender import iMessageSender


def send_test_message(phone_number, template_file=None, name="Test User", company="Test Company", event="test event", mock_mode=False):
    """Send a test message using the iMessage sender"""
    # Create logger
    logger = Logger(console=True, log_level='debug')
    
    # Create message template
    template = MessageTemplate(logger=logger)
    
    # Set template text
    if template_file and os.path.exists(template_file):
        template.load_from_file(template_file)
    else:
        template_text = """Hello, {{ name }}!

This is a test message from the iMessage Sender.
Event: {{ event }}
Date: {{ date }}

Best regards,
{{ company }}
"""
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
    print(f"\nSending message to {phone_number}:\n{message}\n")
    
    # Ask for confirmation (skip in mock mode)
    if not mock_mode:
        confirmation = input("Send this message? (y/n): ")
        if confirmation.lower() != 'y':
            print("Message sending cancelled.")
            return False
    else:
        print("Mock mode: automatically confirming send")
    
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
    
    # Pass the mock_mode parameter to skip confirmation in mock mode
    send_test_message(args.phone, args.template, args.name, args.company, args.event, mock_mode=args.mock)
    
    # Restore the original class if it was mocked
    if args.mock and 'original_iMessageSender' in locals():
        iMessageSender = original_iMessageSender
