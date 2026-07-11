import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'max-macro',
  title: 'MAX with the ternary operator',
  module: '14 · The Preprocessor & Declarations',
  order: 1420,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Define a macro \`MAX(a, b)\` that expands to the larger of its two arguments.

Use the ternary operator \`? :\`. Write only the \`#define\` line — a hidden harness
uses \`MAX\` and prints the results.`,
  starter: `#define MAX(a, b) (a)   // TODO: return the larger of a and b
`,
  lesson: {
    intro: `The ternary operator \`condition ? valueIfTrue : valueIfFalse\` is a compact
"if" that is an *expression* — it produces a value. \`(3 > 7 ? 3 : 7)\` evaluates
the test \`3 > 7\` (false), so the whole thing becomes \`7\`.

That makes it perfect for a macro. A macro's replacement has to be a single
expression (there's no room for a multi-line \`if\` statement), and the ternary is
exactly an if-shaped expression. So \`#define MAX(a, b) ((a) > (b) ? (a) : (b))\`
picks the larger of \`a\` and \`b\`.`,
    sections: [
      {
        heading: 'Reading the ternary',
        body: `In \`((a) > (b) ? (a) : (b))\`: first the test \`(a) > (b)\` runs. If it's true,
the expression's value is the part after \`?\` — \`(a)\`. If it's false, the value is
the part after \`:\` — \`(b)\`. Either way you get back the bigger one.

As with any function-like macro, every argument is wrapped in its own
parentheses, and the whole body is wrapped too. Pass a compound expression like
\`MAX(x + 1, y)\` and those parens keep \`x + 1\` intact through the substitution.`,
      },
      {
        heading: 'A macro is text — beware double evaluation',
        body: `Because \`MAX\` pastes each argument in *twice* (once in the test, once as a
result), any argument with a side effect runs twice. \`MAX(a++, b)\` expands to
\`((a++) > (b) ? (a++) : (b))\` — if the first branch wins, \`a\` is incremented
*twice*, almost certainly not what you meant. This is called the *double
evaluation* problem.

A real function evaluates each argument exactly once, so it doesn't have this
trap — but a function only works on the types it's declared for. The macro works
on \`int\`, \`double\`, \`char\`, anything comparable. That flexibility is the reason
macros like this survive; just never feed them \`++\`, \`--\`, or a function call you
don't want run twice.`,
      },
    ],
    workedExample: `// the sibling: pick the smaller one
#define MIN(a, b) ((a) < (b) ? (a) : (b))

// MIN(3, 7)   ->  ((3) < (7) ? (3) : (7))  -> 3
// MIN(9, 2)   ->  2`,
    whyItMatters: `\`MAX\` and \`MIN\` macros appear in countless C headers and system code —
they predate C having any built-in min/max. Understanding them teaches you the
ternary operator, the "replacement must be one expression" rule, and the
double-evaluation gotcha that bites every C programmer at least once.`,
    commonMistakes: [
      'Forgetting the parentheses around each argument, so `MAX(a + 1, b)` mis-parses.',
      'Writing an `if` statement in the macro — the replacement must be a single expression, which is why the ternary is used.',
      'Passing an argument with a side effect like `MAX(i++, n)`, which evaluates it twice.',
      'Adding a trailing `;` to the `#define`.',
    ],
    hint: 'The shape is `((a) > (b) ? (a) : (b))` — test, then the true value, then the false value, all parenthesized.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", MAX(3, 7));
    printf("%d\\n", MAX(9, 2));
    printf("%d\\n", MAX(-1, -5));
    return 0;
}`,
  expectedStdout: `7
9
-1
`,
  reference: `#define MAX(a, b) ((a) > (b) ? (a) : (b))
`,
};

export default exercise;
