import json
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from database.models import Base, LocalizationVersion, Chatbot
from sqlalchemy import create_engine
from config.settings import DATABASE_URL
class LocalizationMigrator:
    def __init__(self, db_url):
        self.engine = create_engine(db_url)
        self.Session = sessionmaker(bind=self.engine)

    def migrate_localizations(self, chatbot_id, localizations_file):
        with open(localizations_file, 'r') as f:
            localizations_data = json.load(f)

        with self.Session() as session:
            chatbot = session.query(Chatbot).filter_by(id=chatbot_id).first()
            if not chatbot:
                raise ValueError(f"Chatbot with id {chatbot_id} not found")

            for language, localizations in localizations_data.items():
                for key, content in localizations.items():
                    localization_version = LocalizationVersion(
                        chatbot_id=chatbot_id,
                        key=key,
                        language=language,
                        content=content,
                        version=1
                    )
                    session.add(localization_version)

            session.commit()
        print("Localizations migrated successfully.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: python migrate_localizations.py <chatbot_id> <localizations_file>")
        sys.exit(1)

    chatbot_id = int(sys.argv[1])
    localizations_file = sys.argv[2]
    db_url = DATABASE_URL
    migrator = LocalizationMigrator(db_url)
    migrator.migrate_localizations(chatbot_id, localizations_file)