
from sqlalchemy import func
from datetime import datetime, timezone
from .base_repository import AsyncBaseRepository
from .models import TokenUsage, User

class AsyncTokenUsageRepository(AsyncBaseRepository):
    async def log_token_usage(self, user_id: int, chatbot_id: int, total_tokens: int, model: str, response_time: float):
        async with self.session_scope() as session:
            token_usage = TokenUsage(
                user_id=user_id,
                chatbot_id=chatbot_id,
                token_count=total_tokens,
                model=model,
                response_time=response_time,
                usage_date=datetime.now(timezone.utc)
            )
            session.add(token_usage)

    async def update_user_token_usage(self, user_id: int, chatbot_id: int, model: str, input_tokens: int, output_tokens: int):
        async with self.session_scope() as session:
            user = await session.query(User).filter_by(id=user_id).first()
            input_cost = input_tokens * MODEL_PRICES[model]['input']
            output_cost = output_tokens * MODEL_PRICES[model]['output']

            user.total_input_tokens += input_tokens
            user.total_output_tokens += output_tokens
            user.total_input_cost += input_cost
            user.total_output_cost += output_cost

            token_usage = TokenUsage(
                user_id=user_id,
                chatbot_id=chatbot_id,
                model=model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                input_cost=input_cost,
                output_cost=output_cost,
                usage_date=datetime.now(timezone.utc)
            )
            session.add(token_usage)

    async def get_token_usage_by_date_range(self, chatbot_id: int, start_date, end_date):
        async with self.session_scope() as session:
            result = await session.execute(
                select(
                    func.date(TokenUsage.usage_date).label('date'),
                    func.sum(TokenUsage.token_count).label('total_tokens'),
                    func.avg(TokenUsage.token_count).label('avg_tokens_per_interaction'),
                    func.avg(TokenUsage.response_time).label('avg_response_time')
                ).filter(
                    TokenUsage.chatbot_id == chatbot_id,
                    TokenUsage.usage_date.between(start_date, end_date)
                ).group_by(
                    func.date(TokenUsage.usage_date)
                ).order_by(
                    func.date(TokenUsage.usage_date)
                )
            )
            return result.all()
        