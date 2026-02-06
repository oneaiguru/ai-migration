import logging
import os
from datetime import datetime
from database import DatabaseManager

class InstallationMonitor:
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
        self.logger = logging.getLogger(__name__)

    def monitor_installations(self, directory: str):
        self.logger.info(f"Scanning directory: {directory}")
        try:
            for filename in os.listdir(directory):
                self.logger.debug(f"Scanning file: {filename}")
                if filename.endswith("_installed"):
                    app_id = filename.replace("_installed", "")
                    self.logger.debug(f"Processing app_id: {app_id}")
                    app = self.db_manager.get_app_by_id(app_id)
                    if app and not app["installed"]:
                        app["installed"] = True
                        app["installation_date"] = datetime.now().isoformat()
                        self.db_manager.update_app(app)
                        self.logger.info(f"App installed via monitor: {app_id}")
        except Exception as e:
            self.logger.error(f"Error during monitoring installations: {e}")
            raise