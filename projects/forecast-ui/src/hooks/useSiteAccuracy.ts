import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { qk } from '../api/queryClient';
import type { ApiSiteAccuracyEnvelope } from '../types/api';
import { parseSiteAccuracy } from '../types/validators';
import { useAccuracyQuarter } from './useAccuracyQuarter';

type UseSiteAccuracyArgs = {
  limit?: number;
  search?: string;
};

export function useSiteAccuracy({ limit = 50, search }: UseSiteAccuracyArgs = {}) {
  const { quarter, setAvailableQuarters } = useAccuracyQuarter();
  const query = useQuery({
    queryKey: qk.siteAccuracy(quarter, limit, search ?? ''),
    queryFn: async () => {
      const payload = await apiGet<ApiSiteAccuracyEnvelope>('/api/accuracy/sites', { quarter, limit, search });
      return parseSiteAccuracy(payload) ?? payload;
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data?.available_quarters?.length) {
      setAvailableQuarters(query.data.available_quarters);
    }
  }, [query.data, setAvailableQuarters]);

  return query;
}
