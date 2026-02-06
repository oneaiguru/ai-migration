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
