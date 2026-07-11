import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'clear-bit',
  title: 'Turn a bit off',
  module: '10 · Bit Manipulation',
  order: 940,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement clear_bit(n, k) so it returns n with bit number k turned OFF
(set to 0). Every other bit of n must stay exactly as it was. Bits are numbered
from 0 at the lowest position.

For example clear_bit(7, 1) is 5 (7 is 111; turning off bit 1 gives 101), and
clear_bit(8, 3) is 0 (8 is 1000; clearing its only bit leaves 0). If bit k is
already 0, n comes back unchanged.

You only write the function — a hidden harness calls it and checks the result.`,
  starter: `unsigned int clear_bit(unsigned int n, int k) {
    // return n with bit k set to 0
    return 0;
}
`,
  lesson: {
    intro: `Turning a bit on used OR with a mask that had a single 1. Turning a bit
*off* is the mirror image: you need a mask that is 1 *everywhere except* the
target position, and then you AND with it.

AND (\`&\`) keeps a bit only where *both* inputs are 1. So if your mask has a 0 at
position \`k\` and 1s everywhere else, AND-ing forces bit \`k\` to 0 (0 wins) while
leaving every other bit of \`n\` untouched (\`x & 1\` is just \`x\`).`,
    sections: [
      {
        heading: 'Building the inverted mask: `~(1u << k)`',
        body: `Start the same way as setting a bit: \`1u << k\` is all zeros with a
single 1 at position \`k\`. Then apply \`~\`, the bitwise NOT, which flips every bit.
The lone 1 becomes a lone 0, and all the surrounding 0s become 1s.

So \`~(1u << k)\` is a mask that is 1 everywhere *except* position \`k\`. For \`k = 1\`
on a 4-bit view: \`1u << 1\` is \`0010\`, and \`~(0010)\` is \`...1101\` — a 0 sitting
exactly where you want to clear, 1s all around it.`,
      },
      {
        heading: 'AND clears, and it is idempotent too',
        body: `\`n & ~(1u << k)\` copies \`n\` but guarantees a 0 at position \`k\`. Because
AND with a 1 leaves a bit alone and AND with a 0 forces it off, only the target
bit changes.

Like setting, clearing is idempotent: a bit that is already 0 stays 0
(\`0 & 0\` is \`0\`), so clear_bit(5, 1) returns 5 unchanged — bit 1 of 5 was
already off. The one subtle part is remembering the \`~\`; forget it and you AND
with a single 1, which wipes out everything *except* that bit.`,
      },
    ],
    workedExample: `// clearing bit 1 of 7:
//   n          = 0b0111  (7)
//   1u << 1    = 0b0010
//   ~(1u << 1) = 0b...1101   (inverted mask: 0 at bit 1, 1s elsewhere)
//   n & mask   = 0b0101  (5)   bit 1 forced off, the rest untouched
//
// clearing bit 1 of 5, which is already off:
//   n          = 0b0101  (5)
//   ~(1u << 1) = 0b...1101
//   n & mask   = 0b0101  (5)   unchanged`,
    whyItMatters: `Clearing bits is how you *lower a flag*: disabling a feature in a
config word, marking a resource free, removing an element from a bitset, or
resetting a hardware control line. Together with set and read, \`n &= ~(1u << k)\`
completes the toolkit for editing packed state one bit at a time.`,
    commonMistakes: [
      'Forgetting the `~` — `n & (1u << k)` keeps *only* bit `k` and clears everything else, the opposite of what you want.',
      'Writing `1 << k` instead of `1u << k` before inverting — keep the mask unsigned so `~` fills the high bits predictably for an `unsigned int`.',
      'Using `-` to subtract the bit value — `n - (1u << k)` clears bit `k` only when it was set; if it was already 0 the subtraction borrows and corrupts higher bits. AND with the inverted mask is always correct.',
      'Misplacing parentheses: write `~(1u << k)`, not `~1u << k`, which inverts first and then shifts — a completely different mask.',
    ],
    hint: 'Invert a one-bit mask and AND it in: `return n & ~(1u << k);`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%u\\n", clear_bit(7, 0));
    printf("%u\\n", clear_bit(7, 1));
    printf("%u\\n", clear_bit(8, 3));
    printf("%u\\n", clear_bit(5, 1));
    return 0;
}`,
  expectedStdout: `6
5
0
5
`,
  reference: `unsigned int clear_bit(unsigned int n, int k) {
    return n & ~(1u << k);
}
`,
};

export default exercise;
