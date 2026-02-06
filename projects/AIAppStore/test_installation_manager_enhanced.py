
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import unittest
import os
from datetime import datetime
from database import DatabaseManager
from installation_manager import InstallationManager

class TestInstallationManagerEnhanced(unittest.TestCase):
    def setUp(self):
        if os.path.exists('appstore.db'):
            os.remove('appstore.db')
        self.db_manager = DatabaseManager('appstore.db')
        self.db_manager.initialize_database()
        self.installation_manager = InstallationManager(self.db_manager)

        # Insert test app metadata into the database
        self.test_app = {
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
            'last_updated': datetime.now().isoformat(),
            'metadata': '{}'
        }
        self.db_manager.insert_app(self.test_app)

    def tearDown(self):
        if os.path.exists('appstore.db'):
            os.remove('appstore.db')

    def test_install_app(self):
        self.installation_manager.install_app('app_001')
        app = self.db_manager.get_app_by_id('app_001')
        self.assertTrue(app['installed'])
        self.assertIsNotNone(app['installation_date'])

    def test_uninstall_app(self):
        self.installation_manager.install_app('app_001')
        self.installation_manager.uninstall_app('app_001')
        app = self.db_manager.get_app_by_id('app_001')
        self.assertFalse(app['installed'])
        self.assertIsNone(app['installation_date'])

    def test_install_nonexistent_app(self):
        with self.assertRaises(ValueError):
            self.installation_manager.install_app('nonexistent_app')

    def test_uninstall_nonexistent_app(self):
        with self.assertRaises(ValueError):
            self.installation_manager.uninstall_app('nonexistent_app')

if __name__ == '__main__':
    unittest.main()