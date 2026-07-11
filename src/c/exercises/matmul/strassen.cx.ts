import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'matmul-strassen',
  title: 'Strassen 2×2 — trading a multiply',
  module: '13 · The Matmul Ladder',
  order: 1230,
  difficulty: 'hard',
  mode: 'function',
  prompt: `The capstone idea. Multiplying two 2×2 matrices the ordinary way costs 8
scalar multiplications. In 1969 Strassen found a way to do it with only 7 — at the
price of a few extra additions. Recursed on block submatrices, that one saved multiply
drops matrix multiplication below the classic n³ cost.

Implement strassen2x2(A, B, C): multiply two 2×2 row-major matrices using Strassen's
seven products M1..M7. The result must match the ordinary 2×2 product exactly.`,
  starter: `void strassen2x2(const double* A, const double* B, double* C) {
    // A, B, C are 2x2 row-major:  A = [a b; c d], B = [e f; g h]
    // Compute 7 products M1..M7, then combine into C.
    // C[0]=C11  C[1]=C12  C[2]=C21  C[3]=C22
}
`,
  lesson: {
    intro: `Every rung so far kept the naive arithmetic and just reordered memory. Strassen
changes the arithmetic itself. Name the four entries of each 2×2 matrix:
\`A = [a b; c d]\`, \`B = [e f; g h]\`. The ordinary product needs eight multiplications
(two per output cell). Strassen forms seven cleverly-chosen products and recombines them
with additions and subtractions to get the same four output cells — using one fewer
multiply.

One multiply saved on a 2×2 sounds trivial. The magic is *recursion*: treat a big matrix
as a 2×2 grid of sub-blocks and apply the same 7-instead-of-8 rule to the blocks. Each
level trades a block-multiply for block-adds, and the savings compound to an asymptotic
cost of about n^2.807 instead of n³.`,
    sections: [
      {
        heading: 'The seven products',
        body: `\`M1 = (a + d)(e + h)\`,  \`M2 = (c + d)·e\`,  \`M3 = a·(f - h)\`,
\`M4 = d·(g - e)\`,  \`M5 = (a + b)·h\`,  \`M6 = (c - a)(e + f)\`,
\`M7 = (b - d)(g + h)\`.

Count them: seven multiplications, each of a sum/difference of entries. The extra plus
and minus signs are additions, which are far cheaper than multiplications on real
hardware — that's the trade Strassen is making.`,
      },
      {
        heading: 'Recombining into C',
        body: `The four output cells come from adding and subtracting the M's:
\`C11 = M1 + M4 - M5 + M7\`,  \`C12 = M3 + M5\`,
\`C21 = M2 + M4\`,  \`C22 = M1 - M2 + M3 + M6\`.

In the flat row-major array that's \`C[0]=C11\`, \`C[1]=C12\`, \`C[2]=C21\`, \`C[3]=C22\`.
Work out one cell by hand against the ordinary formula and you'll see the M's telescope
into exactly \`a·e + b·g\` and friends — same answer, different bookkeeping.`,
      },
    ],
    workedExample: `// entries (row-major): A=[a b; c d], B=[e f; g h]
double a=A[0], b=A[1], c=A[2], d=A[3];
double e=B[0], f=B[1], g=B[2], h=B[3];

double M1 = (a + d) * (e + h);
double M2 = (c + d) * e;
double M3 = a * (f - h);
// ... M4, M5, M6, M7 ...

C[0] = M1 + M4 - M5 + M7;   // C11
// ... C[1], C[2], C[3] ...`,
    whyItMatters: `Strassen was the first proof that the "obvious" n³ matrix multiply is
*not* optimal — it cracked open a whole field of fast-matmul research (Coppersmith–Winograd
and beyond). In practice libraries switch to Strassen only for large matrices, because the
extra additions and memory traffic cost more than they save when n is small. It's the
perfect closing lesson: correctness first (naive), then memory (transpose, tiling), and
finally the algorithmic frontier — fewer operations, not just better-ordered ones.`,
    commonMistakes: [
      'Reading the entries in the wrong order. Row-major 2×2 is `[a b; c d]` → `A[0..3]`, and `B` is `[e f; g h]`.',
      'A sign slip in a product or a recombination — `M6` uses `(c - a)`, `M7` uses `(b - d)`; `C11` is `M1 + M4 - M5 + M7`.',
      'Placing results wrong in the flat array: `C[0]=C11, C[1]=C12, C[2]=C21, C[3]=C22`.',
      'Expecting a speedup at 2×2 — here it is purely to learn the trick; the win only appears when the same idea recurses on large blocks.',
    ],
    hint: 'Pull the 8 entries into named locals a..h. Form M1..M7 exactly as listed. Then C[0]=M1+M4-M5+M7, C[1]=M3+M5, C[2]=M2+M4, C[3]=M1-M2+M3+M6.',
  },
  harness: `#include <stdio.h>
static void show2(const double* M) {
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 2; j++) printf("%g ", M[i * 2 + j]);
        printf("\\n");
    }
}
int main(void) {
    double A[4] = {1, 2, 3, 4};
    double B[4] = {5, 6, 7, 8};
    double C[4];
    strassen2x2(A, B, C);
    show2(C);
    double I[4] = {1, 0, 0, 1};
    double X[4] = {2, 3, 5, 7};
    double C2[4];
    strassen2x2(I, X, C2);
    show2(C2);
    return 0;
}`,
  expectedStdout: `19 22
43 50
2 3
5 7
`,
  reference: `void strassen2x2(const double* A, const double* B, double* C) {
    double a = A[0], b = A[1], c = A[2], d = A[3];
    double e = B[0], f = B[1], g = B[2], h = B[3];
    double M1 = (a + d) * (e + h);
    double M2 = (c + d) * e;
    double M3 = a * (f - h);
    double M4 = d * (g - e);
    double M5 = (a + b) * h;
    double M6 = (c - a) * (e + f);
    double M7 = (b - d) * (g + h);
    C[0] = M1 + M4 - M5 + M7;
    C[1] = M3 + M5;
    C[2] = M2 + M4;
    C[3] = M1 - M2 + M3 + M6;
}
`,
};

export default exercise;
