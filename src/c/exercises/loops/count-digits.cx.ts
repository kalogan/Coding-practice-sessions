import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'count-digits',
  title: 'Count the digits',
  module: '3 · Loops',
  order: 230,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement count_digits(n): return how many decimal digits n has.

n is zero or positive. 0 has one digit. 42 has two. 100000 has six. Use a loop that
keeps chopping a digit off until nothing is left.`,
  starter: `int count_digits(int n) {
    // how many digits does n have?
    return 0;
}
`,
  lesson: {
    intro: `Sometimes you don't know in advance how many times a loop should run — you
loop *until a condition stops being true*. That's what \`while\` is for. Here we want to
count the digits of a number, and the number of digits is exactly how many times we can
divide it by 10 before it reaches 0.

Integer division on \`int\` throws away the remainder: \`742 / 10\` is \`74\`, then
\`74 / 10\` is \`7\`, then \`7 / 10\` is \`0\`. That's three steps for a three-digit
number.`,
    sections: [
      {
        heading: 'The while loop',
        body: `\`while (n > 0) { ... }\` checks the condition *before* each pass and runs
the body as long as it holds. Inside, do \`n /= 10;\` (shorthand for \`n = n / 10;\`)
to strip the last digit, and bump a counter each time. When \`n\` finally hits 0 the
condition fails and the loop ends.

Modifying the loop variable inside the body is what makes a \`while\` loop terminate —
forget it and you loop forever.`,
      },
      {
        heading: 'The special case: 0',
        body: `Zero is the trap. If \`n\` is 0, the condition \`n > 0\` is false on the
very first check, the loop never runs, and a naive counter stays at 0 — but 0 is
written with *one* digit, so the answer should be 1.

The clean fix is to handle it up front: \`if (n == 0) return 1;\` before the loop.
Then the loop only ever sees numbers with at least one digit to peel.`,
      },
    ],
    workedExample: `// count how many times 5 divides evenly into n
int count = 0;
while (n % 5 == 0 && n > 0) {
    count++;
    n /= 5;        // shrink toward the stopping point
}
return count;`,
    whyItMatters: `"Divide by 10 to peel digits" is the standard toolkit for taking a
number apart — reversing it, summing its digits, checking a checksum. And the broader
lesson, "loop until a shrinking value hits a base case, but guard the empty case first",
is a pattern you'll reuse constantly once you notice it.`,
    commonMistakes: [
      'Forgetting the `n == 0` special case and returning 0 for the input 0.',
      'Never changing `n` inside the loop, so `n > 0` stays true forever — an infinite loop.',
      'Using `n - 10` instead of `n / 10`, which does not strip a digit.',
      'Starting the counter at 1 to "fix" the zero case, which then over-counts every other number by one.',
    ],
    hint: 'Guard first: `if (n == 0) return 1;`. Then `int count = 0; while (n > 0) { count++; n /= 10; } return count;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", count_digits(0));
    printf("%d\\n", count_digits(7));
    printf("%d\\n", count_digits(42));
    printf("%d\\n", count_digits(100000));
    return 0;
}`,
  expectedStdout: `1
1
2
6
`,
  reference: `int count_digits(int n) {
    if (n == 0) return 1;
    int count = 0;
    while (n > 0) {
        count++;
        n /= 10;
    }
    return count;
}
`,
};

export default exercise;
