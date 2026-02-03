import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import type { ApiSiteForecastPoint } from '../types/api';
import { qk } from '../api/queryClient';

export function useSiteForecast(siteId: string, window?: string, days: number = 7) {
  const hasWindow = typeof window === 'string' && window.trim().length > 0;
  const params = hasWindow ? { window } : { days };
  const queryKey = ['siteForecast', siteId, hasWindow ? window : `days:${days}`] as const;
  const q = useQuery<ApiSiteForecastPoint[]>({
    queryKey: (qk as any)?.siteForecast ? (qk as any).siteForecast(siteId, hasWindow ? window! : `days:${days}`) : (queryKey as any),
    queryFn: async () => {
      const rows = await apiGet<ApiSiteForecastPoint[]>(`/api/sites/${encodeURIComponent(siteId)}/forecast`, params);
      return Array.isArray(rows) ? rows : [];
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: (count) => (count < 1 ? true : false),
  });
  return {
    rows: (q.data ?? []) as ApiSiteForecastPoint[],
    loading: q.isLoading,
    error: q.error ? (q.error as any)?.message ?? 'Ошибка загрузки' : null,
  } as const;
}

