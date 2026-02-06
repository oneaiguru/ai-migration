import logging
from datetime import datetime
from database import DatabaseManager

class InstallationManager:
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
        self.logger = logging.getLogger(__name__)

    def install_app(self, app_id: str):
        app = self.db_manager.get_app_by_id(app_id)
        if not app:
            self.logger.error(f"Attempted to install non-existent app: {app_id}")
            raise ValueError(f"App with ID {app_id} does not exist.")
        if not app['installed']:
            app['installed'] = True
            app['installation_date'] = datetime.now().isoformat()
            self.db_manager.update_app(app)
            self.logger.info(f"App installed: {app_id}")
        else:
            self.logger.info(f"App already installed: {app_id}")

    def uninstall_app(self, app_id: str):
        app = self.db_manager.get_app_by_id(app_id)
        if not app:
            self.logger.error(f"Attempted to uninstall non-existent app: {app_id}")
            raise ValueError(f"App with ID {app_id} does not exist.")
        if app['installed']:
            app['installed'] = False
            app['installation_date'] = None
            self.db_manager.update_app(app)
            self.logger.info(f"App uninstalled: {app_id}")
        else:
            self.logger.info(f"App is not installed: {app_id}")