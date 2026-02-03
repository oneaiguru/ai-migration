import { useEffect, useState } from 'react';
import { apiConfig } from '@/api/client';

export interface SiteAccuracyData {
  siteId: string;
  wape: number | null;
  actualM3: number;
  forecastM3: number;
  days: number;
}

export interface SiteAccuracyHookResult {
  data: SiteAccuracyData | null;
  loading: boolean;
  error: string | null;
}

interface ApiSiteAccuracyResponse {
  site_id: string;
  wape: number | null;
  actual_m3: number;
  forecast_m3: number;
  days: number;
}

export function useSiteAccuracy(
  siteId: string | null,
  startDate: string,
  endDate: string
): SiteAccuracyHookResult {
  const [data, setData] = useState<SiteAccuracyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteId || !startDate || !endDate) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      site_id: siteId,
      start_date: startDate,
      end_date: endDate,
    });
    fetch(`${apiConfig.baseUrl}/api/mytko/site_accuracy?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json() as Promise<ApiSiteAccuracyResponse>;
      })
      .then((payload) => {
        setData({
          siteId: payload.site_id,
          wape: payload.wape,
          actualM3: payload.actual_m3,
          forecastM3: payload.forecast_m3,
          days: payload.days,
        });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : String(err));
        setData(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [siteId, startDate, endDate]);

  return { data, loading, error };
}
