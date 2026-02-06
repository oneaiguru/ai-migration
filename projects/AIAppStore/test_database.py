
import unittest
import json
import os
from config_manager import ConfigManager
from database import DatabaseManager

class TestDatabaseManager(unittest.TestCase):
    def setUp(self):
        self.config_data = {
            "paths": {"database": "test_appstore.db"}
        }
        self.config_file = "test_config.json"
        with open(self.config_file, 'w') as f:
            json.dump(self.config_data, f)
        self.config_manager = ConfigManager(self.config_file)

    def tearDown(self):
        if os.path.exists(self.config_file):
            os.remove(self.config_file)
        if os.path.exists("test_appstore.db"):
            os.remove("test_appstore.db")

    def test_database_path(self):
        db_manager = DatabaseManager(self.config_manager)
        expected_db_path = self.config_manager.get("paths.database", "appstore.db")
        self.assertEqual(db_manager.db_path, expected_db_path)

    def test_default_database_path(self):
        # Simulate a missing config file by not providing one
        db_manager = DatabaseManager("appstore.db")
        self.assertEqual(db_manager.db_path, "appstore.db")

if __name__ == "__main__":
    unittest.main()