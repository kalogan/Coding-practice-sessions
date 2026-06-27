import { describe, it, expect } from 'vitest';
import { algorithms } from '../registry';

// The honesty gate. Because the visualization IS the algorithm's real output,
// proving the algorithm returns the correct answer proves the animation can't
// be a pretty lie. Each algorithm declares its own `expected` answer, so adding
// a new `*.algo.ts` extends this gate automatically — no edits here.
describe('every registered algorithm', () => {
  it('is enumerated by the registry (zero-wiring)', () => {
    expect(algorithms.length).toBeGreaterThan(0);
  });

  for (const algo of algorithms) {
    describe(algo.id, () => {
      const result = algo.run(algo.defaultInput);

      it('emits a non-empty trace', () => {
        expect(result.steps.length).toBeGreaterThan(0);
      });

      it('every step has a view and a note', () => {
        for (const step of result.steps) {
          expect(step.view).toBeDefined();
          expect(typeof step.note).toBe('string');
          expect(step.note.length).toBeGreaterThan(0);
        }
      });

      it('returns the real, known-correct answer', () => {
        expect(result.answer).toBe(algo.expected);
      });
    });
  }
});
