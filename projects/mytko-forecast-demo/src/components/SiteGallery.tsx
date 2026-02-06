import { Card, Col, Progress, Row, Typography } from 'antd';
import { DEMO_SITES, type DemoSitePreset } from '@/constants/demoSites';

export interface SiteGalleryProps {
  selectedSiteId: string | null;
  onSelect: (siteId: string) => void;
}

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const SiteCard = ({
  preset,
  active,
  onSelect,
}: {
  preset: DemoSitePreset;
  active: boolean;
  onSelect: (siteId: string) => void;
}) => {
  const wapeLabel = `WAPE ${formatPercent(preset.wape * 100)}`;
  return (
    <Card
      hoverable
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(preset.id);
        }
      }}
      onClick={() => onSelect(preset.id)}
      style={{
        minHeight: 170,
        borderColor: active ? '#1890ff' : undefined,
        boxShadow: active ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : undefined,
      }}
    >
      <Typography.Text strong>{preset.id}</Typography.Text>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 4 }}>
        {preset.district}
      </Typography.Paragraph>
      <Typography.Paragraph ellipsis style={{ marginBottom: 12 }}>
        {preset.address}
      </Typography.Paragraph>
      <Progress
        percent={preset.fillEndPct}
        success={{ percent: preset.fillStartPct }}
        size="small"
        showInfo={false}
      />
      <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
        {formatPercent(preset.fillStartPct)} → {formatPercent(preset.fillEndPct)}
      </Typography.Text>
      <Typography.Text>{wapeLabel}</Typography.Text>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        {preset.start} — {preset.end}
      </Typography.Paragraph>
    </Card>
  );
};

export function SiteGallery({ selectedSiteId, onSelect }: SiteGalleryProps) {
  return (
    <Row gutter={[16, 16]}>
      {DEMO_SITES.map((preset) => (
        <Col key={preset.id} xs={24} sm={12} lg={6}>
          <SiteCard preset={preset} active={preset.id === selectedSiteId} onSelect={onSelect} />
        </Col>
      ))}
    </Row>
  );
}
