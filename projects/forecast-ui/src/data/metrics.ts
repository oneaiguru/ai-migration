export interface MetricsSummary {
  monthly: {
    region: {
      wape_median: number;
      wape_p75: number;
      wape_p90: number;
    };
    district: {
      wape_median: number;
      wape_p75: number;
      wape_p90: number;
    };
  };
  daily: {
    region: {
      wape_median: number;
      wape_p75: number;
    };
    district: {
      wape_median: number;
      wape_p75: number;
    };
  };
  smape_district_top5: Array<{
    district: string;
    smape: number;
  }>;
  smape_district_worst5: Array<{
    district: string;
    smape: number;
  }>;
}

export interface SiteForecast {
  site_id: string;
  address: string;
  fill_pct: number;
  overflow_risk: number;
  pred_mass_kg: number;
  last_service?: string;
}

export interface RouteRecommendation {
  site_id: string;
  address: string;
  fill_pct: number;
  overflow_risk: number;
  action: 'visit' | 'skip';
  pred_mass_kg: number;
}

export const metricsData: MetricsSummary = {
  monthly: {
    region: {
      wape_median: 0.081293,
      wape_p75: 0.095179,
      wape_p90: 0.114654
    },
    district: {
      wape_median: 0.131143,
      wape_p75: 0.200626,
      wape_p90: 0.339601
    }
  },
  daily: {
    region: {
      wape_median: 0,
      wape_p75: 0
    },
    district: {
      wape_median: 0,
      wape_p75: 0
    }
  },
  smape_district_top5: [
    { district: "Правый берег", smape: 0.038099 },
    { district: "Ангарский ГО", smape: 0.045229 },
    { district: "Левый берег", smape: 0.051071 },
    { district: "МО Саянск", smape: 0.051908 },
    { district: "Бодайбинский район", smape: 0.091136 }
  ],
  smape_district_worst5: [
    { district: "Ольхонский район", smape: 0.756321 },
    { district: "Куйтунский район", smape: 0.281426 },
    { district: "Баяндаевский район", smape: 0.280799 },
    { district: "Качугский район", smape: 0.247028 },
    { district: "Усть-Удинский район", smape: 0.245845 }
  ]
};

// Mock site forecast data
export const mockSites: SiteForecast[] = [
  { site_id: "38103376", address: "Барикад, 56", fill_pct: 0.89, overflow_risk: 0.92, pred_mass_kg: 450, last_service: "2025-01-01" },
  { site_id: "38113308", address: "Лесная, 112", fill_pct: 0.67, overflow_risk: 0.45, pred_mass_kg: 320, last_service: "2025-01-02" },
  { site_id: "38114201", address: "Трактовая, 8", fill_pct: 0.82, overflow_risk: 0.78, pred_mass_kg: 410, last_service: "2024-12-30" },
  { site_id: "38115089", address: "Сухэ-Батора, 15", fill_pct: 0.54, overflow_risk: 0.28, pred_mass_kg: 280, last_service: "2025-01-03" },
  { site_id: "38116432", address: "Декабристов, 45", fill_pct: 0.91, overflow_risk: 0.95, pred_mass_kg: 480, last_service: "2024-12-29" },
  { site_id: "38117234", address: "Байкальская, 234", fill_pct: 0.43, overflow_risk: 0.15, pred_mass_kg: 210, last_service: "2025-01-04" },
  { site_id: "38118967", address: "Партизанская, 78", fill_pct: 0.76, overflow_risk: 0.65, pred_mass_kg: 390, last_service: "2025-01-01" },
  { site_id: "38119845", address: "Ленинградская, 124", fill_pct: 0.38, overflow_risk: 0.12, pred_mass_kg: 195, last_service: "2025-01-05" },
];

// Mock route recommendations
export const mockRoutesStrict: RouteRecommendation[] = mockSites
  .filter(s => s.overflow_risk >= 0.8 || s.fill_pct >= 0.8)
  .map(s => ({ ...s, action: 'visit' as const }));

export const mockRoutesShowcase: RouteRecommendation[] = mockSites
  .filter(s => s.overflow_risk >= 0.5 || s.fill_pct >= 0.6)
  .map(s => ({ ...s, action: s.overflow_risk >= 0.8 ? 'visit' as const : 'skip' as const }));
