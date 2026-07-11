import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'count-matches',
  title: 'Count matching elements',
  module: '5 · Arrays',
  order: 430,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement count_matches(a, n, target): return how many of the first n
elements of the int array a are equal to target.

If n is 0, or nothing matches, the answer is 0.`,
  starter: `int count_matches(const int* a, int n, int target) {
    // count how many elements equal target
    return 0;
}
`,
  lesson: {
    intro: `Counting is the *accumulator* pattern with a filter. Instead of adding every
element (like a sum), you add \`1\` only when an element passes a test — here, when it
equals \`target\`.

You need one counter, starting at \`0\`. Walk the array, and each time an element
matches, bump the counter by one.`,
    sections: [
      {
        heading: 'An if inside the loop',
        body: `The heart of it is a conditional in the loop body:
\`if (a[i] == target) count++;\`. Note the **double** equals \`==\` for comparison — a
single \`=\` is assignment and would be a bug (it would overwrite \`a[i]\`... except
\`a\` is \`const\`, so the compiler would actually catch that one for you).

\`count++\` means "add 1 to count". It only runs on the iterations where the \`if\` is
true, so \`count\` ends up holding exactly the number of matches.`,
      },
      {
        heading: 'The empty case for free',
        body: `When \`n\` is 0 the loop condition \`i < n\` is false immediately, so the
body never runs and \`count\` stays at its initial \`0\`. You don't need a special check
for the empty array — starting the accumulator at \`0\` handles it naturally.`,
      },
    ],
    workedExample: `// counting EVEN numbers uses the same shape, different test:
int count = 0;
for (int i = 0; i < n; i++) {
    if (a[i] % 2 == 0) {   // swap this test for '== target'
        count++;
    }
}
return count;`,
    whyItMatters: `"Count the items that satisfy a condition" underpins histograms,
tallying votes, frequency tables, and the WHERE ... COUNT of a database query. Change
the test in the middle and the same skeleton answers a thousand questions.`,
    commonMistakes: [
      'Writing `if (a[i] = target)` with one `=` (assignment) instead of `==` (comparison).',
      'Forgetting to initialize `count` to `0`.',
      'Incrementing `count` outside the `if`, which counts *every* element instead of the matches.',
      'Returning early on the first match instead of scanning the whole array.',
    ],
    hint: 'Start `int count = 0;`, loop over all n elements, and do `count++;` inside `if (a[i] == target)`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int a[] = {1, 2, 2, 3, 2};
    printf("%d\\n", count_matches(a, 5, 2));
    int b[] = {1, 2, 3};
    printf("%d\\n", count_matches(b, 3, 9));
    int c[] = {7, 7, 7};
    printf("%d\\n", count_matches(c, 3, 7));
    int d[] = {4};
    printf("%d\\n", count_matches(d, 0, 5));
    return 0;
}`,
  expectedStdout: `3
0
3
0
`,
  reference: `int count_matches(const int* a, int n, int target) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] == target) count++;
    }
    return count;
}
`,
};

export default exercise;
