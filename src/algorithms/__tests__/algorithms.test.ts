import { describe, it, expect } from 'vitest';
import { algorithms } from '../registry';

// The honesty gate. Because the visualization IS the algorithm's real output,
// proving the algorithm returns the correct answer proves the animation can't
// be a pretty lie. Known answers are hand-computed for each default input.
const EXPECTED: Record<string, number> = {
  // tokens [3,1,4,1,5,9,2,6], budget 10 -> longest fitting run is [3,1,4,1] = 4 messages
  'chat-history-budget': 4,
  // reactions [2,1,5,1,3,2], k=3 -> windows 8,7,9,6 -> peak 9
  'peak-engagement': 9,
};

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

      it('every step references valid array indices', () => {
        const n = algo.defaultInput.array.length;
        for (const step of result.steps) {
          for (const m of step.markers) {
            expect(m.index).toBeGreaterThanOrEqual(0);
            expect(m.index).toBeLessThan(n);
          }
        }
      });

      it('returns the real, known-correct answer', () => {
        expect(result.answer).toBe(EXPECTED[algo.id]);
      });
    });
  }
});
