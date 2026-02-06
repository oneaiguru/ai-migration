import type { AbsenteeismSnapshot, ForecastBuildResult } from './types';
import { generateAbsenteeismSnapshot, generateForecastBuild } from './data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ForecastingServiceOptions {
  delayMs?: number;
}

export const runForecastBuild = async (
  organisation: string,
  horizonWeeks: number,
  projectionWeeks: number,
  options: ForecastingServiceOptions = {},
): Promise<ForecastBuildResult> => {
  if (options.delayMs) {
    await delay(options.delayMs);
  } else {
    await delay(400);
  }
  return generateForecastBuild(organisation, horizonWeeks, projectionWeeks);
};

export const loadAbsenteeismSnapshot = async (
  organisation: string,
  options: ForecastingServiceOptions = {},
): Promise<AbsenteeismSnapshot> => {
  if (options.delayMs) {
    await delay(options.delayMs);
  } else {
    await delay(200);
  }
  return generateAbsenteeismSnapshot(organisation);
};
