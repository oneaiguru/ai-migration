# PRD v1.5 - Multi-Provider AI Subscription Optimizer
## Corrected & Enhanced Design

---

## 📊 Corrected Provider Landscape

### Actual Providers & Tiers (October 2024)

| Provider | Tier | Price | Actual Limits | Models |
|----------|------|-------|--------------|---------|
| Anthropic | Claude Pro | $20/mo | ~100-200 msgs/day | Claude Sonnet 4.5, Claude 3 Opus* |
| Anthropic | Claude Team | $25/user/mo (5 min) | Higher limits | Same models |
| OpenAI | ChatGPT Plus | $20/mo | 50 msgs/3h GPT-5 | GPT-5, GPT-5-turbo |
| OpenAI | ChatGPT Team | $25/user/mo | 100 msgs/3h | Same |
| Cursor | Cursor Pro | $20/mo | 500 fast requests/mo | GPT-5, Claude Sonnet |
| Perplexity | Pro | $20/mo | 600 queries/day | Multiple models |

*Opus usage counts more against limits

### API Pricing (for comparison)
- Claude Sonnet 4.5: $3/$15 per 1M tokens (input/output)
- GPT-5-turbo: $10/$30 per 1M tokens
- GPT-4o: $2.50/$10 per 1M tokens

---

## 🎯 Refined Problem Statement

**Core Challenge:** Optimize feature development cost across multiple AI coding assistants with subscription caps.

**Key Metrics:**
1. **Effective Cost per Feature (ECF)**: Total monthly cost / features shipped
2. **Success Rate (SR)**: Features passing tests without rework
3. **Capacity Utilization (CU)**: % of subscription limit used effectively

**Objective Function:**
```
Minimize: ECF = Σ(subscription_costs) / Σ(successful_features)
Subject to:
- Individual provider capacity constraints
- Minimum quality threshold (SR > 0.8)
- Maximum rework cycles (< 2 per feature)
```

---

## 📐 Corrected Multi-Agent Architecture

### Pipeline Design v1.5

```python
# Stage 1: Context Scout (cheap, fast)
scout_models = {
    'primary': 'gpt-4o-mini',  # Via API, very cheap
    'fallback': 'claude-3-haiku'  # Via API
}
# Input: Feature spec (1k tokens)
# Output: Relevant files + sections (2k tokens)
# Cost: ~$0.01

# Stage 2: Solution Architect (strong, expensive)
architect_models = {
    'primary': 'claude-3.5-sonnet',  # Via subscription
    'fallback': 'gpt-4'  # Via subscription
}
# Input: Spec + targeted context (10k tokens)
# Output: Implementation plan (5k tokens)
# Cost: 1 subscription message

# Stage 3: Code Builder (specialized)
builder_models = {
    'primary': 'cursor-fast',  # Cursor subscription
    'fallback': 'claude-3.5-sonnet'  # Claude subscription
}
# Input: Plan + files (8k tokens)
# Output: Code changes (12k tokens)
# Cost: 1-2 subscription messages

# Stage 4: Quality Reviewer (detail-oriented)
reviewer_models = {
    'primary': 'gpt-4',  # ChatGPT subscription
    'fallback': 'claude-3.5-sonnet'
}
# Input: Changes + tests (15k tokens)
# Output: Approval or fixes (3k tokens)
# Cost: 1 subscription message
```

---

## 📊 Measurement Protocol v1.5

### Accurate Capacity Tracking

**Claude Pro Actual Limits:**
```python
# Not percentage based - message count based
claude_limits = {
    'daily_messages': 100-200,  # Varies by length
    'model_weights': {
        'sonnet-3.5': 1.0,
        'opus-3': 2.0  # Uses 2x capacity
    }
}
```

**ChatGPT Plus Actual Limits:**
```python
chatgpt_limits = {
    'gpt4_per_3h': 50,
    'gpt4o_per_3h': 'unlimited',
    'dalle_per_day': 50
}
```

### Proper Window Alignment

```python
measurement_windows = {
    'chatgpt': '3 hours (rolling)',
    'claude': 'daily reset (midnight PT)', 
    'cursor': 'monthly (calendar)',
    'alignment': 'Use 3-hour windows for all'
}
```

### Statistical Rigor

**Sample Size Calculation:**
```python
# For 95% confidence, ±15% margin
import math

def required_samples(expected_variance, margin_of_error=0.15, confidence=0.95):
    z_score = 1.96  # 95% confidence
    cv = math.sqrt(expected_variance)  
    n = (z_score * cv / margin_of_error) ** 2
    return math.ceil(n)

# If CV=0.3, need ~16 samples per provider
```

---

## 🔧 Implementation Roadmap v1.5

### Phase 0: Environment Setup (Day 1)
- Install correct CLIs (cursor, claude-desktop, openai)
- Verify authentication
- Create measurement infrastructure

### Phase 1: Baseline Week (Days 2-8)
```python
baseline_protocol = {
    'providers': ['claude_pro', 'chatgpt_plus', 'cursor_pro'],
    'windows': 16,  # Statistically significant
    'schedule': 'Every 3 hours, rotate providers',
    'features': 'Standardized 50-line specs',
    'measurement': {
        'before': 'Message count/quota check',
        'during': 'Feature completion tracking',
        'after': 'Remaining capacity check'
    }
}
```

### Phase 2: Optimization (Days 9-15)
- Test pipeline variations
- Measure cross-provider handoffs
- Find optimal model assignments

### Phase 3: Production (Day 16+)
- Automated routing based on:
  - Current capacity
  - Feature complexity
  - Historical success rates
- Monthly subscription adjustments

---

## 📈 Quality Metrics v1.5

```python
quality_tracking = {
    'success_rate': 'Features passing all tests first try',
    'rework_rate': 'Features requiring fixes',
    'bug_density': 'Bugs found in code review',
    'time_to_complete': 'Wall clock time per feature',
    'human_intervention': 'Manual fixes required'
}

# Track as time series for trend analysis
# Use EWMA for smoothing: 
# metric_smooth[t] = α * metric[t] + (1-α) * metric_smooth[t-1]
```

---

## 💰 Realistic Cost Model

```python
def true_cost_per_feature(provider, subscription_cost, features_completed, time_spent):
    """Include all costs, not just subscription"""
    
    direct_cost = subscription_cost / features_completed
    
    # Opportunity cost of time
    hourly_rate = 100  # Your time value
    time_cost = (time_spent * hourly_rate) / features_completed
    
    # Rework cost
    rework_multiplier = 1 + provider.rework_rate
    
    # Context switching overhead (15% penalty)
    switching_penalty = 1.15 if multiple_providers else 1.0
    
    total_cost = (direct_cost + time_cost) * rework_multiplier * switching_penalty
    
    return total_cost
```

---

## 🚀 Next Steps

1. **Fix model names in code**
2. **Implement proper capacity tracking**
3. **Build statistical comparison framework**
4. **Create feature standardization library**
5. **Set up monitoring dashboard**

---

## 📝 Notes

- Remove unrelated ARGUS/OKTELL files from project
- Focus on subscription optimization only
- Consider starting with 2 providers (simpler)
- Add proper error handling for provider outages
- Track everything in version control