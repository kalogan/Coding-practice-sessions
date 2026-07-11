import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'set-bit',
  title: 'Turn a bit on',
  module: '10 · Bit Manipulation',
  order: 930,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement set_bit(n, k) so it returns n with bit number k turned ON
(set to 1). Every other bit of n must stay exactly as it was. Bits are numbered
from 0 at the lowest position.

For example set_bit(0, 3) is 8 (it turns on the bit worth 8), and set_bit(5, 1)
is 7 (5 is 101; turning on bit 1 gives 111). If bit k is already 1, n comes back
unchanged.

You only write the function — a hidden harness calls it and checks the result.`,
  starter: `unsigned int set_bit(unsigned int n, int k) {
    // return n with bit k set to 1
    return 0;
}
`,
  lesson: {
    intro: `To turn one specific bit on while leaving everything else alone, you
build a *mask*: a number that is all zeros except for a single 1 at the position
you care about. Then you OR that mask onto \`n\`.

The OR operator \`|\` keeps a 1 wherever *either* input has a 1. So OR-ing with a
mask that has a 1 only at position \`k\` forces bit \`k\` on and cannot possibly
disturb any other bit — the mask is 0 everywhere else, and \`x | 0\` is just \`x\`.`,
    sections: [
      {
        heading: 'Building the mask: `1u << k`',
        body: `Start from \`1u\` — the constant 1 as an \`unsigned int\`, which is all
zeros with a single 1 in the lowest position. Shifting it left with \`<< k\` walks
that 1 upward by \`k\` places, so \`1u << k\` is a number with exactly one bit set,
at position \`k\`.

For example \`1u << 3\` is \`1000\` = 8, and \`1u << 0\` is just \`1\`. The \`u\` suffix
matters: it makes the 1 unsigned so the shift is well-defined and matches the
\`unsigned int\` you are working with.`,
      },
      {
        heading: 'OR sets, and it is idempotent',
        body: `\`n | (1u << k)\` copies \`n\` but guarantees a 1 at position \`k\`. Because
OR only ever turns bits *on*, none of \`n\`'s existing 1s can be lost.

A nice property falls out of this: setting a bit that is already 1 does nothing
— \`1 | 1\` is still \`1\`. That's what "idempotent" means: applying \`set_bit\` once
or five times gives the same result. So set_bit(5, 0) returns 5 unchanged,
because bit 0 of 5 was already on.`,
      },
    ],
    workedExample: `// setting bit 1 of 5:
//   n         = 0b0101  (5)
//   1u << 1   = 0b0010  (the mask)
//   n | mask  = 0b0111  (7)   bit 1 flipped on, the rest untouched
//
// setting bit 0 of 5, which is already on:
//   n         = 0b0101  (5)
//   1u << 0   = 0b0001
//   n | mask  = 0b0101  (5)   unchanged — OR-ing a 1 onto a 1 is still 1`,
    whyItMatters: `Setting bits is how you *raise a flag* in packed state: enabling
a feature in a configuration word, marking a square occupied in a bitboard,
recording that item \`k\` is present in a bitset, or switching on a hardware
control line. The pattern \`value |= (1u << k)\` is one of the most common lines
in low-level C.`,
    commonMistakes: [
      'Writing `1 << k` instead of `1u << k` — for an `unsigned int` result, keep the mask unsigned so the operation is well-defined and warning-free.',
      'Using `+` instead of `|` — `n + (1u << k)` gives the right answer only when bit `k` was already 0; if it was 1 it carries and corrupts higher bits. OR is always correct.',
      'Using `&` where you meant `|` — AND with the mask *clears* every other bit instead of setting the one you want.',
      'Forgetting to return the new value (or returning `n` unchanged) — `n | (1u << k)` produces a fresh value; `n` itself is not modified unless you assign it.',
    ],
    hint: 'Build the one-bit mask `1u << k`, then OR it onto `n`: `return n | (1u << k);`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%u\\n", set_bit(0, 0));
    printf("%u\\n", set_bit(0, 3));
    printf("%u\\n", set_bit(5, 1));
    printf("%u\\n", set_bit(5, 0));
    return 0;
}`,
  expectedStdout: `1
8
7
5
`,
  reference: `unsigned int set_bit(unsigned int n, int k) {
    return n | (1u << k);
}
`,
};

export default exercise;
