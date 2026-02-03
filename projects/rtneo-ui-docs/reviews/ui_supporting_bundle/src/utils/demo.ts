export function getDefaultDate(): string {
  try {
    const fromStorage = typeof window !== 'undefined' ? window.sessionStorage.getItem('DEMO_DEFAULT_DATE') : null;
    if (fromStorage && /^\d{4}-\d{2}-\d{2}$/.test(fromStorage)) {
      return fromStorage;
    }
  } catch (_) {}
  const env = (import.meta as any).env?.VITE_DEMO_DEFAULT_DATE;
  if (typeof env === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(env)) {
    return env;
  }
  return new Date().toISOString().slice(0, 10);
}
