import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'fibonacci-nth',
  title: 'Nth Fibonacci number',
  module: '3 · Loops',
  order: 240,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement fib(n): return the nth Fibonacci number.

The sequence starts fib(0) = 0, fib(1) = 1, and each later term is the sum of the two
before it: fib(n) = fib(n-1) + fib(n-2). So it goes 0, 1, 1, 2, 3, 5, 8, 13, ...

Build it iteratively with a loop — no recursion. The values grow, so return a \`long\`.`,
  starter: `long fib(int n) {
    // roll two running values forward n times
    return 0;
}
`,
  lesson: {
    intro: `The Fibonacci sequence is defined in terms of itself: each number is the sum
of the previous two. You *could* write that with a function that calls itself, but that
recomputes the same values an exponential number of times and is painfully slow.

The fast, clean way is *iterative*: keep just the two most recent values in a pair of
variables and roll them forward, one step at a time, until you reach the one you want.`,
    sections: [
      {
        heading: 'Two running values',
        body: `Hold the last two terms in \`long a\` and \`long b\`. Start them at the two
base cases: \`a = 0\` (that's fib(0)) and \`b = 1\` (fib(1)). At any moment \`a\` is
"the term before" and \`b\` is "the current term".

To advance one step, compute the next term \`a + b\`, then *shift*: the old \`b\` becomes
the new \`a\`, and the sum becomes the new \`b\`. Use a temporary so you don't clobber a
value you still need: \`long next = a + b; a = b; b = next;\`.`,
      },
      {
        heading: 'How many times to roll',
        body: `Starting from \`a = fib(0)\`, \`b = fib(1)\`, each roll moves the window up
by one. To land on fib(n) you handle the base cases directly and otherwise roll forward.

One tidy formulation: return \`a\` as fib(n) after rolling \`n\` times from the start —
loop \`for (int i = 0; i < n; i++)\` doing the shift, then \`return a;\`. Trace it: with
n = 0 the loop never runs and \`a\` is 0; with n = 1, one roll leaves \`a\` at 1. Both
base cases fall out naturally, so no special \`if\` is even required.`,
      },
    ],
    workedExample: `// walk the sequence, printing each term
long a = 0, b = 1;
for (int i = 0; i < n; i++) {
    long next = a + b;
    a = b;        // slide the window forward
    b = next;
}
return a;         // a has become fib(n)`,
    whyItMatters: `Fibonacci is the classic lesson in *why algorithm shape matters*: the
naive recursive version is exponential, this iterative one is linear and trivial. The
"keep a small rolling state and step it forward" technique — instead of recomputing from
scratch — is the seed of dynamic programming and shows up everywhere in efficient code.`,
    commonMistakes: [
      'Overwriting `a` before you have used its old value — assign into a temporary first.',
      'Getting the base cases wrong: fib(0) is 0 and fib(1) is 1.',
      'Using `int` instead of `long`; fib grows past the `int` range for larger `n`.',
      'Reaching for recursion, which is exponential-time here and not what this exercise teaches.',
    ],
    hint: 'Keep `long a = 0, b = 1;`. Loop n times doing `long next = a + b; a = b; b = next;`, then `return a;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%ld\\n", fib(0));
    printf("%ld\\n", fib(1));
    printf("%ld\\n", fib(10));
    printf("%ld\\n", fib(20));
    printf("%ld\\n", fib(30));
    return 0;
}`,
  expectedStdout: `0
1
55
6765
832040
`,
  reference: `long fib(int n) {
    long a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        long next = a + b;
        a = b;
        b = next;
    }
    return a;
}
`,
};

export default exercise;
