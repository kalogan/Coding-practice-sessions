import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'max-until-zero',
  title: 'Maximum until a zero',
  module: '9 · Reading Input',
  order: 820,
  difficulty: 'medium',
  mode: 'program',
  prompt: `Read integers one at a time until you read a \`0\`. The \`0\` is a *sentinel* — a
stop signal that is NOT one of the values. Print the maximum of all the values that
came before the \`0\`, followed by a newline.

Input:  a stream of integers ending in \`0\`. You don't know the count in advance.
Output: the largest value seen before the \`0\`, and a newline.

You may assume there is at least one value before the \`0\`.`,
  starter: `#include <stdio.h>

int main(void) {
    // keep reading ints until you read 0; print the max of the ones before it
    return 0;
}
`,
  lesson: {
    intro: `Sometimes you don't get a count up front — instead the input ends with a special
marker value. That marker is called a *sentinel*. Here the sentinel is \`0\`: keep
reading until you hit it, then stop. The \`0\` itself is a signal, not data, so it
must NOT be counted toward the answer.

This is a different loop shape from the "read n, loop n times" pattern. You don't
know how many numbers there are, so you loop *until a condition* — reading inside the
loop's test.`,
    sections: [
      {
        heading: 'scanf in the loop condition',
        body: `The clean way to write a sentinel loop is to do the reading right in the
\`while\` condition:

\`while (scanf("%d", &x) == 1 && x != 0) { ... }\`

\`scanf\` returns how many items it successfully read, so \`== 1\` means "we got an
integer". Then \`x != 0\` checks it isn't the sentinel. The loop body only runs for
real values — the \`0\` fails the test and the loop ends before processing it, so the
sentinel is never counted.`,
      },
      {
        heading: 'Tracking a running maximum',
        body: `To find the largest value, keep a variable \`max\` and update it whenever you
see something bigger: \`if (x > max) max = x;\`.

The tricky part is the starting value. If you initialize \`max\` to \`0\`, negative
inputs would wrongly stay at \`0\`. A robust fix: read the *first* value before the
loop and seed \`max\` with it, then loop over the rest. That way \`max\` always starts
as a real value from the data.`,
      },
    ],
    workedExample: `#include <stdio.h>

int main(void) {
    int x, min;
    scanf("%d", &min);        // seed with the first value
    while (min != 0 && scanf("%d", &x) == 1 && x != 0) {
        if (x < min) min = x; // running MINIMUM here
    }
    printf("%d\\n", min);
    return 0;
}
// Same sentinel skeleton, tracking the minimum instead. Seeding with the
// first value makes it correct even when every number is negative.`,
    whyItMatters: `Sentinel-controlled loops are how you process a stream whose length you don't
know ahead of time — reading a file until end-of-file, parsing until a terminator,
consuming user input until "quit". Pairing that with a running aggregate (max, min,
sum, count) is a pattern you'll reuse in nearly every input-processing program.`,
    commonMistakes: [
      'Counting or comparing the sentinel `0` itself. It must stop the loop, not participate in the max.',
      'Initializing `max` to `0` and then feeding all-negative input — the answer wrongly comes out `0`. Seed `max` with the first real value instead.',
      'Reading with `scanf` at the *bottom* of the loop, so the sentinel gets processed once before the check catches it.',
      'Forgetting the `\\n` in the final `printf`.',
    ],
    hint: 'Read the first value into `max` before the loop. Then `while (max != 0 && scanf("%d", &x) == 1 && x != 0)` and inside do `if (x > max) max = x;`. Print `max` with a trailing newline.',
  },
  cases: [
    { name: 'peak in the middle', stdin: `3 7 2 0\n`, expectedStdout: `7\n` },
    { name: 'single value', stdin: `5 0\n`, expectedStdout: `5\n` },
    { name: 'all negative', stdin: `-3 -7 -1 0\n`, expectedStdout: `-1\n` },
    { name: 'repeated max', stdin: `10 10 9 0\n`, expectedStdout: `10\n` },
  ],
  reference: `#include <stdio.h>

int main(void) {
    int x, max;
    scanf("%d", &max);
    while (max != 0 && scanf("%d", &x) == 1 && x != 0) {
        if (x > max) max = x;
    }
    printf("%d\\n", max);
    return 0;
}
`,
};

export default exercise;
