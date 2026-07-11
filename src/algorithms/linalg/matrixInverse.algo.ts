import type { AlgoDescriptor, AlgoInput, AlgoResult, DataTable } from '../types';
import { Tracer } from '../tracer';

// Inverting a transform is UNDOING it: if a matrix takes local space → world
// space, its inverse takes world → local (the heart of camera / view math).
// Gauss–Jordan elimination finds the inverse by writing [M | I] side by side and
// reducing the left block to I with row operations — whatever those same
// operations do to the right block turns I into M⁻¹.

const M: number[][] = [
  [4, 7],
  [2, 6],
];

const N = M.length; // 2

const round3 = (x: number): number => {
  const r = Math.round(x * 1000) / 1000;
  return Object.is(r, -0) ? 0 : r;
};

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // det tells us invertibility up front (0 ⇒ singular ⇒ no inverse).
  const det = M[0][0] * M[1][1] - M[0][1] * M[1][0]; // 4·6 − 7·2 = 10

  // Augmented matrix [M | I], N rows × 2N cols.
  const aug: number[][] = M.map((row, i) => [
    ...row,
    ...Array.from({ length: N }, (_v, j) => (i === j ? 1 : 0)),
  ]);

  const columns = ['·', '·', '| I·', 'I·'];

  const table = (
    pivot?: { row: number; col: number },
    caption?: string,
  ): DataTable => ({
    name: '[ M | I ]',
    columns,
    rows: aug.map((row) => row.map(round3)),
    highlightCell: pivot,
    caption,
  });

  t.step({
    view: { kind: 'table', tables: [table(undefined, 'start: left = M, right = I')] },
    state: [
      { label: 'det(M)', value: det, highlight: true },
      { label: 'invertible?', value: det !== 0 ? 'yes' : 'no' },
    ],
    note: `det(M) = 4·6 − 7·2 = ${det}. It is non-zero, so M is invertible. Goal: turn the left block into I; the right block becomes M⁻¹.`,
  });

  // Gauss–Jordan: for each pivot column, scale the pivot row to make the pivot 1,
  // then eliminate that column from every other row.
  for (let p = 0; p < N; p++) {
    const pivotVal = aug[p][p];

    // 1) Scale the pivot row so the pivot becomes 1.
    for (let c = 0; c < 2 * N; c++) aug[p][c] /= pivotVal;

    t.step({
      view: {
        kind: 'table',
        tables: [table({ row: p, col: p }, `scale row ${p} by 1/${round3(pivotVal)}`)],
      },
      state: [
        { label: 'pivot', value: `[${p}][${p}]`, highlight: true },
        { label: 'divide row by', value: round3(pivotVal) },
      ],
      note: `Pivot row ${p}: divide the whole row by ${round3(pivotVal)} so the pivot at [${p}][${p}] becomes 1.`,
    });

    // 2) Eliminate the pivot column from every other row.
    for (let r = 0; r < N; r++) {
      if (r === p) continue;
      const factor = aug[r][p];
      if (factor === 0) continue;
      for (let c = 0; c < 2 * N; c++) aug[r][c] -= factor * aug[p][c];

      t.step({
        view: {
          kind: 'table',
          tables: [
            table(
              { row: r, col: p },
              `row ${r} ← row ${r} − (${round3(factor)})·row ${p}`,
            ),
          ],
        },
        state: [
          { label: 'clearing', value: `[${r}][${p}]`, highlight: true },
          { label: 'factor', value: round3(factor) },
        ],
        note: `Eliminate column ${p} from row ${r}: subtract ${round3(factor)}× the pivot row so [${r}][${p}] becomes 0.`,
      });
    }
  }

  // The right N columns are now M⁻¹.
  const inv = aug.map((row) => row.slice(N).map(round3));

  // Verify M · M⁻¹ = I (using the rounded inverse for the displayed note).
  const check: number[][] = Array.from({ length: N }, (_v, i) =>
    Array.from({ length: N }, (_w, j) => {
      let s = 0;
      for (let k = 0; k < N; k++) s += M[i][k] * inv[k][j];
      return round3(s);
    }),
  );

  t.step({
    view: {
      kind: 'table',
      tables: [
        {
          name: 'M⁻¹',
          columns: ['·', '·'],
          rows: inv,
          caption: 'left block is now I → right block is the inverse',
        },
        {
          name: 'M · M⁻¹',
          columns: ['·', '·'],
          rows: check,
          caption: 'sanity check — should be the identity',
        },
      ],
    },
    state: [
      { label: 'det(M)', value: det, highlight: true },
      { label: 'M⁻¹[0]', value: `[${inv[0][0]}, ${inv[0][1]}]` },
      { label: 'M⁻¹[1]', value: `[${inv[1][0]}, ${inv[1][1]}]` },
    ],
    note: `Left block reached I, so the right block is M⁻¹ = [[${inv[0][0]}, ${inv[0][1]}], [${inv[1][0]}, ${inv[1][1]}]]. Verify: M · M⁻¹ = [[${check[0][0]}, ${check[0][1]}], [${check[1][0]}, ${check[1][1]}]] = I. Undo confirmed.`,
  });

  return { steps: t.steps, answer: det };
}

