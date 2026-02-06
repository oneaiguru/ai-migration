# TASK-45: Feedback Dashboard

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 35min

## Goal
React component showing helpful vs unhelpful forecast sites.

## Code Changes

### 1. File: src/components/FeedbackDashboard.tsx (NEW)

```typescript
import { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Empty, Spin, Statistic } from 'antd';
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiConfig } from '@/api/client';

interface FeedbackSummary {
  site_id: string;
  helpful_count: number;
  unhelpful_count: number;
  total: number;
  useful_rate: number;
}

export function FeedbackDashboard() {
  const [summary, setSummary] = useState<FeedbackSummary[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiConfig.baseUrl}/api/mytko/feedback_summary`)
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary || []);
        setStats(data.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Card><Spin /></Card>;
  if (summary.length === 0) {
    return <Card title="Обратная связь"><Empty description="Нет отзывов" /></Card>;
  }

  const helpful = summary.filter((s) => s.useful_rate > 0.5);
  const unhelpful = summary.filter((s) => s.useful_rate < 0.5);

  const columns = [
    { title: 'Site ID', dataIndex: 'site_id' },
    { title: '👍', dataIndex: 'helpful_count' },
    { title: '👎', dataIndex: 'unhelpful_count' },
    { title: 'Полезность', dataIndex: 'useful_rate', render: (v: number) => `${(v * 100).toFixed(0)}%` },
  ];

  return (
    <div>
      <Card title="Обратная связь" style={{ marginTop: 16 }}>
        {stats && (
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic title="Всего отзывов" value={stats.total_feedback} />
            </Col>
            <Col span={6}>
              <Statistic
                title="Полезные"
                value={stats.helpful_count}
                valueStyle={{ color: '#3f8600' }}
                prefix={<LikeOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Неполезные"
                value={stats.unhelpful_count}
                valueStyle={{ color: '#cf1322' }}
                prefix={<DislikeOutlined />}
              />
            </Col>
          </Row>
        )}
      </Card>

      <Card title="Топ полезные площадки" style={{ marginTop: 16 }}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={helpful.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="site_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="helpful_count" fill="#52c41a" name="👍" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Топ неполезные площадки" style={{ marginTop: 16 }}>
        <Table
          dataSource={unhelpful.slice(0, 10)}
          columns={columns}
          rowKey="site_id"
          size="small"
          pagination={false}
        />
      </Card>
    </div>
  );
}
```

### 2. File: scripts/api_app.py

Add endpoint:
```python
@app.get("/api/mytko/feedback_summary")
def get_feedback_summary():
    """Get feedback summary by site."""
    from src.sites.feedback_tracker import FeedbackTracker

    tracker = FeedbackTracker()
    summary = tracker.get_summary()
    stats = tracker.get_stats()

    return {
        "summary": summary.to_dict(orient='records') if not summary.empty else [],
        "stats": stats,
    }
```

### 3. File: src/pages/ForecastPage.tsx

Add import and component:
```typescript
import { FeedbackDashboard } from '@/components/FeedbackDashboard';

// After IterationDashboard:
<FeedbackDashboard />
```

## Acceptance Criteria
- [ ] Dashboard shows when feedback exists
- [ ] Bar chart shows helpful sites
- [ ] Table shows unhelpful sites
- [ ] Stats calculated correctly

---

## On Completion

1. Test with sample feedback
2. Update `/Users/m/ai/progress.md`: Change TASK-45 from 🔴 TODO to 🟢 DONE
3. Commit: "Implement TASK-45: Feedback dashboard"
