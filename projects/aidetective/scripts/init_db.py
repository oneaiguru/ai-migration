#!/usr/bin/env python3
"""
Script to initialize the database and load test story data
Run this script before starting the bot for the first time

Usage:
    python scripts/init_db.py
"""

import asyncio
import logging
import sys
import os
from pathlib import Path

# Add root directory to path
sys.path.append('.')

# Import other modules
from database.session import init_db
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from story_engine.story_manager import StoryManager
from database.repositories.story_repository import StoryRepository

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def initialize_database():
    """Initialize the database and load initial data"""
    db_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///app/data/sherlock.db")
    logger.info(f"Using database URL: {db_url}")
    
    try:
        # Initialize database with explicit URL
        await init_db(db_url)
        logger.info(f"Database initialized successfully with URL: {db_url}")
        
        # Create engine with explicit URL
        engine = create_async_engine(db_url)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        # Import story data
        async with async_session() as session:
            story_repo = StoryRepository(session)
            
            # Check if stories directory exists
            stories_dir = Path('config/stories')
            if not stories_dir.exists():
                logger.error(f"Stories directory not found: {stories_dir}")
                return
            
            # Import all JSON files in stories directory
            for story_file in stories_dir.glob('*.json'):
                try:
                    logger.info(f"Importing story from {story_file}")
                    story_id = await StoryManager.import_story_from_file(story_repo, str(story_file))
                    logger.info(f"Successfully imported story ID: {story_id}")
                except Exception as e:
                    logger.error(f"Error importing story {story_file}: {e}")
            
            await session.commit()
        
        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

if __name__ == "__main__":
    try:
        asyncio.run(initialize_database())
    except Exception as e:
        logger.error(f"Initialization failed: {e}")
        sys.exit(1)
