import { describe, expect, it } from 'vitest';
import { applyExceptionTemplates, loadExceptionTemplates, summariseExceptionImpact } from '../exceptions';
import { generateForecastBuild } from '../data';

describe('forecasting exceptions', () => {
  it('adjusts the series when templates are applied', async () => {
    const templates = await loadExceptionTemplates({ delayMs: 0 });
    const build = generateForecastBuild('Контакт-центр 1010.ru', 4, 4);
    const { adjusted } = applyExceptionTemplates(build.forecast, templates.slice(0, 1));
    const changedPoint = adjusted.points.find(
      (point, index) => point.value !== build.forecast.points[index].value,
    );
    expect(changedPoint).toBeDefined();
  });

  it('summarises absolute and percent deltas', async () => {
    const templates = await loadExceptionTemplates({ delayMs: 0 });
    const build = generateForecastBuild('Контакт-центр 1010.ru', 6, 2);
    const { adjusted } = applyExceptionTemplates(build.forecast, templates.slice(0, 2));
    const summary = summariseExceptionImpact(build.forecast, adjusted);
    expect(summary.percentDelta).not.toBeNaN();
  });
});
