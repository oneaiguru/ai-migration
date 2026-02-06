# TASK-46: Dispatcher Annotation

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 30min

## Goal
Add reason dropdown and notes to feedback form.

## Code Changes

### 1. File: src/components/FeedbackForm.tsx (NEW)

```typescript
import { useState } from 'react';
import { Form, Button, Select, Input, message, Card } from 'antd';
import { apiConfig } from '@/api/client';

const REASONS = [
  'Прогноз точный',
  'Прогноз завышен',
  'Прогноз занижен',
  'Неправильная категория',
  'Не применимо к нашему маршруту',
  'Другое',
];

export function FeedbackForm({ siteId, date }: { siteId: string; date: string }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/api/mytko/feedback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            site_id: siteId,
            date: date,
            useful: String(values.useful),
            reason: values.reason,
            dispatcher_note: values.dispatcher_note,
          }).toString(),
        }
      );

      if (response.ok) {
        message.success('Спасибо за отзыв!');
        form.resetFields();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Оценить прогноз" style={{ marginTop: 8 }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="useful" label="Полезен?" rules={[{ required: true }]}>
          <Select placeholder="Выберите" options={[
            { label: '👍 Да', value: true },
            { label: '👎 Нет', value: false },
          ]} />
        </Form.Item>

        <Form.Item name="reason" label="Причина" rules={[{ required: true }]}>
          <Select placeholder="Выберите причину" options={REASONS.map(r => ({ label: r, value: r }))} />
        </Form.Item>

        <Form.Item name="dispatcher_note" label="Комментарий диспетчера">
          <Input.TextArea rows={2} placeholder="Дополнительная информация..." />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          Отправить
        </Button>
      </Form>
    </Card>
  );
}
```

### 2. File: scripts/api_app.py

Modify endpoint:
```python
@app.post("/api/mytko/feedback")
async def submit_feedback(
    site_id: str = Query(...),
    date: str = Query(...),
    useful: bool = Query(...),
    reason: str = Query(""),
    dispatcher_note: str = Query(""),
):
    """Submit feedback with dispatcher annotation."""
    from src.sites.feedback_tracker import FeedbackTracker

    tracker = FeedbackTracker()
    feedback_id = tracker.add_feedback(
        site_id=site_id,
        date=date,
        useful=useful,
        reason=reason,
        note=dispatcher_note,
    )

    return {"status": "ok", "feedback_id": feedback_id}
```

### 3. File: src/sites/feedback_tracker.py

Update to store reason and dispatcher_note:
```python
def add_feedback(
    self,
    site_id: str,
    date: str,
    useful: bool,
    reason: str = "",
    note: str = "",
) -> str:
    """Add feedback record with dispatcher annotation."""
    # ... existing code ...
    record = pd.DataFrame([{
        'feedback_id': f"{site_id}_{date}_{datetime.now().isoformat()}",
        'site_id': site_id,
        'date': date,
        'useful': useful,
        'reason': reason,
        'dispatcher_note': note,
        'timestamp': datetime.now(),
    }])
    # ... rest of method ...
```

## Acceptance Criteria
- [ ] Form renders in UI
- [ ] Reason dropdown with predefined options
- [ ] Dispatcher notes textarea
- [ ] Reason and notes stored in feedback.parquet

---

## On Completion

1. Test form submission
2. Verify reason + notes stored
3. Update `/Users/m/ai/progress.md`: Change TASK-46 from 🔴 TODO to 🟢 DONE
4. Commit: "Implement TASK-46: Dispatcher annotation"
