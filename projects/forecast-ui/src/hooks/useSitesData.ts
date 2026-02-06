import { apiGet } from '../api/client';
import type { ApiSite } from '../types/api';
import { parseSites } from '../types/validators';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { qk } from '../api/queryClient';

export function useSitesData(date: string, page: number = 1, size: number = 100) {
  const limit = Math.max(1, Math.min(1000, size));
  const offset = Math.max(0, (Math.max(1, page) - 1) * limit);
  const q = useQuery({
    queryKey: qk.sites(date, page, size),
    queryFn: async () => {
      const data = await apiGet<ApiSite[]>('/api/sites', { date, limit, offset });
      return parseSites(data) ?? (Array.isArray(data) ? data : []);
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
  return { rows: (q.data ?? []) as ApiSite[], loading: q.isLoading, error: q.error ? (q.error as any)?.message ?? 'Ошибка загрузки' : null } as const;
}
