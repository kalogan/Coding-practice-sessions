import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'render-ppm',
  title: 'Write a real image (PPM)',
  module: '20 · Software Rasterizer',
  order: 2030,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Turn a pixel buffer into an actual image file. PPM is the simplest image format
there is — plain text a viewer can open. The "P2" (grayscale) variant is just a tiny
header followed by the pixel values as numbers.

Implement write_ppm(w, h, buf): print a valid P2 PPM to stdout —
  P2
  <w> <h>
  255
then each row of pixels, the values space-separated, one row per line.`,
  starter: `#include <stdio.h>

void write_ppm(int w, int h, const unsigned char* buf) {
    // print the P2 header, then each row of pixel values
}
`,
  lesson: {
    intro: `You've been drawing into a buffer of bytes; now let's make it something you can
actually look at. The **PPM** format (Portable PixMap) is the simplest image format in
common use — no compression, no binary trickery, just text. That makes it perfect for a
from-scratch renderer: you can write one with nothing but \`printf\`, and image viewers
(and converters like ImageMagick) open it directly.

The grayscale flavour is called **P2**. Its whole specification is: a header, then the
pixel brightness values in reading order.`,
    sections: [
      {
        heading: 'The P2 header',
        body: `Three lines: the *magic number* \`P2\` (which tells a reader "this is a text
grayscale PPM"), then the width and height separated by a space, then the maximum pixel
value — use \`255\`. So for a 2×2 image the header is \`P2\`, then \`2 2\`, then \`255\`,
each on its own line.`,
      },
      {
        heading: 'Then the pixels, row by row',
        body: `After the header come the pixel values, from the top-left, left-to-right,
top row first — the same row-major order the buffer is stored in. Print row \`y\` as the
values \`buf[y * w + 0]\`, \`buf[y * w + 1]\`, … separated by spaces, then a newline, for
each row. That's a nested loop: outer over rows, inner over columns.`,
      },
    ],
    workedExample: `// a 2x2 image: black, white / white, black
printf("P2\\n");
printf("%d %d\\n", w, h);
printf("255\\n");
for (int y = 0; y < h; y++) {
    for (int x = 0; x < w; x++) printf("%d ", buf[y * w + x]);
    printf("\\n");
}
// output:
// P2
// 2 2
// 255
// 0 255
// 255 0`,
    whyItMatters: `Being able to dump your framebuffer to a file is what turns "an array of
numbers" into "a picture I can see" — the payoff of a software renderer. PPM is the
traditional teaching format for exactly this reason: ray tracers, rasterizers, and
graphics courses everywhere emit PPM because you can produce it with zero libraries and
then convert it to PNG later. Your projected-cube renderer at the end can write its image
this way.`,
    commonMistakes: [
      'Wrong header order — it must be `P2`, then `width height`, then the max value `255`, each on its own line.',
      'Printing pixels column-major or bottom-up. PPM is row-major, top row first: `buf[y*w+x]`.',
      'Forgetting the newline after each row (a trailing space before it is fine).',
      'Printing the buffer as `#`/`.` characters — PPM wants the numeric values, e.g. `0` and `255`.',
    ],
    hint: 'Three `printf`s for the header (`P2`, then `%d %d` for w/h, then `255`), then the nested row/column loop printing `"%d "` per pixel and a newline per row.',
  },
  harness: `#include <stdio.h>
int main(void) {
    unsigned char buf[4] = {0, 255, 255, 0};   /* 2x2 */
    write_ppm(2, 2, buf);
    return 0;
}`,
  expectedStdout: `P2
2 2
255
0 255
255 0
`,
  reference: `#include <stdio.h>

void write_ppm(int w, int h, const unsigned char* buf) {
    printf("P2\\n");
    printf("%d %d\\n", w, h);
    printf("255\\n");
    for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) printf("%d ", buf[y * w + x]);
        printf("\\n");
    }
}
`,
};

export default exercise;
