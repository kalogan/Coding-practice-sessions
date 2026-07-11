import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'average-three',
  title: 'Average of three numbers',
  module: '1 · Values & Operators',
  order: 50,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement average3(a, b, c) so it returns the average (mean) of the three
numbers.

The average of three numbers is their sum divided by 3. All three parameters and
the return value are \`double\`. A hidden harness checks several triples.`,
  starter: `double average3(double a, double b, double c) {
    // return the average of a, b, and c
    return 0.0;
}
`,
  lesson: {
    intro: `To average three numbers you add them all up, then divide by three. The order
matters: you must finish the *whole* sum before you divide. If you divided as you went,
you'd be dividing the wrong thing.

C evaluates \`/\` before \`+\`, so if you wrote \`a + b + c / 3.0\` the compiler would divide
just \`c\` by 3 first, then add \`a\` and \`b\` — not what you want at all. You need to force
the addition to happen first, and that's what parentheses are for.`,
    sections: [
      {
        heading: 'Parentheses force the grouping you mean',
        body: `Parentheses \`( )\` override the normal operator precedence: whatever is inside
them is computed first, as one value. Writing \`(a + b + c)\` guarantees the three numbers
are summed into a single total *before* anything else touches them.

Then \`(a + b + c) / 3.0\` divides that finished total by three. Compare the two:
\`a + b + c / 3.0\` divides only \`c\` (wrong), while \`(a + b + c) / 3.0\` divides the whole
sum (right). Same symbols, completely different answers — the parentheses are what make
the difference.`,
      },
      {
        heading: 'Divide by 3.0, not 3',
        body: `As with the temperature conversion, keep the divisor a \`double\`: write
\`3.0\`, not \`3\`. Here the operands \`a\`, \`b\`, and \`c\` are already \`double\`, so the sum is
a \`double\` and \`/ 3.0\` gives a proper decimal result.

Using \`3.0\` makes the intent unmistakable and keeps the division honest — the average of
\`2\`, \`2\`, and \`5\` is \`3\` exactly, and the average of \`1\`, \`2\`, and \`4\` should be
\`2.333...\`, not a truncated \`2\`. A \`double\` divisor preserves that fraction.`,
      },
    ],
    workedExample: `// average of two numbers
double average2(double x, double y) {
    return (x + y) / 2.0;   // sum first (parentheses), then divide
}
// average2(3.0, 8.0)  ->  5.5`,
    whyItMatters: `Averaging is the simplest statistic there is — grades, sensor readings,
frame times, benchmark runs all get summarised by a mean. And the "group first, then
combine" habit that parentheses give you is fundamental: getting the order of operations
right is the difference between a correct formula and a plausible-looking wrong one.`,
    commonMistakes: [
      'Omitting the parentheses: `a + b + c / 3.0` only divides `c`, because `/` binds tighter than `+`.',
      'Dividing by `3` instead of `3.0` — safe here since the operands are `double`, but `3.0` keeps the intent clear.',
      'Dividing by the wrong count, e.g. `/ 2.0`, when there are three numbers.',
      'Returning an `int`, which would throw away the fractional part of the average.',
    ],
    hint: 'The body is one line: `return (a + b + c) / 3.0;`. Sum the three inside parentheses first, then divide the total by `3.0`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%g\\n", average3(1, 2, 3));
    printf("%g\\n", average3(10, 20, 30));
    printf("%g\\n", average3(2, 2, 5));
    printf("%g\\n", average3(0, 0, 0));
    return 0;
}`,
  expectedStdout: `2
20
3
0
`,
  reference: `double average3(double a, double b, double c) {
    return (a + b + c) / 3.0;
}
`,
};

export default exercise;
