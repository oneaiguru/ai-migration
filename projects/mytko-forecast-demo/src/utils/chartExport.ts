import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JSZip from 'jszip';

type ChartMetadata = {
  siteId: string;
  dateRange: string;
  cutoffDate?: string;
};

export interface PDFReportData {
  siteId: string;
  address: string;
  district: string;
  cutoffDate: string;
  horizonDays: number;
  startDate: string;
  endDate: string;
  dailyData: {
    date: string;
    actual_m3?: number;
    forecast_m3: number;
    error_pct?: number;
    fill_pct: number;
  }[];
  accuracy?: {
    wape: number;
    coverage_pct: number;
    total_actual_m3?: number;
    total_forecast_m3: number;
  };
}

const PDF_FONT_NAME = 'NotoSans';
const PDF_FONT_FILE = 'NotoSans-Regular.ttf';
const PDF_FONT_URL = new URL(
  `fonts/${PDF_FONT_FILE}`,
  import.meta.env.BASE_URL
).toString();
const DEFAULT_PDF_FONT = 'helvetica';

type PdfText = {
  title: (siteId: string) => string;
  addressLabel: string;
  districtLabel: string;
  cutoffLabel: (cutoffDate: string, horizonDays: number) => string;
  periodLabel: (startDate: string, endDate: string) => string;
  accuracyTitle: string;
  wapeLabel: string;
  coverageLabel: string;
  totalActualLabel: string;
  totalForecastLabel: string;
  dailyTitle: string;
  tableHead: string[];
  unitM3: string;
  missingValue: string;
};

const PDF_TEXT_RU: PdfText = {
  title: (siteId) => `История накопления — КП ${siteId}`,
  addressLabel: 'Адрес',
  districtLabel: 'Район',
  cutoffLabel: (cutoffDate, horizonDays) =>
    `Дата среза: ${cutoffDate} | Горизонт: ${horizonDays} дней`,
  periodLabel: (startDate, endDate) => `Период: ${startDate} — ${endDate}`,
  accuracyTitle: 'Метрики точности',
  wapeLabel: 'WAPE (%)',
  coverageLabel: 'Охват',
  totalActualLabel: 'Итого факт',
  totalForecastLabel: 'Итого прогноз',
  dailyTitle: 'Дневной прогноз',
  tableHead: ['Дата', 'Факт (м³)', 'Прогноз (м³)', 'Ошибка', 'Заполн.'],
  unitM3: 'м³',
  missingValue: '—',
};

let pdfFontBase64: string | null = null;
let pdfFontLoadPromise: Promise<string> | null = null;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Unexpected font data result'));
        return;
      }
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read font data'));
    reader.readAsDataURL(blob);
  });
}

