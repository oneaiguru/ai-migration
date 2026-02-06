# TASK-35: Iteration Dashboard

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 35min

## Goal
Show WAPE trend across algorithm iterations with line chart.

## Dependencies
- TASK-34 must be completed first (needs metrics data)

## Code Changes

### 1. File: src/components/IterationDashboard.tsx (NEW)

```typescript
import { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Table, Empty, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { apiConfig } from '@/api/client';

interface IterationRow {
  iteration: number;
  timestamp: string;
  overall_wape: number;
  within_20_pct: number;
  notes: string;
}

export function IterationDashboard() {
  const [history, setHistory] = useState<IterationRow[]>([]);
  const [improvement, setImprovement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiConfig.baseUrl}/api/mytko/metrics_history`)
      .then((r) => r.json())
      .then((data) => {
        setHistory(data.rows || []);
        setImprovement(data.improvement);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Card><Spin /></Card>;
  if (history.length === 0) {
    return <Card title="Прогресс итераций"><Empty description="Загрузите metrics.csv" /></Card>;
  }

  const chartData = history.map((row) => ({
    iteration: `#${row.iteration}`,
    wape: row.overall_wape * 100,
    within20: row.within_20_pct,
  }));

  const columns = [
    { title: '#', dataIndex: 'iteration', width: 50 },
    { title: 'WAPE', dataIndex: 'overall_wape', render: (v: number) => `${(v * 100).toFixed(2)}%` },
    { title: '≤20%', dataIndex: 'within_20_pct', render: (v: number) => `${v.toFixed(1)}%` },
    { title: 'Заметки', dataIndex: 'notes' },
  ];

  return (
    <Card title="Прогресс итераций" style={{ marginTop: 16 }}>
      {improvement && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Statistic title="Итераций" value={improvement.iterations} />
          </Col>
          <Col span={8}>
            <Statistic
              title="Улучшение WAPE"
              value={Math.abs(improvement.wape_improvement_pct)}
              precision={1}
              suffix="%"
              valueStyle={{ color: improvement.wape_improvement_pct > 0 ? '#3f8600' : '#cf1322' }}
              prefix={improvement.wape_improvement_pct > 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            />
          </Col>
        </Row>
      )}

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="wape" name="WAPE %" stroke="#ff4d4f" />
          <Line type="monotone" dataKey="within20" name="≤20%" stroke="#52c41a" />
        </LineChart>
      </ResponsiveContainer>

      <Table dataSource={history} columns={columns} rowKey="iteration" size="small" pagination={false} />
    </Card>
  );
}
```

### 2. File: scripts/api_app.py

Add endpoint:
```python
@app.get("/api/mytko/metrics_history")
def get_metrics_history():
    """Get iteration history for dashboard."""
    from src.sites.metrics_tracker import MetricsTracker

    tracker = MetricsTracker()
    history = tracker.get_history()
    improvement = tracker.get_improvement()

    return {
        "rows": history.to_dict(orient='records') if not history.empty else [],
        "improvement": improvement if improvement else None,
    }
```

### 3. File: src/pages/ForecastPage.tsx

Add import:
```typescript
import { IterationDashboard } from '@/components/IterationDashboard';
```

Add after MetricsUpload:
```typescript
<IterationDashboard />
```

## Acceptance Criteria
- [ ] Dashboard shows when metrics exist
- [ ] Line chart displays WAPE trend
- [ ] Table shows all iterations
- [ ] Improvement stats calculated correctly

---

## On Completion

1. Test with uploaded metrics
2. Update `/Users/m/ai/progress.md`: Change TASK-35 from 🔴 TODO to 🟢 DONE
3. Commit: "Implement TASK-35: Iteration dashboard"
