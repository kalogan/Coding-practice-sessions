import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'count-set-bits',
  title: 'Count the set bits',
  module: '10 · Bit Manipulation',
  order: 900,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement popcount(n) so it returns how many bits are set to 1 in the
unsigned integer n. (This count is also called the "population count".)

For example 7 is 111 in binary, so popcount(7) is 3. And 1024 is a single 1
followed by ten 0s, so popcount(1024) is 1.

You only write the function — a hidden harness calls it and checks the result.`,
  starter: `int popcount(unsigned int n) {
    // count how many bits of n are 1, then return the count
    return 0;
}
`,
  lesson: {
    intro: `Every unsigned integer is really just a row of bits — 1s and 0s. The
number 13, for instance, is \`1101\` in binary: that's 8 + 4 + 1. Counting the
1s in that row is one of the most fundamental bit operations there is.

To count them you need two tools: a way to *look at* the lowest bit, and a way
to *throw it away* so the next bit becomes the lowest. Do that in a loop until
nothing is left, tallying each 1 as you go.`,
    sections: [
      {
        heading: '`n & 1` — is the lowest bit set?',
        body: `The \`&\` operator is bitwise AND: it lines up two numbers bit-for-bit
and keeps a 1 only where *both* have a 1. The number \`1\` is all zeros except
its lowest bit, so \`n & 1\` wipes out every bit of \`n\` except the lowest one.

The result is exactly \`1\` when \`n\`'s lowest bit is set, and \`0\` when it isn't.
That makes \`n & 1\` a perfect yes/no test for the bottom bit — and because it's
either 0 or 1, you can add it straight onto your running count.`,
      },
      {
        heading: '`n >> 1` — drop the lowest bit',
        body: `The \`>>\` operator shifts every bit to the right. \`n >> 1\` slides all
of \`n\`'s bits down by one position: the old lowest bit falls off the end and
vanishes, and the bit that used to be second-lowest becomes the new lowest.

So the loop rhythm is: inspect the lowest bit with \`n & 1\`, add it to the
count, then \`n >>= 1\` to expose the next bit. Keep going while \`n\` is nonzero —
once every 1 has shifted away, \`n\` is 0 and there is nothing left to count.`,
      },
    ],
    workedExample: `// sum the decimal digits of a number, same shape:
int digit_sum(unsigned int n) {
    int s = 0;
    while (n) {         // stop when nothing is left
        s += n % 10;    // look at the lowest digit
        n /= 10;        // drop it, expose the next
    }
    return s;
}
// popcount is this exact loop, but in base 2:
// use  n & 1  instead of  n % 10, and  n >> 1  instead of  n / 10.`,
    whyItMatters: `Population count shows up everywhere bits stand for a set: flags
packed into one integer, a chessboard stored as a 64-bit "bitboard", hashing,
error-correcting codes, and computing Hamming distance. It's so common that many
CPUs have a dedicated \`POPCNT\` instruction and compilers expose \`__builtin_popcount\`.
Knowing the manual loop means you understand what that hardware is doing.`,
    commonMistakes: [
      'Using `n > 0` as the loop test on a signed value — for `unsigned int` write `while (n)`, which is true for any nonzero value.',
      'Writing `n >> 1` on its own line and expecting `n` to change — shifting does not modify `n` unless you assign it back with `n >>= 1`.',
      'Adding `n & 1` but forgetting it can only ever be 0 or 1 — no need to compare it to anything, just add it to the count.',
      'Testing `n & 1 == 1` without parentheses — `==` binds tighter than `&`, so it means `n & (1 == 1)`. Prefer `(n & 1)`.',
    ],
    hint: 'Loop `while (n)`. Each pass do `c += n & 1;` then `n >>= 1;`. Return `c` when the loop ends.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", popcount(0));
    printf("%d\\n", popcount(1));
    printf("%d\\n", popcount(7));
    printf("%d\\n", popcount(255));
    printf("%d\\n", popcount(1024));
    return 0;
}`,
  expectedStdout: `0
1
3
8
1
`,
  reference: `int popcount(unsigned int n) {
    int c = 0;
    while (n) {
        c += n & 1;
        n >>= 1;
    }
    return c;
}
`,
};

export default exercise;
