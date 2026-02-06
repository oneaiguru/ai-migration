import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultTimezoneId, timezoneOptions as fixtureTimezones } from '../../../data/forecastingFixtures';
import type { ForecastTimezoneOption } from '../../../types/forecasting';
import { ensureTimezone } from '../../../utils/timezone';

type TimezoneContextValue = {
  options: ForecastTimezoneOption[];
  timezone: ForecastTimezoneOption;
  setTimezone: (id: string) => void;
  configureTimezones: (options: ForecastTimezoneOption[], defaultId?: string) => void;
};

const STORAGE_KEY = 'forecasting.timezone';

const TimezoneContext = createContext<TimezoneContextValue | null>(null);

const cloneOptions = (options: ForecastTimezoneOption[]): ForecastTimezoneOption[] =>
  options.map((option) => ({ ...option }));

const readStoredTimezone = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Не удалось получить часовой пояс из localStorage', error);
    return null;
  }
};

const persistTimezone = (id: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch (error) {
    console.warn('Не удалось сохранить часовой пояс в localStorage', error);
  }
};

export const TimezoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [options, setOptions] = useState<ForecastTimezoneOption[]>(() => cloneOptions(fixtureTimezones));
  const [selectedId, setSelectedId] = useState<string>(() => {
    const stored = readStoredTimezone();
    const initial = ensureTimezone(fixtureTimezones, stored ?? undefined, defaultTimezoneId);
    return initial.id;
  });

  useEffect(() => {
    persistTimezone(selectedId);
  }, [selectedId]);

  const configureTimezones = useCallback((incoming: ForecastTimezoneOption[], defaultId?: string) => {
    const sanitized = incoming.length ? cloneOptions(incoming) : cloneOptions(fixtureTimezones);
    setOptions(sanitized);
    setSelectedId((currentId) => {
      const targetId = defaultId ?? currentId;
      const resolved = ensureTimezone(sanitized, targetId, defaultTimezoneId);
      return resolved.id;
    });
  }, []);

  const setTimezone = useCallback(
    (id: string) => {
      setSelectedId((currentId) => {
        if (currentId === id) {
          return currentId;
        }
        const resolved = ensureTimezone(options, id, defaultTimezoneId);
        return resolved.id;
      });
    },
    [options],
  );

  const timezone = useMemo(
    () => ensureTimezone(options, selectedId, defaultTimezoneId),
    [options, selectedId],
  );

  const value = useMemo<TimezoneContextValue>(
    () => ({
      options,
      timezone,
      setTimezone,
      configureTimezones,
    }),
    [configureTimezones, options, setTimezone, timezone],
  );

  return <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>;
};

export const useTimezone = (): TimezoneContextValue => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone должен использоваться внутри TimezoneProvider');
  }
  return context;
};
