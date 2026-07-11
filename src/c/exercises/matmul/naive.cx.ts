import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'matmul-naive',
  title: 'Naive matrix multiply',
  module: '13 · The Matmul Ladder',
  order: 1200,
  difficulty: 'medium',
  mode: 'function',
  prompt: `The one your lead wants you fluent in. Compute C = A · B with the classic triple
loop.

  A is n×m, B is m×p, C is n×p — all row-major flat arrays.
  C[i][j] = sum over k of A[i][k] * B[k][j].

Mind the strides: A uses m columns, B uses p columns, C uses p columns. The harness
checks a non-square product AND an identity product, so off-by-one indexing shows up.`,
  starter: `void matmul(int n, int m, int p,
            const double* A, const double* B, double* C) {
    // C = A*B.  A: n x m,  B: m x p,  C: n x p  (all row-major)
    // C[i*p + j] = sum_k A[i*m + k] * B[k*p + j]
}
`,
  lesson: {
    intro: `This is the capstone the whole track has been climbing toward. Matrix
multiplication: to get one cell of the result \`C\`, you take a *row* of \`A\` and a
*column* of \`B\`, multiply them element-by-element, and add up the products (a "dot
product"). Do that for every cell of \`C\`.

Shapes have to line up: \`A\` is \`n × m\`, \`B\` is \`m × p\`, and the shared dimension
\`m\` is what you sum over. The result \`C\` is \`n × p\`.`,
    sections: [
      {
        heading: 'One cell = one dot product',
        body: `\`C[i][j]\` is the dot product of row \`i\` of \`A\` and column \`j\` of \`B\`:
\`C[i][j] = A[i][0]*B[0][j] + A[i][1]*B[1][j] + ... + A[i][m-1]*B[m-1][j]\`. That sum
over \`k\` from 0 to \`m-1\` is the innermost loop. Accumulate it in a local \`double s\`
starting at 0, then store \`s\` into \`C\` once.`,
      },
      {
        heading: 'Three loops, three strides',
        body: `The outer two loops pick the cell: \`i\` over \`C\`'s rows (0..n-1), \`j\` over
\`C\`'s columns (0..p-1). The inner loop \`k\` runs the dot product. Now the row-major
indexing you drilled earlier pays off — each matrix has its *own* width:
\`A[i * m + k]\` (A is m wide), \`B[k * p + j]\` (B is p wide), \`C[i * p + j]\` (C is p
wide). Use the wrong width and you'll read the wrong number.`,
      },
    ],
    workedExample: `for (int i = 0; i < n; i++)
    for (int j = 0; j < p; j++) {
        double s = 0;
        for (int k = 0; k < m; k++)
            s += A[i * m + k] * B[k * p + j];
        C[i * p + j] = s;
    }`,
    whyItMatters: `Matmul is the beating heart of graphics, physics, machine learning, and
scientific computing — a GPU is essentially a machine for doing this fast. This
naive triple loop is *correct* but not *fast*: its memory access pattern fights the
CPU cache. The next rungs — transpose-for-cache, then tiling — keep this exact
result but reorder the work to run many times faster. You have to nail the correct
version first.`,
    commonMistakes: [
      'Reusing one width for all three matrices. `A` strides by `m`, `B` by `p`, `C` by `p`. Keep them separate.',
      'Resetting the accumulator in the wrong place — `double s = 0;` must sit *inside* the `j` loop, before the `k` loop, so each cell starts fresh.',
      'Summing over the wrong dimension. The shared dimension is `m` (A’s columns = B’s rows); that is the `k` range.',
      'Writing `C[i * p + j]` inside the `k` loop, overwriting it each step instead of storing the finished sum once.',
    ],
    hint: 'Three nested loops i, j, k. Keep `double s = 0;` between the j and k loops. Inner: `s += A[i*m+k] * B[k*p+j];`. After k: `C[i*p+j] = s;`.',
  },
  harness: `#include <stdio.h>
static void show(int rows, int cols, const double* M) {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) printf("%g ", M[i * cols + j]);
        printf("\\n");
    }
}
int main(void) {
    /* case 1: (2x3) * (3x2) -> 2x2 */
    double A1[6] = {1, 2, 3, 4, 5, 6};
    double B1[6] = {7, 8, 9, 10, 11, 12};
    double C1[4];
    matmul(2, 3, 2, A1, B1, C1);
    show(2, 2, C1);
    /* case 2: I(3x3) * X(3x3) -> X */
    double I[9] = {1,0,0, 0,1,0, 0,0,1};
    double X[9] = {2,3,5, 7,11,13, 17,19,23};
    double C2[9];
    matmul(3, 3, 3, I, X, C2);
    show(3, 3, C2);
    return 0;
}`,
  expectedStdout: `58 64
139 154
2 3 5
7 11 13
17 19 23
`,
  reference: `void matmul(int n, int m, int p,
            const double* A, const double* B, double* C) {
    for (int i = 0; i < n; i++)
        for (int j = 0; j < p; j++) {
            double s = 0;
            for (int k = 0; k < m; k++) s += A[i * m + k] * B[k * p + j];
            C[i * p + j] = s;
        }
}
`,
};

export default exercise;
