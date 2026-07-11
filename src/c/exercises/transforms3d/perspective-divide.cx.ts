import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'perspective-divide',
  title: 'The perspective divide',
  module: '19 · 3D & the Camera',
  order: 1950,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Perform the perspective divide: given a point's clip-space components
\`(x, y, z, w)\`, compute its 2D screen position by dividing \`x\` and \`y\` by \`w\`.

    *sx = x / w
    *sy = y / w

You may assume \`w\` is not zero. Write the two results through the pointers.`,
  starter: `void project_point(double x, double y, double z, double w,
                   double* sx, double* sy) {
    // Perspective divide: sx = x / w, sy = y / w  (assume w != 0)
    *sx = 0; *sy = 0;   // TODO
}
`,
  lesson: {
    intro: `This is the final step that turns 3D into a flat picture. After a point has
been multiplied by the projection matrix, it has four components \`(x, y, z, w)\`, and the
crucial one is \`w\`: the projection matrix has arranged for \`w\` to encode the point's
*depth* (roughly, how far it is from the camera). Dividing \`x\` and \`y\` by \`w\` is what
makes distant things appear smaller — the essence of perspective.

That single division, \`x/w\` and \`y/w\`, is called the **perspective divide**. It is the
step that gives you a real screen position from the homogeneous coordinates.`,
    sections: [
      {
        heading: 'Why dividing by w shrinks far things',
        body: `A good projection sets \`w\` proportional to distance: near points get a
small \`w\`, far points a large \`w\`. Since screen position is \`x/w\`, a larger \`w\`
pulls the point *closer to the center* — so an object twice as far spans half the screen
distance from the middle. Two points with the same \`x, y\` but different \`w\` land at
different screen spots, purely because of depth. That is exactly the "railroad tracks
converging" effect of a real camera.`,
      },
      {
        heading: 'Homogeneous coordinates, one last time',
        body: `Throughout this module the 4th coordinate stayed \`1\` for affine
transforms. The projection matrix is the first one that *changes* \`w\` — it deliberately
puts depth information there. So the whole \`4×4\` pipeline is: transforms keep \`w = 1\`,
the projection matrix loads \`w\` with depth, and then this divide "cashes it in." The
\`z\` you pass in is carried along for the depth buffer but is not needed to place the
point on screen, so we ignore it here.`,
      },
    ],
    workedExample: `// A point deep in the scene has a big w and lands near center:
//   (x, y, w) = (10, 20, 10)  ->  screen (1, 2)
// The same x,y up close has a small w and lands farther out:
//   (x, y, w) = (10, 20,  2)  ->  screen (5, 10)
// So the divide alone produces the shrink-with-distance effect:
*sx = x / w;
*sy = y / w;`,
    whyItMatters: `Every rasterized 3D frame you have ever seen ends with this divide — the
GPU does it automatically after the vertex shader, between clip space and screen space. It
is the mathematical heart of perspective, the reason a 3D game looks 3D instead of flat.
One line of code, but conceptually the payoff of the whole homogeneous-coordinate machinery.`,
    commonMistakes: [
      'Dividing by `z` instead of `w` — depth was loaded into `w` by the projection matrix; `z` is kept separately for the depth buffer.',
      'Multiplying by `w` instead of dividing — that would make far things *bigger*, the opposite of perspective.',
      'Assigning to the pointers wrong: use `*sx = x / w;`, not `sx = x / w;`.',
      'Guarding needlessly against `w == 0` here — the problem states `w` is nonzero; in real code a clip stage removes those points before the divide.',
    ],
    hint: 'Two lines: `*sx = x / w;` and `*sy = y / w;`. Ignore `z` for the screen position.',
  },
  harness: `#include <stdio.h>
int main(void) {
    double sx, sy;
    project_point(2, 4, 0, 2, &sx, &sy);       /* 2/2, 4/2 */
    printf("%g %g\\n", sx, sy);
    project_point(10, 20, 0, 10, &sx, &sy);    /* 10/10, 20/10 */
    printf("%g %g\\n", sx, sy);
    project_point(3, 6, 0, 1, &sx, &sy);       /* w = 1, unchanged */
    printf("%g %g\\n", sx, sy);
    return 0;
}`,
  expectedStdout: `1 2
1 2
3 6
`,
  reference: `void project_point(double x, double y, double z, double w,
                   double* sx, double* sy) {
    (void)z;
    *sx = x / w;
    *sy = y / w;
}
`,
};

export default exercise;
