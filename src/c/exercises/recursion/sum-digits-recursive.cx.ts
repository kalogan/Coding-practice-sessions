import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'sum-digits-recursive',
  title: 'Sum the digits, recursively',
  module: '4 · Functions & Recursion',
  order: 320,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement sum_digits(n) to return the sum of the decimal digits of a
non-negative integer n, using recursion.

For example sum_digits(123) is 1 + 2 + 3 = 6, and sum_digits(99999) is 45.
Assume n >= 0. You only write the function; a hidden harness checks it.`,
  starter: `int sum_digits(int n) {
    // base case: a single digit (n < 10) is its own sum
    // recursive case: n % 10  +  sum_digits(n / 10)
    return 0;
}
`,
  lesson: {
    intro: `Recursion isn't only for math formulas — it shines whenever you can
peel one piece off a problem and hand the rest to a smaller call. Summing an
integer's digits is a perfect fit.

The two tools you need are the integer operators \`%\` (remainder) and \`/\`
(integer division). For any number, \`n % 10\` gives you its *last* digit, and
\`n / 10\` gives you everything *except* the last digit. So \`123 % 10\` is \`3\`,
and \`123 / 10\` is \`12\`. That pair lets you strip one digit at a time.`,
    sections: [
      {
        heading: 'Reduce the problem: drop a digit each call',
        body: `The recursive idea: the digit sum of \`n\` is its last digit plus the
digit sum of everything before it. In code, that's
\`n % 10 + sum_digits(n / 10)\`. Each call throws away one digit, so the number
gets shorter every time and is guaranteed to shrink toward the base case.

This is the same "shrink the input" pattern as factorial, but the shrinking is
by *dividing out a digit* rather than subtracting one. The knack of recursion is
spotting which small step makes the problem strictly smaller.`,
      },
      {
        heading: 'The single-digit base case',
        body: `When does the peeling stop? When there's only one digit left — that
is, when \`n < 10\`. A single digit's "sum" is just the digit itself, so
\`if (n < 10) return n;\`.

This also cleanly handles \`n == 0\`: zero is less than ten, so it returns \`0\`
straight away. Notice the base case must come *before* the recursive line;
otherwise \`n / 10\` would keep producing \`0\` and never stop cleanly.`,
      },
    ],
    workedExample: `// count how many digits a number has, recursively — same peeling trick
int num_digits(int n) {
    if (n < 10) return 1;               // one digit left
    return 1 + num_digits(n / 10);      // this digit, plus the rest
}
// num_digits(456) = 1 + num_digits(45) = 1 + 1 + num_digits(4) = 3`,
    whyItMatters: `Digit-by-digit processing with \`% 10\` and \`/ 10\` is a
workhorse: checksums, digital-root puzzles, converting numbers to strings, and
validating IDs or card numbers all lean on it. Doing it recursively cements the
habit of finding the one small step that makes a problem smaller — the core move
behind every recursive solution.`,
    commonMistakes: [
      'Swapping the operators: `n % 10` is the last digit, `n / 10` is the rest — mixing them up breaks it.',
      'Writing the base case as `n == 0` only — then `sum_digits(5)` would recurse into `sum_digits(0)` and add an extra step; `n < 10` is cleaner and correct.',
      'Putting the recursive call before the base-case check, so it never terminates.',
      'Forgetting to add `n % 10` and just returning `sum_digits(n / 10)` — you lose the current digit.',
    ],
    hint: 'Two lines: `if (n < 10) return n;` then `return n % 10 + sum_digits(n / 10);`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", sum_digits(0));
    printf("%d\\n", sum_digits(7));
    printf("%d\\n", sum_digits(123));
    printf("%d\\n", sum_digits(99999));
    return 0;
}`,
  expectedStdout: `0
7
6
45
`,
  reference: `int sum_digits(int n) {
    if (n < 10) return n;
    return n % 10 + sum_digits(n / 10);
}
`,
};

export default exercise;
