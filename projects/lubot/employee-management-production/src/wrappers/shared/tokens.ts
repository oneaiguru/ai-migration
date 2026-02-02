const joinSegments = (segments: string[]): string => segments.join('-');

export const tokenVar = (...segments: string[]) => `var(--em-${joinSegments(segments)})`;

export const colorVar = (name: string) => tokenVar('colors', name);
export const spacingVar = (size: string) => tokenVar('spacing', size);
export const radiusVar = (size: string) => tokenVar('radii', size);
export const shadowVar = (name: string) => tokenVar('shadows', name);
export const durationVar = (name: string) => tokenVar('durations', name);
export const zIndexVar = (layer: string) => tokenVar('zIndex', layer);

export const focusRing = () => tokenVar('colors', 'focusRing');

export const fontVar = (family: 'fontFamily' | 'fontFamilyHeading' | 'fontFamilyMono') =>
  tokenVar('typography', family);

export const fontWeightVar = (weight: 'fontWeightRegular' | 'fontWeightMedium' | 'fontWeightSemibold' | 'fontWeightBold') =>
  tokenVar('typography', weight);

export const fontSizeVar = (size: 'sizeXs' | 'sizeSm' | 'sizeMd' | 'sizeLg' | 'sizeXl' | 'sizeDisplay') =>
  tokenVar('typography', size);

export const lineHeightVar = (size: 'lineHeightTight' | 'lineHeightDefault' | 'lineHeightRelaxed') =>
  tokenVar('typography', size);
