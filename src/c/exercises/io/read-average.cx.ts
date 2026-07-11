import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'read-average',
  title: 'Average of n numbers',
  module: '9 · Reading Input',
  order: 810,
  difficulty: 'medium',
  mode: 'program',
  prompt: `Read an integer \`n\`, then read \`n\` floating-point numbers. Print their average,
rounded to exactly TWO decimal places, followed by a newline.

Input:  \`n\` on the first line (or wherever), then \`n\` numbers (which may have
decimals, e.g. \`1.5\`).
Output: the average formatted with two decimals — use \`printf("%.2f\\n", avg)\`.

You may assume \`n\` is at least 1.`,
  starter: `#include <stdio.h>

int main(void) {
    // read n, then n doubles; print their average with two decimals
    return 0;
}
`,
  lesson: {
    intro: `Averages need decimals, so this exercise moves from \`int\` to \`double\` — C's type
for numbers with a fractional part. Reading a \`double\` with \`scanf\` uses a different
format specifier than an \`int\`, and printing one to a fixed number of decimals uses
another. Getting those two specifiers right is the whole exercise.

An average is "sum of the values divided by how many there are". The subtlety is
that if you divide two integers, C throws away the fraction. Using \`double\` for the
running sum keeps the division honest.`,
    sections: [
      {
        heading: 'Reading and printing doubles',
        body: `To *read* a \`double\` with \`scanf\`, the format is \`"%lf"\` (l-f, "long float") —
\`scanf("%lf", &x);\`. Note: for \`scanf\` a \`double\` needs \`%lf\`, not \`%f\`.

To *print* a \`double\`, \`%f\` works, and \`%.2f\` prints exactly two digits after the
decimal point (rounding as needed). So \`printf("%.2f\\n", 2.0)\` outputs \`2.00\`, and
\`printf("%.2f\\n", 2.5)\` outputs \`2.50\`. The \`.2\` is the precision.`,
      },
      {
        heading: 'Divide as doubles, not ints',
        body: `If \`sum\` is a \`double\`, then \`sum / n\` is computed in floating point even
though \`n\` is an \`int\` — C promotes \`n\` to \`double\` for the division. That gives
the real average.

Contrast \`7 / 2\` (both \`int\`) which is \`3\` in C — the \`.5\` is discarded. Keep your
accumulator a \`double\` and you avoid that trap entirely. (You can also write
\`(double) n\` to force it, but if \`sum\` is already a \`double\` you don't need to.)`,
      },
    ],
    workedExample: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    double sum = 0.0;
    for (int i = 0; i < n; i++) {
        double x;
        scanf("%lf", &x);     // %lf to READ a double
        sum += x;
    }
    double avg = sum / n;     // double / int -> double
    printf("%.2f\\n", avg);    // two decimals
    return 0;
}
// The %lf-to-read / %.2f-to-print split is the thing to remember.`,
    whyItMatters: `Fixed-precision decimal output shows up everywhere money, measurements, or
statistics are involved — you almost never want to dump a double's full 15-digit
expansion. And the "integer division silently truncates" bug is one of the most
common in all of C; learning to reach for \`double\` at the right moment saves hours.`,
    commonMistakes: [
      'Using `%f` instead of `%lf` in `scanf` for a `double`. `scanf` specifically needs `%lf`; `%f` is for reading a `float`.',
      'Summing into an `int` and only casting at the end — the numbers you read already have decimals, so the `int` throws them away as you go.',
      'Printing with plain `%f` (six decimals) instead of `%.2f`, so the output has too many digits.',
      'Dividing two ints (`intSum / n`) before converting to double, truncating the result.',
    ],
    hint: 'Use `double sum = 0.0;`, read each value with `scanf("%lf", &x);`, then `printf("%.2f\\n", sum / n);`. The `%lf` (read) vs `%.2f` (print) pairing is the key.',
  },
  cases: [
    { name: 'whole numbers', stdin: `3\n1 2 3\n`, expectedStdout: `2.00\n` },
    { name: 'with decimals', stdin: `2\n1.5 2.5\n`, expectedStdout: `2.00\n` },
    { name: 'single value', stdin: `1\n5\n`, expectedStdout: `5.00\n` },
    { name: 'non-round average', stdin: `4\n1 2 3 4\n`, expectedStdout: `2.50\n` },
  ],
  reference: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    double sum = 0.0;
    for (int i = 0; i < n; i++) {
        double x;
        scanf("%lf", &x);
        sum += x;
    }
    printf("%.2f\\n", sum / n);
    return 0;
}
`,
};

export default exercise;
