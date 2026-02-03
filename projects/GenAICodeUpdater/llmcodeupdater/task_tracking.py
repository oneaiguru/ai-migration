import sqlite3
from typing import List, Dict, Optional
from datetime import datetime
import time
import logging
from pathlib import Path
from llmcodeupdater.config import get_centralized_path

logger = logging.getLogger(__name__)

class TaskTracker:
    def __init__(self, custom_db_path: Optional[str] = None):
        """Initialize TaskTracker with optional custom database path."""
        self.db_path = custom_db_path if custom_db_path else get_centralized_path('tasks.db')
        self._init_db()

    def _init_db(self) -> None:
        """Initialize the SQLite database with required table and indexes."""
        logger.info(f"Initializing the database at {self.db_path}")

        try:
            # Ensure the directory exists
            db_dir = Path(self.db_path).parent
            db_dir.mkdir(parents=True, exist_ok=True)
            
            # Verify directory was created
            if not db_dir.exists():
                raise OSError(f"Failed to create directory: {db_dir}")

            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS tasks (
                        file_path TEXT,
                        status TEXT DEFAULT 'pending',
                        error_message TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        created_for_project TEXT,
                        processing_time REAL DEFAULT 0.0,
                        PRIMARY KEY (file_path, created_for_project)
                    )
                """)

                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_project_status
                    ON tasks(created_for_project, status)
                """)

                # Migrate any legacy single-PK schema to composite PK without losing data
                cursor.execute("PRAGMA table_info(tasks)")
                columns = cursor.fetchall()
                pk_columns = [col[1] for col in columns if col[5] > 0]
                if pk_columns != ['file_path', 'created_for_project']:
                    logger.info("Migrating tasks table to composite primary key (file_path, created_for_project)")
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS tasks_new (
                            file_path TEXT,
                            status TEXT DEFAULT 'pending',
                            error_message TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            created_for_project TEXT,
                            processing_time REAL DEFAULT 0.0,
                            PRIMARY KEY (file_path, created_for_project)
                        )
                    """)
                    cursor.execute("""
                        INSERT OR IGNORE INTO tasks_new
                        (file_path, status, error_message, created_at, updated_at, created_for_project, processing_time)
                        SELECT file_path, status, error_message, created_at, updated_at, created_for_project, processing_time
                        FROM tasks
                    """)
                    cursor.execute("DROP TABLE tasks")
                    cursor.execute("ALTER TABLE tasks_new RENAME TO tasks")
                    cursor.execute("""
                        CREATE INDEX IF NOT EXISTS idx_project_status
                        ON tasks(created_for_project, status)
                    """)
                conn.commit()
            logger.info("Database initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize database: {str(e)}")
            raise

    def clear_project_tasks(self, project_path: str) -> None:
        """Clear all tasks for a specific project before starting new run."""
        start_time = time.time()
        logger.info(f"Starting to clear tasks for project: {project_path}")
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tasks WHERE created_for_project = ?", (str(project_path),))
            conn.commit()
        logger.info(f"Cleared previous tasks for project {project_path} in {time.time() - start_time:.2f}s")

    def add_tasks(self, file_paths: List[str], project_path: str) -> None:
        """Add new tasks to track with project association."""
        start_time = time.time()
        project_path = str(project_path)  # Convert Path objects to string if needed
        logger.info(f"Adding {len(file_paths)} tasks for project: {project_path}")

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            # Use a single transaction for better performance
            for file_path in file_paths:
                cursor.execute("""
                    INSERT OR REPLACE INTO tasks
                    (file_path, status, error_message, created_for_project, processing_time)
                    VALUES (?, 'pending', NULL, ?, 0.0)
                """, (str(file_path), project_path))
            conn.commit()
        logger.info(f"Added {len(file_paths)} tasks in {time.time() - start_time:.2f}s")

    def update_task_status(self, file_path: str, project_path: str, status: str, error_message: Optional[str] = None, processing_time: float = 0.0) -> None:
        """Update the status of a task with processing time."""
        logger.info(f"Updating task {file_path} to status: {status}")
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE tasks
                SET status = ?,
                    error_message = ?,
                    updated_at = CURRENT_TIMESTAMP,
                    processing_time = ?
                WHERE file_path = ? AND created_for_project = ?
                """,
                (status, error_message, processing_time, str(file_path), str(project_path))
            )
            conn.commit()
        logger.info(f"Task {file_path} updated to status: {status}")

    def get_task_summary(self, project_path: str) -> Dict[str, any]:
        """Get a summary of task statuses for specific project with performance metrics."""
        logger.info(f"Retrieving task summary for project: {project_path}")
        project_path = str(project_path)  # Convert Path objects to string if needed

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'updated' THEN 1 ELSE 0 END) as updated,
                    SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped,
                    SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error,
                    AVG(CASE WHEN processing_time > 0 THEN processing_time END) as avg_time,
                    MAX(processing_time) as max_time,
                    SUM(processing_time) as total_time
                FROM tasks
                WHERE created_for_project = ?
            """, (project_path,))
            row = cursor.fetchone()

            summary = {
                'total': int(row[0] or 0),
                'pending': int(row[1] or 0),
                'updated': int(row[2] or 0),
                'skipped': int(row[3] or 0),
                'error': int(row[4] or 0),
                'performance': {
                    'average_processing_time': float(row[5] or 0),
                    'max_processing_time': float(row[6] or 0),
                    'total_processing_time': float(row[7] or 0)
                }
            }

            logger.info(f"Task summary retrieved for project {project_path}")
            return summary

    def cleanup_old_tasks(self, days_old: int = 7) -> None:
        """Clean up tasks older than specified days."""
        logger.info(f"Cleaning up tasks older than {days_old} days")
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """DELETE FROM tasks
                   WHERE datetime(created_at) < datetime('now', ?)""",
                (f'-{days_old} days',)
            )
            conn.commit()
        logger.info(f"Cleaned up tasks older than {days_old} days.")
