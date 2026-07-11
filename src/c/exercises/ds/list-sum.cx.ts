import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'list-sum',
  title: 'Sum of a linked list',
  module: '11 · Data Structures in C',
  order: 1010,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Given the head of a linked list, add up every node's value and return the total.
An empty list (head is NULL) sums to 0.

The struct is defined at the top of the file — write list_sum below it. A hidden
harness builds a few lists and checks your total.`,
  starter: `#include <stddef.h>  // for NULL

struct Node {
    int val;
    struct Node* next;
};

int list_sum(const struct Node* head) {
    // walk the list, adding each node's val to a running total
    return 0;
}
`,
  lesson: {
    intro: `You already know how to *walk* a linked list: start at \`head\` and follow
\`next\` pointers until you hit \`NULL\`. Summing the list is that same walk with one
small addition — instead of counting nodes, you accumulate their values.

The pattern is called an *accumulator*: a variable that starts at a neutral value
(0 for a sum) and grows as you visit each element. This is one of the most reusable
shapes in all of programming.`,
    sections: [
      {
        heading: 'The accumulator pattern',
        body: `Declare a total before the loop: \`int total = 0;\`. The starting value 0 is the
*identity* for addition — adding it changes nothing, so it is the correct "empty"
answer. Then, at each node, do \`total += head->val;\` which is shorthand for
\`total = total + head->val;\`.

When the list is empty, the loop body never runs and \`total\` stays 0 — exactly the
answer we want. That is the beauty of picking the right starting value: the edge
case handles itself.`,
      },
      {
        heading: 'Read the value, then advance',
        body: `Order matters inside the loop. First read the current node's value with
\`head->val\`, then move on with \`head = head->next;\`. If you advance first, you skip
the current node's value and eventually read \`NULL->val\`, which crashes.

A safe loop body is two lines: \`total += head->val;\` then \`head = head->next;\`.
Every node is read exactly once, and the walk still terminates at \`NULL\`.`,
      },
    ],
    workedExample: `// add up all the values in the chain
int total = 0;
while (head != NULL) {
    total += head->val;   // fold this node's value into the running sum
    head = head->next;    // move to the next node
}
return total;             // empty list -> total stays 0`,
    whyItMatters: `"Fold a running result over a sequence" is a universal move: totaling a
shopping cart, averaging sensor readings, hashing a string, checksumming a packet.
Once you can walk a structure and accumulate as you go, you can compute almost any
aggregate — max, min, product, count-of-matches — by swapping the starting value and
the combine step.`,
    commonMistakes: [
      'Starting the accumulator at something other than `0` (e.g. leaving it uninitialized), which corrupts the total.',
      'Advancing `head = head->next;` *before* reading `head->val`, skipping a value or dereferencing `NULL`.',
      'Using `head.val` instead of `head->val` — `head` is a pointer, so the arrow is required.',
      'Returning inside the loop after the first node instead of after the whole walk finishes.',
    ],
    hint: 'Start with `int total = 0;`. In a `while (head)` loop, do `total += head->val;` then `head = head->next;`. Return `total` after the loop.',
  },
  harness: `#include <stdio.h>
int main(void) {
    struct Node c = {3, NULL};
    struct Node b = {2, &c};
    struct Node a = {1, &b};
    printf("%d\\n", list_sum(&a));

    struct Node y = {-5, NULL};
    struct Node x = {10, &y};
    printf("%d\\n", list_sum(&x));

    printf("%d\\n", list_sum(NULL));
    return 0;
}`,
  expectedStdout: `6
5
0
`,
  reference: `#include <stddef.h>  // for NULL

struct Node {
    int val;
    struct Node* next;
};

int list_sum(const struct Node* head) {
    int total = 0;
    while (head != NULL) {
        total += head->val;
        head = head->next;
    }
    return total;
}
`,
};

export default exercise;
