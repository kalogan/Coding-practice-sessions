import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'model-extent',
  title: 'Fit the model on screen',
  module: '22 · Your First Real Project',
  order: 2230,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Milestone 3: make any model fit the view. Models come in every size — one might
span thousands of units, another a fraction of one — so before you can project them onto the
screen you need to know how big they are.

The vertices are stored flat: n points as 3*n doubles, laid out x, y, z, x, y, z, ...
Implement max_extent(verts, n): return the largest absolute coordinate value across all 3*n
numbers (assume n >= 1). Use fabs from <math.h>.`,
  starter: `#include <math.h>

double max_extent(const double* verts, int n) {
    // scan all 3*n coordinates; return the largest |value|
    return 0.0;
}
`,
  lesson: {
    intro: `You've loaded a model's vertices (Milestone 1) and you have a canvas to draw on
(Milestone 2). But there's a mismatch: the model lives in its own arbitrary coordinate space
— it might stretch from -1200 to +1200, or huddle between -0.3 and +0.3 — while your canvas
is a fixed grid of pixels. If you project the raw coordinates directly, a big model flies off
the edges and a tiny one collapses to a single dot.

The fix is **normalization**: rescale every coordinate so the model comfortably fills a known
range, roughly \`[-1, 1]\`, regardless of its original size. And to rescale you first need one
number that captures "how far out does this model reach?" — its *extent*. That's the largest
absolute coordinate anywhere in the model, and computing it is this milestone.`,
    sections: [
      {
        heading: 'fabs and a running maximum over a flat array',
        body: `The vertices are packed into one flat \`double\` array: point 0 is
\`verts[0], verts[1], verts[2]\`, point 1 is \`verts[3], verts[4], verts[5]\`, and so on — so
n points occupy \`3 * n\` doubles. Because you want the biggest reach in *any* direction, you
treat all \`3 * n\` numbers as one long list and don't care which axis each belongs to.

"Largest reach" means largest *magnitude*: a coordinate of \`-4\` is further from the origin
than \`+3\`, so you compare **absolute values**. \`fabs\` from \`<math.h>\` gives the absolute
value of a \`double\` (the floating-point cousin of \`abs\`, which is for \`int\`). The pattern
is a running maximum: start \`m\` at 0, loop \`i\` from 0 to \`3 * n\`, and whenever
\`fabs(verts[i])\` beats \`m\`, update \`m\`. Since every magnitude is \`>= 0\`, starting at 0
is safe.`,
      },
      {
        heading: 'How the extent feeds the render pipeline',
        body: `Once you have \`e = max_extent(verts, n)\`, normalization is one divide per
coordinate: \`verts[i] / e\` maps the model into roughly \`[-1, 1]\`. From there the projection
step scales that unit range up to pixel coordinates on the canvas — e.g.
\`px_x = (nx * 0.5 + 0.5) * canvas.w\` — so the whole model lands on screen at a consistent
size no matter what units the artist used.

In the project this lives in \`model.c\`, alongside the other geometry helpers that sit
between the raw OBJ data and the rasterizer. Isolating it as a pure function — numbers in,
one number out, no I/O, no allocation — makes it trivial to unit-test and reason about, which
is why you can verify it here on its own. Compile the module with the warnings cranked up,
\`gcc -Wall -Wextra -g -c model.c\`, and wire it into your \`Makefile\` so the whole renderer
rebuilds with a single \`make\`.`,
      },
    ],
    workedExample: `#include <math.h>
// the 1-D cousin: how far does this signal swing from zero?
double peak(const double* samples, int n) {
    double m = 0.0;
    for (int i = 0; i < n; i++) {
        double a = fabs(samples[i]);  // magnitude, sign ignored
        if (a > m) m = a;             // keep the biggest so far
    }
    return m;
}
// peak({0.2, -0.9, 0.5}, 3)  ->  0.9`,
    whyItMatters: `Finding the maximum magnitude to rescale data into a standard range is a
move you'll make constantly: normalizing audio before mixing, scaling features before feeding
a machine-learning model, auto-ranging the axes of a chart, fitting a shape inside a viewport.
The "running maximum over an array" loop is one of the most fundamental patterns in all of
programming, and pairing it with \`fabs\` to compare magnitudes is the exact tool for "how big
is this thing, ignoring direction?" Get comfortable here and normalization stops feeling like
magic.`,
    commonMistakes: [
      'Looping to `n` instead of `3 * n`, so you only inspect the first n numbers (the x of the first n/3 points) and miss most of the model.',
      'Comparing raw values instead of `fabs(...)`, so a large negative coordinate like `-9` loses to a small positive one. Extent is about magnitude, not sign.',
      'Using `abs` (from `<stdlib.h>`, for `int`) on a `double` — it truncates to an integer. Doubles need `fabs` from `<math.h>`.',
      'Initializing the running max to `verts[0]` without taking its absolute value, so a negative first coordinate seeds the max wrong. Start at `0.0`, or at `fabs(verts[0])`.',
    ],
    hint: 'A running-maximum loop: `double m = 0.0;` then `for (int i = 0; i < 3 * n; i++) if (fabs(verts[i]) > m) m = fabs(verts[i]);` and `return m;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    double a[6] = {1, -2, 3, 0.5, -4, 2};
    printf("%g\\n", max_extent(a, 2));
    double b[3] = {1, 1, 1};
    printf("%g\\n", max_extent(b, 1));
    double c[3] = {-0.5, 0.25, -0.1};
    printf("%g\\n", max_extent(c, 1));
    return 0;
}`,
  expectedStdout: `4
1
0.5
`,
  reference: `#include <math.h>

double max_extent(const double* verts, int n) {
    double m = 0.0;
    for (int i = 0; i < 3 * n; i++) {
        double a = fabs(verts[i]);
        if (a > m) m = a;
    }
    return m;
}
`,
};

export default exercise;
