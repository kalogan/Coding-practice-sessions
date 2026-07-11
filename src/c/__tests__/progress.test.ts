import { describe, it, expect } from 'vitest';
import { toggleId, loadCompleted, saveCompleted } from '../progress';

describe('progress (done tracking)', () => {
  it('toggleId adds then removes, immutably', () => {
    const empty = new Set<string>();
    const withX = toggleId(empty, 'x');
    expect(withX.has('x')).toBe(true);
    expect(empty.has('x')).toBe(false); // original untouched

    const withoutX = toggleId(withX, 'x');
    expect(withoutX.has('x')).toBe(false);
    expect(withX.has('x')).toBe(true); // previous untouched
  });

  it('load/save are safe with no localStorage (node env) and never throw', () => {
    expect(() => saveCompleted(new Set(['a', 'b']))).not.toThrow();
    const loaded = loadCompleted();
    expect(loaded).toBeInstanceOf(Set);
  });
});
