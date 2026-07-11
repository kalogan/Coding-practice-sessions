import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'scalar-multiply',
  title: 'Scale a matrix by a number',
  module: '12 · Matrices',
  order: 1150,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Multiply every element of a rows×cols matrix \`A\` by a scalar \`k\`, storing the
result in \`C\`. Both are row-major flat arrays of doubles with the same shape.

    C[i][j] = k * A[i][j]

Return nothing; write each scaled value into \`C\`.`,
  starter: `void scalar_mul(int rows, int cols, double k, const double* A, double* C) {
    // C[i][j] = k * A[i][j]
}
`,
  lesson: {
    intro: `Scalar multiplication scales a whole matrix by a single number \`k\`: every cell
is multiplied by \`k\` independently. Doubling a matrix (\`k = 2\`) doubles every entry;
\`k = -1\` negates it; \`k = 0\` wipes it to all zeros.

Like matrix addition, this is a pure *elementwise* pass — each cell depends only on
its own value and the shared scalar, so \`A\` and \`C\` use the very same flat index.`,
    sections: [
      {
        heading: 'The scalar is shared by every cell',
        body: `There is exactly one \`k\`, and it multiplies each element the same way.
So the body is just \`C[idx] = k * A[idx]\` where \`idx = i * cols + j\`. No cell
influences any other — nothing to accumulate, nothing to carry.`,
      },
      {
        heading: 'Watch the special values of k',
        body: `\`k = 0\` produces an all-zero matrix — every product is \`0\`. \`k = 1\`
copies \`A\` unchanged. \`k = -1\` negates every entry. These aren't special cases you
handle separately; the single line \`k * A[idx]\` already does the right thing for all
of them. They're just handy sanity checks.`,
      },
    ],
    workedExample: `// scale every element by k
for (int i = 0; i < rows; i++)
    for (int j = 0; j < cols; j++) {
        int idx = i * cols + j;
        C[idx] = k * A[idx];
    }
// k = 2 doubles, k = -1 negates, k = 0 zeros everything`,
    whyItMatters: `Scaling a matrix underlies normalizing data, adjusting learning rates
in gradient updates, converting units, and dimming or brightening an image. Combined
with elementwise addition it gives you \`k*A + B\` — the "axpy" operation at the core of
numerical linear algebra libraries like BLAS.`,
    commonMistakes: [
      'Adding `k` instead of multiplying by it — the operation is `k * A[idx]`, not `k + A[idx]`.',
      'Declaring `k` as an `int` and truncating fractional scalars like `0.5`; keep it a `double`.',
      'Using different indices for `A` and `C` even though they share a shape.',
      'Special-casing `k == 0` or `k == 1` with extra branches — the one multiply line already covers them.',
    ],
    hint: 'One pass over every cell. At each index, write `k * A[idx]` into `C[idx]`.',
  },
  harness: `#include <stdio.h>
static void show(int rows, int cols, const double* M) {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) printf("%g ", M[i * cols + j]);
        printf("\\n");
    }
}
int main(void) {
    /* case 1: k = 2 */
    double A1[4] = {1, 2, 3, 4};
    double C1[4];
    scalar_mul(2, 2, 2, A1, C1);
    show(2, 2, C1);
    /* case 2: k = 0 -> all zeros */
    double A2[4] = {5, 6, 7, 8};
    double C2[4];
    scalar_mul(2, 2, 0, A2, C2);
    show(2, 2, C2);
    /* case 3: k = -1 -> negation */
    double A3[3] = {1, -2, 3};
    double C3[3];
    scalar_mul(1, 3, -1, A3, C3);
    show(1, 3, C3);
    return 0;
}`,
  expectedStdout: `2 4
6 8
0 0
0 0
-1 2 -3
`,
  reference: `void scalar_mul(int rows, int cols, double k, const double* A, double* C) {
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++) {
            int idx = i * cols + j;
            C[idx] = k * A[idx];
        }
}
`,
};

export default exercise;
