import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import type { ApiMetricsResponse } from '../types/api';
import { parseMetrics } from '../types/validators';
import { qk } from '../api/queryClient';

export function useMetrics() {
  const q = useQuery({
    queryKey: qk.metrics,
    queryFn: async () => {
      const m = await apiGet<ApiMetricsResponse>('/api/metrics');
      return parseMetrics(m) ?? (m as any);
    },
    staleTime: 60_000,
  });
  return { data: (q.data as ApiMetricsResponse | null) ?? null, loading: q.isLoading, error: q.error ? (q.error as any)?.message ?? 'Ошибка загрузки' : null } as const;
}

