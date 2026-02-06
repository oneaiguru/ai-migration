# database/repositories/user_repository.py
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from datetime import datetime

from database.models import User

class UserRepository:
    """Repository for User model operations"""
    
    def __init__(self, session: AsyncSession):
        """Initialize the repository with a database session
        
        Args:
            session: SQLAlchemy async session
        """
        self.session = session
        
    async def get_by_telegram_id(self, telegram_id: int) -> Optional[User]:
        """Get a user by Telegram ID
        
        Args:
            telegram_id: Telegram user ID
            
        Returns:
            User or None if not found
        """
        result = await self.session.execute(
            select(User).where(User.telegram_id == telegram_id)
        )
        return result.scalars().first()
    
    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get a user by ID
        
        Args:
            user_id: User ID
            
        Returns:
            User or None if not found
        """
        return await self.session.get(User, user_id)
    
    async def create(self, telegram_id: int, username: Optional[str] = None,
                     first_name: Optional[str] = None, last_name: Optional[str] = None) -> User:
        """Create a new user
        
        Args:
            telegram_id: Telegram user ID
            username: Telegram username
            first_name: User's first name
            last_name: User's last name
            
        Returns:
            Newly created User
        """
        user = User(
            telegram_id=telegram_id,
            username=username,
            first_name=first_name,
            last_name=last_name
        )
        self.session.add(user)
        await self.session.flush()
        return user
    
    async def update_last_active(self, user_id: int) -> None:
        """Update the last_active field for a user
        
        Args:
            user_id: User ID
        """
        await self.session.execute(
            update(User)
            .where(User.id == user_id)
            .values(last_active=datetime.utcnow())
        )
        await self.session.flush()
    
    async def update_profile(self, user_id: int, username: Optional[str] = None,
                            first_name: Optional[str] = None, last_name: Optional[str] = None) -> Optional[User]:
        """Update user profile information
        
        Args:
            user_id: User ID
            username: New username
            first_name: New first name
            last_name: New last name
            
        Returns:
            Updated User or None if not found
        """
        user = await self.get_by_id(user_id)
        if not user:
            return None
            
        if username is not None:
            user.username = username
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
            
        await self.session.flush()
        return user
    
    async def get_all_users(self) -> List[User]:
        """Get all users
        
        Returns:
            List of all users
        """
        result = await self.session.execute(select(User))
        return result.scalars().all()
