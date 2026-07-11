import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'transform-point-2d',
  title: 'Apply a 3×3 matrix to a point',
  module: '18 · 2D Transform Matrices',
  order: 1810,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Apply a 3×3 transform matrix \`M\` to the 2D point \`(px, py)\`.

The point is treated as the homogeneous vector \`(px, py, 1)\`. Multiplying \`M\` by that
vector gives:

    *ox = M[0]*px + M[1]*py + M[2]*1
    *oy = M[3]*px + M[4]*py + M[5]*1

(the third output row would be \`w\`, which stays \`1\` here, so we ignore it). \`M\` is a
row-major \`double[9]\`. Write the two results through the output pointers \`ox\` and
\`oy\`.`,
  starter: `void transform_point(const double* M, double px, double py, double* ox, double* oy) {
    // treat the point as (px, py, 1) and multiply M by it
    // *ox = M[0]*px + M[1]*py + M[2];
    // *oy = M[3]*px + M[4]*py + M[5];
    *ox = 0;
    *oy = 0;
}
`,
  lesson: {
    intro: `This is *the* core operation of 2D graphics: taking a matrix and a point, and
producing the transformed point. Every time something moves, rotates, or scales on
screen, this multiply is running underneath.

We represent the point \`(x, y)\` as three numbers \`(x, y, 1)\` — the trailing \`1\` is
the homogeneous coordinate. To transform it, take each output row of \`M\`, pair it up
with \`(x, y, 1)\`, multiply element-by-element, and sum. That's just a matrix-times-vector
product — the same dot-product-per-row idea from the matrix track, applied to a length-3
vector.`,
    sections: [
      {
        heading: 'Why the extra 1 matters',
        body: `A plain \`2 × 2\` matrix can stretch and rotate, but it can only ever send the
origin to the origin — it cannot *slide* a point. The fix is the homogeneous \`1\`.
Because \`*ox = M[0]*px + M[1]*py + M[2]*1\`, the entry \`M[2]\` gets added in *regardless*
of where the point is. That constant add is a translation. The third column of a \`3 × 3\`
matrix is exactly where "move by this much" lives.`,
      },
      {
        heading: 'Only two rows to compute',
        body: `The full product has three output components \`(x', y', w')\`, but for these
transforms \`w'\` always comes out as \`1\`, so we skip it and just compute \`x'\` and
\`y'\`. Row 0 of \`M\` is \`{M[0], M[1], M[2]}\` and produces \`*ox\`; row 1 is
\`{M[3], M[4], M[5]}\` and produces \`*oy\`. The point's third component is the literal
\`1\`, so \`M[2]\` and \`M[5]\` are added straight in.`,
      },
    ],
    workedExample: `// Matrix-times-vector on a length-3 vector v = (px, py, 1):
// out[i] = M[i*3+0]*v0 + M[i*3+1]*v1 + M[i*3+2]*v2
double px = 2, py = 3;
double x2 = M[0]*px + M[1]*py + M[2];   // row 0 dotted with (px, py, 1)
double y2 = M[3]*px + M[4]*py + M[5];   // row 1 dotted with (px, py, 1)`,
    whyItMatters: `Rendering a shape is this operation run over every vertex: you build one
transform matrix, then push each point through it. GPUs do millions of these per frame.
Understanding that a point is \`(x, y, 1)\` and a transform is a matrix multiply is the
mental model behind every 2D and 3D graphics API — OpenGL, Canvas, SVG, game engines all
work this way.`,
    commonMistakes: [
      'Forgetting the `+ M[2]` / `+ M[5]` term — that is the homogeneous `*1`, and dropping it silently breaks translation.',
      'Indexing row 1 as `M[1]..M[3]` instead of `M[3], M[4], M[5]`. Row `i` starts at `M[i*3]`.',
      'Writing to `ox`/`oy` as if they were values (`ox = ...`) instead of dereferencing the pointers (`*ox = ...`).',
      'Reading `px`/`py` into the wrong output — row 0 makes `*ox`, row 1 makes `*oy`.',
    ],
    hint: '`*ox = M[0]*px + M[1]*py + M[2];` and `*oy = M[3]*px + M[4]*py + M[5];`. The `1` in `(px, py, 1)` means M[2] and M[5] are added directly.',
  },
  harness: `#include <stdio.h>
int main(void) {
    /* case 1: identity leaves the point unchanged */
    double I[9] = {1,0,0, 0,1,0, 0,0,1};
    double ox, oy;
    transform_point(I, 2, 3, &ox, &oy);
    printf("%g %g\\n", ox, oy);
    /* case 2: double x, triple y */
    double S[9] = {2,0,0, 0,3,0, 0,0,1};
    transform_point(S, 2, 3, &ox, &oy);
    printf("%g %g\\n", ox, oy);
    /* case 3: translation by (5, 7) */
    double T[9] = {1,0,5, 0,1,7, 0,0,1};
    transform_point(T, 2, 3, &ox, &oy);
    printf("%g %g\\n", ox, oy);
    return 0;
}`,
  expectedStdout: `2 3
4 9
7 10
`,
  reference: `void transform_point(const double* M, double px, double py, double* ox, double* oy) {
    *ox = M[0] * px + M[1] * py + M[2];
    *oy = M[3] * px + M[4] * py + M[5];
}
`,
};

export default exercise;
