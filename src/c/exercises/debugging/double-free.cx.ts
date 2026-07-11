import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'debug-double-free',
  title: 'A memory bug: double free',
  module: '21 · Tooling & Debugging',
  order: 2130,
  difficulty: 'medium',
  mode: 'function',
  prompt: `sum_range(n) allocates an array 0,1,…,n-1, sums it, frees the memory, and returns
the sum. But it calls free() twice on the same pointer — a "double free" — which corrupts
the allocator and aborts the program. Remove the bug so it runs cleanly.`,
  starter: `#include <stdlib.h>

int sum_range(int n) {
    int* a = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) a[i] = i;
    int s = 0;
    for (int i = 0; i < n; i++) s += a[i];
    free(a);
    free(a);   // BUG: freeing the same block twice
    return s;
}
`,
  lesson: {
    intro: `Dynamic memory has one rule: every block you \`malloc\` must be \`free\`d **exactly
once**. Free it zero times and you *leak* it; free it twice and you get a **double free** —
you hand the same block back to the allocator twice, corrupting its bookkeeping. Modern
libc detects this and aborts the program with \`free(): double free detected\`.

The fix here is to delete the second \`free(a)\`. The deeper skill is knowing the tools that
find these bugs — because in real code the two frees are usually far apart, not on adjacent
lines.`,
    sections: [
      {
        heading: 'valgrind and AddressSanitizer name the exact frees',
        body: `Two tools turn a mysterious crash into a precise report. **valgrind**
(\`valgrind ./a.out\`) runs your program on a synthetic CPU and prints
\`Invalid free() ... Address 0x... was already freed\`, with the line of *this* free and the
line of the *previous* one. **AddressSanitizer** (\`gcc -fsanitize=address -g\`) does the same
at near-native speed: \`ERROR: AddressSanitizer: attempting double-free\`, plus both stack
traces. Either one points straight at both \`free\` calls.`,
      },
      {
        heading: 'Habits that prevent it',
        body: `A common defensive habit is to set the pointer to NULL right after freeing:
\`free(a); a = NULL;\`. Freeing NULL is explicitly a no-op in C, so a second \`free(a)\` then
does nothing instead of corrupting the heap. More broadly: give each allocation one clear
*owner* responsible for freeing it exactly once, and don't free through two different
pointers to the same block.`,
      },
    ],
    workedExample: `int* a = malloc(n * sizeof(int));
// ... use a ...
free(a);          // correct: release it once
free(a);          // BUG: double free -> abort
// defensive pattern:
free(a);
a = NULL;         // now an accidental second free(a) is a harmless no-op`,
    whyItMatters: `Memory bugs — double frees, use-after-free, leaks, buffer overflows — are the
defining hazard of C and the source of a large share of real-world security
vulnerabilities. You can't rely on the program crashing helpfully; you rely on valgrind and
AddressSanitizer. Running your C under ASan during development is one of the highest-value
habits you can build.`,
    commonMistakes: [
      'Freeing the same pointer twice (directly, or via two pointers/aliases to the same block).',
      'Using memory after it has been freed (use-after-free) — just as dangerous as double free.',
      'Forgetting to free at all (a leak) — valgrind reports these as "definitely lost" bytes.',
      'Debugging memory corruption by staring at the code instead of running valgrind or ASan.',
    ],
    hint: 'There are two `free(a);` lines. Delete one — the block must be freed exactly once.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", sum_range(5));
    printf("%d\\n", sum_range(1));
    printf("%d\\n", sum_range(4));
    return 0;
}`,
  expectedStdout: `10
0
6
`,
  reference: `#include <stdlib.h>

int sum_range(int n) {
    int* a = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) a[i] = i;
    int s = 0;
    for (int i = 0; i < n; i++) s += a[i];
    free(a);
    return s;
}
`,
};

export default exercise;
