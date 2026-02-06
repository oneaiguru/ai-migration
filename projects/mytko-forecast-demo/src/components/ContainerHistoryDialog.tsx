import { useEffect, useMemo, useRef, useState } from 'react';
import { DownloadOutlined, FilePdfOutlined, FileTextOutlined } from '@ant-design/icons';
import { Modal, DatePicker, Segmented, Space, Typography, Button, Skeleton, Empty } from 'antd';
import type { SegmentedValue } from 'antd/es/segmented';
import dayjs, { Dayjs } from 'dayjs';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Scatter,
  ReferenceLine,
} from 'recharts';
import { useContainerHistory, type HistoryMode } from '@/hooks/useContainerHistory';
import { exportToCsv } from '@/utils/csv';
import { exportChartToPdf, exportChartToPng, exportFullSiteReportPdf, type PDFReportData } from '@/utils/chartExport';
import { FeedbackForm } from '@/components/FeedbackForm';

const { RangePicker } = DatePicker;

const MODE_LABELS: Record<HistoryMode, string> = {
  daily: 'За сутки',
  weekly: 'Неделю',
  monthly: 'Месяц',
};

type ModeValue = HistoryMode;

export interface ContainerHistoryDialogProps {
  siteId: string;
  open: boolean;
  onClose: () => void;
  initialRange: [Dayjs, Dayjs];
  vehicleVolume: number;
  cutoffDate?: Dayjs;
  address?: string;
  district?: string;
  horizonDays?: number;
  feedbackDate?: string;
}

const defaultRange = (): [Dayjs, Dayjs] => [dayjs().subtract(6, 'day'), dayjs()];

