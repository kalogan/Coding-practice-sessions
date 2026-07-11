import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'unsigned-wrap',
  title: 'Unsigned overflow wraps around',
  module: '16 · Pointers, Level 2',
  order: 1650,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement wrap_add(a, b): add two \`unsigned char\` values and return the result
as an \`unsigned char\`.

An \`unsigned char\` holds 0-255. When a + b exceeds 255 the result *wraps around*
modulo 256 — that's the defined, guaranteed behavior of unsigned arithmetic. So
wrap_add(200, 100) is 300 mod 256 = 44.

Your body is literally \`return a + b;\` — the point of the exercise is to understand
why the answer wraps.`,
  starter: `unsigned char wrap_add(unsigned char a, unsigned char b) {
    // return the sum as an unsigned char (it wraps mod 256)
    return 0;
}
`,
  lesson: {
    intro: `An \`unsigned char\` is an 8-bit unsigned integer: it can represent exactly the
values 0 through 255, and nothing else. So what happens when a computation would produce
256, or 300? For unsigned types, C guarantees the result *wraps around* — it is reduced
modulo 2^8 = 256. There is no error, no garbage: 256 becomes 0, 300 becomes 44, and so on.

This is called modular arithmetic, and for *unsigned* types it is fully defined by the
standard. That is a deliberate promise: you can rely on the wrap and even use it on
purpose (hash functions, checksums, and cyclic counters all lean on it).`,
    sections: [
      {
        heading: 'Why the sum still wraps',
        body: `In \`a + b\`, C first promotes both \`unsigned char\` operands to \`int\` and
computes the true sum (e.g. \`200 + 100\` really is \`300\` during the addition). The wrap
happens at the moment you *store back* into an \`unsigned char\` — the return type here.
Converting \`300\` to \`unsigned char\` keeps only \`300 mod 256 = 44\`.

So the wrap is a property of the destination type's width, not of the addition itself.
Assigning or returning a too-big value into an 8-bit unsigned slot discards everything
above the low 8 bits.`,
      },
      {
        heading: 'Unsigned wrap is defined; signed overflow is not',
        body: `This safety is special to *unsigned* types. Signed overflow — pushing a
\`signed char\` or an \`int\` past its maximum — is *undefined behavior*: the standard
makes no promise, and the compiler may assume it never happens, sometimes producing
surprising results. So "it just wraps" is true for \`unsigned char\`/\`unsigned int\`, but
you must **not** count on it for signed \`int\`.

That is why fixed-width *unsigned* types are the right tool when you deliberately want
modular behavior: bytes in a buffer, color channels, rolling counters, and hashing.`,
      },
    ],
    workedExample: `// a single byte counter that rolls 255 -> 0
unsigned char tick(unsigned char counter) {
    return counter + 1;   // 255 + 1 wraps to 0, guaranteed
}
// tick(254) -> 255
// tick(255) -> 0   (256 mod 256)`,
    whyItMatters: `Byte-level wrap is the backbone of checksums, CRCs, hash mixing, and
audio/graphics math where values are meant to cycle. Knowing that *unsigned* wrap is
defined — while *signed* overflow is undefined — is also a real correctness and security
issue: many bugs come from assuming a signed \`int\` will wrap the way an unsigned one does.`,
    commonMistakes: [
      'Assuming signed `int` overflow wraps the same way — it is *undefined behavior*, not a guaranteed mod.',
      'Adding an `if (sum > 255) sum -= 256;` fixup — unnecessary; returning into an `unsigned char` already wraps for you.',
      'Printing an `unsigned char` result with `%c`, which prints it as a *character* glyph; use `%u` (or `%d`) on a promoted value to see the number.',
      'Expecting a compile error or crash on overflow — for unsigned types there is neither; the value simply wraps.',
    ],
    hint: 'The body is just `return a + b;`. The `unsigned char` return type does the wrapping.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%u\\n", (unsigned)wrap_add(200, 100));
    printf("%u\\n", (unsigned)wrap_add(255, 1));
    printf("%u\\n", (unsigned)wrap_add(100, 50));
    printf("%u\\n", (unsigned)wrap_add(255, 255));
    return 0;
}`,
  expectedStdout: `44
0
150
254
`,
  reference: `unsigned char wrap_add(unsigned char a, unsigned char b) {
    return a + b;
}
`,
};

export default exercise;
