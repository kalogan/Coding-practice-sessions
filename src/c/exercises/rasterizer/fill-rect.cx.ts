import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'fill-rect',
  title: 'Fill a rectangle',
  module: '20 · Software Rasterizer',
  order: 2010,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Now draw a solid block. Implement fill_rect(buf, w, h, x0, y0, rw, ry, v): set every
pixel in the rectangle whose top-left corner is (x0, y0) and whose size is rw×ry to the
value v — clipped to the buffer (never write outside the w×h grid).

It's two nested loops over the rectangle's rows and columns, each pixel guarded by the
same bounds check you wrote for set_pixel.`,
  starter: `void fill_rect(unsigned char* buf, int w, int h,
               int x0, int y0, int rw, int ry, unsigned char v) {
    // set the rw x ry block at (x0,y0) to v, skipping any pixel outside the buffer
}
`,
  lesson: {
    intro: `A filled rectangle is the simplest 2-D shape: pick a top-left corner \`(x0, y0)\`
and a size \`rw\` by \`ry\`, and set every pixel inside it. That's a nested loop — the outer
one walking the rectangle's rows, the inner one its columns — writing to the framebuffer
at each step.

You already have the two ideas this needs: row-major indexing (\`y * w + x\`) and clipping
(don't write off-screen). Fill combines them over a 2-D region.`,
    sections: [
      {
        heading: 'The two loops',
        body: `Loop \`y\` from \`y0\` to \`y0 + ry - 1\` (the rectangle's rows) and, inside, \`x\`
from \`x0\` to \`x0 + rw - 1\` (its columns). For each \`(x, y)\`, write the pixel. Writing
\`for (int y = y0; y < y0 + ry; y++)\` reads as "for each of the \`ry\` rows starting at
\`y0\`".`,
      },
      {
        heading: 'Clip every pixel',
        body: `The rectangle can hang off the edge of the buffer — a UI panel scrolled
partly off-screen, a sprite at the border. So guard each write with the same test as
before: \`if (x >= 0 && x < w && y >= 0 && y < h)\`. Pixels inside get set; pixels outside
are silently skipped. The shape is drawn "clipped" to the visible area, and nothing
corrupts memory.`,
      },
    ],
    workedExample: `// fill a 3-wide, 2-tall block at (1,1) in a 5x5 buffer:
for (int y = y0; y < y0 + ry; y++)
    for (int x = x0; x < x0 + rw; x++)
        if (x >= 0 && x < w && y >= 0 && y < h)
            buf[y * w + x] = v;
// . . . . .
// . # # # .
// . # # # .
// . . . . .
// . . . . .`,
    whyItMatters: `Filled rectangles are everywhere — clearing the screen (one big rect),
drawing UI panels, blocks and tiles in a 2-D game, or the bounding boxes of sprites.
And the pattern — "iterate a region, clip, write" — is exactly what filling a triangle
(the next step up, and the heart of 3-D rendering) does, just with a smarter test for
which pixels are inside.`,
    commonMistakes: [
      'Looping `<= x0 + rw` — that draws one column too many. The range is `x0 .. x0 + rw - 1`, so use `< x0 + rw`.',
      'Dropping the per-pixel bounds check, so a rectangle near the edge writes out of the buffer.',
      'Swapping width/height or x/y in the loops or the index — rows use `y` and `h`, columns use `x` and `w`.',
      'Reindexing as `buf[x * w + y]`; it is `buf[y * w + x]`.',
    ],
    hint: 'Nested loop: outer `y` from `y0` to `y0+ry`, inner `x` from `x0` to `x0+rw`; inside, the guarded `buf[y*w+x] = v;`.',
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
    fill_rect(buf, 5, 5, 1, 1, 3, 2, 1);
    /* a rectangle that runs off the right/bottom edge: must clip */
    fill_rect(buf, 5, 5, 4, 4, 3, 3, 1);
    show(buf, 5, 5);
    return 0;
}`,
  expectedStdout: `.....
.###.
.###.
.....
....#
`,
  reference: `void fill_rect(unsigned char* buf, int w, int h,
               int x0, int y0, int rw, int ry, unsigned char v) {
    for (int y = y0; y < y0 + ry; y++)
        for (int x = x0; x < x0 + rw; x++)
            if (x >= 0 && x < w && y >= 0 && y < h)
                buf[y * w + x] = v;
}
`,
};

export default exercise;
