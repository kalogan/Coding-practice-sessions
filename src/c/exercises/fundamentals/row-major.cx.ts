import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'row-major-index',
  title: 'Row-major indexing',
  module: 'C Fundamentals',
  order: 30,
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
