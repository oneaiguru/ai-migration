# 🔧 Concrete Implementation Fixes

## Parser Specifications (Missing from Original)

### Claude Desktop Output Parser

```python
import re
from dataclasses import dataclass
from typing import Optional, Dict

@dataclass
class ClaudeUsage:
    """Parse Claude desktop /usage output"""
    daily_remaining: Optional[int] = None
    daily_limit: Optional[int] = None
    model: str = "claude-3.5-sonnet"
    
    @classmethod
    def parse(cls, output: str) -> 'ClaudeUsage':
        """
        Expected format:
        Daily usage: 45 messages remaining out of 100
        Model: Claude Sonnet 4.5
        Resets: 12:00 AM PT
        """
        usage = cls()
        
        # Parse daily limits
        daily_match = re.search(r'(\d+)\s+messages\s+remaining\s+out\s+of\s+(\d+)', output)
        if daily_match:
            usage.daily_remaining = int(daily_match.group(1))
            usage.daily_limit = int(daily_match.group(2))
        
        # Parse model
        model_match = re.search(r'Model:\s*(.+)', output)
        if model_match:
            usage.model = model_match.group(1).strip()
            
        return usage
```

### Cursor Output Parser

```python
@dataclass 
class CursorUsage:
    """Parse Cursor subscription status"""
    fast_requests_used: int = 0
    fast_requests_limit: int = 500
    slow_requests_used: int = 0
    premium_models_remaining: int = 0
    
    @classmethod
    def parse(cls, output: str) -> 'CursorUsage':
        """
        Expected format (from Cursor settings):
        Fast requests: 123/500 used this month
        Slow requests: 45 used
        Premium models: 10 remaining today
        """
        usage = cls()
        
        fast_match = re.search(r'Fast requests:\s*(\d+)/(\d+)', output)
        if fast_match:
            usage.fast_requests_used = int(fast_match.group(1))
            usage.fast_requests_limit = int(fast_match.group(2))
            
        slow_match = re.search(r'Slow requests:\s*(\d+)', output)
        if slow_match:
            usage.slow_requests_used = int(slow_match.group(1))
            
        return usage
```

### ChatGPT Usage Tracker

```python
@dataclass
class ChatGPTUsage:
    """Track ChatGPT Plus usage (no CLI, must track manually)"""
    gpt4_used_3h: int = 0
    gpt4_limit_3h: int = 50
    window_start: datetime = None
    
    def can_use_gpt4(self) -> bool:
        """Check if GPT-5 is available"""
        if not self.window_start:
            return True
            
        elapsed = datetime.now() - self.window_start
        if elapsed > timedelta(hours=3):
            # Window expired, reset
            self.gpt4_used_3h = 0
            self.window_start = datetime.now()
            return True
            
        return self.gpt4_used_3h < self.gpt4_limit_3h
```

---

## Tracker System Architecture

```python
# tracker/core.py

import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List

class ProviderTracker:
    """Main tracking system"""
    
    def __init__(self, data_dir: Path = Path("./data")):
        self.data_dir = data_dir
        self.data_dir.mkdir(exist_ok=True)
        
        # JSONL files for append-only logs
        self.snapshots_file = data_dir / "snapshots.jsonl"
        self.windows_file = data_dir / "windows.jsonl"
        self.features_file = data_dir / "features.jsonl"
        
    def record_snapshot(self, 
                       provider: str,
                       window_id: str, 
                       phase: str,  # 'before' or 'after'
                       usage_data: Dict):
        """Record usage snapshot"""
        record = {
            'timestamp': datetime.utcnow().isoformat(),
            'provider': provider,
            'window_id': window_id,
            'phase': phase,
            'usage': usage_data
        }
        
        with open(self.snapshots_file, 'a') as f:
            f.write(json.dumps(record) + '\n')
            
    def complete_window(self, 
                       window_id: str,
                       provider_features: Dict[str, int]):
        """Mark window complete with feature counts"""
        
        # Calculate deltas from snapshots
        deltas = self._calculate_deltas(window_id)
        
        record = {
            'timestamp': datetime.utcnow().isoformat(),
            'window_id': window_id,
            'features': provider_features,
            'capacity_used': deltas,
            'efficiency': self._calculate_efficiency(provider_features, deltas)
        }
        
        with open(self.windows_file, 'a') as f:
            f.write(json.dumps(record) + '\n')
    
    def _calculate_deltas(self, window_id: str) -> Dict:
        """Calculate usage deltas for window"""
        # Read snapshots for this window
        before = {}
        after = {}
        
        with open(self.snapshots_file, 'r') as f:
            for line in f:
                record = json.loads(line)
                if record['window_id'] == window_id:
                    if record['phase'] == 'before':
                        before[record['provider']] = record['usage']
                    else:
                        after[record['provider']] = record['usage']
        
        # Calculate deltas
        deltas = {}
        for provider in before:
            if provider in after:
                deltas[provider] = self._compute_delta(
                    before[provider], 
                    after[provider],
                    provider
                )
        
        return deltas
    
    def _compute_delta(self, before: Dict, after: Dict, provider: str) -> float:
        """Provider-specific delta calculation"""
        
        if provider == 'claude':
            # Messages used
            before_remaining = before.get('daily_remaining', 0)
            after_remaining = after.get('daily_remaining', 0)
            return before_remaining - after_remaining
            
        elif provider == 'cursor':
            # Fast requests used
            before_used = before.get('fast_requests_used', 0)
            after_used = after.get('fast_requests_used', 0)
            return after_used - before_used
            
        elif provider == 'chatgpt':
            # GPT-5 messages used
            before_used = before.get('gpt4_used_3h', 0)
            after_used = after.get('gpt4_used_3h', 0)
            return after_used - before_used
            
        return 0
```

