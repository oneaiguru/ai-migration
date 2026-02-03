from __future__ import annotations

import os
from pathlib import Path
from typing import List, Optional


class ApiContext:
    def __init__(
        self,
        sites_data_dir: Optional[Path] = None,
        deliveries_dir: Optional[Path] = None,
    ) -> None:
        self.sites_data_dir = sites_data_dir or Path(os.getenv("SITES_DATA_DIR", "reports/sites_demo"))
        self.deliveries_dir = deliveries_dir or Path(os.getenv("DELIVERIES_DIR", "deliveries"))

    def sites_files(self) -> List[Path]:
        files = sorted(self.sites_data_dir.glob("daily_fill_*.csv"))
        if files:
            return [*files]
        import glob as _glob
        return [
            Path(p)
            for p in sorted(_glob.glob(str(self.deliveries_dir / "**/forecasts/sites/daily_fill_*.csv"), recursive=True))
        ]

    def find_sites_csv_for_date(self, date_s: str) -> Optional[Path]:
        """Find a daily_fill_{start}_to_{end}.csv that covers the given date."""
        files = self.sites_files()
        for p in files:
            name = p.name
            try:
                if "daily_fill_" in name and "_to_" in name:
                    mid = name.split("daily_fill_")[-1].split(".csv")[0]
                    start_s, end_s = mid.split("_to_")
                    if start_s <= date_s <= end_s:
                        return p
            except Exception:
                continue
        return files[-1] if files else None
