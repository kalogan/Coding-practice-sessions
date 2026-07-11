import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'compose-2d',
  title: 'Compose transforms (3×3 multiply)',
  module: '18 · 2D Transform Matrices',
  order: 1850,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Multiply two 3×3 matrices: \`C = A · B\`. All three are row-major \`double[9]\`.

    C[i][j] = A[i][0]*B[0][j] + A[i][1]*B[1][j] + A[i][2]*B[2][j]
            = sum over k of A[i*3 + k] * B[k*3 + j]

This is the \`n = 3\` case of the matmul triple loop. Composing two 2D transforms is
exactly this multiply — the product matrix applies \`B\` first, then \`A\`.`,
  starter: `void mat3_mul(const double* A, const double* B, double* C) {
    // C = A * B, all 3x3 row-major
    // C[i*3 + j] = sum_k A[i*3 + k] * B[k*3 + j]
}
`,
  lesson: {
    intro: `Here's the payoff of the whole matmul ladder. You've built translation, scaling,
and rotation matrices; *composing* them into a single combined transform is just matrix
multiplication. Multiply the matrices once, and the result transforms a point exactly as
if you'd applied each step in turn.

For \`3 × 3\` matrices the rule is the same triple loop as general matmul, with \`n\` fixed
at \`3\`: cell \`C[i][j]\` is the dot product of row \`i\` of \`A\` with column \`j\` of
\`B\`, summing \`A[i*3 + k] * B[k*3 + j]\` over \`k = 0, 1, 2\`.`,
    sections: [
      {
        heading: 'One cell = a row of A dotted with a column of B',
        body: `Fix \`i\` and \`j\`. Accumulate \`double s = 0;\`, then add
\`A[i*3 + k] * B[k*3 + j]\` for \`k = 0, 1, 2\`, and store \`s\` into \`C[i*3 + j]\`. All
three matrices are 3 wide, so every stride is \`* 3\` — simpler than general matmul where
the widths differ. Reset the accumulator inside the \`j\` loop so each cell starts fresh.`,
      },
      {
        heading: 'Order matters — A·B is not B·A',
        body: `Matrix multiplication does not commute. \`A · B\` means "apply \`B\` to the
point first, then \`A\`", and swapping them generally gives a *different* transform.
Rotating then translating is not the same as translating then rotating — try it with real
objects and you'll see the paths differ. This non-commutativity is precisely why the order
you compose transforms in graphics code matters, and why bugs there are so common.`,
      },
    ],
    workedExample: `// The n = 3 special case of the classic matmul triple loop:
for (int i = 0; i < 3; i++)
    for (int j = 0; j < 3; j++) {
        double s = 0;
        for (int k = 0; k < 3; k++)
            s += A[i * 3 + k] * B[k * 3 + j];   // row i of A . column j of B
        C[i * 3 + j] = s;
    }`,
    whyItMatters: `Every graphics engine pre-multiplies a stack of transforms — model,
view, projection — into one matrix, then pushes vertices through it. Composing with a
single \`mat3_mul\` (or its \`4 × 4\` sibling in 3D) is how "scale around this pivot, then
rotate, then move onto the screen" becomes one cheap multiply per point. It is the literal
mechanism behind scene graphs and transform hierarchies.`,
    commonMistakes: [
      'Resetting `double s = 0;` in the wrong place — it must be inside the `j` loop, before the `k` loop, so each cell starts from zero.',
      'Mixing up the strides. For the product, `A` is indexed `A[i*3 + k]` (row of A) and `B` is indexed `B[k*3 + j]` (column of B). Swapping them computes the wrong thing.',
      'Assuming `A·B == B·A`. Matrix multiply is not commutative; the operand order is the composition order.',
      'Writing into `C[i*3 + j]` inside the `k` loop, overwriting it each step instead of storing the finished sum once.',
    ],
    hint: 'Triple loop over i, j, k (all 0..2). Keep `double s = 0;` between the j and k loops; inner: `s += A[i*3+k]*B[k*3+j];`; after k: `C[i*3+j] = s;`.',
  },
  harness: `#include <stdio.h>
static void show3(const double* M) {
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) printf("%g ", M[i * 3 + j]);
        printf("\\n");
    }
}
int main(void) {
    /* case 1: identity * identity -> identity */
    double I[9] = {1,0,0, 0,1,0, 0,0,1};
    double C1[9];
    mat3_mul(I, I, C1);
    show3(C1);
    /* case 2: translation(5,7) * identity -> translation(5,7) */
    double T[9] = {1,0,5, 0,1,7, 0,0,1};
    double C2[9];
    mat3_mul(T, I, C2);
    show3(C2);
    /* case 3: scaling(2,3) * translation(4,5) -> combined transform */
    double A[9] = {2,0,0, 0,3,0, 0,0,1};
    double B[9] = {1,0,4, 0,1,5, 0,0,1};
    double C3[9];
    mat3_mul(A, B, C3);
    show3(C3);
    return 0;
}`,
  expectedStdout: `1 0 0
0 1 0
0 0 1
1 0 5
0 1 7
0 0 1
2 0 8
0 3 15
0 0 1
`,
  reference: `void mat3_mul(const double* A, const double* B, double* C) {
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++) {
            double s = 0;
            for (int k = 0; k < 3; k++)
                s += A[i * 3 + k] * B[k * 3 + j];
            C[i * 3 + j] = s;
        }
}
`,
};

export default exercise;
