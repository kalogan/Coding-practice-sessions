import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'vec-normalize',
  title: 'Normalize a vector to length 1',
  module: '17 · Vectors',
  order: 1740,
  difficulty: 'hard',
  mode: 'function',
  prompt: `A *unit vector* has length 1 — it captures pure direction, with the length
stripped away. Normalizing means scaling a vector down (or up) so its length becomes
exactly 1.

Include \`<math.h>\` and use \`sqrt\`. Define
\`typedef struct { double x; double y; double z; } Vec3;\` at the top of your code,
then implement \`vec_normalize(v)\`: compute the length
\`len = sqrt(v.x*v.x + v.y*v.y + v.z*v.z)\` and return
\`{v.x/len, v.y/len, v.z/len}\`. Assume \`v\` is non-zero.

A hidden harness prints each normalized vector as \`x y z\`.`,
  starter: `#include <math.h>
typedef struct { double x; double y; double z; } Vec3;

Vec3 vec_normalize(Vec3 v) {
    // len = sqrt(v.x*v.x + v.y*v.y + v.z*v.z)
    // return { v.x/len, v.y/len, v.z/len }
    Vec3 result = {0, 0, 0};
    return result;
}
`,
  lesson: {
    intro: `Sometimes you care about *which way* a vector points but not *how long* it
is — the direction to a light, the way a surface faces. For that you want a **unit
vector**: same direction, length exactly 1.

To get one, divide the vector by its own length. First measure the length
\`len = sqrt(x² + y² + z²)\`, then scale by \`1/len\`, i.e. divide each component by
\`len\`. The result is \`(x/len, y/len, z/len)\`, and its length is 1. This process is
called *normalizing*.`,
    sections: [
      {
        heading: 'Why dividing by length works',
        body: `Scaling a vector by any factor multiplies its length by that same
factor. So if the current length is \`len\` and you scale by \`1/len\`, the new length is
\`len × (1/len) = 1\`. The direction is untouched because every component was scaled by
the *same* number.

Take \`(3, 4, 0)\`: its length is \`5\`, so dividing by 5 gives \`(0.6, 0.8, 0)\`. Check:
\`sqrt(0.36 + 0.64 + 0) = sqrt(1) = 1\`. Perfect unit length.`,
      },
      {
        heading: 'Two steps: measure, then divide',
        body: `This lesson combines the two you just learned. Step one is
\`vec_length\`: \`double len = sqrt(v.x*v.x + v.y*v.y + v.z*v.z);\`. Step two is a scale
by \`1/len\`, done as three divisions: \`{v.x/len, v.y/len, v.z/len}\`.

The result is a \`Vec3\`, so build it with a brace list and return it. (We assume the
input isn't the zero vector — dividing by a zero length is undefined, and a
zero-length vector has no direction to normalize.)`,
      },
    ],
    workedExample: `#include <math.h>
typedef struct { double x; double y; double z; } Vec3;

// scale a vector to a chosen length L (normalize is the L = 1 case)
Vec3 vec_resize(Vec3 v, double L) {
    double len = sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
    double f = L / len;
    Vec3 out = {v.x * f, v.y * f, v.z * f};
    return out;
}
// vec_resize( (Vec3){0,0,5}, 1 )  ->  {0, 0, 1}`,
    whyItMatters: `Unit vectors are everywhere in graphics: surface normals must be
length 1 for lighting math to come out right, and directions (to the camera, to a
light, along a ray) are almost always normalized so the dot product reads as a clean
cosine. Normalizing is one of the most-called functions in any renderer.`,
    commonMistakes: [
      'Dividing by the length only once (a single component) instead of all three.',
      'Multiplying by `len` instead of dividing by it — that makes the vector longer, not unit.',
      'Recomputing the length inside each component instead of once into a local — wasteful and error-prone.',
      'Forgetting `#include <math.h>` for `sqrt`, or returning a `double` instead of a `Vec3`.',
    ],
    hint: 'Measure once, then divide each field: `double len = sqrt(v.x*v.x+v.y*v.y+v.z*v.z); Vec3 r = {v.x/len, v.y/len, v.z/len}; return r;`.',
  },
  harness: `#include <stdio.h>
static void showv(Vec3 v) { printf("%g %g %g\\n", v.x, v.y, v.z); }
int main(void) {
    showv(vec_normalize((Vec3){3, 4, 0}));
    showv(vec_normalize((Vec3){0, 0, 5}));
    showv(vec_normalize((Vec3){2, 0, 0}));
    return 0;
}`,
  expectedStdout: `0.6 0.8 0
0 0 1
1 0 0
`,
  reference: `#include <math.h>
typedef struct { double x; double y; double z; } Vec3;

Vec3 vec_normalize(Vec3 v) {
    double len = sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    Vec3 result = {v.x / len, v.y / len, v.z / len};
    return result;
}
`,
};

export default exercise;
