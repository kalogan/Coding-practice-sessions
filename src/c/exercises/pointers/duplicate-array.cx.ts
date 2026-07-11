import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'duplicate-array',
  title: 'Duplicate an array',
  module: '7 · Pointers & Memory',
  order: 640,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement dup_array(a, n): allocate a new int array of length n on the heap,
copy each element of a into it, and return a pointer to the fresh copy.

The result must be an independent copy — changing it later must not touch the original.
The caller owns the returned pointer and frees it.`,
  starter: `int* dup_array(const int* a, int n) {
    // malloc n ints, copy a[0..n-1] in, return the new pointer
    return 0;
}
`,
  lesson: {
    intro: `Copying an *array* is not the same as copying a *pointer*. If you write
\`int* b = a;\`, you've only made a second pointer aimed at the *same* memory — edit
through \`b\` and \`a\` changes too, because there's still just one array.

A true duplicate needs its own storage. You \`malloc\` a fresh block of n ints, then
copy the values across one by one. Now \`a\` and the copy are separate arrays that
happen to hold equal values — changing one leaves the other alone.`,
    sections: [
      {
        heading: 'Allocate, then copy',
        body: `The pattern is two steps. First reserve room:
\`int* b = malloc(n * sizeof(int));\` gives you n uninitialized ints on the heap.
Second, fill that room from the source: \`for (int i = 0; i < n; i++) b[i] = a[i];\`
reads each original element and writes it into the copy.

After the loop, \`b\` points at a standalone array with the same contents as \`a\`.
(The standard library's \`memcpy\` does this in one call, but writing the loop makes
the "copy the data, not the pointer" idea concrete.)`,
      },
      {
        heading: 'Two arrays, two lifetimes',
        body: `Once duplicated, the copy has its own independent lifetime. The caller can
free the original whenever it likes and the copy stays valid, and vice-versa — they're
unrelated blocks of memory now.

Because \`dup_array\` returns freshly malloc'd memory, ownership passes to the caller:
whoever receives the pointer must \`free\` it exactly once when done.`,
      },
    ],
    workedExample: `#include <stdlib.h>
// make an independent copy of n doubles
double* dup_d(const double* a, int n) {
    double* b = malloc(n * sizeof(double));  // separate storage
    for (int i = 0; i < n; i++) {
        b[i] = a[i];                         // copy each value across
    }
    return b;                                // caller frees b
}`,
    whyItMatters: `Defensive copies are a bedrock habit: when a function must keep data
that the caller might change or free later, it duplicates it and owns the copy. It's
how you build value semantics on top of C's share-by-pointer default, and it prevents
a whole class of aliasing bugs where two owners stomp on one buffer.`,
    commonMistakes: [
      'Doing `int* b = a; return b;` — that copies the pointer, not the data; both names alias one array.',
      'Allocating `malloc(n)` instead of `malloc(n * sizeof(int))`, so the copy is too small.',
      'Copying with `b = a` inside the loop (assigning pointers) instead of `b[i] = a[i]` (assigning elements).',
      'Forgetting `#include <stdlib.h>` for `malloc`, or having the caller forget to `free` the copy.',
    ],
    hint: 'Allocate `int* b = malloc(n * sizeof(int));`, then loop `b[i] = a[i];` for `i` in `0..n-1`, and `return b;`.',
  },
  harness: `#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int a[] = {5, 6, 7};
    int* c = dup_array(a, 3);
    for (int i = 0; i < 3; i++) printf("%d ", c[i]);
    printf("\\n");
    free(c);
    int b[] = {42};
    int* d = dup_array(b, 1);
    for (int i = 0; i < 1; i++) printf("%d ", d[i]);
    printf("\\n");
    free(d);
    return 0;
}`,
  expectedStdout: `5 6 7
42
`,
  reference: `#include <stdlib.h>
int* dup_array(const int* a, int n) {
    int* b = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) b[i] = a[i];
    return b;
}
`,
};

export default exercise;
