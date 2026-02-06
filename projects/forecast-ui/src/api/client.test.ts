import { describe, it, expect } from 'vitest';
import { toCsv } from './client';

describe('toCsv', () => {
  it('handles empty arrays', () => {
    expect(toCsv([])).toBe('');
  });
  it('quotes and escapes values', () => {
    const csv = toCsv([{ a: 'plain', b: 'he"llo' }]);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('a,b');
    expect(lines[1]).toBe('"plain","he""llo"');
  });
  it('unions headers across rows', () => {
    const csv = toCsv([{ a: 1 }, { b: 2 }]);
    const lines = csv.split('\n');
    expect(lines[0].split(',').sort()).toEqual(['a', 'b']);
  });
});

