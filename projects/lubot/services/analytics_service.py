
from datetime import datetime
from typing import Dict, List, Any
from utils.logger import get_logger
from utils.custom_exceptions import DatabaseException
from utils.localization import get_text
from database.session_repository import AsyncSessionRepository
from database.feedback_repository import AsyncFeedbackRepository
from database.token_usage_repository import AsyncTokenUsageRepository

class AnalyticsService:
    def __init__(self, session_repo: AsyncSessionRepository, 
                 feedback_repo: AsyncFeedbackRepository,
                 token_usage_repo: AsyncTokenUsageRepository):
        self.session_repo = session_repo
        self.feedback_repo = feedback_repo
        self.token_usage_repo = token_usage_repo
        self.logger = get_logger(__name__)

    async def get_engagement_metrics(self, chatbot_id: int, 
                             start_date: datetime, 
                             end_date: datetime) -> str:
        try:
            metrics = await self.session_repo.get_user_engagement_metrics(
                chatbot_id, start_date, end_date)
            
            formatted_metrics = (
                f"Total Sessions: {metrics['total_sessions']}\n"
                f"Average Session Duration: {metrics['avg_session_duration']:.2f} seconds\n"
                f"Total Interactions: {metrics['total_interactions']}"
            )
            return formatted_metrics
            
        except Exception as e:
            self.logger.error(f"Error getting engagement metrics: {str(e)}")
            raise DatabaseException(get_text('error_fetching_engagement_metrics'))

    async def get_feedback_analysis(self, chatbot_id: int,
                            start_date: datetime,
                            end_date: datetime) -> str:
        try:
            trends = await self.feedback_repo.get_feedback_trends(
                chatbot_id, start_date, end_date)
            
            if not trends:
                return "No feedback data available for the specified date range."
            
            result = []
            for trend in trends:
                date = trend.date.strftime('%Y-%m-%d')
                total = trend.total_feedback
                positive = trend.positive_feedback
                negative = total - positive
                positive_percentage = (positive / total * 100) if total > 0 else 0
                
                result.append(
                    f"{date}: Total - {total}, "
                    f"Positive - {positive} ({positive_percentage:.2f}%), "
                    f"Negative - {negative}"
                )
            
            return "\n".join(result)
            
        except Exception as e:
            self.logger.error(f"Error getting feedback analysis: {str(e)}")
            raise DatabaseException(get_text('error_fetching_feedback_trends'))

    async def get_token_analytics(self, chatbot_id: int,
                          start_date: datetime,
                          end_date: datetime) -> str:
        try:
            usage = await self.token_usage_repo.get_token_usage_by_date_range(
                chatbot_id, start_date, end_date)
                
            return "\n".join([
                f"{u['date']}: Total Tokens - {u['total_tokens']}, "
                f"Avg Tokens per Interaction - {u['avg_tokens_per_interaction']}, "
                f"Avg Response Time - {u['avg_response_time']}"
                for u in usage
            ])
            
        except Exception as e:
            self.logger.error(f"Error getting token analytics: {str(e)}")
            raise DatabaseException(get_text('error_fetching_token_usage'))
