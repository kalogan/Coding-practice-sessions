import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'is-power-of-two',
  title: 'Is it a power of two?',
  module: '10 · Bit Manipulation',
  order: 910,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement is_pow2(n) so it returns 1 when the unsigned integer n is a
power of two (1, 2, 4, 8, 16, ...) and 0 otherwise. Zero is NOT a power of two.

The classic solution is a single expression using the \`n & (n - 1)\` trick — no
loop needed. Figure out why that trick works, then use it.

You only write the function — a hidden harness calls it and checks the result.`,
  starter: `int is_pow2(unsigned int n) {
    // return 1 if n is a power of two, else 0
    return 0;
}
`,
  lesson: {
    intro: `A power of two is a number with *exactly one bit set*: 1 is \`0001\`, 2
is \`0010\`, 4 is \`0100\`, 8 is \`1000\`, and so on. Every other positive number has
two or more bits set (6 is \`0110\`, for example). So "is this a power of two?"
is really the question "does this number have exactly one bit set?".

You could count the bits and check for exactly one, but there's a famous
one-line trick that does it faster: \`n != 0 && (n & (n - 1)) == 0\`.`,
    sections: [
      {
        heading: 'What `n - 1` does to the bits',
        body: `Subtracting 1 flips the lowest set bit of \`n\` to 0 and turns every
bit *below* it into 1. Picture \`n = 8\`, which is \`1000\`: then \`n - 1 = 7\`, which
is \`0111\`. The single 1 moved down and everything under it filled in with 1s.

Now AND them together: \`1000 & 0111\` has no column where both are 1, so the
result is \`0000\` = 0. For a power of two, \`n & (n - 1)\` is always 0.`,
      },
      {
        heading: 'Why it fails for everything else',
        body: `Take a number with more than one bit set, like \`6\` = \`0110\`. Then
\`n - 1 = 5\` = \`0101\`. Subtracting 1 only disturbs the lowest set bit and below;
the higher set bits are untouched. So \`0110 & 0101 = 0100\`, which is *not* zero.

That leftover bit is the tell: whenever \`n & (n - 1)\` is nonzero, \`n\` had two or
more bits set and is not a power of two. The one case this misses is \`n = 0\`,
where \`n & (n - 1)\` also comes out 0 — that's why you guard with \`n != 0\` first.`,
      },
    ],
    workedExample: `// clearing the lowest set bit is the heart of the trick:
//   n        = 0b0110  (6)
//   n - 1    = 0b0101  (5)
//   n & (n-1)= 0b0100  (4)  -> nonzero, so 6 is NOT a power of two
//
//   n        = 0b0100  (4)
//   n - 1    = 0b0011  (3)
//   n & (n-1)= 0b0000  (0)  -> zero, so 4 IS a power of two
// combine with a zero-guard so that n == 0 returns false.`,
    whyItMatters: `Power-of-two checks are everywhere in systems code: hash tables
and ring buffers size themselves to powers of two so an index can wrap with a
cheap \`& (size - 1)\` mask instead of a slow modulo; memory allocators and page
sizes are powers of two; and \`n & (n - 1)\` (clearing the lowest set bit) is a
building block for iterating over set bits one at a time.`,
    commonMistakes: [
      'Forgetting the `n != 0` guard — `0 & (0 - 1)` is `0`, so without it zero would be wrongly reported as a power of two.',
      'Writing `n & n - 1 == 0` without parentheses — `==` binds tighter than `&`, so it parses as `n & (n - 1 == 0)`. Use `(n & (n - 1)) == 0`.',
      'Returning the boolean expression as-is is fine in C (it is already 0 or 1) — but do not accidentally return `n & (n - 1)`, which is the *inverted* answer.',
      'Assuming `n - 1` on an `unsigned int` is a problem — the only value where it wraps is `0`, and the `n != 0` guard already handles that case.',
    ],
    hint: 'One line: `return n != 0 && (n & (n - 1)) == 0;`. The `&&` short-circuits so the trick only runs when `n` is nonzero.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", is_pow2(1));
    printf("%d\\n", is_pow2(2));
    printf("%d\\n", is_pow2(3));
    printf("%d\\n", is_pow2(16));
    printf("%d\\n", is_pow2(0));
    printf("%d\\n", is_pow2(6));
    return 0;
}`,
  expectedStdout: `1
1
0
1
0
0
`,
  reference: `int is_pow2(unsigned int n) {
    return n != 0 && (n & (n - 1)) == 0;
}
`,
};

export default exercise;
