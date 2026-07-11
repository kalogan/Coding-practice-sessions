import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'abs-value',
  title: 'Absolute value',
  module: '2 · Making Decisions',
  order: 110,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement absval(n) so it returns the absolute value of n — the distance of n
from zero, always zero or positive.

absval(5) is 5, absval(-5) is also 5, absval(0) is 0. Negative numbers get
flipped to positive; everything else is returned unchanged.`,
  starter: `int absval(int n) {
    // return the absolute value of n (never negative)
    return 0;
}
`,
  lesson: {
    intro: `Absolute value strips the sign off a number: it answers "how far from zero
is this?", ignoring which side of zero it's on. \`-5\` and \`5\` are both a distance
of \`5\` away, so both have absolute value \`5\`.

The insight is that only *one* case needs fixing. A number that's already zero or
positive is fine as-is. Only a *negative* number needs to be flipped. So you
handle the one troublesome case and leave the rest alone.`,
    sections: [
      {
        heading: 'Negation with the minus sign',
        body: `In C, putting a \`-\` in front of a value negates it: \`-n\` means "the
negative of \`n\`". Here's the twist that trips people up — if \`n\` is already
negative, then \`-n\` is *positive*. If \`n\` is \`-5\`, then \`-n\` is \`5\`.

So "flip a negative number to positive" is simply \`-n\`. The minus doesn't mean
"make it negative"; it means "reverse whatever sign it has".`,
      },
      {
        heading: 'A guard clause: return early',
        body: `You don't always need an \`else\`. A common pattern is the *guard clause*:
check for the special case, handle it, and \`return\` right away. Because \`return\`
ends the function immediately, any code after it only runs when the check was
false.

\`if (n < 0) return -n;\` — if \`n\` is negative, flip it and leave. If it wasn't
negative, execution falls through to the next line, where you just return \`n\`
unchanged.`,
      },
    ],
    workedExample: `// return n only if it is even; otherwise return 0
int keep_even(int n) {
    if (n % 2 != 0) return 0;   // guard: odd numbers leave early
    return n;                   // reached only when n is even
}
// keep_even(4) -> 4     keep_even(7) -> 0`,
    whyItMatters: `Distance is meaningless with a sign — "3 miles away" is never
"-3 miles away". Absolute value shows up everywhere you compare magnitudes:
how far a guess is from the target, the error between two measurements, the gap
between two positions. And the guard-clause habit you learn here keeps real
functions flat and readable instead of deeply nested.`,
    commonMistakes: [
      'Thinking `-n` always makes a number negative. It *reverses* the sign, so for a negative `n` it produces a positive result.',
      'Using `if (n < 0)` but then writing `return n;` inside it — that returns the negative value unchanged. You want `return -n;`.',
      'Handling `0` as a special case. Zero already passes the `n < 0` check as false and returns unchanged, so no extra code is needed.',
      'Forgetting the final `return n;` for the non-negative case, leaving the function with no value to return.',
    ],
    hint: 'One guard clause does it: `if (n < 0) return -n;` and then `return n;` on the next line for everything that wasn\'t negative.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", absval(5));
    printf("%d\\n", absval(-5));
    printf("%d\\n", absval(0));
    printf("%d\\n", absval(-100));
    return 0;
}`,
  expectedStdout: `5
5
0
100
`,
  reference: `int absval(int n) {
    if (n < 0) return -n;
    return n;
}
`,
};

export default exercise;
