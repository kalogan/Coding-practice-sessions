import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'transpose',
  title: 'Transpose a matrix',
  module: 'C Fundamentals',
  order: 40,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Transpose a rows×cols matrix A into B (which is cols×rows). Both are row-major
flat arrays. Element A[i][j] becomes B[j][i]:

    B[j * rows + i] = A[i * cols + j]

Getting the two different strides right (cols for A, rows for B) is the exact skill
the cache-aware matmul later depends on.`,
  starter: `void transpose(int rows, int cols, const double* A, double* B) {
    // B is cols x rows: B[j][i] = A[i][j]
}
`,
  harness: `#include <stdio.h>
int main(void) {
    double A[6] = {1, 2, 3,
                   4, 5, 6};   // 2x3
    double B[6];
    transpose(2, 3, A, B);     // B is 3x2
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 2; j++) printf("%g ", B[i * 2 + j]);
        printf("\\n");
    }
    return 0;
}`,
  expectedStdout: `1 4
2 5
3 6
`,
  reference: `void transpose(int rows, int cols, const double* A, double* B) {
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            B[j * rows + i] = A[i * cols + j];
}
`,
};

export default exercise;
