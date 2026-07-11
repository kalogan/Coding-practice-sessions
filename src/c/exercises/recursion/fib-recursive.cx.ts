import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'fib-recursive',
  title: 'Fibonacci, recursively',
  module: '4 · Functions & Recursion',
  order: 310,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement fib_r(n) to return the n-th Fibonacci number using recursion.

The sequence is defined by: fib_r(0) = 0, fib_r(1) = 1, and for n >= 2,
fib_r(n) = fib_r(n - 1) + fib_r(n - 2).

So the sequence goes 0, 1, 1, 2, 3, 5, 8, 13, ... The return type is \`long\`.
You only write the function; a hidden harness checks it.`,
  starter: `long fib_r(int n) {
    // two base cases: fib_r(0) = 0, fib_r(1) = 1
    // recursive case: fib_r(n - 1) + fib_r(n - 2)
    return 0;
}
`,
  lesson: {
    intro: `The Fibonacci sequence is where recursion shows off — and also where it
first shows its cost. Each number is the sum of the two before it: 0, 1, 1, 2,
3, 5, 8, 13, 21, and so on.

Written recursively, that definition translates almost word-for-word into code:
\`fib_r(n) = fib_r(n - 1) + fib_r(n - 2)\`. The interesting new wrinkle is that
this function makes *two* recursive calls, and it needs *two* base cases to stop
them both.`,
    sections: [
      {
        heading: 'Two calls, two base cases',
        body: `Factorial called itself once. Fibonacci calls itself twice — once
for \`n - 1\` and once for \`n - 2\` — then adds the results. Because the recursion
branches two ways, a single base case isn't enough: \`n - 1\` and \`n - 2\` can
both march downward, and you need a solid answer for the two smallest inputs.

So you handle \`n == 0\` (return \`0\`) and \`n == 1\` (return \`1\`) directly. A
common shortcut is \`if (n < 2) return n;\`, which covers both at once since
\`fib_r(0)\` is \`0\` and \`fib_r(1)\` is \`1\`.`,
      },
      {
        heading: 'Correct but slow: the exponential blow-up',
        body: `This version is beautifully clear and painfully slow. Computing
\`fib_r(n)\` recomputes \`fib_r(n - 2)\` twice, \`fib_r(n - 3)\` three times, and so
on — the same sub-problems solved over and over. The number of calls roughly
*doubles* with each step, so the work grows exponentially. \`fib_r(40)\` already
makes over a billion calls.

An iterative loop that keeps the last two values runs in linear time and is what
you'd ship in real code. The recursion here is for *understanding* the
definition, not for speed. It's a great illustration that "correct" and "fast"
are two different questions.`,
      },
    ],
    workedExample: `// tracing fib_r(4) — notice the repeated work
// fib_r(4) = fib_r(3) + fib_r(2)
//          = (fib_r(2) + fib_r(1)) + (fib_r(1) + fib_r(0))
//          = ((fib_r(1) + fib_r(0)) + 1) + (1 + 0)
//          = ((1 + 0) + 1) + 1  =  3
// fib_r(2) got computed twice — that duplication is why it's slow.`,
    whyItMatters: `Fibonacci is the standard teaching example for two big ideas:
translating a mathematical recurrence directly into recursive code, and seeing
why naive recursion can be catastrophically slow. Recognizing repeated
sub-problems is the doorway to *memoization* and *dynamic programming* — you'll
meet the fast version of exactly this problem there.`,
    commonMistakes: [
      'Only writing one base case — you need both `n == 0` and `n == 1` (or `n < 2`).',
      'Recursing as `fib_r(n) + fib_r(n - 1)` — it must be `fib_r(n - 1) + fib_r(n - 2)`.',
      'Getting the base values backwards: `fib_r(0)` is `0` and `fib_r(1)` is `1`, not the other way around.',
      'Expecting large `n` to finish quickly — this shape is exponential; keep test inputs small.',
    ],
    hint: 'Start with `if (n < 2) return n;` to cover both base cases, then `return fib_r(n - 1) + fib_r(n - 2);`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%ld\\n", fib_r(0));
    printf("%ld\\n", fib_r(1));
    printf("%ld\\n", fib_r(10));
    printf("%ld\\n", fib_r(15));
    return 0;
}`,
  expectedStdout: `0
1
55
610
`,
  reference: `long fib_r(int n) {
    if (n < 2) return n;
    return fib_r(n - 1) + fib_r(n - 2);
}
`,
};

export default exercise;
