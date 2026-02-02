import { baseThemeTokens, cssVariablePrefix } from './tokens';
import type { ThemeOverrides, ThemeTokens } from './types';

const CSS_VAR_PREFIX = `--${cssVariablePrefix}`;

type TokenValue = string | number | boolean;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const deepMerge = <T extends Record<string, unknown>>(
  base: T,
  overrides: Record<string, unknown> | undefined
): T => {
  if (!overrides) {
    return base;
  }

  const result: Record<string, unknown> = { ...base };

  Object.keys(overrides).forEach((key) => {
    const overrideValue = overrides[key];
    if (overrideValue === undefined) {
      return;
    }

    const currentValue = (base as Record<string, unknown>)[key];

    if (isPlainObject(currentValue) && isPlainObject(overrideValue)) {
      result[key] = deepMerge(currentValue as Record<string, unknown>, overrideValue);
    } else {
      result[key] = overrideValue;
    }
  });

  return result as T;
};

const flattenTokens = (
  tokens: Record<string, TokenValue | Record<string, unknown>>,
  parentKeys: string[] = []
): Array<{ path: string[]; value: TokenValue }> => {
  return Object.entries(tokens).flatMap(([key, value]) => {
    const path = [...parentKeys, key];

    if (isPlainObject(value)) {
      return flattenTokens(value as Record<string, TokenValue | Record<string, unknown>>, path);
    }

    return [{ path, value: value as TokenValue }];
  });
};

const formatCSSVar = (path: string[]): string => {
  return [CSS_VAR_PREFIX, ...path].join('-');
};

const normaliseValue = (value: TokenValue): string => {
  if (typeof value === 'number') {
    return `${value}`;
  }

  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  return value;
};

export const createTheme = (overrides: ThemeOverrides = {}): ThemeTokens => {
  return deepMerge(baseThemeTokens as unknown as Record<string, unknown>, overrides) as ThemeTokens;
};

export const buildCSSVariableMap = (tokens: ThemeTokens): Record<string, string> => {
  const entries = flattenTokens(tokens as unknown as Record<string, TokenValue>);

  return entries.reduce<Record<string, string>>((acc, entry) => {
    const variableName = formatCSSVar(entry.path);
    acc[variableName] = normaliseValue(entry.value);
    return acc;
  }, {});
};

interface ApplyThemeOptions {
  target?: HTMLElement | null;
  clearExisting?: boolean;
}

/**
 * Applies the provided theme tokens as CSS variables on the target element (defaults to documentElement).
 */
export const applyTheme = (
  tokens: ThemeTokens,
  { target, clearExisting = false }: ApplyThemeOptions = {}
): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const element = target ?? document.documentElement;
  if (!element) {
    return;
  }

  const variables = buildCSSVariableMap(tokens);

  if (clearExisting) {
    Object.keys(variables).forEach((variable) => {
      element.style.removeProperty(variable);
    });
  }

  Object.entries(variables).forEach(([variable, value]) => {
    element.style.setProperty(variable, value);
  });
};

export const themeVar = (...path: string[]): string => {
  return `var(${formatCSSVar(path)})`;
};

export const resolveToken = (
  tokens: ThemeTokens,
  ...path: string[]
): TokenValue | undefined => {
  return path.reduce<TokenValue | Record<string, unknown> | undefined>((value, key) => {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    return (value as Record<string, TokenValue | Record<string, unknown>>)[key];
  }, tokens as unknown as Record<string, TokenValue | Record<string, unknown>>) as TokenValue | undefined;
};

export { baseThemeTokens };
export type { ThemeTokens, ThemeOverrides } from './types';
