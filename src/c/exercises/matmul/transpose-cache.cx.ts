import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'matmul-transpose',
  title: 'Cache-friendly matmul (transpose B)',
  module: '13 · The Matmul Ladder',
  order: 1210,
  difficulty: 'hard',
  mode: 'function',
  prompt: `Same product C = A·B as the naive version — same numbers out — but faster. The
naive inner loop reads B down a COLUMN (\`B[k*p + j]\`), jumping p elements in memory
every step. That fights the CPU cache.

The fix: first transpose B into a scratch buffer Bt (so B's columns become Bt's
rows), then the dot product walks BOTH A and Bt straight across memory.

Implement matmul_bt(n, m, p, A, B, C): build Bt, then compute C using it. A is n×m,
B is m×p, C is n×p (all row-major). The result must be identical to naive matmul.`,
  starter: `void matmul_bt(int n, int m, int p,
               const double* A, const double* B, double* C) {
    // 1. transpose B (m x p) into a local Bt (p x m):  Bt[j*m + k] = B[k*p + j]
    // 2. C[i*p + j] = sum_k A[i*m + k] * Bt[j*m + k]
    //    (both A and Bt are now walked in row order — cache-friendly)
}
`,
  lesson: {
    intro: `Your naive matmul is correct, but look at how it touches memory. To build one
cell it walks a row of \`A\` (fine — those elements sit next to each other) and a
*column* of \`B\`. But \`B\` is stored row-major, so consecutive elements of a column
are \`p\` slots apart. Every step of the inner loop jumps across memory, and the CPU
cache — which loads memory in contiguous chunks — keeps missing.

The trick: transpose \`B\` once into a scratch matrix \`Bt\`. Column \`j\` of \`B\` becomes
row \`j\` of \`Bt\`, laid out contiguously. Now the same dot product reads a row of \`A\`
and a row of \`Bt\`, both marching straight through memory. Identical math, far friendlier
access pattern.`,
    sections: [
      {
        heading: 'Step 1 — transpose B into Bt',
        body: `\`B\` is \`m × p\`; its transpose \`Bt\` is \`p × m\`. Using the transpose skill from
earlier: \`Bt[j * m + k] = B[k * p + j]\` for every \`k\` in \`0..m-1\`, \`j\` in \`0..p-1\`.
Now \`Bt\` row \`j\` holds exactly what \`B\` column \`j\` held — the numbers you need for the
dot product — but contiguous.

You need somewhere to put \`Bt\`. A variable-length array \`double Bt[p * m];\` works in
C and is automatically freed when the function returns — no manual memory management.`,
      },
      {
        heading: 'Step 2 — multiply using rows of Bt',
        body: `The dot product for \`C[i][j]\` was \`sum_k A[i*m+k] * B[k*p+j]\`. Substitute
\`B[k*p+j] = Bt[j*m+k]\` and it becomes \`sum_k A[i*m+k] * Bt[j*m+k]\`. Both operands now
advance by 1 in memory as \`k\` grows. The answer is bit-for-bit the same as naive — you
only changed the *order* memory is read, not the arithmetic.`,
      },
    ],
    workedExample: `// scratch buffer, sized from the arguments (a VLA):
double Bt[p * m];
for (int k = 0; k < m; k++)
    for (int j = 0; j < p; j++)
        Bt[j * m + k] = B[k * p + j];   // B's column j -> Bt's row j

for (int i = 0; i < n; i++)
    for (int j = 0; j < p; j++) {
        double s = 0;
        for (int k = 0; k < m; k++)
            s += A[i * m + k] * Bt[j * m + k];   // both contiguous
        C[i * p + j] = s;
    }`,
    whyItMatters: `On big matrices this rewrite alone can be several times faster, purely
from cache behavior — the FLOP count is unchanged. It's a first, real taste of the
central lesson of high-performance computing: *how* you touch memory often matters more
than how many operations you do. Libraries like BLAS obsess over exactly this.`,
    commonMistakes: [
      'Transposing into the wrong shape. `Bt` is `p × m`, so its stride is `m`: `Bt[j*m+k]`.',
      'Using `B`’s stride when reading `Bt`. After transposing, index `Bt` by `j*m+k`, not `k*p+j`.',
      'Changing the math. The products and sums are identical to naive — only the memory layout of the right operand changes.',
      'Sizing the scratch buffer wrong — it must hold `p*m` doubles, the same count as B.',
    ],
    hint: 'Two phases: first fill `double Bt[p*m]` with `Bt[j*m+k] = B[k*p+j]`. Then run the naive triple loop but read `Bt[j*m+k]` instead of `B[k*p+j]`.',
  },
  harness: `#include <stdio.h>
static void show(int rows, int cols, const double* M) {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) printf("%g ", M[i * cols + j]);
        printf("\\n");
    }
}
int main(void) {
    double A1[6] = {1, 2, 3, 4, 5, 6};
    double B1[6] = {7, 8, 9, 10, 11, 12};
    double C1[4];
    matmul_bt(2, 3, 2, A1, B1, C1);
    show(2, 2, C1);
    double I[9] = {1,0,0, 0,1,0, 0,0,1};
    double X[9] = {2,3,5, 7,11,13, 17,19,23};
    double C2[9];
    matmul_bt(3, 3, 3, I, X, C2);
    show(3, 3, C2);
    return 0;
}`,
  expectedStdout: `58 64
139 154
2 3 5
7 11 13
17 19 23
`,
  reference: `void matmul_bt(int n, int m, int p,
               const double* A, const double* B, double* C) {
    double Bt[p * m];
    for (int k = 0; k < m; k++)
        for (int j = 0; j < p; j++)
            Bt[j * m + k] = B[k * p + j];
    for (int i = 0; i < n; i++)
        for (int j = 0; j < p; j++) {
            double s = 0;
            for (int k = 0; k < m; k++)
                s += A[i * m + k] * Bt[j * m + k];
            C[i * p + j] = s;
        }
}
`,
};

export default exercise;
