import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'alloc-filled',
  title: 'Allocate and fill',
  module: '7 · Pointers & Memory',
  order: 650,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement alloc_filled(n, value): allocate a new int array of length n on the
heap, set every element to value, and return a pointer to it.

The caller takes ownership of the returned array and is responsible for freeing it.`,
  starter: `int* alloc_filled(int n, int value) {
    // malloc n ints, set each to value, return the pointer
    return 0;
}
`,
  lesson: {
    intro: `This ties the malloc pattern together: reserve memory, then initialize it.
\`malloc\` hands back a block of the requested size but leaves its contents
*undefined* — the bytes hold whatever junk was there before. Reading them before you
write is a bug, so allocation is almost always followed by a fill loop.

Here you allocate room for n ints and set each slot to the same \`value\`, producing a
uniform array — the heap equivalent of \`int arr[n] = {value, value, ...}\`.`,
    sections: [
      {
        heading: 'malloc gives garbage; you initialize',
        body: `\`malloc(n * sizeof(int))\` reserves the space but does not zero it. If
you need a specific starting value, you write it yourself:
\`for (int i = 0; i < n; i++) p[i] = value;\`. (There's a cousin, \`calloc\`, that
zero-fills for you — but it only gives zeros, so for an arbitrary \`value\` you fill by
hand.)

Every element gets the *same* number, so the loop body is a plain assignment with no
computation — just \`p[i] = value;\` each time around.`,
      },
      {
        heading: 'The malloc + fill + return shape',
        body: `Almost every "build me an array" function follows this three-beat shape:
allocate (\`int* p = malloc(n * sizeof(int));\`), populate (a loop that writes each
element), return (\`return p;\`). Only the middle beat — how each element is computed —
changes from problem to problem.

You saw the same skeleton in make_range (fill with the index) and dup_array (fill from
a source). Here the fill is the simplest possible: a constant.`,
      },
    ],
    workedExample: `#include <stdlib.h>
// n ints, each set to i*10 (allocate, fill, return)
int* tens(int n) {
    int* p = malloc(n * sizeof(int));  // reserve
    for (int i = 0; i < n; i++) {
        p[i] = i * 10;                 // initialize each slot
    }
    return p;                          // hand off; caller frees
}`,
    whyItMatters: `Pre-filling a buffer to a known value is a constant chore in systems
code: initializing a grid before a simulation, priming a lookup table with a sentinel,
resetting a scratch buffer between passes. And the deeper lesson — malloc does not
initialize memory — is behind a huge share of real-world "works sometimes" bugs.`,
    commonMistakes: [
      'Reading or printing the array before the fill loop runs — malloc\'s contents are undefined garbage until you write them.',
      'Sizing with `malloc(n)` rather than `malloc(n * sizeof(int))`.',
      'Writing `p[i] == value` (comparison) instead of `p[i] = value` (assignment) in the loop.',
      'Forgetting `#include <stdlib.h>`, or leaving the caller to leak the array by never calling `free`.',
    ],
    hint: 'Allocate `int* p = malloc(n * sizeof(int));`, loop `p[i] = value;` for every `i`, then `return p;`.',
  },
  harness: `#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int* a = alloc_filled(4, 9);
    for (int i = 0; i < 4; i++) printf("%d ", a[i]);
    printf("\\n");
    free(a);
    int* b = alloc_filled(1, 0);
    for (int i = 0; i < 1; i++) printf("%d ", b[i]);
    printf("\\n");
    free(b);
    return 0;
}`,
  expectedStdout: `9 9 9 9
0
`,
  reference: `#include <stdlib.h>
int* alloc_filled(int n, int value) {
    int* p = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) p[i] = value;
    return p;
}
`,
};

export default exercise;
