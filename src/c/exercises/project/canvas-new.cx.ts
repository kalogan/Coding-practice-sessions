import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'canvas-new',
  title: 'Build the canvas module',
  module: '22 · Your First Real Project',
  order: 2220,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Milestone 2: give your renderer something to draw on. A "canvas" is a rectangle of
pixels plus its dimensions, bundled together so the rest of the program can pass it around
as one value.

A Canvas is defined as:
    typedef struct { int w; int h; unsigned char* px; } Canvas;

Implement canvas_new(w, h): allocate a w*h byte pixel buffer on the heap, clear every byte
to 0 (black), and return a Canvas holding w, h, and the buffer. The caller owns the pixels
and must free them later.`,
  starter: `#include <stdlib.h>

typedef struct { int w; int h; unsigned char* px; } Canvas;

Canvas canvas_new(int w, int h) {
    // malloc (or calloc) w*h bytes, zero them, return a Canvas with w, h, and that buffer
    Canvas c;
    c.w = 0;
    c.h = 0;
    c.px = 0;
    return c;
}
`,
  lesson: {
    intro: `So far a "picture" has just been a loose \`unsigned char*\` buffer plus two
\`int\`s for its size — three separate things you had to remember to pass around together.
That's fragile: forget the width and you index into the wrong row. The fix is a **struct**
that packages them as one unit. \`Canvas\` bundles the width \`w\`, the height \`h\`, and a
pointer \`px\` to the pixel bytes, so a single \`Canvas\` value carries everything a drawing
function needs.

This milestone is about the *constructor* — the function that manufactures a fresh, valid
Canvas. Give it a size, and it hands back a struct whose \`px\` already points at a
correctly-sized, all-zero (black) buffer, ready to draw on.`,
    sections: [
      {
        heading: 'Allocating the buffer and filling the struct',
        body: `You need one byte per pixel, so \`w * h\` bytes total. Two ways to get them
zeroed:

\`c.px = malloc(w * h);\` then a loop setting each byte to 0 — or, more directly,
\`c.px = calloc(w * h, 1);\`. \`calloc(count, size)\` allocates \`count * size\` bytes and
**guarantees they start at 0**, which is exactly the black-canvas behaviour you want, so it
saves you the loop.

Then fill in the struct fields and return it: set \`c.w = w\`, \`c.h = h\`, \`c.px\` to the
buffer, and \`return c;\`. Returning a struct *by value* copies its three fields (including
the pointer — not the pixels), so the caller receives its own Canvas that still points at the
same heap buffer. That's the standard "constructor returns a value" pattern in C.`,
      },
      {
        heading: 'A module with a clear API — and who frees',
        body: `In the real project this is the heart of \`canvas.c\`, paired with a
\`canvas.h\` that declares the module's whole public interface:

\`Canvas canvas_new(int w, int h);\`
\`void   canvas_set(Canvas* c, int x, int y, unsigned char v);\`
\`void   canvas_write_ppm(const Canvas* c, const char* path);\`
\`void   canvas_free(Canvas* c);\`

Everything about pixels lives behind those four functions; the rest of the program never
touches \`px\` directly. That's *encapsulation*, and it's what keeps a growing codebase sane.

The one rule you must honour: \`canvas_new\` allocates, so someone must \`free\` — this is
the ownership question from Module 7. The convention here is that whoever holds the Canvas
frees it, normally through \`canvas_free\`, which does \`free(c->px)\`. Because the buffer is
heap memory, this is exactly the kind of thing you prove correct by running the program under
**valgrind** (\`valgrind --leak-check=full ./render\`): every \`canvas_new\` should be matched
by a \`free\`, and valgrind reports "no leaks are possible" when it is.`,
      },
    ],
    workedExample: `// a sibling constructor: a struct that owns a heap array of doubles
typedef struct { int n; double* data; } Vector;

Vector vector_zeros(int n) {
    Vector v;
    v.n = n;
    v.data = calloc(n, sizeof(double));  // n doubles, all 0.0
    return v;                            // caller later does free(v.data)
}
// Vector v = vector_zeros(3);  ->  v.n == 3, v.data points at {0,0,0}`,
    whyItMatters: `Bundling data with the code that manages it — a struct plus a
\`thing_new\` / \`thing_free\` pair — is the closest C gets to an object, and you'll see it
everywhere: file handles, hash tables, image buffers, database connections. Learning to write
a clean constructor (allocate, initialize every field, return a fully-valid value) and to
match it with a destructor is a core habit of professional C. It's also the foundation of the
whole render pipeline: your rasterizer draws into a Canvas, then writes it out as a PPM.`,
    commonMistakes: [
      'Allocating a *local* array (`unsigned char px[w*h];`) and storing its address — that memory dies when the function returns, leaving `c.px` dangling. The buffer must come from `malloc`/`calloc`.',
      'Using `malloc` and forgetting to zero the bytes, so the "black" canvas is full of uninitialized garbage. Use `calloc`, or `malloc` then a clearing loop / `memset`.',
      'Sizing with `malloc(w + h)` or `malloc(w)` instead of `w * h` — you need one byte per pixel across the whole grid.',
      'Returning before filling in `c.w` and `c.h`, so the caller gets a buffer it can\'t index correctly.',
    ],
    hint: 'Declare `Canvas c;`, set `c.w = w;` and `c.h = h;`, allocate with `c.px = calloc(w * h, 1);` (zeros for free), then `return c;`.',
  },
  harness: `#include <stdio.h>
#include <stdlib.h>
int main(void) {
    Canvas c = canvas_new(4, 3);
    printf("%d %d %d %d\\n", c.w, c.h, c.px[0], c.px[11]);
    free(c.px);
    Canvas d = canvas_new(2, 2);
    printf("%d %d %d %d\\n", d.w, d.h, d.px[0], d.px[3]);
    free(d.px);
    return 0;
}`,
  expectedStdout: `4 3 0 0
2 2 0 0
`,
  reference: `#include <stdlib.h>

typedef struct { int w; int h; unsigned char* px; } Canvas;

Canvas canvas_new(int w, int h) {
    Canvas c;
    c.w = w;
    c.h = h;
    c.px = calloc(w * h, 1);
    return c;
}
`,
};

export default exercise;
