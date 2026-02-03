import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';
import type { ApiRouteRec, ApiSite } from '../types/api';
import { parseRoutes, parseSites } from '../types/validators';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { qk } from '../api/queryClient';

export function useRoutesData(date: string) {
  const qStrict = useQuery({
    queryKey: qk.routes(date, 'strict'),
    queryFn: async () => {
      const r = await apiGet<ApiRouteRec[]>('/api/routes', { date, policy: 'strict' });
      return parseRoutes(r) ?? (Array.isArray(r) ? r : []);
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
  const qShow = useQuery({
    queryKey: qk.routes(date, 'showcase'),
    queryFn: async () => {
      const r = await apiGet<ApiRouteRec[]>('/api/routes', { date, policy: 'showcase' });
      return parseRoutes(r) ?? (Array.isArray(r) ? r : []);
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  // Fallback via sites when either empty
  const [fallbackStrict, setFallbackStrict] = useState<ApiRouteRec[] | null>(null);
  const [fallbackShow, setFallbackShow] = useState<ApiRouteRec[] | null>(null);
  useEffect(() => {
    (async () => {
      if ((qStrict.data?.length ?? 0) > 0 && (qShow.data?.length ?? 0) > 0) {
        setFallbackStrict(null);
        setFallbackShow(null);
        return;
      }
      try {
        const sitesRaw = await apiGet<ApiSite[]>('/api/sites', { date }).catch(() => [] as ApiSite[]);
        const sites = parseSites(sitesRaw) ?? (Array.isArray(sitesRaw) ? sitesRaw : []);
        if ((qStrict.data?.length ?? 0) === 0) {
          setFallbackStrict(
            sites
              .filter((s) => (s.overflow_prob ?? 0) >= 0.8 || (s.fill_pct ?? 0) >= 0.8)
              .map((s) => ({
                site_id: s.site_id,
                address: s.address,
                fill_pct: s.fill_pct,
                overflow_prob: s.overflow_prob ?? 0,
                pred_mass_kg: s.pred_mass_kg,
                visit: true,
                policy: 'fallback-strict',
              }))
          );
        } else {
          setFallbackStrict(null);
        }
        if ((qShow.data?.length ?? 0) === 0) {
          setFallbackShow(
            sites
              .filter((s) => (s.overflow_prob ?? 0) >= 0.5 || (s.fill_pct ?? 0) >= 0.6)
              .map((s) => ({
                site_id: s.site_id,
                address: s.address,
                fill_pct: s.fill_pct,
                overflow_prob: s.overflow_prob ?? 0,
                pred_mass_kg: s.pred_mass_kg,
                visit: (s.overflow_prob ?? 0) >= 0.8,
                policy: 'fallback-showcase',
              }))
          );
        } else {
          setFallbackShow(null);
        }
      } catch {
        setFallbackStrict(null);
        setFallbackShow(null);
      }
    })();
  }, [date, qStrict.data, qShow.data]);

  return {
    strict: (qStrict.data?.length ? qStrict.data : fallbackStrict) ?? [],
    showcase: (qShow.data?.length ? qShow.data : fallbackShow) ?? [],
    loading: qStrict.isLoading || qShow.isLoading,
    error: (qStrict.error as any)?.message || (qShow.error as any)?.message || null,
  } as const;
}
