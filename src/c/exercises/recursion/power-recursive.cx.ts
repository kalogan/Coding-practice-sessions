import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'power-recursive',
  title: 'Integer power, recursively',
  module: '4 · Functions & Recursion',
  order: 330,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement pow_r(base, exp) to return base raised to the power exp
(base^exp) using recursion. Assume exp >= 0.

For example pow_r(2, 10) is 1024 and pow_r(3, 3) is 27. Anything to the power 0
is 1. Do NOT use <math.h> — build it from multiplication. The return type is
\`long\`. You only write the function; a hidden harness checks it.`,
  starter: `long pow_r(int base, int exp) {
    // base case: exp == 0  ->  return 1
    // recursive case: return base * pow_r(base, exp - 1)
    return 0;
}
`,
  lesson: {
    intro: `Raising a number to a power is just repeated multiplication:
\`2^10\` means multiply ten 2's together. You *could* write that as a loop, but it
also has a clean recursive shape — and it's a great chance to practice shrinking
a problem toward its base case.

The key observation: \`base^exp\` is the same as \`base * base^(exp - 1)\`. Every
step peels off one factor of \`base\` and reduces the exponent by one. Note there
is no \`pow\` from a library here — the whole point is to build it yourself from
plain multiplication.`,
    sections: [
      {
        heading: 'Shrinking the exponent toward the base case',
        body: `The recursion works on the *exponent*, not the base. Each call keeps
the same \`base\` but passes \`exp - 1\`: \`return base * pow_r(base, exp - 1);\`.
Because \`exp\` drops by one every time, it marches steadily down toward zero — so
the recursion is guaranteed to end.

Trace \`pow_r(2, 3)\`: it's \`2 * pow_r(2, 2)\` = \`2 * (2 * pow_r(2, 1))\` =
\`2 * (2 * (2 * pow_r(2, 0)))\`. The innermost call hits the base case and returns
\`1\`, then the multiplications unwind: \`2 * 2 * 2 * 1 = 8\`.`,
      },
      {
        heading: 'Why exp == 0 returns 1',
        body: `The base case is \`exp == 0\`, and it returns \`1\` — not \`0\`. This is
the mathematical rule that any number to the power zero is one, and it's exactly
what makes the recursion come out right: that final \`1\` is the "seed" the whole
chain of multiplications builds on.

If you returned \`0\` instead, the very last multiplication would zero out the
entire answer. Whenever a recursion accumulates a *product*, its base case must
be the multiplicative identity, \`1\` — just as a sum's base case is \`0\`.`,
      },
    ],
    workedExample: `// double a number exp times, recursively — same "shrink exp" shape
long times_two(int exp) {
    if (exp == 0) return 1;              // seed with 1, not 0
    return 2 * times_two(exp - 1);       // one more factor of 2
}
// times_two(4) = 2 * 2 * 2 * 2 * 1 = 16   (that's 2^4)`,
    whyItMatters: `Exponentiation-by-recursion is the first stepping stone to
*fast* power algorithms (squaring to do it in log time), which underpin
cryptography, hashing, and modular arithmetic. More immediately, it drills the
lesson that a product-accumulating recursion seeds with \`1\` — a pattern you'll
reuse constantly.`,
    commonMistakes: [
      'Returning `0` for the base case instead of `1`, which zeroes out the whole product.',
      'Recursing on the base (`pow_r(base - 1, exp)`) instead of the exponent — it\'s `exp` that must shrink.',
      'Reaching for `pow()` from `<math.h>` — the engine links without libm; build it from `*`.',
      'Using `int` for the result — powers overflow `int` fast; the signature is `long`.',
    ],
    hint: 'Two lines: `if (exp == 0) return 1;` then `return base * pow_r(base, exp - 1);`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%ld\\n", pow_r(2, 10));
    printf("%ld\\n", pow_r(3, 3));
    printf("%ld\\n", pow_r(5, 0));
    printf("%ld\\n", pow_r(2, 0));
    return 0;
}`,
  expectedStdout: `1024
27
1
1
`,
  reference: `long pow_r(int base, int exp) {
    if (exp == 0) return 1;
    return base * pow_r(base, exp - 1);
}
`,
};

export default exercise;
