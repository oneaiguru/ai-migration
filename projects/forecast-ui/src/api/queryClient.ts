import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (count) => (count < 1 ? true : false),
      staleTime: 30_000,
      gcTime: 300_000,
    },
  },
});

export const qk = {
  metrics: ['metrics'] as const,
  sites: (date: string, page: number, size: number) => ['sites', date, page, size] as const,
  routes: (date: string, policy: 'strict' | 'showcase') => ['routes', date, policy] as const,
  siteForecast: (siteId: string, windowOrDays: string) => ['siteForecast', siteId, windowOrDays] as const,
  regionAccuracy: (quarter: string) => ['accuracy', 'region', quarter] as const,
  districtAccuracy: (quarter: string, limit: number, offset: number) => ['accuracy', 'districts', quarter, limit, offset] as const,
  siteAccuracy: (quarter: string, limit: number, search: string) => ['accuracy', 'sites', quarter, limit, search] as const,
};
