import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'vec-cross',
  title: 'Cross product of two vectors',
  module: '17 · Vectors',
  order: 1750,
  difficulty: 'hard',
  mode: 'function',
  prompt: `The cross product takes two vectors and produces a third one that is
*perpendicular to both* — the key to building surface normals.

Define \`typedef struct { double x; double y; double z; } Vec3;\` at the top of your
code, then implement \`vec_cross(a, b)\` returning the \`Vec3\`:

  x = a.y*b.z - a.z*b.y
  y = a.z*b.x - a.x*b.z
  z = a.x*b.y - a.y*b.x

A hidden harness prints each cross product as \`x y z\`.`,
  starter: `typedef struct { double x; double y; double z; } Vec3;

Vec3 vec_cross(Vec3 a, Vec3 b) {
    // x = a.y*b.z - a.z*b.y
    // y = a.z*b.x - a.x*b.z
    // z = a.x*b.y - a.y*b.x
    Vec3 result = {0, 0, 0};
    return result;
}
`,
  lesson: {
    intro: `The dot product gave back a number. The **cross product** gives back a
whole vector — and a special one: it points *perpendicular* to both inputs at once.
Feed it two vectors lying in a plane, and it hands you a vector sticking straight out
of that plane.

Each output component is a little criss-cross of the *other* two axes:
\`x = a.y*b.z - a.z*b.y\`, \`y = a.z*b.x - a.x*b.z\`, \`z = a.x*b.y - a.y*b.x\`. Notice how
the \`x\` output uses only \`y\` and \`z\` inputs, and so on — each axis is built from the
two it isn't.`,
    sections: [
      {
        heading: 'Order matters: anti-commutative',
        body: `Unlike addition and the dot product, the cross product is *not*
symmetric. Swapping the inputs flips the result: \`b × a = -(a × b)\`. Geometrically,
the perpendicular can stick out of either face of the plane, and the order picks
which one.

Which side? The **right-hand rule**: point your right hand's fingers along \`a\`, curl
them toward \`b\`, and your thumb points along \`a × b\`. That's why
\`(1,0,0) × (0,1,0) = (0,0,1)\` — x cross y gives z, the standard orientation.`,
      },
      {
        heading: 'Getting the pattern right',
        body: `The formula is easy to garble, so lean on the pattern: for each output
component, use the two input axes that *aren't* it, in cyclic order x→y→z→x. For the
\`x\` output the next-two axes are \`y\` then \`z\`: \`a.y*b.z - a.z*b.y\`. For \`y\` it's
\`z\` then \`x\`: \`a.z*b.x - a.x*b.z\`. For \`z\` it's \`x\` then \`y\`: \`a.x*b.y - a.y*b.x\`.

Compute all three into a \`Vec3\` and return it. Each term is a difference of two
products — mind the minus sign and the order within each subtraction.`,
      },
    ],
    workedExample: `typedef struct { double x; double y; double z; } Vec3;

// cross product, one component at a time
Vec3 vec_cross2(Vec3 a, Vec3 b) {
    Vec3 out;
    out.x = a.y * b.z - a.z * b.y;
    out.y = a.z * b.x - a.x * b.z;
    out.z = a.x * b.y - a.y * b.x;
    return out;
}
// vec_cross2( (Vec3){0,1,0}, (Vec3){0,0,1} )  ->  {1, 0, 0}`,
    whyItMatters: `Cross products build the normals that lighting depends on: take two
edges of a triangle, cross them, and you get the vector pointing straight out of that
face. They also construct camera coordinate frames (right = forward × up), compute
torque in physics, and measure the area of a parallelogram. When you need a
perpendicular, the cross product is the tool.`,
    commonMistakes: [
      'Swapping the two products in a term, e.g. `a.z*b.y - a.y*b.z`, which negates that component.',
      'Reusing the same axis pair for every component instead of cycling x→y→z.',
      'Assuming `a × b == b × a` — it does not; swapping the inputs flips the sign.',
      'Returning a `double` (that is the dot product); the cross product is a whole `Vec3`.',
    ],
    hint: 'Fill the three components with the criss-cross terms: `Vec3 r = {a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x}; return r;`.',
  },
  harness: `#include <stdio.h>
static void showv(Vec3 v) { printf("%g %g %g\\n", v.x, v.y, v.z); }
int main(void) {
    showv(vec_cross((Vec3){1, 0, 0}, (Vec3){0, 1, 0}));
    showv(vec_cross((Vec3){0, 1, 0}, (Vec3){0, 0, 1}));
    showv(vec_cross((Vec3){1, 2, 3}, (Vec3){4, 5, 6}));
    return 0;
}`,
  expectedStdout: `0 0 1
1 0 0
-3 6 -3
`,
  reference: `typedef struct { double x; double y; double z; } Vec3;

Vec3 vec_cross(Vec3 a, Vec3 b) {
    Vec3 result = {
        a.y * b.z - a.z * b.y,
        a.z * b.x - a.x * b.z,
        a.x * b.y - a.y * b.x
    };
    return result;
}
`,
};

export default exercise;
