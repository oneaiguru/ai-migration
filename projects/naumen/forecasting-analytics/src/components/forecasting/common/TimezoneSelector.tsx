import React from 'react';
import { useTimezone } from './TimezoneContext';
import { timezoneShortLabel } from '../../../utils/timezone';

interface TimezoneSelectorProps {
  className?: string;
}

const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({ className }) => {
  const { options, timezone, setTimezone } = useTimezone();

  return (
    <label className={`flex items-center gap-2 text-sm text-gray-600 ${className ?? ''}`}>
      <span className="text-xs uppercase text-gray-500">Часовой пояс</span>
      <select
        value={timezone.id}
        onChange={(event) => setTimezone(event.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label || timezoneShortLabel(option)}
          </option>
        ))}
      </select>
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
        {timezoneShortLabel(timezone)}
      </span>
    </label>
  );
};

export default TimezoneSelector;
