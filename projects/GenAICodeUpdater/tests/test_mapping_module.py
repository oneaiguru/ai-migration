import unittest
import os
import tempfile
from llmcodeupdater.mapping import update_files

class TestMappingModule(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        os.makedirs(os.path.join(self.test_dir, 'package'))

    def tearDown(self):
        for root, dirs, files in os.walk(self.test_dir, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))
        os.rmdir(self.test_dir)

    def test_update_init_files(self):
        # Test data
        updates = [
            ('package/__init__.py', 'VERSION = "1.0.0"\n')
        ]
        
        # Run update
        result = update_files(updates, self.test_dir)
        
        # Verify __init__.py was created
        init_path = os.path.join(self.test_dir, 'package/__init__.py')
        self.assertTrue(os.path.exists(init_path))
        
        # Verify content
        with open(init_path, 'r') as f:
            content = f.read()
        self.assertEqual(content, 'VERSION = "1.0.0"\n')
        
        # Verify statistics
        self.assertEqual(result['files_created'], 1)
        self.assertEqual(result['files_updated'], 0)