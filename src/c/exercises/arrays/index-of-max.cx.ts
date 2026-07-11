import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'index-of-max',
  title: 'Index of the largest',
  module: '5 · Arrays',
  order: 420,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement index_of_max(a, n): return the INDEX (position) of the largest
element in the int array a. If several elements tie for largest, return the index of
the first one. You may assume n >= 1.`,
  starter: `int index_of_max(const int* a, int n) {
    // return the position of the biggest element
    return 0;
}
`,
  lesson: {
    intro: `Sometimes you don't want the biggest *value* — you want *where* it lives.
"Which day had the most sales?" needs the day (the index), not just the amount. The
pattern is almost identical to finding the max, but you remember an **index** instead
of a value.

Store \`int best = 0;\` — the position of the best element seen so far, starting at the
first element. When you find a bigger one, update \`best\` to that new index.`,
    sections: [
      {
        heading: 'Compare a[i] against a[best]',
        body: `Because you're tracking an index, your comparison reaches back through it:
\`if (a[i] > a[best]) best = i;\`. Read \`a[best]\` as "the biggest value so far" — it's
always the element sitting at position \`best\`. When \`a[i]\` beats it, \`i\` becomes the
new champion position.

At the end, return \`best\` (the index), not \`a[best]\` (the value).`,
      },
      {
        heading: 'Ties go to the first',
        body: `Using a strict \`>\` (not \`>=\`) means a later element must be *strictly*
bigger to displace the current best. Equal values never displace it, so the **first**
occurrence of the maximum wins — exactly the tie-break the problem asks for. Switch to
\`>=\` and you'd get the *last* one instead.`,
      },
    ],
    workedExample: `// same idea, but returning the position:
int best = 0;               // index of the max so far
for (int i = 1; i < n; i++) {
    if (a[i] > a[best]) {   // note a[best], not best
        best = i;
    }
}
return best;                // the INDEX`,
    whyItMatters: `Returning a position instead of a value unlocks selection sort,
argmax in machine learning (which class scored highest?), leaderboard lookups, and any
"find the winner and then do something with it" task. The index is the handle you use
to reach related data.`,
    commonMistakes: [
      'Returning `a[best]` (the value) when the problem asks for `best` (the index).',
      'Comparing `a[i] > best` — that compares a value to an index. It must be `a[i] > a[best]`.',
      'Using `>=`, which returns the *last* max instead of the first.',
      'Seeding `best` with something other than a valid index like `0`.',
    ],
    hint: 'Keep `int best = 0;`, loop from `i = 1`, and set `best = i;` whenever `a[i] > a[best]`. Return `best`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int a[] = {3, 7, 2, 9, 4};
    printf("%d\\n", index_of_max(a, 5));
    int b[] = {10, 2, 3};
    printf("%d\\n", index_of_max(b, 3));
    int c[] = {1, 1, 9};
    printf("%d\\n", index_of_max(c, 3));
    int d[] = {5};
    printf("%d\\n", index_of_max(d, 1));
    return 0;
}`,
  expectedStdout: `3
0
2
0
`,
  reference: `int index_of_max(const int* a, int n) {
    int best = 0;
    for (int i = 1; i < n; i++) {
        if (a[i] > a[best]) best = i;
    }
    return best;
}
`,
};

export default exercise;
