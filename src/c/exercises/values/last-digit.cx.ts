import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'last-digit',
  title: 'Last digit of a number',
  module: '1 · Values & Operators',
  order: 30,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement last_digit(n) so it returns the last (ones-place) digit of the
non-negative integer n.

For example the last digit of 42 is 2, and the last digit of 100 is 0. You only
write the function — a hidden harness checks several numbers.`,
  starter: `int last_digit(int n) {
    // return the ones-place digit of n
    return 0;
}
`,
  lesson: {
    intro: `C gives you two operators for splitting whole numbers apart: \`/\` and \`%\`.

When both operands are \`int\`, \`/\` does *integer division* — it divides and throws away
any remainder. So \`42 / 10\` is \`4\`, not \`4.2\`. Its partner \`%\` (the *modulo* or
*remainder* operator) gives back exactly what \`/\` threw away: \`42 % 10\` is \`2\`, the
remainder after dividing 42 by 10.`,
    sections: [
      {
        heading: 'Remainder by 10 peels off the last digit',
        body: `Every number is written in base 10, so its last digit is precisely its
remainder when divided by 10. \`n % 10\` asks "what's left over after taking out all the
whole tens?" — and that leftover is the ones place.

Trace it: \`12345 % 10\`. There are 1234 whole tens in 12345 (that's \`12340\`), and
\`12345 - 12340 = 5\` is left over. So \`12345 % 10\` is \`5\` — the last digit. This works
for any non-negative \`n\`, including \`7 % 10\` which is just \`7\` (7 has no whole tens).`,
      },
      {
        heading: 'Its partner: dividing drops the last digit',
        body: `The companion move is \`n / 10\`, which shifts every digit one place to the
right and drops the ones. \`12345 / 10\` is \`1234\` — the same number with its last digit
removed.

Together \`% 10\` and \`/ 10\` are how you take a number apart digit by digit: peel the
last digit with \`% 10\`, drop it with \`/ 10\`, repeat. You only need the \`% 10\` half for
this exercise, but keep \`/ 10\` in mind — it returns in later problems.`,
      },
    ],
    workedExample: `// is n even? the remainder after dividing by 2 tells you
int is_even(int n) {
    return n % 2 == 0;   // remainder 0 means evenly divisible
}
// is_even(6) -> 1 (true),  is_even(7) -> 0 (false)`,
    whyItMatters: `Remainder is one of the most-used operators in real code: wrapping an
index around a fixed-size buffer (\`i % length\`), checking divisibility, converting a
number to its digits, or spreading work across N workers with \`id % N\`. Once you see
\`% 10\` peel a digit, you understand the trick behind printing any number by hand.`,
    commonMistakes: [
      'Confusing `%` with `/` — `n / 10` drops the last digit, `n % 10` returns it.',
      'Thinking `%` is a percent sign — in C it is the integer remainder operator.',
      'Using the wrong divisor: `n % 100` gives the last *two* digits, not one.',
      'Forgetting the semicolon `;` at the end of the `return` line.',
    ],
    hint: 'The body is a single line: `return n % 10;`. The remainder after dividing by 10 is exactly the ones-place digit.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", last_digit(7));
    printf("%d\\n", last_digit(42));
    printf("%d\\n", last_digit(100));
    printf("%d\\n", last_digit(9));
    printf("%d\\n", last_digit(12345));
    return 0;
}`,
  expectedStdout: `7
2
0
9
5
`,
  reference: `int last_digit(int n) {
    return n % 10;
}
`,
};

export default exercise;
