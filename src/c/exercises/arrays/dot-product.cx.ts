import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'dot-product',
  title: 'Dot product',
  module: '5 · Arrays',
  order: 450,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement dot(a, b, n): return the dot product of two double arrays a and b,
each of length n. The dot product is a[0]*b[0] + a[1]*b[1] + ... + a[n-1]*b[n-1].

Both arrays have the same length n. The result is a double.`,
  starter: `double dot(const double* a, const double* b, int n) {
    // sum of a[i] * b[i]
    return 0.0;
}
`,
  lesson: {
    intro: `The dot product walks **two** arrays at once, in lockstep. At each index you
multiply the matching pair \`a[i] * b[i]\`, and you add all those products into a running
total. It's the *multiply-and-accumulate* pattern — sum's slightly richer cousin.

Because the values are \`double\` (real numbers with a decimal point), your accumulator
must also be a \`double\`, seeded at \`0.0\`.`,
    sections: [
      {
        heading: 'One index, two arrays',
        body: `A single loop counter \`i\` indexes both arrays: \`a[i]\` and \`b[i]\`
refer to the same position in each. That's why they must share the length \`n\` — the
i-th element of one lines up with the i-th of the other.

Inside the loop: \`total += a[i] * b[i];\`. The multiplication happens first (C does
\`*\` before \`+=\`), then the product is added onto \`total\`.`,
      },
      {
        heading: 'double, not int',
        body: `Everything here is \`double\`: the parameters, the accumulator, and the
return type. Keep \`total\` as \`double total = 0.0;\` — if you accidentally made it an
\`int\`, every product would be truncated to a whole number and the sum would be wrong
for fractional inputs. Match the type to the data.`,
      },
    ],
    workedExample: `// multiply-and-accumulate across two arrays:
double total = 0.0;
for (int i = 0; i < n; i++) {
    total += a[i] * b[i];   // pair up, multiply, add on
}
return total;`,
    whyItMatters: `The dot product is one of the most important operations in all of
computing. It's a single row-times-column step of matrix multiplication, the core of
neural-network layers, the cosine-similarity behind search and recommendations, and the
projection math in graphics. Master this loop and matrix multiply is just this loop
nested twice.`,
    commonMistakes: [
      'Declaring the accumulator as `int`, which truncates fractional products.',
      'Adding `a[i] + b[i]` instead of multiplying `a[i] * b[i]`.',
      'Using two separate loops instead of walking both arrays with one shared index.',
      'Returning `0` (an int literal) instead of the accumulated `double` — a subtle type slip.',
    ],
    hint: 'Keep `double total = 0.0;`, loop once over n, and do `total += a[i] * b[i];`. Return `total`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    double a[] = {1, 2, 3};
    double b[] = {4, 5, 6};
    printf("%g\\n", dot(a, b, 3));
    double c[] = {1, 0, 0};
    double d[] = {9, 9, 9};
    printf("%g\\n", dot(c, d, 3));
    double e[] = {2, 2};
    double f[] = {3, 3};
    printf("%g\\n", dot(e, f, 2));
    return 0;
}`,
  expectedStdout: `32
9
12
`,
  reference: `double dot(const double* a, const double* b, int n) {
    double total = 0.0;
    for (int i = 0; i < n; i++) {
        total += a[i] * b[i];
    }
    return total;
}
`,
};

export default exercise;
