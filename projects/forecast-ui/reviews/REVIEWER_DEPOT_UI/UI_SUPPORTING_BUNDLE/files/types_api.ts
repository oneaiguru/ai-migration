export interface ApiMetricsResponse {
  region_wape: { p50: number; p75: number; p90: number };
  district_wape: { p50: number; p75: number; p90: number };
}

export interface ApiDistrict {
  district: string;
  wape?: number;
  smape?: number;
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
