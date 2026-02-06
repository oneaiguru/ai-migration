import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { qk } from '../api/queryClient';
import type { ApiDistrictAccuracyEnvelope } from '../types/api';
import { parseDistrictAccuracy } from '../types/validators';
import { useAccuracyQuarter } from './useAccuracyQuarter';

export function useDistrictAccuracy(limit = 50, offset = 0) {
  const { quarter, setAvailableQuarters } = useAccuracyQuarter();
  const query = useQuery({
    queryKey: qk.districtAccuracy(quarter, limit, offset),
    queryFn: async () => {
      const payload = await apiGet<ApiDistrictAccuracyEnvelope>('/api/accuracy/districts', { quarter, limit, offset });
      return parseDistrictAccuracy(payload) ?? payload;
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
