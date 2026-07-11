import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'is-sorted',
  title: 'Is it sorted?',
  module: '5 · Arrays',
  order: 470,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement is_sorted(a, n): return 1 if the int array a is sorted in
non-decreasing order (each element is >= the one before it), and 0 otherwise.

Equal neighbours are fine — {5, 5, 6} counts as sorted. An array of 0 or 1 elements is
trivially sorted, so return 1 for those.`,
  starter: `int is_sorted(const int* a, int n) {
    // return 1 if non-decreasing, else 0
    return 1;
}
`,
  lesson: {
    intro: `To decide if an array is sorted, you don't need to look at the whole thing at
once — you just check every **adjacent pair**. If every element is at least as big as
the one right before it, the array is in non-decreasing order. Find a single pair that's
out of order and you can stop: it's not sorted.

This is the *early-return* pattern. You're looking for a counterexample; the moment you
find one, the answer is settled.`,
    sections: [
      {
        heading: 'Compare a[i] with a[i-1]',
        body: `Loop \`i\` from \`1\` (not 0), and compare each element to its predecessor:
\`if (a[i] < a[i - 1]) return 0;\`. Starting at \`i = 1\` means \`a[i - 1]\` is always a
valid index (\`a[0]\` at the smallest). A strict \`<\` is exactly right: it flags only a
*true* decrease, so equal neighbours like \`5, 5\` pass through as sorted.

If the loop finishes without ever returning \`0\`, no pair was out of order — so you
\`return 1;\` at the very end.`,
      },
      {
        heading: 'The trivial cases handle themselves',
        body: `When \`n\` is 0 or 1 there are no adjacent pairs to check: the loop
condition \`i < n\` is false right away, the body never runs, and control falls to the
final \`return 1;\`. An empty or single-element array is considered sorted by
convention, and this structure gives you that for free — no special-casing needed.`,
      },
    ],
    workedExample: `// checking STRICTLY increasing is one character different:
for (int i = 1; i < n; i++) {
    if (a[i] < a[i - 1]) return 0;   // use '<=' here for strictly increasing
}
return 1;`,
    whyItMatters: `Verifying order is a building block: binary search assumes a sorted
array, merge steps assume sorted inputs, and test suites assert "the output came back
sorted." The adjacent-pair scan with an early exit is also the general shape for "does
this sequence ever violate a rule?" — validating timestamps, monotonic counters, or
non-overlapping intervals all reuse it.`,
    commonMistakes: [
      'Starting the loop at `i = 0`, then reading `a[i - 1]` as `a[-1]` — an out-of-bounds access.',
      'Using `<=` instead of `<`, which wrongly rejects arrays with equal neighbours like `{5, 5, 6}`.',
      'Returning `1` inside the loop on the first ordered pair, before checking the rest.',
      'Forgetting the final `return 1;` after the loop, leaving the sorted case with no return value.',
    ],
    hint: 'Loop from `i = 1`; if `a[i] < a[i - 1]` return 0 immediately. If you get through the whole loop, return 1.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int a[] = {1, 2, 3};
    printf("%d\\n", is_sorted(a, 3));
    int b[] = {1, 3, 2};
    printf("%d\\n", is_sorted(b, 3));
    int c[] = {5, 5, 6};
    printf("%d\\n", is_sorted(c, 3));
    int d[] = {9};
    printf("%d\\n", is_sorted(d, 1));
    int e[] = {3, 2, 1};
    printf("%d\\n", is_sorted(e, 3));
    return 0;
}`,
  expectedStdout: `1
0
1
1
0
`,
  reference: `int is_sorted(const int* a, int n) {
    for (int i = 1; i < n; i++) {
        if (a[i] < a[i - 1]) return 0;
    }
    return 1;
}
`,
};

export default exercise;
