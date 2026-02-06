from typing import Dict, Set, Optional, Callable, Awaitable, Any
import time
import logging
from collections import defaultdict
from aiogram import BaseMiddleware
from aiogram.types import TelegramObject, Message, CallbackQuery
import asyncio
from datetime import datetime, timedelta
import ipaddress
import math

from config.settings import get_settings
from utils.logger import get_logger

logger = get_logger(__name__)

class RateLimiter:
    """Rate limiter implementation using token bucket algorithm"""

    def __init__(
        self,
        requests_per_period: int = 30,
        period_seconds: int = 60,
        burst_factor: float = 1.5
    ):
        """Initialize rate limiter

        Args:
            requests_per_period: Number of requests allowed per period
            period_seconds: Period length in seconds
            burst_factor: Burst factor for the token bucket (allows temporary bursts)
        """
        self.requests_per_period = requests_per_period
        self.period_seconds = period_seconds
        self.rate = requests_per_period / period_seconds  # Tokens per second
        self.max_tokens = requests_per_period * burst_factor
        self.tokens: Dict[int, float] = defaultdict(float)  # User ID to tokens
        self.last_update: Dict[int, float] = defaultdict(float)  # User ID to timestamp

    def update_tokens(self, user_id: int) -> None:
        """Update token count for a user

        Args:
            user_id: User ID
        """
        now = time.time()
        last_update = self.last_update[user_id]

        if last_update == 0:
            # First request, initialize with max tokens
            self.tokens[user_id] = self.max_tokens
            self.last_update[user_id] = now
            return

        # Calculate elapsed time and add tokens
        elapsed = now - last_update
        new_tokens = elapsed * self.rate

        # Update tokens (capped at max_tokens)
        self.tokens[user_id] = min(self.max_tokens, self.tokens[user_id] + new_tokens)
        self.last_update[user_id] = now

    def consume_token(self, user_id: int) -> bool:
        """Consume a token for a user

        Args:
            user_id: User ID

        Returns:
            True if token consumed, False if rate limited
        """
        self.update_tokens(user_id)

        if self.tokens[user_id] >= 1:
            self.tokens[user_id] -= 1
            return True

        return False

    def get_wait_time(self, user_id: int) -> float:
        """Get wait time in seconds before next token is available

        Args:
            user_id: User ID

        Returns:
            Wait time in seconds
        """
        self.update_tokens(user_id)

        if self.tokens[user_id] >= 1:
            return 0

        # Calculate time until 1 token is available
        tokens_needed = 1 - self.tokens[user_id]
        return tokens_needed / self.rate

class SecurityMiddleware(BaseMiddleware):
    """Security middleware for rate limiting and IP blocking"""

    def __init__(self):
        """Initialize security middleware"""
        self.settings = get_settings()
        self.rate_limiter = RateLimiter(
            requests_per_period=self.settings.security.RATE_LIMIT_REQUESTS,
            period_seconds=self.settings.security.RATE_LIMIT_PERIOD
        )
        self.blocked_ips: Set[str] = set(self.settings.security.BLOCKED_IPS)
        self.rate_limit_enabled = self.settings.security.RATE_LIMIT_ENABLED

        # Cache warning messages to avoid spamming
        self.last_warning: Dict[int, datetime] = {}
        self.warning_threshold = timedelta(minutes=5)

        logger.info(
            f"Security middleware initialized: "
            f"rate limiting {'enabled' if self.rate_limit_enabled else 'disabled'}, "
            f"{len(self.blocked_ips)} blocked IPs"
        )

    def is_ip_blocked(self, ip_address: Optional[str]) -> bool:
        """Check if an IP address is blocked

        Args:
            ip_address: IP address to check

        Returns:
            True if IP is blocked, False otherwise
        """
        if not ip_address:
            return False

        # Check exact match
        if ip_address in self.blocked_ips:
            return True

        # Check if IP is in blocked subnet
        try:
            ip_obj = ipaddress.ip_address(ip_address)
            for blocked in self.blocked_ips:
                if '/' in blocked:  # CIDR notation
                    try:
                        network = ipaddress.ip_network(blocked, strict=False)
                        if ip_obj in network:
                            return True
                    except ValueError:
                        continue
        except ValueError:
            pass

        return False

    def should_warn_user(self, user_id: int) -> bool:
        """Check if we should warn the user about rate limiting

        Args:
            user_id: User ID

        Returns:
            True if warning should be sent, False otherwise
        """
        now = datetime.now()
        if user_id in self.last_warning:
            # Only warn once per threshold period
            if now - self.last_warning[user_id] < self.warning_threshold:
                return False

        self.last_warning[user_id] = now
        return True

    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        """Handle middleware processing

        Args:
            handler: Next handler in the middleware chain
            event: Telegram event
            data: Additional data

        Returns:
            Result of next handler
        """
        # Extract user ID and IP address
        user_id = None
        ip_address = None

        if isinstance(event, Message):
            user_id = event.from_user.id if event.from_user else None
            ip_address = getattr(event.from_user, 'ip_address', None)

        elif isinstance(event, CallbackQuery):
            user_id = event.from_user.id if event.from_user else None
            ip_address = getattr(event.from_user, 'ip_address', None)

        # Skip middleware for non-user events
        if user_id is None:
            return await handler(event, data)

        # Check for blocked IP
        if ip_address and self.is_ip_blocked(ip_address):
            logger.warning(f"Blocked request from IP {ip_address} (User ID: {user_id})")
            # Don't respond to blocked IPs
            return None

        # Apply rate limiting if enabled
        if self.rate_limit_enabled:
            if not self.rate_limiter.consume_token(user_id):
                wait_time = self.rate_limiter.get_wait_time(user_id)

                # Only warn user if we haven't warned recently
                if self.should_warn_user(user_id):
                    logger.warning(f"Rate limited user {user_id}, wait time: {wait_time:.2f}s")

                    if isinstance(event, Message):
                        await event.answer(
                            f"⚠️ Вы отправляете сообщения слишком быстро. "
                            f"Пожалуйста, подождите {math.ceil(wait_time)} секунд перед следующим запросом."
                        )
                    elif isinstance(event, CallbackQuery):
                        await event.answer(
                            f"⚠️ Слишком много запросов. Подождите {math.ceil(wait_time)} секунд.",
                            show_alert=True
                        )

                # Don't process the request
                return None

        # Proceed with request
        return await handler(event, data)