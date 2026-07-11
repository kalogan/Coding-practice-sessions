import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'transpose',
  title: 'Transpose a matrix',
  module: '12 · Matrices',
  order: 1130,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Transpose a rows×cols matrix A into B (which is cols×rows). Both are row-major
flat arrays. Element A[i][j] becomes B[j][i]:

    B[j * rows + i] = A[i * cols + j]

Getting the two different strides right (cols for A, rows for B) is the exact skill
the cache-aware matmul later depends on.`,
  starter: `void transpose(int rows, int cols, const double* A, double* B) {
    // B is cols x rows: B[j][i] = A[i][j]
}
`,
  lesson: {
    intro: `Transposing flips a matrix over its diagonal: rows become columns and columns
become rows. The value at row \`i\`, column \`j\` of \`A\` lands at row \`j\`, column
\`i\` of \`B\`. If \`A\` is \`rows × cols\`, then \`B\` is \`cols × rows\` — its shape is
swapped too.

The whole exercise is applying the row-major formula *twice* — once to read from
\`A\`, once to write into \`B\` — with different widths.`,
    sections: [
      {
        heading: 'Two matrices, two different strides',
        body: `\`A\` has \`cols\` columns, so its element (i, j) is at \`A[i * cols + j]\`. But
\`B\` has \`rows\` columns (it is \`cols × rows\`), so *its* element (j, i) is at
\`B[j * rows + i]\`. The two index formulas use different multipliers — \`cols\` for
\`A\`, \`rows\` for \`B\` — because the two matrices are different widths. That's the
crux.`,
      },
      {
        heading: 'The double loop',
        body: `Walk every cell of \`A\` with a nested loop: outer \`i\` over rows
(\`0..rows-1\`), inner \`j\` over columns (\`0..cols-1\`). For each, copy \`A\`'s cell
into \`B\`'s transposed slot. There's no arithmetic on the values — transpose only
*moves* them.`,
      },
    ],
    workedExample: `for (int i = 0; i < rows; i++)
    for (int j = 0; j < cols; j++)
        B[j * rows + i] = A[i * cols + j];
//        write side ^ stride=rows   read side ^ stride=cols`,
    whyItMatters: `Transpose is a building block: many algorithms run faster on B^T than
on B because of how memory is laid out. The next big idea on this track —
transpose-for-cache matmul — literally transposes one input first so the inner loop
strides through memory in order. This is that trick's foundation.`,
    commonMistakes: [
      'Using the same stride for both sides. `A` strides by `cols`; `B` strides by `rows`. They are usually different.',
      'Writing `B[i * cols + j]` — that just copies `A` unchanged. The swap is in putting `j` (not `i`) into the row position of `B`.',
      'Assuming the matrix is square. It need not be; keep `rows` and `cols` distinct in your head.',
    ],
    hint: 'Nested loop over `i` (rows of A) and `j` (cols of A). Read `A[i * cols + j]`, write it to `B[j * rows + i]`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    double A[6] = {1, 2, 3,
                   4, 5, 6};   // 2x3
    double B[6];
    transpose(2, 3, A, B);     // B is 3x2
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 2; j++) printf("%g ", B[i * 2 + j]);
        printf("\\n");
    }
    return 0;
}`,
  expectedStdout: `1 4
2 5
3 6
`,
  reference: `void transpose(int rows, int cols, const double* A, double* B) {
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            B[j * rows + i] = A[i * cols + j];
}
`,
};

export default exercise;
