# PRD v1.5 - Provider & Limits Sections (October 2025)

## 📊 Current Provider Landscape

### Provider Profiles (Verify Monthly)

| Provider | Tier | Price | Window | Capacity | Models | Last Verified |
|----------|------|-------|--------|----------|---------|--------------|
| Anthropic | Claude Pro | $20/mo | 5h rolling | Baseline | Sonnet 4.5, Opus 4 | Oct 2025 |
| Anthropic | Claude Max 5× | $100/mo* | 5h rolling | 5× Pro capacity | Sonnet 4.5, Opus 4 | Oct 2025 |
| Anthropic | Claude Max 20× | $400/mo* | 5h rolling | 20× Pro capacity | Sonnet 4.5, Opus 4 | Oct 2025 |
| OpenAI | Codex Standard | $20/mo | 5h rolling | ~50-100 msgs | GPT-5-Codex | Oct 2025 |
| OpenAI | Codex Plus | $50/mo* | 5h rolling | Enhanced | GPT-5-Codex | Oct 2025 |
| Z.AI | GLM Lite | $10/mo | 5h fixed | 120 prompts/5h | GLM-4.6 Coding | Oct 2025 |
| Z.AI | GLM Pro | $30/mo | 5h fixed | 600 prompts/5h | GLM-4.6 Coding | Oct 2025 |
| Z.AI | GLM Max | $60/mo | 5h fixed | 2400 prompts/5h | GLM-4.6 Coding | Oct 2025 |

*Estimated pricing (vendor limits change; confirm at run-time)

### Window Mechanics

```python
window_structure = {
    'base_cycle': '5 hours',
    'types': {
        'rolling': 'Continuous 5h windows (Claude, Codex)',
        'fixed': 'Clock-aligned windows (Z.AI GLM)'
    },
    'overlays': {
        'weekly_cap': 'Additional limit on total weekly usage',
        'daily_cap': 'Some providers may have daily maximums',
        'quality_tier': 'Premium models may consume more capacity'
    }
}
```

## 📐 Capacity Normalization Framework

### Dual Tracking System
Track both absolute units AND relative consumption:

```python
@dataclass
class ProviderUsage:
    # Absolute metrics
    messages_used: int  # Actual messages/prompts
    messages_limit: int  # Window or daily limit
    
    # Relative metrics (if available)
    weekly_bar_pct: float  # % of weekly capacity
    daily_bar_pct: float   # % of daily capacity (if shown)
    
    # Window tracking
    window_id: str  # W0-01, W0-02, etc.
    window_start: datetime
    window_end: datetime
    
    def to_capacity_units(self) -> float:
        """Normalize to comparable units across providers"""
        if self.messages_limit > 0:
            return self.messages_used / self.messages_limit
        elif self.weekly_bar_pct is not None:
            return self.weekly_bar_pct / 100
        else:
            raise ValueError("No normalization basis available")
```

### Cross-Provider Comparison

```python
def compute_efficiency(provider: str, windows: List[Window]) -> dict:
    """Calculate features per capacity unit"""
    
    total_features = sum(w.features_completed for w in windows)
    total_capacity = sum(w.capacity_consumed for w in windows)
    
    # Provider-specific normalization
    if provider in ['claude_pro', 'claude_max']:
        # Use weekly bar % as primary metric
        capacity_units = total_capacity  # Already in %
    elif provider.startswith('glm'):
        # Use prompts as primary metric  
        capacity_units = total_capacity / PROMPTS_PER_TIER[provider]
    elif provider.startswith('codex'):
        # Use messages within 5h windows
        capacity_units = total_capacity / MESSAGES_PER_WINDOW[provider]
    
    return {
        'features_per_unit': total_features / capacity_units,
        'cost_per_feature': (MONTHLY_COST[provider] / 30) / (total_features / len(windows)),
        'confidence_interval': calculate_ci(windows)
    }
```

## 🎯 Measurement Protocol Adjustments

### 5-Hour Window Schedule

```python
# Aligned to 5-hour boundaries for consistency
WINDOW_SCHEDULE = [
    "00:00-05:00",  # Window 1
    "05:00-10:00",  # Window 2  
    "10:00-15:00",  # Window 3
    "15:00-20:00",  # Window 4
    "20:00-00:00",  # Window 5 (next day)
]

# Maximum theoretical: 5 windows/day × 7 days = 35 windows/week
# Realistic with sleep: 3 windows/day × 7 days = 21 windows/week
# Minimum for statistics: 20 windows total
```

### Provider-Specific Tracking

```python
PROVIDER_CONFIGS = {
    'claude_max_5x': {
        'cli_command': 'claude --max',
        'usage_command': '/usage',
        'parse_fields': ['session_remaining', 'weekly_bar_pct'],
        'capacity_multiplier': 5.0,
        'reset': '5h rolling'
    },
    'glm_max': {
        'cli_command': 'z.ai --tier max', 
        'usage_command': '/quota',
        'parse_fields': ['prompts_remaining', 'window_end'],
        'capacity_limit': 2400,
        'reset': '5h fixed'
    },
    'gpt5_codex': {
        'cli_command': 'codex',
        'usage_command': '/status',
        'parse_fields': ['messages_used_5h', 'weekly_pct'],
        'capacity_varies': True,
        'reset': '5h rolling'
    }
}
```

## 📈 Quality Framework

### Spec-First Gates

```python
class QualityGates:
    """Mandatory quality checks before implementation"""
    
    @staticmethod
    def llm_signoff(spec: str, model: str = 'sonnet-4.5') -> dict:
        """Get LLM validation of spec completeness"""
        validation = {
            'spec_complete': bool,  # All scenarios defined
            'edge_cases_identified': List[str],
            'ambiguities': List[str],
            'implementation_ready': bool
        }
        return validation
    
    @staticmethod
    def robustness_check(implementation: str, spec: str) -> dict:
        """Verify implementation handles all cases"""
        return {
            'happy_path': bool,
            'edge_cases_handled': List[str],
            'error_scenarios': List[str],
            'coverage_pct': float
        }
    
    @staticmethod
    def track_disagreements(responses: Dict[str, Any]) -> None:
        """Record when models disagree on approach"""
        # Log to disagreements.jsonl for analysis
        pass
```

### Rework Tracking

```python
@dataclass
class FeatureCompletion:
    feature_id: str
    spec_lines: int
    
    # Quality metrics
    llm_signoff_pass: bool
    implementation_cycles: int  # How many attempts
    test_failures: List[str]
    human_fixes_required: int
    
    # Normalized quality score
    @property
    def quality_score(self) -> float:
        """0-1 score, higher is better"""
        penalties = (
            (self.implementation_cycles - 1) * 0.1 +
            len(self.test_failures) * 0.05 +
            self.human_fixes_required * 0.2
        )
        return max(0, 1.0 - penalties)
```

---

*Note: Provider limits and pricing subject to change. Verify at [support.claude.com](https://support.claude.com), [platform.openai.com](https://platform.openai.com), [docs.z.ai](https://docs.z.ai) before each measurement cycle.*