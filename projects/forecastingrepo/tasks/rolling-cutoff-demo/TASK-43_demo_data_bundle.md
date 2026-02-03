# TASK-43: Demo Data Bundle

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 20min

## Goal
Create curated 12-site dataset for demo with diverse characteristics.

## Code Changes

### 1. File: scripts/create_demo_bundle.py (NEW)

```python
#!/usr/bin/env python3
"""
Create demo data bundle with 12 representative sites.

Usage:
    python create_demo_bundle.py
"""
import sys
from pathlib import Path
from datetime import date

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.sites.data_loader import load_service_data, load_registry
import pandas as pd


def create_demo_bundle(output_dir: Path = Path('demo_data')) -> Path:
    """
    Select 12 diverse sites and create a standalone bundle.

    Criteria:
    - Mix of high/medium/low volume sites
    - Different districts
    - Good accuracy history
    """
    print("Creating demo data bundle...")

    output_dir.mkdir(parents=True, exist_ok=True)

    # Load full registry and service data
    registry = load_registry()
    service = load_service_data(
        start_date=date(2025, 1, 1),
        end_date=date(2025, 5, 31),
    )

    # Select sites: rank by total volume and pick evenly
    site_volumes = service.groupby('site_id')['collect_volume_m3'].sum().sort_values(ascending=False)

    # Take top sites at different percentiles
    demo_sites = [
        site_volumes.index[0],           # Highest volume
        site_volumes.index[int(len(site_volumes) * 0.1)],    # Top 10%
        site_volumes.index[int(len(site_volumes) * 0.25)],   # Top 25%
        site_volumes.index[int(len(site_volumes) * 0.5)],    # Median
        site_volumes.index[int(len(site_volumes) * 0.75)],   # Bottom 25%
        site_volumes.index[-1],          # Lowest volume
    ]

    # Add more sites for coverage
    remaining = [s for s in site_volumes.index if s not in demo_sites]
    demo_sites.extend(remaining[:6])

    demo_sites = list(set(demo_sites))[:12]
    print(f"Selected sites: {demo_sites}")

    # Filter data
    demo_service = service[service['site_id'].isin(demo_sites)].copy()
    demo_registry = registry[registry['site_id'].isin(demo_sites)].copy()

    # Save CSVs
    demo_service.to_csv(output_dir / 'sites_service_demo.csv', index=False)
    demo_registry.to_csv(output_dir / 'sites_registry_demo.csv', index=False)

    # Create README
    readme = f"""# Demo Data Bundle

Generated from production data for demo purposes.

## Contents
- sites_service_demo.csv: {len(demo_service)} rows from {len(demo_sites)} sites
- sites_registry_demo.csv: {len(demo_registry)} rows

## Data Period
Jan 1 - May 31, 2025

## Usage

To use for demo, modify `src/sites/data_loader.py`:
```python
DEFAULT_SERVICE_PATH = Path('demo_data/sites_service_demo.csv')
DEFAULT_REGISTRY_PATH = Path('demo_data/sites_registry_demo.csv')
```

Then restart the API server:
```bash
python -m uvicorn scripts.api_app:app --reload
```

## Sites Included
{', '.join(demo_sites)}
"""
    (output_dir / 'README.md').write_text(readme)
    print(f"✓ Demo bundle created in {output_dir}")
    return output_dir


if __name__ == '__main__':
    create_demo_bundle()
```

## Tests

```python
# tests/test_demo_bundle.py

from pathlib import Path
import tempfile

def test_create_demo_bundle():
    from scripts.create_demo_bundle import create_demo_bundle

    with tempfile.TemporaryDirectory() as tmpdir:
        bundle_dir = create_demo_bundle(Path(tmpdir))

        assert (bundle_dir / 'sites_service_demo.csv').exists()
        assert (bundle_dir / 'sites_registry_demo.csv').exists()
        assert (bundle_dir / 'README.md').exists()
```

## Acceptance Criteria
- [ ] Script runs without errors
- [ ] 12 sites selected with diversity
- [ ] CSVs have correct structure
- [ ] README.md included with usage instructions
- [ ] Data can be used as alternate source

## Gitignore Note

Add to `.gitignore`:
```
demo_data/
```

---

## On Completion

1. Run: `python scripts/create_demo_bundle.py`
2. Verify demo_data/ contains all files
3. Run tests: `pytest tests/test_demo_bundle.py -v`
4. Update `/Users/m/ai/progress.md`: Change TASK-43 from 🔴 TODO to 🟢 DONE
5. Commit: "Implement TASK-43: Demo data bundle"
