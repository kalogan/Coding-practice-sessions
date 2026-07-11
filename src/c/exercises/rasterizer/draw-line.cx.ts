import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'draw-line',
  title: "Draw a line (Bresenham's algorithm)",
  module: '20 · Software Rasterizer',
  order: 2020,
  difficulty: 'hard',
  mode: 'function',
  prompt: `Straight lines are how a renderer draws wireframes — including the edges of the
3-D cube you'll project at the end of this track. But a pixel grid can't draw a true
diagonal; it has to pick the closest pixels. Bresenham's line algorithm does this using
only integer addition — no floating point — which is why it's a classic.

Implement draw_line(buf, w, h, x0, y0, x1, y1, v): set the pixels of the line from
(x0, y0) to (x1, y1) to v, clipped to the buffer. Use the integer Bresenham method below.`,
  starter: `#include <stdlib.h>  /* for abs */

void draw_line(unsigned char* buf, int w, int h,
               int x0, int y0, int x1, int y1, unsigned char v) {
    // Bresenham: step from (x0,y0) toward (x1,y1), plotting the nearest pixel each step
}
`,
  lesson: {
    intro: `To draw a line on a grid you must choose, for each step, which pixel best
approximates the ideal straight line. Bresenham's algorithm does this with a running
"error" term and nothing but integer additions and comparisons — fast and exact, no
rounding of floats. It works for lines at any angle and in any direction.

The version here is the general all-directions form. You don't need to derive it; you
need to understand its shape and get the increments right.`,
    sections: [
      {
        heading: 'The setup: step direction and error',
        body: `Compute the horizontal and vertical distances and which way to step:
\`dx = abs(x1 - x0)\`, \`sx = x0 < x1 ? 1 : -1\` (step right or left), and
\`dy = -abs(y1 - y0)\`, \`sy = y0 < y1 ? 1 : -1\` (step down or up). Note \`dy\` is stored
*negative* — that's what makes the single error test below work in every direction. The
error starts at \`err = dx + dy\`.`,
      },
      {
        heading: 'The loop',
        body: `Repeat: plot the current pixel (with the usual bounds check), stop if you've
reached \`(x1, y1)\`, otherwise nudge \`x\` and/or \`y\`. The decision uses \`e2 = 2 * err\`:
if \`e2 >= dy\` you step in \`x\` (\`err += dy; x0 += sx;\`), and if \`e2 <= dx\` you step in
\`y\` (\`err += dx; y0 += sy;\`). Sometimes both fire (a diagonal step). This single error
value keeps the drawn pixels hugging the true line.`,
      },
    ],
    workedExample: `int dx = abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
int dy = -abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
int err = dx + dy;
while (1) {
    if (x0 >= 0 && x0 < w && y0 >= 0 && y0 < h) buf[y0 * w + x0] = v;
    if (x0 == x1 && y0 == y1) break;
    int e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
}`,
    whyItMatters: `Bresenham (1962, at IBM) is one of the most-used algorithms in computer
graphics — every wireframe, every debug overlay, every "draw a line" call in a software
renderer traces back to it. Its trick — replace slow, imprecise float math with an
integer error accumulator — is a pattern you'll see again in circle drawing, triangle
rasterization, and texture mapping.`,
    commonMistakes: [
      'Storing `dy` as positive. The classic form needs `dy = -abs(y1 - y0)` for the `e2` tests to work in all directions.',
      'Plotting *after* the end-of-line check, so the final pixel `(x1, y1)` is skipped — plot first, then test for the end.',
      'Using two separate `if/else` branches instead of two independent `if`s — both the `x` and `y` steps can happen on the same iteration (a diagonal step).',
      'Dropping the bounds check inside the loop, so a line running past the edge writes out of the buffer.',
    ],
    hint: 'Copy the worked-example loop. The two `if`s inside are independent (not else-if). Remember `dy` is negative, and plot the pixel before the `break` test.',
  },
  harness: `#include <stdio.h>
static void show(const unsigned char* buf, int w, int h) {
    for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) putchar(buf[y * w + x] ? '#' : '.');
        putchar('\\n');
    }
}
int main(void) {
    unsigned char buf[25] = {0};   /* 5x5 */
    draw_line(buf, 5, 5, 0, 0, 4, 4, 1);   /* main diagonal */
    draw_line(buf, 5, 5, 4, 0, 0, 4, 1);   /* anti-diagonal -> an X */
    show(buf, 5, 5);
    return 0;
}`,
  expectedStdout: `#...#
.#.#.
..#..
.#.#.
#...#
`,
  reference: `#include <stdlib.h>

void draw_line(unsigned char* buf, int w, int h,
               int x0, int y0, int x1, int y1, unsigned char v) {
    int dx = abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    int dy = -abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    int err = dx + dy;
    while (1) {
        if (x0 >= 0 && x0 < w && y0 >= 0 && y0 < h) buf[y0 * w + x0] = v;
        if (x0 == x1 && y0 == y1) break;
        int e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
    }
}
`,
};

export default exercise;
