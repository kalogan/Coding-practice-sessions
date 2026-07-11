import type { AlgoDescriptor, AlgoInput, AlgoResult, DataTable } from '../types';
import { Tracer } from '../tracer';

// Matrix multiply is the beating heart of a game engine's transform pipeline.
// A model vertex gets multiplied by a model matrix, then a view matrix, then a
// projection matrix — and chaining two transforms into one is exactly A × B.
// Here we multiply a 2×3 by a 3×2 to get a 2×2, filling the result cell by cell.

const A: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
];
const B: number[][] = [
  [7, 8],
  [9, 10],
  [11, 12],
];

function run(_input: AlgoInput): AlgoResult {
  const t = new Tracer();

  const rowsA = A.length; // 2
  const colsA = A[0].length; // 3 (== rowsB, the shared inner dimension)
  const colsB = B[0].length; // 2

  // C starts empty; we render unfilled cells as "·" until they are computed.
  const C: Array<Array<number | null>> = Array.from({ length: rowsA }, () =>
    Array.from({ length: colsB }, () => null),
  );

  const cShow = (): Array<Array<string | number>> =>
    C.map((row) => row.map((v) => (v === null ? '·' : v)));

  const tables = (
    hlRowA?: number,
    hlColB?: number,
    hlCellC?: { row: number; col: number },
  ): DataTable[] => [
    {
      name: 'A (2×3)',
      columns: ['·', '·', '·'],
      rows: A.map((r) => [...r]),
      highlightRow: hlRowA,
      caption: 'left matrix — its rows feed each dot product',
    },
    {
      name: 'B (3×2)',
      columns: ['·', '·'],
      rows: B.map((r) => [...r]),
      highlightCol: hlColB,
      caption: 'right matrix — its columns feed each dot product',
    },
    {
      name: 'C = A × B (2×2)',
      columns: ['·', '·'],
      rows: cShow(),
      highlightCell: hlCellC,
      caption: 'result — one cell is one row·column dot product',
    },
  ];

  t.step({
    view: { kind: 'table', tables: tables() },
    state: [
      { label: 'inner dim', value: colsA },
      { label: 'filled', value: 0 },
    ],
    note: 'To multiply A (2×3) by B (3×2), the inner dimensions must match (3 = 3). The result C is 2×2: rows of A by columns of B.',
  });

  let total = 0;
  let filled = 0;

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      // Dot product of A's row i with B's column j.
      let sum = 0;
      const terms: string[] = [];
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
        terms.push(`${A[i][k]}·${B[k][j]}`);
      }
      C[i][j] = sum;
      total += sum;
      filled++;

      t.step({
        view: { kind: 'table', tables: tables(i, j, { row: i, col: j }) },
        state: [
          { label: 'cell', value: `C[${i}][${j}]`, highlight: true },
          { label: 'value', value: sum },
          { label: 'filled', value: filled },
        ],
        note: `C[${i}][${j}] = ${terms.join(' + ')} = ${sum}. Slide across A's row ${i} and down B's column ${j}, multiply pairwise, add.`,
      });
    }
  }

  t.step({
    view: { kind: 'table', tables: tables() },
    state: [
      { label: 'filled', value: filled },
      { label: 'sum of C', value: total, highlight: true },
    ],
    note: `All four cells filled. The chained transform C is complete. Sum of every entry = ${total}.`,
  });

  return { steps: t.steps, answer: total };
}

const descriptor: AlgoDescriptor = {
  id: 'matrix-multiply',
  title: 'Matrix multiply (A × B)',
  category: 'Linear Algebra',
  difficulty: 'Medium',
  scenario:
    "Every vertex a game draws is pushed through a stack of transforms: model → world → view → projection. Multiplying two of those matrices bakes them into one, so the GPU does a single multiply per vertex instead of several. That baking is A × B.",
  pattern:
    "Row·column dot products: C[i][j] is the dot product of A's row i with B's column j. The inner dimensions must match; the result takes A's row count and B's column count. It is not commutative — A×B ≠ B×A — because it means 'apply B, then A'.",
  complexity: 'O(n·m·p) time — one dot product per output cell, p multiplies each',
  defaultInput: {},
  expected: 415,
  run,
  code: `function matmul(A, B) {
  const n = A.length, inner = B.length, p = B[0].length;
  const C = Array.from({ length: n }, () => Array(p).fill(0));
  for (let i = 0; i < n; i++)          // each row of A
    for (let j = 0; j < p; j++)        // each column of B
      for (let k = 0; k < inner; k++)  // dot product
        C[i][j] += A[i][k] * B[k][j];
  return C;
}`,
  eli5: `## The everyday picture

Imagine a recipe grid. Each row of A is a recipe (how much of each ingredient), and each column of B is a price list (cost per ingredient in a different shop). To get the cost of one recipe at one shop, you march across the recipe and down the price list, multiplying matching pairs and adding them up. Do that for every recipe-and-shop combination and you have filled the whole result table.

## What problem it solves

Games apply many transforms in a row — spin the model, place it in the world, look at it through a camera, squash it onto the screen. Instead of transforming every vertex four times, you multiply the four matrices together ONCE, then push each vertex through the single combined matrix. Matrix multiply is how those transforms get chained.

## How it works step by step

- Line up A's rows against B's columns — they must be the same length (the "inner dimension").
- For each output cell C[i][j], take A's row i and B's column j.
- Multiply them element by element and add up the products — that one number is the cell.
- Repeat until every cell of C is filled.

## Why order matters

A×B means "do B first, then A." Swapping them usually gives a different answer, just like "put on socks then shoes" is not the same as "shoes then socks." That is why transform order in an engine is so fussy.

## Complexity in plain terms

Each of the output cells costs one dot product, and each dot product is a handful of multiply-adds. For n×m by m×p that is n·m·p multiplications — cheap for small matrices, which is why GPUs do millions per frame.

## Common pitfalls

- Mismatched inner dimensions — you simply cannot multiply a 2×3 by a 2×2.
- Assuming it is commutative; A×B and B×A are different transforms.
- Reading B down columns, not across rows — a classic off-by-axis bug.`,
};

export default descriptor;
