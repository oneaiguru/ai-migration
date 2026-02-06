
import random
from database.ab_test_repository import AsyncABTestRepository
from utils.logger import get_logger, log_analytics

class ABTestService:
    def __init__(self):
        self.ab_test_repository = AsyncABTestRepository()
        self.logger = get_logger(__name__)

    async def get_test_results(self, chatbot_id: int, test_name: str):
        return await self.ab_test_repository.get_test_results(chatbot_id, test_name)

    async def record_feedback(self, user_id: int, chatbot_id: int, test_name: str, is_positive: bool):
        variant = await self.get_user_variant(user_id, chatbot_id, test_name)
        if variant:
            await self.ab_test_repository.record_variant_feedback(variant.id, is_positive)
        else:
            self.logger.warning(f"No variant found for user {user_id} in test '{test_name}' for chatbot {chatbot_id}")

    async def assign_user_to_variant(self, user_id: int, chatbot_id: int, test_name: str):
        variants = await self.ab_test_repository.get_ab_test_variants(chatbot_id, test_name)
        if not variants:
            self.logger.warning(f"No variants found for test '{test_name}' in chatbot {chatbot_id}")
            return None

        chosen_variant = random.choice(variants)
        await self.ab_test_repository.assign_user_to_ab_test_variant(user_id, chatbot_id, chosen_variant.id)
        return chosen_variant

    async def get_user_variant(self, user_id: int, chatbot_id: int, test_name: str):
        assignment = await self.ab_test_repository.get_user_ab_test_assignment(user_id, chatbot_id, test_name)
        if assignment:
            return assignment.variant, assignment.variant.model_config
        variant = await self.assign_user_to_variant(user_id, chatbot_id, test_name)
        return variant, variant.model_config if variant else (None, None)
