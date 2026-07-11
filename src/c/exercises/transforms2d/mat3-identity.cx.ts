import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'mat3-identity',
  title: 'The 3×3 identity matrix',
  module: '18 · 2D Transform Matrices',
  order: 1800,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Fill a 3×3 identity matrix.

\`m\` points at 9 \`double\`s laid out row-major (row 0 first, then row 1, then row 2).
The identity has \`1\` on the main diagonal and \`0\` everywhere else:

    1 0 0
    0 1 0
    0 0 1

Write those 9 values into \`m\`. Return nothing.`,
  starter: `void mat3_identity(double* m) {
    // fill m[0..8] with the 3x3 identity (row-major)
    // 1 on the diagonal (m[0], m[4], m[8]); 0 elsewhere
}
`,
  lesson: {
    intro: `Every 2D transform in this module is a \`3 × 3\` matrix. Before we build the
interesting ones (translate, scale, rotate) we need the boring-but-essential starting
point: the *identity* matrix. Multiplying by it changes nothing — it's the matrix
equivalent of multiplying a number by \`1\`.

Why \`3 × 3\` and not \`2 × 2\` for a 2D problem? Because we store each point as
\`(x, y, 1)\` — three numbers. That extra \`1\` (the "homogeneous coordinate") is what
lets a single matrix also *slide* a point, not just stretch or spin it. You'll see
exactly why in the next few lessons; for now, get comfortable that 2D graphics lives in
\`3 × 3\` matrices.`,
    sections: [
      {
        heading: 'Row-major means one flat array of 9',
        body: `A \`3 × 3\` matrix is stored as a flat \`double[9]\`. Element in row \`i\`,
column \`j\` lives at index \`i * 3 + j\`. So the diagonal cells are \`m[0]\` (row 0, col
0), \`m[4]\` (row 1, col 1), and \`m[8]\` (row 2, col 2). Those three get \`1\`; the other
six get \`0\`.`,
      },
      {
        heading: 'Two ways to fill it',
        body: `The blunt way is nine assignments: \`m[0] = 1; m[1] = 0; ...\`. The tidy way
is a double loop over \`i\` and \`j\` that writes \`m[i * 3 + j] = (i == j) ? 1.0 : 0.0;\`
— \`1\` when the row equals the column (on the diagonal), \`0\` otherwise. Either is fine;
the loop version generalizes to any \`n × n\` identity.`,
      },
    ],
    workedExample: `// A 2x2 identity, for contrast (2D graphics uses 3x3, but the idea is the same)
void mat2_identity(double* m) {
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++)
            m[i * 2 + j] = (i == j) ? 1.0 : 0.0;  // 1 on diagonal, else 0
}`,
    whyItMatters: `The identity is the "do nothing" transform, and it shows up constantly:
it's the starting value when you *accumulate* transforms (start at identity, then
multiply in each translate/rotate/scale), and it's the sanity check that your matrix
code works — anything times the identity must come back unchanged. Graphics libraries,
game engines, and 3D math all begin here.`,
    commonMistakes: [
      'Forgetting to zero the off-diagonal cells. `m` may hold garbage; every one of the 9 slots must be written.',
      'Putting `1` in the wrong spots — the diagonal is `m[0]`, `m[4]`, `m[8]`, not `m[0]`, `m[1]`, `m[2]`.',
      'Writing a `2 × 2` matrix out of habit. 2D transforms here are `3 × 3` because of the homogeneous coordinate.',
      'Using `(i = j)` (assignment) instead of `(i == j)` (comparison) in the loop condition.',
    ],
    hint: 'Loop `i` and `j` from 0 to 2 and set `m[i*3+j] = (i == j) ? 1.0 : 0.0;`. Or just write the nine values by hand.',
  },
  harness: `#include <stdio.h>
static void show3(const double* M) {
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) printf("%g ", M[i * 3 + j]);
        printf("\\n");
    }
}
int main(void) {
    double M[9];
    mat3_identity(M);
    show3(M);
    return 0;
}`,
  expectedStdout: `1 0 0
0 1 0
0 0 1
`,
  reference: `void mat3_identity(double* m) {
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++)
            m[i * 3 + j] = (i == j) ? 1.0 : 0.0;
}
`,
};

export default exercise;
