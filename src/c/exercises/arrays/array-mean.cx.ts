import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'array-mean',
  title: 'Average of an array',
  module: '5 · Arrays',
  order: 460,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement mean(a, n): return the average (arithmetic mean) of the int array a,
as a double. The mean is the sum of the elements divided by how many there are.

You may assume n >= 1. Note the return type is double, so {1, 2} should give 1.5, not 1.`,
  starter: `double mean(const int* a, int n) {
    // sum the ints, then divide by n as a double
    return 0.0;
}
`,
  lesson: {
    intro: `The average is "add them all up, then divide by how many." The summing part
is familiar. The subtle part is the **division** — and it hides one of C's most famous
beginner traps.

The elements are \`int\`, so their sum is an \`int\`. But the average of \`{1, 2}\` is
\`1.5\`, which no \`int\` can hold. To get the fractional answer, you have to force the
division to happen in \`double\` arithmetic.`,
    sections: [
      {
        heading: 'Integer division truncates',
        body: `In C, when *both* operands are integers, \`/\` does **integer division**:
it throws away the fractional part. So \`3 / 2\` is \`1\`, not \`1.5\` — the \`.5\` is
silently discarded. If you wrote \`return sum / n;\` with both \`sum\` and \`n\` as ints,
you'd compute the whole-number quotient and only *then* widen it to a double. The
damage is already done.`,
      },
      {
        heading: 'The (double) cast',
        body: `The fix is a **cast**: \`(double)sum\` makes a \`double\` copy of \`sum\`
for the division. Now the expression \`(double)sum / n\` has a \`double\` on one side, so
C promotes \`n\` to \`double\` too and performs real, fractional division. \`3\` becomes
\`(double)3 / 2\` = \`1.5\`.

You only need to cast one side; casting either operand pulls the whole division into
\`double\`. Casting \`sum\` is the conventional choice.`,
      },
    ],
    workedExample: `// sum as int, then divide in double:
int sum = 0;
for (int i = 0; i < n; i++) sum += a[i];
return (double)sum / n;   // WITHOUT the cast this truncates!`,
    whyItMatters: `The int-division gotcha bites nearly every C programmer once. Averages,
percentages, rates, ratios, normalizing data for a chart — any time you divide counts
and expect a fraction, you must reach for a \`double\` cast. Recognizing when a division
will silently truncate is a core C survival skill.`,
    commonMistakes: [
      'Writing `return sum / n;` with both ints — the fraction is truncated *before* it becomes a double.',
      'Casting the whole result, `(double)(sum / n)` — too late; the truncation already happened inside the parentheses.',
      'Declaring `sum` as a `double` unnecessarily — casting at the division is cleaner, though a double sum also works.',
      'Forgetting the problem guarantees `n >= 1`, so you never divide by zero.',
    ],
    hint: 'Sum the ints into an `int sum`, then `return (double)sum / n;`. The cast is what saves the fraction.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int a[] = {2, 4, 6};
    printf("%g\\n", mean(a, 3));
    int b[] = {1, 2};
    printf("%g\\n", mean(b, 2));
    int c[] = {5};
    printf("%g\\n", mean(c, 1));
    int d[] = {1, 1, 1, 1};
    printf("%g\\n", mean(d, 4));
    return 0;
}`,
  expectedStdout: `4
1.5
5
1
`,
  reference: `double mean(const int* a, int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) sum += a[i];
    return (double)sum / n;
}
`,
};

export default exercise;
