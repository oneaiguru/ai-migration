import redis.asyncio as redis
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from utils.logger import get_logger
from utils.custom_exceptions import DatabaseException

class RedisManager:
    def __init__(self, host: str, port: int, db: int):
        self.pool = redis.ConnectionPool(host=host, port=port, db=db)
        self.logger = get_logger(__name__)

    @asynccontextmanager
    async def get_connection(self) -> AsyncGenerator[redis.Redis, None]:
        client = redis.Redis(connection_pool=self.pool)
        try:
            yield client
        except redis.RedisError as e:
            self.logger.error(f"Redis error: {str(e)}")
            raise DatabaseException(f"Redis connection error: {str(e)}")
        finally:
            await client.close()

    async def set_key(self, key: str, value: str, expiry: int = None) -> None:
        async with self.get_connection() as redis_client:
            if expiry:
                await redis_client.setex(key, expiry, value)
            else:
                await redis_client.set(key, value)

    async def get_key(self, key: str) -> str:
        async with self.get_connection() as redis_client:
            return await redis_client.get(key)

    async def delete_key(self, key: str) -> None:
        async with self.get_connection() as redis_client:
            await redis_client.delete(key)

    async def set_hash(self, name: str, mapping: dict) -> None:
        async with self.get_connection() as redis_client:
            await redis_client.hmset(name, mapping)

    async def get_hash(self, name: str) -> dict:
        async with self.get_connection() as redis_client:
            return await redis_client.hgetall(name)