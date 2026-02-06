import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { formatDate } from '../../utils/format';

type NativeOnBlur = React.FocusEventHandler<HTMLInputElement> | undefined;
type NativeOnFocus = React.FocusEventHandler<HTMLInputElement> | undefined;

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const RU_PATTERN = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const PLACEHOLDER = 'дд.мм.гггг';

const normaliseIso = (value: string): string | null => {
  if (!value) {
    return '';
  }

  if (ISO_PATTERN.test(value)) {
    return value;
  }

  const match = RU_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const isoCandidate = `${year}-${month}-${day}`;
  const timestamp = Date.parse(isoCandidate);
  if (Number.isNaN(timestamp)) {
    return null;
  }

  const date = new Date(timestamp);
  const isSameDate =
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() + 1 === Number(month) &&
    date.getUTCDate() === Number(day);

  return isSameDate ? isoCandidate : null;
};

const isWithinRange = (value: string, min?: string, max?: string) => {
  if (!value) {
    return true;
  }

  if (min && value < min) {
    return false;
  }

  if (max && value > max) {
    return false;
  }

  return true;
};

export interface DateFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: string;
  onChange: (nextValue: string) => void;
  min?: string;
  max?: string;
}

const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  ({ value, onChange, min, max, onBlur, onFocus, ...rest }, forwardedRef) => {
    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
      if (!value) {
        setDisplayValue('');
        return;
      }

      setDisplayValue(formatDate(value));
    }, [value]);

    const emitChange = useCallback(
      (raw: string | null) => {
        if (raw === null) {
          return;
        }

        if (raw === '' || isWithinRange(raw, min, max)) {
          onChange(raw);
        }
      },
      [max, min, onChange],
    );

    const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
      (event) => {
        const next = event.target.value;
        setDisplayValue(next);

        const iso = normaliseIso(next);
        if (iso && isWithinRange(iso, min, max)) {
          emitChange(iso);
        }
      },
      [emitChange, max, min],
    );

    const handleBlur = useCallback<NativeOnBlur>(
      (event) => {
        const next = event.target.value.trim();
        if (!next) {
          emitChange('');
          setDisplayValue('');
        } else {
          const iso = normaliseIso(next);
          if (iso && isWithinRange(iso, min, max)) {
            emitChange(iso);
            setDisplayValue(formatDate(iso));
          } else if (value) {
            setDisplayValue(formatDate(value));
          } else {
            setDisplayValue('');
          }
        }

        onBlur?.(event);
      },
      [emitChange, max, min, onBlur, value],
    );

    const handleFocus = useCallback<NativeOnFocus>(
      (event) => {
        if (!displayValue && !value) {
          setDisplayValue('');
        }

        onFocus?.(event);
      },
      [displayValue, onFocus, value],
    );

    const pattern = useMemo(() => `${RU_PATTERN.source}|${ISO_PATTERN.source}`, []);

    return (
      <input
        {...rest}
        ref={forwardedRef}
        type="text"
        inputMode="numeric"
        placeholder={PLACEHOLDER}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        pattern={pattern}
        autoComplete="off"
      />
    );
  },
);

DateField.displayName = 'DateField';

export default DateField;
