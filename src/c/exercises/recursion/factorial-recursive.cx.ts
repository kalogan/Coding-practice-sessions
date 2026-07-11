import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'factorial-recursive',
  title: 'Factorial, recursively',
  module: '4 · Functions & Recursion',
  order: 300,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement fact_r(n) so it returns n! (n factorial) — the product
1 * 2 * 3 * ... * n — using RECURSION, not a loop.

By definition 0! = 1 and 1! = 1, and for larger n, n! = n * (n-1)!.

The result grows fast, so the return type is \`long\`. You only write the
function; a hidden harness calls it and checks the answers.`,
  starter: `long fact_r(int n) {
    // base case: n <= 1  ->  return 1
    // recursive case: return n * fact_r(n - 1)
    return 0;
}
`,
  lesson: {
    intro: `A *recursive* function is one that calls itself. That sounds like a
trick, but it's just a way of solving a problem by shrinking it: solve a tiny
version directly, and describe every bigger version in terms of a slightly
smaller one.

Factorial is the classic example. \`5!\` is \`5 * 4!\`. And \`4!\` is \`4 * 3!\`.
Keep going and you reach \`1!\`, which is simply \`1\` — no further shrinking
needed. That "simplest case you can answer outright" is the *base case*, and it
is what stops the recursion.`,
    sections: [
      {
        heading: 'Base case vs. recursive case',
        body: `Every recursive function needs two branches. The *base case* is the
smallest input you can answer without recursing — here, \`n <= 1\` returns \`1\`.
The *recursive case* handles everything else by calling itself on a smaller
input: \`return n * fact_r(n - 1);\`.

The base case is not optional. Without it, the function would call itself
forever (each call spawning another) until the program crashes. Always ask
first: "what is the trivial input, and what do I return for it?"`,
      },
      {
        heading: 'The call stack',
        body: `When \`fact_r(5)\` runs, it can't finish until \`fact_r(4)\` gives it an
answer — so it pauses, half-done, and waits. \`fact_r(4)\` pauses waiting on
\`fact_r(3)\`, and so on down to \`fact_r(1)\`, which returns \`1\` immediately.

Those paused calls are stacked up in memory — this is the *call stack*. Once
the base case returns, the stack "unwinds": \`fact_r(1)\` hands \`1\` back,
\`fact_r(2)\` multiplies to get \`2\`, then \`6\`, \`24\`, and finally \`120\`. Each
call finishes the multiplication it was waiting to do.`,
      },
    ],
    workedExample: `// sum of 1..n, recursively — same shape as factorial
long sum_to(int n) {
    if (n <= 0) return 0;      // base case: nothing left to add
    return n + sum_to(n - 1);  // recursive case: n plus the rest
}
// sum_to(3) = 3 + sum_to(2) = 3 + (2 + sum_to(1)) = 3 + 2 + 1 = 6`,
    whyItMatters: `Recursion is the natural language for anything with a nested or
self-similar structure — walking a tree, exploring a maze, parsing nested
brackets, divide-and-conquer sorts. Factorial is the gentlest place to build the
instinct: spot the base case, express the rest in terms of a smaller call, and
trust it to unwind.`,
    commonMistakes: [
      'Forgetting the base case, so the function recurses forever and blows the stack.',
      'Recursing on the *same* size input (e.g. `fact_r(n)` instead of `fact_r(n - 1)`) — the problem never shrinks.',
      'Returning `fact_r(n - 1)` without multiplying by `n` — you must combine the smaller answer with the current step.',
      'Using `int` for the result — factorials overflow `int` quickly; the signature is `long` for a reason.',
    ],
    hint: 'Two lines: `if (n <= 1) return 1;` then `return n * fact_r(n - 1);`. The base case comes first so it can stop the recursion.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%ld\\n", fact_r(0));
    printf("%ld\\n", fact_r(1));
    printf("%ld\\n", fact_r(5));
    printf("%ld\\n", fact_r(10));
    return 0;
}`,
  expectedStdout: `1
1
120
3628800
`,
  reference: `long fact_r(int n) {
    if (n <= 1) return 1;
    return n * fact_r(n - 1);
}
`,
};

export default exercise;
