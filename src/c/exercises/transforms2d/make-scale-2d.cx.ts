import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'make-scale-2d',
  title: 'Build a scaling matrix',
  module: '18 · 2D Transform Matrices',
  order: 1830,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Build the 3×3 matrix that scales a 2D point by \`sx\` along x and \`sy\` along y.

The scaling matrix is:

    sx 0  0
    0  sy 0
    0  0  1

Write those 9 values into \`M\` (row-major \`double[9]\`). Applied to \`(x, y, 1)\`, it
produces \`(sx*x, sy*y, 1)\`.`,
  starter: `void scaling(double sx, double sy, double* M) {
    // fill M with the 3x3 scaling matrix (row-major):
    //   sx 0  0
    //   0  sy 0
    //   0  0  1
}
`,
  lesson: {
    intro: `Scaling stretches or shrinks a shape along the axes: multiply every \`x\` by
\`sx\` and every \`y\` by \`sy\`. As a matrix, that means the scale factors sit on the
*diagonal* — \`sx\` at \`M[0]\`, \`sy\` at \`M[4]\` — and everything else is the identity.

When you multiply this matrix by \`(x, y, 1)\`, row 0 gives \`sx*x\` and row 1 gives
\`sy*y\`. The homogeneous \`1\` is left alone by the bottom-right \`1\`, so the point stays
a proper 2D point.`,
    sections: [
      {
        heading: 'The diagonal holds the scale factors',
        body: `A diagonal matrix multiplies each coordinate independently: the entry at
\`M[i*3 + i]\` scales the \`i\`-th component. So \`M[0]\` scales \`x\`, \`M[4]\` scales
\`y\`, and \`M[8]\` scales the homogeneous coordinate — which we keep at \`1\` so the point
isn't distorted. Equal factors (\`sx == sy\`) scale uniformly; unequal factors squash or
stretch the shape.`,
      },
      {
        heading: 'Special cases worth knowing',
        body: `\`scaling(1, 1, M)\` is the identity — scaling by \`1\` changes nothing. A
factor of \`2\` doubles size; \`0.5\` halves it; a negative factor *mirrors* across an axis
(e.g. \`sx = -1\` flips left-to-right). Because it's just the identity with two diagonal
entries swapped in, this matrix is a close cousin of the translation matrix — the only
difference is *where* the parameters go (diagonal vs. third column).`,
      },
    ],
    workedExample: `// Identity, but with the scale factors on the diagonal:
M[0] = sx; M[1] = 0;  M[2] = 0;    // row 0:  x' = sx * x
M[3] = 0;  M[4] = sy; M[5] = 0;    // row 1:  y' = sy * y
M[6] = 0;  M[7] = 0;  M[8] = 1;    // row 2:  homogeneous row, unchanged`,
    whyItMatters: `Zooming a camera, resizing a sprite, converting between coordinate
systems (pixels to normalized device coordinates), and flipping images all come down to a
scaling matrix. Combined with translation and rotation by matrix multiplication, scaling
is one of the three primitive building blocks every 2D and 3D transform is assembled
from.`,
    commonMistakes: [
      'Putting `sx`/`sy` off the diagonal. They belong at `M[0]` and `M[4]`, not in the third column (that would be translation).',
      'Setting `M[8]` to `sx` or `sy` instead of `1`. The homogeneous slot must stay `1` or the point gets distorted.',
      'Leaving the zero cells uninitialized — all 9 entries must be written.',
      'Swapping the roles of `sx` and `sy` — `sx` scales x (row 0), `sy` scales y (row 1).',
    ],
    hint: 'It is the identity with two changes: `M[0] = sx` and `M[4] = sy`. Keep `M[8] = 1` and all other cells 0.',
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
    /* case 1: stretch x by 2, y by 3 */
    scaling(2, 3, M);
    show3(M);
    /* case 2: scale by 1 -> identity */
    scaling(1, 1, M);
    show3(M);
    return 0;
}`,
  expectedStdout: `2 0 0
0 3 0
0 0 1
1 0 0
0 1 0
0 0 1
`,
  reference: `void scaling(double sx, double sy, double* M) {
    M[0] = sx; M[1] = 0;  M[2] = 0;
    M[3] = 0;  M[4] = sy; M[5] = 0;
    M[6] = 0;  M[7] = 0;  M[8] = 1;
}
`,
};

export default exercise;
