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
from datetime import datetime

# Ensure proper path for imports
script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(script_dir)
sys.path.insert(0, parent_dir)

# Import project modules
from config import Config
from contact_manager import ContactManager
from message_template import MessageTemplate
from imessage_sender import iMessageSender
from logger import Logger

class TestMode:
    """Test modes for the CLI tool"""
    MOCK = "mock"  # Use mock sender for testing without sending real messages
    REAL = "real"  # Use real sender for testing with actual iMessage
    DRY_RUN = "dry-run"  # Prepare everything but don't actually send

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
        
        # Load configuration
        self.config = Config(config_path)
        
        # Initialize logger
        log_path = self.config.get('log_path', 'logs')
        os.makedirs(log_path, exist_ok=True)
        self.logger = Logger(
            log_path=os.path.join(log_path, f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"),
            log_level="debug" if verbose else "info",
            console=True
        )
        
        # Initialize components
        self.contact_manager = ContactManager(logger=self.logger)
        self.template_manager = MessageTemplate(logger=self.logger)
        
        # Initialize sender based on mode
        if mode == TestMode.MOCK:
            from unittest.mock import MagicMock
            
            # Create a mock sender
            self.sender = iMessageSender(logger=self.logger)
            
            # Mock the send method to avoid actual sending
            original_send = self.sender.send
            self.sent_messages = []
            
            def mock_send(phone, message):
                """Mock implementation for send method"""
                self.console_logger.info(f"MOCK SEND: {phone} - {message[:30]}...")
                self.sent_messages.append({
                    'phone': phone,
                    'message': message,
                    'timestamp': datetime.now()
                })
                return True
            
            self.sender.send = mock_send
            
        elif mode == TestMode.DRY_RUN:
            # Create sender but override send method to just log
            self.sender = iMessageSender(logger=self.logger)
            original_send = self.sender.send
            self.sent_messages = []
            
            def dry_run_send(phone, message):
                """Dry run implementation for send method"""
                self.console_logger.info(f"DRY RUN: Would send to {phone} - {message[:30]}...")
                self.sent_messages.append({
                    'phone': phone,
                    'message': message,
                    'timestamp': datetime.now()
                })
                return True
            
            self.sender.send = dry_run_send
            
        else:  # REAL mode
            self.sender = iMessageSender(logger=self.logger)
            self.sent_messages = []
    
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
        
        # Get delays from config if not specified
        if delay_min is None:
            delay_min = self.config.get('delay_min', 3.0)
        if delay_max is None:
            delay_max = self.config.get('delay_max', 7.0)
        
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
        if self.mode == TestMode.REAL:
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

def main():
    """Main function for the CLI testing tool"""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='CLI Testing Tool for iMessage Sender')
    
    # General options
    parser.add_argument('--config', help='Path to configuration file')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose output')
    parser.add_argument('--mode', choices=[TestMode.MOCK, TestMode.REAL, TestMode.DRY_RUN], 
                        default=TestMode.MOCK, help='Test mode (default: mock)')
    
    # Input files
    parser.add_argument('--contacts', help='Path to contacts file')
    parser.add_argument('--template', help='Path to template file')
    parser.add_argument('--media', help='Path to media file')
    
    # Test options
    parser.add_argument('--test', action='store_true', help='Send a test message')
    parser.add_argument('--phone', help='Phone number for test message')
    parser.add_argument('--bulk', action='store_true', help='Send bulk messages')
    parser.add_argument('--limit', type=int, help='Limit number of messages to send')
    parser.add_argument('--delay-min', type=float, help='Minimum delay between messages (seconds)')
    parser.add_argument('--delay-max', type=float, help='Maximum delay between messages (seconds)')
    parser.add_argument('--report', action='store_true', help='Generate a report after sending')
    
    args = parser.parse_args()
    
    # Create test runner
    runner = TestRunner(mode=args.mode, config_path=args.config, verbose=args.verbose)
    
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
    if args.test:
        if not runner.send_test_message(phone=args.phone):
            sys.exit(1)
    
    if args.bulk:
        stats = runner.send_bulk(
            limit=args.limit,
            delay_min=args.delay_min,
            delay_max=args.delay_max
        )
        
        if stats['sent'] == 0 and stats['total'] > 0:
            sys.exit(1)
    
    # Generate report
    if args.report or (args.bulk and stats['sent'] > 0):
        runner.generate_report()

if __name__ == '__main__':
    main()