async function ensurePdfFont(pdf: jsPDF): Promise<string | null> {
  try {
    if (!pdfFontBase64) {
      if (!pdfFontLoadPromise) {
        pdfFontLoadPromise = fetch(PDF_FONT_URL).then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load font (${response.status})`);
          }
          return response.blob().then((blob) => blobToBase64(blob));
        });
      }
      pdfFontBase64 = await pdfFontLoadPromise;
    }

    const fontList = pdf.getFontList();
    if (!fontList[PDF_FONT_NAME]) {
      pdf.addFileToVFS(PDF_FONT_FILE, pdfFontBase64);
      pdf.addFont(PDF_FONT_FILE, PDF_FONT_NAME, 'normal');
    }
    return PDF_FONT_NAME;
  } catch {
    return null;
  }
}

export async function exportChartToPng(
  chartRef: HTMLDivElement,
  filename: string
): Promise<void> {
  const canvas = await html2canvas(chartRef, {
    backgroundColor: '#ffffff',
    scale: 2,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportChartToPdf(
  chartRef: HTMLDivElement,
  filename: string,
  metadata: ChartMetadata
): Promise<void> {
  const canvas = await html2canvas(chartRef, {
    backgroundColor: '#ffffff',
    scale: 2,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });
  const pdfFont = await ensurePdfFont(pdf);
  pdf.setFont(pdfFont ?? DEFAULT_PDF_FONT, 'normal');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const titleY = 20;
  const metaY = 28;

  pdf.setFontSize(16);
  pdf.text(`Site history - KP ${metadata.siteId}`, margin, titleY);

  pdf.setFontSize(10);
  pdf.text(`Period: ${metadata.dateRange}`, margin, metaY);
  if (metadata.cutoffDate) {
    pdf.text(`Cutoff: ${metadata.cutoffDate}`, margin, metaY + 6);
  }

  const imageY = metadata.cutoffDate ? metaY + 14 : metaY + 8;
  const imageWidth = pageWidth - margin * 2;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;
  const maxImageHeight = 150;

  pdf.addImage(
    imgData,
    'PNG',
    margin,
    imageY,
    imageWidth,
    Math.min(imageHeight, maxImageHeight)
  );

  pdf.save(filename);
}

export async function exportFullSiteReportPdf(
  chartRef: HTMLDivElement,
  reportData: PDFReportData,
  filename: string
): Promise<void> {
  const canvas = await html2canvas(chartRef, {
    backgroundColor: '#ffffff',
    scale: 2,
  });

  const text = PDF_TEXT_RU;
  const cutoffDateValue = reportData.cutoffDate || text.missingValue;
  const addressValue = reportData.address || text.missingValue;
  const districtValue = reportData.district || text.missingValue;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  const pdfFont = await ensurePdfFont(pdf);
  pdf.setFont(pdfFont ?? DEFAULT_PDF_FONT, 'normal');

  // PAGE 1: Header + Chart
  pdf.setFontSize(16);
  pdf.text(text.title(reportData.siteId), 20, 20);

  pdf.setFontSize(10);
  pdf.text(`${text.addressLabel}: ${addressValue}`, 20, 28);
  pdf.text(`${text.districtLabel}: ${districtValue}`, 20, 34);
  pdf.text(text.cutoffLabel(cutoffDateValue, reportData.horizonDays), 20, 40);
  pdf.text(text.periodLabel(reportData.startDate, reportData.endDate), 20, 46);

  // Chart image
  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 170;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 20, 54, imgWidth, Math.min(imgHeight, 120));

  // PAGE 2: Metrics & Data
  pdf.addPage();
  pdf.setFont(pdfFont ?? DEFAULT_PDF_FONT, 'normal');
  let yPos = 20;

  // Accuracy summary table
  if (reportData.accuracy) {
    pdf.setFontSize(12);
    pdf.text(text.accuracyTitle, 20, yPos);
    yPos += 10;

    pdf.setFontSize(9);
    const accuracy = reportData.accuracy;
    const metricsRows = [
      [text.wapeLabel, `${(accuracy.wape * 100).toFixed(2)}%`],
      [text.coverageLabel, `${accuracy.coverage_pct.toFixed(1)}%`],
      [
        text.totalActualLabel,
        `${accuracy.total_actual_m3?.toFixed(2) ?? text.missingValue} ${text.unitM3}`,
      ],
      [
        text.totalForecastLabel,
        `${accuracy.total_forecast_m3.toFixed(2)} ${text.unitM3}`,
      ],
    ];

    metricsRows.forEach(([label, value]) => {
      pdf.text(label, 25, yPos);
      pdf.text(value, 100, yPos);
      yPos += 6;
    });

    yPos += 4;
  }

  // Daily breakdown table
  pdf.setFontSize(12);
  pdf.text(text.dailyTitle, 20, yPos);
  yPos += 8;

  const tableData = reportData.dailyData.slice(0, 20).map((d) => [
    d.date,
    d.actual_m3?.toFixed(2) ?? text.missingValue,
    d.forecast_m3.toFixed(2),
    d.error_pct != null ? d.error_pct.toFixed(1) + '%' : text.missingValue,
    (d.fill_pct * 100).toFixed(0) + '%',
  ]);

  // Use autoTable plugin
  (pdf as any).autoTable({
    startY: yPos,
    head: [text.tableHead],
    body: tableData,
    theme: 'grid',
    styles: { font: pdfFont ?? DEFAULT_PDF_FONT, fontStyle: 'normal' },
    headStyles: {
      fillColor: [100, 100, 100],
      font: pdfFont ?? DEFAULT_PDF_FONT,
      fontStyle: 'normal',
    },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  pdf.save(filename);
}

/**
 * Generate a PDF blob for a single site report (for use in ZIP export).
 */
export async function generateSiteReportPdfBlob(
  chartRef: HTMLDivElement,
  reportData: PDFReportData
): Promise<Blob> {
  const canvas = await html2canvas(chartRef, {
    backgroundColor: '#ffffff',
    scale: 2,
  });

  const text = PDF_TEXT_RU;
  const cutoffDateValue = reportData.cutoffDate || text.missingValue;
  const addressValue = reportData.address || text.missingValue;
  const districtValue = reportData.district || text.missingValue;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  const pdfFont = await ensurePdfFont(pdf);
  pdf.setFont(pdfFont ?? DEFAULT_PDF_FONT, 'normal');

  // PAGE 1: Header + Chart
  pdf.setFontSize(16);
  pdf.text(text.title(reportData.siteId), 20, 20);

  pdf.setFontSize(10);
  pdf.text(`${text.addressLabel}: ${addressValue}`, 20, 28);
  pdf.text(`${text.districtLabel}: ${districtValue}`, 20, 34);
  pdf.text(text.cutoffLabel(cutoffDateValue, reportData.horizonDays), 20, 40);
  pdf.text(text.periodLabel(reportData.startDate, reportData.endDate), 20, 46);

  // Chart image
  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 170;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 20, 54, imgWidth, Math.min(imgHeight, 120));

  // PAGE 2: Metrics & Data
  pdf.addPage();
  pdf.setFont(pdfFont ?? DEFAULT_PDF_FONT, 'normal');
  let yPos = 20;

  // Accuracy summary table
  if (reportData.accuracy) {
    pdf.setFontSize(12);
    pdf.text(text.accuracyTitle, 20, yPos);
    yPos += 10;

    pdf.setFontSize(9);
    const accuracy = reportData.accuracy;
    const metricsRows = [
      [text.wapeLabel, `${(accuracy.wape * 100).toFixed(2)}%`],
      [text.coverageLabel, `${accuracy.coverage_pct.toFixed(1)}%`],
      [
        text.totalActualLabel,
        `${accuracy.total_actual_m3?.toFixed(2) ?? text.missingValue} ${text.unitM3}`,
      ],
      [
        text.totalForecastLabel,
        `${accuracy.total_forecast_m3.toFixed(2)} ${text.unitM3}`,
      ],
    ];

    metricsRows.forEach(([label, value]) => {
      pdf.text(label, 25, yPos);
      pdf.text(value, 100, yPos);
      yPos += 6;
    });

    yPos += 4;
  }

  // Daily breakdown table
  pdf.setFontSize(12);
  pdf.text(text.dailyTitle, 20, yPos);
  yPos += 8;

  const tableData = reportData.dailyData.slice(0, 20).map((d) => [
    d.date,
    d.actual_m3?.toFixed(2) ?? text.missingValue,
    d.forecast_m3.toFixed(2),
    d.error_pct != null ? d.error_pct.toFixed(1) + '%' : text.missingValue,
    (d.fill_pct * 100).toFixed(0) + '%',
  ]);

  // Use autoTable plugin
  (pdf as any).autoTable({
    startY: yPos,
    head: [text.tableHead],
    body: tableData,
    theme: 'grid',
    styles: { font: pdfFont ?? DEFAULT_PDF_FONT, fontStyle: 'normal' },
    headStyles: {
      fillColor: [100, 100, 100],
      font: pdfFont ?? DEFAULT_PDF_FONT,
      fontStyle: 'normal',
    },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  return pdf.output('blob');
}

export interface BatchExportSite {
  siteId: string;
  pdfBlob: Blob;
}

/**
 * Export multiple site PDFs as a ZIP file.
 */
export async function exportSitesAsZip(
  sites: BatchExportSite[],
  filename: string,
): Promise<void> {
  const zip = new JSZip();

  for (const site of sites) {
    zip.file(`site_${site.siteId}_report.pdf`, site.pdfBlob);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
}
