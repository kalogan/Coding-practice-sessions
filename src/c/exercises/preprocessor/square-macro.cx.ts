import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'square-macro',
  title: 'A function-like macro: SQUARE',
  module: '14 · The Preprocessor & Declarations',
  order: 1410,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Define a macro \`SQUARE(x)\` that expands to the square of \`x\`.

The catch: a macro is pure text substitution, so you must parenthesize carefully.
Write only the \`#define\` line. A hidden harness uses \`SQUARE\` in several
expressions and prints the results.`,
  starter: `#define SQUARE(x) (x)   // TODO: this is wrong — make it square x, safely
`,
  lesson: {
    intro: `A \`#define\` can take arguments, giving you a *function-like macro*. Write
\`#define SQUARE(x) ((x) * (x))\`. Now when the preprocessor sees \`SQUARE(5)\` it
pastes in \`((5) * (5))\` before compilation.

It looks like a function call, but remember: it is still just text substitution.
Whatever text you pass as \`x\` gets pasted in, exactly, wherever \`x\` appears in the
replacement. That single fact is the source of every macro bug — and the reason
for all those parentheses.`,
    sections: [
      {
        heading: 'Why parenthesize every argument',
        body: `Suppose you wrote the macro without inner parentheses:
\`#define SQUARE(x) (x * x)\`. Now \`SQUARE(1 + 2)\` expands to \`(1 + 2 * 1 + 2)\`.
Because \`*\` binds tighter than \`+\`, that is \`1 + 2 + 2\` = \`5\`, not \`9\`. The macro
didn't square the *value* 3 — it pasted the raw text \`1 + 2\` in twice and let the
surrounding operators tear it apart.

Wrapping each argument — \`((x) * (x))\` — forces \`SQUARE(1 + 2)\` to become
\`((1 + 2) * (1 + 2))\` = \`9\`. Each pasted argument is now sealed off from its
neighbors.`,
      },
      {
        heading: 'Parenthesize the whole body too',
        body: `There are two layers of parentheses in \`((x) * (x))\`. The inner pairs
protect each argument (as above). The outer pair protects the *whole macro* from
the code around it.

Imagine \`#define DOUBLE(x) (x) + (x)\` used as \`4 * DOUBLE(3)\`. That expands to
\`4 * (3) + (3)\` = \`15\`, not the \`24\` you meant. Wrapping the body —
\`((x) + (x))\` — makes it \`4 * ((3) + (3))\` = \`24\`. So the rule is: parenthesize
every argument AND the entire replacement.`,
      },
    ],
    workedExample: `// same idea, fully parenthesized
#define CUBE(x) ((x) * (x) * (x))

// CUBE(2)      ->  ((2) * (2) * (2))       = 8
// CUBE(1 + 1)  ->  ((1+1) * (1+1) * (1+1)) = 8   (the parens save us)`,
    whyItMatters: `Function-like macros are everywhere in C — \`MIN\`, \`MAX\`, \`ARRAY_LEN\`,
assertion helpers. They're powerful because they work on any type and vanish at
compile time. But they trade away the safety of a real function, so learning the
parenthesize-everything discipline early is what keeps them from silently
computing the wrong answer.`,
    commonMistakes: [
      'Leaving out the inner parens: `#define SQUARE(x) (x * x)` breaks on `SQUARE(1 + 2)`.',
      'Leaving out the outer parens, which breaks when the macro sits next to a `*` or `/`.',
      'Putting a space between `SQUARE` and `(x)` in the definition — `#define SQUARE (x) ...` makes it an object-like macro that expands to `(x) ...`, not a function-like one.',
      'Ending the `#define` with a `;` — the semicolon becomes part of the expansion.',
    ],
    hint: 'Two layers of parentheses: wrap each `x`, then wrap the whole product. `((x) * (x))`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", SQUARE(5));
    printf("%d\\n", SQUARE(1 + 2));
    printf("%d\\n", SQUARE(3));
    return 0;
}`,
  expectedStdout: `25
9
9
`,
  reference: `#define SQUARE(x) ((x) * (x))
`,
};

export default exercise;
