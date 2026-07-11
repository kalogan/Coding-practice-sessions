import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'sign-of',
  title: 'Sign of a number',
  module: '2 · Making Decisions',
  order: 120,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement sign(n) so it returns which "direction" n points:
  -1 if n is negative,
   0 if n is exactly zero,
   1 if n is positive.

This is a three-way decision, not a two-way one — you need more than a single
if/else.`,
  starter: `int sign(int n) {
    // return -1, 0, or 1 depending on the sign of n
    return 0;
}
`,
  lesson: {
    intro: `A plain \`if / else\` gives you two outcomes. But plenty of decisions have
three or more. The sign of a number is the classic example: it's either
negative, zero, or positive — three distinct answers, and exactly one is right.

C handles this by *chaining*: after the first \`if\` fails, you check another
condition with \`else if\`, and you can keep going. A final \`else\` catches
everything that fell through. The chain tries each test in order and stops at the
first one that's true.`,
    sections: [
      {
        heading: 'The else-if chain',
        body: `The shape is:

\`if (test1) { ... } else if (test2) { ... } else { ... }\`

Read it top to bottom. If \`test1\` is true, run its block and skip the rest. If
not, try \`test2\`; if that's true, run *its* block and skip the rest. If neither
was true, the \`else\` block runs. Only one branch ever executes.`,
      },
      {
        heading: 'Order matters — checks are tried top to bottom',
        body: `Because the chain stops at the first true test, the *order* of your
checks is part of the logic. Here the three cases (negative, zero, positive)
don't overlap, so any order that covers all three works. But once ranges overlap,
you must arrange checks so the first match is the right one.

A tidy way to write this: check \`n < 0\` first, then \`n == 0\`, and let the final
\`else\` mean "positive" — because if it wasn't negative and wasn't zero, it must
be positive.`,
      },
    ],
    workedExample: `// classify a small integer as low / mid / high
int bucket(int n) {
    if (n < 10) {
        return 0;          // low
    } else if (n < 100) {
        return 1;          // mid: 10..99
    } else {
        return 2;          // high: 100+
    }
}
// bucket(3) -> 0    bucket(50) -> 1    bucket(500) -> 2`,
    whyItMatters: `Three-way and multi-way branching is everywhere: comparing two
values (less / equal / greater), grading, routing a request by status code,
menu handling. The comparison function \`sign(a - b)\` is the heart of every
sorting routine — it tells the sorter how two items relate. Learn to build a
clean else-if chain and you can express any finite decision.`,
    commonMistakes: [
      'Using three separate `if`s instead of an `else if` chain. Separate `if`s each get evaluated; a chain stops at the first match, which is what you want here.',
      'Forgetting the zero case entirely, so `sign(0)` falls into the negative or positive branch.',
      'Writing `n = 0` instead of `n == 0` — the single `=` assigns rather than compares.',
      'Ordering checks so an earlier, broader condition swallows a case meant for a later branch.',
    ],
    hint: 'Three branches: `if (n < 0) return -1;` then `else if (n == 0) return 0;` then `else return 1;`. Since the cases don\'t overlap, the exact order is flexible.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", sign(42));
    printf("%d\\n", sign(-7));
    printf("%d\\n", sign(0));
    printf("%d\\n", sign(-1));
    return 0;
}`,
  expectedStdout: `1
-1
0
-1
`,
  reference: `int sign(int n) {
    if (n < 0) {
        return -1;
    } else if (n == 0) {
        return 0;
    } else {
        return 1;
    }
}
`,
};

export default exercise;
