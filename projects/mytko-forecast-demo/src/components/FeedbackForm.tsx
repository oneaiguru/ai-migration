import { useState } from 'react';
import { Form, Button, Select, Input, message, Card, Typography } from 'antd';
import { apiConfig } from '@/api/client';

const REASONS = [
  'Прогноз точный',
  'Прогноз завышен',
  'Прогноз занижен',
  'Неправильная категория',
  'Не применимо к нашему маршруту',
  'Другое',
];

type FeedbackFormProps = {
  siteId: string;
  date: string;
};

export function FeedbackForm({ siteId, date }: FeedbackFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { useful: boolean; reason: string; dispatcher_note?: string }) => {
    if (!siteId || !date) {
      message.error('Нужно выбрать площадку и дату');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${apiConfig.baseUrl}/api/mytko/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          site_id: siteId,
          date,
          useful: String(values.useful),
          reason: values.reason,
          dispatcher_note: values.dispatcher_note ?? '',
        }).toString(),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `API ${response.status}`);
      }

      message.success('Спасибо за отзыв!');
      form.resetFields();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Не удалось отправить отзыв');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Оценить прогноз" size="small">
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        Площадка: <strong>{siteId}</strong> · Дата: <strong>{date}</strong>
      </Typography.Paragraph>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="useful" label="Полезен?" rules={[{ required: true, message: 'Выберите оценку' }]}>
          <Select
            placeholder="Выберите"
            options={[
              { label: '👍 Да', value: true },
              { label: '👎 Нет', value: false },
            ]}
          />
        </Form.Item>

        <Form.Item name="reason" label="Причина" rules={[{ required: true, message: 'Укажите причину' }]}>
          <Select
            placeholder="Выберите причину"
            options={REASONS.map((reason) => ({ label: reason, value: reason }))}
          />
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
