import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'vec-dot',
  title: 'Dot product of two vectors',
  module: '17 · Vectors',
  order: 1720,
  difficulty: 'medium',
  mode: 'function',
  prompt: `The dot product turns two vectors into a single number that measures how
much they point the same way. It's the quiet engine behind lighting, shadows, and
projection.

Define \`typedef struct { double x; double y; double z; } Vec3;\` at the top of your
code, then implement \`vec_dot(a, b)\` returning the \`double\`
\`a.x*b.x + a.y*b.y + a.z*b.z\`.

A hidden harness prints each dot product with \`%g\`.`,
  starter: `typedef struct { double x; double y; double z; } Vec3;

double vec_dot(Vec3 a, Vec3 b) {
    // return a.x*b.x + a.y*b.y + a.z*b.z
    return 0;
}
`,
  lesson: {
    intro: `The dot product takes two vectors and gives back a single number (a
scalar). You multiply matching components and add the three products:
\`a·b = a.x*b.x + a.y*b.y + a.z*b.z\`.

That one number is packed with meaning. When two vectors point the same way it's
large and positive; when they point opposite ways it's negative; and when they're
*perpendicular* it's exactly \`0\`. So the dot product is a compact "how aligned are
these?" detector.`,
    sections: [
      {
        heading: 'Perpendicular means zero',
        body: `Try \`(1,0,0)·(0,1,0)\`: the products are \`1*0 + 0*1 + 0*0 = 0\`. Those
two vectors point along different axes — they're at a right angle — and the dot
product reports \`0\`. This zero test is used constantly to check whether two
directions are perpendicular.

More generally \`a·b = |a| |b| cos(θ)\`, where \`θ\` is the angle between them. At 90°,
\`cos(θ) = 0\`, which is why perpendicular vectors give zero.`,
      },
      {
        heading: 'Accumulate then return',
        body: `Unlike \`vec_add\`, the result here is a plain \`double\`, not a \`Vec3\`.
You can write it in one line — \`return a.x*b.x + a.y*b.y + a.z*b.z;\` — or accumulate
into a local \`double s = 0;\` and add each product, then \`return s;\`.

Watch the pairing: it's always \`x\` with \`x\`, \`y\` with \`y\`, \`z\` with \`z\`. Crossing
the wires (like \`a.x*b.y\`) gives a different, wrong quantity.`,
      },
    ],
    workedExample: `typedef struct { double x; double y; double z; } Vec3;

// dot product accumulated in a local
double vec_dot2(Vec3 a, Vec3 b) {
    double s = 0;
    s += a.x * b.x;
    s += a.y * b.y;
    s += a.z * b.z;
    return s;
}
// vec_dot2( (Vec3){2,2,2}, (Vec3){1,1,1} )  ->  6`,
    whyItMatters: `The dot product is the heart of shading: how bright a surface looks
is (roughly) the dot of its normal with the direction to the light — face the light,
big value, bright; turn away, zero or negative, dark. It also powers projection,
back-face culling, and measuring angles. Master it and half of 3D math opens up.`,
    commonMistakes: [
      'Returning a `Vec3` — the dot product is a single `double`, not a vector.',
      'Pairing components wrong, e.g. `a.x*b.y`; keep it `x*x + y*y + z*z`.',
      'Adding the components instead of multiplying the pairs first.',
      'Forgetting the third term (`a.z*b.z`) — all three products must be summed.',
    ],
    hint: 'One line does it: `return a.x*b.x + a.y*b.y + a.z*b.z;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%g\\n", vec_dot((Vec3){1, 2, 3}, (Vec3){4, 5, 6}));
    printf("%g\\n", vec_dot((Vec3){1, 0, 0}, (Vec3){0, 1, 0}));
    printf("%g\\n", vec_dot((Vec3){2, 2, 2}, (Vec3){1, 1, 1}));
    return 0;
}`,
  expectedStdout: `32
0
6
`,
  reference: `typedef struct { double x; double y; double z; } Vec3;

double vec_dot(Vec3 a, Vec3 b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}
`,
};

export default exercise;
