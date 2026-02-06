
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import unittest
import os
import shutil
from datetime import datetime
from database import DatabaseManager
from installation_monitor import InstallationMonitor

class TestInstallationMonitor(unittest.TestCase):
    def setUp(self):
        """
        Set up the test environment by initializing the database, inserting test data,
        and preparing the directory for monitoring.
        """
        if os.path.exists('appstore.db'):
            os.remove('appstore.db')
        self.db_manager = DatabaseManager('appstore.db')
        self.db_manager.initialize_database()
        self.installation_monitor = InstallationMonitor(self.db_manager)

        # Insert test app metadata into the database
        self.test_app = {
            'app_id': 'app_001',
            'name': 'Test App',
            'author': 'Test Author',
            'description': 'A test app for installation monitoring.',
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

        # Create a test directory structure for simulating installation
        self.test_installation_dir = 'installed_apps'
        os.makedirs(self.test_installation_dir, exist_ok=True)

    def tearDown(self):
        """
        Clean up after tests by removing the test directory and database.
        """
        if os.path.exists(self.test_installation_dir):
            shutil.rmtree(self.test_installation_dir)
        if os.path.exists('appstore.db'):
            os.remove('appstore.db')

    def test_monitor_installations(self):
        """
        Test that the InstallationMonitor correctly updates the database when an app
        is marked as installed.
        """
        # Simulate an installed app by creating a file
        installed_app_path = os.path.join(self.test_installation_dir, 'app_001_installed')
        with open(installed_app_path, 'w') as f:
            f.write("Installed")  # Simulating an installation

        # Run the monitor to update the database
        self.installation_monitor.monitor_installations(self.test_installation_dir)

        # Fetch the app from the database
        app = self.db_manager.get_app_by_id('app_001')
        self.assertTrue(app['installed'])
        self.assertIsNotNone(app['installation_date'])

    def test_no_duplicate_installations(self):
        """
        Test that re-running the InstallationMonitor does not duplicate installations.
        """
        # Simulate the first installation
        installed_app_path = os.path.join(self.test_installation_dir, 'app_001_installed')
        with open(installed_app_path, 'w') as f:
            f.write("Installed")

        # Run the monitor to update the database
        self.installation_monitor.monitor_installations(self.test_installation_dir)

        # Try to install again (should not create a duplicate)
        self.installation_monitor.monitor_installations(self.test_installation_dir)

        # Fetch the app from the database
        app = self.db_manager.get_app_by_id('app_001')
        self.assertTrue(app['installed'])

if __name__ == '__main__':
    unittest.main()