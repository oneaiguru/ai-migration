from pathlib import Path
import json
import logging

logger = logging.getLogger(__name__)

class SelectionStorage:
    def __init__(self, project_path):
        self.project_path = Path(project_path)
        self.storage_dir = self.project_path / '.fileselect'
        try:
            self.storage_dir.mkdir(parents=True, exist_ok=True)
        except PermissionError:
            logger.warning(f"Unable to create storage directory at {self.storage_dir}")

    def _get_storage_path(self, type_name):
        return self.storage_dir / f'{type_name}_selection.json'

    def save_selection(self, selection, type='files'):
        try:
            storage_path = self._get_storage_path(type)
            relative_paths = [str(Path(item).relative_to(self.project_path)) for item in selection]
            with open(storage_path, 'w') as f:
                json.dump(relative_paths, f, indent=2)
        except (PermissionError, OSError) as e:
            logger.warning(f"Unable to save selection: {e}")
        except Exception as e:
            logger.error(f"Unexpected error while saving selection: {e}")

    def load_selection(self, type='files'):
        try:
            storage_path = self._get_storage_path(type)
            if storage_path.exists():
                with open(storage_path, 'r') as f:
                    try:
                        relative_paths = json.load(f)
                        return [self.project_path / path for path in relative_paths]
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid JSON in {storage_path}")
                        return []
        except Exception as e:
            logger.warning(f"Error loading selection: {e}")
        return []

    def save_tag(self, key, selection):
        try:
            tags_path = self.storage_dir / 'tags.json'
            tags = {}
            if tags_path.exists():
                with open(tags_path, 'r') as f:
                    try:
                        tags = json.load(f)
                    except json.JSONDecodeError:
                        tags = {}
            
            tags[key] = [str(Path(item).relative_to(self.project_path)) for item in selection]
            with open(tags_path, 'w') as f:
                json.dump(tags, f, indent=2)
        except Exception as e:
            logger.warning(f"Error saving tag: {e}")

    def load_tag(self, key):
        try:
            tags_path = self.storage_dir / 'tags.json'
            if tags_path.exists():
                with open(tags_path, 'r') as f:
                    try:
                        tags = json.load(f)
                        if key in tags:
                            return [self.project_path / path for path in tags[key]]
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid JSON in tags file")
            return []
        except Exception as e:
            logger.warning(f"Error loading tag: {e}")
            return []
    
    def list_tags(self):
        try:
            tags_path = self.storage_dir / 'tags.json'
            if tags_path.exists():
                with open(tags_path, 'r') as f:
                    try:
                        tags = json.load(f)
                        return set(tags.keys())
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid JSON in tags file")
            return set()
        except Exception as e:
            logger.warning(f"Error listing tags: {e}")
            return set()