const descriptor: AlgoDescriptor = {
  id: 'matrix-inverse',
  title: 'Matrix inverse (Gauss–Jordan)',
  category: 'Linear Algebra',
  difficulty: 'Hard',
  scenario:
    "A camera's view matrix is literally the inverse of the camera's world transform: to render the scene from the camera's eye, you undo the camera's own position and rotation on everything else. Inverting a matrix is how you flip a transform from world→local, or rewind any transform you applied.",
  pattern:
    'Gauss–Jordan elimination: write the augmented matrix [M | I], then use row-scales and row-eliminations to reduce the left block to I. The same operations turn the right block into M⁻¹. It only works if det(M) ≠ 0 — a zero pivot you cannot fix by swapping means the matrix is singular.',
  complexity: 'O(n³) time — n pivots, each touching an n×2n row block',
  defaultInput: {},
  expected: 10,
  run,
  code: `function inverse(M) {
  const n = M.length;
  // augment with the identity: [M | I]
  const A = M.map((row, i) =>
    [...row, ...row.map((_, j) => (i === j ? 1 : 0))]);
  for (let p = 0; p < n; p++) {
    const pivot = A[p][p];               // assume non-zero (det ≠ 0)
    for (let c = 0; c < 2 * n; c++) A[p][c] /= pivot;   // scale pivot row → 1
    for (let r = 0; r < n; r++) {        // clear column p elsewhere
      if (r === p) continue;
      const f = A[r][p];
      for (let c = 0; c < 2 * n; c++) A[r][c] -= f * A[p][c];
    }
  }
  return A.map(row => row.slice(n));      // right block is M⁻¹
}`,
  eli5: `## The everyday picture

Suppose a machine takes a plain sheet of paper and folds, rotates, and stretches it into a shape. The inverse is the second machine that takes that shape and returns the original flat sheet — it undoes every step in reverse. A matrix inverse is that "undo" machine written as numbers.

## What problem it solves

Games constantly need to run a transform backwards. A camera moves and turns; to draw the world from the camera's point of view you apply the OPPOSITE motion to everything else. Picking a world point and asking "where is that in an object's local space?" is the same reverse question. The inverse matrix answers both.

## How it works step by step

- Write your matrix next to the identity matrix: [ M | I ].
- Pick a pivot on the diagonal and divide its row so the pivot becomes 1.
- Subtract multiples of that row from the others so the rest of the pivot's column becomes 0.
- Repeat for each pivot. When the left side has turned into I, the right side has turned into M⁻¹.

## Why the determinant gate matters

If det(M) = 0 the transform squashed space flat — two different inputs landed on the same output — so there is no way to tell them apart when undoing. A zero pivot you cannot rescue by swapping rows signals exactly this: no inverse exists.

## Complexity in plain terms

There are n pivots, and clearing each one sweeps across all n rows of a 2n-wide block, giving about n³ work. For the small 3×3 and 4×4 matrices in graphics this is trivially fast.

## Common pitfalls

- Forgetting to apply every row operation to the identity side too — that half becomes the answer.
- Dividing by a zero pivot without trying a row swap first.
- Trusting an inverse of a near-singular matrix; tiny determinants make the result numerically unstable.`,
};

export default descriptor;
