from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, MutableMapping, Sequence, Tuple

CAPACITY_UNITS: dict[str, str] = {
    "codex": "pp",
    "claude": "pp",
    "glm": "prompts",
}

_CAPACITY_FIELDS: dict[str, Tuple[str, ...]] = {
    "codex": ("weekly_pct", "fiveh_pct"),
    "claude": ("all_models_pct", "session_pct"),
    "glm": ("prompts_used",),
}

_Z_ALPHA = 1.96
_TARGET_EFFECT = 0.10


@dataclass(frozen=True)
class EfficiencyReport:
    """Aggregate efficiency metrics for a provider across windows."""

    provider: str
    windows: List[str]
    total_features: float
    total_capacity: float
    efficiency: float | None
    ci_low: float | None
    ci_high: float | None
    capacity_unit: str
    sample_size: int
    power: float | None

    def has_confidence(self) -> bool:
        return self.ci_low is not None and self.ci_high is not None


def compute_efficiency(
    windows: Sequence[Dict[str, Any]],
    *,
    glm_counts: Sequence[Dict[str, Any]] | None = None,
) -> List[EfficiencyReport]:
    """Compute per-provider efficiency reports using ratio-of-totals.

    The calculation follows the PRD mandate: efficiency = features / capacity units.
    Capacity units are provider-specific (percentage points for Codex/Claude, prompts
    for GLM). Confidence intervals use a normal approximation of the ratio estimator
    (delta method) when at least two observations with non-zero capacity exist.
    """

    glm_by_window = _index_glm_counts(glm_counts or [])
    per_provider: MutableMapping[str, List[dict[str, Any]]] = {}

    for window in windows:
        window_id = window.get("window") or "unknown"
        features: dict[str, Any] = window.get("features", {})
        provider_data: dict[str, Any] = window.get("providers", {})

        for provider, info in provider_data.items():
            provider_features = float(features.get(provider, 0))
            capacity = _extract_capacity(provider, info, glm_by_window.get(window_id))
            per_provider.setdefault(provider, []).append(
                {
                    "window": window_id,
                    "features": provider_features,
                    "capacity": capacity,
                }
            )

        # GLM counts may exist even without provider snapshots.
        if "glm" in features or window_id in glm_by_window:
            provider_features = float(features.get("glm", 0))
            capacity = glm_by_window.get(window_id)
            per_provider.setdefault("glm", []).append(
                {
                    "window": window_id,
                    "features": provider_features,
                    "capacity": capacity,
                }
            )

    reports: List[EfficiencyReport] = []
    for provider, observations in sorted(per_provider.items()):
        reports.append(_summarize_provider(provider, observations))
    return reports


def _index_glm_counts(rows: Iterable[Dict[str, Any]]) -> dict[str, float]:
    aggregated: dict[str, float] = {}
    for row in rows:
        window_id = row.get("window")
        prompts = row.get("prompts_used")
        if not window_id or prompts is None:
            continue
        try:
            prompts_value = float(prompts)
        except (TypeError, ValueError):
            continue
        aggregated[window_id] = aggregated.get(window_id, 0.0) + prompts_value
    return aggregated


def _extract_capacity(
    provider: str,
    provider_info: dict[str, Any],
    glm_prompts: float | None,
) -> float | None:
    if provider == "glm" and glm_prompts is not None:
        return glm_prompts

    delta = provider_info.get("delta", {}) if isinstance(provider_info, dict) else {}
    for field in _CAPACITY_FIELDS.get(provider, ()):  # type: ignore[arg-type]
        value = delta.get(field)
        if value is None:
            continue
        try:
            return float(value)
        except (TypeError, ValueError):
            continue

    if provider == "glm":
        return glm_prompts
    return None


def _summarize_provider(provider: str, observations: List[dict[str, Any]]) -> EfficiencyReport:
    windows = [obs["window"] for obs in observations]
    total_features = sum(float(obs.get("features", 0.0)) for obs in observations)
    usable = _collect_usable(observations)
    total_capacity = sum(capacity for _, capacity in usable)

    efficiency = None
    ci_low = None
    ci_high = None
    power = None
    sample_size = len(usable)
    if total_capacity > 0:
        efficiency = total_features / total_capacity
        ci_low, ci_high, power, sample_size = _confidence_interval_and_power(
            efficiency,
            usable,
        )

    return EfficiencyReport(
        provider=provider,
        windows=windows,
        total_features=total_features,
        total_capacity=total_capacity,
        efficiency=efficiency,
        ci_low=ci_low,
        ci_high=ci_high,
        capacity_unit=CAPACITY_UNITS.get(provider, "units"),
        sample_size=sample_size,
        power=power,
    )


def _collect_usable(observations: Sequence[dict[str, Any]]) -> List[Tuple[float, float]]:
    usable: List[Tuple[float, float]] = []
    for obs in observations:
        try:
            capacity = float(obs.get("capacity", 0.0))
        except (TypeError, ValueError):
            continue
        if capacity <= 0:
            continue
        try:
            features = float(obs.get("features", 0.0))
        except (TypeError, ValueError):
            features = 0.0
        usable.append((features, capacity))
    return usable


def _confidence_interval_and_power(
    efficiency: float,
    usable: Sequence[Tuple[float, float]],
) -> tuple[float | None, float | None, float | None, int]:
    sample_size = len(usable)
    if sample_size < 2:
        return None, None, None, sample_size

    sum_capacity = sum(capacity for _, capacity in usable)
    if sum_capacity <= 0:
        return None, None, None, sample_size

    residuals = [features - efficiency * capacity for features, capacity in usable]
    variance = sum(residual ** 2 for residual in residuals) / (sample_size - 1)

    if sample_size < 3:
        return None, None, None, sample_size

    if variance <= 0:
        return efficiency, efficiency, 1.0, sample_size

    standard_error = math.sqrt(variance) / sum_capacity
    if standard_error <= 0:
        return efficiency, efficiency, 1.0, sample_size

    margin = _Z_ALPHA * standard_error
    lower = max(efficiency - margin, 0.0)
    upper = efficiency + margin
    power = _compute_power(_TARGET_EFFECT, standard_error)
    return lower, upper, power, sample_size


def _compute_power(effect_size: float, standard_error: float) -> float:
    if standard_error <= 0:
        return 1.0
    z_effect = effect_size / standard_error
    z_alpha = _Z_ALPHA
    term_upper = 1.0 - _normal_cdf(z_alpha - z_effect)
    term_lower = _normal_cdf(-z_alpha - z_effect)
    power = term_upper + term_lower
    return max(0.0, min(1.0, power))


def _normal_cdf(value: float) -> float:
    return 0.5 * (1.0 + math.erf(value / math.sqrt(2.0)))
