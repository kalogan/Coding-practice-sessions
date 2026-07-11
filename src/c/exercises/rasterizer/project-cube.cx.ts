import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'project-cube',
  title: 'Project a 3-D cube to the screen',
  module: '20 · Software Rasterizer',
  order: 2040,
  difficulty: 'hard',
  mode: 'function',
  prompt: `The capstone. Take the 8 corners of a cube, push it away from the camera, and
project each corner onto the 2-D screen with a perspective divide — the exact pipeline a
3-D renderer runs, just distilled to its essence. These 2-D points are what you'd then
connect with draw_line to see a wireframe cube.

Implement project_cube(dist, out): for each of the 8 unit-cube corners (every combination
of x, y, z in {-1, +1}), move it to z + dist (in front of the camera), then project with
sx = x / (z + dist), sy = y / (z + dist). Write the 8 (sx, sy) pairs into out[0..15].`,
  starter: `void project_cube(double dist, double* out) {
    // 8 corners: x,y,z each -1 or +1 (z outer, y middle, x inner)
    // for each: zt = z + dist;  sx = x/zt;  sy = y/zt;
    // write out[2*i] = sx;  out[2*i + 1] = sy;
}
`,
  lesson: {
    intro: `This pulls the whole track together. A cube is 8 corner points — vectors. To see
it, a renderer does three things you've now built: position it in the world (a
translation), and project it to the flat screen (the perspective divide). Do that for all
8 corners and you get 8 screen points; connect them with lines and you're looking at a 3-D
cube on a 2-D display.

We keep it to the essential math: the cube starts centred at the origin with corners at
every combination of ±1. We slide it \`dist\` units away along z (so it sits in front of
the camera), then divide by depth.`,
    sections: [
      {
        heading: 'The 8 corners',
        body: `A cube centred at the origin has corners where each of \`x\`, \`y\`, \`z\` is
either \`-1\` or \`+1\` — that's 2 × 2 × 2 = 8 points. Generate them with three nested
loops (or three nested pairs), \`z\` outermost, then \`y\`, then \`x\`, so the corners come
out in a fixed, predictable order. Each corner is one vector \`(x, y, z)\`.`,
      },
      {
        heading: 'Move it back, then divide by depth',
        body: `A camera at the origin can't see something sitting *on* it, so translate the
cube away: \`zt = z + dist\`. Then apply the **perspective divide** from the previous
module: \`sx = x / zt\`, \`sy = y / zt\`. Dividing by depth is what makes perspective work —
the far face (bigger \`zt\`) shrinks toward the centre, the near face (smaller \`zt\`) stays
larger. Store each corner's \`(sx, sy)\` into the output array, two doubles per corner:
\`out[2*i]\` and \`out[2*i + 1]\`.`,
      },
    ],
    workedExample: `// with dist = 3, a near corner (z = -1) has zt = 2,
// a far corner (z = +1) has zt = 4:
//   corner ( 1,  1, -1) -> ( 1/2,  1/2) = ( 0.5,  0.5)   (near, larger)
//   corner ( 1,  1,  1) -> ( 1/4,  1/4) = (0.25, 0.25)   (far, smaller)
// the far face is drawn smaller than the near face -> perspective!
int i = 0;
for (int z = -1; z <= 1; z += 2)
  for (int y = -1; y <= 1; y += 2)
    for (int x = -1; x <= 1; x += 2) {
        double zt = z + dist;
        out[2 * i]     = x / zt;
        out[2 * i + 1] = y / zt;
        i++;
    }`,
    whyItMatters: `This IS 3-D graphics, stripped to its core: points, a transform, and a
divide by depth. A real engine wraps richer versions of each step in 4×4 matrices (model,
view, projection) and feeds the result to a rasterizer that fills triangles — but the
skeleton is exactly what you just wrote. From here, drawing the 12 edges with draw_line
gives a spinning wireframe cube, and everything you've learned — vectors, matrices,
row-major buffers, the perspective divide — is doing the work.`,
    commonMistakes: [
      'Emitting the corners in a different order than z-outer, y-middle, x-inner — the order determines which pair lands where in `out`.',
      'Forgetting the translation: dividing by a raw `z` of `-1`/`+1` (a corner can even sit at the camera). Use `zt = z + dist`.',
      'Writing only 8 numbers instead of 16 — there are two per corner (`out[2*i]` and `out[2*i+1]`).',
      'Dividing `x` and `y` by different depths — both use the same `zt` for a given corner.',
    ],
    hint: 'Three nested loops (`z`, then `y`, then `x`, each -1 and +1). Keep a corner counter `i`. Compute `zt = z + dist`, write `out[2*i] = x/zt` and `out[2*i+1] = y/zt`, then `i++`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    double out[16];
    project_cube(3.0, out);
    for (int i = 0; i < 8; i++) printf("%g %g\\n", out[2 * i], out[2 * i + 1]);
    return 0;
}`,
  expectedStdout: `-0.5 -0.5
0.5 -0.5
-0.5 0.5
0.5 0.5
-0.25 -0.25
0.25 -0.25
-0.25 0.25
0.25 0.25
`,
  reference: `void project_cube(double dist, double* out) {
    int i = 0;
    for (int z = -1; z <= 1; z += 2)
        for (int y = -1; y <= 1; y += 2)
            for (int x = -1; x <= 1; x += 2) {
                double zt = z + dist;
                out[2 * i] = x / zt;
                out[2 * i + 1] = y / zt;
                i++;
            }
}
`,
};

export default exercise;
