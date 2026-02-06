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

const accuracyDistributionSchema = z.object({
  bucket: z.string().optional().nullable(),
  site_count: z.number().optional().nullable(),
  percent: z.number().optional().nullable(),
});

const regionAccuracySchema = z.object({
  quarter: z.string(),
  available_quarters: z.array(z.string()).default([]),
  overall_wape: z.number(),
  median_site_wape: z.number(),
  site_count: z.number(),
  distribution: z.array(accuracyDistributionSchema),
});

const districtAccuracyRowSchema = z.object({
  district: z.string().optional().nullable(),
  accuracy_pct: z.number().optional().nullable(),
  median_wape: z.number().optional().nullable(),
  weighted_wape: z.number().optional().nullable(),
  site_count: z.number().optional().nullable(),
});

const districtAccuracySchema = z.object({
  quarter: z.string(),
  available_quarters: z.array(z.string()).default([]),
  total_districts: z.number(),
  limit: z.number(),
  offset: z.number(),
  rows: z.array(districtAccuracyRowSchema),
});

const siteAccuracyRowSchema = z.object({
  site_id: z.string().optional().nullable(),
  year_month: z.string().optional().nullable(),
  actual: z.number().optional().nullable(),
  forecast: z.number().optional().nullable(),
  wape: z.number().optional().nullable(),
  accuracy_pct: z.number().optional().nullable(),
  abs_error: z.number().optional().nullable(),
});

const siteAccuracySchema = z.object({
  quarter: z.string(),
  available_quarters: z.array(z.string()).default([]),
  total_sites: z.number(),
  limit: z.number(),
  offset: z.number(),
  items: z.array(siteAccuracyRowSchema),
});

export type RegionAccuracy = z.infer<typeof regionAccuracySchema>;
export type DistrictAccuracy = z.infer<typeof districtAccuracySchema>;
export type SiteAccuracy = z.infer<typeof siteAccuracySchema>;

export function parseRegionAccuracy(input: unknown): RegionAccuracy | null {
  const r = regionAccuracySchema.safeParse(input);
  return r.success ? r.data : null;
}

export function parseDistrictAccuracy(input: unknown): DistrictAccuracy | null {
  const r = districtAccuracySchema.safeParse(input);
  return r.success ? r.data : null;
}

export function parseSiteAccuracy(input: unknown): SiteAccuracy | null {
  const r = siteAccuracySchema.safeParse(input);
  return r.success ? r.data : null;
}
