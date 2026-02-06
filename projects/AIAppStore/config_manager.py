import json
import os
from typing import Any, Callable, Dict, Optional


class ConfigManager:
    def __init__(self, config_file: str):
        """
        Initializes the ConfigManager with the given configuration file path.

        Parameters:
            config_file (str): The path to the configuration file.
        """
        self.config_file = config_file
        self.config = self.load_config()
        self.logger = self.setup_logger()

    def setup_logger(self):
        import logging
        logger = logging.getLogger('ConfigManager')
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        return logger

    def load_config(self) -> Dict:
        """Loads the configuration from the specified JSON file."""
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                return json.load(f)
        return {}

    def save_config(self):
        """Saves the current configuration to the file."""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=4)

    def get(self, key: str, default: Optional[Any] = None) -> Any:
        """
        Retrieves the value for the given key from the configuration.

        Parameters:
            key (str): The key for the value to retrieve.
            default (Optional[Any]): The default value to return if the key is not found.

        Returns:
            Any: The value associated with the key, or the default value if the key is not found.
        """
        if '..' in key:
            raise KeyError(f"Invalid key format: '{key}'")

        keys = key.split(".")
        value = self.config
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                if default is not None:
                    return default
                raise KeyError(f"Key '{key}' not found in configuration.")
        return value

    def add(self, key: str, value: Any, overwrite: bool = True, validator: Optional[Callable[[Any], bool]] = None) -> None:
        """
        Adds a new key-value pair to the configuration.

        Parameters:
            key (str): The key to add.
            value (Any): The value to associate with the key.
            overwrite (bool): Whether to overwrite an existing value if the key already exists. Defaults to True.
            validator (Optional[Callable[[Any], bool]]): An optional validator function to validate the value before adding.
        """
        if not isinstance(value, (dict, list, str, int, float, bool, type(None))):
            raise TypeError("Invalid data type for configuration value.")

        if validator and not validator(value):
            raise ValueError("Validation failed for the provided configuration value.")

        if '..' in key:
            raise KeyError(f"Invalid key format: '{key}'")

        keys = key.split(".")
        d = self.config
        for k in keys[:-1]:
            if k not in d or not isinstance(d[k], dict):
                d[k] = {}
            d = d[k]
        final_key = keys[-1]
        if final_key in d and not overwrite:
            raise KeyError(f"Key '{key}' already exists and overwrite is set to False.")
        d[final_key] = value
        self.save_config()

    def remove(self, key: str) -> None:
        """
        Removes the key-value pair from the configuration.

        Parameters:
            key (str): The key to remove.
        """
        if '..' in key:
            self.logger.info(f"Invalid key format: '{key}'")
            return

        keys = key.split(".")
        d = self.config
        stack = []  # To keep track of dictionaries for potential cleanup
        for k in keys[:-1]:
            if k in d and isinstance(d[k], dict):
                stack.append((d, k))
                d = d[k]
            else:
                self.logger.info(f"Key '{key}' not found in configuration.")
                return
        final_key = keys[-1]
        if final_key in d:
            del d[final_key]
            self.save_config()
            self.logger.info(f"Removed key '{key}' from configuration.")

            # Optional: Clean up empty dictionaries
            while stack:
                parent, parent_key = stack.pop()
                if not d:
                    del parent[parent_key]
                    d = parent
                else:
                    break
        else:
            self.logger.info(f"Key '{key}' not found in configuration.")