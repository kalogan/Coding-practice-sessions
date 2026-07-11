import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'matrix-trace',
  title: 'Trace of a matrix',
  module: '12 · Matrices',
  order: 1110,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Compute the trace of an n×n matrix: the sum of the elements on its main
diagonal. The matrix \`m\` is a row-major flat array of n*n ints.

    trace = m[0][0] + m[1][1] + ... + m[n-1][n-1]

The diagonal element in row \`i\` is the one whose column is also \`i\`, so in the
flat array it lives at index \`i * n + i\`. Return the sum as an \`int\`.`,
  starter: `int trace(const int* m, int n) {
    // sum m[i][i] for i in 0..n-1  (flat index i*n + i)
    return 0;   // TODO
}
`,
  lesson: {
    intro: `The *trace* of a square matrix is the sum of the numbers running down its main
diagonal — the top-left to bottom-right line. For a 3×3 grid it is
\`m[0][0] + m[1][1] + m[2][2]\`. Nothing off the diagonal is touched.

The only real skill here is spotting the diagonal in a flat, row-major array. The
diagonal is exactly the cells where the row index equals the column index.`,
    sections: [
      {
        heading: 'Row == column is the diagonal',
        body: `A cell sits at row \`i\`, column \`j\`. The main diagonal is every cell where
\`i == j\`: (0,0), (1,1), (2,2), and so on. So instead of a nested loop over all
cells, you only need a *single* loop over \`i\` and read the one cell (i, i) each time.`,
      },
      {
        heading: 'The flat index of a diagonal cell',
        body: `In a row-major n×n matrix, cell (i, j) lives at \`m[i * n + j]\`. Substitute
\`j = i\` and it collapses to \`m[i * n + i]\`. That single expression walks straight
down the diagonal as \`i\` goes from \`0\` to \`n-1\`.`,
      },
    ],
    workedExample: `// sum the diagonal of an n x n matrix
int s = 0;
for (int i = 0; i < n; i++)
    s += m[i * n + i];   // (i, i) -> flat index i*n + i
return s;`,
    whyItMatters: `The trace turns up all over the place: it is invariant under a change of
basis, it equals the sum of a matrix's eigenvalues, and it shows up in physics and
machine-learning cost terms. But the transferable lesson is smaller and sharper —
recognizing a diagonal (\`i == j\`) inside a flat array is a pattern you will reuse
for identity matrices, symmetric checks, and more.`,
    commonMistakes: [
      'Writing a full nested loop over `i` and `j` and adding everything — that sums the whole matrix, not just the diagonal.',
      'Indexing with `m[i * n + j]` but forgetting to set `j = i`; the diagonal needs the column to equal the row.',
      'Using `m[i + i]` instead of `m[i * n + i]` — you must multiply the row by the width `n` first.',
      'Not initializing the accumulator to `0` before the loop.',
    ],
    hint: 'One loop over `i` from 0 to `n-1`. Add `m[i * n + i]` into a running total, then return it.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int a[9] = {1, 2, 3,
                4, 5, 6,
                7, 8, 9};        // 3x3
    printf("%d\\n", trace(a, 3));
    int b[4] = {1, 2, 3, 4};      // 2x2
    printf("%d\\n", trace(b, 2));
    int c[1] = {7};               // 1x1
    printf("%d\\n", trace(c, 1));
    return 0;
}`,
  expectedStdout: `15
5
7
`,
  reference: `int trace(const int* m, int n) {
    int sum = 0;
    for (int i = 0; i < n; i++)
        sum += m[i * n + i];
    return sum;
}
`,
};

export default exercise;
