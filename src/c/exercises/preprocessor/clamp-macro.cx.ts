import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'clamp-macro',
  title: 'CLAMP: nesting the ternary',
  module: '14 · The Preprocessor & Declarations',
  order: 1430,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Define a macro \`CLAMP(x, lo, hi)\` that forces \`x\` into the range \`[lo, hi]\`:
if \`x\` is below \`lo\`, give back \`lo\`; if it's above \`hi\`, give back \`hi\`;
otherwise give back \`x\` unchanged.

Write only the \`#define\` line. A hidden harness uses \`CLAMP\` and prints results.`,
  starter: `#define CLAMP(x, lo, hi) (x)   // TODO: clamp x into [lo, hi]
`,
  lesson: {
    intro: `"Clamping" means pinning a value inside a range: anything below the floor
becomes the floor, anything above the ceiling becomes the ceiling, and anything
in between passes through untouched. It's the classic three-way decision.

You already know the ternary picks between two values. To pick between *three*
outcomes, you *nest* one ternary inside another. That's the whole idea here — and
it's why this one is a step up from \`MAX\`.`,
    sections: [
      {
        heading: 'Nesting a ternary inside a ternary',
        body: `Read it as two questions. First: is \`x\` below \`lo\`? If yes, the answer is
\`lo\`. If no, we still don't know — \`x\` might be in range or above \`hi\` — so the
"false" branch asks a *second* question: is \`x\` above \`hi\`? If yes, \`hi\`;
otherwise \`x\`. In C:

\`((x) < (lo) ? (lo) : ((x) > (hi) ? (hi) : (x)))\`

The inner ternary \`((x) > (hi) ? (hi) : (x))\` is wrapped in its own parentheses
and sits in the "else" slot of the outer one. Ternaries associate right-to-left,
so the parens aren't strictly required for the parse, but adding them makes the
nesting unmistakable and safe.`,
      },
      {
        heading: 'Macro vs the CLAMP function',
        body: `Earlier you may have written \`clamp\` as a real *function*. Same logic,
different machinery — and the difference matters. A function evaluates each
argument exactly once, then works on the resulting values. This macro pastes each
argument's *text* in multiple times: \`(x)\` appears up to three times in the
expansion.

So \`CLAMP(next(), 0, 10)\` could call \`next()\` two or three times. With a function,
\`next()\` runs once and its result is clamped. The macro is more flexible about
types (it clamps \`int\`, \`double\`, whatever), but the function is safer against
side effects. Knowing which tool fits is the real lesson.`,
      },
    ],
    workedExample: `// trace CLAMP(x, 0, 10) for three inputs
// CLAMP(5, 0, 10):  5 < 0? no  -> 5 > 10? no  -> 5
// CLAMP(-3, 0, 10): -3 < 0? yes -> 0
// CLAMP(99, 0, 10): 99 < 0? no -> 99 > 10? yes -> 10`,
    whyItMatters: `Clamping shows up constantly — keeping a volume between 0 and 100, a
pixel coordinate on screen, a health bar from going negative. And nested ternaries
are a general pattern for compact multi-way choices. This exercise cements both,
plus the deeper point that a macro and a function that "do the same thing" have
genuinely different runtime behavior.`,
    commonMistakes: [
      'Forgetting to parenthesize each argument, so a compound argument mis-parses inside the two comparisons.',
      'Getting the order backwards — check the low bound and the high bound, and return `x` only when it is inside both.',
      'Feeding an argument with a side effect, e.g. `CLAMP(read(), 0, 9)`, which may run `read()` more than once.',
      'Trailing `;` on the `#define`, which pastes a semicolon into every use.',
    ],
    hint: 'Outer ternary tests `x < lo` (return `lo`); its else-branch is a whole second ternary testing `x > hi` (return `hi`) else `x`. Parenthesize every argument.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", CLAMP(5, 0, 10));
    printf("%d\\n", CLAMP(-3, 0, 10));
    printf("%d\\n", CLAMP(99, 0, 10));
    return 0;
}`,
  expectedStdout: `5
0
10
`,
  reference: `#define CLAMP(x, lo, hi) ((x) < (lo) ? (lo) : ((x) > (hi) ? (hi) : (x)))
`,
};

export default exercise;
