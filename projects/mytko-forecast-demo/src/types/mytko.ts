// Reference: _incoming/telegram_20251105_184724/extracted/src/_widgets/route/forecast/types.ts
export type ForecastDataPoint = {
  date: string;
  isFact: boolean;
  isEmpty: boolean;
  tripMeasurements: number[] | number | null;
  dividedToTrips: boolean;
  vehicleVolume: number;
  overallVolume: number;
  overallWeight: number;
  overallMileage?: number | null;
  isMixed?: boolean | null;
};

export type ForecastDataFormat = ForecastDataPoint[];
