import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'factorial-loop',
  title: 'Factorial with a loop',
  module: '3 · Loops',
  order: 210,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Implement factorial(n): return n! = 1 * 2 * 3 * ... * n.

By definition 0! is 1 (an empty product). The result grows fast, so the function
returns a \`long\`, not an \`int\`.`,
  starter: `long factorial(int n) {
    // multiply 1 * 2 * ... * n
    return 0;
}
`,
  lesson: {
    intro: `A *factorial* multiplies together every whole number from 1 up to \`n\`. So
\`5! = 1 * 2 * 3 * 4 * 5 = 120\`. It's the summing loop you just met, but with
multiplication instead of addition — which changes one important detail.

An accumulator for a *product* must start at **1**, not 0. Multiplying by 0 would
wipe everything out; 1 is the identity for multiplication, so it leaves the first
factor untouched.`,
    sections: [
      {
        heading: 'A product accumulator starts at 1',
        body: `Write \`long result = 1;\` before the loop, then multiply each number in:
\`result *= i;\` (shorthand for \`result = result * i;\`). Loop \`i\` from 1 to \`n\`
inclusive.

The empty-product rule falls out for free: when \`n\` is 0 the loop never runs, and
\`result\` is still 1 — exactly the definition \`0! = 1\`.`,
      },
      {
        heading: 'Why long, not int',
        body: `Factorials explode. \`13!\` is already about 6.2 billion, which overflows a
32-bit \`int\` (max ~2.1 billion). A \`long\` holds far larger values, so we declare
both the accumulator and the return type as \`long\`.

Print a \`long\` with \`%ld\` — the \`l\` means "long". Using plain \`%d\` on a
\`long\` is a mismatch and prints garbage.`,
      },
    ],
    workedExample: `// product of the first n odd numbers: 1 * 3 * 5 * ...
long result = 1;              // identity for multiplication
for (int i = 1; i <= n; i++) {
    result *= (2 * i - 1);    // 1, 3, 5, ...
}
return result;`,
    whyItMatters: `Factorials appear all over counting and probability — permutations,
combinations, and the math behind many algorithms. More broadly, "multiply a running
product across a loop" is the twin of "add a running sum", and knowing when to seed an
accumulator with 0 versus 1 is a habit that prevents silent, baffling bugs.`,
    commonMistakes: [
      'Starting `result` at 0 — then every multiply gives 0 and the answer is always 0.',
      'Declaring `result` as `int` instead of `long`, which overflows for larger `n`.',
      'Printing a `long` with `%d` instead of `%ld`.',
      'Looping `i < n` and missing the final factor `n`.',
    ],
    hint: 'Use `long result = 1;`, loop `for (int i = 1; i <= n; i++) result *= i;`, then `return result;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%ld\\n", factorial(0));
    printf("%ld\\n", factorial(1));
    printf("%ld\\n", factorial(5));
    printf("%ld\\n", factorial(10));
    return 0;
}`,
  expectedStdout: `1
1
120
3628800
`,
  reference: `long factorial(int n) {
    long result = 1;
    for (int i = 1; i <= n; i++) result *= i;
    return result;
}
`,
};

export default exercise;
