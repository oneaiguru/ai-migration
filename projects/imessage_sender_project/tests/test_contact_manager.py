#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Test script for the contact manager module
"""

import os
import sys
import unittest
import tempfile
import shutil
from unittest.mock import patch, MagicMock

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock pandas dependency
sys.modules['pandas'] = MagicMock()

# Import modules with minimal dependencies
from contact_manager import ContactManager


class TestContactManager(unittest.TestCase):
    """Test contact manager functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.logger = MagicMock()
        self.contact_manager = ContactManager(logger=self.logger)
        self.temp_dir = tempfile.mkdtemp()
        
        # Create test CSV file
        self.csv_path = os.path.join(self.temp_dir, 'test_contacts.csv')
        with open(self.csv_path, 'w', encoding='utf-8') as f:
            f.write("phone,name,company\n")
            f.write("+79161234567,John Doe,ACME Inc\n")
            f.write("+79162345678,Jane Smith,XYZ Corp\n")
    
    def tearDown(self):
        """Clean up after tests"""
        shutil.rmtree(self.temp_dir)
    
    def test_phone_validation(self):
        """Test phone number validation"""
        # Valid phone numbers
        self.assertEqual(self.contact_manager.validate_phone("+79161234567"), "+79161234567")
        self.assertEqual(self.contact_manager.validate_phone("89161234567"), "+79161234567")
        
        # Invalid phone numbers
        self.assertEqual(self.contact_manager.validate_phone("123"), "")
        self.assertEqual(self.contact_manager.validate_phone("not a phone"), "")
    
    def test_add_contact(self):
        """Test adding contacts"""
        # Add a valid contact
        self.assertTrue(self.contact_manager.add_contact({'phone': '+79161234567', 'name': 'John'}))
        
        # Verify contact was added
        self.assertEqual(len(self.contact_manager.get_contacts()), 1)
        
        # Try to add duplicate (should fail)
        self.assertFalse(self.contact_manager.add_contact({'phone': '+79161234567', 'name': 'Another John'}))
        
        # Contact count should still be 1
        self.assertEqual(len(self.contact_manager.get_contacts()), 1)
    
    @patch('contact_manager.csv')
    def test_load_from_csv(self, mock_csv):
        """Test loading contacts from CSV file with mocked CSV module"""
        # Setup mock for CSV reader
        mock_reader = MagicMock()
        mock_reader.__iter__.return_value = [
            ["+79161234567", "John Doe", "ACME Inc"],
            ["+79162345678", "Jane Smith", "XYZ Corp"]
        ]
        
        mock_csv.reader.return_value = mock_reader
        mock_csv.Sniffer.return_value.sniff.return_value = None
        
        # Mock open to return our file content
        with patch('builtins.open', create=True) as mock_open:
            mock_open.return_value.__enter__.return_value.read.return_value = "sample,csv,content"
            
            # Since we're mocking csv.reader, we need to also mock the next() call to get headers
            headers = ["phone", "name", "company"]
            mock_reader.__next__.return_value = headers
            
            # Call the method
            count = self.contact_manager.load_from_csv(self.csv_path)
            
            # Two contacts should have been loaded
            self.assertEqual(count, 2)


if __name__ == "__main__":
    unittest.main()