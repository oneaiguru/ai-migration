# app_store_main.py

from app_catalog_manager import AppCatalogManager
from cache_manager import CacheManager
from config_manager import ConfigManager
from database import DatabaseManager
from metadata_fetcher import MetadataFetcher


def main():
    # Initialize ConfigManager
    config_manager = ConfigManager("app_config.json")

    # Load configurations
    db_path = config_manager.get("paths.database", "appstore.db")
    cache_path = config_manager.get("paths.cache", "cache.json")
    sample_dir = config_manager.get("paths.sample_apps", "sample_apps")

    # Initialize managers with configurations
    db_manager = DatabaseManager(db_path)
    db_manager.initialize_database()
    cache_manager = CacheManager(cache_path)
    catalog_manager = AppCatalogManager(db_manager, cache_manager)
    metadata_fetcher = MetadataFetcher(db_manager, cache_path)

    # Example: Fetch metadata from sample directory
    print("Fetching metadata...")
    metadata_fetcher.fetch_metadata(sample_dir)

    # Example: Display all apps by category
    category = config_manager.get("settings.default_category", "Utilities")
    print(f"Apps in category '{category}':")
    utilities_apps = catalog_manager.get_apps_by_category(category)
    for app in utilities_apps:
        print(app)

    # Example: Display the 'App of the Day'
    print("\nApp of the Day:")
    app_of_the_day = catalog_manager.get_app_of_the_day()
    print(app_of_the_day)

    # Example: Display recommendations for an app
    app_id = config_manager.get("settings.default_app_id", "app_001")
    print(f"\nRecommendations based on app '{app_id}':")
    recommendations = catalog_manager.get_recommendations(app_id)
    for recommendation in recommendations:
        print(recommendation)


if __name__ == "__main__":
    main()