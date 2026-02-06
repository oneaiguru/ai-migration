from typing import List, Dict
import random
from database import DatabaseManager
from cache_manager import CacheManager

class AppCatalogManager:
    def __init__(self, db_manager: DatabaseManager, cache_manager: CacheManager):
        self.db_manager = db_manager
        self.cache_manager = cache_manager

    def get_apps_by_category(self, category: str) -> List[Dict]:
        cache_key = f'category_{category}'
        if self.cache_manager.is_cached(cache_key):
            return self.cache_manager.get_from_cache(cache_key)

        apps = self.db_manager.query_apps_by_category(category)
        self.cache_manager.add_to_cache(cache_key, apps)
        return apps

    def get_app_of_the_day(self) -> Dict:
        all_apps = self.db_manager.get_all_apps()
        return random.choice(all_apps) if all_apps else {}

    def get_recommendations(self, app_id: str) -> List[Dict]:
        app = self.db_manager.get_app_by_id(app_id)
        if not app:
            return []
        category = app.get('category', '')
        recommended_apps = self.db_manager.query_apps_by_category(category)
        return [app for app in recommended_apps if app['app_id'] != app_id]