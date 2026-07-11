import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'array-max',
  title: 'Largest element',
  module: '5 · Arrays',
  order: 410,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement array_max(a, n): return the largest value in the int array a.

You may assume n >= 1, so the array is never empty. Index the elements with a[i].`,
  starter: `int array_max(const int* a, int n) {
    // return the biggest of a[0] .. a[n-1]
    return 0;
}
`,
  lesson: {
    intro: `Finding the largest value in an array is the classic *running best* pattern.
You keep one variable that holds the biggest thing you've seen so far, then walk the
array and update it whenever you meet something bigger.

The trick is choosing the right starting value for "biggest so far". A tempting but
buggy choice is \`0\` — that breaks the moment every element is negative. The safe,
always-correct seed is the array's own first element, \`a[0]\`.`,
    sections: [
      {
        heading: 'Seed with a[0], then start at i = 1',
        body: `Set \`int best = a[0];\` before the loop. Since \`a[0]\` is already
accounted for, begin the loop at \`i = 1\`. That's why the problem guarantees
\`n >= 1\`: you need at least one element to seed \`best\` with.

Inside the loop, compare: \`if (a[i] > best) best = a[i];\`. After the loop, \`best\`
holds the maximum of the whole array.`,
      },
      {
        heading: 'Why not seed with 0?',
        body: `If you write \`int best = 0;\` and the array is \`{-1, -5, -2}\`, your
code returns \`0\` — a value that isn't even in the array. Seeding with an actual
element (\`a[0]\`) guarantees the answer is always a real member of the array, no
matter the signs of the numbers.`,
      },
    ],
    workedExample: `// finding the SMALLEST works the same way, flipped:
int best = a[0];
for (int i = 1; i < n; i++) {
    if (a[i] < best) best = a[i];   // '<' for min, '>' for max
}
return best;`,
    whyItMatters: `"Track the best-so-far while scanning once" is everywhere: highest
score, cheapest price, closest point, longest streak. It's a single O(n) pass with
one comparison per element — you'll reuse this shape constantly.`,
    commonMistakes: [
      'Seeding `best` with `0` instead of `a[0]` — wrong whenever all elements are negative.',
      'Starting the loop at `i = 0` after seeding with `a[0]` — harmless here, but starting at `i = 1` is the clean idiom.',
      'Using `>=` vs `>` — either works for the value, but `>` keeps the *first* max if you later need the index.',
      'Forgetting that the array could be a single element — the loop simply never runs and you return `a[0]`.',
    ],
    hint: 'Declare `int best = a[0];`, loop `i` from 1 to n-1, and replace `best` whenever `a[i] > best`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int a[] = {3, 7, 2, 9, 4};
    printf("%d\\n", array_max(a, 5));
    int b[] = {-1, -5, -2};
    printf("%d\\n", array_max(b, 3));
    int c[] = {42};
    printf("%d\\n", array_max(c, 1));
    int d[] = {5, 5, 5};
    printf("%d\\n", array_max(d, 3));
    return 0;
}`,
  expectedStdout: `9
-1
42
5
`,
  reference: `int array_max(const int* a, int n) {
    int best = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] > best) best = a[i];
    }
    return best;
}
`,
};

export default exercise;
