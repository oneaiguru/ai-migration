import React from 'react';

export interface FillBarProps {
  pct: number; // 0..1
  width?: number; // px width container
  height?: number; // px height
  showText?: boolean; // default true
  className?: string;
}

export const FillBar: React.FC<FillBarProps> = ({ pct, width = 64, height = 6, showText = true, className }) => {
  const clamped = Math.max(0, Math.min(1, pct ?? 0));
  const pctStr = `${Math.round(clamped * 100)}%`;
  const color = clamped >= 0.8 ? 'bg-red-500' : clamped >= 0.6 ? 'bg-orange-500' : 'bg-green-500';
  const containerStyle: React.CSSProperties = { width, height };
  const innerStyle: React.CSSProperties = { width: pctStr, height };
  return (
    <div className={`flex items-center gap-2 ${className || ''}`.trim()}>
      <div className="bg-gray-200 rounded-full" style={containerStyle}>
        <div className={`${color} rounded-full`} style={innerStyle} />
      </div>
      {showText && (
        <span className="text-xs font-mono min-w-[35px]" aria-label={`Заполнение: ${pctStr}`}>{pctStr}</span>
      )}
    </div>
  );
};

