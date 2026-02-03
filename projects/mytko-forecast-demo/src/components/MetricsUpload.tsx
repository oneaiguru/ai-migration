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
