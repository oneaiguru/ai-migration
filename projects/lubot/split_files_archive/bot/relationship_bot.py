from typing import Tuple, Optional
import os
import asyncio
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

from database.models import User, Partner
from database.user_repository import AsyncUserRepository  # Updated import
from database.referral_repository import AsyncReferralRepository  # Updated import
# ... other imports ...

class RelationshipBot:
    def __init__(self, user_repository: AsyncUserRepository,  # Updated type hint
                 referral_repository: AsyncReferralRepository,  # Updated type hint
                 partner_repository: PartnerRepository,
                 bot_username: str,
                 chatbot_id: int):
        
        # Set up logger
        self.logger = get_logger(__name__)
        
        # Basic attributes
        self.bot_username = bot_username
        self.chatbot_id = chatbot_id
        
        # Initialize repositories
        self.user_repository = user_repository
        self.referral_repository = referral_repository
        # ... rest of initialization ...

    async def create_or_get_user(self, user_id: int, chatbot_id: int, 
                                username: Optional[str]) -> Tuple[User, Optional[str]]:
        try:
            # Direct async call without executor
            user = await self.user_repository.get_user(user_id, chatbot_id)
            
            if not user:
                user = await self.user_repository.create_user(user_id, chatbot_id, username)
                self.logger.info(f"Created new user: {user_id} for chatbot: {chatbot_id}")
            
            active_partner = await self.get_active_partner(user_id, chatbot_id)
            
            if not active_partner:
                return user, get_text('no_active_partner')
            
            return user, None
            
        except Exception as e:
            self.logger.error(f"Error creating/getting user {user_id}: {str(e)}")
            raise DatabaseException(f"Error creating/getting user: {str(e)}")

    # ... other methods with similar async updates ...