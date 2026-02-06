import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  _adapters,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ru } from 'date-fns/locale';

let registered = false;

export const registerCharts = (): void => {
  if (registered) {
    return;
  }

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    LineController,
    BarController,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale,
  );

  if (typeof _adapters._date?.override === 'function') {
    _adapters._date.override({
      locale: ru,
    });
  }

  registered = true;
};
