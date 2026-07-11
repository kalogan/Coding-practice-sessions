import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'list-length',
  title: 'Length of a linked list',
  module: '11 · Data Structures in C',
  order: 1000,
  difficulty: 'easy',
  mode: 'function',
  prompt: `A linked list is a chain of nodes. Each node holds a value and a pointer to
the next node; the last node points to NULL.

Implement list_length(head) so it returns the number of nodes in the list.
An empty list (head is NULL) has length 0.

The struct is already defined for you at the top of the file — write the function
below it. A hidden harness builds a few lists and checks your count.`,
  starter: `#include <stddef.h>  // for NULL

struct Node {
    int val;
    struct Node* next;
};

int list_length(const struct Node* head) {
    // walk the chain, counting nodes, until you reach NULL
    return 0;
}
`,
  lesson: {
    intro: `Arrays store their elements side by side in one solid block of memory. A
*linked list* takes a different approach: each value lives in its own little box
called a *node*, and every node carries a pointer to the *next* box. Follow the
pointers and you visit every value in order.

Look at the struct: \`struct Node\` has an \`int val\` (the value it holds) and a
\`struct Node* next\` (the address of the following node). The very last node stores
\`NULL\` in \`next\` — that is the "end of the road" marker. To measure the list, you
start at \`head\` and hop from node to node until you fall off the end.`,
    sections: [
      {
        heading: 'A node points to another node',
        body: `The magic word in the struct is \`struct Node* next\` — a member whose type is
"pointer to another \`Node\`". That is what lets nodes form a chain: node A's \`next\`
holds the address of node B, B's \`next\` holds the address of C, and C's \`next\` is
\`NULL\`.

Because a node can point to its own kind, the structure can be any length. Nothing
is stored contiguously — the nodes could be scattered anywhere in memory, and the
pointers stitch them into a sequence.`,
      },
      {
        heading: 'Walking the list with -> and a while loop',
        body: `To move through the list you keep a pointer that "currently points at" a node.
The loop \`while (head) head = head->next;\` reads as: while \`head\` is not \`NULL\`,
advance \`head\` to the next node. When \`head\` becomes \`NULL\`, you have run off the
end and the loop stops.

That arrow, \`head->next\`, is the key operator. \`head\` is a pointer, so to reach a
member you either write \`(*head).next\` (dereference, then take the member) or the
tidy shorthand \`head->next\`. They mean exactly the same thing; C programmers almost
always use \`->\`.`,
      },
    ],
    workedExample: `// count how many nodes are in the chain
int count = 0;
while (head != NULL) {   // stop when we hit the end marker
    count++;             // saw one more node
    head = head->next;   // hop to the next node
}
return count;            // NULL head never enters the loop -> 0`,
    whyItMatters: `Linked lists are the first "pointer-powered" data structure, and the
walk-until-NULL pattern is everywhere: iterating a queue, a hash-table bucket, a
list of open files, or the free list inside an allocator. Once "start at head,
follow next until NULL" is second nature, stacks, queues, and trees all feel
familiar — they are the same idea with more pointers.`,
    commonMistakes: [
      'Forgetting the empty-list case: if `head` is `NULL` the loop body must never run, so the answer is `0`.',
      'Writing `head.next` instead of `head->next`. `head` is a *pointer*, so you need the arrow (or `(*head).next`).',
      'Advancing the pointer *before* counting, or counting after the loop — count the node, then move to `head->next`.',
      'Creating an infinite loop by never reassigning `head` inside the loop, so it never reaches `NULL`.',
    ],
    hint: 'Keep a counter starting at 0. In a `while (head)` loop, add one to the counter and set `head = head->next;` each pass. Return the counter.',
  },
  harness: `#include <stdio.h>
int main(void) {
    struct Node c = {3, NULL};
    struct Node b = {2, &c};
    struct Node a = {1, &b};
    printf("%d\\n", list_length(&a));

    struct Node solo = {9, NULL};
    printf("%d\\n", list_length(&solo));

    printf("%d\\n", list_length(NULL));
    return 0;
}`,
  expectedStdout: `3
1
0
`,
  reference: `#include <stddef.h>  // for NULL

struct Node {
    int val;
    struct Node* next;
};

int list_length(const struct Node* head) {
    int count = 0;
    while (head != NULL) {
        count++;
        head = head->next;
    }
    return count;
}
`,
};

export default exercise;
