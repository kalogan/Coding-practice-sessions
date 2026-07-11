import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'reverse-list',
  title: 'Reverse a linked list',
  module: '11 · Data Structures in C',
  order: 1030,
  difficulty: 'hard',
  mode: 'function',
  prompt: `Reverse the linked list in place: flip every node's next pointer so the chain
runs backwards, then return a pointer to the new head (the old last node).

For example 1 -> 2 -> 3 becomes 3 -> 2 -> 1, and reverse_list returns the node
holding 3. Reversing NULL returns NULL.

The struct is defined at the top of the file — write reverse_list below it. A hidden
harness reverses a few lists and prints them.`,
  starter: `#include <stddef.h>  // for NULL

struct Node {
    int val;
    struct Node* next;
};

struct Node* reverse_list(struct Node* head) {
    // rewire each node's 'next' to point backwards; return the new head
    return head;
}
`,
  lesson: {
    intro: `Reversing a linked list is the classic pointer puzzle. You do not move any
values or allocate new nodes — you just flip the direction of every \`next\` pointer.
The node that was last becomes first, and you return it as the new head.

The catch: the moment you point a node's \`next\` *backwards*, you lose your only way
forward — that pointer was the trail to the rest of the list. The solution is to
carry three pointers at once so you never lose your place.`,
    sections: [
      {
        heading: 'The three-pointer dance: prev, curr, next',
        body: `Keep three pointers. \`prev\` is the part already reversed (starts \`NULL\`, since
nothing is behind the head yet). \`curr\` is the node you are working on (starts at
\`head\`). \`nxt\` is a temporary that remembers where to go next *before* you overwrite
the link.

Each iteration does four steps in this exact order: (1) \`nxt = curr->next;\` save the
rest of the list; (2) \`curr->next = prev;\` flip this node to point backwards;
(3) \`prev = curr;\` the reversed part now includes \`curr\`; (4) \`curr = nxt;\` advance
to the saved next node. Repeat while \`curr\` is not \`NULL\`.`,
      },
      {
        heading: 'Why save next first, and what to return',
        body: `Step 1 is non-negotiable. Once step 2 runs \`curr->next = prev;\`, the original
\`curr->next\` is gone — if you had not stashed it in \`nxt\`, the tail of the list would
be unreachable and lost. Saving before overwriting is the whole trick.

When the loop ends, \`curr\` is \`NULL\` (you walked off the end) and \`prev\` points at
the *last node you reversed* — which is the old tail, now the new head. So you
\`return prev;\`. For an empty list, the loop never runs and \`prev\` is still \`NULL\`,
which is the correct reversed-empty result.`,
      },
    ],
    workedExample: `struct Node* prev = NULL;      // reversed part (nothing yet)
struct Node* curr = head;      // node we're flipping
while (curr != NULL) {
    struct Node* nxt = curr->next; // 1. remember the rest
    curr->next = prev;             // 2. flip this link backwards
    prev = curr;                   // 3. extend the reversed part
    curr = nxt;                    // 4. advance
}
return prev;                   // old tail is the new head`,
    whyItMatters: `Reversal is a rite of passage — it appears in interviews constantly because
it proves you can manipulate pointers without losing data. The same "save, rewire,
advance" discipline shows up when you splice nodes out of a list, insert into the
middle, or rebalance a tree. Getting comfortable holding several pointers at once,
in a deliberate order, is a core systems-programming skill.`,
    commonMistakes: [
      'Overwriting `curr->next = prev;` *before* saving it, which permanently loses the rest of the list.',
      'Returning `head` (the old head, now the new tail with `next == NULL`) instead of `prev`.',
      'Initializing `prev` to `head` instead of `NULL`, which leaves a cycle or a stray link.',
      'Doing the four steps out of order — the sequence save → flip → advance-prev → advance-curr is exact.',
    ],
    hint: 'Use `prev = NULL`, `curr = head`. Loop while `curr`: save `nxt = curr->next`, set `curr->next = prev`, then `prev = curr`, `curr = nxt`. Return `prev`.',
  },
  harness: `#include <stdio.h>

static void print_list(const struct Node* p) {
    int first = 1;
    while (p != NULL) {
        if (!first) printf(" ");
        printf("%d", p->val);
        first = 0;
        p = p->next;
    }
    printf("\\n");
}

int main(void) {
    struct Node c = {3, NULL};
    struct Node b = {2, &c};
    struct Node a = {1, &b};
    print_list(reverse_list(&a));

    struct Node solo = {1, NULL};
    print_list(reverse_list(&solo));

    print_list(reverse_list(NULL));
    return 0;
}`,
  expectedStdout: `3 2 1
1

`,
  reference: `#include <stddef.h>  // for NULL

struct Node {
    int val;
    struct Node* next;
};

struct Node* reverse_list(struct Node* head) {
    struct Node* prev = NULL;
    struct Node* curr = head;
    while (curr != NULL) {
        struct Node* nxt = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}
`,
};

export default exercise;
