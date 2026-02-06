import json
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from database.models import Base, PromptVersion, Chatbot 
from sqlalchemy import create_engine
from config.settings import DATABASE_URL

class PromptMigrator:
    def __init__(self, db_url):
        self.engine = create_engine(db_url)
        self.Session = sessionmaker(bind=self.engine)

    def migrate_prompts(self, chatbot_id, prompts_file):
        with open(prompts_file, 'r') as f:
            prompts_data = json.load(f)

        with self.Session() as session:
            chatbot = session.query(Chatbot).filter_by(id=chatbot_id).first()
            if not chatbot:
                raise ValueError(f"Chatbot with id {chatbot_id} not found")

            for key, value in prompts_data.items():
                if isinstance(value, dict):
                    for gender, content in value.items():
                        prompt_version = PromptVersion(
                            chatbot_id=chatbot_id,
                            key=key,
                            gender=gender,
                            language='ru',
                            content=content,
                            version=1,
                            variant='default'
                        )
                        session.add(prompt_version)
                else:
                    prompt_version = PromptVersion(
                        chatbot_id=chatbot_id,
                        key=key,
                        gender='Не хочу указывать',
                        language='ru',
                        content=value,
                        version=1,
                        variant='default'
                    )
                    session.add(prompt_version)

            session.commit()
        print("Prompts migrated successfully.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: python migrate_prompts.py <chatbot_id> <prompts_file>")
        sys.exit(1)

    chatbot_id = int(sys.argv[1])
    prompts_file = sys.argv[2]
    db_url = DATABASE_URL
    migrator = PromptMigrator(db_url)
    migrator.migrate_prompts(chatbot_id, prompts_file)