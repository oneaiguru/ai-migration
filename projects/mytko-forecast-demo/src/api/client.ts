const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') || 'http://127.0.0.1:8000';

export type ForecastRequest = {
  siteId: string;
  startDate: string;
  endDate: string;
  vehicleVolume: number;
  // New fields for rolling cutoff
  cutoffDate?: string;    // YYYY-MM-DD, optional
  horizonDays?: number;   // 1-365, optional
};

export type RollingForecastRequest = {
  cutoffDate: string;     // YYYY-MM-DD, required
  horizonDays: number;    // 1-365, required
  siteId?: string;        // Optional, omit for all-sites
  district?: string;      // Optional district filter
  search?: string;        // Optional site search
  limit?: number;         // Optional pagination limit
  offset?: number;        // Optional pagination offset
};

export type RollingForecastSummary = {
  cutoff_date: string;
  horizon_days: number;
  site_count: number;
  total_forecast_m3: number;
  generated_at: string;
  download_url: string;
};

export type RollingForecastRow = {
  site_id: string;
  date: string;
  fill_pct: number;
  pred_mass_kg: number;
  overflow_prob: number;
  actual_m3?: number | null;
  error_pct?: number | null;
};

export type RollingForecastAllResponse = RollingForecastSummary & {
  total_rows: number;
  limit: number;
  offset: number;
  rows: RollingForecastRow[];
  accuracy_wape?: number | null;
  total_actual_m3?: number | null;
  accuracy_coverage_pct?: number | null;
};

export async function fetchForecast({ siteId, startDate, endDate, vehicleVolume }: ForecastRequest) {
  const params = new URLSearchParams({
    site_id: siteId,
    start_date: startDate,
    end_date: endDate,
    vehicle_volume: String(vehicleVolume),
  });
  const response = await fetch(`${API_BASE}/api/mytko/forecast?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `API ${response.status}`);
  }
  return (await response.json()) as import('../types/mytko').ForecastDataFormat;
}

export async function fetchRollingForecast(req: RollingForecastRequest) {
  const params = new URLSearchParams({
    cutoff_date: req.cutoffDate,
    horizon_days: String(req.horizonDays),
  });
  if (req.siteId) {
    params.set('site_id', req.siteId);
  }
  if (req.district) {
    params.set('district', req.district);
  }
  if (req.search) {
    params.set('search', req.search);
  }
  const response = await fetch(`${API_BASE}/api/mytko/rolling_forecast?${params}`);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `API ${response.status}`);
  }
  return response.json();
}

export async function fetchRollingForecastAll(
  req: RollingForecastRequest
): Promise<RollingForecastAllResponse> {
  const params = new URLSearchParams({
    cutoff_date: req.cutoffDate,
    horizon_days: String(req.horizonDays),
    limit: String(req.limit ?? 50),
    offset: String(req.offset ?? 0),
  });
  if (req.district) {
    params.set('district', req.district);
  }
  if (req.search) {
    params.set('search', req.search);
  }
  const response = await fetch(`${API_BASE}/api/mytko/rolling_forecast?${params}`);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `API ${response.status}`);
  }
  return response.json();
}

export async function fetchDistricts(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/api/mytko/districts`);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `API ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data?.districts) ? data.districts : [];
}

export const apiConfig = {
  baseUrl: API_BASE,
};
