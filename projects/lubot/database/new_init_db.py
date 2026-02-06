# /Users/m/Downloads/untitled folder 95/new_init_db.py

from database.author_repository import AuthorRepository
from database.chatbot_repository import ChatbotRepository
from database.models import PromptVersion, LocalizationVersion
from prompts import PROMPTS
from utils.localization import TRANSLATIONS
import json

def init_db():
    # Initialize repositories
    author_repo = AuthorRepository()
    chatbot_repo = ChatbotRepository()

    # Create an author
    author = author_repo.create_author(
        username="new_admin",
        email="new_admin@example.com",
        password_hash="new_hashed_password"  # Replace with a secure hashed password
    )
    print(f"Created author with ID: {author.id}")

    # Create the first chatbot
    chatbot = chatbot_repo.create_chatbot(
        author_id=author.id,
        name="New Default Chatbot",
        description="Updated initial chatbot for relationships",
        avatar=None  # You can set a URL or path to an avatar image if desired
    )
    print(f"Created chatbot with ID: {chatbot.id}")

    # Load prompts
    with author_repo.session_scope() as session:
        for key, value in PROMPTS.items():
            if isinstance(value, dict):
                for gender, prompt_content in value.items():
                    prompt_version = PromptVersion(
                        chatbot_id=chatbot.id,
                        content=prompt_content,
                        version=1
                    )
                    session.add(prompt_version)
            else:
                prompt_version = PromptVersion(
                    chatbot_id=chatbot.id,
                    content=value,
                    version=1
                )
                session.add(prompt_version)
        session.commit()
    print("Loaded prompts into the database.")

    # Load localizations
    with author_repo.session_scope() as session:
        for language, translations in TRANSLATIONS.items():
            localization_version = LocalizationVersion(
                chatbot_id=chatbot.id,
                language=language,
                content=json.dumps(translations),
                version=1
            )
            session.add(localization_version)
        session.commit()
    print("Loaded localizations into the database.")

if __name__ == "__main__":
    init_db()