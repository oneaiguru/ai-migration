
# AIAppStore Usage Guide

## Overview

AIAppStore is a modular Python application that manages an app catalog, handling configurations, caching, database interactions, installations, and metadata fetching.

## Getting Started

### Prerequisites

- Python 3.6+
- No external dependencies; uses only built-in Python modules.

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/AIAppStore.git
   cd AIAppStore
   ```

2. **Set Up Configuration**

   The application uses a JSON configuration file (`app_config.json`) to manage paths and settings.

   **Sample `app_config.json`**:

   ```json
   {
     "paths": {
       "database": "appstore.db",
       "cache": "cache.json",
       "sample_apps": "sample_apps"
     },
     "settings": {
       "default_category": "Utilities",
       "default_app_id": "app_001"
     }
   }
   ```

3. **Prepare Sample Metadata**

   Place your app metadata JSON files in the `sample_apps` directory. Each file should follow this structure:

   ```json
   {
     "app_id": "app_001",
     "app_name": "Utility App 1",
     "author_name": "Author 1",
     "app_description": "A utility app",
     "version": "1.0.0",
     "license": "MIT",
     "category": "Utilities",
     "tags": ["utility", "test"],
     "last_updated": "2023-10-01T12:00:00Z"
   }
   ```

### Running the Application

Execute the main script:

```bash
python app_store_main.py
```

**Sample Output**:

```
Fetching metadata...
Apps in category 'Utilities':
{'app_id': 'app_001', 'name': 'Utility App 1', ...}
{'app_id': 'app_002', 'name': 'Utility App 2', ...}
...
```

## Features

- ConfigManager: Handles configuration operations.
- CacheManager: Manages cache data.
- DatabaseManager: SQLite database interactions.
- AppCatalogManager: Catalog management and queries.

## Best Practices

- Use `ConfigManager` for all configurations.
- Validate data before adding.
