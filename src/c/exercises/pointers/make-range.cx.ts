import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'make-range',
  title: 'Allocate a 0..n-1 array',
  module: '7 · Pointers & Memory',
  order: 630,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement make_range(n): allocate a new int array of length n on the heap,
fill it with 0, 1, 2, ..., n-1, and return a pointer to it.

Use malloc. The array must outlive the function, so it can't be a local — the caller
takes ownership and is responsible for freeing it.`,
  starter: `int* make_range(int n) {
    // malloc n ints, fill 0..n-1, return the pointer
    return 0;
}
`,
  lesson: {
    intro: `A local array vanishes the moment its function returns — its memory is
reclaimed, so returning a pointer to it is a bug. When you need an array that *lives on*
after the function ends, you allocate it on the *heap* with \`malloc\`.

\`malloc(size)\` asks the system for \`size\` bytes and returns a pointer to them. That
memory stays yours until you explicitly \`free\` it, so it's safe to return the pointer
to the caller.`,
    sections: [
      {
        heading: 'Sizing the request with sizeof',
        body: `\`malloc\` counts in *bytes*, but you think in *elements*. Bridge the gap
with \`sizeof\`: for n ints, ask for \`malloc(n * sizeof(int))\`. Using
\`sizeof(int)\` (rather than hard-coding 4) keeps the code correct on any platform.

\`malloc\` returns a \`void*\` (a typeless address). Assigning it to an \`int*\` in C
is fine and needs no cast — the pointer now points at room for n ints, which you fill
with a normal loop: \`r[i] = i;\`.`,
      },
      {
        heading: 'Ownership: who calls free?',
        body: `Heap memory is not cleaned up automatically. Whoever ends up holding the
pointer must eventually call \`free\` on it exactly once, or the program *leaks* that
memory. When a function like this returns a freshly malloc'd pointer, the convention is
that the *caller* now owns it and is responsible for \`free\`.

So \`make_range\` itself does not free — it hands the live pointer back. The code that
called it frees when it's done: \`int* r = make_range(5); ... free(r);\`.`,
      },
    ],
    workedExample: `#include <stdlib.h>
// allocate n ints, each set to its index squared
int* squares(int n) {
    int* p = malloc(n * sizeof(int));  // room for n ints
    for (int i = 0; i < n; i++) {
        p[i] = i * i;                  // fill it in
    }
    return p;                          // caller must free(p)
}`,
    whyItMatters: `Dynamic allocation is how real programs handle data whose size isn't
known until runtime — reading a file of unknown length, building a growable buffer,
returning a computed array. Every data structure you'll implement later (dynamic
arrays, linked lists, trees) rests on malloc and the discipline of matching each
allocation with a free.`,
    commonMistakes: [
      'Returning a local array (`int r[n]; ... return r;`) — that memory is gone once the function returns; you get a dangling pointer.',
      'Sizing with `malloc(n)` instead of `malloc(n * sizeof(int))` — that\'s only n bytes, far too small for n ints.',
      'Freeing inside `make_range` before returning — that hands back a pointer to already-released memory.',
      'Forgetting `#include <stdlib.h>`, which declares `malloc` and `free`.',
    ],
    hint: 'Do `int* r = malloc(n * sizeof(int));`, fill with `for (int i = 0; i < n; i++) r[i] = i;`, then `return r;`. The caller frees it.',
  },
  harness: `#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int* r = make_range(5);
    for (int i = 0; i < 5; i++) printf("%d ", r[i]);
    printf("\\n");
    free(r);
    int* s = make_range(1);
    for (int i = 0; i < 1; i++) printf("%d ", s[i]);
    printf("\\n");
    free(s);
    int* t = make_range(3);
    for (int i = 0; i < 3; i++) printf("%d ", t[i]);
    printf("\\n");
    free(t);
    return 0;
}`,
  expectedStdout: `0 1 2 3 4
0
0 1 2
`,
  reference: `#include <stdlib.h>
int* make_range(int n) {
    int* r = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) r[i] = i;
    return r;
}
`,
};

export default exercise;
