import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'matmul-naive',
  title: 'Naive matrix multiply',
  module: 'Matrix Multiplication',
  order: 100,
  difficulty: 'medium',
  mode: 'function',
  prompt: `The one your lead wants you fluent in. Compute C = A · B with the classic triple
loop.

  A is n×m, B is m×p, C is n×p — all row-major flat arrays.
  C[i][j] = sum over k of A[i][k] * B[k][j].

Mind the strides: A uses m columns, B uses p columns, C uses p columns. The harness
checks a non-square product AND an identity product, so off-by-one indexing shows up.`,
  starter: `void matmul(int n, int m, int p,
            const double* A, const double* B, double* C) {
    // C = A*B.  A: n x m,  B: m x p,  C: n x p  (all row-major)
    // C[i*p + j] = sum_k A[i*m + k] * B[k*p + j]
}
`,
  harness: `#include <stdio.h>
static void show(int rows, int cols, const double* M) {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) printf("%g ", M[i * cols + j]);
        printf("\\n");
    }
}
int main(void) {
    /* case 1: (2x3) * (3x2) -> 2x2 */
    double A1[6] = {1, 2, 3, 4, 5, 6};
    double B1[6] = {7, 8, 9, 10, 11, 12};
    double C1[4];
    matmul(2, 3, 2, A1, B1, C1);
    show(2, 2, C1);
    /* case 2: I(3x3) * X(3x3) -> X */
    double I[9] = {1,0,0, 0,1,0, 0,0,1};
    double X[9] = {2,3,5, 7,11,13, 17,19,23};
    double C2[9];
    matmul(3, 3, 3, I, X, C2);
    show(3, 3, C2);
    return 0;
}`,
  expectedStdout: `58 64
139 154
2 3 5
7 11 13
17 19 23
`,
  reference: `void matmul(int n, int m, int p,
            const double* A, const double* B, double* C) {
    for (int i = 0; i < n; i++)
        for (int j = 0; j < p; j++) {
            double s = 0;
            for (int k = 0; k < m; k++) s += A[i * m + k] * B[k * p + j];
            C[i * p + j] = s;
        }
}
`,
};

export default exercise;
