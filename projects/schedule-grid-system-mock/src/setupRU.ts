import { registerCharts } from './utils/charts/register';

let initialized = false;

export const setupRU = (): void => {
  if (initialized) {
    return;
  }

  if (typeof document !== 'undefined') {
    document.documentElement.lang = 'ru';
    document.documentElement.setAttribute('lang', 'ru');
  }

  registerCharts();
  initialized = true;
};

export default setupRU;
