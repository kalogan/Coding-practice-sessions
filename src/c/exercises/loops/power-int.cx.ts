import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'power-int',
  title: 'Integer power',
  module: '3 · Loops',
  order: 220,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement ipow(base, exp): return base raised to the power exp (base^exp).

exp is zero or positive. Anything to the power 0 is 1. Do it with a loop — you may
NOT use the math library's pow(). The result can get large, so return a \`long\`.`,
  starter: `long ipow(int base, int exp) {
    // multiply base by itself exp times
    return 0;
}
`,
  lesson: {
    intro: `Raising a number to a power just means multiplying it by itself repeatedly:
\`2^10\` is 2 multiplied in ten times, \`3^4\` is 3 multiplied in four times. There's a
tidy library function \`pow()\`, but it lives in the math library that this engine does
not link — and it returns a \`double\` anyway. For whole numbers, a loop is simpler and
exact.

The pattern is a product accumulator, exactly like factorial: seed a result at 1, then
multiply by \`base\` once per unit of \`exp\`.`,
    sections: [
      {
        heading: 'Loop exp times, multiplying by base',
        body: `Set \`long result = 1;\` and run the loop \`exp\` times:
\`for (int i = 0; i < exp; i++) result *= base;\`. Here the loop counter \`i\` is just
a *tally* — we don't use its value, we only care that the body runs the right number of
times. Counting \`i\` from 0 while \`i < exp\` runs the body exactly \`exp\` times.`,
      },
      {
        heading: 'The identity handles exp = 0',
        body: `Because \`result\` starts at 1, an exponent of 0 gives the right answer for
free: the loop condition \`0 < 0\` is false immediately, the body never runs, and we
return the untouched 1. That matches the math rule that any base to the power 0 is 1.

As with factorial, powers grow fast, so both \`result\` and the return type are
\`long\`, printed with \`%ld\`.`,
      },
    ],
    workedExample: `// base^exp, one factor of base per pass
long result = 1;              // identity for multiplication
for (int i = 0; i < exp; i++) {
    result *= base;           // fold in one more factor
}
return result;
// ipow(2, 3): 1 -> 2 -> 4 -> 8`,
    whyItMatters: `Powers show up in geometry (areas, volumes), in hashing and number
theory, and any time something doubles or scales repeatedly. Writing an exact integer
power by hand also cements the "loop a fixed number of times using the counter only as a
tally" idea — distinct from loops where the counter's value feeds the work.`,
    commonMistakes: [
      'Starting `result` at 0, which makes every product 0.',
      'Looping `i <= exp`, which multiplies by `base` one extra time (base^(exp+1)).',
      'Reaching for `pow()` from `<math.h>` — it is not linked here and returns a `double`.',
      'Using `int` instead of `long`, so larger powers overflow.',
    ],
    hint: 'Seed `long result = 1;`, loop `for (int i = 0; i < exp; i++) result *= base;`, then `return result;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%ld\\n", ipow(2, 10));
    printf("%ld\\n", ipow(3, 4));
    printf("%ld\\n", ipow(5, 0));
    printf("%ld\\n", ipow(7, 2));
    return 0;
}`,
  expectedStdout: `1024
81
1
49
`,
  reference: `long ipow(int base, int exp) {
    long result = 1;
    for (int i = 0; i < exp; i++) result *= base;
    return result;
}
`,
};

export default exercise;
