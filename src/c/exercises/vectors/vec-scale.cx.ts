import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'vec-scale',
  title: 'Scale a 3D vector',
  module: '17 · Vectors',
  order: 1710,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Scaling a vector stretches or shrinks it while keeping (or flipping) its
direction. Multiply every component by the same number.

Define \`typedef struct { double x; double y; double z; } Vec3;\` at the top of your
code, then implement \`vec_scale(v, s)\` so it returns a new \`Vec3\` equal to
\`{v.x * s, v.y * s, v.z * s}\`.

A hidden harness scales a few vectors and prints each result as \`x y z\`.`,
  starter: `typedef struct { double x; double y; double z; } Vec3;

Vec3 vec_scale(Vec3 v, double s) {
    // return a NEW Vec3: { v.x * s, v.y * s, v.z * s }
    Vec3 result = {0, 0, 0};
    return result;
}
`,
  lesson: {
    intro: `Scaling a vector means multiplying it by a single number — a *scalar*.
Every component gets multiplied by the same value \`s\`, so \`(x, y, z)\` becomes
\`(x·s, y·s, z·s)\`.

Geometrically the arrow keeps pointing the same way but changes length: \`s = 2\`
makes it twice as long, \`s = 0.5\` makes it half as long, and a *negative* \`s\` flips
it to point the opposite direction. \`s = 0\` collapses it to the zero vector.`,
    sections: [
      {
        heading: 'Direction stays, length changes',
        body: `Because every component is scaled by the *same* factor, the ratios
between \`x\`, \`y\`, and \`z\` don't change — that's why the direction is preserved. A
vector twice as long still points exactly where it did.

A negative factor is the one twist: it multiplies each component by a negative
number, which reverses the arrow. Scaling \`(1, 2, 3)\` by \`-1\` gives \`(-1, -2, -3)\`,
the same line but the other way.`,
      },
      {
        heading: 'One scalar, three multiplies',
        body: `The scalar \`s\` is a \`double\`, so fractional factors like \`0.5\` work
naturally. Apply it to each field: \`Vec3 r = {v.x * s, v.y * s, v.z * s};\`.

Note the multiply is componentwise, not a single \`v * s\` — C has no built-in
multiply for a struct times a number, so you write the three products yourself.`,
      },
    ],
    workedExample: `typedef struct { double x; double y; double z; } Vec3;

// double a vector's length -> a NEW vector
Vec3 vec_double(Vec3 v) {
    Vec3 out = {v.x * 2, v.y * 2, v.z * 2};
    return out;
}
// vec_double( (Vec3){1, -2, 3} )  ->  {2, -4, 6}`,
    whyItMatters: `Scaling is how you turn a raw direction into a controlled step:
multiply a unit direction by a speed to get velocity, or by a distance to reach a
target. Negative scaling reverses forces and reflections. It pairs with addition
constantly — "position + velocity·dt" is scale-then-add.`,
    commonMistakes: [
      'Scaling only one component and leaving the others unchanged.',
      'Adding `s` instead of multiplying by it.',
      'Declaring `s` as `int`, which would truncate a factor like `0.5` to `0`.',
      'Forgetting that a negative `s` legitimately flips the sign of every component.',
    ],
    hint: 'Multiply each field by `s` and return: `Vec3 r = {v.x * s, v.y * s, v.z * s}; return r;`.',
  },
  harness: `#include <stdio.h>
static void showv(Vec3 v) { printf("%g %g %g\\n", v.x, v.y, v.z); }
int main(void) {
    showv(vec_scale((Vec3){1, 2, 3}, 2));
    showv(vec_scale((Vec3){4, -2, 6}, 0.5));
    showv(vec_scale((Vec3){1, 1, 1}, 0));
    return 0;
}`,
  expectedStdout: `2 4 6
2 -1 3
0 0 0
`,
  reference: `typedef struct { double x; double y; double z; } Vec3;

Vec3 vec_scale(Vec3 v, double s) {
    Vec3 result = {v.x * s, v.y * s, v.z * s};
    return result;
}
`,
};

export default exercise;
