export interface ApiMetricsResponse {
  region_wape: { p50: number; p75: number; p90: number };
  district_wape: { p50: number; p75: number; p90: number };
}

export interface ApiDistrict {
  district: string;
  wape?: number;
  smape?: number;
}

export interface ApiAccuracyDistributionBin {
  bucket?: string | null;
  site_count?: number | null;
  percent?: number | null;
}

export interface ApiRegionAccuracy {
  quarter: string;
  available_quarters: string[];
  overall_wape: number;
  median_site_wape: number;
  site_count: number;
  distribution: ApiAccuracyDistributionBin[];
}

export interface ApiDistrictAccuracyRow {
  district?: string | null;
  accuracy_pct?: number | null;
  median_wape?: number | null;
  weighted_wape?: number | null;
  site_count?: number | null;
}

export interface ApiDistrictAccuracyEnvelope {
  quarter: string;
  available_quarters: string[];
  total_districts: number;
  limit: number;
  offset: number;
  rows: ApiDistrictAccuracyRow[];
}

export interface ApiSiteAccuracyRow {
  site_id?: string | null;
  year_month?: string | null;
  actual?: number | null;
  forecast?: number | null;
  wape?: number | null;
  accuracy_pct?: number | null;
  abs_error?: number | null;
}

export interface ApiSiteAccuracyEnvelope {
  quarter: string;
  available_quarters: string[];
  total_sites: number;
  limit: number;
  offset: number;
  items: ApiSiteAccuracyRow[];
}

export interface ApiSite {
  site_id: string;
  date?: string;
  district?: string;
  address?: string;
  fill_pct: number;
  overflow_prob: number;
  pred_mass_kg?: number;
  last_service?: string;
}

export interface ApiRouteRec {
  site_id: string;
  address?: string;
  fill_pct: number;
  overflow_prob: number;
  policy?: string;
  visit?: boolean | 'visit' | 'skip';
  pred_mass_kg?: number;
  // Optional fields for parity with product tables
  volume?: string;          // e.g., "4 | 0.75"
  schedule?: string;        // e.g., "Ежедневно", "Пн, Чт"
  last_service_dt?: string; // e.g., "2025-01-03"
}

// Optional richer shape for route table view (future-friendly)
export interface SiteWithForecast {
  site_id: string;
  address?: string;
  volume?: string;
  schedule?: string;
  fill_pct: number;
  overflow_prob: number;
  last_service?: string;
  pred_mass_kg?: number;
}

// PR-18 — Site forecast point shape (read-only endpoint)
export interface ApiSiteForecastPoint {
  date: string;
  pred_mass_kg?: number;
  fill_pct?: number;
  overflow_prob?: number;
  last_service_dt?: string | null;
}
