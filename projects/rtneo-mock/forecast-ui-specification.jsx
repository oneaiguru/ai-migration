import React, { useState } from 'react';
import { Modal, Radio, DatePicker, Button, Card, Row, Col, Tooltip } from 'antd';

/**
 * ПРОГНОЗ ОБЪЕМОВ НА КП - UI SPECIFICATION
 * Based on PDF: "Прогноз_объемов_на_КП.pdf"
 * 
 * This is a REFERENCE IMPLEMENTATION showing exact layout, colors, and components
 * for the coding agent to implement in the production system.
 */

const ForecastUISpecification = () => {
  const [view, setView] = useState('daily');
  const [dialogVisible, setDialogVisible] = useState(true);

  // SAMPLE DATA matching PDF structure
  const historicalData = [
    { date: '2024-11-01', accumulation: 2.1, collection: null },
    { date: '2024-11-02', accumulation: 2.3, collection: null },
    { date: '2024-11-03', accumulation: 2.8, collection: null },
    { date: '2024-11-04', accumulation: 3.2, collection: null },
    { date: '2024-11-05', accumulation: 1.8, collection: 12.5 }, // Collection event
    { date: '2024-11-06', accumulation: 2.0, collection: null },
    { date: '2024-11-07', accumulation: 2.4, collection: null },
  ];

  const forecastData = [
    { date: '2024-11-08', accumulation: 2.6 },
    { date: '2024-11-09', accumulation: 2.8 },
    { date: '2024-11-10', accumulation: 3.0 },
    { date: '2024-11-11', accumulation: 3.2 },
    { date: '2024-11-12', accumulation: 3.3 },
    { date: '2024-11-13', accumulation: 2.1 },
    { date: '2024-11-14', accumulation: 2.4 },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: 32 }}>Спецификация UI: Прогноз объемов на КП</h1>

      {/* SPECIFICATION DOCUMENT */}
      <Card title="📋 Component Specification" style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'monospace', lineHeight: 1.8 }}>
          <h3>🎨 COLOR PALETTE (EXACT VALUES FROM PDF):</h3>
          <ul>
            <li><span style={{background: '#1890ff', color: 'white', padding: '2px 8px', borderRadius: 4}}>#1890ff</span> - Historical accumulation bars (blue)</li>
            <li><span style={{background: '#52c41a', color: 'white', padding: '2px 8px', borderRadius: 4}}>#52c41a</span> - Forecast accumulation bars (green)</li>
            <li><span style={{background: '#ff4d4f', color: 'white', padding: '2px 8px', borderRadius: 4}}>#ff4d4f</span> - Collection event dots (red)</li>
            <li><span style={{background: '#f0f2f5', padding: '2px 8px', borderRadius: 4, border: '1px solid #d9d9d9'}}>#f0f2f5</span> - Chart background</li>
          </ul>

          <h3>🏗️ ANT DESIGN COMPONENTS MAPPING:</h3>
          <pre>{`
<Modal>                          // Main dialog container
  <Modal.Header>
    <Radio.Group>               // View toggle: За сутки/Неделю/Месяц
      <Radio.Button>За сутки</Radio.Button>
      <Radio.Button>Неделю</Radio.Button>
      <Radio.Button>Месяц</Radio.Button>
    </Radio.Group>
    <DatePicker.RangePicker>    // Date range selector
  </Modal.Header>

  <Modal.Body>
    <div className="chart-container">
      {/* Blue bars: historical */}
      {/* Green bars: forecast */}
      {/* Red dots: collection events */}
    </div>
  </Modal.Body>

  <Modal.Footer>
    <Statistic>                 // Summary stats
      Объем факт: X м³
      Объем прогноз: Y м³
    </Statistic>
    <Button>Отменить</Button>
    <Button type="primary">Сохранить</Button>
  </Modal.Footer>
</Modal>
          `}</pre>

          <h3>📊 DATA STRUCTURE:</h3>
          <pre>{`
interface HistoricalDataPoint {
  date: string;              // ISO date format
  accumulation: number;      // Daily accumulation in m³
  collection: number | null; // Collection volume if occurred
}

interface ForecastDataPoint {
  date: string;
  accumulation: number;      // Predicted accumulation in m³
}

interface ChartData {
  historical: HistoricalDataPoint[];
  forecast: ForecastDataPoint[];
  siteId: string;
  dateRange: [string, string];
}
          `}</pre>

          <h3>🎯 KEY INTERACTIONS:</h3>
          <ul>
            <li><strong>Hover on bar:</strong> Show tooltip "ДД.ММ: Факт X м³" or "Прогноз Y м³"</li>
            <li><strong>Hover on dot:</strong> Show "Вывоз ВТ 23 АПР. 2024\nРейсов: 2\nОбъем: 163.70 м³"</li>
            <li><strong>View toggle:</strong> Re-aggregate data (daily → weekly → monthly sums)</li>
            <li><strong>Date change:</strong> Fetch new forecast data from API</li>
          </ul>

          <h3>📐 LAYOUT MEASUREMENTS:</h3>
          <ul>
            <li>Modal width: 800px</li>
            <li>Chart height: 320px</li>
            <li>Bar width: 24px (daily), 48px (weekly), 72px (monthly)</li>
            <li>Bar spacing: 8px gap</li>
            <li>Legend position: Top right</li>
            <li>Bottom stats: 60px height footer</li>
          </ul>
        </div>
      </Card>

      {/* VISUAL MOCKUP */}
      <Card title="🎨 Visual Mockup - История и прогноз объемов" style={{ marginBottom: 24 }}>
        <Modal
          title="Объем накопления на КП"
          open={dialogVisible}
          onCancel={() => setDialogVisible(false)}
          width={800}
          footer={[
            <Button key="cancel">Отменить</Button>,
            <Button key="save" type="primary">Сохранить</Button>
          ]}
        >
          {/* TOOLBAR */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col>
              <Radio.Group value={view} onChange={(e) => setView(e.target.value)} buttonStyle="solid">
                <Radio.Button value="daily">За сутки</Radio.Button>
                <Radio.Button value="weekly">Неделю</Radio.Button>
                <Radio.Button value="monthly">Месяц</Radio.Button>
              </Radio.Group>
            </Col>
            <Col flex={1}>
              <DatePicker.RangePicker 
                style={{ width: '100%' }}
                format="DD.MM.YYYY"
              />
            </Col>
          </Row>

          {/* CHART AREA */}
          <div style={{ 
            background: '#fafafa',
            padding: 24,
            borderRadius: 8,
            marginBottom: 16,
            position: 'relative',
            height: 320
          }}>
            {/* Y-axis label */}
            <div style={{
              position: 'absolute',
              left: 8,
              top: 8,
              fontSize: 12,
              color: '#8c8c8c'
            }}>
              м³
            </div>

            {/* Chart bars container */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              height: '100%',
              gap: 8,
              paddingTop: 40
            }}>
              {/* HISTORICAL BARS (BLUE) */}
              {historicalData.map((point, idx) => (
                <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Collection dot (if exists) */}
                  {point.collection && (
                    <Tooltip title={`Вывоз ${point.date}\nОбъем: ${point.collection} м³`}>
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: '#ff4d4f',
                        marginBottom: 4,
                        cursor: 'pointer',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }} />
                    </Tooltip>
                  )}
                  
                  {/* Accumulation bar */}
                  <Tooltip title={`${point.date}: Факт ${point.accumulation} м³`}>
                    <div style={{
                      width: 24,
                      height: `${point.accumulation * 30}px`,
                      background: '#1890ff',
                      borderRadius: '4px 4px 0 0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }} 
                    onMouseEnter={(e) => e.currentTarget.style.background = '#40a9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#1890ff'}
                    />
                  </Tooltip>

                  {/* Date label */}
                  <div style={{
                    fontSize: 10,
                    color: '#8c8c8c',
                    marginTop: 4,
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'top left',
                    whiteSpace: 'nowrap'
                  }}>
                    {new Date(point.date).getDate()}.{new Date(point.date).getMonth() + 1}
                  </div>
                </div>
              ))}

              {/* FORECAST BARS (GREEN) */}
              {forecastData.map((point, idx) => (
                <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Tooltip title={`${point.date}: Прогноз ${point.accumulation} м³`}>
                    <div style={{
                      width: 24,
                      height: `${point.accumulation * 30}px`,
                      background: '#52c41a',
                      borderRadius: '4px 4px 0 0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#73d13d'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#52c41a'}
                    />
                  </Tooltip>

                  <div style={{
                    fontSize: 10,
                    color: '#52c41a',
                    fontWeight: 600,
                    marginTop: 4,
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'top left',
                    whiteSpace: 'nowrap'
                  }}>
                    {new Date(point.date).getDate()}.{new Date(point.date).getMonth() + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* LEGEND */}
            <div style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'white',
              padding: '8px 12px',
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontSize: 12
            }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ display: 'inline-block', width: 16, height: 12, background: '#1890ff', marginRight: 8, borderRadius: 2 }} />
                Факт
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ display: 'inline-block', width: 16, height: 12, background: '#52c41a', marginRight: 8, borderRadius: 2 }} />
                Прогноз
              </div>
              <div>
                <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ff4d4f', marginRight: 8, borderRadius: '50%' }} />
                Вывоз
              </div>
            </div>
          </div>

          {/* SUMMARY STATS */}
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small">
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Объем факт с 01.11.2024 до 07.11.2024</div>
                <div style={{ fontSize: 24, fontWeight: 600 }}>16.4 м³</div>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small">
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Объем прогноз с 08.11.2024 до 14.11.2024</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>19.4 м³</div>
              </Card>
            </Col>
          </Row>
        </Modal>
      </Card>

      {/* IMPLEMENTATION CHECKLIST */}
      <Card title="✅ Implementation Checklist for Coding Agent">
        <div style={{ fontFamily: 'monospace' }}>
          <h3>Phase 1: Component Structure</h3>
          <pre>{`
[ ] Create ContainerHistoryDialog.tsx component
[ ] Create ChartArea.tsx subcomponent  
[ ] Create BarChart.tsx with historical/forecast rendering
[ ] Create CollectionDotOverlay.tsx for pickup events
[ ] Set up SCSS module: ContainerHistoryDialog.module.scss
          `}</pre>

          <h3>Phase 2: Data Integration</h3>
          <pre>{`
[ ] Create useForecastData hook
[ ] Integrate with /api/mytko/forecast endpoint
[ ] Handle date range changes
[ ] Aggregate data for weekly/monthly views
[ ] Cache forecast results in MobX store
          `}</pre>

          <h3>Phase 3: Interactions</h3>
          <pre>{`
[ ] Implement bar hover tooltips (Ant Tooltip component)
[ ] Implement collection dot tooltips with route details
[ ] Add view toggle functionality (daily/weekly/monthly)
[ ] Add CSV export button (like in original UI)
[ ] Sync with existing site gallery selection
          `}</pre>

          <h3>Phase 4: Styling</h3>
          <pre>{`
[ ] Match exact colors: #1890ff, #52c41a, #ff4d4f
[ ] Set bar widths: 24px (daily), 48px (weekly), 72px (monthly)
[ ] Add hover states with color transitions
[ ] Ensure responsive behavior on smaller screens
[ ] Match PDF mockup spacing/padding
          `}</pre>

          <h3>Phase 5: Integration Points</h3>
          <pre>{`
[ ] Add menu item "История и прогноз объемов" to KP registry
[ ] Wire up to existing site selection in gallery
[ ] Ensure WAPE accuracy stats display
[ ] Add to dashboard graph (future dates in green)
[ ] Test with non-100% fill datasets (38111698, 38116709)
          `}</pre>
        </div>
      </Card>

      {/* API CONTRACT */}
      <Card title="🔌 API Contract" style={{ marginTop: 24 }}>
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
{`GET /api/mytko/forecast
Query params:
  site_id: string          // Container platform ID
  start_date: string       // ISO date (YYYY-MM-DD)
  end_date: string         // ISO date
  
Response:
{
  "site_id": "38127141",
  "historical": [
    {
      "date": "2024-11-01",
      "accumulation": 2.1,
      "collection": null
    },
    {
      "date": "2024-11-05",
      "accumulation": 1.8,
      "collection": 12.5  // Collection occurred this day
    }
  ],
  "forecast": [
    {
      "date": "2024-11-08",
      "accumulation": 2.6
    }
  ],
  "summary": {
    "actual_volume": 16.4,
    "forecast_volume": 19.4,
    "wape": 27.8
  }
}

GET /api/mytko/site_accuracy
Query params:
  site_id: string
  
Response:
{
  "site_id": "38127141", 
  "wape": 27.8,
  "last_updated": "2024-11-20T10:00:00Z"
}`}
        </pre>
      </Card>

      {/* SCSS EXAMPLE */}
      <Card title="🎨 SCSS Module Example" style={{ marginTop: 24 }}>
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
{`// ContainerHistoryDialog.module.scss

.dialog {
  :global(.ant-modal-body) {
    padding: 24px;
  }
}

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  .viewToggle {
    flex-shrink: 0;
  }
  
  .dateRange {
    flex: 1;
  }
}

.chartContainer {
  background: #fafafa;
  padding: 24px;
  border-radius: 8px;
  min-height: 320px;
  position: relative;
}

.barChart {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
  gap: 8px;
  padding-top: 40px;
}

.bar {
  width: 24px;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  transition: all 0.2s;
  
  &.historical {
    background: #1890ff;
    
    &:hover {
      background: #40a9ff;
    }
  }
  
  &.forecast {
    background: #52c41a;
    
    &:hover {
      background: #73d13d;
    }
  }
}

.collectionDot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff4d4f;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  margin-bottom: 4px;
}

.legend {
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 12px;
}

.summaryStats {
  margin-top: 16px;
  
  .statCard {
    text-align: center;
    
    .label {
      font-size: 12px;
      color: #8c8c8c;
      margin-bottom: 4px;
    }
    
    .value {
      font-size: 24px;
      font-weight: 600;
      
      &.forecast {
        color: #52c41a;
      }
    }
  }
}`}
        </pre>
      </Card>
    </div>
  );
};

export default ForecastUISpecification;
