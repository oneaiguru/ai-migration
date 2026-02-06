export type KeyMap = Record<string, { action: string; id: string }>;

export type NavOptions = {
  loop?: boolean; // wrap focus at ends
  container?: HTMLElement | Document;
};

function isFocusable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none') return false;
  const ti = (el.getAttribute('tabindex') ?? '').trim();
  const tabbable = ti !== '' ? Number(ti) >= 0 : (el as any).tabIndex >= 0;
  return tabbable || ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);
}

function getXY(el: HTMLElement): { x: number; y: number } | null {
  const ds = (el.dataset || {}) as any;
  if (ds.x != null && ds.y != null) {
    const x = Number(ds.x);
    const y = Number(ds.y);
    if (!Number.isNaN(x) && !Number.isNaN(y)) return { x, y };
  }
  // fallback to bounding rect (less deterministic)
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.left), y: Math.round(r.top) };
}

function dirKeyToAttr(key: string): keyof DOMStringMap | null {
  switch (key) {
    case 'ArrowUp':
      return 'navUp' as any;
    case 'ArrowDown':
      return 'navDown' as any;
    case 'ArrowLeft':
      return 'navLeft' as any;
    case 'ArrowRight':
      return 'navRight' as any;
    default:
      return null;
  }
}

function nextPrevByTabIndex(root: HTMLElement, current: HTMLElement, forward: boolean, loop: boolean): HTMLElement | null {
  const nodes = Array.from(root.querySelectorAll('[id][tabindex]')).filter(isFocusable) as HTMLElement[];
  if (nodes.length === 0) return null;
  nodes.sort((a, b) => (Number(a.getAttribute('tabindex')) || 0) - (Number(b.getAttribute('tabindex')) || 0));
  const idx = nodes.findIndex((n) => n === current);
  if (idx === -1) return nodes[0] ?? null;
  const nextIdx = forward ? idx + 1 : idx - 1;
  if (nextIdx < 0) return loop ? nodes[nodes.length - 1] : null;
  if (nextIdx >= nodes.length) return loop ? nodes[0] : null;
  return nodes[nextIdx];
}

function nearestByXY(root: HTMLElement, current: HTMLElement, key: string): HTMLElement | null {
  const nodes = Array.from(root.querySelectorAll('[id]')).filter(isFocusable) as HTMLElement[];
  const here = getXY(current);
  if (!here) return null;
  let best: { el: HTMLElement; score: number } | null = null;
  for (const el of nodes) {
    if (el === current) continue;
    const pt = getXY(el);
    if (!pt) continue;
    const dx = pt.x - here.x;
    const dy = pt.y - here.y;
    const manhattan = Math.abs(dx) + Math.abs(dy);
    // filter by direction cone
    if (key === 'ArrowUp' && !(dy < 0 && Math.abs(dx) <= Math.abs(dy))) continue;
    if (key === 'ArrowDown' && !(dy > 0 && Math.abs(dx) <= Math.abs(dy))) continue;
    if (key === 'ArrowLeft' && !(dx < 0 && Math.abs(dy) <= Math.abs(dx))) continue;
    if (key === 'ArrowRight' && !(dx > 0 && Math.abs(dy) <= Math.abs(dx))) continue;
    const score = manhattan;
    if (!best || score < best.score) best = { el, score };
  }
  return best?.el ?? null;
}

export function createOnRootKeyDown(keyMap?: KeyMap, options?: NavOptions) {
  const loop = !!options?.loop;
  return (e: React.KeyboardEvent<HTMLElement>) => {
    const key = e.key;
    const root = (options?.container as HTMLElement) || (e.currentTarget as HTMLElement);
    // Key map (container-level binds)
    if (keyMap && keyMap[key]) {
      const { action, id } = keyMap[key];
      (e as any).__uahisHandled = true;
      if ((window as any).__uahisOnAction) {
        (window as any).__uahisOnAction(action, id);
      }
    }
    const dirAttr = dirKeyToAttr(key);
    if (!dirAttr) return;
    const current = e.target as HTMLElement;
    const ds = (current?.dataset || {}) as any;
    if (ds && ds[dirAttr]) {
      const next = document.getElementById(ds[dirAttr]);
      if (next) {
        e.preventDefault();
        next.focus();
        return;
      }
    }
    // fallback: nearest by XY
    const near = nearestByXY(root, current, key);
    if (near) {
      e.preventDefault();
      near.focus();
      return;
    }
    // fallback: tab index order
    const forward = key === 'ArrowRight' || key === 'ArrowDown';
    const alt = nextPrevByTabIndex(root, current, forward, loop);
    if (alt) {
      e.preventDefault();
      alt.focus();
    }
  };
}

// Convenience: connect onAction globally for container-level key binds
export function connectGlobalOnAction(handler: (action: string, id: string) => void) {
  (window as any).__uahisOnAction = handler;
}

