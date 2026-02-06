
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import unittest
import os
import json
from database import DatabaseManager
from metadata_fetcher import MetadataFetcher

class TestMetadataFetcher(unittest.TestCase):
    def setUp(self):
        if os.path.exists("appstore.db"):
            os.remove("appstore.db")
        self.db_manager = DatabaseManager("appstore.db")
        self.db_manager.initialize_database()
        self.metadata_fetcher = MetadataFetcher(self.db_manager, "cache.json")

        # Create sample directory and metadata files
        self.sample_dir = "sample_apps"
        os.makedirs(self.sample_dir, exist_ok=True)
        valid_metadata = {
            "app_id": "app_001",
            "app_name": "Utility App",
            "author_name": "Author 1",
            "app_description": "A utility app",
            "version": "1.0.0",
            "license": "MIT",
            "category": "Utilities",
            "tags": ["utility", "test"],
        }
        with open(os.path.join(self.sample_dir, "valid.json"), "w") as f:
            json.dump(valid_metadata, f)

        # Add an invalid JSON file
        with open(os.path.join(self.sample_dir, "invalid.json"), "w") as f:
            f.write("{invalid JSON")

    def tearDown(self):
        if os.path.exists("appstore.db"):
            os.remove("appstore.db")
        if os.path.exists(self.sample_dir):
            for file in os.listdir(self.sample_dir):
                os.remove(os.path.join(self.sample_dir, file))
            os.rmdir(self.sample_dir)

    def test_fetch_metadata(self):
        self.metadata_fetcher.fetch_metadata(self.sample_dir)
        apps = self.db_manager.get_all_apps()
        self.assertEqual(len(apps), 1)  # Only the valid file should be processed


if __name__ == "__main__":
    unittest.main()