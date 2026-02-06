
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import os
import unittest
from database import DatabaseManager
from installation_manager import InstallationManager

class TestInstallationManager(unittest.TestCase):
    def setUp(self):
        if os.path.exists("appstore.db"):
            os.remove("appstore.db")
        self.db_manager = DatabaseManager("appstore.db")
        self.db_manager.initialize_database()
        self.installation_manager = InstallationManager(self.db_manager)

    def tearDown(self):
        if os.path.exists("appstore.db"):
            os.remove("appstore.db")

    def test_install_app(self):
        app_data = {
            'app_id': 'app_001',
            'name': 'Test App',
            'author': 'Test Author',
            'description': 'A test app for installation management.',
            'version': '1.0.0',
            'license': 'MIT',
            'category': 'Utilities',
            'tags': 'test,utility',
            'installed': False,
            'installation_date': None,
            'last_updated': None,
            'metadata': '{}'
        }
        self.db_manager.insert_app(app_data)
        self.installation_manager.install_app('app_001')
        app = self.db_manager.get_app_by_id('app_001')
        self.assertTrue(app['installed'])

    def test_uninstall_app(self):
        app_data = {
            'app_id': 'app_001',
            'name': 'Test App',
            'author': 'Test Author',
            'description': 'A test app for installation management.',
            'version': '1.0.0',
            'license': 'MIT',
            'category': 'Utilities',
            'tags': 'test,utility',
            'installed': True,
            'installation_date': None,
            'last_updated': None,
            'metadata': '{}'
        }
        self.db_manager.insert_app(app_data)
        self.installation_manager.uninstall_app('app_001')
        app = self.db_manager.get_app_by_id('app_001')
        self.assertFalse(app['installed'])

if __name__ == "__main__":
    unittest.main()