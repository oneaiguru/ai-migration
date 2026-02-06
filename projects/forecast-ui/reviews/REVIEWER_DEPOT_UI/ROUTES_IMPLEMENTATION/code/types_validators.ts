import { z } from 'zod';

export const metricsSchema = z.object({
  region_wape: z.object({ p50: z.number(), p75: z.number(), p90: z.number() }),
  district_wape: z.object({ p50: z.number(), p75: z.number(), p90: z.number() }),
  demo_default_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const districtSchema = z.object({
  district: z.string(),
  wape: z.number().optional(),
  smape: z.number().optional(),
});

export const siteSchema = z.object({
  site_id: z.string(),
  date: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  fill_pct: z.number(),
  overflow_prob: z.number(),
  pred_mass_kg: z.number().optional(),
  last_service: z.string().optional(),
});

export const routeSchema = z.object({
  site_id: z.string(),
  address: z.string().optional(),
  fill_pct: z.number(),
  overflow_prob: z.number(),
  policy: z.string().optional(),
  visit: z.union([z.boolean(), z.literal('visit'), z.literal('skip')]).optional(),
  pred_mass_kg: z.number().optional(),
  volume: z.string().optional(),
  schedule: z.string().optional(),
  last_service_dt: z.string().optional(),
});

export type Metrics = z.infer<typeof metricsSchema>;
export type District = z.infer<typeof districtSchema>;
export type Site = z.infer<typeof siteSchema>;
export type RouteRec = z.infer<typeof routeSchema>;

export function parseMetrics(input: unknown): Metrics | null {
  const r = metricsSchema.safeParse(input);
  return r.success ? r.data : null;
}

export function parseDistricts(input: unknown): District[] | null {
  const arr = z.array(districtSchema).safeParse(input);
  return arr.success ? arr.data : null;
}

export function parseSites(input: unknown): Site[] | null {
  const arr = z.array(siteSchema).safeParse(input);
  return arr.success ? arr.data : null;
}

export function parseRoutes(input: unknown): RouteRec[] | null {
  const arr = z.array(routeSchema).safeParse(input);
  return arr.success ? arr.data : null;
}

