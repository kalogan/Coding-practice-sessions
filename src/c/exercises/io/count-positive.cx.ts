import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'count-positive',
  title: 'Count the positives',
  module: '9 · Reading Input',
  order: 850,
  difficulty: 'easy',
  mode: 'program',
  prompt: `Read an integer \`n\`, then read \`n\` integers. Print how many of them are
strictly greater than \`0\` (positive), followed by a newline.

Input:  \`n\`, then \`n\` integers.
Output: a single count and a newline.

"Strictly greater than 0" means \`0\` itself does NOT count — only values \`> 0\`.`,
  starter: `#include <stdio.h>

int main(void) {
    // read n, then n ints; count how many are > 0 and print the count
    return 0;
}
`,
  lesson: {
    intro: `Counting how many items in a stream satisfy a condition is one of the most
common little tasks in programming. The recipe is always the same: a *counter*
starting at \`0\`, a loop over the items, and an \`if\` that bumps the counter by one
whenever the condition holds.

Here the condition is "strictly positive" — the value is greater than \`0\`. The word
*strictly* is a hint about the boundary: \`0\` is not positive, so it must not be
counted.`,
    sections: [
      {
        heading: 'A counter guarded by an if',
        body: `Declare \`int count = 0;\` before the loop. Inside the loop, after reading each
value \`x\`, test it: \`if (x > 0) count++;\`. The \`count++\` adds one to \`count\` — it's
shorthand for \`count = count + 1\`.

Only values that pass the test increment the counter; everything else is read and
ignored. After the loop, \`count\` holds exactly how many values satisfied the
condition.`,
      },
      {
        heading: 'Strictly greater vs. greater-or-equal',
        body: `The comparison operator you choose defines the boundary. \`x > 0\` is *strictly
greater* — \`0\` fails it, so \`0\` is not counted. \`x >= 0\` would *include* \`0\`. These
one-character differences are exactly where counting bugs hide, so read the
requirement carefully: here it's \`> 0\`.

Negative numbers and \`0\` both fail \`x > 0\`, so a list like \`-1, 0, 5\` counts just
one positive.`,
      },
    ],
    workedExample: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int count = 0;
    for (int i = 0; i < n; i++) {
        int x;
        scanf("%d", &x);
        if (x % 2 == 0) count++;   // counts EVENS here
    }
    printf("%d\\n", count);
    return 0;
}
// Same counting skeleton with a different test. Swap the condition for x > 0
// to count strictly-positive values.`,
    whyItMatters: `"Count the items matching a rule" underlies tallies, filters, statistics, and
validation everywhere — how many errors in a log, how many passing scores, how many
pixels above a threshold. The counter-plus-conditional pattern is a building block
you'll assemble into bigger programs without even thinking about it.`,
    commonMistakes: [
      'Using `x >= 0`, which wrongly counts `0` as positive. The requirement is strictly `> 0`.',
      'Forgetting to initialize `count` to `0`, so it starts from garbage.',
      'Incrementing `count` outside the `if`, which counts every value instead of only the positives.',
      'Reading fewer or more than `n` values because of an off-by-one loop bound.',
    ],
    hint: 'Set `int count = 0;`. In the loop read `&x`, then `if (x > 0) count++;`. After the loop `printf("%d\\n", count);`. The key detail is `> 0`, not `>= 0`.',
  },
  cases: [
    { name: 'mixed signs', stdin: `5\n-1 2 -3 4 5\n`, expectedStdout: `3\n` },
    { name: 'all negative', stdin: `3\n-1 -2 -3\n`, expectedStdout: `0\n` },
    { name: 'all positive', stdin: `4\n1 2 3 4\n`, expectedStdout: `4\n` },
    { name: 'zero is not positive', stdin: `1\n0\n`, expectedStdout: `0\n` },
  ],
  reference: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int count = 0;
    for (int i = 0; i < n; i++) {
        int x;
        scanf("%d", &x);
        if (x > 0) count++;
    }
    printf("%d\\n", count);
    return 0;
}
`,
};

export default exercise;
