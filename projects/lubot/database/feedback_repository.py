
from .base_repository import AsyncBaseRepository
from .models import Feedback
from sqlalchemy import func, desc, select
from typing import Optional

class AsyncFeedbackRepository(AsyncBaseRepository):
    async def handle_feedback(self, session_id: int, user_id: int, chatbot_id: int, 
                            interaction_id: int, is_positive: bool, 
                            text_feedback: Optional[str] = None) -> Feedback:
        async with self.session_scope() as session:
            feedback = Feedback(
                session_id=session_id,
                user_id=user_id,
                chatbot_id=chatbot_id,
                interaction_id=interaction_id,
                is_positive=is_positive,
                text_feedback=text_feedback
            )
            session.add(feedback)
            await session.flush()
            return feedback

    async def get_aggregated_feedback_data(self, chatbot_id: int):
        async with self.session_scope() as session:
            total_count = await session.execute(
                select(func.count(Feedback.id)).filter_by(chatbot_id=chatbot_id)
            )
            total_feedback = total_count.scalar()

            positive_count = await session.execute(
                select(func.count(Feedback.id))
                .filter_by(chatbot_id=chatbot_id, is_positive=True)
            )
            positive_feedback = positive_count.scalar()

            common_themes = await session.execute(
                select(
                    func.count(Feedback.id).label('count'),
                    func.substring(Feedback.text_feedback, 1, 50).label('theme')
                )
                .filter_by(chatbot_id=chatbot_id)
                .group_by('theme')
                .order_by(desc('count'))
                .limit(5)
            )

            themes = common_themes.all()
            return {
                'total_feedback': total_feedback,
                'positive_ratio': positive_feedback / total_feedback if total_feedback > 0 else 0,
                'common_themes': [{'count': t.count, 'theme': t.theme} for t in themes]
            }