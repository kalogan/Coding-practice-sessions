import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'matrix-vector-mul',
  title: 'Multiply a matrix by a vector',
  module: '12 · Matrices',
  order: 1160,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Compute \`y = A * x\`, where \`A\` is a rows×cols matrix (row-major flat array),
\`x\` is a vector of \`cols\` elements, and \`y\` is the output vector of \`rows\`
elements.

    y[i] = A[i][0]*x[0] + A[i][1]*x[1] + ... + A[i][cols-1]*x[cols-1]
         = sum over j of A[i * cols + j] * x[j]

Each output element is the dot product of one ROW of \`A\` with the whole vector
\`x\`. Write nothing; fill \`y\`.`,
  starter: `void matvec(int rows, int cols, const double* A, const double* x, double* y) {
    // y[i] = sum_j A[i][j] * x[j]
}
`,
  lesson: {
    intro: `A matrix times a vector produces another vector. Each entry of the output
\`y[i]\` is a *dot product*: take row \`i\` of the matrix, pair it up element-by-element
with the vector \`x\`, multiply each pair, and sum the results.

If \`A\` is \`rows × cols\`, then \`x\` must have \`cols\` elements (one per column) and
\`y\` ends up with \`rows\` elements (one per row). This is the direct bridge to full
matrix multiplication — matmul is just this operation done for many columns at once.`,
    sections: [
      {
        heading: 'Each output = a row dotted with x',
        body: `Fix a row \`i\`. Its dot product with \`x\` is
\`A[i][0]*x[0] + A[i][1]*x[1] + ... + A[i][cols-1]*x[cols-1]\`. Accumulate it in a
local \`double s = 0;\`, loop \`j\` from \`0\` to \`cols-1\` adding
\`A[i * cols + j] * x[j]\`, then store \`s\` into \`y[i]\`. The sum runs over the
columns \`j\`; the vector \`x\` is indexed by that same \`j\`.`,
      },
      {
        heading: 'Two loops, and where the accumulator lives',
        body: `The outer loop picks the row \`i\` (\`0..rows-1\`); the inner loop \`j\` runs
the dot product. Reset \`s = 0\` at the *top of the outer loop*, before the inner loop,
so each output element starts fresh. Note \`A\` is indexed with stride \`cols\`
(\`A[i * cols + j]\`) while \`x\` is a plain vector indexed by \`j\` alone.`,
      },
    ],
    workedExample: `for (int i = 0; i < rows; i++) {
    double s = 0;                       // fresh per row
    for (int j = 0; j < cols; j++)
        s += A[i * cols + j] * x[j];    // row i dotted with x
    y[i] = s;
}`,
    whyItMatters: `Matrix-vector products are the workhorse of applied math: one dense
layer of a neural network is \`y = Wx + b\`, rotating a 3-D point is a 3×3 matrix times
a vector, and iterative solvers repeat matvec thousands of times. Master the
row-times-vector dot product here and full matmul on the next track is just the same
idea widened to many vectors.`,
    commonMistakes: [
      'Resetting `s = 0` in the wrong place — it must sit inside the row loop, before the `j` loop, so each `y[i]` starts from zero.',
      'Indexing `x` with the matrix stride (`x[i * cols + j]`) instead of just `x[j]`; `x` is a flat vector.',
      'Summing over rows instead of columns — the dot product runs over `j` (the `cols` dimension).',
      'Writing to `y[i]` inside the `j` loop, overwriting it each step instead of storing the finished sum once.',
    ],
    hint: 'Outer loop over rows `i`. Inside, `double s = 0;` then loop `j` over cols adding `A[i*cols+j] * x[j]`. Store `s` into `y[i]`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    /* case 1: 2x3 matrix times a length-3 vector */
    double A1[6] = {1, 2, 3,
                    4, 5, 6};
    double x1[3] = {1, 1, 1};
    double y1[2];
    matvec(2, 3, A1, x1, y1);
    printf("%g %g\\n", y1[0], y1[1]);
    /* case 2: 3x3 identity times a vector -> the vector back */
    double I[9] = {1,0,0, 0,1,0, 0,0,1};
    double x2[3] = {2, 3, 5};
    double y2[3];
    matvec(3, 3, I, x2, y2);
    printf("%g %g %g\\n", y2[0], y2[1], y2[2]);
    /* case 3: zeros mixed in */
    double A3[4] = {2, 0,
                    1, 3};
    double x3[2] = {0, 4};
    double y3[2];
    matvec(2, 2, A3, x3, y3);
    printf("%g %g\\n", y3[0], y3[1]);
    return 0;
}`,
  expectedStdout: `6 15
2 3 5
0 12
`,
  reference: `void matvec(int rows, int cols, const double* A, const double* x, double* y) {
    for (int i = 0; i < rows; i++) {
        double s = 0;
        for (int j = 0; j < cols; j++)
            s += A[i * cols + j] * x[j];
        y[i] = s;
    }
}
`,
};

export default exercise;
