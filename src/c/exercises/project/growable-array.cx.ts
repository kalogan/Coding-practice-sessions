import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'growable-array',
  title: 'Milestone 1 — a growable array (realloc)',
  module: '22 · Your First Real Project',
  order: 2200,
  difficulty: 'hard',
  mode: 'function',
  prompt: `Your renderer will load a model with an unknown number of vertices, so you need an
array that grows on demand. This is the backbone of the whole project.

Implement push(a, len, cap, value): append value to the dynamic array a, growing it with
realloc when it's full, and return the (possibly moved) array pointer. len and cap are
in/out parameters (pointers) tracking how many elements are used and how many are allocated.

Growth rule: when *len == *cap, grow the capacity — to 4 if it was 0, otherwise double it —
with realloc. Then store value at index *len and increment *len.`,
  starter: `#include <stdlib.h>

double* push(double* a, int* len, int* cap, double value) {
    // if full (*len == *cap), grow with realloc (0 -> 4, else double)
    // then a[*len] = value; (*len)++;  return a;
    return a;
}
`,
  lesson: {
    intro: `This is milestone 1 of your renderer, and it's the single most useful data structure
in C: a *growable array* (a "dynamic array" or "vector"). A plain C array has a fixed size,
but you won't know how many vertices a model has until you've read the file. The trick:
keep a buffer that's usually *bigger* than what you're using, track two numbers — \`len\` (how
many elements you've stored) and \`cap\` (how many the buffer can hold) — and when you run out
of room, ask \`realloc\` for a bigger buffer.

The \`push\` function is the heart of it. Because \`realloc\` may move the data to a new
address, \`push\` returns the (possibly new) pointer, and the caller reassigns it.`,
    sections: [
      {
        heading: 'realloc and amortized doubling',
        body: `\`realloc(a, newsize)\` resizes an allocation, copying the old contents and
returning a pointer that may or may not be the same address. The key design choice is *how
much* to grow: growing by one each time would make loading N items cost N² work. Instead you
**double** the capacity when full (0 → 4 → 8 → 16 …). Doubling means the occasional expensive
copy is rare enough that appending N items costs only about N total work — "amortized O(1)"
per push. That's why every dynamic-array implementation grows geometrically, not by one.`,
      },
      {
        heading: 'len and cap as out-parameters',
        body: `\`push\` has to update three things the caller owns: the array pointer, the used
count, and the capacity. The pointer it *returns*; \`len\` and \`cap\` it updates *through
pointers* (\`*len\`, \`*cap\`) — the out-parameter pattern from the pointers module. In your
real project this lives in \`darray.c\`/\`darray.h\`, and you'd wrap the three fields in a
struct (\`typedef struct { double* data; int len, cap; } Vec;\`) so you pass one thing around
instead of three. The logic is identical.`,
      },
    ],
    workedExample: `double* a = NULL;           // start empty: no buffer...
int len = 0, cap = 0;       // ...0 used, 0 allocated
for (int i = 0; i < 100; i++)
    a = push(a, &len, &cap, i);   // reassign: realloc may move it!
// cap grew 0 -> 4 -> 8 -> 16 -> 32 -> 64 -> 128; len == 100
free(a);

// inside push, the growth step:
if (*len == *cap) {
    *cap = (*cap == 0) ? 4 : *cap * 2;
    a = realloc(a, *cap * sizeof(double));
}`,
    whyItMatters: `The growable array is the workhorse of real C programs — it's how you handle
"a list of things whose count you don't know yet," which is *constantly*. Loading a model's
vertices, reading lines from a file, collecting results: all the same pattern. Master push and
you've got the reusable container the standard C library famously doesn't give you. (This is
exactly audit gap #3 — dynamic data structures — turned into a tool you own.)`,
    commonMistakes: [
      'Not reassigning the returned pointer (`a = push(a, ...)`) — `realloc` can move the buffer, leaving your old pointer dangling.',
      'Growing by 1 instead of doubling, turning N appends into O(N²) work.',
      'Forgetting the empty case: when `*cap` is 0, growth must jump to a real size (e.g. 4), not `0 * 2 = 0`.',
      'Updating `len`/`cap` locally instead of through the pointers (`*len`, `*cap`), so the caller never sees the change.',
    ],
    hint: 'Inside `push`: `if (*len == *cap) { *cap = *cap ? *cap * 2 : 4; a = realloc(a, *cap * sizeof(double)); }` then `a[*len] = value; (*len)++; return a;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    double* a = NULL;
    int len = 0, cap = 0;
    for (int i = 0; i < 5; i++) a = push(a, &len, &cap, i * 1.5);
    for (int i = 0; i < len; i++) printf("%g ", a[i]);
    printf("\\n");
    printf("%d %d\\n", len, cap);
    free(a);
    return 0;
}`,
  expectedStdout: `0 1.5 3 4.5 6
5 8
`,
  reference: `#include <stdlib.h>

double* push(double* a, int* len, int* cap, double value) {
    if (*len == *cap) {
        *cap = (*cap == 0) ? 4 : *cap * 2;
        a = realloc(a, *cap * sizeof(double));
    }
    a[*len] = value;
    (*len)++;
    return a;
}
`,
};

export default exercise;
