import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'set-pixel',
  title: 'A pixel buffer (set_pixel)',
  module: '20 · Software Rasterizer',
  order: 2000,
  difficulty: 'medium',
  mode: 'function',
  prompt: `A screen is just a grid of pixels held in memory — one flat, row-major array,
exactly like the matrices you've been indexing. A pixel at (x, y) in a w×h buffer
lives at index y * w + x.

Implement set_pixel(buf, w, h, x, y, v): store value v at pixel (x, y) — BUT only if
(x, y) is inside the buffer (0 ≤ x < w and 0 ≤ y < h). Out-of-bounds writes must be
ignored, not crash. This bounds check is what keeps a renderer from corrupting memory.`,
  starter: `void set_pixel(unsigned char* buf, int w, int h, int x, int y, unsigned char v) {
    // if (x, y) is inside the w x h buffer, set buf[y*w + x] = v
}
`,
  lesson: {
    intro: `Everything a renderer draws ends up in a *framebuffer*: a block of memory with one
slot per pixel. Just like a matrix, a 2-D image is stored as one long row-major array —
row 0's pixels, then row 1's, and so on. The pixel at column \`x\`, row \`y\` sits at
\`buf[y * w + x]\`, where \`w\` is the width. That's the same \`row * width + col\` formula
from the very first matrix lesson — a framebuffer *is* a matrix of pixels.

Here each pixel is one \`unsigned char\` (0–255), a grayscale brightness. Your job is to
write a value into the right slot — safely.`,
    sections: [
      {
        heading: 'Always check the bounds',
        body: `A renderer constantly computes pixel positions that may land off-screen —
a line that runs past the edge, a shape partly out of view. Writing to
\`buf[y * w + x]\` when \`(x, y)\` is outside the buffer scribbles on memory you don't
own: at best garbage, at worst a crash. So guard every write:
\`if (x >= 0 && x < w && y >= 0 && y < h)\` then store, otherwise do nothing. This
"clipping" is a load-bearing habit in graphics code.`,
      },
      {
        heading: 'Why unsigned char',
        body: `A grayscale pixel is a single byte, 0 (black) to 255 (white) — exactly the range
of an \`unsigned char\`. Buffers of \`unsigned char\` are how images, textures, and
color channels are stored throughout real graphics and image code. (A color pixel is
usually three or four such bytes — R, G, B, and sometimes alpha — the packing you met
in \`pack-rgb\`.)`,
      },
    ],
    workedExample: `// the framebuffer laid out in memory (w = 4):
//   index:  0  1  2  3   <- row 0 (y=0)
//           4  5  6  7   <- row 1 (y=1)
//           8  9 10 11   <- row 2 (y=2)
// pixel (x=2, y=1) is at 1*4 + 2 = index 6
if (x >= 0 && x < w && y >= 0 && y < h)
    buf[y * w + x] = v;`,
    whyItMatters: `set_pixel is the single primitive every software renderer is built on —
lines, triangles, and whole 3-D scenes all bottom out in "put this value at this pixel."
Get the row-major index and the bounds check right and everything above it (the next
rungs: rectangles, lines, a projected cube) just calls this in a loop.`,
    commonMistakes: [
      'Indexing `buf[x * h + y]` or `buf[x * w + y]` — the row-major index is `y * w + x` (row times width plus column).',
      'Skipping the bounds check, so an off-screen coordinate writes out of the array.',
      'Checking `x <= w` / `y <= h` instead of `x < w` / `y < h` — the valid range is `0 .. w-1` and `0 .. h-1`.',
      'Forgetting a coordinate can be negative — check `x >= 0 && y >= 0` too.',
    ],
    hint: 'One guarded assignment: `if (x >= 0 && x < w && y >= 0 && y < h) buf[y * w + x] = v;`.',
  },
  harness: `#include <stdio.h>
static void show(const unsigned char* buf, int w, int h) {
    for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) putchar(buf[y * w + x] ? '#' : '.');
        putchar('\\n');
    }
}
int main(void) {
    unsigned char buf[12] = {0};   /* 4 wide, 3 tall, all clear */
    set_pixel(buf, 4, 3, 0, 0, 1);
    set_pixel(buf, 4, 3, 1, 1, 1);
    set_pixel(buf, 4, 3, 3, 2, 1);
    set_pixel(buf, 4, 3, 10, 10, 1);  /* out of bounds: must be ignored */
    set_pixel(buf, 4, 3, -1, 0, 1);   /* out of bounds: must be ignored */
    show(buf, 4, 3);
    return 0;
}`,
  expectedStdout: `#...
.#..
...#
`,
  reference: `void set_pixel(unsigned char* buf, int w, int h, int x, int y, unsigned char v) {
    if (x >= 0 && x < w && y >= 0 && y < h)
        buf[y * w + x] = v;
}
`,
};

export default exercise;
