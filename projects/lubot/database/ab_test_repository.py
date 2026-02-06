
# ab_test_repository.py
from .base_repository import AsyncBaseRepository
from .models import ABTestVariant, UserABTestAssignment
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

class AsyncABTestRepository(AsyncBaseRepository):
    async def get_ab_test_variants(self, chatbot_id: int, test_name: str):
        async with self.session_scope() as session:
            result = await session.execute(
                select(ABTestVariant)
                .filter_by(chatbot_id=chatbot_id, test_name=test_name)
            )
            return result.scalars().all()
    
    async def initialize_ab_test_variants(self, chatbot_id: int, test_name: str, variants: list[str]):
        async with self.session_scope() as session:
            result = await session.execute(
                select(ABTestVariant)
                .filter_by(chatbot_id=chatbot_id, test_name=test_name)
            )
            existing_variants = result.scalars().all()
            existing_variant_names = {v.variant_name for v in existing_variants}

            for variant_name in variants:
                if variant_name not in existing_variant_names:
                    new_variant = ABTestVariant(
                        chatbot_id=chatbot_id,
                        test_name=test_name,
                        variant_name=variant_name,
                        positive_feedback_count=0,
                        negative_feedback_count=0
                    )
                    session.add(new_variant)

    async def get_test_results(self, chatbot_id: int, test_name: str):
        async with self.session_scope() as session:
            results = await session.execute(
                select(
                    ABTestVariant.variant_name,
                    func.count(UserABTestAssignment.id).label('total_assignments'),
                    ABTestVariant.positive_feedback_count.label('positive_feedback'),
                    ABTestVariant.negative_feedback_count.label('negative_feedback')
                )
                .join(UserABTestAssignment)
                .filter(ABTestVariant.chatbot_id == chatbot_id, ABTestVariant.test_name == test_name)
                .group_by(ABTestVariant.variant_name, ABTestVariant.positive_feedback_count, ABTestVariant.negative_feedback_count)
            )
            
            return [
                {
                    'variant_name': r.variant_name,
                    'total_assignments': r.total_assignments,
                    'positive_feedback': r.positive_feedback,
                    'negative_feedback': r.negative_feedback,
                    'feedback_ratio': (r.positive_feedback) / (r.positive_feedback + r.negative_feedback) if (r.positive_feedback + r.negative_feedback) > 0 else 0
                }
                for r in results
            ]

    async def record_variant_feedback(self, variant_id: int, is_positive: bool):
        async with self.session_scope() as session:
            result = await session.execute(
                select(ABTestVariant).filter_by(id=variant_id)
            )
            variant = result.scalar_one_or_none()
            if variant:
                if is_positive:
                    variant.positive_feedback_count += 1
                else:
                    variant.negative_feedback_count += 1
            else:
                self.logger.warning(f"Variant with id {variant_id} not found when recording feedback")
