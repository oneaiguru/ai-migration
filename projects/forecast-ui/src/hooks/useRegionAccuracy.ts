import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { qk } from '../api/queryClient';
import type { ApiRegionAccuracy } from '../types/api';
import { parseRegionAccuracy } from '../types/validators';
import { useAccuracyQuarter } from './useAccuracyQuarter';

export function useRegionAccuracy() {
  const { quarter, setAvailableQuarters } = useAccuracyQuarter();
  const query = useQuery({
    queryKey: qk.regionAccuracy(quarter),
    queryFn: async () => {
      const payload = await apiGet<ApiRegionAccuracy>('/api/accuracy/region', { quarter });
      return parseRegionAccuracy(payload) ?? payload;
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
