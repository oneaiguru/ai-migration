
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import unittest
import os
from cache_manager import CacheManager

class TestCacheManager(unittest.TestCase):
    def setUp(self):
        self.cache_file = 'cache.json'
        if os.path.exists(self.cache_file):
            os.remove(self.cache_file)
        self.cache_manager = CacheManager(self.cache_file)

    def tearDown(self):
        if os.path.exists(self.cache_file):
            os.remove(self.cache_file)

    def test_cache_initialization(self):
        self.assertFalse(self.cache_manager.is_cached('app_001'))

    def test_add_to_cache(self):
        self.cache_manager.add_to_cache('app_001', {'name': 'Sample App'})
        self.assertTrue(self.cache_manager.is_cached('app_001'))
        self.assertEqual(self.cache_manager.get_from_cache('app_001'), {'name': 'Sample App'})

    def test_update_cache(self):
        self.cache_manager.add_to_cache('app_001', {'name': 'Sample App'})
        self.cache_manager.add_to_cache('app_001', {'name': 'Updated App'})
        self.assertEqual(self.cache_manager.get_from_cache('app_001'), {'name': 'Updated App'})

    def test_cache_persistence(self):
        self.cache_manager.add_to_cache('app_001', {'name': 'Sample App'})
        new_cache_manager = CacheManager(self.cache_file)
        self.assertTrue(new_cache_manager.is_cached('app_001'))
        self.assertEqual(new_cache_manager.get_from_cache('app_001'), {'name': 'Sample App'})


if __name__ == '__main__':
    unittest.main()