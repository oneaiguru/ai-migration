# TASK-34: Metrics Upload (UI + API)

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 35min

## Goal
Web form for Jury to upload metrics.csv from validation script.

## Prerequisites

Add to projects/forecastingrepo/requirements-dev.txt:
```
python-multipart>=0.0.6
```

Install:
```bash
cd projects/forecastingrepo
pip install -r requirements-dev.txt
```

## Code Changes

### 1. File: src/components/MetricsUpload.tsx (NEW)

```typescript
import { useState } from 'react';
import { Upload, Button, Form, InputNumber, Input, message, Card, Alert } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { apiConfig } from '@/api/client';

export function MetricsUpload() {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Выберите файл metrics.csv');
      return;
    }

    const iteration = form.getFieldValue('iteration');
    const notes = form.getFieldValue('notes') || '';

    if (!iteration) {
      message.error('Укажите номер итерации');
      return;
    }

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('metrics_file', fileList[0] as unknown as File);
    formData.append('iteration', String(iteration));
    formData.append('notes', notes);

    try {
      const response = await fetch(`${apiConfig.baseUrl}/api/mytko/ingest_metrics`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          success: true,
          message: `Итерация ${data.iteration} загружена. WAPE: ${(data.wape * 100).toFixed(2)}%`,
        });
        setFileList([]);
        form.resetFields();
      } else {
        const error = await response.text();
        setResult({ success: false, message: error });
      }
    } catch (err) {
      setResult({ success: false, message: String(err) });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card title="Загрузка метрик валидации" style={{ marginTop: 16 }}>
      <Form form={form} layout="vertical" style={{ maxWidth: 400 }}>
        <Form.Item
          name="iteration"
          label="Номер итерации"
          rules={[{ required: true, message: 'Укажите номер' }]}
        >
          <InputNumber min={1} placeholder="1, 2, 3..." style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="notes" label="Заметки">
          <Input.TextArea rows={2} placeholder="Изменения в этой итерации..." />
        </Form.Item>

        <Form.Item label="Файл metrics.csv">
          <Upload
            fileList={fileList}
            beforeUpload={(file) => {
              setFileList([file]);
              return false;
            }}
            onRemove={() => setFileList([])}
            accept=".csv"
          >
            <Button icon={<UploadOutlined />}>Выбрать файл</Button>
          </Upload>
        </Form.Item>

        <Button
          type="primary"
          onClick={handleUpload}
          loading={uploading}
          disabled={fileList.length === 0}
        >
          Загрузить
        </Button>
      </Form>

      {result && (
        <Alert
          type={result.success ? 'success' : 'error'}
          message={result.message}
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
}
```

### 2. File: scripts/api_app.py

Add imports (place in try-block with other FastAPI imports to handle optional python-multipart):
```python
try:
    from fastapi import UploadFile, File, Form
except ImportError:
    raise ImportError("python-multipart required for file uploads. Install with: pip install python-multipart")
```

Add endpoint:
```python
@app.post("/api/mytko/ingest_metrics")
async def ingest_metrics(
    metrics_file: UploadFile = File(...),
    iteration: int = Form(...),
    notes: str = Form(""),
):
    """Ingest metrics CSV from Jury's validation script."""
    import tempfile
    from pathlib import Path
    from src.sites.metrics_tracker import MetricsTracker

    # Save to temp file
    with tempfile.NamedTemporaryFile(mode='wb', suffix='.csv', delete=False) as f:
        content = await metrics_file.read()
        f.write(content)
        temp_path = Path(f.name)

    try:
        tracker = MetricsTracker()
        tracker.ingest_validation_csv(
            metrics_csv=temp_path,
            iteration=iteration,
            notes=notes,
        )

        history = tracker.get_history()
        latest = history[history['iteration'] == iteration].iloc[0]

        return {
            "status": "ok",
            "iteration": iteration,
            "wape": float(latest['overall_wape']),
            "within_20_pct": float(latest['within_20_pct']),
        }
    finally:
        temp_path.unlink(missing_ok=True)
```

### 3. File: src/pages/ForecastPage.tsx

Add import:
```typescript
import { MetricsUpload } from '@/components/MetricsUpload';
```

Add component after main content (before closing Space):
```typescript
<MetricsUpload />
```

## Tests

```python
# tests/test_metrics_upload.py

from fastapi.testclient import TestClient
import tempfile
from pathlib import Path

def test_ingest_metrics_endpoint():
    """Test metrics upload endpoint."""
    from scripts.api_app import app
    client = TestClient(app)

    csv_content = """date_generated,overall_wape,total_forecast_m3,total_actual_m3,records_evaluated,sites_evaluated,within_10_pct,within_20_pct,within_50_pct,worst_sites,best_sites
2025-12-28T10:00:00,0.0823,123456.78,125000.00,5400,100,45.2,72.8,95.0,38105070|38105071,38100001|38100002"""

    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        f.write(csv_content)
        temp_path = Path(f.name)

    try:
        with open(temp_path, 'rb') as f:
            response = client.post(
                '/api/mytko/ingest_metrics',
                files={'metrics_file': ('metrics.csv', f, 'text/csv')},
                data={'iteration': '1', 'notes': 'Test'},
            )

        assert response.status_code == 200
        assert response.json()['status'] == 'ok'
    finally:
        temp_path.unlink(missing_ok=True)
```

## Acceptance Criteria
- [ ] python-multipart installed
- [ ] MetricsUpload component renders
- [ ] File picker accepts .csv only
- [ ] Upload sends to /api/mytko/ingest_metrics
- [ ] Success shows WAPE result
- [ ] Data persisted in metrics_history.parquet

---

## On Completion

1. Install: `pip install python-multipart`
2. Run tests: `pytest tests/test_metrics_upload.py -v`
3. Test manually in browser
4. Update `/Users/m/ai/progress.md`: Change TASK-34 from 🔴 TODO to 🟢 DONE
5. Commit: "Implement TASK-34: Metrics upload"
