// Resolve API base at runtime with safe fallbacks
function resolveApiBase(): string {
  const envBase = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (envBase && envBase.trim()) return envBase.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    try {
      const usp = new URLSearchParams(window.location.search);
      const q = (usp.get('api') || usp.get('apiBase') || '').trim();
      if (q) {
        try { window.localStorage.setItem('API_BASE', q); } catch {}
        return q.replace(/\/$/, '');
      }
    } catch {}
    try {
      const ls = window.localStorage.getItem('API_BASE');
      if (ls && ls.trim()) return ls.replace(/\/$/, '');
    } catch {}
  }
  return '';
}

const API_BASE = resolveApiBase();
const API_TIMEOUT_MS = Number((import.meta as any).env?.VITE_API_TIMEOUT_MS ?? 10000);

function buildUrl(path: string): URL {
  if (API_BASE) return new URL(API_BASE + path);
  if (typeof window !== 'undefined') return new URL(path, window.location.origin);
  throw new Error('API base URL not configured');
}

function withTimeout(init?: RequestInit): { init: RequestInit; controller: AbortController } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1000, API_TIMEOUT_MS));
  const initWithSignal: RequestInit = { ...(init || {}), signal: controller.signal };
  // Clear timer on caller's completion
  (initWithSignal as any)._cancelTimeout = () => clearTimeout(timer);
  return { init: initWithSignal, controller };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

export async function apiGet<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = buildUrl(path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const { init } = withTimeout({ headers: { Accept: 'application/json' } });
  try {
    const res = await fetch(url.toString(), init);
    return handleResponse<T>(res);
  } catch (e) {
    throw e;
  } finally {
    (init as any)._cancelTimeout?.();
  }
}

export async function apiGetCsv(path: string, params?: Record<string, any>): Promise<Blob> {
  const url = buildUrl(path);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  // Try server CSV first
  const primary = withTimeout({ headers: { Accept: 'text/csv' } });
  try {
    let res = await fetch(url.toString(), primary.init);
    if (!res.ok || !(res.headers.get('content-type') || '').includes('text/csv')) {
      // fallback to JSON and client-side CSV (also time-bounded)
      const fallback = withTimeout();
      try {
        const res2 = res.ok ? res : await fetch(url.toString(), fallback.init);
        const json = await handleResponse<any[]>(res2);
        const csv = toCsv(json);
        return new Blob([csv], { type: 'text/csv;charset=utf-8' });
      } finally {
        (fallback.init as any)._cancelTimeout?.();
      }
    }
    return await res.blob();
  } finally {
    (primary.init as any)._cancelTimeout?.();
  }
}

export function toCsv(rows: any[]): string {
  if (!rows || rows.length === 0) return '';
  const headers: string[] = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r || {}).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );
  const esc = (v: any) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  return [headers.join(','), ...rows.map((r) => headers.map((h: string) => esc((r as any)?.[h])).join(','))].join('\n');
}

export const API = {
  base: API_BASE,
};
