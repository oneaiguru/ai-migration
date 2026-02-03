from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
import re
from typing import Sequence


@dataclass(frozen=True)
class ServiceDayPattern:
    """Weekly service-day pattern for a site.

    - weekdays: tuple of weekdays (0=Mon .. 6=Sun) where service is expected.
    - weekday_weights: length-7 weights used to allocate weekly volume across service days.
    """

    weekdays: tuple[int, ...]
    weekday_weights: tuple[float, ...]

    def __post_init__(self) -> None:
        if len(self.weekday_weights) != 7:
            raise ValueError("weekday_weights must have length 7")
        for wd in self.weekdays:
            if wd < 0 or wd > 6:
                raise ValueError("weekday must be in 0..6")


def iter_dates(start: date, days: int) -> list[date]:
    if days <= 0:
        return []
    return [start + timedelta(days=i) for i in range(days)]


def week_groups(dates: Sequence[date]) -> list[list[int]]:
    """Return indices grouped by ISO week (Mon-Sun)."""

    groups: list[list[int]] = []
    current_key: tuple[int, int] | None = None
    current: list[int] = []
    for idx, dt in enumerate(dates):
        iso = dt.isocalendar()
        key = (iso.year, iso.week)
        if current_key is None:
            current_key = key
        if key != current_key:
            groups.append(current)
            current = []
            current_key = key
        current.append(idx)
    if current:
        groups.append(current)
    return groups


def week_groups_split_by_month(dates: Sequence[date]) -> list[list[int]]:
    """Return indices grouped by ISO week but split at month boundaries.

    This prevents reallocating volume across calendar months when an ISO week spans
    two months (e.g., last days of Oct + first days of Nov).
    """

    groups: list[list[int]] = []
    current_key: tuple[int, int, int, int] | None = None
    current: list[int] = []
    for idx, dt in enumerate(dates):
        iso = dt.isocalendar()
        key = (dt.year, dt.month, iso.year, iso.week)
        if current_key is None:
            current_key = key
        if key != current_key:
            groups.append(current)
            current = []
            current_key = key
        current.append(idx)
    if current:
        groups.append(current)
    return groups


def _round_preserve_sum(values: list[float], total: float, decimals: int) -> list[float]:
    rounded = [round(v, decimals) for v in values]
    diff = round(total - sum(rounded), decimals)
    if abs(diff) <= 10 ** (-decimals):
        return rounded
    if rounded:
        idx = max(range(len(rounded)), key=lambda i: rounded[i])
        rounded[idx] = round(rounded[idx] + diff, decimals)
    return rounded


def spikeify_weekly_values(
    dates: Sequence[date],
    values: Sequence[float],
    pattern: ServiceDayPattern,
    groups: Sequence[Sequence[int]] | None = None,
    decimals: int = 6,
) -> list[float]:
    """Convert smooth daily values into sparse service-day spikes while preserving weekly totals.

    For each ISO week, the weekly sum is redistributed onto `pattern.weekdays` only, using
    `pattern.weekday_weights` as allocation weights.

    If a given week contains none of the service weekdays (can happen at edges), that week's
    original daily shape is kept.
    """

    if len(dates) != len(values):
        raise ValueError("dates and values must have same length")
    if not pattern.weekdays:
        return [float(v) for v in values]

    weights = pattern.weekday_weights
    service_wd = set(pattern.weekdays)
    out = [0.0] * len(values)
    week_idx_groups = list(groups) if groups is not None else week_groups(dates)

    for idxs in week_idx_groups:
        if not idxs:
            continue

        week_total = 0.0
        selected: list[int] = []
        selected_weights: list[float] = []

        for i in idxs:
            v = float(values[i])
            week_total += v
            if dates[i].weekday() in service_wd:
                selected.append(i)
                w = float(weights[dates[i].weekday()])
                selected_weights.append(w if w > 0 else 1.0)

        if not selected:
            for i in idxs:
                out[i] = float(values[i])
            continue

        wsum = sum(selected_weights)
        if wsum <= 0:
            selected_weights = [1.0] * len(selected)
            wsum = float(len(selected))

        alloc = [week_total * (w / wsum) for w in selected_weights]
        alloc = _round_preserve_sum(alloc, total=week_total, decimals=decimals)
        for i, v in zip(selected, alloc):
            out[i] = float(v)

    return out


def pick_top_k_weekdays(counts: Sequence[int], k: int) -> tuple[int, ...]:
    """Pick up to k weekdays with the highest counts (returns sorted weekdays)."""

    if k <= 0:
        return tuple()
    pairs = [(wd, int(counts[wd]) if wd < len(counts) else 0) for wd in range(7)]
    pairs.sort(key=lambda x: (x[1], -x[0]), reverse=True)
    selected = [wd for wd, cnt in pairs if cnt > 0][:k]
    return tuple(sorted(selected))


def mean_weights_from_sums_and_counts(
    sums: Sequence[float], counts: Sequence[int]
) -> tuple[float, ...]:
    """Compute mean volume-per-event weights per weekday (len=7)."""

    weights: list[float] = []
    for wd in range(7):
        c = int(counts[wd]) if wd < len(counts) else 0
        s = float(sums[wd]) if wd < len(sums) else 0.0
        weights.append((s / c) if c > 0 else 0.0)
    return tuple(weights)


_WEEKDAY_TOKEN_RE = re.compile(r"\b(пн|вт|ср|чт|пт|сб|вс)\b", re.IGNORECASE)
_WEEKDAY_MAP = {
    "пн": 0,
    "вт": 1,
    "ср": 2,
    "чт": 3,
    "пт": 4,
    "сб": 5,
    "вс": 6,
}


def parse_grafik_weekdays(text: str | None) -> tuple[int, ...]:
    """Parse 'График вывоза' strings into weekdays.

    Returns empty tuple when schedule is missing/unknown.

    Examples:
    - 'пн, ср, пт' -> (0,2,4)
    - 'Ежедневно' -> (0,1,2,3,4,5,6)
    - '-' -> ()
    """

    if not text:
        return tuple()
    norm = str(text).strip().lower()
    if not norm or norm in {"-", "—"}:
        return tuple()
    # Many rows are duplicated as '... / ...' - take the first part.
    if "/" in norm:
        norm = norm.split("/", 1)[0].strip()
    if "ежеднев" in norm:
        return tuple(range(7))

    # Expand hyphenated ranges like "пн-пт" or "пн–ср" into full weekday sets.
    range_days: set[int] = set()
    for m in re.finditer(r"(пн|вт|ср|чт|пт|сб|вс)\s*[-‑–—]\s*(пн|вт|ср|чт|пт|сб|вс)", norm):
        start = _WEEKDAY_MAP[m.group(1)]
        end = _WEEKDAY_MAP[m.group(2)]
        if end >= start:
            rng = range(start, end + 1)
        else:  # handle wrapped ranges like "сб-пн"
            rng = list(range(start, 7)) + list(range(0, end + 1))
        range_days.update(rng)

    tokens = _WEEKDAY_TOKEN_RE.findall(norm)
    if not tokens:
        return tuple(sorted(range_days))
    wds_set = {_WEEKDAY_MAP.get(t.lower(), -1) for t in tokens}
    wds_set |= range_days
    wds = sorted(wds_set)
    wds = [wd for wd in wds if 0 <= wd <= 6]
    return tuple(wds)
