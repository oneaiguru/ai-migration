# database/session_repository.py
class AsyncSessionRepository(AsyncBaseRepository):
    async def create_or_get_active_session(self, user_id: int, chatbot_id: int):
        async with self.session_scope() as session:
            thirty_minutes_ago = datetime.now(pytz.UTC) - timedelta(minutes=30)
            
            result = await session.execute(
                select(UserSession)
                .filter(
                    UserSession.user_id == user_id,
                    UserSession.chatbot_id == chatbot_id,
                    UserSession.status == 'active',
                    UserSession.last_activity > thirty_minutes_ago
                )
            )
            active_session = result.scalar_one_or_none()

            if active_session:
                active_session.last_activity = datetime.now(pytz.UTC)
            else:
                current_time = datetime.now(pytz.UTC)
                active_session = UserSession(
                    user_id=user_id,
                    chatbot_id=chatbot_id,
                    status='active',
                    start_time=current_time,
                    last_activity=current_time
                )
                session.add(active_session)
                await session.flush()

            return active_session.id

    async def cleanup_old_sessions(self, days_old: int = 30):
        async with self.session_scope() as session:
            cutoff_date = datetime.now(pytz.UTC) - timedelta(days=days_old)
            await session.execute(
                delete(UserSession)
                .where(UserSession.last_activity < cutoff_date)
            )
            self.logger.info(f"Cleaned up sessions older than {days_old} days")