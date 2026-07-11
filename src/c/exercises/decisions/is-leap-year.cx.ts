import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'is-leap-year',
  title: 'Is it a leap year?',
  module: '2 · Making Decisions',
  order: 130,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement is_leap(y) so it returns 1 if year y is a leap year and 0 otherwise.

The rule: a year is a leap year if it's divisible by 4 — EXCEPT century years
(divisible by 100), which are only leap years if they're also divisible by 400.
So 2000 is a leap year, but 1900 is not.`,
  starter: `int is_leap(int y) {
    // return 1 if y is a leap year, else 0
    return 0;
}
`,
  lesson: {
    intro: `Some decisions can't be made with a single comparison — they combine
several conditions. The leap-year rule is a small, famous example that needs you
to weave a few tests together with *boolean logic*.

Two operators do the weaving. \`&&\` means "and" — the whole thing is true only
when *both* sides are true. \`||\` means "or" — true when *either* side is true.
With these you can express compound questions like "divisible by 4 and not by
100".`,
    sections: [
      {
        heading: 'The modulo operator finds remainders',
        body: `\`%\` (modulo) gives the *remainder* after integer division. \`y % 4\` is
what's left over when you divide \`y\` by 4. If that remainder is \`0\`, then \`y\`
divides evenly by 4 — so \`y % 4 == 0\` is the test for "divisible by 4".

Likewise \`y % 100 != 0\` means "not divisible by 100", and \`y % 400 == 0\` means
"divisible by 400". Modulo plus a comparison is how you ask divisibility
questions in C.`,
      },
      {
        heading: 'Combining with && , || and parentheses',
        body: `The rule reads: divisible by 4, AND (not divisible by 100 OR divisible
by 400). In C:

\`(y % 4 == 0 && y % 100 != 0) || (y % 400 == 0)\`

The parentheses are not decoration — they control grouping. \`&&\` binds tighter
than \`||\`, but wrapping each clause makes the intent unmistakable and prevents
subtle precedence bugs. When logic gets compound, parenthesize generously.`,
      },
    ],
    workedExample: `// is n a multiple of both 3 and 5?
int fizzbuzz_hit(int n) {
    return (n % 3 == 0) && (n % 5 == 0);   // both must hold
}
// fizzbuzz_hit(15) -> 1    fizzbuzz_hit(9) -> 0`,
    whyItMatters: `Compound conditions are the daily bread of programming: "logged in
AND has permission", "empty OR whitespace", "in range and not expired". And
returning a comparison directly — letting the expression *be* the 1-or-0 answer
instead of wrapping it in an if/else — is a clean, idiomatic habit you'll use
constantly. The leap-year rule itself is a real gotcha that has caused actual
production bugs.`,
    commonMistakes: [
      'Only checking `y % 4 == 0` and forgetting the century exceptions, so 1900 wrongly comes out as a leap year.',
      'Dropping the parentheses and getting the `&&` / `||` grouping wrong. Wrap each clause to be safe.',
      'Writing an if/else that returns `1` or `0` — that works, but the whole boolean expression already *is* the answer; you can `return` it directly.',
      'Confusing `%` (remainder) with division `/`. `y % 4` is the leftover, not the quotient.',
    ],
    hint: 'You can return the boolean expression straight: `return (y % 4 == 0 && y % 100 != 0) || (y % 400 == 0);`. A comparison in C already evaluates to 1 (true) or 0 (false).',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", is_leap(2000));
    printf("%d\\n", is_leap(1900));
    printf("%d\\n", is_leap(2024));
    printf("%d\\n", is_leap(2023));
    printf("%d\\n", is_leap(2100));
    return 0;
}`,
  expectedStdout: `1
0
1
0
0
`,
  reference: `int is_leap(int y) {
    return (y % 4 == 0 && y % 100 != 0) || (y % 400 == 0);
}
`,
};

export default exercise;
