import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'count-if',
  title: 'Count elements matching a predicate',
  module: '16 · Pointers, Level 2',
  order: 1620,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement count_if(a, n, pred): return how many of the first n elements of the
array a satisfy the predicate pred.

\`pred\` is a function pointer of type \`int (*)(int)\`: given an element it returns a
truthy value (nonzero) if the element "matches" and 0 if it doesn't. Count the
elements for which \`pred(a[i])\` is nonzero.

The harness supplies predicates like "is positive" and "is even". n can be 0 (count
nothing → 0).`,
  starter: `int count_if(const int* a, int n, int (*pred)(int)) {
    // count the elements where pred(a[i]) is nonzero
    return 0;
}
`,
  lesson: {
    intro: `A *predicate* is just a function that answers a yes/no question about a
value. In C there is no \`bool\` needed: the convention is that the function returns
a nonzero int for "yes" and \`0\` for "no". A test like \`x > 0\` already evaluates to
\`1\` or \`0\`, so \`int is_positive(int x){ return x > 0; }\` is a complete predicate.

\`count_if\` takes such a predicate as a function pointer and tallies how many array
elements it says "yes" to. It walks the array, calls \`pred\` on each element, and
adds 1 to a counter whenever the answer is nonzero.`,
    sections: [
      {
        heading: 'Nonzero is "true"',
        body: `In C any nonzero integer is treated as true and \`0\` is false. So you can
write \`if (pred(a[i]))\` directly — no need to compare against anything. If \`pred\`
returns \`1\` (or any nonzero value) the branch runs; if it returns \`0\` it is skipped.

Keep a running counter starting at \`0\`, and inside the loop do
\`if (pred(a[i])) count++;\`. After the loop, \`count\` holds the answer.`,
      },
      {
        heading: 'Why a callback here',
        body: `You could write a separate \`count_positives\`, \`count_evens\`,
\`count_big\`… each an almost-identical loop. Instead, \`count_if\` factors the loop out
once and lets the *caller* supply the test. Change the question by passing a different
predicate — the traversal never changes.

This is exactly the design behind the standard-library \`qsort\`, which takes a
*comparator* function pointer so one sort routine can order any type by any rule.`,
      },
    ],
    workedExample: `// count how many elements are negative
int is_negative(int x) { return x < 0; }

int count_matching(const int* a, int n, int (*pred)(int)) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (pred(a[i])) count++;   // nonzero return == "matches"
    }
    return count;
}
// on {-2, 5, -1, 0} with is_negative -> 2`,
    whyItMatters: `Filtering and counting by a condition is everywhere: how many orders
are overdue, how many pixels are bright, how many scores pass. Passing the condition as
a predicate function pointer is how C libraries stay generic — one loop, any rule.`,
    commonMistakes: [
      'Comparing `pred(a[i]) == 1` — a predicate may return any nonzero value for true, so test `if (pred(a[i]))` instead of insisting on exactly 1.',
      'Forgetting to initialize the counter to 0.',
      'Passing `a[i]` to the counter but calling `pred` on the index `i` — call `pred(a[i])`, the element, not `pred(i)`.',
      'Looping `i <= n`, reading one element past the end of the array.',
    ],
    hint: 'Start `int count = 0;`, loop 0..n-1, and do `if (pred(a[i])) count++;`, then `return count;`.',
  },
  harness: `#include <stdio.h>
static int is_positive(int x){return x > 0;}
static int is_even(int x){return x % 2 == 0;}
int main(void) {
    int a[] = {-1, 2, -3, 4, 5};
    printf("%d\\n", count_if(a, 5, is_positive));
    int b[] = {1, 2, 3, 4};
    printf("%d\\n", count_if(b, 4, is_even));
    int e[1] = {0};
    printf("%d\\n", count_if(e, 0, is_positive));
    return 0;
}`,
  expectedStdout: `3
2
0
`,
  reference: `int count_if(const int* a, int n, int (*pred)(int)) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (pred(a[i])) count++;
    }
    return count;
}
`,
};

export default exercise;
