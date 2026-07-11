import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'debug-off-by-one',
  title: 'Hunt an off-by-one',
  module: '21 · Tooling & Debugging',
  order: 2110,
  difficulty: 'easy',
  mode: 'function',
  prompt: `sum(a, n) should add up all n elements, but it's returning a total that's a little
too small. The loop bound is wrong by one. Find and fix it.

Off-by-one errors are the most common bug in all of programming — worth learning to smell.`,
  starter: `int sum(const int* a, int n) {
    int s = 0;
    for (int i = 0; i < n - 1; i++)   // stops one element too soon
        s += a[i];
    return s;
}
`,
  lesson: {
    intro: `An *off-by-one* error is a loop or index that's wrong by exactly one — it stops a
step too early, runs a step too far, or starts in the wrong place. Here the loop condition
is \`i < n - 1\`, so it visits indices \`0 .. n-2\` and never adds the last element \`a[n-1]\`.
The result is always short by one element.

The valid indices of an \`n\`-element array are \`0\` through \`n-1\`, so the correct loop is
\`for (int i = 0; i < n; i++)\`. One character — \`n - 1\` → \`n\` — but the *skill* is
learning to spot and diagnose these fast.`,
    sections: [
      {
        heading: 'The two flavours (and why one is worse)',
        body: `Off-by-ones come in two forms. This one *under-runs* — \`i < n - 1\` misses the
last element: wrong answer, but harmless to memory. The nastier form *over-runs* —
\`i <= n\` reads \`a[n]\`, one past the end of the array. That's undefined behavior: it might
print a garbage number, or crash, or silently corrupt memory. Same "off by one," very
different blast radius.`,
      },
      {
        heading: 'How the tools catch it',
        body: `For the *over-run* version, **AddressSanitizer** (compile with
\`gcc -fsanitize=address -g\`) is magic: it stops the program the instant you read past the
array and prints \`ERROR: AddressSanitizer: heap-buffer-overflow\`, the exact line, and how
far out of bounds you went. For the *under-run* (wrong-answer) version, a **debugger**
(\`gdb\`) is the tool: set a breakpoint on the loop, \`print i\` and \`print s\` each iteration,
and watch it stop before adding the last element — the bug becomes obvious.`,
      },
    ],
    workedExample: `// indices of a 4-element array are 0,1,2,3 (that's n-1 = 3):
//   a:  [ 10 ][ 20 ][ 30 ][ 40 ]
//   i:     0     1     2     3
// 'i < n-1' stops at i=2, never adds a[3]=40  -> sum is 60, not 100
for (int i = 0; i < n; i++)   // the fix: visit every index 0..n-1
    s += a[i];`,
    whyItMatters: `Off-by-one is the bug you will write most often, for your whole career — in
loops, array bounds, buffer sizes, string lengths, slice ranges. The over-running kind is
also a security hole (buffer overflows). Internalizing "an n-element array has indices
0..n-1, so loop \`i < n\`" and reaching for ASan/gdb when a total looks off will save you
countless hours.`,
    commonMistakes: [
      'Looping `i < n - 1` (misses the last element) or `i <= n` (reads one past the end — undefined behavior).',
      'Starting at `i = 1` instead of `i = 0`, skipping the first element.',
      'Assuming a wrong-but-plausible total is "close enough" instead of finding the boundary bug.',
      'Reaching for print statements when `gdb` (wrong value) or ASan (out-of-bounds) would pinpoint it faster.',
    ],
    hint: 'The loop should visit every index `0` to `n-1`. Change `i < n - 1` to `i < n`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int a[] = {10, 20, 30, 40};
    printf("%d\\n", sum(a, 4));
    int b[] = {5};
    printf("%d\\n", sum(b, 1));
    int c[] = {1, 2, 3};
    printf("%d\\n", sum(c, 3));
    return 0;
}`,
  expectedStdout: `100
5
6
`,
  reference: `int sum(const int* a, int n) {
    int s = 0;
    for (int i = 0; i < n; i++)
        s += a[i];
    return s;
}
`,
};

export default exercise;
