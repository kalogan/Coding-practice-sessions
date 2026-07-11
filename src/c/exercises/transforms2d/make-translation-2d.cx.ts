import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'make-translation-2d',
  title: 'Build a translation matrix',
  module: '18 · 2D Transform Matrices',
  order: 1820,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Build the 3×3 matrix that translates (slides) a 2D point by \`(tx, ty)\`.

The translation matrix is:

    1 0 tx
    0 1 ty
    0 0 1

Write those 9 values into \`M\` (row-major \`double[9]\`). Return nothing. Applied to a
point \`(x, y, 1)\`, this matrix produces \`(x + tx, y + ty, 1)\`.`,
  starter: `void translation(double tx, double ty, double* M) {
    // fill M with the 3x3 translation matrix (row-major):
    //   1 0 tx
    //   0 1 ty
    //   0 0 1
}
`,
  lesson: {
    intro: `To *slide* a point — move it \`tx\` to the right and \`ty\` up — you add
constants: \`(x + tx, y + ty)\`. The magic of homogeneous coordinates is that this
addition can be packaged as a *matrix multiply*, so translation composes with rotation
and scaling using the same machinery.

A translation matrix is the identity with the shift amounts tucked into the third column:
\`tx\` at position \`M[2]\`, \`ty\` at position \`M[5]\`. When you multiply this by
\`(x, y, 1)\`, the trailing \`1\` pulls those constants in, giving \`x + tx\` and
\`y + ty\`.`,
    sections: [
      {
        heading: 'This is WHY 2D graphics uses 3×3',
        body: `A \`2 × 2\` matrix times \`(x, y)\` produces only sums of \`x\` and \`y\`
scaled by constants — there is no way to add a *fixed* amount, so the origin is stuck at
the origin. You cannot translate with a \`2 × 2\` matrix. Adding the homogeneous \`1\` and
a third row/column gives you a slot (\`M[2]\`, \`M[5]\`) whose value is added
unconditionally. That single extra dimension is the whole reason graphics pipelines carry
that trailing \`1\` around.`,
      },
      {
        heading: 'Start from identity, drop in tx and ty',
        body: `The easiest mental recipe: write the identity, then set \`M[2] = tx\` and
\`M[5] = ty\`. The diagonal stays \`1, 1, 1\`; the bottom row stays \`0 0 1\`. Note
\`translation(0, 0)\` gives back the plain identity — sliding by nothing is doing nothing,
exactly as it should be.`,
      },
    ],
    workedExample: `// Identity first, then place the shift in the third column:
M[0] = 1; M[1] = 0; M[2] = tx;   // row 0:  x' = x + tx
M[3] = 0; M[4] = 1; M[5] = ty;   // row 1:  y' = y + ty
M[6] = 0; M[7] = 0; M[8] = 1;    // row 2:  the homogeneous row, unchanged`,
    whyItMatters: `Positioning anything on screen — a sprite, a UI panel, a camera — is a
translation. Because it's a matrix, you can multiply it onto a rotation or scale and get
"rotate about a pivot" or "scale around a point" by composing simple pieces. Every
scene-graph transform in a game or design tool is built from translation matrices like
this one.`,
    commonMistakes: [
      'Putting `tx`/`ty` in the bottom row (`M[6]`, `M[7]`) instead of the third column (`M[2]`, `M[5]`). Row-major, the third column is index 2 of each row.',
      'Leaving the off-diagonal or bottom-row cells as garbage — all 9 entries must be set, including the six that are 0 or 1.',
      'Swapping `tx` and `ty`. `tx` (the x-shift) goes in row 0 at `M[2]`; `ty` goes in row 1 at `M[5]`.',
      'Forgetting the bottom-right `M[8] = 1`; a `0` there would break composition with other transforms.',
    ],
    hint: 'It is the identity plus two entries: set `M[2] = tx` and `M[5] = ty`. Everything else is the identity (1s on the diagonal, 0s elsewhere).',
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
    /* case 1: a real translation */
    translation(5, 7, M);
    show3(M);
    /* case 2: translate by nothing -> identity */
    translation(0, 0, M);
    show3(M);
    return 0;
}`,
  expectedStdout: `1 0 5
0 1 7
0 0 1
1 0 0
0 1 0
0 0 1
`,
  reference: `void translation(double tx, double ty, double* M) {
    M[0] = 1; M[1] = 0; M[2] = tx;
    M[3] = 0; M[4] = 1; M[5] = ty;
    M[6] = 0; M[7] = 0; M[8] = 1;
}
`,
};

export default exercise;
