# services/author_service.py

from database.author_repository import AuthorRepository
from utils.validation import validate_email, validate_password
from utils.error_handler import handle_errors

class AuthorService:
    def __init__(self):
        self.author_repository = AuthorRepository()

    @handle_errors
    def create_author(self, username: str, email: str, password: str):
        validate_email(email)
        validate_password(password)
        password_hash = self.hash_password(password)
        return self.author_repository.create_author(username, email, password_hash)

    @handle_errors
    def update_author(self, author_id: int, **kwargs):
        if 'email' in kwargs:
            validate_email(kwargs['email'])
        if 'password' in kwargs:
            validate_password(kwargs['password'])
            kwargs['password_hash'] = self.hash_password(kwargs.pop('password'))
        return self.author_repository.update_author(author_id, **kwargs)

    @staticmethod
    def hash_password(password: str) -> str:
        # Implement password hashing logic here
        pass