import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'identity-matrix',
  title: 'Build an identity matrix',
  module: '12 · Matrices',
  order: 1120,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Fill an n×n matrix \`m\` (a row-major flat array of doubles) with the identity
matrix: \`1.0\` on the main diagonal, \`0.0\` everywhere else.

    identity(3) ->  1 0 0
                    0 1 0
                    0 0 1

The function returns nothing; it writes the answer into the array \`m\` the caller
supplies. Write to \`m[i * n + j]\` for row \`i\`, column \`j\`.`,
  starter: `void identity(int n, double* m) {
    // set m[i][j] = 1 when i == j, else 0
    // (flat: m[i * n + j])
}
`,
  lesson: {
    intro: `The *identity matrix* is the matrix version of the number 1: multiplying any
matrix by it leaves that matrix unchanged. It has \`1\`s straight down the main
diagonal and \`0\`s everywhere else.

To build it you visit every cell of an n×n grid and decide, for each, whether it is
on the diagonal. It is a clean first exercise in filling a matrix with a nested loop.`,
    sections: [
      {
        heading: 'A nested loop covers every cell',
        body: `Two loops do it: an outer loop \`i\` over the rows (\`0..n-1\`) and an inner
loop \`j\` over the columns (\`0..n-1\`). Together they land on every one of the
\`n*n\` cells exactly once. Inside, you write one value into \`m[i * n + j]\`.`,
      },
      {
        heading: 'The diagonal test: i == j',
        body: `A cell is on the diagonal precisely when its row equals its column, so the
value to store is \`1\` if \`i == j\` and \`0\` otherwise. The ternary
\`m[i * n + j] = (i == j) ? 1.0 : 0.0;\` says exactly that in one line. (An
equivalent style: fill everything with \`0\`, then set the diagonal in a second pass.)`,
      },
    ],
    workedExample: `// fill an n x n grid with the identity
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        m[i * n + j] = (i == j) ? 1.0 : 0.0;
// i == j picks out the diagonal cells`,
    whyItMatters: `The identity is the neutral element of matrix multiplication and the
starting point for building rotation, scaling, and transform matrices in graphics
and robotics. Just as importantly, this exercise cements the two-loop "visit every
cell and write into the flat array" pattern that every later matrix operation reuses.`,
    commonMistakes: [
      'Only setting the diagonal and forgetting to zero the rest, leaving whatever garbage was already in `m`.',
      'Using `=` instead of `==` in the diagonal test — `i = j` assigns and is always true.',
      'Writing `m[i + j]` instead of `m[i * n + j]`; the row must be scaled by the width `n`.',
      'Comparing against the wrong bound (looping while `i <= n`) and running one row past the end.',
    ],
    hint: 'Nested loop over `i` and `j`, both `0..n-1`. Store `(i == j) ? 1.0 : 0.0` into `m[i * n + j]`.',
  },
  harness: `#include <stdio.h>
static void show(int n, const double* m) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) printf("%g ", m[i * n + j]);
        printf("\\n");
    }
}
int main(void) {
    double m[9];
    identity(3, m);
    show(3, m);
    identity(1, m);
    show(1, m);
    identity(2, m);
    show(2, m);
    return 0;
}`,
  expectedStdout: `1 0 0
0 1 0
0 0 1
1
1 0
0 1
`,
  reference: `void identity(int n, double* m) {
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            m[i * n + j] = (i == j) ? 1.0 : 0.0;
}
`,
};

export default exercise;
