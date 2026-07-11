import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'fill-triangle',
  title: 'Milestone 3 — fill a triangle (solid 3-D)',
  module: '22 · Your First Real Project',
  order: 2250,
  difficulty: 'hard',
  mode: 'function',
  prompt: `Wireframes are lines; solid 3-D is filled triangles. This is the leap — and the real
technique a GPU uses. Implement fill_triangle: set every pixel inside the triangle
(x0,y0)-(x1,y1)-(x2,y2) to v, using the edge-function test.

  edge(ax,ay, bx,by, px,py) = (bx-ax)*(py-ay) - (by-ay)*(px-ax)

A point is inside the triangle when it's on the same side of all three edges. Walk the
triangle's bounding box; for each pixel compute the three edge functions; fill it if they're
all ≥ 0 or all ≤ 0 (that "or" makes it work regardless of the triangle's winding order).`,
  starter: `void fill_triangle(unsigned char* buf, int w, int h,
                   int x0, int y0, int x1, int y1, int x2, int y2, unsigned char v) {
    // bounding box of the 3 points, clipped to the buffer;
    // for each pixel, test the 3 edge functions; fill if all >=0 or all <=0
}
`,
  lesson: {
    intro: `Milestone 3 — the payoff that turns your wireframe into a *solid* model. A filled
triangle is the atom of all 3-D rendering: every surface, no matter how complex, is broken
into triangles, and each triangle is filled pixel by pixel. The method here, the **edge
function**, is essentially what real GPUs do in hardware.

The idea: for a directed edge from A to B, the quantity
\`(Bx-Ax)*(Py-Ay) - (By-Ay)*(Px-Ax)\` is positive on one side of the line, negative on the
other, zero exactly on it (it's a 2-D cross product). A point is *inside* the triangle when
it's on the consistent side of all three edges.`,
    sections: [
      {
        heading: 'Bounding box + three sign tests',
        body: `You don't test every pixel on the screen — only the triangle's **bounding box**:
\`minx..maxx\` and \`miny..maxy\` from the three corners, clipped to the buffer. For each pixel
in that box, compute the three edge functions (one per edge). If all three are \`>= 0\`, the
point is inside a counter-clockwise triangle; if all three are \`<= 0\`, it's inside a
clockwise one. Testing "all ≥ 0 **or** all ≤ 0" handles both winding orders, so you don't
care which way the triangle's corners were listed.`,
      },
      {
        heading: 'From here to a shaded model',
        body: `In your renderer this lives in \`draw.c\` next to \`draw_line\`. To draw a solid
model you'd rasterize each face as a triangle, and pick the fill value \`v\` from **flat
shading**: compute the face's normal (a cross product — the \`vec-cross\` you wrote), take its
dot product with the direction to a light (\`vec-dot\`), and use that brightness. Faces facing
the light are bright, faces turned away are dark. That single dot product is the difference
between a flat silhouette and something that looks three-dimensional. (Add a depth/"z-buffer"
test so nearer triangles cover farther ones, and you have a real renderer.)`,
      },
    ],
    workedExample: `int edge(int ax,int ay,int bx,int by,int px,int py) {
    return (bx-ax)*(py-ay) - (by-ay)*(px-ax);   // >0 one side, <0 the other
}
// inside the bounding box:
int w0 = edge(x1,y1, x2,y2, px,py);
int w1 = edge(x2,y2, x0,y0, px,py);
int w2 = edge(x0,y0, x1,y1, px,py);
if ((w0 >= 0 && w1 >= 0 && w2 >= 0) ||
    (w0 <= 0 && w1 <= 0 && w2 <= 0))
    buf[py * w + px] = v;   // this pixel is inside the triangle`,
    whyItMatters: `Triangle rasterization is *the* operation of real-time graphics — a modern
GPU fills billions of these per second, and every 3-D game frame is millions of shaded
triangles. Writing one by hand, with the same edge-function math the hardware uses, demystifies
the whole field: a "3-D scene" is triangles projected to 2-D and filled, shaded by a dot
product with a light. You've now built, from scratch in C, every piece of that sentence.`,
    commonMistakes: [
      'Testing only "all ≥ 0" — a clockwise-wound triangle then never fills. Accept all ≥ 0 OR all ≤ 0.',
      'Scanning the whole buffer instead of the triangle\'s bounding box (slow), or forgetting to clip the box to `0..w-1` / `0..h-1`.',
      'A typo in the edge function — it is `(bx-ax)*(py-ay) - (by-ay)*(px-ax)`; swapping terms flips or breaks the test.',
      'Indexing the buffer as `buf[px*w+py]` — it is `buf[py*w+px]` (row-major, row = y).',
    ],
    hint: 'Compute `minx/maxx/miny/maxy` from the 3 points, clip to the buffer, and loop that box. Inside, compute the 3 `edge(...)` values and fill when all are `>=0` or all are `<=0`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int w = 7, h = 7;
    unsigned char buf[49] = {0};
    fill_triangle(buf, w, h, 0, 0, 6, 0, 0, 6, 1);
    for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) putchar(buf[y * w + x] ? '#' : '.');
        putchar('\\n');
    }
    return 0;
}`,
  expectedStdout: `#######
######.
#####..
####...
###....
##.....
#......
`,
  reference: `static int edge(int ax, int ay, int bx, int by, int px, int py) {
    return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}
static int imin3(int a, int b, int c) { int m = a < b ? a : b; return m < c ? m : c; }
static int imax3(int a, int b, int c) { int m = a > b ? a : b; return m > c ? m : c; }

void fill_triangle(unsigned char* buf, int w, int h,
                   int x0, int y0, int x1, int y1, int x2, int y2, unsigned char v) {
    int minx = imin3(x0, x1, x2), maxx = imax3(x0, x1, x2);
    int miny = imin3(y0, y1, y2), maxy = imax3(y0, y1, y2);
    if (minx < 0) minx = 0;
    if (miny < 0) miny = 0;
    if (maxx > w - 1) maxx = w - 1;
    if (maxy > h - 1) maxy = h - 1;
    for (int py = miny; py <= maxy; py++)
        for (int px = minx; px <= maxx; px++) {
            int w0 = edge(x1, y1, x2, y2, px, py);
            int w1 = edge(x2, y2, x0, y0, px, py);
            int w2 = edge(x0, y0, x1, y1, px, py);
            if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0))
                buf[py * w + px] = v;
        }
}
`,
};

export default exercise;
