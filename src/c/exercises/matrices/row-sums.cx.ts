import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'row-sums',
  title: 'Sum each row of a matrix',
  module: '12 · Matrices',
  order: 1170,
  difficulty: 'easy',
  mode: 'function',
  prompt: `For a rows×cols matrix \`A\` (row-major flat array of doubles), compute the sum of
each row and store it in \`out\`, which has \`rows\` elements.

    out[i] = A[i][0] + A[i][1] + ... + A[i][cols-1]
           = sum over j of A[i * cols + j]

One result per row. Return nothing; fill \`out\`.`,
  starter: `void row_sums(int rows, int cols, const double* A, double* out) {
    // out[i] = sum of row i of A
}
`,
  lesson: {
    intro: `A row sum collapses each horizontal row of a matrix down to a single number: add
up all the values in that row. A \`rows × cols\` matrix therefore yields \`rows\`
answers — one per row — stored in the output array \`out\`.

The pattern is a nested loop where the *inner* loop walks across a single row's
columns, accumulating, and the *outer* loop moves down to the next row.`,
    sections: [
      {
        heading: 'Fix a row, sweep its columns',
        body: `For a chosen row \`i\`, the elements are \`A[i * cols + 0]\` through
\`A[i * cols + (cols-1)]\`. Loop \`j\` from \`0\` to \`cols-1\`, adding
\`A[i * cols + j]\` into a running total \`s\`. When the inner loop finishes, \`s\` holds
that row's sum — store it in \`out[i]\`.`,
      },
      {
        heading: 'Reset the accumulator per row',
        body: `The subtle part is *where* \`s\` is initialized. It must be set to \`0\` at
the top of the outer loop, before the inner loop starts, so each row begins from
scratch. Forget that and each row's total leaks into the next. There is exactly one
write to \`out\` per outer iteration, after the inner loop.`,
      },
    ],
    workedExample: `for (int i = 0; i < rows; i++) {
    double s = 0;                    // fresh per row
    for (int j = 0; j < cols; j++)
        s += A[i * cols + j];        // walk across row i
    out[i] = s;                      // one result per row
}`,
    whyItMatters: `Reducing along an axis — row sums, column sums, row maxima — is the basic
move behind aggregating data: totaling a spreadsheet's rows, normalizing the rows of a
probability matrix so they sum to 1, or pooling features in machine learning. It is
also the same accumulate-then-store skeleton that matrix-vector multiply and matmul
build on, minus the second array.`,
    commonMistakes: [
      'Declaring or zeroing `s` outside the outer loop, so row totals accumulate across rows.',
      'Summing down columns instead of across a row — the inner loop must range over `j` (the columns).',
      'Writing to `out[i]` inside the inner loop, overwriting it each step instead of once at the end.',
      'Sizing `out` by `cols` instead of `rows`; there is one sum per row.',
    ],
    hint: 'Outer loop over rows `i` with `double s = 0;` at the top. Inner loop over cols `j` adds `A[i*cols+j]`. After it, `out[i] = s;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    /* case 1: 2x3 */
    double A1[6] = {1, 2, 3,
                    4, 5, 6};
    double out1[2];
    row_sums(2, 3, A1, out1);
    printf("%g %g\\n", out1[0], out1[1]);
    /* case 2: 3x2 */
    double A2[6] = {1, 2,
                    3, 4,
                    5, 6};
    double out2[3];
    row_sums(3, 2, A2, out2);
    printf("%g %g %g\\n", out2[0], out2[1], out2[2]);
    /* case 3: 1x4 */
    double A3[4] = {2, 4, 6, 8};
    double out3[1];
    row_sums(1, 4, A3, out3);
    printf("%g\\n", out3[0]);
    return 0;
}`,
  expectedStdout: `6 15
3 7 11
20
`,
  reference: `void row_sums(int rows, int cols, const double* A, double* out) {
    for (int i = 0; i < rows; i++) {
        double s = 0;
        for (int j = 0; j < cols; j++)
            s += A[i * cols + j];
        out[i] = s;
    }
}
`,
};

export default exercise;
