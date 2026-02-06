
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import unittest
import os
from app_catalog_manager import AppCatalogManager
from cache_manager import CacheManager
from database import DatabaseManager

class TestAppCatalogManager(unittest.TestCase):
    def setUp(self):
        self.db_manager = DatabaseManager('appstore.db')
        self.db_manager.initialize_database()
        self.cache_manager = CacheManager('cache.json')
        self.catalog_manager = AppCatalogManager(self.db_manager, self.cache_manager)

        # Insert sample apps with required fields
        self.sample_apps = [
            {
                'app_id': 'app_001',
                'name': 'Sample App 1',
                'category': 'Utilities',
                'author': 'Author 1',
                'description': 'Description 1',
                'version': '1.0.0',
                'license': 'MIT',
                'tags': 'utility,example',
                'installed': False,
                'installation_date': None,
                'last_updated': None,
                'metadata': '{}'
            },
            {
                'app_id': 'app_002',
                'name': 'Sample App 2',
                'category': 'Productivity',
                'author': 'Author 2',
                'description': 'Description 2',
                'version': '2.0.0',
                'license': 'GPL',
                'tags': 'productivity,example',
                'installed': False,
                'installation_date': None,
                'last_updated': None,
                'metadata': '{}'
            },
            {
                'app_id': 'app_003',
                'name': 'Sample App 3',
                'category': 'Utilities',
                'author': 'Author 3',
                'description': 'Description 3',
                'version': '1.5.0',
                'license': 'Apache',
                'tags': 'utility,example',
                'installed': False,
                'installation_date': None,
                'last_updated': None,
                'metadata': '{}'
            }
        ]
        for app in self.sample_apps:
            self.db_manager.insert_app(app)

    def tearDown(self):
        if os.path.exists('appstore.db'):
            os.remove('appstore.db')
        if os.path.exists('cache.json'):
            os.remove('cache.json')

    def test_get_apps_by_category(self):
        utilities_apps = self.catalog_manager.get_apps_by_category('Utilities')
        self.assertEqual(len(utilities_apps), 2)

    def test_get_app_of_the_day(self):
        app_of_the_day = self.catalog_manager.get_app_of_the_day()
        sample_app_ids = [app['app_id'] for app in self.sample_apps]
        self.assertIn(app_of_the_day['app_id'], sample_app_ids)

    def test_recommendations_based_on_category(self):
        recommendations = self.catalog_manager.get_recommendations('app_001')
        self.assertTrue(len(recommendations) > 0)
        for rec in recommendations:
            self.assertNotEqual(rec['app_id'], 'app_001')

    def test_cache_usage(self):
        self.catalog_manager.get_apps_by_category('Utilities')
        self.assertTrue(self.cache_manager.is_cached('category_Utilities'))
        cached_data = self.cache_manager.get_from_cache('category_Utilities')
        self.assertEqual(len(cached_data), 2)


if __name__ == '__main__':
    unittest.main()