import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'matmul-tiled',
  title: 'Tiled (blocked) matmul',
  module: '13 · The Matmul Ladder',
  order: 1220,
  difficulty: 'hard',
  mode: 'function',
  prompt: `The professional's matmul. Instead of finishing one output cell completely before
moving on, process the matrices in small square BLOCKS so the chunk you're working on
stays resident in cache.

Implement matmul_tiled(n, m, p, A, B, C) with a block size (use 2 so it tiles even the
small test cases). The result must be identical to naive matmul.

Two things make this different from naive:
  1. You must ZERO C first, because blocks ADD partial products into C over time.
  2. Six nested loops: three step over blocks, three run inside each block.`,
  starter: `void matmul_tiled(int n, int m, int p,
                  const double* A, const double* B, double* C) {
    const int BS = 2;  // block size
    // 1. zero C  (C has n*p elements)
    // 2. for blocks (ii, jj, kk) then inside each block (i, j, k):
    //    C[i*p + j] += A[i*m + k] * B[k*p + j];
}
`,
  lesson: {
    intro: `Transposing B fixed the *right* operand's access pattern. Tiling attacks the
problem from a different angle: keep the *working set* small enough to live in cache.

The idea: chop each matrix into little square blocks (say 2×2 or 32×32). To produce a
block of \`C\`, you multiply-and-add the corresponding strips of blocks from \`A\` and
\`B\`. Because a block is tiny, all the data for one block-multiply fits in fast memory
and gets reused many times before it's evicted. Same total arithmetic, dramatically
better reuse on large matrices.`,
    sections: [
      {
        heading: 'Why you must zero C first',
        body: `Naive computes each \`C[i][j]\` fully in a local \`s\` and stores it once. Tiling
can't do that: a single output cell receives contributions from several \`k\`-blocks at
different times, so you *accumulate straight into \`C\`* with \`+=\`. That only gives the
right answer if \`C\` starts at zero. Forget this and you add your product on top of
whatever garbage was in the \`C\` array.`,
      },
      {
        heading: 'Six loops: blocks outside, elements inside',
        body: `The outer three loops step in strides of \`BS\`: \`ii\` over rows of \`C\`,
\`jj\` over columns of \`C\`, \`kk\` over the shared dimension. The inner three walk WITHIN
the current block: \`i\` from \`ii\` up to \`min(ii+BS, n)\`, and likewise \`j\` and \`k\`.
The \`min\` guards the edges so a block that runs off the end of the matrix is clipped.
The innermost line is exactly naive's: \`C[i*p+j] += A[i*m+k] * B[k*p+j]\`.`,
      },
    ],
    workedExample: `const int BS = 2;
for (int i = 0; i < n * p; i++) C[i] = 0;      // zero C

for (int ii = 0; ii < n; ii += BS)
  for (int jj = 0; jj < p; jj += BS)
    for (int kk = 0; kk < m; kk += BS)
      for (int i = ii; i < ii + BS && i < n; i++)
        for (int j = jj; j < jj + BS && j < p; j++)
          for (int k = kk; k < kk + BS && k < m; k++)
            C[i * p + j] += A[i * m + k] * B[k * p + j];`,
    whyItMatters: `Blocking is *the* technique behind fast linear algebra. Real BLAS/GEMM
kernels tile at several levels at once (registers, L1, L2) with block sizes tuned to the
exact chip. You've now met the whole performance ladder: correct (naive) → cache-aware
(transpose) → blocked (tiling). The math never changed; each rung just respects the
memory hierarchy a little more.`,
    commonMistakes: [
      'Forgetting to zero `C`. With `+=` accumulation, a non-zero start corrupts every result.',
      'Dropping the `&& i < n` (and `j < p`, `k < m`) edge guards, so blocks read/write past the matrix when a dimension is not a multiple of `BS`.',
      'Using `s` local accumulation like naive — tiling accumulates into `C` directly across `kk` blocks.',
      'Mismatched strides in the inner line — it is still `A[i*m+k]`, `B[k*p+j]`, `C[i*p+j]`.',
    ],
    hint: 'Zero C with one loop over n*p. Then three block loops (ii, jj, kk stepping by BS) wrapping three element loops bounded by `min(block+BS, dim)`. Inner line: `C[i*p+j] += A[i*m+k] * B[k*p+j];`.',
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
    matmul_tiled(2, 3, 2, A1, B1, C1);
    show(2, 2, C1);
    double I[9] = {1,0,0, 0,1,0, 0,0,1};
    double X[9] = {2,3,5, 7,11,13, 17,19,23};
    double C2[9];
    matmul_tiled(3, 3, 3, I, X, C2);
    show(3, 3, C2);
    return 0;
}`,
  expectedStdout: `58 64
139 154
2 3 5
7 11 13
17 19 23
`,
  reference: `void matmul_tiled(int n, int m, int p,
                  const double* A, const double* B, double* C) {
    const int BS = 2;
    for (int i = 0; i < n * p; i++) C[i] = 0;
    for (int ii = 0; ii < n; ii += BS)
        for (int jj = 0; jj < p; jj += BS)
            for (int kk = 0; kk < m; kk += BS)
                for (int i = ii; i < ii + BS && i < n; i++)
                    for (int j = jj; j < jj + BS && j < p; j++)
                        for (int k = kk; k < kk + BS && k < m; k++)
                            C[i * p + j] += A[i * m + k] * B[k * p + j];
}
`,
};

export default exercise;
