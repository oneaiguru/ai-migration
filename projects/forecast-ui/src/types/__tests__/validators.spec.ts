import { describe, it, expect } from 'vitest';
import { parseSites, parseRoutes } from '../../types/validators';

describe('validators', () => {
  it('parseSites: returns null on invalid types', () => {
    const bad = [{ site_id: 'X', fill_pct: '90', overflow_prob: 0.8 } as any];
    expect(parseSites(bad)).toBeNull();
  });

  it('parseSites: accepts optional fields and ignores extras', () => {
    const ok = [{
      site_id: 'S1',
      fill_pct: 0.9,
      overflow_prob: 0.8,
      address: 'Addr',
      extra: 'ignored',
    } as any];
    const parsed = parseSites(ok);
    expect(parsed).not.toBeNull();
    expect(parsed![0].site_id).toBe('S1');
    expect(typeof parsed![0].fill_pct).toBe('number');
    expect(typeof parsed![0].overflow_prob).toBe('number');
  });

  it('parseRoutes: returns array for valid route items and null for invalid', () => {
    const good = [{ site_id: 'R1', fill_pct: 0.5, overflow_prob: 0.4 }];
    const bad = [{ site_id: 'R2', fill_pct: 'x', overflow_prob: 0.2 } as any];
    expect(parseRoutes(good)).not.toBeNull();
    expect(parseRoutes(bad)).toBeNull();
  });
});

