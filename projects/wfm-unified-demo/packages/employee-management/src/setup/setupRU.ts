import { registerCharts } from '../utils/charts/register';

let isSetupComplete = false;

/**
 * Prepares shared localisation/visual registries for the Employee Management package.
 * Call once from the hosting shell before rendering the `Root` component.
 */
export const setupRU = (): void => {
  if (isSetupComplete) {
    return;
  }

  registerCharts();
  isSetupComplete = true;
};
