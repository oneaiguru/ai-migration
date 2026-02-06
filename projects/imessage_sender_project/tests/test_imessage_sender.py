#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Test script for the iMessage sender module
"""

import os
import sys
import unittest
import tempfile
from unittest.mock import patch, MagicMock

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import iMessage sender module
from imessage_sender import iMessageSender


class TestiMessageSender(unittest.TestCase):
    """Test iMessage sender functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.logger = MagicMock()
        self.temp_dir = tempfile.mkdtemp()
        
        # Create test media file
        self.media_path = os.path.join(self.temp_dir, 'test_image.jpg')
        with open(self.media_path, 'w') as f:
            f.write("test image content")
        
        # Patch methods to avoid actual file operations
        with patch('os.close', MagicMock()):
            with patch('builtins.open', MagicMock()):
                with patch('tempfile.mkstemp', return_value=(1, os.path.join(self.temp_dir, 'test_script.scpt'))):
                    with patch('imessage_sender.iMessageSender._create_send_script', return_value=os.path.join(self.temp_dir, 'test_script.scpt')):
                        self.sender = iMessageSender(logger=self.logger)
    
    def tearDown(self):
        """Clean up after tests"""
        try:
            import shutil
            shutil.rmtree(self.temp_dir)
        except:
            pass
    
    @patch('imessage_sender.os.path.exists')
    def test_add_media(self, mock_exists):
        """Test adding media to a message"""
        # Mock that the file exists
        mock_exists.return_value = True
        
        # Add media
        result = self.sender.add_media(self.media_path)
        
        # Should succeed
        self.assertTrue(result)
        self.assertEqual(len(self.sender.media_files), 1)
        
        # Test unsupported media type
        bad_media_path = os.path.join(self.temp_dir, 'test_file.xyz')
        mock_exists.return_value = True
        
        result = self.sender.add_media(bad_media_path)
        self.assertFalse(result)
    
    @patch('imessage_sender.subprocess.Popen')
    def test_send_message(self, mock_popen):
        """Test sending a message with mocked subprocess"""
        # Mock the subprocess
        process_mock = MagicMock()
        process_mock.returncode = 0
        process_mock.communicate.return_value = ('success', '')
        mock_popen.return_value = process_mock
        
        # Test sending a message
        result = self.sender.send("+79161234567", "Test message")
        
        # Should succeed
        self.assertTrue(result)
        
        # Mock a failure
        process_mock.returncode = 1
        process_mock.communicate.return_value = ('', 'error')
        
        # Test sending a message with failure
        result = self.sender.send("+79161234567", "Test message")
        
        # Should fail
        self.assertFalse(result)
    
    def test_escape_message(self):
        """Test message escaping for AppleScript"""
        # Test escaping quotes and backslashes
        original = 'Message with "quotes" and \\ backslashes'
        escaped = self.sender._escape_message(original)
        
        self.assertEqual(escaped, 'Message with \\"quotes\\" and \\\\ backslashes')


if __name__ == "__main__":
    unittest.main()