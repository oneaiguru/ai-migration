import * as XLSX from 'xlsx';

export interface ExcelExportRequest {
  cutoffDate: string;
  horizonDays: number;
  siteCount: number;
  totalForecast: number;
  coverage: number;
  wape?: number;
  data: Array<{
    date: string;
    site_id: string;
    address?: string;
    district?: string;
    actual_m3?: number;
    forecast_m3: number;
    error_pct?: number;
    fill_pct: number;
  }>;
  byDistrict?: Array<{
    district: string;
    site_count: number;
    total_forecast: number;
    wape?: number;
  }>;
}

export function exportToExcel(
  request: ExcelExportRequest,
  filename: string,
): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ['Параметры прогноза'],
    ['Дата среза', request.cutoffDate],
    ['Горизонт (дней)', request.horizonDays],
    ['Всего площадок', request.siteCount],
    ['Прогноз (м³)', request.totalForecast.toFixed(2)],
    ['Охват', request.coverage.toFixed(1) + '%'],
    ['WAPE', request.wape != null ? (request.wape * 100).toFixed(2) + '%' : 'N/A'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Sheet 2: Daily Data
  const dailyHeaders = [
    'Дата',
    'ID площадки',
    'Адрес',
    'Район',
    'Факт (м³)',
    'Прогноз (м³)',
    'Ошибка %',
    'Заполн. %',
  ];
  const dailyRows = request.data.map((d) => [
    d.date,
    d.site_id,
    d.address || '',
    d.district || '',
    d.actual_m3 != null ? d.actual_m3.toFixed(2) : '',
    d.forecast_m3.toFixed(2),
    d.error_pct != null ? d.error_pct.toFixed(1) : '',
    (d.fill_pct * 100).toFixed(0),
  ]);

  const wsDaily = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyRows]);
  wsDaily['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 30 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily Data');

  // Sheet 3: By District (if available)
  if (request.byDistrict && request.byDistrict.length > 0) {
    const districtHeaders = ['Район', 'Площадок', 'Прогноз (м³)', 'WAPE'];
    const districtRows = request.byDistrict.map((d) => [
      d.district,
      d.site_count,
      d.total_forecast.toFixed(2),
      d.wape != null ? (d.wape * 100).toFixed(2) + '%' : 'N/A',
    ]);

    const wsDistrict = XLSX.utils.aoa_to_sheet([districtHeaders, ...districtRows]);
    wsDistrict['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsDistrict, 'By District');
  }

  // Sheet 4: Legend
  const legendData = [
    ['Определения колонок'],
    ['Дата', 'Date of forecast period'],
    ['ID площадки', 'Container site identifier'],
    ['Адрес', 'Physical address'],
    ['Район', 'Administrative district'],
    ['Факт', 'Actual collected weight (from historical data up to cutoff)'],
    ['Прогноз', 'Predicted weight for the date'],
    ['Ошибка %', 'Absolute percentage error'],
    ['Заполн.', 'Predicted fill percentage (0-100%)'],
    [],
    ['Примечания'],
    ['WAPE', 'Weighted Absolute Percentage Error'],
    ['Охват', 'Percentage of rows with actual data available'],
  ];

  const wsLegend = XLSX.utils.aoa_to_sheet(legendData);
  wsLegend['!cols'] = [{ wch: 15 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsLegend, 'Legend');

  // Write file
  XLSX.writeFile(wb, filename);
}
