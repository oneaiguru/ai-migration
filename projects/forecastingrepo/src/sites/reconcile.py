from __future__ import annotations

from typing import Tuple, List, Dict
import warnings
import pandas as pd
import numpy as np

EPS = 1e-9


def _capacity_liters_for(reg: pd.DataFrame, site_id: str, default_cap_l: float) -> float:
    if reg.empty:
        return default_cap_l
    try:
        row = reg.loc[reg["site_id"] == site_id].iloc[0]
        bc = float(row.get("bin_count", 1) or 1)
        bs = float(row.get("bin_size_liters", default_cap_l) or default_cap_l)
        return bc * bs
    except Exception:
        return default_cap_l


def reconcile_sites_to_district(
    site_df: pd.DataFrame,
    registry_df: pd.DataFrame,
    district_fc_df: pd.DataFrame,
    tolerance_pct: float = 0.5,
    method: str = "proportional",
    clip_min: float = 0.9,
    clip_max: float = 1.1,
    default_capacity_liters: float = 1100.0,
) -> Tuple[pd.DataFrame, pd.DataFrame, List[Dict]]:
    """
    Reconcile per-site predicted volume (m3) to district forecasts (m3) per (date,district).

    Inputs:
      - site_df: columns [site_id, date, pred_volume_m3, fill_pct, overflow_prob]
      - registry_df: columns [site_id, district, bin_count, bin_size_liters]
      - district_fc_df: columns [date, district, forecast_m3]

    Returns: (adjusted_sites_df, debug_df, warns)
      - adjusted_sites_df: same columns as site_df with pred_volume_m3 and fill_pct possibly scaled
      - debug_df: columns [date, district, sites_sum_before_m3, district_fc_m3, scale_applied, sites_sum_after_m3, delta_pct]
      - warns: list of dicts with entries exceeding tolerance
    """
    if site_df.empty or district_fc_df.empty:
        return site_df.copy(), pd.DataFrame(columns=[
            "date","district","sites_sum_before_m3","district_fc_m3","scale_applied","sites_sum_after_m3","delta_pct"
        ]), []

    warns: List[Dict] = []
    # Attach district to site predictions
    reg_cols = [c for c in ("site_id","district","bin_count","bin_size_liters") if c in registry_df.columns]
    if not reg_cols:
        reg_cols = ["site_id", "district", "bin_count", "bin_size_liters"]
    reg = registry_df.reindex(columns=reg_cols).copy()
    sites = site_df.merge(reg, on="site_id", how="left")
    unmapped = sites[sites["district"].isna()]
    if not unmapped.empty:
        sample_ids = ", ".join(sorted(set(unmapped["site_id"].astype(str)))[:5])
        warnings.warn(
            f"{len(unmapped)} site(s) missing district mapping; examples: {sample_ids}",
            RuntimeWarning,
        )
        warns.append({
            "reason": "site_missing_district",
            "count": len(unmapped),
            "examples": sample_ids,
        })
        sites["district"] = sites["district"].fillna("__unmapped__")

    # Normalize district forecast to m3 and ensure date is string
    dfc = district_fc_df.copy()
    dfc["district_fc_m3"] = dfc["forecast_m3"].astype(float)
    dfc["date"] = dfc["date"].astype(str)

    # Prepare sums per (date,district)
    sites["date"] = sites["date"].astype(str)
    sums = sites.groupby(["date","district"], dropna=False)["pred_volume_m3"].sum().reset_index(name="sites_sum_before_m3")
    joined = sums.merge(dfc[["date","district","district_fc_m3"]], on=["date","district"], how="left")

    debug_rows = []
    scale_map: Dict[Tuple[str,str], float] = {}

    for _, r in joined.iterrows():
        date_s = r["date"]
        dist = r["district"]
        s_before = float(r["sites_sum_before_m3"] or 0.0)
        fc = float(r.get("district_fc_m3") or 0.0)
        if s_before <= EPS and fc <= EPS:
            scale = 1.0
            s_after = 0.0
            delta_pct = 0.0
        elif s_before <= EPS and fc > EPS:
            # No site mass but district > 0 -> cannot scale; warn
            scale = np.nan
            s_after = s_before
            delta_pct = 1.0
            warns.append({"date": date_s, "district": dist, "reason": "site_sum_zero_district_positive"})
        else:
            raw_scale = fc / s_before
            scale = max(clip_min, min(clip_max, raw_scale)) if method == "proportional" else 1.0
            s_after = s_before * scale
            denom = fc if fc > EPS else (s_after if s_after > EPS else 1.0)
            delta_pct = abs(s_after - fc) / denom
            if delta_pct > (tolerance_pct / 100.0):
                warns.append({
                    "date": date_s,
                    "district": dist,
                    "reason": "delta_above_tolerance",
                    "delta_pct": delta_pct,
                })
        debug_rows.append({
            "date": date_s,
            "district": dist,
            "sites_sum_before_m3": s_before,
            "district_fc_m3": fc,
            "scale_applied": scale,
            "sites_sum_after_m3": s_after,
            "delta_pct": delta_pct,
        })
        scale_map[(date_s, dist)] = 1.0 if np.isnan(scale) else scale

    debug_df = pd.DataFrame(debug_rows)

    # Apply scales back to site rows
    def _row_scale(row) -> float:
        k = (str(row["date"]), row.get("district"))
        return scale_map.get(k, 1.0)

    sites["scale"] = sites.apply(_row_scale, axis=1)
    sites["pred_volume_m3"] = sites["pred_volume_m3"].astype(float) * sites["scale"].astype(float)
    # Recompute fill_pct based on capacity liters
    def _cap_l(row) -> float:
        return _capacity_liters_for(reg, row["site_id"], default_capacity_liters)

    cap_series = sites.apply(_cap_l, axis=1).astype(float)
    cap_m3 = cap_series / 1000.0
    sites["fill_pct"] = (sites["pred_volume_m3"].astype(float) / cap_m3).clip(lower=0.0, upper=1.0)
    sites = sites.drop(columns=["scale"])  # cleanup

    adjusted = sites[[c for c in site_df.columns if c in sites.columns]].copy()
    return adjusted, debug_df, warns
