import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'sum-to-n',
  title: 'Sum 1 to n',
  module: '3 · Loops',
  order: 200,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement sum_to_n(n): return 1 + 2 + 3 + ... + n.

n is zero or positive. When n is 0 there is nothing to add, so return 0.
Use a loop and a running total — don't reach for a formula.`,
  starter: `int sum_to_n(int n) {
    // add up 1, 2, 3, ..., n
    return 0;
}
`,
  lesson: {
    intro: `A *loop* runs the same block of code over and over, with something changing
each time. Here we want to add up every whole number from 1 to \`n\`, so we'll count
a variable \`i\` up through 1, 2, 3, ... and add each value into a running total.

The key idea is an *accumulator*: a variable you set to 0 before the loop, then add
into on every pass. When the loop finishes, it holds the answer.`,
    sections: [
      {
        heading: 'The three parts of a for loop',
        body: `\`for (int i = 1; i <= n; i++)\` reads as three pieces separated by
semicolons: the *start* (\`i = 1\`), the *keep-going condition* (\`i <= n\`), and the
*step* (\`i++\`, "add 1 to i"). The body runs with \`i\` equal to 1, then 2, and so on,
stopping the moment \`i <= n\` is false.

Because we want to include \`n\` itself, the condition is \`i <= n\` (less-than-*or-equal*),
not \`i < n\`.`,
      },
      {
        heading: 'Accumulating a total',
        body: `Declare \`int total = 0;\` *before* the loop. Inside, write
\`total += i;\` — shorthand for \`total = total + i;\`. Each pass folds one more number
into \`total\`. After the loop ends, \`return total;\`.

Starting at 0 matters: 0 is the identity for addition, so an empty run (when \`n\` is 0
and the loop never executes) correctly leaves \`total\` at 0.`,
      },
    ],
    workedExample: `// sum of the first n even numbers: 2 + 4 + ... + 2n
int total = 0;
for (int i = 1; i <= n; i++) {
    total += 2 * i;   // fold in each even number
}
return total;`,
    whyItMatters: `Counting a variable through a range and accumulating a result is the
backbone of almost every program: summing prices, averaging scores, counting matches.
Once "set an accumulator, loop, fold each value in, return it" is automatic, most
loop problems become filling in the one line in the middle.`,
    commonMistakes: [
      'Using `i < n` instead of `i <= n`, which stops one short and leaves out `n` itself.',
      'Forgetting to initialize `total` to 0 — an uninitialized `int` holds garbage, not 0.',
      'Declaring `total` *inside* the loop, so it resets to 0 every pass and you lose the running sum.',
      'Returning from inside the loop after the first iteration instead of after it finishes.',
    ],
    hint: 'Start with `int total = 0;`, loop `for (int i = 1; i <= n; i++) total += i;`, then `return total;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", sum_to_n(5));
    printf("%d\\n", sum_to_n(1));
    printf("%d\\n", sum_to_n(100));
    printf("%d\\n", sum_to_n(0));
    return 0;
}`,
  expectedStdout: `15
1
5050
0
`,
  reference: `int sum_to_n(int n) {
    int total = 0;
    for (int i = 1; i <= n; i++) total += i;
    return total;
}
`,
};

export default exercise;
