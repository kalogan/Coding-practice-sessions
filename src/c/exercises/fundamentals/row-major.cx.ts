import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'row-major-index',
  title: 'Row-major indexing',
  module: '12 · Matrices',
  order: 1100,
  difficulty: 'easy',
  mode: 'function',
  prompt: `The idea the whole matmul track rests on. A 2-D matrix is stored as ONE flat
array, row after row ("row-major"). For a matrix with \`cols\` columns, the element
at row r, column c lives at index r * cols + c.

Implement at(m, cols, r, c): return the element at (r, c) of the row-major matrix m.`,
  starter: `int at(const int* m, int cols, int r, int c) {
    // return the element at row r, column c
    return 0;
}
`,
  lesson: {
    intro: `A matrix is a grid — rows and columns. But computer memory is not a grid; it's
one long line of numbered slots. So we have to *flatten* the grid into that line.
The universal convention in C is **row-major**: lay down the whole first row, then
the whole second row, and so on.

The magic formula turns a (row, column) address into a single flat index:
\`index = r * cols + c\`, where \`cols\` is the width of the matrix (how many columns
each row has).`,
    sections: [
      {
        heading: 'Why `r * cols + c`',
        body: `To reach row \`r\`, you first have to skip over all the rows before it. Each row
holds \`cols\` elements, and there are \`r\` earlier rows, so you skip \`r * cols\`
slots. Then you step \`c\` more to reach column \`c\`. Add them: \`r * cols + c\`.

Notice \`cols\` — not \`rows\` — is what you multiply by. The stride between one row and
the next is the number of *columns*. Mixing these up is the classic matrix bug.`,
      },
      {
        heading: 'A concrete grid',
        body: `Take a 3×4 matrix (3 rows, 4 columns) holding 0..11 in order. Element (1, 2)
— row 1, column 2 — sits at \`1 * 4 + 2 = 6\`, and \`m[6]\` is indeed 6. Element
(2, 3) is at \`2 * 4 + 3 = 11\`. The formula is just counting slots.`,
      },
    ],
    workedExample: `// m is row-major with 'cols' columns per row:
//   m[0] m[1] m[2] m[3]      <- row 0
//   m[4] m[5] m[6] m[7]      <- row 1
//   ...
int value = m[r * cols + c];
return value;`,
    whyItMatters: `Every 2-D array in C, every image, every matrix in a linear-algebra
library, comes down to this one line. The naive/transpose/tiled matmul ladder at
the end of this track is *entirely* about which order you touch these flat indices
in. Get \`r * cols + c\` into your fingers now and the hard rungs become readable.`,
    commonMistakes: [
      'Multiplying by `rows` instead of `cols`. The stride between rows is the column count.',
      'Forgetting matrices are 0-indexed: the first row is row 0, and a matrix with `cols` columns has valid columns `0 .. cols-1`.',
      'Swapping `r` and `c`. `(r, c)` means (row, column) — row first.',
    ],
    hint: 'It is a single line: `return m[r * cols + c];`. Skip `r` whole rows (each `cols` wide), then step `c` into the target row.',
  },
  harness: `#include <stdio.h>
int main(void) {
    int m[12] = {
        0, 1,  2,  3,
        4, 5,  6,  7,
        8, 9, 10, 11
    };
    printf("%d\\n", at(m, 4, 0, 0));
    printf("%d\\n", at(m, 4, 1, 2));
    printf("%d\\n", at(m, 4, 2, 3));
    printf("%d\\n", at(m, 4, 2, 0));
    return 0;
}`,
  expectedStdout: `0
6
11
8
`,
  reference: `int at(const int* m, int cols, int r, int c) {
    return m[r * cols + c];
}
`,
};

export default exercise;
