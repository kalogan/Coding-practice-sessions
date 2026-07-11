import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'get-bit',
  title: 'Read a single bit',
  module: '10 · Bit Manipulation',
  order: 920,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement get_bit(n, k) so it returns bit number k of the unsigned
integer n — that is, 1 if that bit is set and 0 if it is clear. Bits are
numbered from 0, starting at the lowest (rightmost) bit.

For example 5 is 101 in binary: bit 0 is 1, bit 1 is 0, bit 2 is 1. So
get_bit(5, 0) is 1, get_bit(5, 1) is 0, and get_bit(5, 2) is 1.

You only write the function — a hidden harness calls it and checks the result.`,
  starter: `int get_bit(unsigned int n, int k) {
    // return bit k of n (0 or 1)
    return 0;
}
`,
  lesson: {
    intro: `Bits inside a number are numbered from the right, starting at 0. In
\`101\` (which is 5), bit 0 is the rightmost 1, bit 1 is the middle 0, and bit 2
is the leftmost 1. Reading "bit k" means: what is the value sitting in that one
position — a 1 or a 0?

The trick is to bring that bit down to the bottom where it's easy to test. You
already know how to test the lowest bit — \`x & 1\`. So the plan is: shift bit k
down to position 0, then mask it.`,
    sections: [
      {
        heading: 'Shift the target bit down to position 0',
        body: `\`n >> k\` slides every bit of \`n\` to the right by \`k\` places. Whatever
was sitting at bit \`k\` lands exactly at bit 0, and everything that was below it
falls off the end and disappears.

So for \`n = 5\` (\`101\`) and \`k = 2\`: \`n >> 2\` is \`001\` = 1 — the top bit has
arrived at the bottom. For \`k = 1\`: \`5 >> 1\` is \`010\` = 2 — bit 1's value (0)
is now the lowest bit, sitting under a leftover 1 we still need to strip off.`,
      },
      {
        heading: 'Mask off everything above with `& 1`',
        body: `After shifting, the bit you care about is at position 0, but there may
still be other 1s in the higher positions (in the \`k = 1\` example above, the
result was \`010\`, which has a 1 up top). AND-ing with \`1\` erases all of those
and keeps only the lowest bit.

Put together, \`(n >> k) & 1\` reads as: "move bit \`k\` down to the bottom, then
keep only that bottom bit." The answer is exactly 0 or 1 — the value of bit
\`k\`. The parentheses matter: shift first, then mask.`,
      },
    ],
    workedExample: `// extracting one decimal digit is the same idea in base 10:
int digit_at(unsigned int n, int k) {
    // slide digit k down to the ones place, then keep only it
    while (k--) n /= 10;   // n / 10 is the base-10 version of n >> 1
    return n % 10;         // n % 10 is the base-10 version of n & 1
}
// get_bit(n, k) does this in base 2 with no loop: (n >> k) & 1`,
    whyItMatters: `Reading individual bits is how you unpack data that has been
packed to save space: permission flags, hardware register status bits, pixel
color channels, compression formats, and network protocol headers all cram many
small fields into one integer. \`(value >> position) & mask\` is the everyday
idiom for pulling one field back out.`,
    commonMistakes: [
      'Dropping the parentheses: `n >> k & 1`. Precedence saves you here (`>>` binds tighter than `&`), but write `(n >> k) & 1` so the intent is unmistakable.',
      'Masking before shifting — `(n & 1) >> k` reads the *lowest* bit and then shifts it away, which is not what you want.',
      'Returning `n >> k` without the `& 1` — that keeps all the higher bits too, so the result can be far larger than 0 or 1.',
      'Off-by-one on bit numbering — bit 0 is the lowest bit; the bit worth 8 in `1000` is bit 3, not bit 4.',
    ],
    hint: 'One line: `return (n >> k) & 1;`. Shift bit `k` down to the bottom, then keep only that bottom bit.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", get_bit(5, 0));
    printf("%d\\n", get_bit(5, 1));
    printf("%d\\n", get_bit(5, 2));
    printf("%d\\n", get_bit(8, 3));
    printf("%d\\n", get_bit(8, 0));
    return 0;
}`,
  expectedStdout: `1
0
1
1
0
`,
  reference: `int get_bit(unsigned int n, int k) {
    return (n >> k) & 1;
}
`,
};

export default exercise;
