import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type AccuracyQuarterContextValue = {
  quarter: string;
  setQuarter: (q: string) => void;
  availableQuarters: string[];
  setAvailableQuarters: (list: string[]) => void;
};

const AccuracyQuarterContext = createContext<AccuracyQuarterContextValue | null>(null);

const DEFAULT_QUARTER = 'Q3_2024';

export const AccuracyQuarterProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [quarter, setQuarter] = useState<string>(DEFAULT_QUARTER);
  const [availableQuarters, setAvailableQuartersState] = useState<string[]>([DEFAULT_QUARTER]);

  const setAvailableQuarters = useCallback((list: string[]) => {
    if (!Array.isArray(list) || list.length === 0) return;
    const normalized = Array.from(new Set(list.filter(Boolean))).sort();
    setAvailableQuartersState((prev) => {
      if (prev.length === normalized.length && prev.every((entry, idx) => entry === normalized[idx])) {
        return prev;
      }
      if (!normalized.includes(quarter)) {
        setQuarter(normalized[normalized.length - 1]);
      }
      return normalized;
    });
  }, [quarter]);

  const value = useMemo(
    () => ({
      quarter,
      setQuarter,
      availableQuarters,
      setAvailableQuarters,
    }),
    [quarter, availableQuarters, setAvailableQuarters],
  );

  return <AccuracyQuarterContext.Provider value={value}>{children}</AccuracyQuarterContext.Provider>;
};

export function useAccuracyQuarter(): AccuracyQuarterContextValue {
  const ctx = useContext(AccuracyQuarterContext);
  if (!ctx) {
    throw new Error('useAccuracyQuarter must be used within AccuracyQuarterProvider');
  }
  return ctx;
}
