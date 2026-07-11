import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'mat4-identity',
  title: 'The 4×4 identity matrix',
  module: '19 · 3D & the Camera',
  order: 1900,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Fill a 4×4 identity matrix.

\`m\` points at 16 doubles laid out row-major (row 0 is \`m[0..3]\`, row 1 is
\`m[4..7]\`, and so on). Make it the identity: 1s down the main diagonal, 0s
everywhere else.

    1 0 0 0
    0 1 0 0
    0 0 1 0
    0 0 0 1

Write all 16 entries; return nothing.`,
  starter: `void mat4_identity(double* m) {
    // m is 16 doubles, row-major (m[row*4 + col])
    // Fill with 1s on the diagonal, 0s elsewhere.
}
`,
  lesson: {
    intro: `In 3D graphics almost everything — moving, rotating, scaling, and even the
camera's perspective — is expressed as a \`4×4\` matrix of \`double\`s. You might wonder
why \`4×4\` and not \`3×3\` when space only has three dimensions. The fourth row and
column hold the *homogeneous coordinate*: a clever bookkeeping trick that lets a single
matrix multiply do translation (sliding a point) as well as rotation and scaling. You'll
use that fourth dimension in the very next sessions.

The starting point for all of it is the *identity* matrix — the "do nothing" transform.
It has \`1\`s on the main diagonal (top-left to bottom-right) and \`0\`s everywhere else.
Multiplying a point by the identity leaves the point exactly where it was, just like
multiplying a number by \`1\`.`,
    sections: [
      {
        heading: 'Row-major layout of a 4×4',
        body: `A \`4×4\` matrix has 16 entries but memory is one straight line, so we store
it *row by row*. Element at row \`r\`, column \`c\` lives at index \`r*4 + c\`. So the
diagonal entries are indices \`0\` (r0,c0), \`5\` (r1,c1), \`10\` (r2,c2), and \`15\`
(r3,c3). Set those to \`1\`; set the other twelve to \`0\`.

The cleanest way is a double loop over \`r\` and \`c\`: write \`1\` when \`r == c\` and
\`0\` otherwise.`,
      },
      {
        heading: 'Why the identity matters',
        body: `The identity is the neutral element for matrix multiplication:
\`I · M = M\` and \`M · I = M\` for any matrix \`M\`. That makes it the natural value to
*start* an accumulator from when you compose several transforms, and the safest default
to fill a freshly-declared matrix with before you tweak individual entries. Every
translation, rotation, and scale matrix you'll build next is just the identity with a few
cells changed.`,
      },
    ],
    workedExample: `// Build a 3x3 identity the same way (r*3 + c indexing):
for (int r = 0; r < 3; r++)
    for (int c = 0; c < 3; c++)
        m[r * 3 + c] = (r == c) ? 1.0 : 0.0;   // 1 on the diagonal, else 0
// For a 4x4 you use r*4 + c and loop r,c to 3.`,
    whyItMatters: `Open any graphics or game engine and you'll find \`mat4_identity\` (or
\`glLoadIdentity\`, or \`Matrix4.identity()\`) called constantly — it resets a transform
to "no change" before building it up. Understanding that a matrix is just a flat array
with a diagonal-vs-off-diagonal pattern demystifies the whole 3D pipeline that follows.`,
    commonMistakes: [
      'Only setting the diagonal and forgetting to zero the other twelve entries — a freshly declared array holds garbage, so you must write all 16.',
      'Confusing the index formula: row-major means `m[r*4 + c]`, not `m[c*4 + r]` (that would be column-major).',
      'Writing `1` on the wrong cells — the diagonal is where `r == c` (indices 0, 5, 10, 15).',
      'Using `==` to compare doubles for the *values* — here you compare the loop counters `r` and `c`, which are `int`s, so that is fine.',
    ],
    hint: 'Loop `r` and `c` from 0 to 3. Set `m[r*4 + c] = (r == c) ? 1.0 : 0.0;`.',
  },
  harness: `#include <stdio.h>
static void show4(const double* M) {
    for (int r = 0; r < 4; r++) {
        for (int c = 0; c < 4; c++) printf("%g ", M[r * 4 + c]);
        printf("\\n");
    }
}
int main(void) {
    double m[16];
    mat4_identity(m);
    show4(m);
    return 0;
}`,
  expectedStdout: `1 0 0 0
0 1 0 0
0 0 1 0
0 0 0 1
`,
  reference: `void mat4_identity(double* m) {
    for (int r = 0; r < 4; r++)
        for (int c = 0; c < 4; c++)
            m[r * 4 + c] = (r == c) ? 1.0 : 0.0;
}
`,
};

export default exercise;
