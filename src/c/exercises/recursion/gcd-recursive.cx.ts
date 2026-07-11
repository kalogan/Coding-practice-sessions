import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'gcd-recursive',
  title: 'Greatest common divisor (Euclid)',
  module: '4 · Functions & Recursion',
  order: 340,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement gcd_r(a, b) to return the greatest common divisor of a and b
using Euclid's algorithm, recursively.

Euclid's rule: if b is 0, the answer is a; otherwise gcd(a, b) equals
gcd(b, a % b). For example gcd_r(48, 36) is 12 and gcd_r(17, 5) is 1.
You only write the function; a hidden harness checks it.`,
  starter: `int gcd_r(int a, int b) {
    // if b is 0, the answer is a
    // otherwise recurse on gcd_r(b, a % b)
    return 0;
}
`,
  lesson: {
    intro: `The *greatest common divisor* of two numbers is the largest integer
that divides both evenly. \`gcd(12, 8)\` is \`4\`; \`gcd(48, 36)\` is \`12\`. You
could find it by testing every candidate, but there's a beautiful 2000-year-old
shortcut: Euclid's algorithm.

Euclid's insight is that \`gcd(a, b)\` equals \`gcd(b, a % b)\`. Replacing \`a\`
with the remainder \`a % b\` shrinks the numbers fast while preserving the answer.
You repeat until the remainder hits \`0\`; the other number is then the GCD.`,
    sections: [
      {
        heading: 'The recursive Euclid',
        body: `This maps straight onto recursion. The *base case* is \`b == 0\`: when
the second number is zero, the first number \`a\` is the answer. The *recursive
case* replaces the pair \`(a, b)\` with \`(b, a % b)\` and calls itself.

Trace \`gcd_r(48, 36)\`: \`48 % 36\` is \`12\`, so it becomes \`gcd_r(36, 12)\`. Then
\`36 % 12\` is \`0\`, so it becomes \`gcd_r(12, 0)\`. Now \`b == 0\`, so it returns
\`12\`. Each step the numbers shrink toward the base case, and the remainder is
guaranteed to reach \`0\`.`,
      },
      {
        heading: 'The ternary operator ?:',
        body: `C has a compact way to write "if this, use that, otherwise use the
other": the *ternary conditional* \`condition ? valueIfTrue : valueIfFalse\`. It
is an *expression* — it produces a value — so you can hand it straight to
\`return\`.

The whole function becomes one line:
\`return b == 0 ? a : gcd_r(b, a % b);\`. Read it as "if \`b\` is 0, return \`a\`,
otherwise return \`gcd_r(b, a % b)\`." It's exactly the same logic as an
\`if/else\`, just condensed — handy for short "pick one of two values" cases.`,
      },
    ],
    workedExample: `// the same GCD written with if/else instead of the ternary
int gcd_long(int a, int b) {
    if (b == 0) return a;           // base case
    return gcd_long(b, a % b);      // recurse with the remainder
}
// gcd_long(17, 5) -> gcd_long(5, 2) -> gcd_long(2, 1) -> gcd_long(1, 0) -> 1`,
    whyItMatters: `Euclid's algorithm is one of computing's oldest and most elegant
recursions, and it's everywhere: reducing fractions to lowest terms, cryptography
(RSA key math), scheduling, and modular inverses all depend on it. It's also a
clean showcase of the ternary operator — a piece of C syntax you'll read in
other people's code constantly.`,
    commonMistakes: [
      'Returning `b` in the base case instead of `a` — when `b == 0`, the answer is `a`.',
      'Recursing as `gcd_r(a % b, b)` — the order matters; it\'s `gcd_r(b, a % b)`.',
      'Confusing `%` (remainder) with `/` (integer division) — Euclid needs the remainder.',
      'Writing the ternary as `b == 0 ? gcd_r(b, a % b) : a` — the true/false branches are swapped.',
    ],
    hint: 'The whole body is one line: `return b == 0 ? a : gcd_r(b, a % b);`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", gcd_r(12, 8));
    printf("%d\\n", gcd_r(48, 36));
    printf("%d\\n", gcd_r(17, 5));
    printf("%d\\n", gcd_r(100, 10));
    return 0;
}`,
  expectedStdout: `4
12
1
10
`,
  reference: `int gcd_r(int a, int b) {
    return b == 0 ? a : gcd_r(b, a % b);
}
`,
};

export default exercise;
