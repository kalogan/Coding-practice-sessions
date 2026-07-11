import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'times-table',
  title: 'Multiplication table',
  module: '9 · Reading Input',
  order: 840,
  difficulty: 'medium',
  mode: 'program',
  prompt: `Read an integer \`n\`. Print the \`n\`×\`n\` multiplication table: one row per line,
where row \`i\` column \`j\` holds the product \`i*j\` (rows and columns numbered from 1).
Separate the products on a row with single spaces. End each row with a newline.

Input:  a single integer \`n\`.
Output: \`n\` lines; line \`i\` is \`i*1 i*2 ... i*n\` space-separated.

Example for \`n = 3\`:
1 2 3
2 4 6
3 6 9`,
  starter: `#include <stdio.h>

int main(void) {
    // read n, then print the n-by-n multiplication grid
    return 0;
}
`,
  lesson: {
    intro: `A grid of output needs a loop inside a loop. The *outer* loop walks the rows;
for each row, the *inner* loop walks the columns and prints one cell. When the inner
loop finishes a row, you print a newline and the outer loop moves to the next row.

This "nested loop drives a 2-D pattern" idea is the heart of printing tables, grids,
matrices, and any rectangular layout.`,
    sections: [
      {
        heading: 'Nested loops: rows outside, columns inside',
        body: `The structure is:

\`for (int i = 1; i <= n; i++) { for (int j = 1; j <= n; j++) { ... } }\`

The inner loop runs completely for each single pass of the outer loop. So for \`n=3\`
the pairs \`(i,j)\` come out as (1,1)(1,2)(1,3) then (2,1)(2,2)(2,3) then
(3,1)(3,2)(3,3). Here both loops start at \`1\` (not \`0\`) because the table is
numbered from 1, and the cell value is simply \`i * j\`.`,
      },
      {
        heading: 'Ending each row and spacing the cells',
        body: `Print the products with spaces *between* them but not trailing: inside the
inner loop, \`if (j > 1) printf(" ");\` then \`printf("%d", i * j);\`. That guards the
separator so the row starts clean.

After the inner loop completes a row — back in the outer loop but outside the inner
one — print a single \`printf("\\n");\` to end that line. Placement matters: the
newline belongs to the outer loop, once per row, not once per cell.`,
      },
    ],
    workedExample: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {        // rows
        for (int j = 1; j <= n; j++) {    // columns
            if (j > 1) printf(" ");       // space between, not before first
            printf("%d", i + j);          // SUM grid here, just to differ
        }
        printf("\\n");                     // end the row (outer loop!)
    }
    return 0;
}
// Prints an addition grid. Swap i + j for i * j to get the times table.`,
    whyItMatters: `Nested loops are the standard tool for anything two-dimensional: rendering a
board, filling a matrix, comparing every pair of items, laying out a grid of pixels.
Getting the "inner loop builds a row, outer loop stacks the rows" rhythm — and
putting the row-ending newline in the right place — is a skill you'll lean on
constantly.`,
    commonMistakes: [
      'Putting the `printf("\\n")` inside the inner loop, so every number lands on its own line instead of one row per line.',
      'Starting the loops at `0` — the table is 1-based, so `i` and `j` should run `1..n`.',
      'Printing a space after every product, leaving a trailing space on each row (guard with `if (j > 1)`).',
      'Using `<` instead of `<=` in the bounds, producing an (n-1)-by-(n-1) grid.',
    ],
    hint: 'Outer `for (i = 1; i <= n; i++)`, inner `for (j = 1; j <= n; j++)`. Inside: `if (j > 1) printf(" ");` then `printf("%d", i * j);`. After the inner loop (still in the outer): `printf("\\n");`.',
  },
  cases: [
    { name: 'three by three', stdin: `3\n`, expectedStdout: `1 2 3\n2 4 6\n3 6 9\n` },
    { name: 'one by one', stdin: `1\n`, expectedStdout: `1\n` },
    { name: 'two by two', stdin: `2\n`, expectedStdout: `1 2\n2 4\n` },
  ],
  reference: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (j > 1) printf(" ");
            printf("%d", i * j);
        }
        printf("\\n");
    }
    return 0;
}
`,
};

export default exercise;
