import unittest
from config_manager import ConfigManager
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

class TestConfigManager(unittest.TestCase):

    def setUp(self):
        """Create a temporary config file for testing."""
        self.config_file = 'test_config.json'
        self.config_manager = ConfigManager(self.config_file)
        self.config_manager.config = {}  # Start with an empty config

    def tearDown(self):
        """Delete the temporary config file after tests."""
        if os.path.exists(self.config_file):
            os.remove(self.config_file)

    def test_add_new_entry(self):
        self.config_manager.add('api.key', '12345')
        self.assertEqual(self.config_manager.get('api.key'), '12345')

    def test_update_existing_entry(self):
        self.config_manager.add('api.key', '12345')
        self.config_manager.add('api.key', '67890')
        self.assertEqual(self.config_manager.get('api.key'), '67890')

    def test_add_nested_entry(self):
        self.config_manager.add('server.database.host', 'localhost')
        self.assertEqual(self.config_manager.get('server.database.host'), 'localhost')

    def test_add_invalid_data_type(self):
        with self.assertRaises(TypeError):
            self.config_manager.add('api.key', set([1, 2, 3]))

    def test_add_existing_entry_without_overwrite(self):
        self.config_manager.add('api.key', '12345')
        with self.assertRaises(KeyError):
            self.config_manager.add('api.key', '67890', overwrite=False)

    def test_add_with_validator(self):
        validator = lambda x: isinstance(x, str) and len(x) > 0
        self.config_manager.add('api.secret', 'secret_key', validator=validator)
        self.assertEqual(self.config_manager.get('api.secret'), 'secret_key')

        # Attempt to add invalid value
        with self.assertRaises(ValueError):
            self.config_manager.add('api.secret', '', validator=validator)

    def test_get_existing_nested_value(self):
        self.config_manager.add('database.host', 'localhost')
        value = self.config_manager.get('database.host')
        self.assertEqual(value, 'localhost')

    def test_get_nonexistent_value_with_default(self):
        value = self.config_manager.get('database.port', default=5432)
        self.assertEqual(value, 5432)

    def test_get_nonexistent_value_without_default(self):
        with self.assertRaises(KeyError):
            self.config_manager.get('database.port')

    def test_get_multiple_nested_values(self):
        self.config_manager.add('server.database.host', '127.0.0.1')
        self.config_manager.add('server.database.port', 3306)
        host = self.config_manager.get('server.database.host')
        port = self.config_manager.get('server.database.port')
        self.assertEqual(host, '127.0.0.1')
        self.assertEqual(port, 3306)

    def test_get_with_invalid_key_format(self):
        with self.assertRaises(KeyError):
            self.config_manager.get('server..database.host')  # Double dot indicates invalid key

    def test_remove_existing_entry(self):
        self.config_manager.add('api.key', '12345')
        self.config_manager.remove('api.key')
        with self.assertRaises(KeyError):
            self.config_manager.get('api.key')

    def test_remove_nonexistent_entry(self):
        # Should not raise an exception
        try:
            self.config_manager.remove('nonexistent.key')
        except Exception as e:
            self.fail(f"remove() raised an exception unexpectedly: {e}")

    def test_remove_nested_entry(self):
        self.config_manager.add('server.database.host', 'localhost')
        self.config_manager.remove('server.database.host')
        with self.assertRaises(KeyError):
            self.config_manager.get('server.database.host')

    def test_remove_nested_entry_intermediate_keys(self):
        self.config_manager.add('server.database.host', 'localhost')
        self.config_manager.remove('server.database.host')
        # The 'server.database' dictionary should still exist, possibly empty
        with self.assertRaises(KeyError):
            self.config_manager.get('server.database.host')
        # Check that 'server.database' is still a dictionary
        self.assertIsInstance(self.config_manager.config.get('server', {}).get('database', {}), dict)

if __name__ == '__main__':
    unittest.main()