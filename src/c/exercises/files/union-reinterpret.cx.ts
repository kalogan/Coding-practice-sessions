import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'union-reinterpret',
  title: 'union: two views of the same bytes',
  module: '15 · Files & Program Structure',
  order: 1530,
  difficulty: 'medium',
  mode: 'function',
  prompt: `A \`union\` lets several variables share the *same* memory, so you can store a value
as one type and read it back as another. Here you'll use that to pull an integer
apart into its raw bytes.

At the top of your solution define a union type that overlays an \`unsigned int\` with
a 4-byte array, then implement \`unsigned char low_byte(unsigned int value)\`: store
\`value\` into the integer member, and return the *lowest* byte — byte 0 of the array.

On this machine (little-endian x86) byte 0 is the least-significant byte, so
\`low_byte(258)\` is \`2\` (258 = 256 + 2). You write both the \`typedef union\` and the
function.`,
  starter: `typedef union {
    unsigned int i;
    unsigned char b[4];
} Word;

unsigned char low_byte(unsigned int value) {
    // store value into a Word's .i, then return .b[0]
    return 0;
}
`,
  lesson: {
    intro: `A \`union\` looks just like a \`struct\`, but with a crucial difference: in a struct,
each member gets its own separate storage, laid out one after another. In a union,
*all the members share one block of memory* — they sit on top of each other. The
union is only as big as its largest member, and writing one member overwrites the
others because they occupy the very same bytes.

That makes a union a legitimate way to look at the same bits through two different
types. Store an \`unsigned int\`, then read the \`unsigned char\` array, and you're
seeing the exact bytes that make up that integer.`,
    sections: [
      {
        heading: 'How a union reinterprets memory',
        body: `\`typedef union { unsigned int i; unsigned char b[4]; } Word;\` declares a 4-byte
region (an \`unsigned int\` is 4 bytes here, and so is a \`b[4]\` array). The member
\`.i\` views those 4 bytes as one integer; \`.b\` views the *same* 4 bytes as four
separate bytes.

So the recipe is: \`Word w; w.i = value;\` writes the integer, and then \`w.b[0]\`,
\`w.b[1]\`, ... read the individual bytes of that integer. No conversion, no
arithmetic — you're literally looking at the stored bits a byte at a time.`,
      },
      {
        heading: 'Endianness: which byte comes first',
        body: `Which byte is \`b[0]\`? That depends on the machine's *byte order*, or endianness.
On a **little-endian** CPU (x86, like this sandbox), the least-significant byte is
stored first, at \`b[0]\`. So for \`value = 0x12345678\`, memory holds
\`78 56 34 12\`, and \`b[0]\` is \`0x78\` = 120.

That's why \`low_byte(258)\` returns \`2\`: 258 is \`0x0102\`, its low byte is \`0x02\`.
Be aware this result is **platform-dependent** — on a big-endian machine \`b[0]\`
would be the *most*-significant byte instead. The code is the same; the answer
follows the hardware. This sandbox is little-endian, so byte 0 is the low byte.`,
      },
    ],
    workedExample: `#include <stdio.h>

typedef union {
    unsigned int i;      // view the 4 bytes as one int
    unsigned char b[4];  // ...or as four separate bytes
} Word;

int main(void) {
    Word w;
    w.i = 0x00FF00AA;    // write through the int member
    // now read the same memory as bytes (little-endian order):
    printf("%u\\n", w.b[0]);  // 0xAA = 170  (lowest byte)
    printf("%u\\n", w.b[1]);  // 0x00 = 0
    printf("%u\\n", w.b[2]);  // 0xFF = 255
    return 0;
}
// One write, read back byte by byte — that's a union reinterpreting bits.`,
    whyItMatters: `Unions and byte-level reinterpretation are how low-level code reads binary file
formats, network packets, and hardware registers — anywhere you must pick apart a
multi-byte value into its constituent bytes (or assemble one from bytes). Endianness
matters the instant data crosses machines or gets written to a file: get the byte
order wrong and \`258\` turns into \`33792\`. Understanding this is essential for
serialization, protocols, and systems programming.`,
    commonMistakes: [
      'Assuming byte order is universal. `b[0]` is the low byte only on little-endian hardware; the result is platform-dependent.',
      'Reading a union member you never wrote — only the member you last assigned holds a meaningful value (here we read `b` right after writing `i`, which is the valid pattern).',
      'Using a `struct` instead of a `union` — a struct gives each member its own memory, so `b` would *not* overlap `i` and you\'d read garbage.',
      'Printing an `unsigned char` with `%d`/`%c` when the harness expects `%u`; make sure the value returned is the byte itself (0–255).',
    ],
    hint: 'Declare `Word w;`, do `w.i = value;`, then `return w.b[0];`. The union makes `b` share memory with `i`, so `b[0]` is already the lowest byte.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%u\\n", low_byte(0));
    printf("%u\\n", low_byte(255));
    printf("%u\\n", low_byte(256));
    printf("%u\\n", low_byte(258));
    printf("%u\\n", low_byte(0x12345678));
    return 0;
}`,
  expectedStdout: `0
255
0
2
120
`,
  reference: `typedef union {
    unsigned int i;
    unsigned char b[4];
} Word;

unsigned char low_byte(unsigned int value) {
    Word w;
    w.i = value;
    return w.b[0];
}
`,
};

export default exercise;
