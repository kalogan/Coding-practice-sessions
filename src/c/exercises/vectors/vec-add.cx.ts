import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'vec-add',
  title: 'Add two 3D vectors',
  module: '17 · Vectors',
  order: 1700,
  difficulty: 'easy',
  mode: 'function',
  prompt: `Welcome to the atoms of 3D graphics. A vector holds three numbers —
\`x\`, \`y\`, and \`z\` — and shows up everywhere: a point's position, a direction to
move, the way a surface faces.

Define \`typedef struct { double x; double y; double z; } Vec3;\` at the top of your
code, then implement \`vec_add(a, b)\` so it returns a new \`Vec3\` whose fields are the
componentwise sums: \`{a.x + b.x, a.y + b.y, a.z + b.z}\`.

A hidden harness adds a few vectors and prints each result as \`x y z\`.`,
  starter: `typedef struct { double x; double y; double z; } Vec3;

Vec3 vec_add(Vec3 a, Vec3 b) {
    // return a NEW Vec3: { a.x + b.x, a.y + b.y, a.z + b.z }
    Vec3 result = {0, 0, 0};
    return result;
}
`,
  lesson: {
    intro: `A 3D vector is just three numbers bundled together: \`(x, y, z)\`. That
tiny package is the foundation of all 3D graphics — it can describe *where* something
is (a position) or *which way* it points (a direction).

Adding two vectors is the simplest operation there is: you add them component by
component. The \`x\` of the answer is the sum of the two \`x\` values, and likewise for
\`y\` and \`z\`. Three independent additions, packed back into one \`Vec3\`.`,
    sections: [
      {
        heading: 'Tip-to-tail: what addition means',
        body: `Picture each vector as an arrow. To add \`a + b\`, place the tail of
\`b\` at the tip of \`a\`; the sum is the arrow from the very start to the very end.
That geometric "walk one arrow, then the next" is *exactly* what adding the
components does.

So if \`a\` moves you 1 step along \`x\` and \`b\` moves you 4 more along \`x\`, together
you've moved 5 along \`x\` — the components just add.`,
      },
      {
        heading: 'Returning a whole struct',
        body: `\`vec_add\` returns a \`Vec3\`, not an \`int\`. You build the answer with
a brace list in field order — \`Vec3 r = {a.x + b.x, a.y + b.y, a.z + b.z};\` — and
\`return r;\`. C copies the whole struct back to the caller.

Both input vectors are passed *by value*, so they're untouched; the caller receives a
brand-new vector.`,
      },
    ],
    workedExample: `typedef struct { double x; double y; double z; } Vec3;

// subtract b from a, componentwise -> a NEW vector
Vec3 vec_sub(Vec3 a, Vec3 b) {
    Vec3 out = {a.x - b.x, a.y - b.y, a.z - b.z};
    return out;                 // hand the whole vector back
}
// vec_sub( (Vec3){5,7,9}, (Vec3){4,5,6} )  ->  {1, 2, 3}`,
    whyItMatters: `Vector addition is the workhorse of animation and physics: a new
position is old position plus a velocity vector; combining forces is adding their
vectors. Every frame of a game or simulation is built on millions of these tiny
componentwise sums.`,
    commonMistakes: [
      'Adding only one component (e.g. `a.x + b.x` but copying `a.y` and `a.z` unchanged).',
      'Mixing up the fields — line up `x` with `x`, `y` with `y`, `z` with `z`.',
      'Declaring the return type as `int` or `double` — it must be `Vec3`, a whole vector.',
      'Trying to write `a + b` directly; C has no built-in `+` for structs, you add each field.',
    ],
    hint: 'Build the result from three sums and return it: `Vec3 r = {a.x + b.x, a.y + b.y, a.z + b.z}; return r;`.',
  },
  harness: `#include <stdio.h>
static void showv(Vec3 v) { printf("%g %g %g\\n", v.x, v.y, v.z); }
int main(void) {
    showv(vec_add((Vec3){1, 2, 3}, (Vec3){4, 5, 6}));
    showv(vec_add((Vec3){0, 0, 0}, (Vec3){1, 1, 1}));
    showv(vec_add((Vec3){-1, 2, -3}, (Vec3){1, -2, 3}));
    return 0;
}`,
  expectedStdout: `5 7 9
1 1 1
0 0 0
`,
  reference: `typedef struct { double x; double y; double z; } Vec3;

Vec3 vec_add(Vec3 a, Vec3 b) {
    Vec3 result = {a.x + b.x, a.y + b.y, a.z + b.z};
    return result;
}
`,
};

export default exercise;