---

## CLI Implementation

```python
# tracker/cli.py

import click
import sys
from datetime import datetime
from .core import ProviderTracker
from .parsers import ClaudeUsage, CursorUsage, ChatGPTUsage

tracker = ProviderTracker()

@click.group()
def cli():
    """Multi-provider AI tracker"""
    pass

@cli.command()
@click.option('--provider', type=click.Choice(['claude', 'cursor', 'chatgpt']), required=True)
@click.option('--window', required=True, help='Window ID (e.g., W0-01)')
@click.option('--phase', type=click.Choice(['before', 'after']), required=True)
def ingest(provider, window, phase):
    """Ingest usage data from stdin"""
    
    # Read from stdin
    data = sys.stdin.read()
    
    # Parse based on provider
    if provider == 'claude':
        usage = ClaudeUsage.parse(data)
        usage_dict = {
            'daily_remaining': usage.daily_remaining,
            'daily_limit': usage.daily_limit,
            'model': usage.model
        }
    elif provider == 'cursor':
        usage = CursorUsage.parse(data)
        usage_dict = {
            'fast_requests_used': usage.fast_requests_used,
            'fast_requests_limit': usage.fast_requests_limit
        }
    elif provider == 'chatgpt':
        # Manual input needed
        click.echo("Enter GPT-5 messages used in last 3h:")
        used = int(input())
        usage_dict = {
            'gpt4_used_3h': used,
            'gpt4_limit_3h': 50,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    # Record snapshot
    tracker.record_snapshot(provider, window, phase, usage_dict)
    click.echo(f"Recorded {provider} {phase} snapshot for {window}")

@cli.command()
@click.option('--window', required=True)
@click.option('--claude-features', type=int, default=0)
@click.option('--cursor-features', type=int, default=0)
@click.option('--chatgpt-features', type=int, default=0)
def complete(window, claude_features, cursor_features, chatgpt_features):
    """Complete a measurement window"""
    
    features = {
        'claude': claude_features,
        'cursor': cursor_features,
        'chatgpt': chatgpt_features
    }
    
    tracker.complete_window(window, features)
    click.echo(f"Window {window} completed")
    
    # Show efficiency
    with open(tracker.windows_file, 'r') as f:
        for line in f:
            pass  # Get last line
        record = json.loads(line)
        
    click.echo("\nEfficiency Report:")
    for provider, eff in record['efficiency'].items():
        click.echo(f"{provider}: {eff:.2f} features/unit")

if __name__ == '__main__':
    cli()
```

---

## Testing Framework

```python
# tests/test_parsers.py

import pytest
from tracker.parsers import ClaudeUsage, CursorUsage

class TestClaudeParsing:
    
    def test_parse_claude_output(self):
        output = """
        Daily usage: 45 messages remaining out of 100
        Model: Claude Sonnet 4.5
        Resets: 12:00 AM PT
        """
        
        usage = ClaudeUsage.parse(output)
        assert usage.daily_remaining == 45
        assert usage.daily_limit == 100
        assert usage.model == "Claude Sonnet 4.5"
    
    def test_parse_claude_exhausted(self):
        output = """
        Daily usage: 0 messages remaining out of 100
        Model: Claude Sonnet 4.5
        You've reached your daily limit. Resets: 12:00 AM PT
        """
        
        usage = ClaudeUsage.parse(output)
        assert usage.daily_remaining == 0
        assert usage.daily_limit == 100

class TestCursorParsing:
    
    def test_parse_cursor_output(self):
        output = """
        Fast requests: 123/500 used this month
        Slow requests: 45 used
        Premium models: 10 remaining today
        """
        
        usage = CursorUsage.parse(output)
        assert usage.fast_requests_used == 123
        assert usage.fast_requests_limit == 500
        assert usage.slow_requests_used == 45
```