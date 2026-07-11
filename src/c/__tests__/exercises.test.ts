import { describe, it, expect } from 'vitest';
import { normalizeOutput, outputsMatch, assembleFunctionSource } from '../exercises/runner';
import { cExercises, getExercise, exercisesByModule } from '../exercises/registry';
import type { CExercise } from '../exercises/types';

describe('normalizeOutput', () => {
  it('strips trailing whitespace per line and trailing blank lines', () => {
    expect(normalizeOutput('a  \nb\t\n\n')).toBe('a\nb');
  });
  it('normalizes CRLF to LF', () => {
    expect(normalizeOutput('x\r\ny\r\n')).toBe('x\ny');
  });
  it('preserves interior blank lines and leading spaces', () => {
    expect(normalizeOutput('a\n\n  b')).toBe('a\n\n  b');
  });
});

describe('outputsMatch', () => {
  it('ignores trailing-space and trailing-newline differences', () => {
    expect(outputsMatch('1 4 \n2 5 \n', '1 4\n2 5')).toBe(true);
  });
  it('is not fooled by real content differences', () => {
    expect(outputsMatch('58 64', '58 65')).toBe(false);
  });
});

describe('assembleFunctionSource', () => {
  it('places the user code before the hidden harness', () => {
    const ex = { harness: 'int main(void){return 0;}' } as CExercise;
    const out = assembleFunctionSource(ex, 'int add(int a,int b){return a+b;}');
    expect(out.indexOf('add')).toBeLessThan(out.indexOf('main'));
    expect(out).toContain('int add');
    expect(out).toContain('int main');
  });
});

describe('exercise registry (zero-wiring)', () => {
  it('discovers exercises', () => {
    expect(cExercises.length).toBeGreaterThanOrEqual(5);
  });

  it('has unique ids and unique order values', () => {
    const ids = cExercises.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const orders = cExercises.map((e) => e.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('is sorted by ascending order', () => {
    const orders = cExercises.map((e) => e.order);
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
  });

  it('getExercise round-trips by id', () => {
    for (const e of cExercises) expect(getExercise(e.id)).toBe(e);
    expect(getExercise('does-not-exist')).toBeUndefined();
  });

  it('groups by module preserving order', () => {
    const groups = exercisesByModule();
    expect(groups.length).toBeGreaterThanOrEqual(2);
    const flat = groups.flatMap((g) => g.items.map((i) => i.order));
    expect(flat.length).toBe(cExercises.length);
  });

  it('every session teaches — a non-empty lesson.intro', () => {
    for (const e of cExercises) {
      expect(e.lesson, `${e.id}: lesson`).toBeDefined();
      expect(e.lesson?.intro.trim().length, `${e.id}: lesson.intro`).toBeGreaterThan(0);
    }
  });

  it('every exercise is well-formed for its mode', () => {
    for (const e of cExercises) {
      expect(e.id, `${e.id}: id`).toBeTruthy();
      expect(e.title, `${e.id}: title`).toBeTruthy();
      expect(e.module, `${e.id}: module`).toBeTruthy();
      expect(e.prompt.trim().length, `${e.id}: prompt`).toBeGreaterThan(0);
      expect(e.starter.trim().length, `${e.id}: starter`).toBeGreaterThan(0);
      expect(e.reference.trim().length, `${e.id}: reference`).toBeGreaterThan(0);
      expect(['function', 'program']).toContain(e.mode);

      if (e.mode === 'function') {
        expect(e.harness?.trim().length, `${e.id}: harness`).toBeGreaterThan(0);
        expect(e.harness, `${e.id}: harness has main`).toContain('main');
        expect((e.expectedStdout ?? '').length, `${e.id}: expectedStdout`).toBeGreaterThan(0);
      } else {
        expect(e.cases?.length, `${e.id}: cases`).toBeGreaterThan(0);
        for (const c of e.cases ?? []) {
          expect(typeof c.stdin, `${e.id}: case stdin`).toBe('string');
          expect(c.expectedStdout.length, `${e.id}: case expected`).toBeGreaterThan(0);
        }
      }
    }
  });
});
