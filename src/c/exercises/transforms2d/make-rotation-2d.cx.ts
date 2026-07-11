import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'make-rotation-2d',
  title: 'Build a rotation matrix',
  module: '18 · 2D Transform Matrices',
  order: 1840,
  difficulty: 'hard',
  mode: 'function',
  prompt: `Build the 3×3 matrix that rotates a 2D point by \`radians\` about the origin.

Using \`c = cos(radians)\` and \`s = sin(radians)\`, the rotation matrix is:

    c  -s  0
    s   c  0
    0   0  1

Write those 9 values into \`M\` (row-major \`double[9]\`). \`<math.h>\` is available, so use
\`cos(radians)\` and \`sin(radians)\`. Note \`rotation(0)\` is exactly the identity.`,
  starter: `#include <math.h>
void rotation(double radians, double* M) {
    // c = cos(radians), s = sin(radians)
    // fill M (row-major):
    //   c -s 0
    //   s  c 0
    //   0  0 1
}
`,
  lesson: {
    intro: `Rotation is the trickiest of the three primitive transforms, because it mixes
\`x\` and \`y\` together. Spinning a point by an angle uses trigonometry: the new \`x\` is
\`x*cos - y*sin\`, and the new \`y\` is \`x*sin + y*cos\`. Packaged as a matrix, those
coefficients form the familiar rotation block.

Compute \`c = cos(radians)\` and \`s = sin(radians)\` once, then lay them out:
\`{c, -s, 0, s, c, 0, 0, 0, 1}\`. The top-left \`2 × 2\` corner does the actual spinning;
the third row and column stay identity so the homogeneous coordinate is untouched.`,
    sections: [
      {
        heading: 'Where the minus sign goes',
        body: `The layout is \`c\` and \`-s\` on the first row, \`s\` and \`c\` on the
second: \`M[0] = c\`, \`M[1] = -s\`, \`M[3] = s\`, \`M[4] = c\`. That specific arrangement
of one negated sine is what makes it a *rotation* (a rigid spin) rather than a shear or a
flip. Get the sign or the placement wrong and shapes will distort instead of turning.
Compute \`s\` and \`c\` into locals first so you don't call \`sin\`/\`cos\` four times.`,
      },
      {
        heading: 'rotation(0) is the identity',
        body: `At \`radians = 0\`, \`cos(0) = 1\` and \`sin(0) = 0\`, so the matrix collapses
to \`{1, 0, 0, 0, 1, 0, 0, 0, 1}\` — the identity, exactly as a "rotate by nothing"
should. That's the clean, exactly-representable case we verify against. For other angles
the entries are irrational (e.g. a quarter turn, \`PI/2\`, maps the point \`(1, 0)\` to
\`(0, 1)\`), and \`cos\`/\`sin\` return floating-point approximations — correct, but not
tidy round numbers. If you need \`PI\`, define it yourself:
\`#define PI 3.14159265358979323846\` rather than relying on \`M_PI\`.`,
      },
    ],
    workedExample: `#include <math.h>
// Compute the trig once, then place the four corner entries:
double c = cos(radians);
double s = sin(radians);
M[0] = c; M[1] = -s;   // row 0:  x' = c*x - s*y
M[3] = s; M[4] =  c;   // row 1:  y' = s*x + c*y
// the rest (M[2], M[5], M[6], M[7]) are 0 and M[8] = 1`,
    whyItMatters: `Rotation matrices turn the world: spinning sprites, orbiting cameras,
character animation, and the "rotate about a pivot" gizmo in every design tool are all
this matrix, often composed with translations to move the pivot. The same \`cos\`/\`sin\`
block generalizes to 3D rotations, so nailing the 2D version builds the intuition for the
harder cases.`,
    commonMistakes: [
      'Putting the minus sign on the wrong sine — it is `M[1] = -s` (row 0), with `M[3] = +s` (row 1). Swapping them rotates the opposite way.',
      'Calling `sin`/`cos` repeatedly instead of storing `s` and `c` in locals — wasteful and easy to mistype.',
      'Passing degrees to `sin`/`cos`, which expect radians. Convert with `radians = degrees * PI / 180` if needed.',
      'Relying on `M_PI` for pi — it is not guaranteed by the standard here; define `PI` yourself.',
    ],
    hint: 'Store `double c = cos(radians), s = sin(radians);`. Then M = `{c, -s, 0, s, c, 0, 0, 0, 1}` in row-major order.',
  },
  harness: `#include <stdio.h>
static void show3(const double* M) {
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) printf("%g ", M[i * 3 + j] + 0.0);
        printf("\\n");
    }
}
int main(void) {
    double M[9];
    /* rotation by 0 radians is exactly the identity */
    rotation(0.0, M);
    show3(M);
    return 0;
}`,
  expectedStdout: `1 0 0
0 1 0
0 0 1
`,
  reference: `#include <math.h>
void rotation(double radians, double* M) {
    double c = cos(radians);
    double s = sin(radians);
    M[0] = c; M[1] = -s; M[2] = 0;
    M[3] = s; M[4] =  c; M[5] = 0;
    M[6] = 0; M[7] =  0; M[8] = 1;
}
`,
};

export default exercise;
