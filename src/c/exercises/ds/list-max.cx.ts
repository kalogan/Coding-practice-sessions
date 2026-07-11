import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'list-max',
  title: 'Largest value in a linked list',
  module: '11 · Data Structures in C',
  order: 1020,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Given the head of a non-empty linked list, return the largest value stored in
any node. You may assume the list has at least one node (head is never NULL).

The struct is defined at the top of the file — write list_max below it. A hidden
harness builds a few lists and checks your answer.`,
  starter: `#include <stddef.h>  // for NULL

struct Node {
    int val;
    struct Node* next;
};

int list_max(const struct Node* head) {
    // track the biggest value seen while walking the list
    return 0;
}
`,
  lesson: {
    intro: `Finding the maximum is another walk-the-list problem, but the accumulator is
different from a sum. You keep a "best so far" variable and, at each node, ask: is
this value bigger than my best? If so, adopt it. When the walk finishes, "best so
far" is the overall maximum.

The subtle part is choosing the *starting* value for "best so far". For a sum, 0 is
a safe neutral start. For a max, there is no safe neutral integer — so instead you
seed the running max with the first node's value.`,
    sections: [
      {
        heading: 'Seed with the first element, not with zero',
        body: `A tempting mistake is \`int best = 0;\`. But if every value is negative — say
\`-1, -9, -3\` — the real maximum is \`-1\`, and starting at 0 would wrongly report 0.
Zero is not a member of the list, so it has no business being the answer.

The fix: because the list is guaranteed non-empty, start with \`int best = head->val;\`
and then walk the *rest* of the list comparing against it. The seed is a real value
from the data, so the answer is always something that actually appears in the list.`,
      },
      {
        heading: 'Compare, then maybe update',
        body: `At each node, compare \`head->val\` to \`best\`. If \`head->val > best\`, update
\`best = head->val;\`. Otherwise leave \`best\` alone. A compact way to write the whole
step is \`if (head->val > best) best = head->val;\`.

You can start the loop at \`head\` again (comparing the seed to itself on the first
pass is harmless) or at \`head->next\` to skip the redundant compare — both give the
same answer. Comparing from \`head\` is simpler and just as correct.`,
      },
    ],
    workedExample: `// find the smallest value instead (same shape, flipped compare)
int best = head->val;          // seed with a real value
while (head != NULL) {
    if (head->val < best)      // '<' because we want the minimum
        best = head->val;
    head = head->next;
}
return best;`,
    whyItMatters: `"Scan once, keep the best" is the backbone of countless algorithms: the
top score on a leaderboard, the closest match, the cheapest route, the loudest
sample. It runs in a single pass with a single extra variable — the cleanest kind of
efficiency. Seeding the running best from real data (not a guessed sentinel) is a
habit that prevents whole classes of edge-case bugs.`,
    commonMistakes: [
      'Seeding `best` with `0` — this breaks on all-negative lists like `-1, -9, -3` (answer should be `-1`, not `0`).',
      'Using `>=` vs `>` carelessly; either works for a max, but flipping to `<` gives you the *minimum* by mistake.',
      'Forgetting to advance `head = head->next;`, causing an infinite loop.',
      'Dereferencing `head->val` to seed *before* checking the list is non-empty — safe here only because the prompt guarantees at least one node.',
    ],
    hint: 'Seed `int best = head->val;`. Then in a `while (head)` loop, do `if (head->val > best) best = head->val;` and advance. Return `best`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    struct Node c = {2, NULL};
    struct Node b = {7, &c};
    struct Node a = {3, &b};
    printf("%d\\n", list_max(&a));

    struct Node solo = {5, NULL};
    printf("%d\\n", list_max(&solo));

    struct Node z = {-3, NULL};
    struct Node y = {-9, &z};
    struct Node x = {-1, &y};
    printf("%d\\n", list_max(&x));
    return 0;
}`,
  expectedStdout: `7
5
-1
`,
  reference: `#include <stddef.h>  // for NULL

struct Node {
    int val;
    struct Node* next;
};

int list_max(const struct Node* head) {
    int best = head->val;
    while (head != NULL) {
        if (head->val > best) {
            best = head->val;
        }
        head = head->next;
    }
    return best;
}
`,
};

export default exercise;
