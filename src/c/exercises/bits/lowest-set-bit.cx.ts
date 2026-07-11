import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'lowest-set-bit',
  title: 'Isolate the lowest set bit',
  module: '10 · Bit Manipulation',
  order: 950,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement lowest_set(n) so it returns a value with only the LOWEST set
bit of n kept — every other bit cleared. If n is 0 (no bits set), return 0.

For example 12 is 1100 in binary; its lowest set bit is worth 4, so
lowest_set(12) is 4. And 6 is 110, whose lowest set bit is worth 2, so
lowest_set(6) is 2. The famous one-liner is \`n & -n\`.

You only write the function — a hidden harness calls it and checks the result.`,
  starter: `unsigned int lowest_set(unsigned int n) {
    // return only the lowest set bit of n (0 if n is 0)
    return 0;
}
`,
  lesson: {
    intro: `Sometimes you don't want to count bits or read a single position — you
want to grab the *lowest* 1 in a number all by itself, with everything else
zeroed out. For \`1100\` (12) that lowest 1 is worth 4; the answer is \`0100\`.

There's a startlingly short way to do it: \`n & -n\`. To see why it works you need
to know what negating an unsigned number actually does to its bits — that's
two's complement.`,
    sections: [
      {
        heading: 'Two’s complement: what `-n` really is',
        body: `On a computer, \`-n\` for an unsigned value is computed as \`~n + 1\`:
flip every bit of \`n\`, then add 1. Flipping turns the lowest set bit's row of
trailing zeros into trailing ones, and turns the bit itself into a 0. Adding 1
then ripples up through those trailing ones, flipping them back to zeros and
carrying into the position of the original lowest set bit — landing a 1 exactly
there.

The upshot: above the lowest set bit, \`-n\` is the bitwise opposite of \`n\`; at
the lowest set bit and below, \`-n\` matches \`n\`. That shared boundary is the key.`,
      },
      {
        heading: 'Why `n & -n` leaves just that one bit',
        body: `AND keeps a 1 only where both \`n\` and \`-n\` have a 1. Above the lowest
set bit the two are exact opposites, so every one of those columns has a 0 in
one operand and contributes nothing. Below the lowest set bit \`n\` is all zeros,
so nothing survives there either. Only at the lowest set bit itself do both hold
a 1 — so that single bit is all that remains.

Writing \`n & -n\` (or the equivalent \`n & (~n + 1)\`) therefore isolates the
lowest set bit. And when \`n\` is 0, both \`n\` and \`-n\` are 0, so the result is 0 —
the required answer for the no-bits case, with no special handling needed.`,
      },
    ],
    workedExample: `// isolating the lowest set bit of 12:
//   n       = 0b1100  (12)
//   ~n      = 0b0011
//   ~n + 1  = 0b0100   (this is -n in two's complement)
//   n & -n  = 0b0100  (4)   only the lowest set bit survives
//
// for n = 6:
//   n       = 0b0110  (6)
//   -n      = 0b1010
//   n & -n  = 0b0010  (2)`,
    whyItMatters: `Isolating the lowest set bit powers efficient iteration over a
bitset: repeatedly take \`b = n & -n\` to grab the next set bit, act on it, then
\`n ^= b\` to remove it — visiting only the bits that are actually set. It's the
core of Fenwick (binary indexed) trees, where \`i & -i\` gives the range each node
covers, and it appears throughout graph and combinatorics code that uses bitmasks.`,
    commonMistakes: [
      'Special-casing `n == 0` unnecessarily — `0 & -0` is already `0`, so the plain expression returns the right answer for zero on its own.',
      'Confusing "lowest set bit" (its *value*, like 4) with "its position" (the index, like 2) — this function returns the value; `n & -n` gives you exactly that.',
      'Reaching for a loop when the one-liner suffices — a shift-and-test loop works, but `n & -n` is the idiomatic constant-time answer.',
      'Writing `~n + 1` with bad precedence as `~(n + 1)` — invert first, then add: `(~n) + 1`. Simpler still, just use `n & -n`.',
    ],
    hint: 'The whole body is one line: `return n & -n;`. Two’s-complement negation lines up a single shared 1 at the lowest set bit.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%u\\n", lowest_set(12));
    printf("%u\\n", lowest_set(1));
    printf("%u\\n", lowest_set(6));
    printf("%u\\n", lowest_set(0));
    printf("%u\\n", lowest_set(48));
    return 0;
}`,
  expectedStdout: `4
1
2
0
16
`,
  reference: `unsigned int lowest_set(unsigned int n) {
    return n & -n;
}
`,
};

export default exercise;
