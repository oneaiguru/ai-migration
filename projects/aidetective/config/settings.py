# config/settings.py
import os
import logging
from typing import Optional, Dict, Any, List

# Get environment variables with defaults
class SecuritySettings:
    def __init__(self):
        self.RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
        self.RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "30"))
        self.RATE_LIMIT_PERIOD = int(os.getenv("RATE_LIMIT_PERIOD", "60"))
        self.BLOCKED_IPS = os.getenv("BLOCKED_IPS", "").split(",")

class Settings:
    """Application settings from environment variables"""

    def __init__(self):
        """Initialize settings from environment variables"""
        # Critical settings - will raise error if not set
        self.TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
        self.ALLOW_MISSING_TELEGRAM_TOKEN = os.getenv(
            "ALLOW_MISSING_TELEGRAM_TOKEN",
            "false"
        ).lower() == "true"
        
        # Database settings
        # IMPORTANT: Changed default to use file-based database with async driver
        self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///app/data/sherlock.db")
        
        # OpenAI settings
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        
        # Media settings
        self.MEDIA_DIR = os.getenv("MEDIA_DIR", "media")
        self.MAX_EVIDENCE_SIZE_MB = float(os.getenv("MAX_EVIDENCE_SIZE_MB", "2.0"))
        
        # Logging settings
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
        self.LOG_FILE = os.getenv("LOG_FILE", "logs/sherlock_bot.log")
        
        # Content settings
        self.MAX_STORIES_FREE = int(os.getenv("MAX_STORIES_FREE", "3"))
        
        # Payment settings
        self.PAYMENT_API_KEY = os.getenv("PAYMENT_API_KEY")
        
        # Feature flags
        self.ENABLE_PHASE_2 = os.getenv("ENABLE_PHASE_2", "false").lower() == "true"
        self.ENABLE_BEYOND_FEATURES = os.getenv("ENABLE_BEYOND_FEATURES", "false").lower() == "true"
        self.ENABLE_ADVANCED_FEATURES = os.getenv("ENABLE_ADVANCED_FEATURES", "false").lower() == "true"
        
        # Environment
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
        
        # Security settings
        self.security = SecuritySettings()
        
        # Validate critical settings
        self._validate_settings()
    
    def _validate_settings(self):
        """Validate that required settings are present"""
        if self.TELEGRAM_TOKEN:
            return

        env = self.ENVIRONMENT.lower()
        allow_missing = self.ALLOW_MISSING_TELEGRAM_TOKEN or env == "testing"

        if env == "production":
            raise ValueError("TELEGRAM_TOKEN must be set in .env file")

        if not allow_missing:
            logging.getLogger(__name__).warning(
                "TELEGRAM_TOKEN is not set; bot startup will fail until configured. "
                "Set ALLOW_MISSING_TELEGRAM_TOKEN=true for local/test imports."
            )
    
    def get_log_level(self) -> int:
        """Get log level as an integer for Python's logging module"""
        log_levels = {
            "DEBUG": logging.DEBUG,
            "INFO": logging.INFO,
            "WARNING": logging.WARNING,
            "ERROR": logging.ERROR,
            "CRITICAL": logging.CRITICAL
        }
        return log_levels.get(self.LOG_LEVEL.upper(), logging.INFO)
    
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return self.ENVIRONMENT.lower() == "development"
    
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.ENVIRONMENT.lower() == "production"
    
    def is_testing(self) -> bool:
        """Check if running in testing environment"""
        return self.ENVIRONMENT.lower() == "testing"

# Global settings instance
_settings: Optional[Settings] = None

def get_settings() -> Settings:
    """Get settings instance"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
