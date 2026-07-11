import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'render-model-edges',
  title: 'Milestone 2 — render any model (not just a cube)',
  module: '22 · Your First Real Project',
  order: 2240,
  difficulty: 'hard',
  mode: 'function',
  prompt: `The cube capstone hard-coded its 8 corners. A real renderer draws whatever model you
loaded — arbitrary vertices and edges. This is that generalization.

Implement render_edges(verts, edges, nedges, buf, size): for each edge, look up its two
vertices in verts (3 doubles each: x, y, z), project each with the perspective divide (use
dist = 4.0), map to pixels, and draw the line. set_pixel and draw_line are given as prototypes.

  project a vertex (x,y,z):  sx = x / (z + dist),  sy = y / (z + dist)
  map to pixel:              px = (int)((sx + 0.5) * (size - 1) + 0.5);  (same for py)
  edges[2*e], edges[2*e+1] are the two vertex indices of edge e.`,
  starter: `void set_pixel(unsigned char* buf, int w, int h, int x, int y, unsigned char v);
void draw_line(unsigned char* buf, int w, int h, int x0, int y0, int x1, int y1, unsigned char v);

void render_edges(const double* verts, const int* edges, int nedges,
                  unsigned char* buf, int size) {
    // for each edge: project both endpoints, map to pixels, draw_line between them
}
`,
  lesson: {
    intro: `Milestone 2. In the cube capstone, the 8 corners and 12 edges were baked into the
code. But you're building a renderer that draws a model *read from a file* — you don't know
its shape in advance. So the drawing code has to be **data-driven**: give it a \`verts\` array
(every vertex's x, y, z) and an \`edges\` array (pairs of vertex indices), and it draws
whatever's in them. Feed it a cube and you get a cube; feed it a tetrahedron and you get a
tetrahedron; feed it the model your OBJ parser loaded and you see your model.

The per-edge work is exactly what you already know: project each endpoint (perspective
divide), map to a pixel, draw the line.`,
    sections: [
      {
        heading: 'Indirection: edges point at vertices',
        body: `Vertices are stored once, as \`3\` doubles each: vertex \`i\` is
\`verts[3*i]\`, \`verts[3*i+1]\`, \`verts[3*i+2]\`. An edge doesn't store coordinates — it
stores two *indices*: \`edges[2*e]\` and \`edges[2*e+1]\` say "connect vertex A to vertex B".
This indirection is why a shared corner isn't duplicated: many edges can reference the same
vertex. Your loop reads the two indices, looks up the two vertices, and draws between them.`,
      },
      {
        heading: 'Where this sits in the project',
        body: `This is \`render.c\`. It leans on \`canvas.c\` (the buffer + \`set_pixel\`),
\`draw.c\` (\`draw_line\` from Module 20), and the model your \`obj.c\` loaded into growable
arrays (Milestone 1). \`main.c\` wires them together: parse the file → normalize with
\`max_extent\` → \`render_edges\` → \`canvas_write_ppm\`. Compiling that is a multi-file build
(a \`Makefile\` with a rule per \`.c\`), and it's where headers and prototypes stop being
theory: \`render.c\` \`#include\`s \`canvas.h\` and \`draw.h\` to see these functions' shapes —
exactly the prototypes at the top of this exercise.`,
      },
    ],
    workedExample: `for (int e = 0; e < nedges; e++) {
    int a = edges[2*e], b = edges[2*e + 1];       // the two vertex indices
    double az = verts[3*a+2], bz = verts[3*b+2];
    double asx = verts[3*a] / (az + dist), asy = verts[3*a+1] / (az + dist);
    double bsx = verts[3*b] / (bz + dist), bsy = verts[3*b+1] / (bz + dist);
    int apx = (int)((asx + 0.5) * (size - 1) + 0.5);
    int apy = (int)((asy + 0.5) * (size - 1) + 0.5);
    int bpx = (int)((bsx + 0.5) * (size - 1) + 0.5);
    int bpy = (int)((bsy + 0.5) * (size - 1) + 0.5);
    draw_line(buf, size, size, apx, apy, bpx, bpy, 1);
}`,
    whyItMatters: `Separating *data* (vertices + edges) from *code* (the render loop) is the
core idea that turns a one-off demo into a real tool. The exact same loop draws a cube, a
tetrahedron, a spaceship, or a Utah teapot — you just change the data. That's how every
renderer, game engine, and CAD program works: geometry is data flowing through a fixed
pipeline. You've now written that pipeline.`,
    commonMistakes: [
      'Indexing vertices with the edge number instead of the vertex index — use `verts[3 * edges[2*e]]`, not `verts[3*e]`.',
      'Reusing one endpoint\'s depth `z` for both projections — each endpoint divides by its own `z + dist`.',
      'Forgetting the `+ 0.5` rounding in the pixel mapping, so points land a pixel off.',
      'Passing `size` for width but something else for height — the buffer is `size × size`.',
    ],
    hint: 'Loop edges; for each, pull indices `a`/`b`, project `verts[3*a..]` and `verts[3*b..]` with `s = coord/(z+dist)`, map with `(int)((s+0.5)*(size-1)+0.5)`, then `draw_line`.',
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
int main(void) {
    /* a tetrahedron: 4 vertices, 6 edges */
    double verts[12] = { 0,1,0,  -1,-1,1,  1,-1,1,  0,-1,-1 };
    int edges[12] = { 0,1, 0,2, 0,3, 1,2, 2,3, 3,1 };
    int size = 13;
    unsigned char buf[169] = {0};
    render_edges(verts, edges, 6, buf, size);
    for (int y = 0; y < size; y++) {
        for (int x = 0; x < size; x++) putchar(buf[y * size + x] ? '#' : '.');
        putchar('\\n');
    }
    return 0;
}`,
  expectedStdout: `.............
.............
......#......
.....###.....
....#####....
....#.#.#....
.....###.....
.....###.....
......#......
......#......
.............
.............
.............
`,
  reference: `void set_pixel(unsigned char* buf, int w, int h, int x, int y, unsigned char v);
void draw_line(unsigned char* buf, int w, int h, int x0, int y0, int x1, int y1, unsigned char v);

void render_edges(const double* verts, const int* edges, int nedges,
                  unsigned char* buf, int size) {
    double dist = 4.0;
    for (int e = 0; e < nedges; e++) {
        int ai = edges[2 * e], bi = edges[2 * e + 1];
        double ax = verts[3*ai], ay = verts[3*ai+1], az = verts[3*ai+2];
        double bx = verts[3*bi], by = verts[3*bi+1], bz = verts[3*bi+2];
        double asx = ax / (az + dist), asy = ay / (az + dist);
        double bsx = bx / (bz + dist), bsy = by / (bz + dist);
        int apx = (int)((asx + 0.5) * (size - 1) + 0.5);
        int apy = (int)((asy + 0.5) * (size - 1) + 0.5);
        int bpx = (int)((bsx + 0.5) * (size - 1) + 0.5);
        int bpy = (int)((bsy + 0.5) * (size - 1) + 0.5);
        draw_line(buf, size, size, apx, apy, bpx, bpy, 1);
    }
}
`,
};

export default exercise;
