import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'rotation-y-4x4',
  title: 'Build a 4×4 rotation about the Y axis',
  module: '19 · 3D & the Camera',
  order: 1930,
  difficulty: 'hard',
  mode: 'function',
  prompt: `Build the 4×4 matrix that rotates a 3D point by \`radians\` about the Y axis.

Using \`c = cos(radians)\` and \`s = sin(radians)\`, the matrix is:

    c  0  s  0
    0  1  0  0
   -s  0  c  0
    0  0  0  1

Store it row-major into \`M\` (16 doubles). \`<math.h>\` is available for
\`cos\` and \`sin\`.`,
  starter: `#include <math.h>
void rotation_y(double radians, double* M) {
    // c = cos(radians), s = sin(radians)
    // row0 = {c,0,s,0}  row1 = {0,1,0,0}  row2 = {-s,0,c,0}  row3 = {0,0,0,1}
}
`,
  lesson: {
    intro: `Rotation about an axis spins points in the *plane perpendicular* to that axis.
For the Y (up) axis, points swing left-and-right in the X–Z plane while their height
\`y\` never changes. That is why the middle row of the matrix is a plain \`0 1 0 0\`: the
Y coordinate passes straight through.

The spinning itself is the classic 2D rotation \`(c = cos θ, s = sin θ)\` applied to the
\`x\` and \`z\` components. It lives in a \`2×2\` sub-block of the big matrix, tucked into
the corners that touch \`x\` and \`z\`: the \`c\`s on the diagonal and the \`+s\` / \`-s\`
pair off it.`,
    sections: [
      {
        heading: 'A 2×2 rotation hiding in the 4×4',
        body: `Pull out just the \`x\` and \`z\` rows and columns and you see the familiar
2D rotation \`[[c, s], [-s, c]]\`. New \`x = c*x + s*z\`, new \`z = -s*x + c*z\`. Placed
into the \`4×4\` at the right cells that becomes: \`M[0]=c, M[2]=s\` (row 0),
\`M[8]=-s, M[10]=c\` (row 2). Row 1 and the 4th row/column are just identity, since Y and
the homogeneous coordinate are untouched.`,
      },
      {
        heading: 'What angle 0 and angle 90° do',
        body: `At \`radians = 0\`, \`cos 0 = 1\` and \`sin 0 = 0\`, so the \`2×2\` block is
\`[[1,0],[0,1]]\` and the whole matrix collapses to the identity — a zero-degree turn
moves nothing. At a quarter turn (\`radians = PI/2\`), \`cos = 0\` and \`sin = 1\`, so a
point at \`(1, 0, 0)\` maps to \`(c*1 + s*0, 0, -s*1 + c*0) = (0, 0, -1)\`: the point on
the +X axis swings onto the −Z axis. That is the "left-right spin" you'd expect looking
down the Y axis.`,
      },
    ],
    workedExample: `#include <math.h>
// Rotation about the Z axis is the same idea in the x-y block:
double c = cos(radians), s = sin(radians);
// row0 = { c, -s, 0, 0 }
// row1 = { s,  c, 0, 0 }
// row2 = { 0,  0, 1, 0 }   // z is the untouched axis here
// row3 = { 0,  0, 0, 1 }
// For rotation about Y you move that 2x2 block into the x-z corners instead.`,
    whyItMatters: `Orbiting a camera around a scene, turning a character, spinning a
model in a viewer — all are axis rotations built exactly like this. Y-axis rotation in
particular is the "look around" / turntable motion you meet first in any 3D app. Seeing
that a rotation is just \`cos\`/\`sin\` in a 2×2 corner of an otherwise-identity matrix
takes the mystery out of it.`,
    commonMistakes: [
      'Getting the sign wrong: the `-s` goes in row 2 (`M[8]`), the `+s` in row 0 (`M[2]`). Swapping them rotates the wrong way.',
      'Putting the sines in the Y row/column — Y is the axis you rotate *around*, so its row and column stay identity (`0 1 0 0`).',
      'Forgetting `#include <math.h>` before calling `cos`/`sin`.',
      'Leaving the other twelve cells as garbage — you must also write the identity 1s and the 0s, including `M[5]=1` and `M[15]=1`.',
    ],
    hint: 'Fill the identity first, then set `M[0]=c; M[2]=s; M[8]=-s; M[10]=c;` where `c=cos(radians)`, `s=sin(radians)`.',
  },
  harness: `#include <stdio.h>
static void show4(const double* M) {
    for (int r = 0; r < 4; r++) {
        for (int c = 0; c < 4; c++) {
            double v = M[r * 4 + c];
            if (v == 0.0) v = 0.0;   /* normalize -0.0 to 0 for clean printing */
            printf("%g ", v);
        }
        printf("\\n");
    }
}
int main(void) {
    /* angle 0 is the identity — deterministic, no float noise */
    double M[16];
    rotation_y(0.0, M);
    show4(M);
    return 0;
}`,
  expectedStdout: `1 0 0 0
0 1 0 0
0 0 1 0
0 0 0 1
`,
  reference: `#include <math.h>
void rotation_y(double radians, double* M) {
    double c = cos(radians), s = sin(radians);
    for (int r = 0; r < 4; r++)
        for (int col = 0; col < 4; col++)
            M[r * 4 + col] = (r == col) ? 1.0 : 0.0;
    M[0]  = c;
    M[2]  = s;
    M[8]  = -s;
    M[10] = c;
}
`,
};

export default exercise;
