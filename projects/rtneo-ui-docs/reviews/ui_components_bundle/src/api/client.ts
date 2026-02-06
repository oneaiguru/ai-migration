const API_BASE = (import.meta as any).env?.VITE_API_URL ? (import.meta as any).env.VITE_API_URL.replace(/\/$/, '') : '';

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
  const url = new URL(API_BASE + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  return handleResponse<T>(res);
}

export async function apiGetCsv(path: string, params?: Record<string, any>): Promise<Blob> {
  const url = new URL(API_BASE + path);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  // Try server CSV first
  let res = await fetch(url.toString(), { headers: { Accept: 'text/csv' } });
  if (!res.ok || !(res.headers.get('content-type') || '').includes('text/csv')) {
    // fallback to JSON and client-side CSV
    const json = await handleResponse<any[]>(res.ok ? res : await fetch(url.toString()));
    const csv = toCsv(json);
    return new Blob([csv], { type: 'text/csv;charset=utf-8' });
  }
  return await res.blob();
}

function toCsv(rows: any[]): string {
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
