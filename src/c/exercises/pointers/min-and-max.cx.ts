import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'min-and-max',
  title: 'Return two values via out-pointers',
  module: '7 · Pointers & Memory',
  order: 620,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement min_max(a, n, out_min, out_max): scan the array a of length n
(n >= 1) and write the smallest value to *out_min and the largest to *out_max.

The function returns nothing. Its results come out through the two pointers the
caller hands you.`,
  starter: `void min_max(const int* a, int n, int* out_min, int* out_max) {
    // write the smallest to *out_min and the largest to *out_max
}
`,
  lesson: {
    intro: `A C function can \`return\` only one value. But often you need two — here,
both the minimum and the maximum from a single pass. The classic fix is an
*out-parameter*: instead of returning the answer, the caller gives you a pointer to a
variable and you write the answer *into* it with \`*out_min = ...\`.

The caller declares two plain ints, passes their addresses (\`&mn, &mx\`), and after
the call those variables hold your results.`,
    sections: [
      {
        heading: 'Seed from the first element',
        body: `To track a running min and max, start both at \`a[0]\` — a real value
that's definitely in the array — then compare the rest against them. Seeding from the
first element is why the problem guarantees \`n >= 1\`: an empty array has no value to
start from.

Avoid seeding min at 0 or "a big number" guesses; those break on all-negative or
all-huge inputs. The first element is always a safe, correct starting point.`,
      },
      {
        heading: 'Write through the pointers, once',
        body: `You can keep local variables \`lo\` and \`hi\` during the loop and only
write \`*out_min = lo; *out_max = hi;\` at the end — that's clean and avoids
dereferencing repeatedly. Or you can update \`*out_min\` and \`*out_max\` directly
each iteration. Either works; the key is that the *final* values land in the caller's
variables through the \`*\` writes.`,
      },
    ],
    workedExample: `// find the sum AND the count of positives via out-params
void stats(const int* a, int n, int* out_sum, int* out_pos) {
    int s = 0, p = 0;
    for (int i = 0; i < n; i++) {
        s += a[i];
        if (a[i] > 0) p++;
    }
    *out_sum = s;   // hand both results back
    *out_pos = p;   // through the caller's pointers
}`,
    whyItMatters: `Out-parameters are everywhere in C's standard library and OS APIs:
\`strtol\` returns the number but writes the parse position through a pointer,
\`scanf\` fills your variables via \`&\`, and countless functions return an error code
while delivering the real payload through an out-pointer. It's how C works around the
one-return-value limit.`,
    commonMistakes: [
      'Seeding min with 0 (or max with 0) instead of `a[0]` — wrong whenever every element is above or below zero.',
      'Starting the loop at `i = 0` after already consuming `a[0]` as the seed is fine, but forgetting to seed at all and reading an uninitialized local is a bug.',
      'Writing to `out_min` instead of `*out_min` — that reassigns the local pointer, not the caller\'s int.',
      'Assuming the array is non-empty without the `n >= 1` guarantee; an empty array has no min or max.',
    ],
    hint: 'Set `int lo = a[0], hi = a[0];`, loop from `i = 1`, update `lo`/`hi` on each element, then `*out_min = lo; *out_max = hi;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int a[] = {3, 7, 2, 9, 4};
    int mn, mx;
    min_max(a, 5, &mn, &mx);
    printf("%d %d\\n", mn, mx);
    int b[] = {5};
    min_max(b, 1, &mn, &mx);
    printf("%d %d\\n", mn, mx);
    int c[] = {-1, -9, -3};
    min_max(c, 3, &mn, &mx);
    printf("%d %d\\n", mn, mx);
    return 0;
}`,
  expectedStdout: `2 9
5 5
-9 -1
`,
  reference: `void min_max(const int* a, int n, int* out_min, int* out_max) {
    int lo = a[0], hi = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] < lo) lo = a[i];
        if (a[i] > hi) hi = a[i];
    }
    *out_min = lo;
    *out_max = hi;
}
`,
};

export default exercise;
