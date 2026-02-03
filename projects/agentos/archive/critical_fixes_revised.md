# 🔧 Critical Fixes - Revised for October 2025

## ✅ Accept These Ground Truths (Do NOT Correct)
- Claude Max exists: 5× and 20× tiers with 5-hour session resets
- Claude Sonnet 4.5 is current (includes memory tools)
- GPT-5-Codex is the CLI lineage model
- Z.AI GLM-4.6 Coding: 120/600/2400 prompts per 5h (Lite/Pro/Max)
- All providers use 5-hour windows with potential weekly overlays

## 🚨 Real Issues to Fix

### 1. Window Alignment 
**Issue:** Protocol assumes different reset cycles per provider
**Fix:** All providers now use 5-hour windows (standardized)
```python
window_config = {
    'standard_window': '5 hours',
    'weekly_overlay': 'provider-specific caps',
    'reset_behavior': 'rolling or fixed (verify per provider)'
}
```

### 2. Capacity Tracking Complexity
**Issue:** Must track both messages AND percentage bars
**Fix:** Dual tracking system
```python
capacity_metrics = {
    'absolute': 'messages or prompts used',
    'relative': 'Δ% of weekly/daily bar',
    'normalized': 'capacity_units for comparison'
}
```

### 3. Quality Gates Missing
**Issue:** No spec-first validation before implementation
**Fix:** Add mandatory LLM sign-off process
```python
quality_gates = {
    'pre_implementation': 'LLM validates spec completeness',
    'robustness_check': 'Edge case enumeration',
    'disagreement_tracking': 'Record when models disagree',
    'rework_cycles': 'Track iterations to completion'
}
```

### 4. Parser Assumptions
**Issue:** Parsers assume daily resets and fixed formats
**Fix:** Adapt to 5-hour windows and variable outputs
```python
# Before (WRONG):
'daily_remaining': 45  # Assumes daily reset

# After (CORRECT):
'session_remaining': 45  # 5-hour session
'weekly_used_pct': 23.5  # Weekly overlay
'window_start': timestamp  # Track window boundaries
```

### 5. Missing Provider Volatility Handling
**Issue:** Limits change without notice
**Fix:** Add runtime verification
```python
provider_profile = {
    'last_verified': 'timestamp',
    'source_url': 'official docs link',
    'limits_snapshot': {...},
    'banner': 'Limits may change - verify at runtime'
}
```

### 6. Insufficient Statistical Power
**Issue:** 6 windows too few given 5-hour cycles
**Fix:** Need 20+ windows for confidence
```python
# 5-hour windows = 4.8 per day theoretical max
# Realistic: 2-3 windows/day = need 7-10 days minimum
sample_size = max(20, ceil(1.96**2 * variance / margin**2))
```

## ✅ What to Keep from Original

- Core economic insight (subscriptions > API at scale)
- Multi-agent pipeline architecture  
- JSONL append-only logging
- CLI structure with ingestion/completion commands
- Portfolio optimization framing

## 📋 Implementation Priority

1. **Immediate:** Update all window timing to 5-hour cycles
2. **Day 1:** Add quality gates to pipeline
3. **Day 2:** Implement dual capacity tracking (messages + %)
4. **Ongoing:** Monthly provider limit verification
