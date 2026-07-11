import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'reverse-number',
  title: 'Reverse a number',
  module: '3 · Loops',
  order: 270,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement reverse_num(n): return n with its decimal digits reversed.

reverse_num(123) is 321; reverse_num(9080) is 809. n is zero or positive. Leading zeros
simply vanish (100 reverses to 1), which happens naturally with integer arithmetic.`,
  starter: `int reverse_num(int n) {
    // peel digits off n and build the reversed number
    return 0;
}
`,
  lesson: {
    intro: `To reverse a number's digits, we peel them off the *back* of \`n\` one at a
time and stack them onto the *front* of a result we're building. Two operations do all
the work: \`% 10\` reads the last digit, and \`/ 10\` removes it.

This combines two ideas you've seen — a \`while\` loop that shrinks \`n\` until it's 0,
and an accumulator — but here the accumulator is built up digit by digit rather than by
adding or multiplying a single value.`,
    sections: [
      {
        heading: 'Peel with % 10 and / 10',
        body: `\`n % 10\` gives the rightmost digit: \`123 % 10\` is 3. \`n / 10\` (integer
division) drops that digit: \`123 / 10\` is 12. Loop \`while (n > 0)\`, and each pass
grab \`n % 10\`, then do \`n /= 10\` so the next digit moves into place. When \`n\`
reaches 0, every digit has been consumed.`,
      },
      {
        heading: 'Build the result with r = r * 10 + digit',
        body: `Start \`int r = 0;\`. To append a digit to the right of \`r\`, first shift
\`r\` left one place by multiplying by 10, then add the new digit:
\`r = r * 10 + (n % 10);\`.

Trace \`123\`: r starts 0. Digit 3 → r = 0*10 + 3 = 3. Digit 2 → r = 3*10 + 2 = 32.
Digit 1 → r = 32*10 + 1 = 321. Because we take digits from the back of \`n\` but push
them onto the back of \`r\`, the order flips — which is exactly the reversal we want.
Trailing zeros of \`n\` become leading zeros of \`r\` and just disappear.`,
      },
    ],
    workedExample: `// sum the digits of n (same peel loop, different fold)
int total = 0;
while (n > 0) {
    total += n % 10;   // take the last digit
    n /= 10;           // drop it
}
return total;`,
    whyItMatters: `Digit-by-digit manipulation is how you build palindrome checks, digit
sums, and simple checksums, and it mirrors how you'd reverse a list or a string. The core
move — "read the last piece with %, remove it with /, and grow a result with
value * base + piece" — generalizes to any base and to many parsing tasks.`,
    commonMistakes: [
      'Forgetting `n /= 10;`, so the same last digit repeats forever — an infinite loop.',
      'Writing `r = r + n % 10` without the `* 10`, which just sums the digits instead of reversing.',
      'Adding the digit before multiplying (`r = r * 10` on a later line), shifting one time too few or too many.',
      'Starting `r` at something other than 0, corrupting the very first `r * 10 + digit` step.',
    ],
    hint: 'Use `int r = 0; while (n > 0) { r = r * 10 + n % 10; n /= 10; } return r;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", reverse_num(123));
    printf("%d\\n", reverse_num(100));
    printf("%d\\n", reverse_num(7));
    printf("%d\\n", reverse_num(9080));
    return 0;
}`,
  expectedStdout: `321
1
7
809
`,
  reference: `int reverse_num(int n) {
    int r = 0;
    while (n > 0) {
        r = r * 10 + n % 10;
        n /= 10;
    }
    return r;
}
`,
};

export default exercise;
