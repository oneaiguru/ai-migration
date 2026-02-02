export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[K]>
    : T[K];
};

export interface ThemeTokens {
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    surfaceRaised: string;
    overlay: string;
    primary: string;
    primaryHover: string;
    primaryActive: string;
    primaryMuted: string;
    primaryForeground: string;
    border: string;
    borderStrong: string;
    borderMuted: string;
    mutedForeground: string;
    emphasisForeground: string;
    info: string;
    infoForeground: string;
    success: string;
    successForeground: string;
    warning: string;
    warningForeground: string;
    danger: string;
    dangerForeground: string;
    focusRing: string;
    backdrop: string;
  };
  spacing: {
    none: string;
    '2xs': string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  radii: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    pill: string;
    full: string;
  };
  typography: {
    fontFamily: string;
    fontFamilyHeading: string;
    fontFamilyMono: string;
    fontWeightRegular: number;
    fontWeightMedium: number;
    fontWeightSemibold: number;
    fontWeightBold: number;
    lineHeightTight: string;
    lineHeightDefault: string;
    lineHeightRelaxed: string;
    sizeXs: string;
    sizeSm: string;
    sizeMd: string;
    sizeLg: string;
    sizeXl: string;
    sizeDisplay: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    focus: string;
  };
  durations: {
    fast: string;
    base: string;
    slow: string;
  };
  zIndex: {
    base: number;
    dropdown: number;
    popover: number;
    modal: number;
    toast: number;
    tooltip: number;
  };
};

export type ThemeOverrides = DeepPartial<ThemeTokens>;
