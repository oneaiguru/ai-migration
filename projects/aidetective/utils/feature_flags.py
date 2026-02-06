from enum import Enum
from typing import Dict, Set, Optional
from config.settings import Settings

class Feature(Enum):
    # Phase 1 Features (Base Features)
    BASIC_NAVIGATION = "basic_navigation"
    BASIC_CHARACTERS = "basic_characters"
    SINGLE_STORY = "single_story"

    # Phase 2 Features
    AI_GENERATION = "ai_generation"
    CHARACTER_STATUS_CHANGE = "character_status_change"
    PROGRESS_TRACKING = "progress_tracking"
    VISUAL_INDICATORS = "visual_indicators"
    EVIDENCE_ANALYSIS = "evidence_analysis"

    # Beyond Phase 2
    MULTIMEDIA_SUPPORT = "multimedia_support"
    PAYMENT_INTEGRATION = "payment_integration"
    SUBSCRIPTION_SYSTEM = "subscription_system"
    ADDITIONAL_STORIES = "additional_stories"
    FALSE_LEADS = "false_leads"

class FeatureFlags:
    def __init__(self):
        self.settings = Settings()
        self._enabled_features: Set[Feature] = set()
        self._initialize_flags()

    def _initialize_flags(self):
        """Initialize feature flags based on environment or config"""
        # Always enable Phase 1 features
        self._enabled_features.update([
            Feature.BASIC_NAVIGATION,
            Feature.BASIC_CHARACTERS,
            Feature.SINGLE_STORY
        ])

        # Enable Phase 2 features based on config
        if self.settings.ENABLE_PHASE_2:
            self._enabled_features.update([
                Feature.CHARACTER_STATUS_CHANGE,
                Feature.PROGRESS_TRACKING,
                Feature.VISUAL_INDICATORS,
                Feature.EVIDENCE_ANALYSIS
            ])

            # Only enable AI generation if API key is configured
            if self.settings.OPENAI_API_KEY:
                self._enabled_features.add(Feature.AI_GENERATION)

        # Enable beyond features based on config
        if self.settings.ENABLE_BEYOND_FEATURES:
            self._enabled_features.update([
                Feature.MULTIMEDIA_SUPPORT,
                Feature.ADDITIONAL_STORIES
            ])

            # Only enable payment features if API keys are configured
            if self.settings.PAYMENT_API_KEY:
                self._enabled_features.update([
                    Feature.PAYMENT_INTEGRATION,
                    Feature.SUBSCRIPTION_SYSTEM
                ])

            # Advanced features
            if self.settings.ENABLE_ADVANCED_FEATURES:
                self._enabled_features.add(Feature.FALSE_LEADS)

    def is_enabled(self, feature: Feature) -> bool:
        """Check if a feature is enabled"""
        return feature in self._enabled_features

    def enable(self, feature: Feature) -> None:
        """Enable a feature"""
        self._enabled_features.add(feature)

    def disable(self, feature: Feature) -> None:
        """Disable a feature"""
        if feature in self._enabled_features:
            self._enabled_features.remove(feature)

    def get_enabled_features(self) -> Set[Feature]:
        """Get all enabled features"""
        return self._enabled_features.copy()

# Singleton instance
_instance: Optional[FeatureFlags] = None

def get_feature_flags() -> FeatureFlags:
    """Get the feature flags instance"""
    global _instance
    if _instance is None:
        _instance = FeatureFlags()
    return _instance