#!/usr/bin/env python3
"""
Database fix script to ensure all stories have proper start nodes
This script checks for stories without start nodes and adds default ones
"""

import asyncio
import logging
import sys
from sqlalchemy import select, insert
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Default start node content for stories missing one
DEFAULT_START_NODE = {
    "content": "Вы начинаете новое расследование. Что вы хотите сделать в первую очередь?",
    "transitions": {
        "Опросить свидетелей": "interview_witnesses",
        "Осмотреть место преступления": "examine_scene",
        "Изучить улики": "examine_evidence"
    }
}

# Default follow-up nodes
DEFAULT_FOLLOW_UP_NODES = {
    "interview_witnesses": {
        "node_id": "interview_witnesses",
        "content": "Вы решаете опросить свидетелей. Кого вы хотите опросить первым?",
        "transitions": {
            "Библиотекаря": "talk_to_librarian",
            "Директора": "talk_to_director",
            "Студента": "talk_to_student",
            "Вернуться к расследованию": "start"
        }
    },
    "examine_scene": {
        "node_id": "examine_scene",
        "content": "Вы внимательно осматриваете место происшествия. Что конкретно вы хотите изучить?",
        "transitions": {
            "Кабинет библиотекаря": "examine_office",
            "Хранилище книг": "examine_storage",
            "Общий зал": "examine_hall",
            "Вернуться к расследованию": "start"
        }
    },
    "examine_evidence": {
        "node_id": "examine_evidence",
        "content": "Какую улику вы хотите изучить?",
        "transitions": {
            "Следы чернил": "examine_ink",
            "Открытую книгу": "examine_book",
            "Дверь комнаты": "examine_door",
            "Вернуться к расследованию": "start"
        }
    }
}

async def fix_story_nodes():
    """Check and fix stories without start nodes"""
    
    try:
        # Use a fixed database URL instead of relying on settings
        db_url = "sqlite+aiosqlite:///app/data/sherlock.db"
        logger.info(f"Using database URL: {db_url}")
        
        # Import models only here to avoid circular imports
        sys.path.append('.')
        from database.models import Story, StoryNode
        
        # Initialize database connection
        engine = create_async_engine(db_url)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            # Get all stories
            stories_result = await session.execute(select(Story))
            stories = stories_result.scalars().all()
            
            if not stories:
                logger.warning("No stories found in database")
                return
            
            logger.info(f"Found {len(stories)} stories in database")
            
            # Check each story for a start node
            for story in stories:
                logger.info(f"Checking story ID {story.id}: {story.title}")
                
                # Check if start node exists
                start_node_result = await session.execute(
                    select(StoryNode).where(
                        (StoryNode.story_id == story.id) & 
                        (StoryNode.node_id == "start")
                    )
                )
                start_node = start_node_result.scalar_one_or_none()
                
                if not start_node:
                    logger.warning(f"Start node not found for story {story.id}. Adding default start node.")
                    
                    # Create default start node
                    await session.execute(
                        insert(StoryNode).values(
                            story_id=story.id,
                            node_id="start",
                            content=DEFAULT_START_NODE["content"],
                            transitions=DEFAULT_START_NODE["transitions"]
                        )
                    )
                    
                    # Add follow-up nodes
                    for node_id, node_data in DEFAULT_FOLLOW_UP_NODES.items():
                        # Check if node already exists
                        existing_node_result = await session.execute(
                            select(StoryNode).where(
                                (StoryNode.story_id == story.id) & 
                                (StoryNode.node_id == node_id)
                            )
                        )
                        existing_node = existing_node_result.scalar_one_or_none()
                        
                        if not existing_node:
                            await session.execute(
                                insert(StoryNode).values(
                                    story_id=story.id,
                                    node_id=node_data["node_id"],
                                    content=node_data["content"],
                                    transitions=node_data["transitions"]
                                )
                            )
                    
                    logger.info(f"Added default nodes for story {story.id}")
                else:
                    logger.info(f"Start node exists for story {story.id}")
            
            # Commit changes
            await session.commit()
            logger.info("Database update complete")
    
    except Exception as e:
        logger.error(f"Error fixing story nodes: {e}")
        raise
    finally:
        # Close connection
        if 'engine' in locals():
            await engine.dispose()

if __name__ == "__main__":
    try:
        asyncio.run(fix_story_nodes())
        logger.info("Story node fix script completed successfully")
    except Exception as e:
        logger.error(f"Script failed: {e}")
        sys.exit(1)