export function ContainerHistoryDialog({
  siteId,
  open,
  onClose,
  initialRange,
  vehicleVolume,
  cutoffDate,
  address,
  district,
  horizonDays,
  feedbackDate,
}: ContainerHistoryDialogProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<ModeValue>('daily');
  const [range, setRange] = useState<[Dayjs, Dayjs]>(initialRange ?? defaultRange());

  useEffect(() => {
    if (initialRange) {
      setRange(initialRange);
    }
  }, [initialRange, siteId]);

  const history = useContainerHistory(siteId, range, mode, vehicleVolume);

  const chartData = useMemo(
    () =>
      history.aggregatedRows.map((row) => ({
        label: row.label,
        actual: Number(row.actualM3.toFixed(3)),
        forecast: Number(row.forecastM3.toFixed(3)),
        collection: row.collectionMarker ?? null,
      })),
    [history.aggregatedRows]
  );

  const totals = history.totals;

  const handleExportPng = async () => {
    if (!chartRef.current) {
      return;
    }
    await exportChartToPng(chartRef.current, `site_${siteId}_chart.png`);
  };

  const handleExportPdf = async () => {
    if (!chartRef.current) {
      return;
    }
    await exportChartToPdf(chartRef.current, `site_${siteId}_report.pdf`, {
      siteId,
      dateRange: `${range[0].format('DD.MM.YYYY')} — ${range[1].format('DD.MM.YYYY')}`,
      cutoffDate: cutoffDate?.format('DD.MM.YYYY'),
    });
  };

  const handleExportFullReport = async () => {
    if (!chartRef.current) {
      return;
    }
    const actualRows = history.rows.filter((row) => row.actualM3 > 0);
    const coveredRows = actualRows.filter((row) => row.forecastM3 != null);
    const totalActual = coveredRows.reduce((acc, row) => acc + row.actualM3, 0);
    const totalForecast = coveredRows.reduce((acc, row) => acc + (row.forecastM3 ?? 0), 0);
    const totalAbsError = coveredRows.reduce(
      (acc, row) => acc + Math.abs((row.forecastM3 ?? 0) - row.actualM3),
      0
    );
    const coveragePct = actualRows.length > 0 ? (coveredRows.length / actualRows.length) * 100 : 0;
    const wape = totalActual > 0 ? totalAbsError / totalActual : 0;
    const hasCoverage = coveredRows.length > 0;
    const reportData: PDFReportData = {
      siteId,
      address: address || 'N/A',
      district: district || 'N/A',
      cutoffDate: cutoffDate?.format('YYYY-MM-DD') || '',
      horizonDays: horizonDays || 0,
      startDate: range[0].format('YYYY-MM-DD'),
      endDate: range[1].format('YYYY-MM-DD'),
      dailyData: history.rows.map((row) => ({
        date: row.date.format('YYYY-MM-DD'),
        actual_m3: row.actualM3,
        forecast_m3: row.forecastM3 || 0,
        error_pct: row.actualM3 > 0 && row.forecastM3 != null
          ? Math.abs((row.forecastM3 - row.actualM3) / row.actualM3) * 100
          : undefined,
        fill_pct: row.fillPct || 0,
      })),
      accuracy: hasCoverage
        ? {
            wape,
            coverage_pct: coveragePct,
            total_actual_m3: totalActual,
            total_forecast_m3: totalForecast,
          }
        : undefined,
    };
    await exportFullSiteReportPdf(chartRef.current, reportData, `site_${siteId}_full_report.pdf`);
  };

  const handleExport = () => {
    exportToCsv(`site_${siteId}_history.csv`, history.rows.map((row) => ({
      site_id: row.siteId,
      date: row.date.format('YYYY-MM-DD'),
      actual_m3: row.actualM3.toFixed(3),
      forecast_m3: (row.forecastM3 ?? 0).toFixed(3),
      fill_pct: row.fillPct ?? '',
      overflow_prob: row.overflowProb ?? '',
      is_collection: row.isCollection ? 1 : 0,
      last_service_dt: row.lastServiceDt?.format('YYYY-MM-DD') ?? '',
    })));
  };

  const renderBody = () => {
    if (history.loading) {
      return <Skeleton active paragraph={{ rows: 6 }} />;
    }
    if (history.error) {
      return <Empty description={`Ошибка загрузки: ${history.error}`} />;
    }
    if (!chartData.length) {
      return <Empty description="Нет данных для выбранного диапазона" />;
    }
    return (
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)} м³`} />
            <Legend />
            {cutoffDate && (
              <ReferenceLine
                x={cutoffDate.format('YYYY-MM-DD')}
                stroke="#ff4d4f"
                strokeDasharray="5 5"
                label={{ value: 'Срез', position: 'top' }}
              />
            )}
            <Bar dataKey="actual" name="Факт" fill="#1890ff" />
            <Bar dataKey="forecast" name="Прогноз" fill="#52c41a" />
            <Scatter dataKey="collection" name="Вывоз" fill="#ff4d4f" shape="circle" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onClose}
      width={900}
      title={`История накопления — КП ${siteId}`}
      footer={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Text>
            Факт: <strong>{totals.actual.toFixed(1)} м³</strong> · Прогноз:{' '}
            <strong>{totals.forecast.toFixed(1)} м³</strong>
          </Typography.Text>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExportPng}>
              PNG
            </Button>
            <Button icon={<FilePdfOutlined />} onClick={handleExportPdf}>
              PDF
            </Button>
            <Button icon={<FileTextOutlined />} onClick={handleExportFullReport}>
              Полный отчет
            </Button>
            <Button onClick={handleExport}>Экспорт CSV</Button>
            <Button type="primary" onClick={onClose}>
              Закрыть
            </Button>
          </Space>
        </Space>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
          <RangePicker
            value={range}
            onChange={(next) => {
              if (next?.[0] && next?.[1]) {
                setRange([next[0], next[1]]);
              }
            }}
          />
          <Segmented
            value={mode}
            onChange={(value: SegmentedValue) => setMode(value as ModeValue)}
            options={Object.entries(MODE_LABELS).map(([value, label]) => ({ label, value }))}
          />
        </Space>
        {renderBody()}
        {feedbackDate && <FeedbackForm siteId={siteId} date={feedbackDate} />}
      </Space>
    </Modal>
  );
}
