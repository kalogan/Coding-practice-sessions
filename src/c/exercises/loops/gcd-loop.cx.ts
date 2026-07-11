import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'gcd-loop',
  title: 'Greatest common divisor',
  module: '3 · Loops',
  order: 250,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement gcd(a, b): return the greatest common divisor of a and b — the
largest whole number that divides both evenly.

Use the Euclidean algorithm with a \`while\` loop. Both inputs are positive.`,
  starter: `int gcd(int a, int b) {
    // repeatedly replace (a, b) with (b, a % b)
    return 0;
}
`,
  lesson: {
    intro: `The *greatest common divisor* of two numbers is the biggest number that
divides both without a remainder. \`gcd(12, 8)\` is 4; \`gcd(48, 36)\` is 12. You could
test every candidate downward, but there's a beautiful shortcut over 2000 years old:
the Euclidean algorithm.

Its insight: the gcd of \`a\` and \`b\` equals the gcd of \`b\` and the *remainder* of
\`a\` divided by \`b\`. Repeat that and the numbers shrink fast; when the remainder hits
0, the other number is your answer.`,
    sections: [
      {
        heading: 'The remainder operator %',
        body: `\`a % b\` gives the remainder after dividing \`a\` by \`b\`: \`12 % 8\` is
4, \`8 % 4\` is 0. A remainder of 0 means \`b\` divides \`a\` exactly — so \`b\` itself
is the common divisor we're after.

Euclid's step is: replace the pair \`(a, b)\` with \`(b, a % b)\`. Each step the second
number gets strictly smaller, so it's guaranteed to reach 0 eventually.`,
      },
      {
        heading: 'The swap, done safely',
        body: `Loop \`while (b != 0)\`. Inside, you need the new pair \`(b, a % b)\` — but
computing \`a % b\` and reassigning both in the wrong order loses a value. Use a
temporary:

\`int t = a % b; a = b; b = t;\`

When the loop exits, \`b\` is 0 and \`a\` holds the gcd, so \`return a;\`. In C you can
even write the condition as \`while (b)\` — a nonzero \`int\` counts as true, 0 as false.`,
      },
    ],
    workedExample: `// trace gcd(48, 36):
// t = 48 % 36 = 12;  a = 36, b = 12
// t = 36 % 12 =  0;  a = 12, b =  0
// loop ends, return a = 12
int t = a % b;
a = b;
b = t;`,
    whyItMatters: `Euclid's algorithm is a cornerstone of number theory and pops up in
cryptography, in reducing fractions to lowest terms, and in scheduling problems. It's
also a perfect example of a loop whose termination comes from a value provably shrinking
each pass — the exact reasoning you use to convince yourself any loop actually finishes.`,
    commonMistakes: [
      'Assigning `a = b` before saving `a % b`, which corrupts the computation — use a temporary.',
      'Looping `while (a != 0)` or checking the wrong variable, so it stops at the wrong time.',
      'Returning `b` (which is 0 at the end) instead of `a`.',
      'Forgetting that `%` is the *remainder*, not division — `a / b` is a different value.',
    ],
    hint: 'Loop `while (b != 0) { int t = a % b; a = b; b = t; }`, then `return a;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", gcd(12, 8));
    printf("%d\\n", gcd(48, 36));
    printf("%d\\n", gcd(17, 5));
    printf("%d\\n", gcd(100, 10));
    return 0;
}`,
  expectedStdout: `4
12
1
10
`,
  reference: `int gcd(int a, int b) {
    while (b != 0) {
        int t = a % b;
        a = b;
        b = t;
    }
    return a;
}
`,
};

export default exercise;
