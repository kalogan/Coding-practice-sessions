import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'echo-reversed',
  title: 'Echo the numbers reversed',
  module: '9 · Reading Input',
  order: 830,
  difficulty: 'easy',
  mode: 'program',
  prompt: `Read an integer \`n\`, then read \`n\` integers. Print them back in REVERSE order,
separated by single spaces, followed by a newline.

Input:  \`n\`, then \`n\` integers.
Output: the same integers in reverse order, space-separated, on one line, ending
with a newline. (A trailing space before the newline is tolerated, but clean output
is nicer.)

To reverse, store the values in an array first, then walk it backward.`,
  starter: `#include <stdio.h>

int main(void) {
    // read n and n ints into an array, then print them back-to-front
    return 0;
}
`,
  lesson: {
    intro: `To reverse a sequence you need to remember all of it before you can print the
last one first. A single \`int\` variable only holds one value at a time, so you need
an *array* — a fixed-size row of same-typed slots you can index into.

The plan is two loops: one to *fill* the array as you read, and one to *print* it in
reverse by walking the index from the last slot down to the first.`,
    sections: [
      {
        heading: 'Arrays: many values, one name',
        body: `\`int a[100];\` declares room for 100 \`int\`s, reached as \`a[0]\` through \`a[99]\`.
Indices start at \`0\`, so the valid range for \`n\` items is \`a[0]\` to \`a[n-1]\`.

Fill it in a loop: \`for (int i = 0; i < n; i++) scanf("%d", &a[i]);\`. Note the \`&\`
again — \`&a[i]\` is the address of slot \`i\`, which is where \`scanf\` writes. Size the
array comfortably larger than any input you expect.`,
      },
      {
        heading: 'Walking backward, and the spacing',
        body: `To print in reverse, count *down*: \`for (int i = n - 1; i >= 0; i--)\`. Start
at the last valid index \`n-1\` and stop at \`0\` (use \`>=\`, not \`>\`).

For "space-separated" output, print a space *before* every element except the
first: \`if (i < n - 1) printf(" ");\` then \`printf("%d", a[i]);\`. That yields
\`5 4 3 2 1\` with no leading space and no trailing space. After the loop, print one
\`\\n\` to end the line.`,
      },
    ],
    workedExample: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int a[100];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);   // fill

    for (int i = 0; i < n; i++) {                     // FORWARD here
        if (i > 0) printf(" ");
        printf("%d", a[i]);
    }
    printf("\\n");
    return 0;
}
// This echoes them in original order. Flip the second loop to i = n-1; i >= 0; i--
// to reverse — and move the space guard to "not the first printed one".`,
    whyItMatters: `Buffering input into an array so you can process it in a different order — or
more than once — is fundamental. Reversing, sorting, and searching all start by
getting the data into an array. And managing the separators so there's no stray
leading/trailing space is a small skill you'll use every time you format a list.`,
    commonMistakes: [
      'Off-by-one on the reverse loop: starting at `a[n]` (out of bounds) instead of `a[n-1]`, or stopping at `i > 0` and missing `a[0]`.',
      'Printing a space after every number, which leaves a trailing space (tolerated here, but avoid it by guarding the separator).',
      'Sizing the array smaller than `n` and writing past the end — undefined behavior.',
      'Forgetting the final `printf("\\n")`, so the line has no newline.',
    ],
    hint: 'Fill `a[i]` for `i` from `0` to `n-1`. Then loop `i` from `n-1` down to `0`, printing a space before each element except the first printed one (`if (i < n - 1) printf(" ");`), then the number. End with `printf("\\n");`.',
  },
  cases: [
    { name: 'five values', stdin: `5\n1 2 3 4 5\n`, expectedStdout: `5 4 3 2 1\n` },
    { name: 'single value', stdin: `1\n9\n`, expectedStdout: `9\n` },
    { name: 'three values', stdin: `3\n7 8 9\n`, expectedStdout: `9 8 7\n` },
  ],
  reference: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int a[100];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    for (int i = n - 1; i >= 0; i--) {
        if (i < n - 1) printf(" ");
        printf("%d", a[i]);
    }
    printf("\\n");
    return 0;
}
`,
};

export default exercise;
