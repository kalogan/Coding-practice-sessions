import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'transform-point-3d',
  title: 'Transform a 3D point by a 4×4 matrix',
  module: '19 · 3D & the Camera',
  order: 1910,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Apply a 4×4 matrix \`M\` (row-major, 16 doubles) to the 3D point
\`(x, y, z)\` and write the transformed coordinates to \`*ox, *oy, *oz\`.

A 3D point is fed through the matrix as the homogeneous vector \`(x, y, z, 1)\`.
The transformed components are the first three rows of \`M\` dotted with that vector:

    *ox = M[0]*x + M[1]*y + M[2]*z + M[3]
    *oy = M[4]*x + M[5]*y + M[6]*z + M[7]
    *oz = M[8]*x + M[9]*y + M[10]*z + M[11]

Notice the last term in each line multiplies by the implicit \`1\` — that is the
4th column doing translation.`,
  starter: `void transform_point3d(const double* M, double x, double y, double z,
                       double* ox, double* oy, double* oz) {
    // Treat the point as (x, y, z, 1) and multiply by the 4x4 M.
    *ox = 0; *oy = 0; *oz = 0;   // TODO
}
`,
  lesson: {
    intro: `You already know matrix-times-vector: each output component is a *row* of the
matrix dotted with the input vector. Transforming a 3D point is exactly that, with one
twist — the point is written as a *homogeneous* 4-vector \`(x, y, z, 1)\`. That trailing
\`1\` is what lets a matrix add a constant offset (translation), not just scale and rotate.

We only need the first three output components (the \`x, y, z\` of the moved point), so we
dot the first three rows of \`M\` with \`(x, y, z, 1)\`. The 4th entry of each row —
\`M[3]\`, \`M[7]\`, \`M[11]\` — gets multiplied by that \`1\`, so it is simply *added*.`,
    sections: [
      {
        heading: 'Each output row is a dot product with (x, y, z, 1)',
        body: `Row 0 of \`M\` is \`M[0], M[1], M[2], M[3]\`. Dotted with \`(x, y, z, 1)\`
that is \`M[0]*x + M[1]*y + M[2]*z + M[3]*1\`, and \`M[3]*1\` is just \`M[3]\`. Rows 1 and
2 work the same way using indices \`4..7\` and \`8..11\`. You never touch row 3
(\`M[12..15]\`) here — that row produces the homogeneous \`w\`, which for these affine
transforms stays \`1\` and we ignore it.`,
      },
      {
        heading: 'Why the 4th column is translation',
        body: `If \`M\` is the identity with \`M[3]=10\`, then \`*ox = 1*x + 0*y + 0*z +
10 = x + 10\`. The point slid \`+10\` along x, purely because of that constant in the 4th
column. A \`3×3\` matrix *cannot* do this — every output would be a pure linear
combination of \`x, y, z\` with no way to add a constant. The homogeneous \`1\` is the
trick that folds translation into the same multiply as rotation and scale.`,
      },
    ],
    workedExample: `// The 2D version made the same point: pad with a 1, dot each row.
// 3x3 matrix M applied to (x, y, 1):
double nx = M[0]*x + M[1]*y + M[2];   // M[2] is the +constant (translation in x)
double ny = M[3]*x + M[4]*y + M[5];   // M[5] translates in y
// In 3D you have three such lines and a 4-wide row, so the +constant is M[3]/M[7]/M[11].`,
    whyItMatters: `This one function is how every vertex of every 3D model reaches the
screen: the engine builds one combined matrix (model × view × projection) and runs this
multiply on thousands or millions of points. Getting the homogeneous \`1\` and the 4th
column right is the difference between objects that translate correctly and objects stuck
at the origin.`,
    commonMistakes: [
      'Forgetting the `+ M[3]` (and `+ M[7]`, `+ M[11]`) term — that drops all translation and pins the point as if only rotation/scale applied.',
      'Writing through the pointers wrong: you must assign `*ox = ...`, not `ox = ...`, which would overwrite the pointer itself.',
      'Using the wrong row indices — row 1 is `M[4..7]`, row 2 is `M[8..11]`, easy to slip by one.',
      'Trying to also compute a `w` from row 3 and divide by it here — that perspective divide is a later step; for affine transforms `w` stays 1.',
    ],
    hint: 'Three assignments. Each is `M[r*4+0]*x + M[r*4+1]*y + M[r*4+2]*z + M[r*4+3]` for r = 0, 1, 2, written into `*ox`, `*oy`, `*oz`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    /* case 1: identity leaves the point unchanged */
    double I[16] = {1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1};
    double ox, oy, oz;
    transform_point3d(I, 1, 2, 3, &ox, &oy, &oz);
    printf("%g %g %g\\n", ox, oy, oz);
    /* case 2: translation by (10, 20, 30) */
    double T[16] = {1,0,0,10, 0,1,0,20, 0,0,1,30, 0,0,0,1};
    transform_point3d(T, 1, 2, 3, &ox, &oy, &oz);
    printf("%g %g %g\\n", ox, oy, oz);
    return 0;
}`,
  expectedStdout: `1 2 3
11 22 33
`,
  reference: `void transform_point3d(const double* M, double x, double y, double z,
                       double* ox, double* oy, double* oz) {
    *ox = M[0]*x + M[1]*y + M[2]*z  + M[3];
    *oy = M[4]*x + M[5]*y + M[6]*z  + M[7];
    *oz = M[8]*x + M[9]*y + M[10]*z + M[11];
}
`,
};

export default exercise;
