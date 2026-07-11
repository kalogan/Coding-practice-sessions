import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'mat4-mul',
  title: 'Multiply two 4×4 matrices',
  module: '19 · 3D & the Camera',
  order: 1940,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Compute \`C = A · B\` where \`A\`, \`B\`, and \`C\` are 4×4 row-major
matrices (16 doubles each).

This is the general matmul you already know, fixed at \`n = 4\`:

    C[i][j] = sum over k of A[i][k] * B[k][j]     (k = 0..3)

with row-major indexing \`A[i*4 + k]\`, \`B[k*4 + j]\`, \`C[i*4 + j]\`. \`A\` and
\`B\` never alias \`C\`, so you can write straight into \`C\`.`,
  starter: `void mat4_mul(const double* A, const double* B, double* C) {
    // C[i*4 + j] = sum_k A[i*4 + k] * B[k*4 + j]
}
`,
  lesson: {
    intro: `Here is the payoff for learning matmul: *composing* 3D transforms. A single
point might need to be scaled, then rotated, then translated, then run through the
camera's projection. Instead of applying four matrices one after another to every point,
you multiply the four matrices *together once* into a single \`4×4\`, then apply that one
matrix to every point. Multiplying matrices is how you chain transforms.

Mechanically this is the triple loop from the matmul ladder with all three sizes equal to
\`4\`. One output cell \`C[i][j]\` is row \`i\` of \`A\` dotted with column \`j\` of \`B\`.`,
    sections: [
      {
        heading: 'The triple loop at n = 4',
        body: `Outer loops \`i\` and \`j\` pick the output cell (each \`0..3\`); the inner
loop \`k\` runs the dot product over the shared dimension. Accumulate in a local
\`double s = 0;\` declared *inside* the \`j\` loop, add \`A[i*4 + k] * B[k*4 + j]\` for
\`k = 0..3\`, then store \`s\` into \`C[i*4 + j]\`. Because every matrix is \`4\` wide, all
three strides are \`4\` — simpler than the general case where they differ.`,
      },
      {
        heading: 'Order matters — this is the MVP pipeline',
        body: `Matrix multiplication is *not* commutative: \`A · B\` generally differs from
\`B · A\`. The convention "apply \`B\` first, then \`A\`" is written \`A · B\` (the matrix
closest to the point acts first). The graphics **Model–View–Projection** pipeline is
literally \`P · V · M\`: place the model in the world (\`M\`), move it into the camera's
frame (\`V\`), then project to the screen (\`P\`) — three \`4×4\`s collapsed into one by
exactly this multiply. Get the order wrong and objects end up in the wrong place.`,
      },
    ],
    workedExample: `// Composing two translations should just add the offsets:
// T(1,0,0) . T(0,2,0)  ==  T(1,2,0)
// Verify one cell by hand — the (row 1, col 3) entry:
//   C[1*4 + 3] = A[4]*B[3] + A[5]*B[7] + A[6]*B[11] + A[7]*B[15]
//              =   0*0    +   1*2     +    0*0      +   0*1     = 2   (the ty offset)
for (int i = 0; i < 4; i++)
    for (int j = 0; j < 4; j++) {
        double s = 0;
        for (int k = 0; k < 4; k++) s += A[i*4 + k] * B[k*4 + j];
        C[i*4 + j] = s;
    }`,
    whyItMatters: `Every frame a 3D engine renders, it builds combined matrices by
multiplying like this — often per object, per light, per bone. It is one of the most
executed operations in all of computing. And because it is fixed at \`4×4\`, this exact
function is a prime target for hand-tuning and SIMD in real engines.`,
    commonMistakes: [
      'Declaring or resetting `double s = 0;` in the wrong place — it must sit inside the `j` loop, before the `k` loop, so each cell starts fresh.',
      'Indexing `B` with the wrong stride: it is `B[k*4 + j]` (walking *down* column j), not `B[j*4 + k]`.',
      'Assuming `A · B == B · A`; matrix multiply does not commute, so the argument order is the transform order.',
      'Writing into `C[i*4 + j]` inside the `k` loop, clobbering it each step instead of storing the finished sum once.',
    ],
    hint: 'Three nested loops i, j, k, all 0..3. `double s = 0;` between the j and k loops, `s += A[i*4+k]*B[k*4+j];` inside, `C[i*4+j] = s;` after k.',
  },
  harness: `#include <stdio.h>
static void identity4(double* M) {
    for (int r = 0; r < 4; r++)
        for (int c = 0; c < 4; c++) M[r*4 + c] = (r == c) ? 1.0 : 0.0;
}
static void translation4(double tx, double ty, double tz, double* M) {
    identity4(M);
    M[3] = tx; M[7] = ty; M[11] = tz;
}
static void show4(const double* M) {
    for (int r = 0; r < 4; r++) {
        for (int c = 0; c < 4; c++) printf("%g ", M[r*4 + c]);
        printf("\\n");
    }
}
int main(void) {
    /* case 1: T(1,2,3) . I  ->  T(1,2,3) */
    double T[16], I[16], C[16];
    translation4(1, 2, 3, T);
    identity4(I);
    mat4_mul(T, I, C);
    show4(C);
    /* case 2: T(1,0,0) . T(0,2,0)  ->  T(1,2,0) */
    double A[16], B[16], D[16];
    translation4(1, 0, 0, A);
    translation4(0, 2, 0, B);
    mat4_mul(A, B, D);
    show4(D);
    return 0;
}`,
  expectedStdout: `1 0 0 1
0 1 0 2
0 0 1 3
0 0 0 1
1 0 0 1
0 1 0 2
0 0 1 0
0 0 0 1
`,
  reference: `void mat4_mul(const double* A, const double* B, double* C) {
    for (int i = 0; i < 4; i++)
        for (int j = 0; j < 4; j++) {
            double s = 0;
            for (int k = 0; k < 4; k++) s += A[i*4 + k] * B[k*4 + j];
            C[i*4 + j] = s;
        }
}
`,
};

export default exercise;
