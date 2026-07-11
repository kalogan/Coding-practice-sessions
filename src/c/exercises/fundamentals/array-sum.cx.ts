import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'array-sum',
  title: 'Sum an array',
  module: '5 · Arrays',
  order: 400,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement sum(a, n): return the sum of the first n elements of the int array a.

This is your first pointer + loop. n can be 0 (an empty range → 0). The array is
passed as a pointer; index it with a[i].`,
  starter: `int sum(const int* a, int n) {
    // add up a[0] .. a[n-1]
    return 0;
}
`,
  lesson: {
    intro: `An *array* is a row of values of the same type, stored back-to-back in memory.
You reach the i-th one with \`a[i]\`, counting from **zero**: \`a[0]\` is the first,
\`a[1]\` the second, and for an array of length \`n\`, the last is \`a[n-1]\`.

To add them all up, you *loop*: visit each index in turn and accumulate a running
total.`,
    sections: [
      {
        heading: 'The for loop',
        body: `\`for (int i = 0; i < n; i++)\` has three parts separated by semicolons:
start (\`i = 0\`), keep-going condition (\`i < n\`), and step (\`i++\`, which means
"add 1 to i"). The body runs once for each value of \`i\` from 0 up to \`n-1\` — exactly
the valid indices of the array.`,
      },
      {
        heading: 'Why `int* a` and not `int a[]`',
        body: `In C an array decays to a *pointer* to its first element when passed to a
function — that's why the parameter is \`const int* a\`. For now, just read
\`const int* a\` as "an array of ints I promise not to modify" and index it with
\`a[i]\` exactly like a normal array. \`n\` travels separately because C arrays don't
carry their own length.`,
      },
    ],
    workedExample: `int total = 0;
for (int i = 0; i < n; i++) {
    total += a[i];   // total = total + a[i]
}
return total;`,
    whyItMatters: `"Walk an array with a for loop and accumulate" is the single most
common shape in all of programming. Summing, finding a max, counting matches,
building matrices — they're all this pattern with a different line in the middle.`,
    commonMistakes: [
      'Looping `i <= n` instead of `i < n` — that reads `a[n]`, one past the end (a bug C won\'t stop you from writing).',
      'Forgetting to start the accumulator at 0.',
      'When `n` is 0 the loop body never runs and you correctly return 0 — make sure your code handles that naturally.',
    ],
    hint: 'Declare `int total = 0;` before the loop, add `a[i]` to it each iteration, and `return total;` after.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int x[] = {1, 2, 3, 4, 5};
    printf("%d\\n", sum(x, 5));
    int y[] = {-3, 3, 10};
    printf("%d\\n", sum(y, 3));
    int z[] = {42};
    printf("%d\\n", sum(z, 1));
    printf("%d\\n", sum(z, 0));
    return 0;
}`,
  expectedStdout: `15
10
42
0
`,
  reference: `int sum(const int* a, int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += a[i];
    return s;
}
`,
};

export default exercise;
