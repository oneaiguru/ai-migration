# services/partner_service.py
from database.partner_repository import PartnerRepository, Partner
from utils.logger import get_logger
from utils.localization import get_text
from utils.custom_exceptions import ValidationError, DatabaseException
from typing import Optional

class PartnerService:
    def __init__(self, partner_repository: PartnerRepository):
        self.partner_repository = partner_repository
        self.logger = get_logger(__name__)

    def get_partners(self, user_id: int, chatbot_id: int) -> list:
        try:
            return self.partner_repository.get_partners(user_id, chatbot_id)
        except Exception as e:
            self.logger.error(f"Error retrieving partners for user {user_id} and chatbot {chatbot_id}: {str(e)}")
            raise DatabaseException(get_text("database_error"))

    def get_active_partner(self, user_id: int, chatbot_id: int):
        try:
            return self.partner_repository.get_active_partner(user_id, chatbot_id)
        except Exception as e:
            self.logger.error(f"Error retrieving active partner for user {user_id} and chatbot {chatbot_id}: {str(e)}")
            raise DatabaseException(get_text("database_error"))

    def set_active_partner(self, user_id: int, chatbot_id: int, partner_id: int) -> str:
        try:
            partner = self.partner_repository.get_partner(user_id, chatbot_id, partner_id)
            if not partner:
                raise ValidationError(get_text('partner_not_found'))
            
            self.partner_repository.set_active_partner(user_id, chatbot_id, partner_id)
            return get_text('active_partner_set', partner_name=partner.name)
        except ValidationError as e:
            self.logger.warning(f"Validation error setting active partner for user {user_id} and chatbot {chatbot_id}: {str(e)}")
            raise
        except Exception as e:
            self.logger.error(f"Error setting active partner for user {user_id} and chatbot {chatbot_id}: {str(e)}")
            raise DatabaseException(get_text("database_error"))

    def add_partner(self, user_id: int, chatbot_id: int, partner_identifier: str) -> str:
        try:
            existing_partners = self.get_partners(user_id, chatbot_id)
            if len(existing_partners) >= 5:
                return get_text("max_partners_reached")

            new_partner_number = len(existing_partners) + 1
            new_partner_name = f"Партнер {new_partner_number}"

            while any(p.name == new_partner_name for p in existing_partners):
                new_partner_number += 1
                new_partner_name = f"Партнер {new_partner_number}"

            partner = self.partner_repository.create_partner(user_id, chatbot_id, new_partner_name)
            self.set_active_partner(user_id, chatbot_id, partner.id)

            return get_text("partner_added", partner_name=new_partner_name)
        except Exception as e:
            self.logger.error(f"Error adding partner for user {user_id} and chatbot {chatbot_id}: {str(e)}")
            raise DatabaseException(get_text("database_error"))

    def rename_partner(self, user_id: int, chatbot_id: int, partner_id: int, new_name: str) -> str:
        try:
            partner = self.partner_repository.get_partner(user_id, chatbot_id, partner_id)
            if not partner:
                raise ValidationError(get_text('partner_not_found'))
            
            self.partner_repository.update_partner(user_id, chatbot_id, partner_id, new_name=new_name)
            return get_text('partner_renamed_success', new_name=new_name)
        except ValidationError as e:
            self.logger.warning(f"Validation error renaming partner for user {user_id} and chatbot {chatbot_id}: {str(e)}")
            raise
        except Exception as e:
            self.logger.error(f"Error renaming partner for user {user_id} and chatbot {chatbot_id}: {str(e)}")
            raise DatabaseException(get_text("database_error"))

    def remove_partner(self, user_id: int, chatbot_id: int, partner_id: int) -> str:
        try:
            partner = self.partner_repository.get_partner(user_id, chatbot_id, partner_id)
            if not partner:
                raise ValidationError(get_text('partner_not_found', partner_number=partner_id))
            
            partner_name = partner.name
            self.partner_repository.remove_partner(user_id, chatbot_id, partner_id)

            active_partner = self.get_active_partner(user_id, chatbot_id)
            if active_partner and active_partner.id == partner_id:
                new_active = self.partner_repository.get_latest_partner(user_id, chatbot_id)
                if new_active:
                    self.set_active_partner(user_id, chatbot_id, new_active.id)
                    return f"{get_text('partner_removed', partner_name=partner_name)}\n{get_text('active_partner_reassigned', partner_name=new_active.name)}"
                else:
                    return f"{get_text('partner_removed', partner_name=partner_name)}\n{get_text('no_active_partners_left')}"
            
            return get_text('partner_removed', partner_name=partner_name)
        except ValidationError as e:
            self.logger.warning(f"Validation error removing partner for user {user_id} and chatbot {chatbot_id}: {str(e)}")
            raise
        except Exception as e:
            self.logger.error(f"Error removing partner for user {user_id} and chatbot {chatbot_id}: {str(e)}")
            raise DatabaseException(get_text("database_error"))
        

    
    def get_partner_by_id(self, user_id: int, chatbot_id: int, partner_id: int) -> Optional[Partner]:
        try:
            return self.partner_repository.get_partner(user_id, chatbot_id, partner_id)
        except Exception as e:
            self.logger.error(f"Error retrieving partner by ID for user {user_id} and chatbot {chatbot_id}: {str(e)}")
            raise DatabaseException(get_text("database_error"))