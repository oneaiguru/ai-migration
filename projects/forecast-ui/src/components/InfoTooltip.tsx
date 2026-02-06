import React from 'react';

interface InfoTooltipProps {
  label?: string;
  title: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ label, title }) => {
  return (
    <span className="inline-flex items-center gap-1 align-middle" title={title} aria-label={title}>
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold"
        aria-hidden
      >
        i
      </span>
    </span>
  );
};

