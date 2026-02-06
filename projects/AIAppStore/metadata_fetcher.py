from typing import Dict
import os
import json
from database import DatabaseManager

class MetadataFetcher:
    def __init__(self, db_manager: DatabaseManager, cache_file: str):
        self.db_manager = db_manager
        self.cache_file = cache_file

    def fetch_metadata(self, metadata_dir: str):
        for filename in os.listdir(metadata_dir):
            filepath = os.path.join(metadata_dir, filename)
            if filename.endswith('.json'):
                try:
                    with open(filepath, 'r') as file:
                        content = file.read().strip()
                        if not content or not (content.startswith('{') and content.endswith('}')):
                            print(f"Skipping invalid or empty JSON file: {filepath}")
                            continue
                        metadata = json.loads(content)
                        self.store_metadata(metadata)
                except (json.JSONDecodeError, ValueError) as e:
                    print(f"Error parsing file {filepath}: {e}")
                except Exception as e:
                    print(f"Unexpected error processing file {filepath}: {e}")

    def store_metadata(self, metadata: Dict):
        app_data = {
            'app_id': metadata.get('app_id', ''),
            'name': metadata.get('app_name', ''),
            'author': metadata.get('author_name', ''),
            'description': metadata.get('app_description', ''),
            'version': metadata.get('version', ''),
            'license': metadata.get('license', ''),
            'category': metadata.get('category', ''),
            'tags': ','.join(metadata.get('tags', [])),
            'installed': False,
            'installation_date': None,
            'last_updated': metadata.get('last_updated', None),
            'metadata': json.dumps(metadata)
        }
        self.db_manager.insert_app(app_data)