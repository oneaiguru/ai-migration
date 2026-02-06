
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import unittest
import os
import json
from datetime import datetime
from app_catalog_manager import AppCatalogManager
from cache_manager import CacheManager
from config_manager import ConfigManager
from database import DatabaseManager
from installation_manager import InstallationManager
from metadata_fetcher import MetadataFetcher

class TestIntegration(unittest.TestCase):
    def setUp(self):
        self.config_file = 'test_config.json'
        self.db_file = 'test_appstore.db'
        self.cache_file = 'test_cache.json'
        self.sample_dir = 'sample_apps'

        # Setup test config
        config_data = {
            "paths": {
                "database": self.db_file,
                "cache": self.cache_file,
                "sample_apps": self.sample_dir
            },
            "settings": {
                "default_category": "Utilities",
                "default_app_id": "app_001"
            }
        }
        with open(self.config_file, 'w') as f:
            json.dump(config_data, f)

        # Create sample directory and metadata files
        os.makedirs(self.sample_dir, exist_ok=True)
        sample_metadata = [
            {
                "app_id": "app_001",
                "app_name": "Utility App 1",
                "author_name": "Author 1",
                "app_description": "A utility app",
                "version": "1.0.0",
                "license": "MIT",
                "category": "Utilities",
                "tags": ["utility", "test"],
                "last_updated": datetime.now().isoformat()
            },
            {
                "app_id": "app_002",
                "app_name": "Utility App 2",
                "author_name": "Author 2",
                "app_description": "Another utility app",
                "version": "2.0.0",
                "license": "GPL",
                "category": "Utilities",
                "tags": ["utility", "test"],
                "last_updated": datetime.now().isoformat()
            }
        ]
        for i, metadata in enumerate(sample_metadata, 1):
            with open(os.path.join(self.sample_dir, f"app_{i}.json"), 'w') as file:
                json.dump(metadata, file)

        # Initialize managers
        self.config_manager = ConfigManager(self.config_file)
        self.db_manager = DatabaseManager(self.db_file)
        self.db_manager.initialize_database()
        self.cache_manager = CacheManager(self.cache_file)
        self.metadata_fetcher = MetadataFetcher(self.db_manager, self.cache_file)
        self.catalog_manager = AppCatalogManager(self.db_manager, self.cache_manager)
        self.installation_manager = InstallationManager(self.db_manager)

        # Fetch metadata to populate the database
        self.metadata_fetcher.fetch_metadata(self.sample_dir)

    def tearDown(self):
        if os.path.exists(self.config_file):
            os.remove(self.config_file)
        if os.path.exists(self.db_file):
            os.remove(self.db_file)
        if os.path.exists(self.cache_file):
            os.remove(self.cache_file)
        if os.path.exists(self.sample_dir):
            for file in os.listdir(self.sample_dir):
                os.remove(os.path.join(self.sample_dir, file))
            os.rmdir(self.sample_dir)

    def test_metadata_fetch_and_store(self):
        apps = self.db_manager.get_all_apps()
        self.assertEqual(len(apps), 2)  # Only valid files should be processed

    def test_installation_tracking(self):
        self.installation_manager.install_app('app_001')
        app = self.db_manager.get_app_by_id('app_001')
        self.assertTrue(app['installed'])
        self.assertIsNotNone(app['installation_date'])

        self.installation_manager.uninstall_app('app_001')
        app = self.db_manager.get_app_by_id('app_001')
        self.assertFalse(app['installed'])

    def test_recommendations(self):
        recommendations = self.catalog_manager.get_recommendations('app_001')
        self.assertEqual(len(recommendations), 1)
        self.assertEqual(recommendations[0]['app_id'], 'app_002')

    def test_cache_integration(self):
        apps_cached = self.catalog_manager.get_apps_by_category('Utilities')
        self.assertTrue(self.cache_manager.is_cached('category_Utilities'))
        cached_data = self.cache_manager.get_from_cache('category_Utilities')
        self.assertEqual(len(cached_data), 2)

if __name__ == '__main__':
    unittest.main()