import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'pack-rgb',
  title: 'Pack a color into one integer',
  module: '16 · Pointers, Level 2',
  order: 1640,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement pack_rgb(r, g, b): pack three color channels into a single 32-bit
integer laid out as 0x00RRGGBB.

Each of r, g, b is a \`uint8_t\` (one byte, 0-255). Put red in bits 16-23, green in
bits 8-15, and blue in bits 0-7:

    return ((uint32_t)r << 16) | ((uint32_t)g << 8) | b;

Return the result as a \`uint32_t\`.`,
  starter: `#include <stdint.h>

uint32_t pack_rgb(uint8_t r, uint8_t g, uint8_t b) {
    // combine r, g, b into 0x00RRGGBB
    return 0;
}
`,
  lesson: {
    intro: `Plain \`int\` and \`char\` don't promise an exact size — the standard only
guarantees minimums. When you need a value that is *exactly* one byte or *exactly* four
bytes (as graphics, file formats, and hardware all do), you include \`<stdint.h>\` and
use the fixed-width types: \`uint8_t\` is an unsigned 8-bit integer (range 0-255),
\`uint16_t\` is 16-bit, \`uint32_t\` is an unsigned 32-bit integer.

A color pixel is a perfect example. Red, green, and blue each fit in one byte, and a
common way to store a pixel is to jam all three into a single \`uint32_t\`: red in the
high byte of the low 24 bits, then green, then blue — the layout \`0x00RRGGBB\`.`,
    sections: [
      {
        heading: 'Shifting a byte into position',
        body: `The left-shift \`x << k\` moves x's bits k places toward the high end,
filling zeros on the right — it multiplies by 2^k. To place red in bits 16-23 you shift
it left by 16 (\`r << 16\`); green goes in bits 8-15 (\`g << 8\`); blue stays put (bits
0-7, no shift).

Cast to \`uint32_t\` *before* shifting: \`(uint32_t)r << 16\`. A bare \`uint8_t\` is only
8 bits wide, and shifting it left by 16 would push every bit off the end. Widening it to
32 bits first gives the high bits somewhere to land.`,
      },
      {
        heading: 'OR-ing the pieces together',
        body: `Once each channel sits in its own byte, combine them with bitwise OR (\`|\`).
Because the three shifted values occupy *disjoint* byte positions, OR-ing them simply
merges them without any overlap: \`(r<<16) | (g<<8) | b\`.

Bitwise OR sets a result bit if *either* input has it set. Since red's bits, green's
bits, and blue's bits never coincide here, the OR acts like addition-without-carry —
exactly the "lay them side by side" behavior you want.`,
      },
    ],
    workedExample: `#include <stdint.h>

// pack two bytes into a 16-bit value: 0xHHLL
uint16_t pack16(uint8_t hi, uint8_t lo) {
    return ((uint16_t)hi << 8) | lo;
}
// pack16(0x12, 0x34) -> 0x1234 == 4660
// widen to uint16_t first so hi's bits survive the shift`,
    whyItMatters: `Packing channels into one integer is how pixels live in image buffers,
textures, and framebuffers — a whole image is just an array of these 32-bit colors.
The same shift-and-OR technique packs flags, RGB565 displays, network headers, and file
formats, and \`<stdint.h>\`'s exact-width types are what make the byte layout portable.`,
    commonMistakes: [
      'Forgetting the `(uint32_t)` cast before `<< 16` — an 8-bit `r` shifted left by 16 loses all its bits, giving 0 for the red channel.',
      'Adding with `+` where channels could overlap — for disjoint bytes `|` and `+` agree, but `|` is the intent-revealing operator and is safe even if a channel exceeds its byte.',
      'Mixing up the shift amounts (using 24/16/8 instead of 16/8/0) and landing the bytes in the wrong positions.',
      'Returning a plain `int` — use `uint32_t` so the full 24-bit color is represented without sign surprises.',
    ],
    hint: 'One line: `return ((uint32_t)r << 16) | ((uint32_t)g << 8) | b;`.',
  },
  harness: `#include <stdio.h>
#include <stdint.h>
int main(void) {
    printf("%u\\n", pack_rgb(255, 0, 0));
    printf("%u\\n", pack_rgb(0, 255, 0));
    printf("%u\\n", pack_rgb(0, 0, 255));
    printf("%u\\n", pack_rgb(255, 255, 255));
    printf("%u\\n", pack_rgb(18, 52, 86));
    return 0;
}`,
  expectedStdout: `16711680
65280
255
16777215
1193046
`,
  reference: `#include <stdint.h>

uint32_t pack_rgb(uint8_t r, uint8_t g, uint8_t b) {
    return ((uint32_t)r << 16) | ((uint32_t)g << 8) | b;
}
`,
};

export default exercise;
