import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'matrix-add',
  title: 'Add two matrices',
  module: '12 · Matrices',
  order: 1140,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Add two rows×cols matrices elementwise: set \`C = A + B\`. All three are
row-major flat arrays of doubles with the same shape.

    C[i][j] = A[i][j] + B[i][j]

Because the shape is identical for all three, the same flat index works for every
matrix. Write each sum into \`C\`; return nothing.`,
  starter: `void mat_add(int rows, int cols, const double* A, const double* B, double* C) {
    // C[i][j] = A[i][j] + B[i][j], same index in all three
}
`,
  lesson: {
    intro: `Adding matrices is the easiest matrix operation: line the two grids up, add each
pair of matching cells, and store the result in the same spot. \`A\`, \`B\`, and the
output \`C\` all have the identical shape, so a cell at row \`i\`, column \`j\` maps to
the *same* flat index \`i * cols + j\` in every one of them.

That shared-index fact makes this an *elementwise* operation — no cross-talk between
cells, no strides to juggle.`,
    sections: [
      {
        heading: 'One index, three arrays',
        body: `Since all three matrices share a shape, you never need three different
formulas. Compute the index once — call it \`idx = i * cols + j\` — then write
\`C[idx] = A[idx] + B[idx]\`. Every cell is independent of every other, which is what
"elementwise" means.`,
      },
      {
        heading: 'You can flatten the two loops into one',
        body: `A nested loop over \`i\` and \`j\` is the clearest way to think about it, but
because the memory is one contiguous block you can also run a *single* loop over
\`k\` from \`0\` to \`rows * cols - 1\` and do \`C[k] = A[k] + B[k]\`. Both are correct;
the flat single loop is a nice glimpse of how elementwise ops really look in memory.`,
      },
    ],
    workedExample: `// nested-loop form
for (int i = 0; i < rows; i++)
    for (int j = 0; j < cols; j++) {
        int idx = i * cols + j;
        C[idx] = A[idx] + B[idx];
    }
// or the flat one-liner: for k in 0..rows*cols-1: C[k] = A[k] + B[k];`,
    whyItMatters: `Elementwise addition (and its cousins — subtraction, the Hadamard
product) is everywhere: blending images, accumulating gradients in machine learning,
stepping physics simulations. It also introduces the mental model that a matrix is
just a flat block you can sweep in one pass — the foundation for scaling, thresholding,
and every other per-element transform.`,
    commonMistakes: [
      'Using a different index for `A`, `B`, and `C` when they share a shape — one formula serves all three.',
      'Looping `rows * cols` times but indexing with `i * cols + j` from a nested loop at the same time (mixing the two styles).',
      'Reading past the end because the loop bound used `rows` where it needed `cols` (or vice-versa).',
      'Trying to "add" mismatched shapes — elementwise add requires `A` and `B` to have the same dimensions.',
    ],
    hint: 'Loop over every cell (nested `i`,`j` or a single `k`). Set `C` at that index to `A` plus `B` at the same index.',
  },
  harness: `#include <stdio.h>
static void show(int rows, int cols, const double* M) {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) printf("%g ", M[i * cols + j]);
        printf("\\n");
    }
}
int main(void) {
    /* case 1: 2x2 */
    double A1[4] = {1, 2, 3, 4};
    double B1[4] = {5, 6, 7, 8};
    double C1[4];
    mat_add(2, 2, A1, B1, C1);
    show(2, 2, C1);
    /* case 2: 1x3 */
    double A2[3] = {10, 20, 30};
    double B2[3] = {1, 2, 3};
    double C2[3];
    mat_add(1, 3, A2, B2, C2);
    show(1, 3, C2);
    /* case 3: 2x2 with negatives */
    double A3[4] = {5, -4, 3, -2};
    double B3[4] = {-1, -1, -1, -1};
    double C3[4];
    mat_add(2, 2, A3, B3, C3);
    show(2, 2, C3);
    return 0;
}`,
  expectedStdout: `6 8
10 12
11 22 33
4 -5
2 -3
`,
  reference: `void mat_add(int rows, int cols, const double* A, const double* B, double* C) {
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++) {
            int idx = i * cols + j;
            C[idx] = A[idx] + B[idx];
        }
}
`,
};

export default exercise;
