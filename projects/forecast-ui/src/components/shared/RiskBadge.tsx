import React from 'react';

export interface RiskBadgeProps {
  risk: number; // 0..1
  showLabel?: boolean; // default true
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, showLabel = true, className }) => {
  const pct = Math.max(0, Math.min(100, Math.round((risk ?? 0) * 100)));
  const cls =
    risk >= 0.8
      ? 'bg-red-100 text-red-800 border-red-300'
      : risk >= 0.5
      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
      : 'bg-green-100 text-green-800 border-green-300';
  const label = risk >= 0.8 ? 'Высокий' : risk >= 0.5 ? 'Средний' : 'Низкий';
  return (
    <span
      className={`risk-badge ${cls} ${className || ''}`.trim()}
      title={`Вероятность переполнения: ${pct}%`}
      aria-label={`Риск переполнения: ${label} (${pct}%)`}
    >
      {showLabel ? `${label} ${pct}%` : `${pct}%`}
    </span>
  );
};

