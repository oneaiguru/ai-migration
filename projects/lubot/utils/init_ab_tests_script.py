from database.user_repository import UserRepository
from database.referral_repository import ReferralRepository
from utils.custom_exceptions import DatabaseException
from database.models import Chatbot, ABTestVariant
import sys
import os

async def init_ab_tests(user_repository: UserRepository, referral_repository: ReferralRepository):
    async with user_repository.session_scope() as session:
        chatbot = await session.query(Chatbot).first()
        if not chatbot:
            print("Error: No chatbot found in the database. Please create a chatbot first.")
            return

    variants = [
        ABTestVariant(
            chatbot_id=chatbot.id,
            test_name="response_generation",
            variant_name="gpt-4-mini",
            description="Use GPT-4 mini for response generation",
            model_config="gpt-4-mini"
        ),
        ABTestVariant(
            chatbot_id=chatbot.id,
            test_name="response_generation",
            variant_name="gpt-4",
            description="Use GPT-4 for response generation",
            model_config="gpt-4"
        ),
        ABTestVariant(
            chatbot_id=chatbot.id,
            test_name="prompt_set",
            variant_name="default_prompts",
            description="Use default prompt set",
            model_config="default"
        ),
        ABTestVariant(
            chatbot_id=chatbot.id,
            test_name="prompt_set",
            variant_name="alternative_prompts",
            description="Use alternative prompt set",
            model_config="alternative"
        )
    ]

    try:
        async with user_repository.session_scope() as session:
            for variant in variants:
                exists = await session.query(ABTestVariant).filter_by(
                    variant_name=variant.variant_name,
                    test_name=variant.test_name,
                    chatbot_id=variant.chatbot_id
                ).first()
                if not exists:
                    session.add(variant)
            await session.commit()
        print("A/B test variants initialized successfully.")
    except DatabaseException as e:
        print(f"Error initializing A/B tests: {e}")
