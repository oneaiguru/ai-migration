import json
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

class ProjectConfig:
    def __init__(self, project_path):
        self.project_path = Path(project_path)
        self.config_path = self.project_path / '.fileselect' / 'config.json'
        self.config = self._load_config()

    def _load_config(self):
        default_config = {
            'features': {
                'files': True,
                'folders': True,
                'tags': True
            },
            'key_mappings': {
                'tags': '123456789',
                'folders': 'abcdefghijklmnopqrstuvwxyz',
                'files': '0!@#$%^&*()'
            }
        }
        
        try:
            if self.config_path.exists():
                with open(self.config_path) as f:
                    custom_config = json.load(f)
                    # Merge custom config with default config, giving priority to custom config
                    for feature_type in ['features', 'key_mappings']:
                        if feature_type in custom_config:
                            default_config[feature_type].update(custom_config[feature_type])
                    return default_config
        except (json.JSONDecodeError, IOError) as e:
            logger.warning(f"Error loading configuration: {e}. Falling back to default configuration.")
        
        return default_config

    def toggle_feature(self, feature):
        if feature in self.config['features']:
            self.config['features'][feature] = not self.config['features'][feature]
            self.save_config()

    def save_config(self):
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.config_path, 'w') as f:
            json.dump(self.config, f, indent=2)