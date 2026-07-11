import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'translation-4x4',
  title: 'Build a 4×4 translation matrix',
  module: '19 · 3D & the Camera',
  order: 1920,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Build the 4×4 matrix that *translates* (slides) a 3D point by
\`(tx, ty, tz)\`.

It is the identity with the translation amounts placed in the 4th column:

    1 0 0 tx
    0 1 0 ty
    0 0 1 tz
    0 0 0 1

Store it row-major into \`M\` (16 doubles): \`M[3] = tx\`, \`M[7] = ty\`,
\`M[11] = tz\`, ones on the diagonal, zeros elsewhere.`,
  starter: `void translation4(double tx, double ty, double tz, double* M) {
    // Identity, but with tx, ty, tz in the 4th column (M[3], M[7], M[11]).
}
`,
  lesson: {
    intro: `Translation means moving a point by a fixed offset — no rotation, no scaling,
just a slide. In the previous session you saw that the 4th column of a \`4×4\` matrix adds
a constant to each coordinate. Building a *translation matrix* is just making that
concrete: start from the identity and drop \`tx, ty, tz\` into that 4th column.

When this matrix is applied to a point \`(x, y, z, 1)\`, the output is
\`(x + tx, y + ty, z + tz)\`. The diagonal \`1\`s carry each coordinate through unchanged,
and the 4th column adds the offset because it multiplies the homogeneous \`1\`.`,
    sections: [
      {
        heading: 'Where the offsets go',
        body: `Row-major, the 4th column entries are at indices \`M[3]\` (row 0),
\`M[7]\` (row 1), and \`M[11]\` (row 2). Put \`tx, ty, tz\` there. Everything else is the
plain identity: \`1\`s at \`M[0], M[5], M[10], M[15]\`, and \`0\`s in the remaining cells.
The bottom row stays \`0 0 0 1\` so the homogeneous coordinate is preserved.`,
      },
      {
        heading: 'Why translation needs the 4th dimension',
        body: `Rotation and scaling can be done with a \`3×3\` matrix because every output
is a linear blend of the inputs. Translation cannot — adding a constant is *not* linear
in \`x, y, z\`. The homogeneous trick embeds 3D space as the plane \`w = 1\` inside 4D, and
in that larger space a slide becomes a shear you *can* express as a matrix. That is the
entire reason graphics uses \`4×4\` matrices instead of \`3×3\`.`,
      },
    ],
    workedExample: `// Easiest to fill the identity first, then set three cells:
for (int r = 0; r < 4; r++)
    for (int c = 0; c < 4; c++)
        M[r * 4 + c] = (r == c) ? 1.0 : 0.0;
M[3]  = tx;   // row 0, 4th column
M[7]  = ty;   // row 1, 4th column
M[11] = tz;   // row 2, 4th column`,
    whyItMatters: `Placing an object in a scene ("this tree stands at (30, 0, 12)") is a
translation matrix. Cameras, UI layout in 3D, and every "move it over there" in a game or
CAD tool build one of these. It is the simplest non-trivial transform and the clearest
demonstration of what the homogeneous column buys you.`,
    commonMistakes: [
      'Putting the offsets in the bottom *row* (`M[12], M[13], M[14]`) instead of the 4th *column* (`M[3], M[7], M[11]`) — that is the transpose and translates nothing.',
      'Forgetting to fill the rest of the matrix; you still need the diagonal 1s and the zeros, or leftover garbage corrupts the transform.',
      'Leaving `M[15]` as something other than 1 — the homogeneous corner must stay 1.',
      'Swapping row-major and column-major conventions and scattering tx/ty/tz into the wrong indices.',
    ],
    hint: 'Fill the identity with a double loop, then overwrite `M[3]=tx; M[7]=ty; M[11]=tz;`.',
  },
  harness: `#include <stdio.h>
static void show4(const double* M) {
    for (int r = 0; r < 4; r++) {
        for (int c = 0; c < 4; c++) printf("%g ", M[r * 4 + c]);
        printf("\\n");
    }
}
int main(void) {
    double M[16];
    translation4(10, 20, 30, M);
    show4(M);
    return 0;
}`,
  expectedStdout: `1 0 0 10
0 1 0 20
0 0 1 30
0 0 0 1
`,
  reference: `void translation4(double tx, double ty, double tz, double* M) {
    for (int r = 0; r < 4; r++)
        for (int c = 0; c < 4; c++)
            M[r * 4 + c] = (r == c) ? 1.0 : 0.0;
    M[3]  = tx;
    M[7]  = ty;
    M[11] = tz;
}
`,
};

export default exercise;
