import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'render-wireframe-cube',
  title: 'Render a wireframe cube (the whole pipeline)',
  module: '20 · Software Rasterizer',
  order: 2050,
  difficulty: 'hard',
  mode: 'function',
  prompt: `The finale. Everything you've built comes together here: project a 3-D cube's 8
corners to the screen, map them to pixels, and connect the 12 edges with lines — and an
actual cube appears.

You're given three functions you already wrote (declared as prototypes at the top):
project_cube, set_pixel, and draw_line. Implement render_cube(buf, size): draw the cube's
wireframe into the size×size buffer.

Steps:
  1. double p[16]; project_cube(3.0, p);   // 8 projected (sx, sy) corners
  2. map each corner to a pixel:
       px[i] = (int)((p[2*i]   + 0.5) * (size - 1) + 0.5);
       py[i] = (int)((p[2*i+1] + 0.5) * (size - 1) + 0.5);
  3. draw the 12 edges with draw_line (corner index pairs below).

The cube's 12 edges (pairs of the 8 corner indices):
  {0,1} {2,3} {4,5} {6,7}   {0,2} {1,3} {4,6} {5,7}   {0,4} {1,5} {2,6} {3,7}`,
  starter: `/* Given — you built these earlier. Here they are as declarations (prototypes). */
void project_cube(double dist, double* out);
void set_pixel(unsigned char* buf, int w, int h, int x, int y, unsigned char v);
void draw_line(unsigned char* buf, int w, int h, int x0, int y0, int x1, int y1, unsigned char v);

void render_cube(unsigned char* buf, int size) {
    // 1. project the cube   2. map corners to pixels   3. draw the 12 edges
}
`,
  lesson: {
    intro: `This is the payoff of the whole track. A cube on screen is nothing more than the
pieces you've already built, wired together: its 8 corners are *vectors*; pushing it in
front of the camera and dividing by depth is *projection*; the screen is a *row-major
pixel buffer*; and the edges are *Bresenham lines*. Assemble them and a 3-D shape appears
out of pure C.

You're handed three functions you wrote in earlier sessions — \`project_cube\`,
\`set_pixel\`, \`draw_line\` — as **prototypes** (declarations) at the top of the file. That's
the header idea from Module 14 in action: you can *use* a function as long as its shape is
declared; the actual definitions live elsewhere (here, in the hidden harness). Your job is
the orchestration: \`render_cube\`.`,
    sections: [
      {
        heading: 'From projected corner to pixel',
        body: `\`project_cube\` gives you 8 corners as (sx, sy) pairs in a small range around
0 (roughly −0.5…0.5). A pixel buffer's coordinates run 0…size−1, so you *map* each
projected corner into that range: shift it by +0.5 to move 0-centred values into 0…1, scale
by \`(size − 1)\`, and add 0.5 before truncating to \`int\` so it rounds to the nearest
pixel. Do this for all 8 corners, storing \`px[i]\` and \`py[i]\`.`,
      },
      {
        heading: 'Which corners connect: the 12 edges',
        body: `A cube has 8 corners and 12 edges. Two corners share an edge when they're
adjacent — given the corner ordering from \`project_cube\`, that's the 12 index pairs listed
in the prompt (four "front/back horizontals", four "front/back verticals", four
"near-to-far connectors"). Loop over that edge list and call \`draw_line\` between each pair's
pixels. (Neat aside: two corners are adjacent exactly when their indices differ in a single
bit — the popcount idea from the bits module — but the explicit list is fine here.)`,
      },
    ],
    workedExample: `double p[16];
project_cube(3.0, p);
int px[8], py[8];
for (int i = 0; i < 8; i++) {
    px[i] = (int)((p[2 * i]     + 0.5) * (size - 1) + 0.5);
    py[i] = (int)((p[2 * i + 1] + 0.5) * (size - 1) + 0.5);
}
int edges[12][2] = {
    {0,1},{2,3},{4,5},{6,7}, {0,2},{1,3},{4,6},{5,7}, {0,4},{1,5},{2,6},{3,7}
};
for (int e = 0; e < 12; e++)
    draw_line(buf, size, size, px[edges[e][0]], py[edges[e][0]],
              px[edges[e][1]], py[edges[e][1]], 1);`,
    whyItMatters: `You just wrote — from scratch, in C — the skeleton of a 3-D renderer: model
points, a projection, a framebuffer, and line drawing. The near face of the cube comes out
larger than the far face because of the perspective divide; that's real 3-D on a 2-D grid.
Every game engine and CAD tool does a far richer version of exactly this. From here, the
natural next steps are spinning it (a rotation matrix from Module 19), filling the faces
(triangle rasterization), and writing the result to a PPM image — all built on what you now
have.`,
    commonMistakes: [
      'Mapping with the wrong formula — use `(int)((s + 0.5) * (size - 1) + 0.5)` for both x and y; the `+ 0.5` at the end is the round-to-nearest.',
      'Getting the edge list wrong, so faces are open or diagonals appear — use the 12 pairs exactly as given.',
      'Passing `px`/`py` in the wrong order to `draw_line` (it takes x0, y0, x1, y1).',
      'Forgetting the buffer is `size × size` — pass `size` for both width and height to `draw_line`.',
    ],
    hint: 'Follow the worked example almost verbatim: project into `p`, fill `px[]`/`py[]` with the mapping, then loop the 12-edge array calling `draw_line` between each pair.',
  },
  harness: `#include <stdio.h>
#include <stdlib.h>
void set_pixel(unsigned char* buf, int w, int h, int x, int y, unsigned char v) {
    if (x >= 0 && x < w && y >= 0 && y < h) buf[y * w + x] = v;
}
void draw_line(unsigned char* buf, int w, int h, int x0, int y0, int x1, int y1, unsigned char v) {
    int dx = abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    int dy = -abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    int err = dx + dy;
    while (1) {
        set_pixel(buf, w, h, x0, y0, v);
        if (x0 == x1 && y0 == y1) break;
        int e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
    }
}
void project_cube(double dist, double* out) {
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
int main(void) {
    int size = 13;
    unsigned char buf[13 * 13] = {0};
    render_cube(buf, size);
    for (int y = 0; y < size; y++) {
        for (int x = 0; x < size; x++) putchar(buf[y * size + x] ? '#' : '.');
        putchar('\\n');
    }
    return 0;
}`,
  expectedStdout: `#############
##.........##
#.#.......#.#
#..#######..#
#..#.....#..#
#..#.....#..#
#..#.....#..#
#..#.....#..#
#..#.....#..#
#..#######..#
#.#.......#.#
##.........##
#############
`,
  reference: `void project_cube(double dist, double* out);
void set_pixel(unsigned char* buf, int w, int h, int x, int y, unsigned char v);
void draw_line(unsigned char* buf, int w, int h, int x0, int y0, int x1, int y1, unsigned char v);

void render_cube(unsigned char* buf, int size) {
    double p[16];
    project_cube(3.0, p);
    int px[8], py[8];
    for (int i = 0; i < 8; i++) {
        px[i] = (int)((p[2 * i] + 0.5) * (size - 1) + 0.5);
        py[i] = (int)((p[2 * i + 1] + 0.5) * (size - 1) + 0.5);
    }
    int edges[12][2] = {
        {0,1},{2,3},{4,5},{6,7},
        {0,2},{1,3},{4,6},{5,7},
        {0,4},{1,5},{2,6},{3,7}
    };
    for (int e = 0; e < 12; e++)
        draw_line(buf, size, size, px[edges[e][0]], py[edges[e][0]],
                  px[edges[e][1]], py[edges[e][1]], 1);
}
`,
};

export default exercise;
