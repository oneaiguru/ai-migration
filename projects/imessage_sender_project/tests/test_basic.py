#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Basic test script for iMessage sender project
This script tests core functionality without requiring all dependencies
"""

import os
import sys
import unittest
import tempfile
import shutil
from unittest.mock import patch, MagicMock, Mock

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock pandas for testing without dependency
sys.modules['pandas'] = MagicMock()

# Import modules with minimal dependencies
from message_template import MessageTemplate


class TestMessageTemplate(unittest.TestCase):
    """Test message template functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.logger = MagicMock()
        self.template = MessageTemplate(logger=self.logger)
        self.temp_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        """Clean up after tests"""
        shutil.rmtree(self.temp_dir)
    
    def test_template_rendering(self):
        """Test basic template rendering"""
        # Set a template
        template_text = "Hello, {{ name }}! Your order {{ order_id }} is ready."
        self.template.set_template(template_text)
        
        # Test rendering with context
        context = {
            'name': 'John',
            'order_id': '12345'
        }
        rendered = self.template.render(context)
        self.assertEqual(rendered, "Hello, John! Your order 12345 is ready.")
    
    def test_special_variables(self):
        """Test special variables like date and time"""
        # Set a template with special variables
        template_text = "Today is {{ date }}. It's {{ time }} now."
        self.template.set_template(template_text)
        
        # Render and check that special variables are replaced
        rendered = self.template.render()
        self.assertNotIn("{{ date }}", rendered)
        self.assertNotIn("{{ time }}", rendered)
    
    def test_template_file_operations(self):
        """Test saving and loading templates from files"""
        # Set a template
        template_text = "Hello, {{ name }}!"
        self.template.set_template(template_text)
        
        # Save to file
        file_path = os.path.join(self.temp_dir, "test_template.txt")
        self.assertTrue(self.template.save_to_file(file_path))
        
        # Load from file with a new template object
        new_template = MessageTemplate()
        self.assertTrue(new_template.load_from_file(file_path))
        self.assertEqual(new_template.get_template(), template_text)


if __name__ == "__main__":
    unittest.main()