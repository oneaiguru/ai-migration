import { useEffect, useMemo, useState } from 'react';
import { FileExcelOutlined, SearchOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Progress,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { forecastStore } from '@/stores/forecastStore';
import { DEMO_SITE_MAP, DEMO_SITES } from '@/constants/demoSites';
import type { ForecastDataPoint } from '@/types/mytko';
import type { RollingForecastRow } from '@/api/client';
import { apiConfig } from '@/api/client';
import { useContainerHistory } from '@/hooks/useContainerHistory';
import { useSiteAccuracy } from '@/hooks/useSiteAccuracy';
import { ContainerHistoryDialog } from '@/components/ContainerHistoryDialog';
import { SiteGallery } from '@/components/SiteGallery';
import { MetricsUpload } from '@/components/MetricsUpload';
import { IterationDashboard } from '@/components/IterationDashboard';
import { FeedbackDashboard } from '@/components/FeedbackDashboard';
import { exportToCsv } from '@/utils/csv';
import { exportToExcel } from '@/utils/excelExport';

const { RangePicker } = DatePicker;

const CUSTOM_SITE_VALUE = 'custom';
const ALL_SITES_VALUE = 'all-sites';

const HORIZON_OPTIONS = [
  { label: '7 дней', value: 7 },
  { label: '30 дней', value: 30 },
  { label: '90 дней', value: 90 },
  { label: 'Другой', value: -1 },  // -1 = custom
];

const ForecastPage = observer(() => {
  const store = forecastStore;
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs(store.startDate),
    dayjs(store.endDate),
  ]);
  const [dialogSite, setDialogSite] = useState<string | null>(null);
  const [dialogDate, setDialogDate] = useState<string | null>(null);
  const [dialogRange, setDialogRange] = useState<[Dayjs, Dayjs]>([
    dayjs(store.startDate),
    dayjs(store.endDate),
  ]);
  const [dataCutoff, setDataCutoff] = useState<Dayjs | null>(null);
  const [rollingEnabled, setRollingEnabled] = useState<boolean>(() => store.rollingMode);
  const [horizonDays, setHorizonDays] = useState<number>(7);
  const [customHorizon, setCustomHorizon] = useState<number>(30);
  const [siteSelection, setSiteSelection] = useState<string>(() => {
    if (!store.siteId) {
      return ALL_SITES_VALUE;
    }
    const isPreset = DEMO_SITES.some((preset) => preset.id === store.siteId);
    return isPreset ? store.siteId : CUSTOM_SITE_VALUE;
  });
  const [searchInput, setSearchInput] = useState<string>('');

  const historyMeta = useContainerHistory(store.siteId, dateRange, 'daily', store.vehicleVolume);
  const accuracy = useSiteAccuracy(store.siteId, store.startDate, store.endDate);
  const metaByDate = useMemo(() => {
    const map = new Map<string, (typeof historyMeta.rows)[number]>();
    historyMeta.rows.forEach((row) => {
      map.set(row.date.format('YYYY-MM-DD'), row);
    });
    return map;
  }, [historyMeta.rows]);

  useEffect(() => {
    store.load();
  }, []);

  useEffect(() => {
    store.loadDistricts();
  }, []);

  useEffect(() => {
    if (!store.siteId) {
      setSiteSelection(ALL_SITES_VALUE);
      return;
    }
    const nextValue = DEMO_SITES.some((preset) => preset.id === store.siteId) ? store.siteId : CUSTOM_SITE_VALUE;
    setSiteSelection(nextValue);
  }, [store.siteId]);

  useEffect(() => {
    setDialogRange([dateRange[0], dateRange[1]]);
  }, [dateRange]);

  useEffect(() => {
    if (!dataCutoff && historyMeta.overallLastServiceDate) {
      setDataCutoff(historyMeta.overallLastServiceDate);
    }
  }, [dataCutoff, historyMeta.overallLastServiceDate]);

  const totals = useMemo(() => {
    const totalVolume = store.data.reduce((sum, item) => sum + (item.overallVolume ?? 0), 0);
    const totalWeight = store.data.reduce((sum, item) => sum + (item.overallWeight ?? 0), 0);
    const busyDays = store.data.filter((item) => !item.isEmpty).length;
    return { totalVolume, totalWeight, busyDays };
  }, [store.data]);

  const wapePercent = accuracy.data?.wape != null ? accuracy.data.wape * 100 : null;
  const wapeColor = wapePercent != null ? (wapePercent < 15 ? '#52c41a' : '#faad14') : undefined;
  const formatVolume = (value: number | null | undefined) =>
    value != null
      ? value.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
      : '—';
  const siteSelectOptions = useMemo(
    () => DEMO_SITES.map((preset) => ({ label: preset.label, value: preset.id })),
    []
  );
  const dialogPreset = useMemo(
    () => (dialogSite ? DEMO_SITE_MAP.get(dialogSite) : undefined),
    [dialogSite]
  );
  const isCustomSelection = siteSelection === CUSTOM_SITE_VALUE;
  const isAllSitesSelection = siteSelection === ALL_SITES_VALUE;
  const showAllSitesTable = store.rollingMode && !store.siteId;
  const rollingActive = rollingEnabled || isAllSitesSelection;

  useEffect(() => {
    const timer = setTimeout(() => {
      store.setSearchTerm(searchInput.trim());
      if (showAllSitesTable) {
        store.loadRollingAllSites(1, store.allSitesPageSize);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, showAllSitesTable, store.allSitesPageSize]);

  const applyPreset = (value: string) => {
    const preset = store.selectPreset(value);
    if (preset) {
      setDateRange([dayjs(preset.start), dayjs(preset.end)]);
    } else {
      setDateRange([dayjs(store.startDate), dayjs(store.endDate)]);
    }
  };

  const handleGallerySelect = (siteId: string) => {
    setSiteSelection(siteId);
    applyPreset(siteId);
  };

  const handleSiteSelect = (value: string) => {
    setSiteSelection(value);
    if (value === CUSTOM_SITE_VALUE) {
      return;
    }
    if (value === ALL_SITES_VALUE) {
      store.setSiteId('');
      setRollingEnabled(true);
      return;
    }
    applyPreset(value);
  };

  const handleRangeChange = (range: [Dayjs | null, Dayjs | null] | null) => {
    if (!range?.[0] || !range?.[1]) {
      return;
    }
    if (siteSelection !== CUSTOM_SITE_VALUE && siteSelection !== ALL_SITES_VALUE) {
      setSiteSelection(CUSTOM_SITE_VALUE);
    }
    setDateRange([range[0], range[1]]);
  };

  const missingFillHint = useMemo(() => {
    const [start, end] = dateRange;
    if (!start || !end) {
      return null;
    }
    let cursor = start.startOf('day');
    const limit = end.startOf('day');
    let missingCount = 0;
    let lastFillDate: Dayjs | null = null;
    while (cursor.isSame(limit) || cursor.isBefore(limit)) {
      const key = cursor.format('YYYY-MM-DD');
      const meta = metaByDate.get(key);
      const hasFill = meta?.fillPct != null && !Number.isNaN(meta.fillPct);
      if (hasFill) {
        lastFillDate = cursor;
      } else {
        missingCount += 1;
      }
      cursor = cursor.add(1, 'day');
    }
    if (missingCount <= 3) {
      return null;
    }
    if (!lastFillDate) {
      return 'Нет данных заполнения для выбранного диапазона — выберите другие даты';
    }
    return `Нет данных заполнения после ${lastFillDate.format(
      'DD.MM'
    )} — выберите более короткий диапазон`;
  }, [dateRange, metaByDate]);

  const renderFill = (value?: number | null) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return <Typography.Text type="secondary">—</Typography.Text>;
    }
    const percent = Math.min(Math.max(value * 100, 0), 100);
    const color = percent >= 80 ? '#ff4d4f' : percent >= 60 ? '#faad14' : '#52c41a';
    return <Progress percent={Math.round(percent)} strokeColor={color} size="small" />;
  };

  const renderRisk = (value?: number | null) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return <Typography.Text type="secondary">—</Typography.Text>;
    }
    const pct = Math.round(value * 100);
    let color: 'red' | 'orange' | 'green' = 'green';
    let label = 'Низкий';
    if (value >= 0.8) {
      color = 'red';
      label = 'Высокий';
    } else if (value >= 0.6) {
      color = 'orange';
      label = 'Средний';
    }
    return <Badge color={color} text={`${label} ${pct}%`} />;
  };

  type ForecastTableRow = ForecastDataPoint & {
    fillPct?: number | null;
    overflowProb?: number | null;
    lastServiceDate?: string | null;
  };

  const tableRows = useMemo(
    () =>
      store.data.map((item) => {
        const meta = metaByDate.get(item.date);
        const row: ForecastTableRow & { key: string } = {
          ...item,
          key: item.date,
          fillPct: meta?.fillPct ?? null,
          overflowProb: meta?.overflowProb ?? null,
          lastServiceDate:
            meta?.lastServiceDt?.format('YYYY-MM-DD') ??
            historyMeta.overallLastServiceDate?.format('YYYY-MM-DD') ??
            null,
        };
        return row;
      }),
    [store.data, metaByDate, historyMeta.overallLastServiceDate]
  );

  const columns: ColumnsType<ForecastTableRow> = [
    {
      title: 'Код КП',
      key: 'siteId',
      render: () => (
        <Button
          type="link"
          onClick={() => {
            setDialogSite(store.siteId);
            setDialogRange([dateRange[0], dateRange[1]]);
          }}
        >
          {store.siteId}
        </Button>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (value: string) => dayjs(value).format('DD.MM.YYYY'),
    },
    {
      title: 'Тип',
      dataIndex: 'isFact',
      key: 'isFact',
      render: (flag: boolean) => <Tag color={flag ? 'blue' : 'green'}>{flag ? 'Факт' : 'Прогноз'}</Tag>,
    },
    {
      title: 'Объём, м³',
      dataIndex: 'overallVolume',
      key: 'overallVolume',
      render: (value: number) => value.toFixed(3),
    },
    {
      title: 'Вес, кг',
      dataIndex: 'overallWeight',
      key: 'overallWeight',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Пустой вывоз',
      dataIndex: 'isEmpty',
      key: 'isEmpty',
      render: (flag: boolean) => <Tag color={flag ? 'default' : 'processing'}>{flag ? 'Нет загрузки' : 'Есть накопление'}</Tag>,
    },
    {
      title: 'Заполнение',
      dataIndex: 'fillPct',
      key: 'fillPct',
      render: (value: number | null | undefined) => renderFill(value),
    },
    {
      title: 'Риск переполн.',
      dataIndex: 'overflowProb',
      key: 'overflowProb',
      render: (value: number | null | undefined) => renderRisk(value),
    },
    {
      title: 'Посл. вывоз',
      dataIndex: 'lastServiceDate',
      key: 'lastServiceDate',
      render: (value: string | null | undefined) =>
        value ? dayjs(value).format('DD.MM.YYYY') : <Typography.Text type="secondary">—</Typography.Text>,
    },
  ];

  const allSitesColumns: ColumnsType<RollingForecastRow> = [
    {
      title: 'Код КП',
      dataIndex: 'site_id',
      key: 'site_id',
      width: 120,
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: (value: string) => dayjs(value).format('DD.MM.YYYY'),
    },
    {
      title: 'Прогноз, кг',
      dataIndex: 'pred_mass_kg',
      key: 'pred_mass_kg',
      width: 120,
      render: (value: number) => (value != null ? value.toFixed(1) : '—'),
    },
    {
      title: 'Заполн., %',
      dataIndex: 'fill_pct',
      key: 'fill_pct',
      width: 110,
      render: (value: number | null) =>
        value != null ? `${(value * 100).toFixed(1)}%` : '—',
    },
    {
      title: 'Факт, м³',
      dataIndex: 'actual_m3',
      key: 'actual_m3',
      width: 110,
      render: (value: number | null | undefined) => (value != null ? value.toFixed(2) : '—'),
    },
    {
      title: 'Ошибка, %',
      dataIndex: 'error_pct',
      key: 'error_pct',
      width: 110,
      render: (value: number | null | undefined) => (value != null ? `${value.toFixed(1)}%` : '—'),
    },
  ];

  const allSitesSummary = useMemo(() => {
    if (!store.rollingSummary) {
      return null;
    }
    const siteCount = store.rollingSummary.site_count.toLocaleString('ru-RU');
    const totalForecast = formatVolume(store.rollingSummary.total_forecast_m3);
    return `${siteCount} площадок · ${totalForecast} м³`;
  }, [store.rollingSummary]);

  const handleSubmit = () => {
    // Update store with cutoff and horizon
    if (rollingActive) {
      store.setCutoffDate(dataCutoff ? dataCutoff.format('YYYY-MM-DD') : null);
      store.setHorizonDays(horizonDays);
    } else {
      store.setCutoffDate(null);
    }
    store.setRollingMode(rollingActive);

    store.setDateRange(
      dateRange[0].format('YYYY-MM-DD'),
      dateRange[1].format('YYYY-MM-DD')
    );
    store.load();
  };

  const handleTableExport = () => {
    if (!tableRows.length) {
      return;
    }
    const filename = `forecast_${store.siteId}_${dateRange[0].format('YYYYMMDD')}_${dateRange[1].format('YYYYMMDD')}.csv`;
    exportToCsv(
      filename,
      tableRows.map((row) => ({
        site_id: store.siteId,
        date: row.date,
        type: row.isFact ? 'fact' : 'forecast',
        overall_volume_m3: row.overallVolume.toFixed(3),
        overall_weight_kg: row.overallWeight.toFixed(2),
        is_empty: row.isEmpty ? 1 : 0,
        fill_pct: row.fillPct ?? '',
        overflow_prob: row.overflowProb ?? '',
        last_service_dt: row.lastServiceDate ?? '',
      }))
    );
  };

  const handleExportAllSites = () => {
    if (!store.rollingSummary || store.allSitesData.length === 0) {
      return;
    }

    const summary = store.rollingSummary;
    const coverage = Number(
      summary && 'accuracy_coverage_pct' in summary
        ? (summary.accuracy_coverage_pct ?? 0)
        : 0
    );
    const wape = (
      summary && 'accuracy_wape' in summary
        ? summary.accuracy_wape ?? undefined
        : undefined
    ) as number | undefined;

    const request = {
      cutoffDate: store.cutoffDate ?? '',
      horizonDays: store.horizonDays,
      siteCount: summary.site_count,
      totalForecast: summary.total_forecast_m3,
      coverage,
      wape,
      data: store.allSitesData.map(row => ({
        date: row.date,
        site_id: row.site_id,
        forecast_m3: row.pred_mass_kg / 1000,
        fill_pct: row.fill_pct,
        actual_m3: row.actual_m3,
        error_pct: row.error_pct,
      })),
    } as import('@/utils/excelExport').ExcelExportRequest;

    const filename = `forecast_all_${store.cutoffDate ?? 'unknown'}_${store.horizonDays}d.xlsx`;
    exportToExcel(request, filename);
  };

  const gallerySelection = isCustomSelection || isAllSitesSelection ? null : siteSelection;
  const cutoffDisplay = dataCutoff ?? historyMeta.overallLastServiceDate;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Typography.Title level={4} style={{ marginBottom: 8 }}>
          Галерея площадок
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Выберите карточку, чтобы подставить рекомендованный site_id и неделю. Карточки показывают
          диапазон заполнения и WAPE за выбранный период.
        </Typography.Paragraph>
        <SiteGallery selectedSiteId={gallerySelection} onSelect={handleGallerySelect} />
      </div>

      <Card title="Ручной выбор site_id">
        <Form layout="vertical" onFinish={handleSubmit} initialValues={{ siteId: store.siteId }}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="site_id" required>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Select
                    value={siteSelection}
                    onChange={handleSiteSelect}
                    options={[
                      { label: 'Все площадки', value: ALL_SITES_VALUE },
                      ...siteSelectOptions,
                      { label: 'Другой site_id…', value: CUSTOM_SITE_VALUE },
                    ]}
                    showSearch
                    optionFilterProp="label"
                    style={{ width: '100%' }}
                    placeholder="Выберите площадку"
                  />
                  {isCustomSelection && (
                    <Input
                      value={store.siteId}
                      onChange={(e) => {
                        if (siteSelection !== CUSTOM_SITE_VALUE) {
                          setSiteSelection(CUSTOM_SITE_VALUE);
                        }
                        store.setSiteId(e.target.value);
                      }}
                      placeholder="Введите site_id"
                    />
                  )}
                </Space>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Диапазон дат" required>
                <RangePicker value={dateRange} format="YYYY-MM-DD" onChange={handleRangeChange} allowClear={false} />
                {missingFillHint && (
                  <Typography.Text type="warning" style={{ display: 'block' }}>
                    {missingFillHint}
                  </Typography.Text>
                )}
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Объём ТС, м³">
                <InputNumber
                  value={store.vehicleVolume}
                  min={1}
                  max={60}
                  step={1}
                  onChange={(val) => store.setVehicleVolume(val || 1)}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button type="primary" htmlType="submit" loading={store.loading} block>
                Обновить прогноз
              </Button>
            </Col>
          </Row>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Источник данных: {apiConfig.baseUrl}/api/mytko/forecast
          </Typography.Paragraph>
        </Form>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <Form.Item label="Rolling прогноз">
              <Switch
                checked={rollingActive}
                onChange={(checked) => setRollingEnabled(checked)}
                disabled={isAllSitesSelection}
              />
            </Form.Item>
            <Form.Item label="Срез данных (последняя известная дата)">
              <DatePicker
                value={cutoffDisplay}
                onChange={(value) => setDataCutoff(value ?? null)}
                disabled={!rollingActive}
                disabledDate={(current) => current && current.isAfter(dayjs('2025-05-31'))}
                placeholder="До 31.05.2025"
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Горизонт прогноза">
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Segmented
                  options={HORIZON_OPTIONS}
                  value={horizonDays === -1 || ![7, 30, 90].includes(horizonDays) ? -1 : horizonDays}
                  onChange={(val) => {
                    const v = val as number;
                    if (v === -1) {
                      setHorizonDays(customHorizon);
                    } else {
                      setHorizonDays(v);
                    }
                  }}
                  disabled={!rollingActive}
                />
                {(horizonDays === -1 || ![7, 30, 90].includes(horizonDays)) && (
                  <InputNumber
                    min={1}
                    max={365}
                    value={horizonDays > 0 ? horizonDays : customHorizon}
                    onChange={(val) => {
                      const v = val || 7;
                      setCustomHorizon(v);
                      setHorizonDays(v);
                    }}
                    addonAfter="дней"
                    style={{ width: '100%' }}
                    disabled={!rollingActive}
                  />
                )}
              </Space>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Район">
              <Select
                allowClear
                placeholder="Все районы"
                value={store.districtFilter ?? undefined}
                onChange={(value) => {
                  store.setDistrictFilter(value ?? null);
                }}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={store.availableDistricts.map((district) => ({
                  value: district,
                  label: district,
                }))}
                style={{ width: '100%' }}
                disabled={!rollingActive}
              />
            </Form.Item>
          </Col>
          <Col span={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Typography.Text type="secondary">
              {rollingActive
                ? 'Прогноз строится на данных до выбранного среза; даты после него считаются будущими.'
                : 'Rolling-прогноз отключен — используется выбранный диапазон дат.'}
            </Typography.Text>
          </Col>
        </Row>
        {rollingActive && dataCutoff && (
          <Alert
            type="info"
            message={`Прогноз будет построен на ${horizonDays} дней от ${dataCutoff.format('DD.MM.YYYY')}`}
            style={{ marginTop: 8 }}
          />
        )}
      </Card>

      {store.error && <Alert type="error" message={store.error} />}

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Суммарный объём, м³" value={totals.totalVolume} precision={2} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Суммарный вес, кг" value={totals.totalWeight} precision={1} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Дней с накоплением" value={totals.busyDays} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Точность (WAPE)"
              value={wapePercent ?? 0}
              valueStyle={wapeColor ? { color: wapeColor } : undefined}
              formatter={() => {
                if (accuracy.loading) {
                  return 'Загрузка...';
                }
                if (accuracy.error) {
                  return 'Ошибка';
                }
                if (wapePercent == null) {
                  return '—';
                }
                return `${wapePercent.toFixed(1)}%`;
              }}
            />
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {accuracy.loading && 'Факт / Прогноз: расчёт...'}
              {!accuracy.loading && accuracy.error && `Ошибка: ${accuracy.error}`}
              {!accuracy.loading && !accuracy.error && (
                <>
                  Факт: <strong>{formatVolume(accuracy.data?.actualM3)} м³</strong> · Прогноз:{' '}
                  <strong>{formatVolume(accuracy.data?.forecastM3)} м³</strong>
                </>
              )}
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>

      {showAllSitesTable ? (
        <Card
          title="Все площадки"
          bodyStyle={{ padding: 0 }}
          extra={
            <Space>
              {allSitesSummary && <Typography.Text type="secondary">{allSitesSummary}</Typography.Text>}
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportAllSites}
                disabled={store.allSitesData.length === 0}
              >
                Excel
              </Button>
            </Space>
          }
        >
          <Typography.Paragraph type="secondary" style={{ padding: '12px 16px 0', marginBottom: 0 }}>
            Нажмите на строку, чтобы открыть график “Факт vs Прогноз” для выбранной площадки.
          </Typography.Paragraph>
          <Space style={{ padding: '8px 16px 0', marginBottom: 8 }}>
            <Input
              placeholder="Поиск по ID или адресу"
              prefix={<SearchOutlined />}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              allowClear
              style={{ width: 260 }}
            />
            <Typography.Text type="secondary">
              {store.allSitesTotalRows.toLocaleString('ru-RU')} записей
            </Typography.Text>
          </Space>
          <Table
            dataSource={store.allSitesData}
            columns={allSitesColumns}
            loading={store.loading}
            rowKey={(row) => `${row.site_id}-${row.date}`}
            pagination={{
              current: store.allSitesPage,
              pageSize: store.allSitesPageSize,
              total: store.allSitesTotalRows,
              showSizeChanger: true,
              pageSizeOptions: ['10', '25', '50', '100'],
              showTotal: (total) => `Всего ${total} записей`,
            }}
            onChange={(pagination: TablePaginationConfig) => {
              store.loadRollingAllSites(
                pagination.current || 1,
                pagination.pageSize || store.allSitesPageSize
              );
            }}
            onRow={(record) => ({
              onClick: () => {
                setDialogSite(record.site_id);
                setDialogDate(record.date);
                if (dataCutoff) {
                  const start = dataCutoff.add(1, 'day');
                  const end = dataCutoff.add(horizonDays, 'day');
                  setDialogRange([start, end]);
                } else {
                  setDialogRange([dateRange[0], dateRange[1]]);
                }
              },
              style: { cursor: 'pointer' },
            })}
            size="small"
            scroll={{ x: 760 }}
            locale={{ emptyText: 'Нет данных для выбранного диапазона' }}
          />
        </Card>
      ) : (
        <Card
          title="Детализация прогнозов"
          bodyStyle={{ padding: 0 }}
          extra={
            <Button onClick={handleTableExport} disabled={!tableRows.length}>
              Экспорт CSV
            </Button>
          }
        >
          <Typography.Paragraph type="secondary" style={{ padding: '12px 16px 0', marginBottom: 0 }}>
            Нажмите на site_id, чтобы открыть график “Факт vs Прогноз” с отмеченными вывозами.
          </Typography.Paragraph>
          <Table
            dataSource={tableRows}
            columns={columns}
            loading={store.loading}
            pagination={false}
            locale={{ emptyText: 'Нет данных для выбранного диапазона' }}
          />
        </Card>
      )}
      {dialogSite && (
        <ContainerHistoryDialog
          siteId={dialogSite}
          open
          onClose={() => {
            setDialogSite(null);
            setDialogDate(null);
          }}
          vehicleVolume={store.vehicleVolume}
          initialRange={dialogRange}
          cutoffDate={dataCutoff ?? undefined}
          address={dialogPreset?.address}
          district={dialogPreset?.district}
          feedbackDate={dialogDate ?? undefined}
        />
      )}
      <MetricsUpload />
      <IterationDashboard />
      <FeedbackDashboard />
    </Space>
  );
});

export default ForecastPage;
