
import sqlite3
from typing import Dict, List, Union
from config_manager import ConfigManager

class DatabaseManager:
    def __init__(self, config_source: Union[ConfigManager, str]):
        if isinstance(config_source, ConfigManager):
            self.db_path = config_source.get("paths.database", "appstore.db")
        elif isinstance(config_source, str):
            self.db_path = config_source
        else:
            raise TypeError("config_source must be a ConfigManager instance or a string.")

    def initialize_database(self):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # Create apps table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS apps (
                    app_id TEXT PRIMARY KEY,
                    name TEXT,
                    author TEXT,
                    description TEXT,
                    version TEXT,
                    license TEXT,
                    category TEXT,
                    tags TEXT,
                    installed BOOLEAN,
                    installation_date DATETIME,
                    last_updated DATETIME,
                    metadata TEXT
                )
            ''')

            # Create categories table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS categories (
                    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE
                )
            ''')

            # Create app_categories table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS app_categories (
                    app_id TEXT,
                    category_id INTEGER,
                    FOREIGN KEY (app_id) REFERENCES apps (app_id),
                    FOREIGN KEY (category_id) REFERENCES categories (category_id),
                    PRIMARY KEY (app_id, category_id)
                )
            ''')

            # Create installed_apps table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS installed_apps (
                    app_id TEXT,
                    install_path TEXT,
                    source TEXT,
                    date_detected DATETIME,
                    FOREIGN KEY (app_id) REFERENCES apps (app_id),
                    PRIMARY KEY (app_id, install_path)
                )
            ''')

            # Create recommendations table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS recommendations (
                    app_id TEXT,
                    recommended_app_id TEXT,
                    reason TEXT,
                    FOREIGN KEY (app_id) REFERENCES apps (app_id),
                    FOREIGN KEY (recommended_app_id) REFERENCES apps (app_id),
                    PRIMARY KEY (app_id, recommended_app_id)
                )
            ''')

            conn.commit()
            conn.close()
        except sqlite3.Error as e:
            print(f"Error initializing database: {e}")

    def insert_app(self, app_data: Dict):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO apps (app_id, name, author, description, version, license, category, tags, installed, installation_date, last_updated, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            app_data["app_id"],
            app_data["name"],
            app_data["author"],
            app_data["description"],
            app_data["version"],
            app_data["license"],
            app_data["category"],
            app_data["tags"],
            app_data["installed"],
            app_data["installation_date"],
            app_data["last_updated"],
            app_data["metadata"],
        ))
        conn.commit()
        conn.close()

    def get_app_by_id(self, app_id: str) -> Dict:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM apps WHERE app_id = ?", (app_id,))
        row = cursor.fetchone()
        columns = [column[0] for column in cursor.description]
        conn.close()
        if row:
            return dict(zip(columns, row))
        return {}

    def update_app(self, app_data: Dict):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE apps SET
            name = ?, author = ?, description = ?, version = ?, license = ?, category = ?, tags = ?, installed = ?, installation_date = ?, last_updated = ?, metadata = ?
            WHERE app_id = ?
        ''', (
            app_data["name"],
            app_data["author"],
            app_data["description"],
            app_data["version"],
            app_data["license"],
            app_data["category"],
            app_data["tags"],
            app_data["installed"],
            app_data["installation_date"],
            app_data["last_updated"],
            app_data["metadata"],
            app_data["app_id"],
        ))
        conn.commit()
        conn.close()

    def get_all_apps(self) -> List[Dict]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM apps")
        rows = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        conn.close()
        return [dict(zip(columns, row)) for row in rows]

    def get_table_names(self) -> List[str]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        conn.close()
        return tables

    def get_table_columns(self, table_name: str) -> List[str]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = [row[1] for row in cursor.fetchall()]
        conn.close()
        return columns

    def query_apps_by_category(self, category: str) -> List[Dict]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM apps WHERE category = ?", (category,))
        rows = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        conn.close()
        return [dict(zip(columns, row)) for row in rows]