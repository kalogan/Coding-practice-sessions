import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'clamp',
  title: 'Clamp to a range',
  module: '2 · Making Decisions',
  order: 150,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement clamp(x, lo, hi) so it pins x into the range [lo, hi]:
  if x is below lo, return lo,
  if x is above hi, return hi,
  otherwise return x unchanged.

For example clamp(5, 0, 10) is 5, clamp(-3, 0, 10) is 0, and clamp(99, 0, 10)
is 10.`,
  starter: `int clamp(int x, int lo, int hi) {
    // pin x into the range [lo, hi]
    return 0;
}
`,
  lesson: {
    intro: `"Clamping" means forcing a value to stay inside a range. If it's already
inside, leave it be. If it pokes out below the bottom, snap it up to the bottom.
If it pokes out above the top, snap it down to the top. The result is always
between \`lo\` and \`hi\`, inclusive.

There are three possible outcomes, but they come from two boundaries. The
cleanest way to think about it: handle each boundary with its own guard, and if
neither fires, the value was already in range.`,
    sections: [
      {
        heading: 'Two guards, then the fall-through',
        body: `Use two guard clauses, one per boundary:

\`if (x < lo) return lo;\`
\`if (x > hi) return hi;\`
\`return x;\`

If \`x\` is too small, the first guard catches it and returns \`lo\`. If it's too
big, the second catches it and returns \`hi\`. If neither fired, \`x\` was already
between them, so the final line returns it unchanged. Because each \`return\` ends
the function, the three cases can't collide.`,
      },
      {
        heading: 'Guard clauses keep it flat',
        body: `You could write this with nested \`if / else if / else\`, and that works
too. But guard clauses — check a condition and return immediately — keep the
function *flat*: no deep nesting, each case handled and dismissed in one line.

The mental model is "peel off the exceptional cases first, then handle the
normal case last." It reads top to bottom like a checklist and is easy to extend
if a fourth rule ever shows up.`,
      },
    ],
    workedExample: `// keep a volume level between 0 and 100
int cap_volume(int v) {
    if (v < 0) return 0;      // too quiet -> floor
    if (v > 100) return 100;  // too loud  -> ceiling
    return v;                 // already fine
}
// cap_volume(150) -> 100    cap_volume(-5) -> 0    cap_volume(42) -> 42`,
    whyItMatters: `Clamping is everywhere in real software: keeping a slider handle on
screen, capping a health bar, limiting a zoom level, constraining an index so it
never runs off the end of an array. It's one of the most-used tiny functions in
graphics, games, and UI code. And the guard-clause style you practice here is how
professionals keep branching logic readable.`,
    commonMistakes: [
      'Returning `hi` when `x < lo` (or vice versa) — mixing up which boundary snaps which direction. Too small snaps up to `lo`; too big snaps down to `hi`.',
      'Forgetting the final `return x;`, so in-range values fall off the end with no result.',
      'Using `else if` between the two guards in a way that skips the second check — with early `return`s you don\'t need `else` at all.',
      'Assuming `lo <= hi` but writing comparisons that break if they\'re equal. With `lo == hi`, `clamp(7, 1, 7)` should still return 7.',
    ],
    hint: 'Two guards and a fall-through: `if (x < lo) return lo;` then `if (x > hi) return hi;` then `return x;`. No `else` needed — each early `return` ends the function.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", clamp(5, 0, 10));
    printf("%d\\n", clamp(-3, 0, 10));
    printf("%d\\n", clamp(99, 0, 10));
    printf("%d\\n", clamp(7, 1, 7));
    return 0;
}`,
  expectedStdout: `5
0
10
7
`,
  reference: `int clamp(int x, int lo, int hi) {
    if (x < lo) return lo;
    if (x > hi) return hi;
    return x;
}
`,
};

export default exercise;
