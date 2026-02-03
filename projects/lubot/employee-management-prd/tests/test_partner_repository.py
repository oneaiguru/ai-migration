# tests/test_partner_repository.py

import unittest
from database.partner_repository import PartnerRepository
from database.models import Partner, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from utils.custom_exceptions import ValidationError, DatabaseException

class TestPartnerRepository(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Setup in-memory SQLite database for testing
        cls.engine = create_engine('sqlite:///:memory:')
        Base.metadata.create_all(cls.engine)
        cls.Session = sessionmaker(bind=cls.engine)
        cls.partner_repo = PartnerRepository()
        cls.partner_repo.engine = cls.engine
        cls.partner_repo.SessionMaker = cls.Session

    def test_update_partner_success(self):
        # Create a partner
        with self.partner_repo.session_scope() as session:
            partner = Partner(user_id=1, chatbot_id=1, name='Original Name', is_active=True)
            session.add(partner)
            session.flush()
            partner_id = partner.id
        
        # Update the partner's name
        self.partner_repo.update_partner(user_id=1, chatbot_id=1, partner_id=partner_id, new_name='Updated Name')
        
        # Verify the update
        with self.partner_repo.session_scope() as session:
            updated_partner = session.query(Partner).filter_by(id=partner_id).first()
            self.assertEqual(updated_partner.name, 'Updated Name')

    def test_update_partner_not_found(self):
        with self.assertRaises(DatabaseException) as context:
            self.partner_repo.update_partner(user_id=1, chatbot_id=1, partner_id=999, new_name='Name')
        
        # Optionally, verify that the cause is ValidationError
        self.assertIsInstance(context.exception.__cause__, ValidationError)
        self.assertEqual(
            str(context.exception.__cause__),
            "Partner with ID 999 not found for user 1 and chatbot 1."
        )

if __name__ == '__main__':
    unittest.main()
