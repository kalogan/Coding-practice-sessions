import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'debug-null-pointer',
  title: 'The segfault: a NULL dereference',
  module: '21 · Tooling & Debugging',
  order: 2120,
  difficulty: 'medium',
  mode: 'function',
  prompt: `first_or_default(a, n) should return the first element a[0] when the array is
non-empty, or -1 when it's empty (n == 0, and the pointer may be NULL). The starter blindly
reads a[0] — so when the harness passes an empty array it dereferences NULL and the whole
program crashes with a "segmentation fault," printing nothing. Add the guard that prevents it.`,
  starter: `int first_or_default(const int* a, int n) {
    return a[0];   // crashes when a is NULL / n == 0
}
`,
  lesson: {
    intro: `A *segmentation fault* (segfault) is the operating system killing your program for
touching memory it isn't allowed to. The most common cause is dereferencing a **NULL
pointer** — following a pointer that points to "nothing" (address 0). Here, when \`n\` is 0
the caller passes a NULL (or empty) array, but the code still evaluates \`a[0]\`, which is
\`*(a + 0)\` — a read through NULL. Crash.

The fix is a *guard*: check before you dereference. \`if (n > 0) return a[0];\` and otherwise
return the default. Never follow a pointer you haven't confirmed is valid.`,
    sections: [
      {
        heading: 'How gdb finds a segfault in 30 seconds',
        body: `Compile with debug symbols (\`gcc -g\`) and run under the debugger:
\`gdb ./a.out\`, then \`run\`. The instant it crashes, gdb stops and shows the exact line.
Type \`backtrace\` (or \`bt\`) to see the chain of calls that led there, and \`print a\` to
inspect the pointer — you'll see \`a = 0x0\`, i.e. NULL. That trio — \`run\`, \`bt\`,
\`print\` — is the core debugging loop for a crash: *where* did it die, *how* did it get
there, *what* were the values.`,
      },
      {
        heading: 'Guard clauses beat crashes',
        body: `Defensive checks at the top of a function — "if the inputs are bad, bail out
early" — are called guard clauses. \`if (n > 0) return a[0];\` handles the empty case
cleanly. In real code you also check the result of anything that can fail: \`malloc\` can
return NULL, \`fopen\` can return NULL — always test before you use the pointer. A NULL check
is one line; a segfault is a debugging session.`,
      },
    ],
    workedExample: `// a NULL pointer points at address 0 — "nothing":
//   const int* a = NULL;   // a == 0x0
//   int x = a[0];          // reads *(0 + 0)  ->  SEGFAULT
//
// guard before you dereference:
if (n > 0) return a[0];
return -1;                  // safe default for the empty case`,
    whyItMatters: `NULL dereferences are one of the most common crashes in C (and the ancestor
of the "billion-dollar mistake"). Every pointer that *might* be NULL — a failed
\`malloc\`/\`fopen\`, an empty collection, an optional argument — must be checked before use.
The habit "confirm the pointer, then dereference," plus knowing how to read a crash in gdb,
turns mysterious segfaults into two-minute fixes.`,
    commonMistakes: [
      'Dereferencing a pointer (or indexing an array) without first checking it is non-NULL / non-empty.',
      'Not checking the return value of `malloc` or `fopen`, which hand back NULL on failure.',
      'Checking *after* the dereference — the crash already happened on the line above.',
      'Running a crashing program without `gdb` and guessing, instead of letting `run`/`bt` point at the line.',
    ],
    hint: 'Guard the dereference: `if (n > 0) return a[0];` then `return -1;` for the empty case.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int x[] = {42, 7};
    printf("%d\\n", first_or_default(x, 2));
    printf("%d\\n", first_or_default(NULL, 0));   /* empty: must not crash */
    return 0;
}`,
  expectedStdout: `42
-1
`,
  reference: `int first_or_default(const int* a, int n) {
    if (n > 0) return a[0];
    return -1;
}
`,
};

export default exercise;
