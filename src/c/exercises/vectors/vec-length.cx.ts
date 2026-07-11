import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'vec-length',
  title: 'Length of a 3D vector',
  module: '17 · Vectors',
  order: 1730,
  difficulty: 'medium',
  mode: 'function',
  prompt: `How long is a vector? Its length (or magnitude) is the distance from the
origin to its tip — the Pythagorean theorem, extended to three dimensions.

Include \`<math.h>\` and use \`sqrt\`. Define
\`typedef struct { double x; double y; double z; } Vec3;\` at the top of your code,
then implement \`vec_length(v)\` returning the \`double\`
\`sqrt(v.x*v.x + v.y*v.y + v.z*v.z)\`.

A hidden harness prints each length with \`%g\`.`,
  starter: `#include <math.h>
typedef struct { double x; double y; double z; } Vec3;

double vec_length(Vec3 v) {
    // return sqrt(v.x*v.x + v.y*v.y + v.z*v.z)
    return 0;
}
`,
  lesson: {
    intro: `The length of a vector is how far its tip sits from the origin. In 2D the
Pythagorean theorem gives \`sqrt(x² + y²)\`; in 3D you just add the third term:
\`length = sqrt(x² + y² + z²)\`.

So you square each component, add the three squares, and take the square root of the
total. The squares are always non-negative, so the sum under the root is never
negative and \`sqrt\` is always well-defined. The zero vector \`(0,0,0)\` has length
\`0\`; nothing else does.`,
    sections: [
      {
        heading: 'sqrt lives in math.h',
        body: `\`sqrt\` isn't built into the language — it's a library function declared
in \`<math.h>\`. Add \`#include <math.h>\` at the top so the compiler knows its shape,
and the engine links the math library (\`-lm\`) so it's available at run time.

\`sqrt\` takes a \`double\` and returns a \`double\`. Feed it the sum of squares:
\`sqrt(v.x*v.x + v.y*v.y + v.z*v.z)\`.`,
      },
      {
        heading: 'Squaring, then the root',
        body: `Notice the shape is the dot product of a vector *with itself* —
\`v·v = x² + y² + z²\` — wrapped in a \`sqrt\`. That's not a coincidence: length is
\`sqrt(v·v)\`.

Each square uses the component times itself: \`v.x * v.x\`, not \`v.x * 2\` (that would
be doubling, not squaring). Get all three squares, sum them, then root once at the
end.`,
      },
    ],
    workedExample: `#include <math.h>
typedef struct { double x; double y; double z; } Vec3;

// distance from the origin, spelled out step by step
double vec_length2(Vec3 v) {
    double sq = v.x * v.x + v.y * v.y + v.z * v.z;
    return sqrt(sq);
}
// vec_length2( (Vec3){2, 3, 6} )  ->  sqrt(4+9+36) = sqrt(49) = 7`,
    whyItMatters: `Length answers "how far?" and "how fast?": the distance between two
points is the length of the vector between them, and a velocity's length is its
speed. It's also the first half of normalizing — to shrink a vector to length 1 you
first need to know its current length. Distance checks (is the enemy within range?)
are length comparisons.`,
    commonMistakes: [
      'Forgetting `#include <math.h>`, so `sqrt` is undeclared.',
      'Writing `v.x * 2` (doubling) when you mean `v.x * v.x` (squaring).',
      'Taking the square root of each term separately instead of rooting the whole sum once.',
      'Dropping the `z` term — in 3D all three squares are summed.',
    ],
    hint: 'Sum the three squares, then root once: `return sqrt(v.x*v.x + v.y*v.y + v.z*v.z);`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%g\\n", vec_length((Vec3){3, 4, 0}));
    printf("%g\\n", vec_length((Vec3){0, 0, 0}));
    printf("%g\\n", vec_length((Vec3){1, 2, 2}));
    printf("%g\\n", vec_length((Vec3){2, 3, 6}));
    return 0;
}`,
  expectedStdout: `5
0
3
7
`,
  reference: `#include <math.h>
typedef struct { double x; double y; double z; } Vec3;

double vec_length(Vec3 v) {
    return sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}
`,
};

export default exercise;
