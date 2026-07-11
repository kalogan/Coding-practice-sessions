import type { AlgoDescriptor, AlgoInput, AlgoResult, DataTable } from '../types';
import { Tracer } from '../tracer';

// The determinant of a transform tells you what it does to space: the magnitude
// is how much it scales area (2×2) or volume (3×3), and the SIGN tells you
// whether it flips handedness (a mirror). A determinant of 0 means the transform
// collapses space onto a line/plane — it is non-invertible (you can't undo it).
// We compute a 3×3 determinant by cofactor expansion along the top row.

const M: number[][] = [
  [2, 0, 1],
  [3, 1, 2],
  [1, 0, 3],
];

// The 2×2 minor left after deleting row 0 and column `col`.
function minor(col: number): number[][] {
  const rows = [1, 2]; // rows other than row 0
  const cols = [0, 1, 2].filter((c) => c !== col);
  return rows.map((r) => cols.map((c) => M[r][c]));
}

function det2(m: number[][]): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  // Which cells belong to the minor (all cells not in row 0 and not in the
  // pivot's column) — used to caption what stays after striking a row + column.
  const table = (
    pivot?: { row: number; col: number },
    caption?: string,
  ): DataTable => ({
    name: 'M (3×3)',
    columns: ['·', '·', '·'],
    rows: M.map((r) => [...r]),
    highlightCell: pivot,
    caption,
  });

  t.step({
    view: { kind: 'table', tables: [table(undefined, 'expand along row 0')] },
    state: [{ label: 'running det', value: 0 }],
    note: "Cofactor expansion: for each entry in the top row, multiply it by the determinant of the 2×2 left after deleting that entry's row and column, with alternating +/− signs.",
  });

  let determinant = 0;
  const terms: string[] = [];

  for (let col = 0; col < 3; col++) {
    const sign = col % 2 === 0 ? 1 : -1; // +, −, + along the row
    const pivot = M[0][col];
    const sub = minor(col);
    const subDet = det2(sub);
    const contribution = sign * pivot * subDet;
    determinant += contribution;
    terms.push(`${sign < 0 ? '−' : '+'} ${pivot}·det${JSON.stringify(sub)}=${contribution}`);

    const signStr = sign < 0 ? '−' : '+';
    t.step({
      view: {
        kind: 'table',
        tables: [
          table(
            { row: 0, col },
            `strike row 0 & col ${col} → minor = [[${sub[0][0]}, ${sub[0][1]}], [${sub[1][0]}, ${sub[1][1]}]]`,
          ),
        ],
      },
      state: [
        { label: 'pivot', value: `M[0][${col}] = ${pivot}`, highlight: true },
        { label: 'sign', value: signStr },
        { label: 'minor det', value: subDet },
        { label: 'term', value: contribution },
        { label: 'running det', value: determinant },
      ],
      note:
        pivot === 0
          ? `Term ${col}: pivot is 0, so this whole term is 0 — a zero in the expansion row lets you skip a 2×2 for free. Running total stays ${determinant}.`
          : `Term ${col}: ${signStr} ${pivot} · det([[${sub[0][0]},${sub[0][1]}],[${sub[1][0]},${sub[1][1]}]]) = ${signStr} ${pivot} · ${subDet} = ${contribution}. Running total ${determinant}.`,
    });
  }

  t.step({
    view: { kind: 'table', tables: [table(undefined, `det(M) = ${determinant}`)] },
    state: [{ label: 'det(M)', value: determinant, highlight: true }],
    note: `Sum of the terms: det(M) = ${terms.join(' ')} = ${determinant}. It is non-zero and positive, so this transform is invertible and preserves handedness (no mirror flip).`,
  });

  return { steps: t.steps, answer: determinant };
}

const descriptor: AlgoDescriptor = {
  id: 'determinant',
  title: 'Determinant (3×3)',
  category: 'Linear Algebra',
  difficulty: 'Medium',
  scenario:
    "A transform's determinant is its 'space report card' in one number. Its magnitude is the volume-scaling factor, its sign says whether the transform mirrors the world (flips handedness), and a determinant of 0 warns you the transform squashes 3D space flat — you can never invert it.",
  pattern:
    'Cofactor (Laplace) expansion: pick a row, and for each entry multiply it by the determinant of the 2×2 minor left after deleting its row and column, alternating +/− signs. Expanding along a row full of zeros is cheapest — each zero kills a whole term.',
  complexity: 'O(n!) naive by cofactor expansion; O(n³) via LU decomposition',
  defaultInput: {},
  expected: 5,
  run,
  code: `function det3(M) {
  let det = 0;
  for (let col = 0; col < 3; col++) {
    const sign = col % 2 === 0 ? 1 : -1;        // +, −, +
    const [r1, r2] = [1, 2];                     // rows below row 0
    const [c1, c2] = [0, 1, 2].filter(c => c !== col);
    const minor = M[r1][c1] * M[r2][c2] - M[r1][c2] * M[r2][c1];
    det += sign * M[0][col] * minor;             // cofactor term
  }
  return det;
}`,
  eli5: `## The everyday picture

Picture a unit square drawn on a sheet of rubber. A transform stretches, shears, or flips that rubber. The determinant is the single number that answers: "How many times bigger did the square get, and did the sheet get turned over?" A determinant of 2 means double the area; −2 means double the area AND flipped like a mirror; 0 means the square got crushed into a line.

## What problem it solves

Before you trust a transform, you want to know three things: does it grow or shrink space, does it mirror it, and can it be undone? All three live in the determinant — magnitude for scaling, sign for mirroring, and "is it zero?" for invertibility.

## How it works step by step

- Walk across the top row of the matrix, one entry at a time.
- For each entry, cross out its row and its column; a smaller 2×2 grid is left — its "minor."
- Take that entry times the determinant of the little grid, with a +, −, + sign pattern.
- Add the three signed terms together — that sum is the determinant.

## Why zeros are your friend

If an entry in the expansion row is 0, its whole term is 0 and you can skip computing that minor entirely. Choosing the row (or column) with the most zeros is the standard shortcut.

## Complexity in plain terms

Done naively by expansion, an n×n determinant costs about n! multiply-adds — fine for 3×3, ruinous for large matrices. Real engines use LU decomposition, which brings it down to roughly n³.

## Common pitfalls

- Forgetting the alternating sign pattern (+, −, +) across the row.
- Building the wrong minor — you must delete BOTH the entry's row and its column.
- Reading a determinant of 0 as "small" instead of "singular": the transform is not invertible.`,
};

export default descriptor;
